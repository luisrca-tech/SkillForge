# Plan: Zoom + Depth-of-Field Section Transitions

> Source: Grill-me session — cinematic transitions between workflow cutscenes and skill sections

## Architectural decisions

- **Animation library**: Framer Motion (`motion/react`) — already in use across the project
- **Zoom origin**: Real node screen coordinates via ReactFlow `flowToScreenPosition()`, passed up via callback prop from `WorkflowDiagram`
- **Blur strategy**: CSS `filter: blur()` only on HTML layers (diagram/content). Three.js canvas is never CSS-blurred — particles respond independently via speed + size
- **Timing**: 0.5s zoom-in + 0.5s zoom-out, curve `cubicBezier(0.16, 1, 0.3, 1)` (matches existing beam curve)
- **Particle warp**: Speed multiplier jumps to 2.0x+ and particle size grows during zoom-in, reverts on zoom-out
- **Reduced motion**: `prefers-reduced-motion` → simple crossfade (~0.3s), no zoom/blur/stagger
- **Transition ownership**: Zoom-in starts at the end of the `workflow-N` cutscene (after beam completes). Zoom-out happens when exiting a `skill-*` section back to `workflow-N+1`

### Out of scope (fallback alternatives)

- **Iris/Portal**: `clip-path: circle()` expanding from node point to fill screen. Portal feel.
- **Fold/Page Turn**: Panels with `perspective` + `rotateX` unfolding sequentially from the node. Book-opening feel.

---

## Phase 1: Node Position Callback + Zoom-In

**User stories**: As a user navigating the workflow, when a beam finishes revealing a node, I see the camera "dive into" that node before the skill content appears — creating a cinematic bridge between the diagram and the detail view.

### What to build

Wire a callback from `WorkflowDiagram` that reports the screen-space coordinates of the most recently revealed node using ReactFlow's `flowToScreenPosition()`. In `WorkflowLayer`, when the section is about to transition out (advance from `workflow-N` to `skill-*`), apply a scale + blur animation on the HTML container using the node coordinates as `transformOrigin`. Simultaneously, the `WorkflowParticlesCanvas` receives a "warp" signal that increases the speed multiplier to 2.0x+ and scales particle `size` from 4 to ~10 during the zoom-in.

### Acceptance criteria

- [x] `WorkflowDiagram` exposes an `onNodeReveal(nodeId, screenPosition)` callback
- [x] `transformOrigin` is set to the node's screen coordinates (responsive — works at any viewport size)
- [x] Zoom-in animates scale 1→3 + blur 0→12px over 0.5s with `cubicBezier(0.16, 1, 0.3, 1)`
- [x] Particles accelerate to 2.0x+ speed and grow in size during the zoom-in
- [x] Animation triggers only after the beam for that node completes its draw
- [x] No visual glitch at the transition boundary (no flash of unstyled content)

---

## Phase 2: Staggered Reveal on Skill Section Entry

**User stories**: As a user arriving at a skill section, I see the content blocks (title, problem, skill, steps, terminal) materialize one by one with a depth-of-field "rack focus" effect, reinforcing the feeling of emerging from the zoom.

### What to build

Replace the current `whileInView` fade-up animations in `StickySkillSection` with a staggered rack-focus entry. Each content block starts at `scale(1.1)` + `blur(4px)` + `opacity(0)` and resolves to `scale(1)` + `blur(0)` + `opacity(1)` with ~80ms stagger between blocks. The animation uses the same `cubicBezier(0.16, 1, 0.3, 1)` curve. The stagger fits within the 0.5s zoom-out window so total entry feels cohesive.

### Acceptance criteria

- [x] Each content block (title, problem card, skill card, how-it-works, terminal) enters independently with stagger
- [x] Entry animation: scale 1.1→1, blur 4px→0, opacity 0→1, ~80ms stagger
- [x] Total stagger sequence completes within ~0.5s
- [x] Curve matches the zoom curve: `cubicBezier(0.16, 1, 0.3, 1)`
- [x] Animation plays once per section visit (respects existing `hasPlayed` / `markPlayed` pattern)
- [x] Content is fully interactive after animation completes

---

## Phase 3: Fast Exit + Zoom-Out

**User stories**: As a user advancing from a skill section back to the workflow diagram, I see the content quickly fade away and the view zooms back out to reveal the diagram — a fast, clean exit that doesn't slow navigation.

### What to build

When navigating from `skill-*` to the next `workflow-N+1`, the skill content fades out in ~0.2s (no stagger — all blocks together). Then the incoming workflow section starts in a "zoomed" state (scale 3 + blur 12px) centered on the previously used node coordinates and zooms out to scale 1 + blur 0 over 0.5s. Particles decelerate from warp speed back to normal and shrink to default size during the zoom-out.

### Acceptance criteria

- [x] Skill section exit is a single uniform fade (~0.2s), no reverse stagger
- [x] Workflow section enters from zoomed state and animates out to normal over 0.5s
- [x] Zoom-out `transformOrigin` matches the last zoom-in origin (same node coordinates)
- [x] Particles decelerate and shrink back to default during zoom-out
- [x] Rapid navigation (user scrolls quickly through multiple sections) cancels in-progress animations gracefully
- [x] No layout shift or flicker between exit and entry

---

## Phase 4: Reduced Motion Fallback

**User stories**: As a user with `prefers-reduced-motion` enabled, I can navigate between all sections with simple crossfades, experiencing zero zoom, blur, scale, or stagger animations.

### What to build

Detect `prefers-reduced-motion: reduce` via a media query hook. When active, replace all Phase 1–3 animations with a simple crossfade (~0.3s). No scale transforms, no blur filters, no stagger delays, no particle warp. The existing `AnimatePresence` transition in `SectionNavigator` handles the crossfade — the zoom/blur/stagger layers simply don't activate.

### Acceptance criteria

- [ ] A shared `useReducedMotion()` hook (or Framer Motion's built-in) gates all zoom/blur/stagger behavior
- [ ] With reduced motion: transitions are simple opacity crossfades (~0.3s)
- [ ] With reduced motion: particles maintain default speed and size at all times
- [ ] With reduced motion: `StickySkillSection` content appears instantly (no stagger)
- [ ] Toggling the OS preference mid-session applies immediately (no page reload required)
- [ ] No CSS `filter: blur()` or `scale()` is applied when reduced motion is active

---

## Risks and assumptions

- **Performance**: `filter: blur()` on large viewports (4K) may cause jank. Mitigation: use `will-change: filter` to force GPU compositing, and cap blur at 12px.
- **Callback timing**: `flowToScreenPosition()` must be called while the ReactFlow instance is still mounted. If there's a race condition during unmount, fallback to viewport center.
- **Animation interruption**: Rapid scroll/keyboard navigation during zoom must cancel gracefully. Framer Motion's `animate` controls handle this, but needs testing.
- **Particle size transition**: `pointsMaterial.size` updates per-frame — verify no visual pop when transitioning between normal and warp states.
