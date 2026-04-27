# Plan: Interactive Workflow Nodes

> Source PRD: `plans/prd-interactive-workflow-nodes.md`

## Architectural decisions

- **Shared ref pattern**: A `MutableRefObject` created in `WorkflowLayer` is passed down to both `WorkflowDiagram` (writer) and `WorkflowParticlesCanvas` (reader). This mirrors the existing prop-drilling pattern used for `contentLocal` and `warp`. The ref shape is `{ position: { x: number; y: number } | null; startTime: number }` where position is in Three.js units.
- **Coordinate mapping**: DOM pixel coordinates from `getBoundingClientRect()` are converted to Three.js space using the existing `X_RANGE` (12) and `Y_RANGE` (7) constants. The node center is normalized to viewport then mapped to `[-X_RANGE, +X_RANGE]` horizontally and `[-Y_RANGE, +Y_RANGE]` vertically.
- **SkillNode constraint**: Per project rules, `WorkflowDiagram` layout, styling constants, and positioning logic must not be modified. All glow/hover changes live inside `SkillNode`'s inner rendering and event handlers only.
- **Animation stack**: Framer Motion (`motion.div` + `useAnimation`) for the glow system. Three.js `useFrame` for particle attraction. No React state for the cross-layer communication — ref only.
- **Color tokens**: Emerald (`#34d399`, `#6ee7b7`) for default nodes, Cyan (`#22d3ee`, `#67e8f9`) for optional nodes — matching existing particle and node color conventions.

---

## Phase 1: Pulsating Glow on Idle Nodes

**User stories**: #1, #2, #3, #4, #5, #17

### What to build

Each `SkillNode` gains a living, breathing aura. The outer container becomes a `motion.div` with a multi-layered `box-shadow` (2-3 layers: one tight/bright, one wide/diffuse) that animates in a slow pulsation cycle (~3-4s, ease-in-out, infinite loop). Emerald shadows for default skills, cyan for optional. The text must remain fully readable at all times — the glow sits behind the node content via layering, and the innermost shadow layer avoids bleeding into the text area. The pulsation is purely visual — no hover interaction yet. Visible on all devices including mobile.

### Acceptance criteria

- [ ] Every default skill node has a pulsating emerald box-shadow aura (2-3 layers)
- [ ] The optional skill node (`/plan-to-tracker`) has a pulsating cyan box-shadow aura
- [ ] The pulsation cycle is ~3-4 seconds, smooth ease-in-out, looping infinitely
- [ ] Skill name text remains fully legible at peak glow intensity — no visual bleed
- [ ] The glow uses Framer Motion animation (not CSS keyframes)
- [ ] No layout shifts — node dimensions and positions unchanged
- [ ] Visible on mobile viewports (idle glow is not hover-dependent)

---

## Phase 2: Hover Glow Expansion + Shared Ref Infrastructure

**User stories**: #6, #12, #13, #14

### What to build

Wire up the full hover lifecycle for the glow and build the communication bridge to the particle canvas. On `mouseenter`, the glow intensifies and expands (~200ms ease-in). After ~4-5 seconds of continuous hover, the glow gradually relaxes back toward idle but stays slightly brighter than normal idle to indicate the cursor is still present. On `mouseleave`, the glow eases back to idle over ~600ms. A shared ref is created in `WorkflowLayer` and threaded down to both `WorkflowDiagram` and `WorkflowParticlesCanvas`. The `SkillNode` writes the hovered node's center position (converted to Three.js coordinates) and a start timestamp into the ref on hover, and clears it on leave. The `WorkflowParticlesCanvas` receives the ref as a prop but does not act on it yet — that comes in Phase 3.

### Acceptance criteria

- [ ] Hover triggers glow intensification + expansion with ~200ms transition
- [ ] Mouse leave triggers glow relaxation with ~600ms transition (asymmetric)
- [ ] After ~4-5s of continuous hover, glow relaxes toward idle but stays slightly elevated
- [ ] Shared ref is created in `WorkflowLayer` and passed to both diagram and particle canvas
- [ ] `SkillNode` writes `{ position: {x, y}, startTime }` to ref on hover (Three.js coordinates)
- [ ] `SkillNode` sets position to `null` on mouse leave
- [ ] No React re-renders triggered by hover — communication is ref-only
- [ ] No changes to node layout, grid constants, or edge definitions in `WorkflowDiagram`

---

## Phase 3: Particle Gravitational Attraction + Constellation Densification

**User stories**: #7, #8, #9, #10, #11, #15, #16

### What to build

The particle system reads the shared ref in its `useFrame` loop. When a node is hovered, particles within ~4-5 Three.js units of the node position receive a gentle force vector curving their trajectory toward the node. The force scales with proximity (`1 - distance/radius`) and decays over ~4-5 seconds using the ref's `startTime`. Particles maintain their natural horizontal flow — the attraction is a soft deflection, not accumulation or orbit. Constellation lines naturally densify around the node as particles converge (the existing spatial grid already handles this). If the density effect is too subtle, connection opacity or distance can be locally boosted near the hovered position. On hover exit (ref position becomes `null`), the attraction force lerps to zero rather than snapping, providing a gradual release. Atoms remain completely unaffected.

### Acceptance criteria

- [ ] Particles within ~4-5 units of a hovered node visibly curve toward it
- [ ] The attraction is a gentle deflection — particles do not stop, accumulate, or orbit
- [ ] The attraction force decays over ~4-5 seconds of continuous hover, matching glow relaxation
- [ ] Constellation lines visibly densify around the hovered node area
- [ ] On mouse leave, particles smoothly return to normal flow (no snap)
- [ ] Atoms (nucleus, electrons, orbit rings) are completely unaffected by hover
- [ ] Particle attraction never obscures node text (force is outward-facing, not covering)
- [ ] Smooth 60fps performance maintained during hover interactions
- [ ] No regressions to existing particle behavior (base speed, warp, scroll-driven reveals)
