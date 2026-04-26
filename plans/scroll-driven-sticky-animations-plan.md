# Plan: Scroll-Driven Sticky Animations

> Source PRD: plans/scroll-driven-sticky-animations.md

## Architectural decisions

Durable decisions that apply across all phases:

- **Animation engine**: Motion v12 (`useScroll`, `useTransform`) drives all scroll-based animations. No GSAP or additional animation libraries.
- **Viewport constraint**: Every section must fit within 100vh. No section ever exceeds viewport height. Content adapts (responsive stacking, smaller gaps) but never overflows.
- **Beat model**: Substitutive, not additive. Only the active beat is visible within a section — previous beats fade out as the next fades in. The section title stays fixed; the content area below it transitions between beats.
- **Skill section beats (2 beats after Phase 7)**: Beat 0 = Problem + Skill cards + How it Works (steps) in one combined viewport. Beat 1 = Terminal / exemplo prático (interactive) alone. *(Before Phase 7: 3 substitutive beats — Problem+Skill → How it Works → Terminal.)*
- **Section order (after Phase 7)**: Skills blocks come immediately after the Workflow (diagram) section. Context Rot is moved to **after** all seven skill sections (narrative: hero → workflow → skills → context rot → footer), reducing cognitive breaks between the diagram and the skills it introduces.
- **Context Rot beats (5 beats)**: Beat 0 = "What is Context Rot?" card. Beat 1 = Side-by-side comparison. Beat 2 = "Why it matters". Beat 3 = Analogy. Beat 4 = References grid.
- **Carousel architecture (shader.se pattern)**: `body` has `overflow: hidden; overscroll-behavior: none`. A single scroll container (`position: fixed; inset: 0; overflow-y: auto`) holds scroll content. A viewport layer (`position: fixed; inset: 0`) holds all sections layered via `position: absolute; inset: 0`. Scroll progress drives which section is visible and its internal animations. Transitions happen in-place (crossfade/scale), not via push-up. *(Phases 1–2 used Pattern A with per-section sticky containers; Phase 3 refactors to Pattern B.)*
- **Scroll progress model**: A single master `useScroll({ container: scrollContainerRef })` produces a 0→1 progress for the entire page. Each section is allocated a sub-range derived from its scroll budget. Within each sub-range, `useTransform` maps to enter transition → internal beats → exit transition. *(Phases 1–2 used per-section `useScroll`; Phase 3 refactors to a single master scroll.)*
- **Scroll budgets**: Tuned per phase; after Phase 7 skill sections use **2 beats** each (e.g. ~200vh per skill if ~100vh per beat) and Context Rot follows the skill block (reallocate ranges in `sections` / scroll allocator accordingly).
- **GPU-only properties**: All animations use `transform` and `opacity` exclusively for 60fps compositing.
- **New dependency**: shadcn/ui (Card component) installed with required peers (`tailwind-merge`, `clsx`, `class-variance-authority`, `@radix-ui/react-slot`).

---

## Phase 1: Sticky scaffold + Hero + single Skill Section ✅

**User stories**: 1, 2, 3, 9, 10, 14

### What was built

Core sticky/pin infrastructure proven end-to-end with two sections: Hero and the first Skill Section (grill-me).

- **`StickyHero.tsx`** — 200vh outer container with CSS `position: sticky` inner. Content fades out (opacity 1→0) and scales down (1→0.92) between 30–80% scroll progress. Entry animations (stagger fadeUp) preserved from original component. Uses `useScroll` with `offset: ["start start", "end start"]` so progress maps cleanly from container top to bottom.
- **`StickySkillSection.tsx`** — 400vh outer container with 4 scroll beats. Each beat occupies 25% of the scroll range. Helper hooks (`useBeatOpacity`, `useBeatY`) compute per-beat fade-in (opacity 0→1) and slide-up (translateY 32→0) transforms. Section title is always visible; Problem, Skill, How it Works, and Terminal reveal sequentially. Inner content area is scrollable (`overflow-y-auto max-h-[90vh]`) to handle tall content on smaller viewports.
- **`index.astro`** — Hero uses `StickyHero` with `client:load`. Grill-me uses `StickySkillSection` with `client:visible`. All other sections unchanged (Workflow, Context Rot, remaining skills keep their `whileInView` behavior). Footer scrolls normally.
- **Performance**: All animated properties are `transform` and `opacity` only. `will-change-transform` applied to animated containers. Uses `h-dvh` for mobile dynamic viewport height.

### Acceptance criteria

- [x] Hero section pins to viewport and animates out (fade + scale) based on scroll progress
- [x] grill-me Skill Section pins and reveals its 4 blocks sequentially via scroll
- [x] Terminal Simulator is interactive while the section is pinned
- [x] Push-up transition between Hero → next section is smooth
- [x] Footer scrolls normally without pinning
- [x] Works on mobile viewports (sticky behavior preserved, content responsive)
- [x] Animations run at 60fps (transform + opacity only)

### Files changed

- `src/components/StickyHero.tsx` — new
- `src/components/StickySkillSection.tsx` — new
- `src/pages/index.astro` — modified (Hero + grill-me wiring)

---

## Phase 2: All remaining Skill Sections + Context Rot ✅

**User stories**: 8, 9, 10, 11

### What was built

Applied the proven sticky + internal beats pattern from Phase 1 to all remaining Skill Sections and Context Rot.

- **`index.astro`** — All 6 remaining `SkillSection` usages replaced with `StickySkillSection`. `ContextRot` replaced with `StickyContextRot`. Old `SkillSection` and `ContextRot` imports removed. Section wrapper `<section>` tags no longer carry padding/max-width classes (the sticky components handle their own layout).
- **`StickyContextRot.tsx`** — New component with 500vh outer container and 5 scroll beats: title/intro (always visible) → "What is Context Rot?" card → side-by-side comparison (Global Rules vs On-Demand Skills) → "Why it matters" + analogy section → references grid. Uses the same `useBeatOpacity`/`useBeatY` helpers as `StickySkillSection`. All animated properties are `transform` and `opacity` only with `will-change-transform`.
- All Terminal Simulators remain interactive (unchanged from Phase 1 pattern).
- Old `whileInView` fade-up animations fully replaced across all sections.

### Acceptance criteria

- [x] All 7 Skill Sections pin and reveal 4 internal blocks via scroll
- [x] Context Rot section pins and reveals ~5 internal blocks via scroll
- [x] All Terminal Simulators remain interactive while pinned
- [x] Push-up transitions between all consecutive sections are smooth
- [x] Mobile viewports work correctly (sticky + responsive layout)
- [x] Old `whileInView` fade-up animations are fully replaced

### Files changed

- `src/components/StickyContextRot.tsx` — new
- `src/pages/index.astro` — modified (all sections now use sticky variants)

---

## Phase 3: Vertical Carousel Architecture ✅

**User stories**: 1, 2, 9, 10, 11, 12

### What to build

Refactor from per-section sticky containers (Pattern A) to a fixed-viewport vertical carousel (Pattern B), inspired by the shader.se pattern.

**Architecture** (shader.se pattern):
- `body` gets `overflow: hidden; overscroll-behavior: none` — native scroll is disabled on the body.
- A single **scroll container** (`position: fixed; inset: 0; overflow-y: auto; overflow-x: hidden`) wraps the entire page. This is where the user actually scrolls.
- Inside the scroll container, a tall spacer element provides the total scroll height (~2800vh). After the spacer, the footer sits normally so it scrolls into view at the end.
- A **viewport layer** (`position: fixed; inset: 0; pointer-events: none`) sits on top and holds all sections layered via `position: absolute; inset: 0`. This layer never scrolls — it's the "stage" where sections perform.
- A single `useScroll({ container: scrollContainerRef })` produces a 0→1 progress for the entire scroll range. A scroll-range allocator divides this 0→1 into per-section sub-ranges proportional to each section's scroll budget.

**Scroll budget allocation**:

| Section | Budget | Beats | Range (approx) |
|---|---|---|---|
| Hero | 200vh | 1 (fade-out) | 0.000 → 0.071 |
| Workflow | 100vh | 1 (fade in/out) | 0.071 → 0.107 |
| Context Rot | 240vh (typ.) | 3 substitutive | (recompute with allocator) |
| grill-me | 300vh | 3 substitutive | 0.250 → 0.357 |
| write-a-prd | 300vh | 3 substitutive | 0.357 → 0.464 |
| prd-to-plan | 300vh | 3 substitutive | 0.464 → 0.571 |
| plan-to-tracker | 300vh | 3 substitutive | 0.571 → 0.679 |
| do-work | 300vh | 3 substitutive | 0.679 → 0.786 |
| improve-arch | 300vh | 3 substitutive | 0.786 → 0.893 |
| handle-coderabbit | 300vh | 3 substitutive | 0.893 → 1.000 |

*(After Phase 7, section order and per-section budgets change — recompute the allocator; see Phase 7.)*

**Section behavior**:
- Only the active section is visible (opacity 1, `pointer-events: auto`); all others have opacity 0 and `pointer-events: none`.
- Each section reads the master progress and derives its own local 0→1 progress within its allocated range.
- **Beats are substitutive**: within a section, only the active beat is visible. Previous beats fade out (opacity 1→0) as the next beat fades in (opacity 0→1). The section title remains fixed at the top; the content area below transitions between beats.
- **Skill section layout**: Beat 0 shows Problem + Skill cards together (side-by-side on desktop, stacked on mobile). Beat 1 shows How it Works. Beat 2 shows Terminal Simulator. Each beat fits comfortably in 100vh.
- The existing `StickyHero`, `StickySkillSection`, and `StickyContextRot` components are refactored to accept a local progress MotionValue instead of managing their own `useScroll`. Beat logic changes from additive (useBeatOpacity fades in and stays) to substitutive (useBeatOpacity fades in then fades out when the next beat starts).
- The Workflow section is wrapped into the carousel with a simple fade-in/fade-out and no internal beats for now.
- The footer is positioned after the spacer inside the scroll container, so it scrolls naturally into view after all sections have played.

### Acceptance criteria

- [x] `body` has `overflow: hidden; overscroll-behavior: none`
- [x] Scroll container (`fixed inset-0, overflow-y: auto`) holds spacer + footer
- [x] Viewport layer (`fixed inset-0`) holds all sections layered via `absolute inset-0`
- [x] Single master `useMotionValue` + scroll sync on the scroll container drives 0→1 **story** progress (normalized to the 2800vh spacer so the footer does not compress section ranges; `useScroll` on the same element would include the footer in 0–1)
- [x] Each section has an allocated scroll sub-range proportional to its budget (~2800vh total)
- [x] Only the active section is visible; others are hidden (opacity 0, pointer-events none)
- [x] Every section fits within 100vh — no overflow, no scroll within sections
- [x] Beats are substitutive: only the active beat is visible, previous beats fade out
- [x] Skill sections show 3 beats: Problem+Skill together → How it Works → Terminal
- [x] Context Rot shows 3 substitutive beats (intro + comparison | prática + analogia | referências)
- [x] Hero, Workflow, Context Rot, and all 7 Skill Sections are part of the carousel
- [x] Footer scrolls normally after the spacer ends
- [x] Terminal Simulators remain interactive while their section/beat is active
- [x] Anchor links (#workflow, #skill-grill-me, etc.) programmatically scroll the container to the correct position

---

## Phase 4: Section Transition Choreography

**User stories**: 1, 2, 3, 8, 11, 12

### What to build

Design and implement the enter/exit transition choreography for each section within the vertical carousel.

Each section's allocated scroll range is divided into three zones: **enter** (first ~10%), **content** (middle ~80% — where internal beats play), and **exit** (last ~10%). During the enter zone, the section fades in (opacity 0→1) with a subtle scale-up (0.96→1). During the exit zone, it fades out (opacity 1→0) with a subtle scale-down (1→0.96). The enter of section N overlaps with the exit of section N-1, creating a smooth crossfade.

The Hero section is special: it has no enter transition (it starts visible), only an exit. The last section before the footer has no exit transition — it simply ends, and the sticky viewport unsticks to reveal the footer.

Transition timing values (scale amounts, fade curves, overlap percentages) are tuned through testing to feel cinematic but not slow. The goal is that scrolling feels like flipping through slides in a vertical carousel — each section arrives, tells its story through beats, then gracefully hands off to the next.

### Acceptance criteria

- [x] Each section has enter (fade+scale in) and exit (fade+scale out) transitions
- [x] Transitions crossfade smoothly — no flash of empty viewport between sections
- [x] Hero has exit-only transition; last section has enter-only
- [x] Internal beats play only during the content zone (not during enter/exit)
- [x] Transitions feel cinematic at 60fps on desktop and mid-range mobile
- [x] Scroll distance per section feels proportional to its content density
- [x] No jarring jumps when scrolling quickly through multiple sections

---

## Phase 5: Scroll-driven Workflow Diagram reveal ✅

**User stories**: 4, 5, 6, 7

### What was built

The Workflow section was expanded from 1 static beat to 7 scroll-driven beats, progressively revealing skill nodes and edges as the user scrolls.

#### 5A — Multi-beat workflow section

- Changed workflow beats from 1 to 7 in `sections.ts`.
- `contentLocal` (MotionValue) is now piped from `VerticalScrollPage` → `WorkflowLayer` → `WorkflowDiagram` as a prop.

#### 5B — Progressive node/edge reveal

- `WorkflowDiagram` uses `useMotionValueEvent` to subscribe to `contentLocal` changes and derives visible node count via `computeVisibleCount()` (maps 0→1 progress to 1→7 nodes).
- Nodes reveal in logical order: grill-me → write-a-prd → prd-to-plan → plan-to-tracker → do-work → improve-codebase-architecture → handle-coderabbit.
- Edges appear only when both source and target nodes are visible, using `style.opacity` on edges.
- A `prevCountRef` skips redundant re-renders when the visible count hasn't changed.
- Initial visibility is computed from `contentLocal.get()` at mount, avoiding a flash of incorrect state.

#### 5C — Staggered entry animations with direction-aware choreography

- **Forward (scroll down):** edges fade in first (0.45s), then nodes follow after a 0.3s CSS `transition-delay` (0.5s fade). Total reveal ~0.8s per step for a deliberate, slow-montage feel.
- **Backward (scroll up):** nodes fade out first (no delay), then edges follow after 0.3s delay — reversing the choreography naturally.
- Direction is detected via a `growing` flag comparing new vs. previous visible count. Pure CSS `transition-delay` handles the stagger — no `setTimeout` needed, handles rapid scrolling gracefully.
- Hidden nodes get `pointerEvents: none` to prevent accidental clicks.

### Acceptance criteria

- [x] Workflow section has 7 beats (one per skill in the reveal sequence)
- [x] `contentLocal` MotionValue is passed to `WorkflowDiagram`
- [x] Scrolling down reveals skill nodes one by one in logical order
- [x] Scrolling up hides skill nodes in reverse order
- [x] Edges appear only when both connected nodes are visible
- [x] Edges animate in before nodes (staggered with 0.3s delay)
- [x] Direction-aware choreography: forward = edge→node, backward = node→edge
- [x] Nodes fade in smoothly when revealed (CSS transitions, 0.5s)
- [x] Clicking a visible node still navigates to the corresponding Skill Section
- [x] WorkflowDiagram layout, styling, constants, and JSX structure remain unchanged

### Files changed

- `src/lib/sections.ts` — workflow beats 1 → 7
- `src/lib/sections.test.ts` — updated workflow advance/retreat tests
- `src/components/VerticalScrollPage.tsx` — pipe `contentLocal` through `WorkflowLayer`
- `src/components/WorkflowDiagram.tsx` — progressive reveal logic, staggered transitions

---

## Phase 6: Footer step navigation — progress dots + labels

**User stories**: 11, 12, 13

### What to build

Replace the current 3-button footer nav (Topo / Workflow / Context Rot) with a full **step navigation bar** spanning all 10 sections. The bar serves as both a progress indicator and a quick-jump navigation.

#### 6A — Step indicator component

- Render one clickable indicator per section in the footer `<nav>`, in section order (`hero` → `workflow` → 7 skills → `context-rot`).
- The **active section** is visually highlighted (brighter color, e.g. `text-neutral-100` or a subtle emerald accent). Visited/past sections use a medium tone (`text-neutral-500`). Future sections are dimmed (`text-neutral-700`).
- Clicking any indicator calls `setParams({ s: sectionId, b: 0 })` to jump to that section's first beat.

#### 6B — Responsive rendering: labels on desktop, dots on mobile

- **Desktop (`md:` breakpoint and up)**: Each indicator shows a short text label. Use abbreviated names to keep the bar compact:
  - `hero` → "Topo"
  - `workflow` → "Workflow"
  - `skill-grill-me` → "Grill Me"
  - `skill-write-a-prd` → "PRD"
  - `skill-prd-to-plan` → "Plan"
  - `skill-plan-to-tracker` → "Tracker"
  - `skill-do-work` → "Do Work"
  - `skill-improve-codebase-architecture` → "Arch"
  - `skill-handle-coderabbit` → "CR"
  - `context-rot` → "Context Rot"
- **Mobile (below `md:`)**: Each indicator renders as a small dot (`w-2 h-2 rounded-full`). Active dot is larger or brighter. No text labels.
- Labels and dots share the same click handler and active-state logic — only the visual rendering differs.

#### 6C — Visual grouping

- Add subtle spacing gaps to group related sections visually: `hero` | `workflow` | skills cluster | `context-rot`. Use slightly wider `gap` between groups (e.g. `gap-4` between groups, `gap-2` within the skills cluster on desktop; proportional on mobile).

#### 6D — Footer styling adjustments

- The footer retains its current styling: `fixed bottom-0`, `bg-neutral-950/80 backdrop-blur-sm`, `border-t border-neutral-800/50`.
- Center the indicators horizontally. On mobile, ensure the dot row doesn't exceed viewport width (10 dots at `w-2` + gaps fits comfortably).
- Active indicator transition uses `transition-colors` (GPU-friendly, no layout shifts).

### Constraints

- No changes to `sections.ts`, the navigation system, or wheel/touch scroll behavior.
- No new dependencies — built with existing Tailwind classes + the `SECTIONS` array from `sections.ts`.
- All transitions use `opacity` and `color` only (GPU-composited, no layout shifts).
- The component reads the current `sectionId` from the existing `nuqs` params (already available in `SectionNavigator`).

### Acceptance criteria

- [ ] Footer shows one indicator per section (10 total), in correct order
- [ ] Active section indicator is visually distinct (highlighted color)
- [ ] Clicking any indicator navigates to that section (beat 0)
- [ ] Desktop (`md:+`): indicators show abbreviated text labels
- [ ] Mobile (`< md`): indicators render as small dots (no text)
- [ ] Visual grouping separates hero, workflow, skills cluster, and context-rot
- [ ] Footer does not overflow on any viewport width
- [ ] No layout shifts or jank during section transitions
- [ ] Existing footer styling (fixed, blur, border) preserved

---

## Phase 7: Section order + merged skill layout (fewer beats)

**User stories**: 1, 2, 8, 9, 10, 11 (clarity of narrative; less scroll per skill)

### What to build

Tighten the story arc and reduce internal scrolling.

**A — Section order**

- Reorder `SECTIONS` (and any nav / anchor logic that assumes the old order) so the **Workflow** (animated diagram) is followed **immediately** by the seven skill sections.
- Move **Context Rot** to **after** the last skill section (still before the footer). The diagram introduces the skills; the user then walks each skill; Context Rot closes the “why on-demand skills” story afterward.
- Update deep links, `nuqs` defaults, and tests (`sections.test.ts`, etc.) to match the new order.

**B — Two beats per skill (layout)**

- Change each skill section from **3** substitutive beats to **2**.
- **Beat 0 (combined)**: In one 100vh-friendly layout, show together: Problem card, Skill card, and **Como funciona** (the numbered steps / `howItWorks`). Use responsive stacking and typography so nothing exceeds the plan’s no-overflow rule (tighter gaps, optional slightly smaller type on small screens if needed).
- **Beat 1 (alone)**: Keep the **exemplo prático** as its own full beat — the interactive `TerminalSimulator` (align heading copy with “exemplo prático” if you rename from “Exemplo interativo”). Same interactivity and `pointer-events` as today.
- Update `substitutiveBeats` / `StickySkillSection` so only two opacity+Y layers drive the content area; the former middle beat is no longer a separate full-screen step.

**C — Scroll budgets**

- Recompute spacer height and per-section scroll ranges: each skill section loses one beat; Context Rot’s position in the timeline moves. Allocator and Phase 3–style range tables need the new order and numbers.

### Acceptance criteria

- [x] `SECTIONS` order is: `hero` → `workflow` → all `skill-*` in sequence → `context-rot`
- [x] Each skill section has **2** beats in `sections.ts` and in UI behavior
- [x] Beat 0 shows problem + skill + how-it-works steps in one view (no separate substitutive step for cards-only then steps)
- [x] Beat 1 shows only the terminal / exemplo prático, prominent in the content area below the section title
- [x] No vertical overflow beyond 100vh per section/beat (layout tuned: compact type + `overflow-y-auto` on combined beat if needed on small viewports)
- [x] Master scroll allocation N/A in current `VerticalScrollPage` (nuqs wheel nav, no 2800vh spacer); tests pass
- [x] Context Rot has 3 substitutive beats (merged narrative beats); skill sections remain at 2 beats each
- [x] Workflow diagram node → anchor links still resolve to the correct skill section (ids unchanged)

---

## Phase 8: Animated Beam edges on Workflow Diagram ✅

**User stories**: 4, 5, 6, 7 (diagram polish; visual energy in the pipeline)

### What to build

Replace the default XyFlow marching-ants edge animation with custom **animated beam edges** — a luminous pulse that travels along each edge path, conveying "energy flowing through the pipeline."

**A — Custom edge type**

- Create an `AnimatedBeamEdge` custom edge component for XyFlow. It receives the standard edge props (`sourceX`, `sourceY`, `targetX`, `targetY`, `sourcePosition`, `targetPosition`) and uses `getBezierPath()` to compute the SVG `d` attribute.
- The edge renders two layers:
  1. **Base path**: the Bezier curve at 40% opacity (`stroke: #34d399` for main edges, `stroke: #22d3ee` for the optional edge), `strokeWidth: 2`.
  2. **Beam pulse**: a `<circle r="4">` with a `<feGaussianBlur>` SVG filter for glow, animated via `<animateMotion>` along the same Bezier path. Pulse color: `#6ee7b7` (emerald-300) for main edges, `#67e8f9` (cyan-300) for the optional edge.
- `<animateMotion>` config: `dur="3s"`, `repeatCount="indefinite"`, direction follows source → target.

**B — Edge registration and wiring**

- Register `AnimatedBeamEdge` in the `edgeTypes` map passed to `<ReactFlow>`.
- Update `buildEdges()` to set `type: "animatedBeam"` on all edges (replacing the default type).
- Pass beam color info via `edge.data` (e.g. `data: { beamColor: "#6ee7b7", baseColor: "#34d399" }`) so the custom edge component is generic.
- Remove `animated: true` from edge definitions (no longer needed — the custom edge handles its own animation).
- Remove `strokeDasharray` from the optional edge (line becomes solid, differentiated by cyan color only).

**C — Reduced motion support**

- Detect `prefers-reduced-motion: reduce` via `window.matchMedia` (or a shared hook if one exists).
- When reduced motion is active: do not render the `<circle>` + `<animateMotion>`. Render only the base path at **full opacity** (no 40% reduction, since there's no beam to contrast against).

**D — Integration with progressive reveal**

- The existing scroll-driven reveal logic (fade-in at 0.45s with stagger) remains unchanged.
- The beam pulse starts animating immediately when the edge becomes visible (opacity transitions from 0 → 1). No additional choreography needed — `<animateMotion>` runs continuously, and the fade-in naturally reveals it.
- Hidden edges (opacity 0, `pointerEvents: none`) continue to work as today.

### Constraints

- **Do not modify** node layout, node styling, node constants, or JSX structure of `WorkflowDiagram` — only edge rendering changes.
- All animated properties remain GPU-composited (`transform`, `opacity`). The SVG `<animateMotion>` is natively GPU-friendly.
- No new dependencies — uses XyFlow's `getBezierPath()` and native SVG `<animateMotion>`.

### Acceptance criteria

- [x] Custom `AnimatedBeamEdge` component registered as an XyFlow edge type
- [x] All edges use the custom edge type (no default XyFlow edges remain)
- [x] Base path renders at 40% opacity with correct color per edge (emerald-400 main, cyan-400 optional)
- [x] Beam pulse (gradient with glow filter) travels source → target in a loop on each edge
- [x] Pulse color is emerald-300 for main edges, cyan-300 for optional edge
- [x] Optional edge is solid line (no `strokeDasharray`), differentiated by cyan color only
- [x] `prefers-reduced-motion: reduce` disables the beam pulse; edge shows as static line at full opacity
- [x] Beam starts animating as soon as the edge fades in during progressive reveal (no delay)
- [x] Existing stagger choreography (edge fade 0.45s, node fade 0.5s with 0.3s delay) is preserved
- [x] No modifications to node layout, styling, constants, or JSX structure
- [x] Animations maintain 60fps with all 7+ edges animating simultaneously
- [x] `pointer-events` behavior unchanged (hidden edges remain non-interactive)

### Files changed

- `src/components/AnimatedBeamEdge.tsx` — new (custom XyFlow edge with beam gradient + glow)
- `src/components/WorkflowDiagram.tsx` — modified (edge type registration, `buildEdges()` uses `animatedBeam` type)

---

## Phase 8B: Skill Description Labels on Workflow Nodes ✅

**User stories**: 4, 5, 6, 7 (diagram comprehension; each skill's purpose is communicated inline during the reveal)

### What was built

Added persistent description labels to each skill node in the workflow diagram. Each label shows a concise one-line description of what the skill does, appearing/disappearing in sync with the node's scroll-driven reveal.

**8B-1 — Description data + per-node positioning**

- `SKILL_DESCRIPTIONS` map with 7 entries, one per skill, describing its core purpose.
- `DESCRIPTION_POSITION` map controlling whether each label renders above (`top`) or below (`bottom`) the node, configured per-skill to avoid overlap with edge lines.
- `SKILL_HANDLES` map that specifies which connection handles (dots) each node renders — unused handles are removed for a cleaner visual.

**8B-2 — SkillNodeWithCard wrapper**

- `SkillNodeWithCard` wraps `SkillNode` without modifying its JSX. Renders description text via absolute positioning (`top: 100%` or `bottom: 100%` depending on `descriptionPosition`).
- Description opacity and translateY are tied directly to the `visible` flag in node data — no timers or phases. Appears when node is revealed, disappears when scroll reverses.
- `prefers-reduced-motion` reduces transition to instant opacity snap.
- `zIndex: 1` ensures text renders above edge lines.

### Acceptance criteria

- [x] `SKILL_DESCRIPTIONS` map exists with a concise direct description for each of the 7 skills
- [x] Description renders above or below each skill node based on `DESCRIPTION_POSITION`
- [x] Description appears when node is revealed (scroll forward) and hides when node is hidden (scroll reverse)
- [x] `prefers-reduced-motion` shows description with instant opacity, no slide
- [x] Only connected handles are rendered per node (unused dots removed)
- [x] No modifications to SkillNode's internal JSX, className strings, or button structure
- [x] 60fps maintained with descriptions animating alongside beam pulses

### Files changed

- `src/components/AnimatedBeamEdge.tsx` — modified (exported `useReducedMotion`, removed card-related code)
- `src/components/WorkflowDiagram.tsx` — modified (`SKILL_DESCRIPTIONS`, `DESCRIPTION_POSITION`, `SKILL_HANDLES` maps; `SkillNodeWithCard` wrapper; conditional handle rendering in `SkillNode`; `visible` flag in `applyVisibility`)

---

## Phase 9: Skills Download CTA + Installation Dialog

**User stories**: 4, 5, 6, 7 (workflow section completeness; guide users from diagram to local setup)

### What to build

After all 7 skill nodes are revealed on the workflow diagram, add one more scroll beat that surfaces a **Download Skills** call-to-action below the diagram. Clicking the button downloads a pre-built `skills.zip` containing all 7 skill folders. After the download triggers, a shadcn `<Dialog>` opens with OS-specific instructions for installing the skills.

#### 9A — Build artifact: `public/skills.zip`

- Add a `package.json` script (`"build:skills-zip"`) that zips the `skills/` directory into `public/skills.zip`.
- Use Node's built-in `node:zlib`/`node:fs` + `archiver` (or a lightweight equivalent already in devDependencies) to produce the zip. If no zip utility is present, add `archiver` as a devDependency.
- The zip preserves the internal folder structure: each skill is at `skills/<name>/SKILL.md` (and any other files present in its folder).
- Wire this script to run as part of the Astro build via the `"build"` script: `"build": "npm run build:skills-zip && astro build"`.
- The resulting `public/skills.zip` is served as a static asset at `/skills.zip`.

#### 9B — Workflow section: 8th beat (download CTA)

- Increment `workflow` beats from **7 → 8** in `sections.ts`.
- In `WorkflowLayer` (or `WorkflowDiagram`), detect when `contentLocal` progress enters beat 8's range and show a CTA area **below the diagram**.
- CTA area layout: a short headline ("O workflow completo está pronto para usar."), a subline ("Baixe os 7 skills e configure em minutos."), and a prominent `<DownloadButton>` component.
- The CTA area fades in (opacity 0→1, translateY 16→0) using CSS transition when beat 8 becomes active, and fades out when beat 8 exits. GPU-composited only (`transform` + `opacity`).
- The diagram remains visible throughout beat 8 (no need to hide it); the CTA appears below the diagram area inside the fixed viewport section.

#### 9C — `DownloadButton` component

- Renders an `<a href="/skills.zip" download>` wrapped in a styled button (use shadcn `<Button variant="default">` with an icon — a download arrow, e.g. `lucide-react`'s `Download` icon).
- On click (before the browser initiates the download), open the installation `<Dialog>` by setting a local `open` state.
- The anchor's `download` attribute ensures the browser saves the file rather than navigating.

#### 9D — Installation `<Dialog>`

- Use shadcn `<Dialog>` (already available via shadcn/ui, which was installed in Phase 1).
- Dialog title: "Como instalar os skills".
- Content: a `<Tabs>` component (shadcn) with three tabs — **macOS**, **Linux**, **WSL** — each tab showing the correct directory path where the user should place the unzipped skills folder:
  - **macOS**: `~/.claude/skills/` (for Claude Code) or the equivalent path for the user's LLM tool.
  - **Linux**: `~/.claude/skills/` (same convention; note path may vary by tool).
  - **WSL**: `~/.claude/skills/` inside the WSL home (e.g. `/home/<user>/.claude/skills/`), with a note about Windows path differences.
- Below the tabs, a neutral callout note: "Os caminhos podem variar dependendo da ferramenta que você usa. A própria LLM pode te ajudar a encontrar o diretório correto para o seu setup."
- Dialog footer: a single "Fechar" button (`<DialogClose>`).
- `prefers-reduced-motion`: dialog opens/closes without animation (shadcn handles this via Radix).

### Constraints

- The ZIP generation script must be idempotent (re-running it overwrites `public/skills.zip`).
- Do not modify node layout, node styling, node constants, or the `WorkflowDiagram` JSX structure beyond adding the CTA render area and the beat count change.
- All new animations use `transform` and `opacity` only.
- No new runtime dependencies beyond `archiver` (devDependency only) and `lucide-react` (already likely installed; confirm before adding).

### Acceptance criteria

- [x] `npm run build:skills-zip` produces `public/skills.zip` containing all 7 skill folders with their files
- [x] `npm run build` runs `build:skills-zip` before `astro build`
- [x] Workflow section has `beats: 8` in `sections.ts`
- [x] Beat 8 reveals a CTA area below the diagram with headline, subline, and download button
- [x] CTA area fades in/out with the beat using GPU-composited transitions only
- [x] `DownloadButton` renders as an `<a download>` with shadcn `<Button>` styling and a download icon
- [x] Clicking the button opens the installation `<Dialog>` and initiates the file download
- [x] Dialog has three tabs: macOS, Linux, WSL — each showing the correct install path
- [x] Dialog includes the callout note about path variations and LLM assistance
- [x] Dialog closes via the "Fechar" footer button or the default Radix dismiss behavior
- [x] `prefers-reduced-motion` is respected (no slide animation on CTA, dialog opens instantly)
- [x] CTA is not visible during beats 1–7 (only becomes visible at beat 8)
- [x] 60fps maintained; beam animations on the diagram are unaffected

### Files changed

- `scripts/build-skills-zip.mjs` — new (Node script that zips `skills/` → `public/skills.zip`)
- `package.json` — modified (`build:skills-zip` script, `archiver` devDependency if needed, updated `build` script)
- `src/lib/sections.ts` — modified (workflow `beats: 7 → 8`)
- `src/components/WorkflowLayer.tsx` (or `WorkflowDiagram.tsx`) — modified (beat 8 CTA render area)
- `src/components/DownloadButton.tsx` — new (anchor-wrapped shadcn Button with download icon)
- `src/components/SkillsInstallDialog.tsx` — new (shadcn Dialog + Tabs with OS-specific install instructions)

---

## Phase 11: Keyboard arrow key navigation

**User stories**: 11, 12 (accessibility; power-user navigation)

### What to build

Add `ArrowDown` / `ArrowUp` (and `PageDown` / `PageUp`) keyboard support to `SectionNavigator` so keyboard users can advance and retreat through sections and beats — exactly like the wheel and touch handlers already do.

**Implementation**: add a single `keydown` listener inside `SectionNavigator`, alongside the existing `wheel` and `touch` listeners. Reuse the same `step()` function and `cooldownRef` — no new throttle logic needed.

**Focus-aware guard (Option A)**: the handler must be a no-op when keyboard focus is inside an interactive element, so the terminal simulator and any future text inputs keep their native arrow-key behavior. Block navigation when `document.activeElement` is:

- An `<input>` or `<textarea>`
- An element with `[contenteditable]`
- Any element that is a descendant of a `[data-scroll-capture]` container (covers the terminal simulator and any future scrollable widgets)

When none of those conditions are true, call `e.preventDefault()` and `step()`.

### Acceptance criteria

- [ ] `ArrowDown` and `PageDown` advance one beat/section (same as scrolling down)
- [ ] `ArrowUp` and `PageUp` retreat one beat/section (same as scrolling up)
- [ ] Same `WHEEL_COOLDOWN_MS` throttle and `cooldownRef` shared with wheel/touch — rapid key presses don't skip multiple beats
- [ ] Arrow keys are a no-op when `document.activeElement` is inside `[data-scroll-capture]` (terminal remains fully usable)
- [ ] Arrow keys are a no-op when `document.activeElement` is `<input>`, `<textarea>`, or `[contenteditable]`
- [ ] `e.preventDefault()` called only when navigation fires (not when focus is in an interactive element)
- [ ] No changes to `sections.ts`, `advance()`, `retreat()`, `step()`, or any section component

### Files changed

- `src/components/VerticalScrollPage.tsx` — add `keydown` listener in `SectionNavigator`

---

## Phase 10: Responsive tall-viewport unified skill layout

**User stories**: 9, 10, 11 (content density; reduced scrolling on large screens)

### What to build

On tall viewports (`min-height: 900px`), show all skill section content in a single unified view instead of using the 2-beat substitutive model. On shorter viewports, keep the current 2-beat layout unchanged.

**Key constraint**: The navigation system (`sections.ts`, `VerticalScrollPage`, URL params, wheel nav) stays completely untouched. Beat count remains 2 for all skill sections. The change is purely visual — `StickySkillSection` adapts its rendering based on viewport height.

#### 10A — Viewport height detection

- Add a `useTallViewport` hook (or inline `matchMedia` check) that returns `true` when `(min-height: 900px)` matches. Must handle SSR (default to `false` — short viewport behavior — when `window` is unavailable).
- The hook listens for viewport resize (e.g. rotating a tablet, resizing a desktop window) and updates reactively.

#### 10B — Unified layout for tall viewports

When `useTallViewport` returns `true`, `StickySkillSection` renders a **single scrollable column** instead of two overlapping absolute-positioned beat layers:

- **Top section**: Problem card + Skill card side by side (same grid as current beat 0)
- **Middle section**: How it Works steps
- **Bottom section**: Terminal Simulator (allocate remaining vertical space via `flex-1`)

All three areas are visible simultaneously. The substitutive beat opacity/Y transforms are **not applied** — both beat containers render at full opacity with `position: relative` (not `absolute`). The `contentLocal` MotionValue is still received but ignored for layout purposes on tall viewports.

The terminal must remain interactive (`pointer-events: auto`) and should get enough vertical space to be usable (~40-50% of the remaining height after cards and steps).

#### 10C — Short viewport behavior preserved

When `useTallViewport` returns `false` (viewport height < 900px), the component renders exactly as it does today: two `absolute inset-0` beat layers with substitutive opacity/Y transitions. Beat 0 = cards + steps, beat 1 = terminal. No changes.

#### 10D — Smooth typography and spacing adaptation

On tall viewports, the content has more breathing room. Adjust spacing and typography within the unified layout:

- Slightly larger gaps between cards and the How it Works section
- Terminal Simulator gets generous height allocation
- Cards and steps can use the standard (not compact) text sizes

On short viewports, keep the existing compact spacing.

### Constraints

- **No changes to `sections.ts`** — beat count stays at 2 for all skill sections.
- **No changes to `VerticalScrollPage.tsx`** or the navigation/wheel system.
- **No changes to `substitutiveBeats.ts`** — the hooks still exist and are called, but their output is conditionally ignored on tall viewports.
- All animated properties remain `transform` and `opacity` only.
- GPU-composited transitions only.

### Acceptance criteria

- [ ] `useTallViewport` hook detects `(min-height: 900px)` and updates on resize
- [ ] On tall viewports: all 3 content areas (cards, steps, terminal) visible simultaneously in one column
- [ ] On tall viewports: no substitutive beat fade/slide — all content at full opacity
- [ ] On tall viewports: Terminal Simulator is interactive and has sufficient height (~40-50% of remaining space)
- [ ] On short viewports (< 900px): behavior is identical to current 2-beat model
- [ ] Navigation system untouched: `sections.ts`, `VerticalScrollPage`, URL params, wheel nav all work as before
- [ ] Resizing viewport (e.g. rotating tablet) switches between unified and 2-beat layouts
- [ ] SSR-safe: defaults to short-viewport behavior when `window` is unavailable
- [ ] 60fps maintained on both layout modes
- [ ] Content does not overflow `100vh` on tall viewports (verified at 900px, 1080px, 1440px heights)

---

## Phase 12: Smooth Beam Reveal + Sequential Traveling Light

**User stories**: 4, 5, 6, 7 (diagram polish; cinematic energy in the pipeline)

### What to build

Improve the workflow diagram's edge reveal to feel smooth and cinematic (matching the rest of the app), and add a sequential traveling light beam that visually communicates "energy flowing through the entire pipeline" after all nodes are revealed.

#### 12A — Path-drawing edge reveal (replace opacity fade)

The current edge reveal uses a flat `opacity 0.45s ease` CSS transition — the entire edge line appears at once, which feels abrupt compared to the app's Motion-driven animations elsewhere.

Replace this with a **stroke-dasharray + stroke-dashoffset** "draw itself" animation: when an edge becomes visible, the line grows progressively from source to target along the Bezier path, as if being drawn in real-time.

- Compute total path length via `SVGPathElement.getTotalLength()` (measured once on mount/path change).
- Set `stroke-dasharray` to the total length and animate `stroke-dashoffset` from `totalLength → 0` using Motion's `animate` controls. The beam gradient reveal (existing `linearGradient` animation) starts only **after** the path has fully drawn itself — sequenced via `controls.start()` chaining or a `delay` equal to the draw duration.
- Draw duration: **0.6s** per edge with easing `[0.16, 1, 0.3, 1]` (same custom ease used elsewhere in the component).
- The stagger between edge and node reveal is preserved: edges still start drawing before their target node fades in (the existing `STAGGER_DELAY` timing in `WorkflowDiagram` stays the same). The difference is visual — the edge *draws* instead of *fading*.
- On scroll reverse (shrinking), the edge "un-draws" (dashoffset animates from `0 → totalLength`) before fading out completely, matching the forward choreography in reverse.

#### 12B — Sequential traveling beam after full reveal

Once all 7 edges are visible (all nodes revealed), transition the beam animation from independent per-edge loops to a **single sequential pulse** that travels the entire workflow chain in order:

- **Reveal mode** (during progressive reveal): Each edge runs its own beam gradient animation independently, starting when that edge finishes drawing. Same as today but sequenced after the draw animation from 12A.
- **Sequential mode** (after full reveal): A coordinator detects when `visibleCount === 7` (all nodes revealed). It then orchestrates beams so that only one edge's beam is active at a time, firing in workflow order: `grill-me→write-a-prd` → `write-a-prd→prd-to-plan` → ... → `improve-arch→handle-coderabbit`, then loops from the beginning.
- Coordination approach: each `AnimatedBeamEdge` receives a `sequenceIndex` (0–6) and a `sequentialMode` flag via `edge.data`. When `sequentialMode` is true, each edge calculates its active window within a shared cycle (e.g. total cycle = 7 × single-edge-duration). The beam gradient animates only during its window, stays invisible otherwise.
- **Cycle timing**: each edge's beam traversal takes **0.8s**, with a **0.1s** overlap between consecutive edges (the next edge's beam starts slightly before the previous one finishes, creating a continuous "handoff" feel). Total cycle ≈ 7 × 0.7s = ~4.9s before looping.
- The sequential beam should have a **longer gradient trail** (wider stop spread in the `linearGradient`) and a **brighter glow** (`stdDeviation: 6` instead of 4) to distinguish it from the reveal-phase beams.
- The optional feedback edge (`plan-to-tracker → write-a-prd`) does **not** participate in the sequential cycle — it keeps its own independent cyan beam loop at a slower pace (current behavior).

#### 12C — Reduced motion support

- When `prefers-reduced-motion: reduce` is active: edges still draw themselves (stroke-dashoffset animation) but at **instant** speed (duration 0). No beam pulse in either mode. Base path renders at full opacity (existing behavior preserved).

### Constraints

- **Do not modify** node layout, node styling, node constants, description labels, or the `WorkflowDiagram` JSX structure — only edge rendering and animation orchestration change.
- The progressive reveal logic (`computeVisibleCount`, `applyEdgeVisibility`, `applyNodeVisibility`, stagger delays) in `WorkflowDiagram` stays unchanged except for passing new data props (`sequenceIndex`, `sequentialMode`) to edges.
- All animated properties remain GPU-composited (`transform`, `opacity`, `stroke-dashoffset`).
- No new runtime dependencies — uses existing Motion controls and native SVG properties.

### Acceptance criteria

- [ ] Edge reveal uses stroke-dashoffset "draw" animation (line grows from source to target) instead of flat opacity fade
- [ ] Draw duration is ~0.6s per edge with custom easing `[0.16, 1, 0.3, 1]`
- [ ] Beam gradient starts only after the path finishes drawing (sequenced, not simultaneous)
- [ ] Scroll reverse "un-draws" the edge (dashoffset returns to totalLength)
- [ ] Existing stagger choreography preserved: edges draw before their target node fades in
- [ ] After all 7 nodes are revealed, beams transition to sequential mode (one beam traveling the chain at a time)
- [ ] Sequential beam travels edges in workflow order with ~0.1s overlap between consecutive edges
- [ ] Sequential beam has a longer gradient trail and brighter glow than reveal-phase beams
- [ ] Total sequential cycle is ~4.9s before looping
- [ ] Optional feedback edge (cyan) keeps its own independent loop, not part of the sequential cycle
- [ ] `prefers-reduced-motion: reduce` shows instant path draw and no beam pulse
- [ ] No modifications to node layout, styling, constants, descriptions, or WorkflowDiagram JSX structure
- [ ] 60fps maintained with all animations running simultaneously
- [ ] `pointer-events` behavior unchanged (hidden edges remain non-interactive)

### Files changed

- `src/components/AnimatedBeamEdge.tsx` — modified (stroke-dashoffset draw animation, sequential mode support, brighter glow variant)
- `src/components/WorkflowDiagram.tsx` — modified (pass `sequenceIndex` and `sequentialMode` via edge data; detect full-reveal state)
