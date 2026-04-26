# Plan: References Marquee Section

> Source: Grill-me session — 2026-04-26

## Architectural decisions

- **New SectionId**: `"references"` — added after `"context-rot"` in `SECTIONS` array
- **SECTION_GROUP**: group `4` (new group, isolated from context-rot's group `3`)
- **context-rot beats**: reduced from `3` → `2` (beat 2 / "Referências & Estudos" removed)
- **Particles**: `WorkflowParticles` reused with a static `useMotionValue(1)` — no re-render, full speed
- **Marquee**: MagicUI Marquee installed via `npx shadcn@latest add marquee`
- **Card data**: 9 reference objects migrated from `StickyContextRot.tsx` to `ReferencesSection.tsx`

---

## Phase 1: Section wiring

**Covers**: navigation, section registry, footer nav label, context-rot cleanup

### What to build

Wire the new `references` section through all navigation layers so the footer shows a "Referências" nav item that navigates to an (initially empty) section. At the same time, remove beat 2 from `StickyContextRot` so context-rot cleanly ends after beat 1.

Changes:
- `src/lib/sections.ts` — add `"references"` to `SectionId` union, push `{ id: "references", beats: 1 }` to `SECTIONS` after `context-rot`, add label `"Referências"` to `SECTION_LABELS`, add group `4` to `SECTION_GROUP`
- `src/components/StickyContextRot.tsx` — remove `beat2Opacity`, `beat2Y`, the beat 2 `motion.div` block, the `references` data array, and change `TOTAL_BEATS` from `3` to `2`
- `src/components/VerticalScrollPage.tsx` — add `if (sectionId === "references") return <ReferencesSection />;` case in `SectionBody`

### Acceptance criteria

- [ ] Footer nav shows "Referências" item after "Context Rot"
- [ ] Clicking "Referências" navigates to the new section (placeholder renders without crash)
- [ ] context-rot no longer has a 3rd beat — scrolling forward from beat 1 goes to "Referências"
- [ ] No TypeScript errors

---

## Phase 2: References component — Marquee + particles

**Covers**: MagicUI Marquee install, `ReferencesSection.tsx`, particles background

### What to build

Create the full `ReferencesSection` component: full-screen layout with `WorkflowParticles` at full speed in the background, a heading "Referências & Estudos", and two rows of MagicUI Marquee. Row 1 scrolls left (refs 1–9), row 2 scrolls right / `reverse` (refs 1–9 again). Each card shows author (monospace, muted), title (truncated 2 lines, neutral-300), and a `↗` anchor opening in a new tab.

Changes:
- Install: `npx shadcn@latest add marquee` (adds `src/components/ui/marquee.tsx`)
- Create `src/components/ReferencesSection.tsx` with:
  - `useMotionValue(1)` passed to `WorkflowParticles`
  - `<Marquee />` row 1 (no reverse)
  - `<Marquee reverse />` row 2
  - Reference cards as a shared inner component

### Acceptance criteria

- [ ] Section renders with animated emerald/cyan particles at full speed
- [ ] Two rows of cards scroll in opposite directions, looping continuously
- [ ] Each card is clickable — opens the correct URL in a new tab
- [ ] `pauseOnHover` stops animation when hovering a card
- [ ] Cards show: author (muted mono), title (2-line clamp), `↗` link
- [ ] Layout is fully responsive (mobile + desktop)
- [ ] No TypeScript or lint errors
