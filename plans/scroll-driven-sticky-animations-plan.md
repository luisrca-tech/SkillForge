# Plan: Scroll-Driven Sticky Animations

> Source PRD: plans/scroll-driven-sticky-animations.md

## Architectural decisions

Durable decisions that apply across all phases:

- **Animation engine**: Motion v12 (`useScroll`, `useTransform`) drives all scroll-based animations. No GSAP or additional animation libraries.
- **Viewport constraint**: Every section must fit within 100vh. No section ever exceeds viewport height. Content adapts (responsive stacking, smaller gaps) but never overflows.
- **Beat model**: Substitutive, not additive. Only the active beat is visible within a section — previous beats fade out as the next fades in. The section title stays fixed; the content area below it transitions between beats.
- **Skill section beats (3 beats)**: Beat 0 = Problem + Skill cards together (side-by-side on desktop, stacked on mobile). Beat 1 = How it Works (steps). Beat 2 = Terminal Simulator.
- **Context Rot beats (5 beats)**: Beat 0 = "What is Context Rot?" card. Beat 1 = Side-by-side comparison. Beat 2 = "Why it matters". Beat 3 = Analogy. Beat 4 = References grid.
- **Carousel architecture (shader.se pattern)**: `body` has `overflow: hidden; overscroll-behavior: none`. A single scroll container (`position: fixed; inset: 0; overflow-y: auto`) holds scroll content. A viewport layer (`position: fixed; inset: 0`) holds all sections layered via `position: absolute; inset: 0`. Scroll progress drives which section is visible and its internal animations. Transitions happen in-place (crossfade/scale), not via push-up. *(Phases 1–2 used Pattern A with per-section sticky containers; Phase 3 refactors to Pattern B.)*
- **Scroll progress model**: A single master `useScroll({ container: scrollContainerRef })` produces a 0→1 progress for the entire page. Each section is allocated a sub-range derived from its scroll budget. Within each sub-range, `useTransform` maps to enter transition → internal beats → exit transition. *(Phases 1–2 used per-section `useScroll`; Phase 3 refactors to a single master scroll.)*
- **Scroll budgets**: Hero 200vh, Workflow 100vh, Context Rot 400vh (5 beats × ~80vh), Skill sections 300vh each (3 beats × ~100vh). Total spacer height ≈ 2800vh.
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
| Context Rot | 400vh | 5 substitutive | 0.107 → 0.250 |
| grill-me | 300vh | 3 substitutive | 0.250 → 0.357 |
| write-a-prd | 300vh | 3 substitutive | 0.357 → 0.464 |
| prd-to-plan | 300vh | 3 substitutive | 0.464 → 0.571 |
| plan-to-tracker | 300vh | 3 substitutive | 0.571 → 0.679 |
| do-work | 300vh | 3 substitutive | 0.679 → 0.786 |
| improve-arch | 300vh | 3 substitutive | 0.786 → 0.893 |
| handle-coderabbit | 300vh | 3 substitutive | 0.893 → 1.000 |

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
- [x] Context Rot shows 5 substitutive beats
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

## Phase 6: Polish — progress indicator, mobile tuning, performance

**User stories**: 11, 12, 13

### What to build

Add a scroll progress indicator, tune mobile scroll distances, and optimize performance across all pinned sections.

A subtle scroll progress bar (thin line at the top or side of the viewport) shows the user's overall position through the page. This is especially important during pinned sections where the browser's native scrollbar may not provide clear feedback.

Mobile scroll distances (outer container heights) are reviewed and adjusted per section — some sections may need shorter scroll ranges on small screens to avoid excessive scrolling for the same content. Content that uses side-by-side layouts stacks vertically on mobile.

Performance is audited: ensure all animations use GPU-composited properties only, `will-change: transform` is applied to pinned containers, ReactFlow diagram doesn't re-render during scroll, and Motion's scroll tracking is RAF-throttled. Target is consistent 60fps on mid-range mobile devices.

### Acceptance criteria

- [ ] Scroll progress indicator is visible and accurately reflects position through the full page
- [ ] Mobile scroll distances are tuned (not excessive per section)
- [ ] Side-by-side layouts stack on mobile
- [ ] Animations maintain 60fps on desktop and mid-range mobile
- [ ] `will-change: transform` applied to pinned containers
- [ ] No unnecessary React re-renders during scroll (verified via React DevTools profiler)
- [ ] ReactFlow diagram does not re-render during scroll-driven node reveal
