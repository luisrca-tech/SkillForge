## Problem Statement

The landing page currently uses simple `whileInView` fade-up animations across all sections. Each section scrolls naturally with no sense of flow, progression, or narrative rhythm. The user scrolls through a long page where content appears and disappears without any spatial relationship between sections. This makes the experience feel like a standard documentation page rather than a curated product showcase. Award-winning sites (Awwwards-level) use sticky scroll-driven animations to create immersive storytelling — the current site lacks this entirely.

## Solution

Transform the entire page into a sticky scroll-driven experience where each section pins to the viewport, animates its internal content based on scroll progress, and transitions to the next section via a push-up effect. The animation system uses Motion's `useScroll` and `useTransform` APIs (already installed as `motion` v12) to drive all animations from scroll position rather than time-based triggers.

The page becomes a sequence of 10 pinned scenes — Hero, Workflow Diagram, Context Rot, and 7 Skill Sections — each with internal scroll beats that reveal content progressively. The Workflow Diagram section gets a major animation upgrade: nodes appear sequentially with a descriptive shadcn/ui card, culminating in a reverse-order reveal with depth effects. The footer scrolls normally after the last pinned section.

## User Stories

1. As a visitor, I want each section to stay fixed on screen while I scroll, so that I can absorb the content without it sliding away prematurely.

2. As a visitor, I want to see smooth transitions between sections where the next section pushes the current one upward, so that the navigation feels like a guided story rather than a disconnected scroll.

3. As a visitor, I want the Hero section to pin and fade/scale out as I scroll, so that it feels like a cinematic opening that gives way to the content.

4. As a visitor, I want the Workflow Diagram nodes to appear one by one in logical order (grill-me → write-a-prd → prd-to-plan → ...) with a small delay between each, so that I understand the sequential flow of the development process.

5. As a visitor, I want each Workflow Diagram node to display a shadcn/ui card (above or beside the node) with a brief explanation of that skill when it animates in, so that I immediately understand what each step does.

6. As a visitor, I want only one explanation card visible at a time in the Workflow Diagram (the card for the currently animating node), so that the interface stays clean and focused.

7. As a visitor, I want to see a finale effect in the Workflow Diagram where, after the last node appears, all cards reappear in reverse order with a hover/depth/elevation effect, so that the complete workflow is revealed as a cohesive system.

8. As a visitor, I want the Context Rot section to pin and progressively reveal its sub-blocks (main explanation → side-by-side comparison → analogy → references) one by one as I scroll, so that the educational content builds on itself.

9. As a visitor, I want each Skill Section to pin and progressively reveal its 4 internal blocks (Problem → Skill → How it works → Terminal) as I scroll, so that each skill tells its own mini-story.

10. As a visitor, I want the Terminal Simulator to remain fully interactive (tab switching, animation playback) while its Skill Section is pinned, so that I can engage with the demo without the section scrolling away.

11. As a visitor on mobile, I want the same sticky scroll-driven experience, so that the storytelling quality is consistent across devices.

12. As a visitor, I want the scroll-driven animations to feel smooth and performant (60fps), so that the experience feels polished rather than janky.

13. As a visitor, I want visual indicators (scroll progress bar, subtle cues) that communicate "keep scrolling" during pinned sections, so that I know the page hasn't frozen.

14. As a visitor, I want the footer to appear naturally after the last pinned section without sticky behavior, so that the experience has a clear ending.

15. As a visitor, I want clicking a Workflow Diagram node to still navigate me to the corresponding Skill Section, so that existing navigation behavior is preserved.

## Implementation Decisions

### Animation Engine

- Use Motion (`motion` v12, already installed) exclusively — specifically `useScroll`, `useTransform`, and `useMotionValueEvent` for scroll-driven animations.
- No GSAP or ScrollTrigger needed — Motion's scroll APIs are sufficient and avoid adding another dependency.
- All animations are driven by scroll progress (0 to 1 within a scroll range), not by time or intersection observers.

### Sticky/Pin Mechanism

- Each section is wrapped in a tall outer container (`div`) whose height determines how much scroll distance that section "consumes" (e.g., a section with 4 internal beats might have `height: 400vh` so each beat gets ~100vh of scroll travel).
- Inside the tall container, a `position: sticky; top: 0; height: 100vh` inner container holds the actual visible content, keeping it pinned while the user scrolls through the outer container.
- This is a pure CSS sticky approach — no JavaScript scroll hijacking, which preserves native scroll feel and accessibility.

### Section Transition Pattern (Pattern A)

- While a section is pinned, its internal content animates (fades in, slides, scales) based on scroll progress within that section's scroll range.
- When the scroll passes beyond the section's outer container, the sticky element naturally unsticks and the next section's sticky container takes over — creating the "push up" effect.

### Workflow Diagram Enhancements

- Install shadcn/ui to provide the Card component for node explanations.
- Each node in the ReactFlow diagram animates in sequentially, driven by scroll progress within the Workflow section's pin range.
- A single shadcn Card component is positioned near the active node, showing a brief description (title + 1-2 sentence summary). The card fades/slides in when a node activates and fades out when the next node takes over.
- Skill descriptions for cards are sourced from the existing skills data or a new lightweight map.
- Finale sequence: after the last node appears, all cards reappear in reverse order (handle-coderabbit → ... → grill-me) with an elevation/depth effect (shadow scaling, subtle Y-axis lift, staggered timing).
- Node click navigation to skill sections is preserved.

### Skill Section Internal Beats

- Each Skill Section has 4 scroll beats within its pinned range:
  1. Problem block fades/slides in
  2. Skill block fades/slides in (Problem stays visible or compresses)
  3. How it Works block appears
  4. Terminal Simulator appears and becomes interactive
- Content layout may shift from single-column to a more spatial arrangement to make use of the full viewport during pinning.

### Context Rot Internal Beats

- ~4-5 scroll beats:
  1. Title + intro text
  2. "What is Context Rot?" explanation card
  3. Side-by-side comparison (Global Rules vs. On-Demand Skills)
  4. Analogy section
  5. References grid

### Mobile Behavior

- Sticky scroll behavior is maintained on mobile — the same pinning and internal beat system applies.
- Scroll distances (outer container heights) may be reduced on mobile to avoid excessive scrolling for the same content.
- Content layout adapts responsively (e.g., side-by-side comparisons stack vertically).

### Performance

- All animations use CSS `transform` and `opacity` only (GPU-composited properties) to maintain 60fps.
- `will-change: transform` is applied to pinned containers.
- ReactFlow diagram rendering is optimized to avoid re-renders during scroll — node visibility is controlled via opacity/transform, not conditional rendering.
- Scroll event handling uses Motion's built-in RAF-throttled scroll tracking.

### New Dependencies

- `shadcn/ui` — installed and configured for the Card component (and potentially other UI primitives in the future). Requires adding `tailwind-merge`, `clsx`, `class-variance-authority`, and `@radix-ui/react-slot` as peer dependencies.

## Out of Scope

- **Horizontal scroll sections** — all sections use vertical scroll with pinning, no horizontal carousels.
- **Scroll snapping (`scroll-snap`)** — the experience is fluid scroll-driven, not snap-point based.
- **Page routing changes** — the page remains a single-page Astro application.
- **Content changes** — no text, copy, or data modifications. Only animation and layout behavior changes.
- **New sections or skills** — the existing 10 sections are animated, no new content is added.
- **Preloader or loading screen** — the page loads as-is, no intro animation before the Hero.
- **Sound or haptic feedback** — animations are visual only.
- **Analytics or scroll tracking events** — no telemetry for scroll depth is added in this scope.

## Further Notes

- The tall outer containers that drive scroll distance should be tuned through testing — starting with `400vh` for 4-beat sections and adjusting based on how the pacing feels in practice. Too much scroll per beat feels sluggish; too little feels rushed.
- The Workflow Diagram currently uses `@xyflow/react` (ReactFlow). The scroll-driven node reveal needs to coexist with ReactFlow's rendering — the approach should control node `opacity` and card visibility via scroll progress without conflicting with ReactFlow's internal state management.
- Consider adding a subtle scroll progress indicator (thin bar at the top or side) so users know how far they are through the pinned experience, especially on mobile where the scrollbar may be hidden.
- The reverse-order card reveal in the Workflow finale is a signature moment — it should feel deliberate and polished, with enough timing variation between cards to create visual rhythm (not all appearing at once).
