import { describe, it, expect } from "vitest";
import {
  advance,
  retreat,
  beatToLocalProgress,
  findSection,
  sectionIndex,
  SECTIONS,
  type SectionId,
} from "./sections";

describe("section array structure", () => {
  it("contains 17 sections in total", () => {
    expect(SECTIONS).toHaveLength(17);
  });

  it("starts with hero and ends with references", () => {
    expect(SECTIONS[0].id).toBe("hero");
    expect(SECTIONS[SECTIONS.length - 1].id).toBe("references");
  });

  it("interleaves workflow-N before each skill section", () => {
    const expected: SectionId[] = [
      "hero",
      "workflow-1",
      "skill-grill-me",
      "workflow-2",
      "skill-write-a-prd",
      "workflow-3",
      "skill-prd-to-plan",
      "workflow-4",
      "skill-plan-to-tracker",
      "workflow-5",
      "skill-do-work",
      "workflow-6",
      "skill-improve-codebase-architecture",
      "workflow-7",
      "skill-handle-coderabbit",
      "context-rot",
      "references",
    ];
    expect(SECTIONS.map((s) => s.id)).toEqual(expected);
  });

  it("all workflow-N sections have 1 beat and hidden: true", () => {
    const workflowSections = SECTIONS.filter((s) => s.id.startsWith("workflow-"));
    expect(workflowSections).toHaveLength(7);
    for (const s of workflowSections) {
      expect(s.beats).toBe(1);
      expect(s.hidden).toBe(true);
    }
  });

  it("skill sections and hero/context-rot/references are not hidden", () => {
    const visible = SECTIONS.filter((s) => !s.id.startsWith("workflow-"));
    for (const s of visible) {
      expect(s.hidden).toBeUndefined();
    }
  });

  it("context-rot has 2 beats", () => {
    expect(findSection("context-rot")).toEqual({ id: "context-rot", beats: 2 });
  });

  it("references has 1 beat", () => {
    expect(findSection("references")).toEqual({ id: "references", beats: 1 });
  });
});

describe("findSection", () => {
  it("returns the section for a valid id", () => {
    const s = findSection("context-rot");
    expect(s).toMatchObject({ id: "context-rot", beats: 2 });
  });

  it("finds workflow-4", () => {
    const s = findSection("workflow-4");
    expect(s).toMatchObject({ id: "workflow-4", beats: 1, hidden: true });
  });

  it("returns undefined for an invalid id", () => {
    expect(findSection("nope")).toBeUndefined();
  });

  it("returns undefined for removed workflow id", () => {
    expect(findSection("workflow")).toBeUndefined();
  });
});

describe("sectionIndex", () => {
  it("returns 0 for hero", () => {
    expect(sectionIndex("hero")).toBe(0);
  });

  it("returns -1 for unknown id", () => {
    expect(sectionIndex("unknown")).toBe(-1);
  });

  it("returns correct index for last section", () => {
    expect(sectionIndex("references")).toBe(SECTIONS.length - 1);
  });

  it("returns 1 for workflow-1", () => {
    expect(sectionIndex("workflow-1")).toBe(1);
  });
});

describe("advance", () => {
  it("advances hero to workflow-1", () => {
    expect(advance({ sectionId: "hero", beat: 0 })).toEqual({
      sectionId: "workflow-1",
      beat: 0,
    });
  });

  it("advances workflow-1 to skill-grill-me", () => {
    expect(advance({ sectionId: "workflow-1", beat: 0 })).toEqual({
      sectionId: "skill-grill-me",
      beat: 0,
    });
  });

  it("advances skill-grill-me to workflow-2", () => {
    expect(advance({ sectionId: "skill-grill-me", beat: 0 })).toEqual({
      sectionId: "workflow-2",
      beat: 0,
    });
  });

  it("advances workflow-N to skill-N for all pairs", () => {
    const pairs: [SectionId, SectionId][] = [
      ["workflow-1", "skill-grill-me"],
      ["workflow-2", "skill-write-a-prd"],
      ["workflow-3", "skill-prd-to-plan"],
      ["workflow-4", "skill-plan-to-tracker"],
      ["workflow-5", "skill-do-work"],
      ["workflow-6", "skill-improve-codebase-architecture"],
      ["workflow-7", "skill-handle-coderabbit"],
    ];
    for (const [from, to] of pairs) {
      expect(advance({ sectionId: from, beat: 0 })).toEqual({
        sectionId: to,
        beat: 0,
      });
    }
  });

  it("advances last skill to context-rot", () => {
    expect(advance({ sectionId: "skill-handle-coderabbit", beat: 0 })).toEqual({
      sectionId: "context-rot",
      beat: 0,
    });
  });

  it("advances beat within context-rot", () => {
    expect(advance({ sectionId: "context-rot", beat: 0 })).toEqual({
      sectionId: "context-rot",
      beat: 1,
    });
  });

  it("advances context-rot beat 1 to references", () => {
    expect(advance({ sectionId: "context-rot", beat: 1 })).toEqual({
      sectionId: "references",
      beat: 0,
    });
  });

  it("stays put on last beat of last section", () => {
    expect(advance({ sectionId: "references", beat: 0 })).toEqual({
      sectionId: "references",
      beat: 0,
    });
  });
});

describe("retreat", () => {
  it("stays put on hero beat 0", () => {
    expect(retreat({ sectionId: "hero", beat: 0 })).toEqual({
      sectionId: "hero",
      beat: 0,
    });
  });

  it("retreats workflow-1 to hero", () => {
    expect(retreat({ sectionId: "workflow-1", beat: 0 })).toEqual({
      sectionId: "hero",
      beat: 0,
    });
  });

  it("retreats skill-grill-me to workflow-1", () => {
    expect(retreat({ sectionId: "skill-grill-me", beat: 0 })).toEqual({
      sectionId: "workflow-1",
      beat: 0,
    });
  });

  it("retreats workflow-2 to skill-grill-me", () => {
    expect(retreat({ sectionId: "workflow-2", beat: 0 })).toEqual({
      sectionId: "skill-grill-me",
      beat: 0,
    });
  });

  it("retreats symmetrically for all pairs", () => {
    const pairs: [SectionId, SectionId][] = [
      ["skill-grill-me", "workflow-1"],
      ["workflow-2", "skill-grill-me"],
      ["skill-write-a-prd", "workflow-2"],
      ["workflow-3", "skill-write-a-prd"],
      ["skill-prd-to-plan", "workflow-3"],
      ["workflow-4", "skill-prd-to-plan"],
      ["skill-plan-to-tracker", "workflow-4"],
      ["workflow-5", "skill-plan-to-tracker"],
      ["skill-do-work", "workflow-5"],
      ["workflow-6", "skill-do-work"],
      ["skill-improve-codebase-architecture", "workflow-6"],
      ["workflow-7", "skill-improve-codebase-architecture"],
      ["skill-handle-coderabbit", "workflow-7"],
    ];
    for (const [from, to] of pairs) {
      expect(retreat({ sectionId: from, beat: 0 })).toEqual({
        sectionId: to,
        beat: 0,
      });
    }
  });

  it("retreats context-rot beat 0 to last skill", () => {
    expect(retreat({ sectionId: "context-rot", beat: 0 })).toEqual({
      sectionId: "skill-handle-coderabbit",
      beat: 0,
    });
  });

  it("retreats within context-rot multi-beat", () => {
    expect(retreat({ sectionId: "context-rot", beat: 1 })).toEqual({
      sectionId: "context-rot",
      beat: 0,
    });
  });

  it("retreats references to context-rot last beat", () => {
    expect(retreat({ sectionId: "references", beat: 0 })).toEqual({
      sectionId: "context-rot",
      beat: 1,
    });
  });
});

describe("beatToLocalProgress", () => {
  it("returns 0 for single-beat sections", () => {
    expect(beatToLocalProgress(0, 1)).toBe(0);
  });

  it("maps beat 0 of 3 to 1/6", () => {
    expect(beatToLocalProgress(0, 3)).toBeCloseTo(1 / 6);
  });

  it("maps beat 1 of 3 to 3/6", () => {
    expect(beatToLocalProgress(1, 3)).toBeCloseTo(3 / 6);
  });

  it("maps beat 2 of 3 to 5/6", () => {
    expect(beatToLocalProgress(2, 3)).toBeCloseTo(5 / 6);
  });
});
