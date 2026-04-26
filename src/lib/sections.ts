export type SectionId =
  | "hero"
  | "workflow-1"
  | "workflow-2"
  | "workflow-3"
  | "workflow-4"
  | "workflow-5"
  | "workflow-6"
  | "workflow-7"
  | "context-rot"
  | "references"
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
  hidden?: boolean;
};

export const SECTIONS: Section[] = [
  { id: "hero", beats: 1 },
  { id: "workflow-1", beats: 1, hidden: true },
  { id: "skill-grill-me", beats: 1 },
  { id: "workflow-2", beats: 1, hidden: true },
  { id: "skill-write-a-prd", beats: 1 },
  { id: "workflow-3", beats: 1, hidden: true },
  { id: "skill-prd-to-plan", beats: 1 },
  { id: "workflow-4", beats: 1, hidden: true },
  { id: "skill-plan-to-tracker", beats: 1 },
  { id: "workflow-5", beats: 1, hidden: true },
  { id: "skill-do-work", beats: 1 },
  { id: "workflow-6", beats: 1, hidden: true },
  { id: "skill-improve-codebase-architecture", beats: 1 },
  { id: "workflow-7", beats: 1, hidden: true },
  { id: "skill-handle-coderabbit", beats: 1 },
  { id: "context-rot", beats: 2 },
  { id: "references", beats: 1 },
];

export const SECTION_LABELS: Record<SectionId, string> = {
  hero: "Topo",
  "workflow-1": "Workflow",
  "workflow-2": "Workflow",
  "workflow-3": "Workflow",
  "workflow-4": "Workflow",
  "workflow-5": "Workflow",
  "workflow-6": "Workflow",
  "workflow-7": "Workflow",
  "skill-grill-me": "Grill Me",
  "skill-write-a-prd": "PRD",
  "skill-prd-to-plan": "Plan",
  "skill-plan-to-tracker": "Tracker",
  "skill-do-work": "Do Work",
  "skill-improve-codebase-architecture": "Arch",
  "skill-handle-coderabbit": "CR",
  "context-rot": "Context Rot",
  references: "Referências",
};

export const SECTION_GROUP: Record<SectionId, number> = {
  hero: 0,
  "workflow-1": 1,
  "skill-grill-me": 1,
  "workflow-2": 2,
  "skill-write-a-prd": 2,
  "workflow-3": 2,
  "skill-prd-to-plan": 2,
  "workflow-4": 2,
  "skill-plan-to-tracker": 2,
  "workflow-5": 2,
  "skill-do-work": 2,
  "workflow-6": 2,
  "skill-improve-codebase-architecture": 2,
  "workflow-7": 2,
  "skill-handle-coderabbit": 2,
  "context-rot": 3,
  references: 4,
};

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
