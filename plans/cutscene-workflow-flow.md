# PRD: Cutscene Workflow Flow

## Problem Statement

Today the SkillForge landing page presents the workflow diagram as a single monolithic section (8 beats revealing all 7 skills at once), followed by 7 sequential skill detail sections. The user scrolls through the entire diagram reveal, then hits each skill page one after another with no connection back to the diagram. This linear dump loses the narrative thread — by skill 4 the user has forgotten the big picture and the diagram feels disconnected from the individual skill pages.

## Solution

Transform the page flow into a **cutscene-style experience** where the workflow diagram becomes a recurring hub. Instead of revealing all skills at once, the diagram reveals one skill per visit. After each reveal, the user scrolls into that skill's detail page, then returns to the diagram for the next reveal. This creates a rhythm:

```
Hero → Diagram (reveal skill 1) → Skill 1 page →
       Diagram (reveal skill 2) → Skill 2 page →
       ...
       Diagram (reveal skill 7) → Skill 7 page → Context Rot
```

The diagram is **accumulative** — each return shows all previously revealed skills plus animates the new one. The user builds a progressive mental map of the full workflow while diving deep into each skill.

## User Stories

1. As a visitor, I want the diagram to reveal one skill at a time so that I can absorb each step before moving on.
2. As a visitor, I want to see previously revealed skills still visible when I return to the diagram so that I maintain context of the full workflow.
3. As a visitor, I want the new skill's node and edge to animate in when the diagram section appears so that I notice what's new.
4. As a visitor, I want a smooth crossfade transition between the diagram and each skill page so that the experience feels cinematic.
5. As a visitor, I want to scroll down from a skill page and land on the diagram showing the next skill reveal so that the narrative continues naturally.
6. As a visitor, I want to scroll up from a skill page and return to the diagram that introduced it so that navigation is predictable and symmetric.
7. As a visitor, I want the footer navigation to show only skill sections (not the intermediate diagram visits) so that the dot bar stays clean and readable.
8. As a visitor, I want the footer dots to still let me jump to any skill section directly so that I can navigate non-linearly if needed.
9. As a visitor, I want the diagram header ("O Workflow" + subtitle) to remain consistent on every diagram visit so that I recognize the hub.
10. As a visitor, I want the download button to appear only on the final diagram visit (when all 7 skills are revealed) so that the call-to-action arrives at the natural completion moment.
11. As a visitor, I want the skill detail pages to look exactly the same as they do today (Problem, Solution, How It Works, Terminal) so that proven content is preserved.
12. As a visitor, I want Hero and Context Rot sections to remain unchanged so that the intro and closing are unaffected.
13. As a visitor, I want nodes in the diagram to NOT be clickable so that scroll is the only way to advance, preserving the cutscene narrative.
14. As a visitor, I want the 3D particle background to appear on every diagram visit so that the visual atmosphere is consistent.
15. As a visitor on a device with reduced motion preferences, I want the experience to degrade gracefully (instant reveals, no particle animations) so that accessibility is maintained.
16. As a visitor, I want the reveal animation of the new skill to be driven by the section's scroll progress so that it feels responsive to my input, not a fixed timer.

## Implementation Decisions

### Section Architecture — Interleaved Sections

The existing `sections.ts` linear array model is preserved. The single `workflow` section (8 beats) is replaced by 7 individual workflow sections (`workflow-1` through `workflow-7`), interleaved with the existing skill sections:

```
hero(1b) → workflow-1(1b) → skill-grill-me(1b) →
           workflow-2(1b) → skill-write-a-prd(1b) →
           workflow-3(1b) → skill-prd-to-plan(1b) →
           workflow-4(1b) → skill-plan-to-tracker(1b) →
           workflow-5(1b) → skill-do-work(1b) →
           workflow-6(1b) → skill-improve-codebase-architecture(1b) →
           workflow-7(1b) → skill-handle-coderabbit(1b) →
           context-rot(3b)
```

Total: 17 sections (up from 10), all with 1 beat except context-rot (3 beats).

### WorkflowDiagram — Prop-Driven Visibility

- WorkflowDiagram receives a new **`visibleCount` prop** (1–7) that determines how many skills are shown.
- Skills 1..N-1 render with `opacity: 1` immediately (no animation).
- Skill N animates in using the section's `contentLocal` MotionValue (0→1 drives opacity and edge draw).
- The existing `computeVisibleCount(p)` progress-based logic is replaced by the explicit prop.

### Independent Diagram Instances

Each `workflow-N` section mounts its own `WorkflowDiagram` instance. No persistent/shared instance across sections. The crossfade between sections hides the remount. React Flow's `fitView` on init handles viewport positioning automatically.

### Footer — Hidden Workflow Sections

A new `hidden?: boolean` field on the Section type. All `workflow-N` sections are marked `hidden: true`. The footer navigation renders only non-hidden sections, preserving the current dot count (~10 visible dots).

### Node Interactivity — Disabled

SkillNode `onClick` handlers are removed (or no-oped). Nodes are purely visual in the cutscene flow. The footer dots serve as the escape hatch for non-linear navigation.

### Download Button — Last Diagram Only

The DownloadButton renders only when `visibleCount === 7` (the `workflow-7` section). It appears immediately (no progress threshold needed since this is the final diagram visit).

### Scroll Behavior — Symmetric

`advance()` and `retreat()` continue to work linearly through the section array. Scroll up from `skill-N` goes to `workflow-N`, scroll up again goes to `skill-N-1`. No skip logic.

### Particles — Remount with Diagram

`WorkflowParticles` renders inside each `workflow-N` section body, remounting with each diagram visit. If Three.js remount causes visible flicker, this is addressed as a follow-up optimization.

### Transitions — Crossfade (MVP)

The existing `AnimatePresence mode="wait"` crossfade in `VerticalScrollPage` handles all transitions. No custom zoom-in, slide, or shared element transitions for the MVP.

## Out of Scope

- **Custom transition effects** (zoom-in from node, slide-up sheet) — deferred to post-MVP iteration after validating the interleaved flow works.
- **Persistent diagram instance** across sections — only pursue if remount flicker is unacceptable.
- **Clickable nodes for navigation** — the cutscene flow relies on scroll as the sole narrative driver.
- **Changes to skill page content** (StickySkillSection layout, terminal simulator, scenarios) — pages remain identical.
- **Changes to Hero or Context Rot sections** — bookend sections are untouched.
- **Extra beats for workflow-1** (e.g., showing empty diagram before first reveal) — potential refinement, not MVP.
- **Mobile-specific layout adjustments** — the current responsive behavior carries over.

## Further Notes

- **Performance risk**: Three.js canvas remounting 7 times during a full scroll-through. Monitor for flicker or memory leaks. If problematic, consider lazy-loading particles only on the first and last diagram visits, or a persistent canvas layer.
- **17 sections in the scroll handler**: The wheel/touch/keyboard handlers use cooldowns and thresholds that should scale fine, but verify no perceptible lag with the increased section count.
- **URL state**: The `?s=workflow-3&b=0` query params will expose the interleaved structure in the URL. This is acceptable — deep-linking to a specific diagram state is a feature, not a bug.
- **Testing strategy**: The `sections.test.ts` file already tests `advance()` and `retreat()`. The new section array needs equivalent coverage for the interleaved pattern, especially boundary cases (first/last section, workflow→skill transitions).
- **Rollback path**: Since this changes `sections.ts` and `VerticalScrollPage.tsx` primarily, reverting is a clean git revert if the experiment doesn't land.
