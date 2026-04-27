## Problem Statement

The workflow section displays skill nodes as static rectangular boxes (e.g. `/grill-me`, `/write-a-prd`) floating over an animated particle/atom background. Despite the background being rich with motion — 850 particles, constellation lines, orbiting atoms — the nodes themselves feel disconnected and inert. There is no visual bridge between the living background and the functional UI elements, making the experience feel like two separate layers instead of a cohesive interactive environment.

Users scrolling through the workflow see beautiful ambient motion but have no way to interact with individual nodes beyond clicking them. The nodes don't acknowledge the user's presence, which misses an opportunity to create a sense of discovery and tactile feedback.

## Solution

Enhance the workflow skill nodes with two interconnected behaviors:

1. **Pulsating glow aura** — Each node gains a multi-layered `box-shadow` that "breathes" in its idle state (~3-4s cycle), giving nodes a living presence that matches the animated background. On hover, the glow intensifies and expands, then gradually relaxes back to idle even while the cursor remains.

2. **Particle attraction on hover** — When the cursor enters a node, nearby particles (within ~4-5 Three.js units) gently curve their trajectory toward the node, creating a gravitational pull effect. Constellation lines naturally densify in the region as particles converge. After ~4-5 seconds the attraction dissipates and particles return to normal flow, even if the cursor stays. On cursor exit, the effect fades with a slow ~600ms ease-out.

**Critical constraint:** The glow and particle effects must never obscure or reduce the readability of the skill name text inside the node. The text must remain the primary visual element at all times.

## User Stories

1. As a visitor, I want nodes to have a subtle pulsating glow in their idle state, so that they feel alive and visually connected to the animated particle background.
2. As a visitor, I want the glow to use the same color language as the particles (emerald for default skills, cyan for optional), so that the visual system feels cohesive.
3. As a visitor, I want the glow to consist of multiple layered shadows (2-3 layers), so that the aura has depth and gradient rather than a flat halo.
4. As a visitor, I want the glow pulse cycle to be slow (~3-4 seconds), so that it feels organic and doesn't distract from reading the skill names.
5. As a visitor, I want to clearly read the skill name text at all times regardless of the glow state, so that the functional purpose of the node is never compromised.
6. As a visitor, I want the node glow to intensify and expand when I hover over it (~200ms transition), so that I get immediate feedback that the node is interactive.
7. As a visitor, I want nearby particles to gently curve their trajectory toward the hovered node, so that the node feels like it has gravitational presence in the particle field.
8. As a visitor, I want constellation lines to naturally densify around the hovered node as particles converge, so that the attraction effect has visual richness beyond just moving dots.
9. As a visitor, I want the particle attraction to affect a medium radius (~4-5 Three.js units) around the node, so that the effect is noticeable without emptying neighboring regions.
10. As a visitor, I want the particle attraction to be a gentle trajectory curve (not accumulation or orbit), so that particles maintain their natural flow and don't block the node text.
11. As a visitor, I want the attraction effect to gradually dissipate after ~4-5 seconds even while hovering, so that the effect feels like a momentary acknowledgment rather than a permanent state change.
12. As a visitor, I want the glow to relax back toward idle along with the particles after ~4-5 seconds, but stay slightly brighter than normal idle while hover is active, so that there is still a subtle indication the cursor is present.
13. As a visitor, I want the exit transition to be slow (~600ms), so that the glow and particles relax gracefully rather than snapping off.
14. As a visitor, I want the entry transition to be fast (~200ms), so that the node feels responsive to my presence.
15. As a visitor, I want the atoms (nucleus, electrons, orbit rings) to remain unaffected by hover, so that they keep their independent rhythm and the scene doesn't feel overloaded.
16. As a visitor, I want the experience to perform smoothly at 60fps, so that the hover interactions don't cause jank or frame drops.
17. As a visitor on mobile/touch, I want the idle glow pulsation to still be visible, so that the nodes feel alive even without hover capability.

## Implementation Decisions

### Glow System (CSS/Framer Motion)

- The glow is implemented via Framer Motion (`motion.div` with animated `boxShadow`) inside the existing `SkillNode` component.
- Idle state: 2-3 layered `box-shadow` values pulsating via a Framer Motion animation loop (~3-4s cycle, ease-in-out).
- Hover state: shadows intensify (higher opacity) and expand (larger blur/spread) with ~200ms transition.
- Exit state: shadows return to idle with ~600ms transition (asymmetric timing).
- Hover relaxation: after ~4-5s of continuous hover, glow animates back toward idle but retains a slightly elevated intensity. Implemented via a timeout + `useAnimation` controls.
- Color scheme follows existing convention: emerald (`#34d399` / `#6ee7b7`) for default nodes, cyan (`#22d3ee` / `#67e8f9`) for optional nodes.
- The glow layers must use sufficient blur spread to appear behind/around the node without overlapping the text area. Text `z-index` or `position: relative` ensures text stays on top.

### Particle Attraction (Three.js)

- Communication between DOM (SkillNode hover state) and WebGL (particle system) uses a shared `useRef` — no React state, no re-renders.
- The ref holds: `{ position: {x, y} | null, startTime: number }` where position is in Three.js units and startTime tracks when hover began.
- Coordinate conversion: `getBoundingClientRect()` of the hovered node, normalized to viewport, then mapped to Three.js space using existing `X_RANGE` (12) and `Y_RANGE` (7) constants.
- In the `useFrame` loop, each particle checks distance to the hovered node position. If within the attraction radius (~4-5 units), a gentle force vector is added to the particle's velocity, scaled by `1 - (distance / radius)` for smooth falloff.
- The attraction force decays over time: after `startTime`, the force multiplier lerps from 1.0 to 0.0 over ~4-5 seconds.
- Constellation lines require no special handling — they already connect particles within `CONNECTION_DISTANCE`, so particle convergence naturally creates denser line clusters.
- On hover exit, the ref position is set to `null`. Particles that were being attracted resume normal velocity. The ~600ms ease-out is handled by lerping the force to zero rather than snapping.

### Architecture

- `WorkflowLayer` (in `VerticalScrollPage.tsx`) creates the shared ref and passes it down to both `WorkflowDiagram` (which writes to it) and `WorkflowParticlesCanvas` (which reads from it). This follows the existing pattern used for `contentLocal` and `warp`.
- No changes to node layout, positioning constants, edge definitions, or React Flow configuration in `WorkflowDiagram`. Only the `SkillNode` component's visual presentation and event handlers are modified.
- The `WorkflowDiagram` component's layout, styling, and constants must not be altered (per project constraint). The glow and hover logic live entirely within `SkillNode`.

### Mobile

- Hover effects (glow expansion + particle attraction) are cursor-only. No `onTouchStart` substitute for now.
- The idle pulsating glow is visible on all devices since it requires no interaction.

## Out of Scope

- Touch/tap interaction on mobile as a hover substitute.
- Atom reactions to hover (atoms keep their independent animation).
- Changes to node shape, size, layout grid, or edge connections.
- Click behavior or navigation from nodes.
- Changes to the particle system outside of the attraction behavior (particle count, colors, base speed, etc.).
- Warp/zoom interaction changes — the existing warp behavior during zoom transitions remains untouched.

## Further Notes

- Performance should be validated on lower-end devices. The per-frame distance check for 850 particles against 1 node position is O(n) and should be negligible, but worth profiling.
- The attraction radius (~4-5 units) should be tuned visually once implemented — the exact value may need adjustment based on how the effect looks relative to node spacing in the grid (nodes are separated by ~3.7 units horizontally).
- The glow layers' exact blur/spread/opacity values will need visual tuning to ensure text readability is never compromised. The inner-most shadow layer should have minimal spread to avoid bleeding into the text area.
- Future enhancement: consider a subtle particle "burst" effect when a node first appears during the staggered reveal sequence.
