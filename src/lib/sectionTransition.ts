import { STORY_SECTIONS, type StorySection } from "./scrollSections";

const SECTIONS: StorySection[] = STORY_SECTIONS;

const ENTER_FR = 0.1;
const EXIT_FR = 0.1;

const SCALE_IN = 0.96;
const SCALE_OUT = 0.96;

const OPACITY_CUTOFF = 0.01;

export { ENTER_FR, EXIT_FR };

/**
 * 3t² − 2t³
 */
function smoothstep(t: number) {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

function sectionSpan(s: StorySection) {
  return s.endProgress - s.startProgress;
}

/** Half-width of crossfade seam in global story progress, per boundary. */
export function seamHalfWidth(spanA: number, spanB: number) {
  const s = Math.min(spanA, spanB);
  const raw = Math.min(0.05 * s, 0.05 * spanA, 0.05 * spanB, 0.012);
  return Math.max(raw, 1e-4);
}

function isHeroIndex(i: number) {
  return i === 0;
}

function isLastIndex(i: number) {
  return i === SECTIONS.length - 1;
}

function findSeamInfo(p: number) {
  const pc = Math.min(1, Math.max(0, p));
  for (let j = 0; j < SECTIONS.length - 1; j++) {
    const B = SECTIONS[j + 1].startProgress;
    const spanA = sectionSpan(SECTIONS[j]);
    const spanB = sectionSpan(SECTIONS[j + 1]);
    const d = seamHalfWidth(spanA, spanB);
    if (pc >= B - d && pc <= B + d) {
      const t = (pc - (B - d)) / (2 * d);
      return { boundaryIndex: j, t, leftIndex: j, rightIndex: j + 1 };
    }
  }
  return null;
}

function triOpacityAndScale(
  p: number,
  i: number,
): { opacity: number; scale: number } {
  const pc = Math.min(1, Math.max(0, p));
  const s = SECTIONS[i];
  const start = s.startProgress;
  const end = s.endProgress;
  const span = sectionSpan(s);
  if (span <= 0) {
    return { opacity: 0, scale: 1 };
  }

  const eLen = isHeroIndex(i) ? 0 : ENTER_FR * span;
  const xLen = isLastIndex(i) ? 0 : EXIT_FR * span;
  const last = isLastIndex(i);

  if (pc < start) {
    return { opacity: 0, scale: 1 };
  }
  if (!last && pc >= end) {
    return { opacity: 0, scale: 1 };
  }
  if (last && pc > end) {
    return { opacity: 0, scale: 1 };
  }

  const afterEnter = start + eLen;
  const beforeExit = end - xLen;

  if (eLen > 0 && pc < afterEnter) {
    const t = (pc - start) / eLen;
    return {
      opacity: t,
      scale: SCALE_IN + (1 - SCALE_IN) * t,
    };
  }

  if (xLen > 0 && pc >= beforeExit) {
    const t = (pc - beforeExit) / xLen;
    return {
      opacity: 1 - t,
      scale: 1 - (1 - SCALE_OUT) * t,
    };
  }

  if (pc >= afterEnter && (xLen === 0 || pc < beforeExit)) {
    return { opacity: 1, scale: 1 };
  }

  return { opacity: 0, scale: 1 };
}

function seamOpacityAndScale(
  tRaw: number,
  side: "left" | "right",
): { opacity: number; scale: number } {
  const s = smoothstep(tRaw);
  if (side === "left") {
    const o = 1 - s;
    return { opacity: o, scale: 1 - (1 - SCALE_OUT) * s };
  }
  return { opacity: s, scale: SCALE_IN + (1 - SCALE_IN) * s };
}

export function sectionOpacity(p: number, i: number) {
  const seam = findSeamInfo(p);
  if (seam) {
    if (i === seam.leftIndex) {
      return seamOpacityAndScale(seam.t, "left").opacity;
    }
    if (i === seam.rightIndex) {
      return seamOpacityAndScale(seam.t, "right").opacity;
    }
    return 0;
  }
  return triOpacityAndScale(p, i).opacity;
}

export function sectionScale(p: number, i: number) {
  const seam = findSeamInfo(p);
  if (seam) {
    if (i === seam.leftIndex) {
      return seamOpacityAndScale(seam.t, "left").scale;
    }
    if (i === seam.rightIndex) {
      return seamOpacityAndScale(seam.t, "right").scale;
    }
    return 1;
  }
  return triOpacityAndScale(p, i).scale;
}

/**
 * Stacking: visible layers use 1000 + 100*index; hidden use index only so they stay below.
 */
export function sectionZIndex(p: number, i: number) {
  const o = sectionOpacity(p, i);
  if (o < OPACITY_CUTOFF) {
    return -1;
  }
  return 1000 + 100 * i;
}

const CONTENT_FLOOR = 0.0002;

/**
 * 0 = start of content band, 1 = end (beats), clamped. Hero has no enter band; last has no exit band.
 */
export function contentLocalAt(p: number, i: number) {
  const pc = Math.min(1, Math.max(0, p));
  const s = SECTIONS[i];
  const start = s.startProgress;
  const end = s.endProgress;
  const span = sectionSpan(s);
  const eLen = isHeroIndex(i) ? 0 : ENTER_FR * span;
  const xLen = isLastIndex(i) ? 0 : EXIT_FR * span;
  const from = start + eLen;
  let to = end - xLen;
  if (to <= from) {
    to = from + CONTENT_FLOOR;
  }
  if (pc <= from) {
    return 0;
  }
  if (pc >= to) {
    return 1;
  }
  return (pc - from) / (to - from);
}
