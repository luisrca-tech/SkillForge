export type SectionId =
  | "hero"
  | "workflow"
  | "context-rot"
  | "skill-grill-me"
  | "skill-write-a-prd"
  | "skill-prd-to-plan"
  | "skill-plan-to-tracker"
  | "skill-do-work"
  | "skill-improve-codebase-architecture"
  | "skill-handle-coderabbit";

export type Section = {
  id: SectionId;
  beats: number;
};

export const SECTIONS: Section[] = [
  { id: "hero", beats: 1 },
  { id: "workflow", beats: 8 },
  { id: "skill-grill-me", beats: 2 },
  { id: "skill-write-a-prd", beats: 2 },
  { id: "skill-prd-to-plan", beats: 2 },
  { id: "skill-plan-to-tracker", beats: 2 },
  { id: "skill-do-work", beats: 2 },
  { id: "skill-improve-codebase-architecture", beats: 2 },
  { id: "skill-handle-coderabbit", beats: 2 },
  { id: "context-rot", beats: 3 },
];

export const DEFAULT_SECTION: SectionId = "hero";

export function findSection(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export function sectionIndex(id: string): number {
  return SECTIONS.findIndex((s) => s.id === id);
}

export type NavState = { sectionId: SectionId; beat: number };

export function advance(state: NavState): NavState {
  const idx = sectionIndex(state.sectionId);
  const section = SECTIONS[idx];
  if (!section) return state;

  if (state.beat < section.beats - 1) {
    return { sectionId: state.sectionId, beat: state.beat + 1 };
  }

  if (idx < SECTIONS.length - 1) {
    return { sectionId: SECTIONS[idx + 1].id, beat: 0 };
  }

  return state;
}

export function retreat(state: NavState): NavState {
  const idx = sectionIndex(state.sectionId);
  if (idx < 0) return state;

  if (state.beat > 0) {
    return { sectionId: state.sectionId, beat: state.beat - 1 };
  }

  if (idx > 0) {
    const prev = SECTIONS[idx - 1];
    return { sectionId: prev.id, beat: prev.beats - 1 };
  }

  return state;
}

export function beatToLocalProgress(beat: number, totalBeats: number): number {
  if (totalBeats <= 1) return 0;
  return (beat * 2 + 1) / (totalBeats * 2);
}
