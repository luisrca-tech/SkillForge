# Plan: Cutscene Workflow Flow

> Source PRD: plans/cutscene-workflow-flow.md

## Architectural decisions

Durable decisions that apply across all phases:

- **Section model**: The linear `SECTIONS` array in `sections.ts` is the single source of truth for navigation order. All 17 sections (hero + 7 workflow + 7 skill + context-rot) live in this array. `advance()` and `retreat()` traverse it linearly — no skip logic.
- **URL state**: `?s=<sectionId>&b=<beat>` pattern unchanged. New section IDs follow `workflow-1` through `workflow-7` naming.
- **Section type**: `Section` gains an optional `hidden` field. Hidden sections participate in navigation but are excluded from the footer dot bar.
- **WorkflowDiagram contract**: Accepts `visibleCount` (1–7) as the primary visibility driver instead of deriving it from `contentLocal` progress. `contentLocal` still drives the animation of the Nth skill only.
- **No persistent state across sections**: Each `workflow-N` mounts an independent WorkflowDiagram. No shared instance, no lifted state.

---

## Phase 1: Interleaved Section Array + Footer Hiding

**User stories**: 1, 7, 8, 9, 12

### What to build

Replace the current 10-section array with 17 interleaved sections. The single `workflow` section (8 beats) becomes 7 individual `workflow-1` through `workflow-7` sections (1 beat each), each placed immediately before its corresponding skill section. Hero stays first, context-rot stays last, all skill sections keep their existing IDs and beats.

Add a `hidden?: boolean` field to the `Section` type. Mark all `workflow-N` sections as hidden. Update the footer navigation to skip hidden sections when rendering dots/labels, while keeping them in the navigation array so `advance()`/`retreat()` still traverse them.

Update section labels and groups: all `workflow-N` sections share a common group with their paired skill section. The footer grouping gaps remain visually correct.

Write tests covering:
- The full 17-section sequence in order
- `advance()` crossing from `workflow-N` → `skill-N` → `workflow-N+1`
- `retreat()` symmetry: `workflow-N+1` → `skill-N` → `workflow-N`
- Boundary: `advance()` from last skill reaches `context-rot`, `retreat()` from `context-rot` reaches last skill
- Hidden sections are excluded from footer rendering but present in navigation

### Acceptance criteria

- [ ] `SECTIONS` array contains 17 sections in the correct interleaved order
- [ ] `SectionId` type includes `workflow-1` through `workflow-7` (the old `workflow` ID is removed)
- [ ] All `workflow-N` sections have `beats: 1` and `hidden: true`
- [ ] `advance()` and `retreat()` traverse all 17 sections linearly
- [ ] Footer renders only non-hidden sections (~10 dots)
- [ ] Footer click on a skill dot navigates to that skill section (not the preceding workflow section)
- [ ] Existing tests updated and new boundary tests pass

---

## Phase 2: Prop-Driven WorkflowDiagram

**User stories**: 1, 2, 3, 13, 16

### What to build

Modify WorkflowDiagram to accept a `visibleCount` prop (1–7) that replaces the `computeVisibleCount(p)` progress-based logic. The component renders in two modes:

- **Previously revealed skills (1..N-1)**: Render immediately with full opacity, no animation. Edges between them are visible and in sequential beam mode.
- **Newly revealed skill (N)**: Animate opacity and edge draw driven by `contentLocal` MotionValue (0→1). This is the only skill that animates on this diagram visit.

Remove click handlers from SkillNode — nodes are purely visual. The `useNavigateTo()` hook call and `handleClick` callback are removed. The cursor style changes from pointer to default.

The download button logic moves out of WorkflowDiagram into the parent layer, controlled by `visibleCount === 7`.

### Acceptance criteria

- [ ] WorkflowDiagram accepts `visibleCount` prop and renders exactly that many skills
- [ ] Skills 1..N-1 appear instantly with full opacity on mount
- [ ] Skill N animates in as `contentLocal` progresses from 0 to 1
- [ ] Edges between skills 1..N-1 are visible with sequential beam animation
- [ ] Edge leading to skill N draws in sync with `contentLocal`
- [ ] Nodes are not clickable (no onClick, cursor is default)
- [ ] Component renders correctly for all values of `visibleCount` (1 through 7)

---

## Phase 3: Wire Up VerticalScrollPage Rendering

**User stories**: 4, 5, 6, 10, 11, 14

### What to build

Update `SectionBody` in VerticalScrollPage to render the new `workflow-N` sections. Each `workflow-N` renders a `WorkflowLayer` variant that:

- Shows the fixed header ("O Workflow" + subtitle)
- Renders `WorkflowParticles` with the section's `contentLocal`
- Renders `WorkflowDiagram` with `visibleCount={N}` and `contentLocal`
- Shows the `DownloadButton` only when `visibleCount === 7` (the `workflow-7` section)

The existing skill section rendering (`StickySkillSection`) remains unchanged — the `SectionBody` switch already handles `skill-*` IDs.

The `AnimatePresence mode="wait"` crossfade handles all transitions between diagram and skill sections naturally.

Remove the old `workflow` case from `SectionBody` since that section ID no longer exists.

### Acceptance criteria

- [ ] Scrolling from hero enters `workflow-1`, which shows the diagram with 1 skill revealed
- [ ] Scrolling from `workflow-1` enters `skill-grill-me` with crossfade transition
- [ ] Scrolling from `skill-grill-me` enters `workflow-2`, which shows 2 skills (first instant, second animating)
- [ ] This pattern repeats correctly for all 7 skill/workflow pairs
- [ ] Scrolling from `skill-handle-coderabbit` enters `context-rot`
- [ ] Scroll up from any skill page returns to its preceding workflow section (symmetric navigation)
- [ ] Download button appears only on `workflow-7`
- [ ] Particle background renders on every workflow section
- [ ] Header text is identical on all workflow sections
- [ ] Skill pages render identically to the current implementation

---

## Phase 4: Polish & Edge Cases

**User stories**: 15

### What to build

Verify and fix edge cases across the full cutscene flow:

- **Reduced motion**: Confirm that `prefers-reduced-motion` skips node/edge animations and particle effects. Skills should appear instantly without fade/draw sequences.
- **Three.js remount**: Test for visible flicker when transitioning between workflow sections. If flicker is perceptible, add a brief opacity transition on the particles container to mask it.
- **Touch/keyboard navigation**: Verify wheel, touch (50px threshold), and keyboard (Arrow/Page keys) all traverse the 17 sections correctly with the existing cooldown.
- **Deep linking**: Verify that navigating directly to `?s=workflow-4&b=0` shows the diagram with 4 skills visible and the 4th animating.
- **Animation observer**: Verify `hasPlayed()`/`markPlayed()` works correctly with the new section IDs so terminal animations in skill pages don't replay on revisit.

### Acceptance criteria

- [ ] Reduced motion preference disables all node/edge animations and particle effects
- [ ] No visible flicker or white flash when transitioning between workflow sections
- [ ] Touch swipe navigates through all 17 sections without getting stuck
- [ ] Keyboard navigation (Arrow Up/Down, Page Up/Down) traverses all sections
- [ ] Direct URL `?s=workflow-4&b=0` renders correctly with 4 skills visible
- [ ] Terminal animations in skill pages respect the animation observer (play once, skip on revisit)
- [ ] Scrolling through the entire flow (hero to context-rot) completes without errors or visual glitches
