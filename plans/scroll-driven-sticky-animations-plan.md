# Plan: Scroll-Driven Sticky Animations

> Source PRD: plans/scroll-driven-sticky-animations.md

## Architectural decisions

Durable decisions that apply across all phases:

- **Animation engine**: Motion v12 (`useScroll`, `useTransform`) drives all scroll-based animations. No GSAP or additional animation libraries.
- **Pin mechanism**: Pure CSS `position: sticky; top: 0; height: 100vh` inside a tall outer container. Outer container height determines scroll distance per section (e.g., `400vh` for 4 beats). No scroll hijacking.
- **Transition pattern**: Pattern A — section content animates within its pin range, then the next section's sticky container naturally pushes it up as the outer container ends.
- **Scroll progress model**: Each section uses `useScroll({ target: outerContainerRef })` to get a 0→1 progress value, then `useTransform` maps sub-ranges to individual beat animations.
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

## Phase 3: shadcn/ui + Workflow Diagram (reveal + cards + finale)

**User stories**: 4, 5, 6, 7, 15

### What to build

Install shadcn/ui and enhance the Workflow Diagram section with a scroll-driven node reveal, explanatory cards, and a finale sequence.

The Workflow section becomes a pinned section. As the user scrolls through its pin range, diagram nodes appear one by one in logical order (grill-me → write-a-prd → prd-to-plan → plan-to-tracker → do-work → improve-codebase-architecture → handle-coderabbit) with a small delay between each. Edges animate in as their source and target nodes become visible.

When a node activates, a shadcn Card component appears near it (above or beside) showing the skill name and a 1-2 sentence description. Only one card is visible at a time — the previous card fades out as the new one fades in.

After the last node appears, a finale sequence triggers: all cards reappear in reverse order (handle-coderabbit → ... → grill-me) with a depth/elevation effect (shadow scaling, subtle Y-axis lift, staggered timing). This creates a "full workflow revealed" moment.

Node click navigation to the corresponding Skill Section is preserved.

### Acceptance criteria

- [ ] shadcn/ui is installed and configured with the Card component
- [ ] Workflow section pins and nodes appear sequentially via scroll
- [ ] A single shadcn Card with skill description appears near the active node
- [ ] Cards transition one-at-a-time (previous fades out, new fades in)
- [ ] Finale: after last node, all cards reappear in reverse order with depth/elevation effect
- [ ] Edges animate in as their connected nodes appear
- [ ] Clicking a node still navigates to the corresponding Skill Section
- [ ] Mobile responsive layout for diagram + cards

---

## Phase 4: Polish — progress indicator, mobile tuning, performance

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
