# Plan: Edge Alignment During Zoom-Out Transition

> Source PRD: `plans/prd-edge-alignment-zoom.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **ReactFlow viewport**: Initial fit via `onInit`; responsive re-fit via layout-driven logic when node/edge counts or diagram container size change. Programmatic `fitView` remains the mechanism for centering the graph after layout changes.
- **Coordinate model**: Edge geometry lives in ReactFlow flow space. Parent CSS `scale` on the wrapper does not change flow coordinates; misalignment was driven by a post-animation remeasure/fit/internals cycle, not by scale itself.
- **Zoom orchestration**: Zoom-out is owned by the scroll/section navigator; the diagram may still need a signal that a zoom-out animation is in progress so viewport refits do not fight the motion layer (e.g. suppressing refit while zooming). That signal must not control edge visibility after this work.
- **`updateNodeInternals`**: Still valid for real layout changes (e.g. resize); not triggered on the `zoom-out → idle` transition.
- **Reduced motion**: Existing fallback for transitions stays as today; edge alignment must hold in that path too.
- **Out of scope**: Zoom timing/easing changes, staggered node reveal, `AnimatedBeamEdge` behavior, new edges/handles, broader ReactFlow perf work (per PRD).

---

## Phase 1: Always-visible edges and one initialization path

**User stories**: 1, 4, 6

### What to build

Remove the binary “edges not ready” gating that hides edges during zoom-out (opacity forced to 0 while waiting for animation end). Edges should follow the same visibility rules as the backward navigation path: eligible edges are shown according to revealed nodes and existing beam/sequence rules, without a separate “ready” flag tied to zoom state. Users see edges throughout the zoom-out motion at any viewport size.

### Acceptance criteria

- [ ] During forward `skill-*` → `workflow-*` transition, edges are visible for the whole zoom-out animation (not opacity-clamped by zoom state).
- [ ] Edge initialization does not depend on a post-animation callback to “turn on” visibility for the forward case.
- [ ] No component state exists whose sole job is “edges may render now” after zoom-out.

---

## Phase 2: Remove post-zoom-out remeasure cycle

**User stories**: 2

### What to build

Eliminate the logic that runs when zoom-out finishes and triggers bulk handle refresh plus a follow-up that reapplies edge styles. That cycle conflicts with the viewport state after `fitView` and causes handle/edge mismatch on forward navigation. The internal fit helper should only own initial/responsive fitting and resize observation—not edge revelation tied to zoom end. Public props for “edges ready” callbacks are removed accordingly.

### Acceptance criteria

- [ ] No effect or handler runs specifically on `isZoomingOut` transitioning from true → false that calls `updateNodeInternals` for all nodes in order to “fix” edges.
- [ ] After zoom-out completes on forward navigation, edges meet node handles at rest (same visual standard as backward navigation).
- [ ] `fitView` on graph init and on real layout/resize needs remains; zoom-out completion does not introduce an extra internals refresh.

---

## Phase 3: Contract cleanup and regression guardrails

**User stories**: 3, 5

### What to build

Align parent→diagram props so `isZoomingOut` (or equivalent) is only used where still required (e.g. avoiding refit during the motion), not for edge visibility. Confirm backward navigation still matches current alignment behavior. Confirm `prefers-reduced-motion` paths still show a correct diagram. Add or extend automated coverage where the stack allows (e.g. behavior specification via tests on pure helpers, or integration smoke); otherwise document manual checks in the PR.

### Acceptance criteria

- [ ] Backward navigation toward the hero does not regress edge alignment.
- [ ] With reduced motion enabled, edges appear correctly without relying on zoom animation.
- [ ] Tests: relevant suite passes (e.g. `vitest`); new tests added if a stable, non-flaky assertion is practical for this UI.

---

## Open questions for you (granularity)

1. **Phase 1 vs 2**: Should these stay as two phases (visibility first, then kill the bad cycle) or merge into one deployable slice? They touch the same feature surface; merging reduces half-done states but makes the diff larger.
2. **Phase 3**: OK to keep as “cleanup + QA + tests,” or do you want cleanup folded into Phase 2 and a separate testing-only phase?

Reply with merge/split preferences and any rename you want for the plan file; the checklist above can be adjusted in place.
