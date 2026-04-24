# Plan: SkillForge Landing Page

> Source PRD: `plans/skillforge.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: Single-page landing at `/`. All internal navigation uses anchor links (`#hero`, `#workflow`, `#context-rot`, `#skill-grill-me`, etc.)
- **Component model**: Astro page (`index.astro`) with React islands. React Flow uses `client:only="react"`. Animated sections use `client:visible` for lazy hydration.
- **Animation library**: Motion (framer-motion) — `<motion.div>` inside React island components rendered via `client:visible` in Astro
- **Styling**: Tailwind CSS v4 via Vite plugin. Dark mode is the only mode (`bg-neutral-950 text-neutral-100` base). No toggle.
- **Diagram**: `@xyflow/react` v12 for the interactive workflow diagram
- **Terminal simulator**: Custom React component with typewriter effect and clickable scenario tabs
- **Content**: All copy hardcoded in components/data files. No CMS, no content collections.
- **Language**: pt-BR only, no i18n
- **Deploy**: Vercel with static Astro build

---

## Phase 1: Page Layout & Hero

**User stories**: 1, 22

### What to build

The full page skeleton with all section anchors (`#hero`, `#workflow`, `#context-rot`, and one `#skill-*` per skill) so that anchor navigation works from day one. The hero section gets its final copy — a punchy headline and 3-4 line manifesto contrasting vibe coding vs. structured workflow. The page uses the existing dark theme and is responsive from the start.

### Acceptance criteria

- [x] Page has all section landmarks with correct anchor IDs
- [x] Hero section displays headline and manifesto text
- [x] Page is responsive (mobile, tablet, desktop)
- [x] Dark theme applied globally
- [x] Smooth scroll behavior enabled for anchor links

---

## Phase 2: Workflow Diagram (React Flow)

**User stories**: 2, 4, 18

### What to build

A React Flow diagram rendered as an Astro React island (`client:only="react"`). It shows 7 main skill nodes in a linear flow (`grill-me → write-a-prd → prd-to-plan → do-work → improve-codebase-architecture → handle-coderabbit`) plus an optional branch node (`plan-to-tracker`) with visually distinct styling (dashed border or different color). Clicking any node smooth-scrolls to its corresponding section. The diagram animates into view (nodes appear progressively) when it enters the viewport.

### Acceptance criteria

- [x] React Flow renders 7+1 nodes with edges in correct order
- [x] `plan-to-tracker` node has visually distinct optional styling
- [x] Clicking a node scrolls to the matching `#skill-*` section
- [x] Diagram has a build-in animation when entering the viewport
- [x] Diagram is readable on mobile (horizontal scroll or responsive layout)

---

## Phase 3: Context Rot Science Section

**User stories**: 3, 16, 17

### What to build

The "A ciencia por tras" section explaining Context Rot — why LLM performance degrades in the 80k-120k token range, and why on-demand skills are more efficient than global rules in the context window. Include references to the studies listed in the PRD (Chroma, ZenML, arXiv, etc.). Use Motion for scroll-triggered entrance animations.

### Acceptance criteria

- [x] Section explains Context Rot concept accessibly
- [x] Section argues skills-on-demand vs. global rules with technical depth
- [x] At least 5 references to real studies/sources from the PRD
- [x] Entrance animations trigger on scroll via Motion
- [x] Section is responsive

---

## Phase 4: Skill Section Template & First Two Skills (grill-me, write-a-prd)

**User stories**: 8, 9, 10, 23

### What to build

A reusable skill section layout that follows the template: "O problema" → "A skill" → "Como funciona" → "Exemplo interativo". Build the terminal simulator React component — a dark-themed box with monospace font, typewriter text effect, and clickable tabs to switch between pre-recorded scenarios. Implement the full sections for `grill-me` and `write-a-prd` using this template and terminal component.

### Acceptance criteria

- [x] Skill section layout is consistent and reusable
- [x] Terminal simulator component renders with dark theme, monospace font, neon colors
- [x] Terminal has typewriter text effect
- [x] Terminal supports clickable tabs to switch between scenarios
- [x] `grill-me` section has complete copy and at least 2 terminal scenarios
- [x] `write-a-prd` section has complete copy and at least 2 terminal scenarios
- [x] Sections have scroll-triggered entrance animations via Motion

---

## Phase 5: Remaining Skills (plan-to-tracker, prd-to-plan, do-work)

**User stories**: 11, 12, 13

### What to build

Apply the skill section template and terminal simulator to three more skills: `plan-to-tracker` (marked as optional step), `prd-to-plan`, and `do-work`. Each gets its own copy, terminal scenarios, and entrance animations. `plan-to-tracker` should have visual cues indicating it's an optional step in the workflow.

### Acceptance criteria

- [x] `plan-to-tracker` section complete with optional-step visual indicator
- [x] `prd-to-plan` section complete with copy and terminal scenarios
- [x] `do-work` section complete with copy and terminal scenarios
- [x] All three sections follow the established template
- [x] All three have scroll-triggered entrance animations

---

## Phase 6: Final Skills (improve-codebase-architecture, handle-coderabbit)

**User stories**: 14, 15

### What to build

Apply the skill section template to the last two skills: `improve-codebase-architecture` (positioned as code review) and `handle-coderabbit` (integrating automated feedback from CodeRabbit/GitHub Copilot). Each gets complete copy and terminal scenarios.

### Acceptance criteria

- [x] `improve-codebase-architecture` section complete with copy and terminal scenarios
- [x] `handle-coderabbit` section complete with copy and terminal scenarios
- [x] Both follow the established template
- [x] Both have scroll-triggered entrance animations

---

## Phase 7: Polish — Animations, Responsiveness & Performance

**User stories**: 7, 19, 21

### What to build

Full animation polish pass across all sections (consistent Motion entrance animations, smooth transitions). Mobile responsiveness audit and fixes. Footer section. Lighthouse performance audit — ensure the site scores well despite React islands and animations. Optimize bundle size if needed (lazy loading, code splitting).

### Acceptance criteria

- [ ] All sections have consistent, smooth scroll-triggered animations
- [ ] Site is fully responsive and functional on mobile devices
- [ ] Footer is present
- [ ] Lighthouse performance score >= 90
- [ ] No layout shifts or animation jank on mobile
- [ ] Total JS bundle size is reasonable for a static landing page
