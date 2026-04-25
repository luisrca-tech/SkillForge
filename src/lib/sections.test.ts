import { describe, it, expect } from "vitest";
import {
  advance,
  retreat,
  beatToLocalProgress,
  findSection,
  sectionIndex,
  SECTIONS,
} from "./sections";

describe("findSection", () => {
  it("returns the section for a valid id", () => {
    const s = findSection("context-rot");
    expect(s).toEqual({ id: "context-rot", beats: 3 });
  });

  it("returns undefined for an invalid id", () => {
    expect(findSection("nope")).toBeUndefined();
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
    expect(sectionIndex("context-rot")).toBe(SECTIONS.length - 1);
  });
});

describe("advance", () => {
  it("advances beat within a multi-beat section", () => {
    const result = advance({ sectionId: "context-rot", beat: 0 });
    expect(result).toEqual({ sectionId: "context-rot", beat: 1 });
  });

  it("stays put on last beat of last section (context-rot)", () => {
    const result = advance({ sectionId: "context-rot", beat: 2 });
    expect(result).toEqual({ sectionId: "context-rot", beat: 2 });
  });

  it("advances single-beat section to next section", () => {
    const result = advance({ sectionId: "hero", beat: 0 });
    expect(result).toEqual({ sectionId: "workflow", beat: 0 });
  });

  it("advances workflow beat 0 to beat 1", () => {
    const result = advance({ sectionId: "workflow", beat: 0 });
    expect(result).toEqual({ sectionId: "workflow", beat: 1 });
  });

  it("advances workflow last beat to first skill", () => {
    const result = advance({ sectionId: "workflow", beat: 7 });
    expect(result).toEqual({ sectionId: "skill-grill-me", beat: 0 });
  });

  it("advances last skill (single-beat) to context-rot", () => {
    const result = advance({ sectionId: "skill-handle-coderabbit", beat: 0 });
    expect(result).toEqual({ sectionId: "context-rot", beat: 0 });
  });
});

describe("retreat", () => {
  it("retreats beat within a multi-beat section", () => {
    const result = retreat({ sectionId: "context-rot", beat: 2 });
    expect(result).toEqual({ sectionId: "context-rot", beat: 1 });
  });

  it("retreats to previous section last beat when on beat 0 (skill after workflow)", () => {
    const result = retreat({ sectionId: "skill-grill-me", beat: 0 });
    expect(result).toEqual({ sectionId: "workflow", beat: 7 });
  });

  it("stays put on first beat of first section", () => {
    const result = retreat({ sectionId: "hero", beat: 0 });
    expect(result).toEqual({ sectionId: "hero", beat: 0 });
  });

  it("retreats from workflow to hero last beat", () => {
    const result = retreat({ sectionId: "workflow", beat: 0 });
    expect(result).toEqual({ sectionId: "hero", beat: 0 });
  });

  it("retreats from context-rot beat 0 to last skill (single-beat)", () => {
    const result = retreat({ sectionId: "context-rot", beat: 0 });
    expect(result).toEqual({ sectionId: "skill-handle-coderabbit", beat: 0 });
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

  it("maps beat 0 of 2 to 1/4", () => {
    expect(beatToLocalProgress(0, 2)).toBeCloseTo(1 / 4);
  });

  it("maps beat 1 of 2 to 3/4", () => {
    expect(beatToLocalProgress(1, 2)).toBeCloseTo(3 / 4);
  });

});
