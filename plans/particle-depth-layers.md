# Plan: Particle Depth Layers (Constellation Lines + Atom Structures)

> Source PRD: Grill-me session — adding visual depth to the particle background in references/workflow sections

## Architectural decisions

- **Rendering layer**: All new visuals live inside `WorkflowParticlesCanvas.tsx`, rendered as sibling components to the existing `<Particles>` within the same `<Canvas>`
- **Props contract**: The existing `contentLocal` (MotionValue) and `warp` (boolean) props are passed down to new components — no new props on the public API
- **Responsive breakpoints**: Atom count scales with viewport width detected via `window.innerWidth` on mount: mobile (<768px): 3, md (768–1023px): 5, lg (1024–1535px): 7, 2xl (≥1536px): 10
- **Color palette**: Same emerald (#34d399) / cyan (#22d3ee) palette used throughout — no new colors
- **Z-depth layering**: Foreground particles Z -4 to 0 (unchanged), atoms Z -5 to -3

---

## Phase 1: Constellation Lines

**User stories**: Sparse, transient connecting lines between nearby foreground particles that fade in/out based on distance, creating geometric structure without visual noise

### What to build

Add a `<ConstellationLines>` component inside the Canvas that reads the existing particle positions each frame and draws line segments between particles within a 1.2-unit distance threshold. Each particle connects to at most 3 neighbors. Line opacity ranges from 0.12 (touching) to 0 (at threshold), using the source particle's color (emerald or cyan). A spatial grid partitions the field to keep neighbor lookups performant with 850 particles — avoiding O(n²) brute force on every frame.

### Acceptance criteria

- [ ] Lines appear between particles closer than 1.2 units
- [ ] Each particle has at most 3 connections
- [ ] Line opacity fades from 0.12 → 0 as distance approaches 1.2
- [ ] Line color matches the source particle (emerald or cyan)
- [ ] Lines update every frame as particles drift
- [ ] No perceptible frame drop on mobile devices (spatial grid optimization in place)
- [ ] Lines use additive blending consistent with existing particles

---

## Phase 2: Background Atom Structures

**User stories**: Minimal/geometric atom diagrams floating in the deep background to create parallax depth — a nucleus dot, thin orbit rings, and small electron dots tracing the rings

### What to build

Add an `<Atoms>` component that renders a responsive number of atom structures at Z -5 to -3. Each atom consists of: a glowing nucleus dot (3–5px, opacity 0.10–0.15), 1–2 circular orbit rings (radius 0.3–0.7 units, 1px stroke, opacity 0.05–0.08), and 1–2 electron dots (2px, opacity 0.12) tracing the rings at a slow constant speed. Atoms are distributed via grid-jittered placement: the field is divided into cells based on atom count, each atom placed at a random offset within its cell. Atoms drift horizontally at 20% of the main particle speed and rotate slowly (0.1–0.3 rad/s). Atom count adapts to viewport width on mount: 3 (mobile), 5 (md), 7 (lg), 10 (2xl).

### Acceptance criteria

- [ ] Atoms render behind the foreground particles (Z -5 to -3)
- [ ] Each atom has a visible nucleus, orbit ring(s), and orbiting electron(s)
- [ ] Atom count matches the responsive breakpoint (3/5/7/10)
- [ ] Atoms are evenly distributed (no clumping) via grid-jittered placement
- [ ] Atoms drift horizontally at ~20% of main particle speed
- [ ] Each atom slowly rotates on its own axis
- [ ] Camera parallax tilt affects atoms less than foreground particles (natural depth separation)
- [ ] Visual style is minimal/geometric — faint, ghost-like, not attention-grabbing

---

## Phase 3: Atom Warp Response

**User stories**: Atoms subtly acknowledge workflow skill transitions — electrons speed up and a brief opacity pulse fires, synced with the existing warp timing

### What to build

When the `warp` prop becomes true, atoms react with two subtle effects: electron orbit speed increases to 1.5x their normal rate (lerped smoothly like the existing particle warp), and the entire atom group receives a brief opacity pulse (e.g., opacity multiplier spikes to 1.5x then decays back over ~500ms matching the warp transition). When warp ends, electrons return to normal speed. The nucleus, orbit rings, and drift speed remain unaffected — only electrons and opacity respond.

### Acceptance criteria

- [ ] Electron orbit speed increases to 1.5x during warp
- [ ] Speed transition is smooth (lerped), not instant
- [ ] A brief opacity pulse is visible on warp activation
- [ ] Opacity returns to normal within ~500ms
- [ ] Nucleus size, orbit ring radius, and drift speed are unaffected by warp
- [ ] The warp response feels subtle — noticeable if you look, but not distracting
