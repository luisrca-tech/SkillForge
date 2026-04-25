export const TOTAL_STORY_VH = 2800;

type SectionId =
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

export type StorySection = {
  id: SectionId;
  vh: number;
  startProgress: number;
  endProgress: number;
  cumVhStart: number;
};

const ORDER: { id: SectionId; vh: number }[] = [
  { id: "hero", vh: 200 },
  { id: "workflow", vh: 100 },
  { id: "context-rot", vh: 400 },
  { id: "skill-grill-me", vh: 300 },
  { id: "skill-write-a-prd", vh: 300 },
  { id: "skill-prd-to-plan", vh: 300 },
  { id: "skill-plan-to-tracker", vh: 300 },
  { id: "skill-do-work", vh: 300 },
  { id: "skill-improve-codebase-architecture", vh: 300 },
  { id: "skill-handle-coderabbit", vh: 300 },
];

let cum = 0;
export const STORY_SECTIONS: StorySection[] = ORDER.map((o) => {
  const startProgress = cum / TOTAL_STORY_VH;
  cum += o.vh;
  const endProgress = cum / TOTAL_STORY_VH;
  const cumVhStart = cum - o.vh;
  return { id: o.id, vh: o.vh, startProgress, endProgress, cumVhStart };
});
