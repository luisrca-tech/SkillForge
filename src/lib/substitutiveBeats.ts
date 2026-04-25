import { useTransform, type MotionValue } from "motion/react";

export function useSubstitutiveBeatOpacity(
  localProgress: MotionValue<number>,
  beatIndex: number,
  totalBeats: number,
) {
  return useTransform(localProgress, (p) => {
    const a = beatIndex / totalBeats;
    const b = (beatIndex + 1) / totalBeats;
    const w = b - a;
    const t = Math.max(0.04, 0.18 * w);
    if (p <= a) {
      return beatIndex === 0 ? 1 : 0;
    }
    if (p < a + t) {
      return beatIndex === 0 ? 1 : (p - a) / t;
    }
    if (p < b - t) {
      return 1;
    }
    if (p < b) {
      return (b - p) / t;
    }
    return 0;
  });
}

export function useSubstitutiveBeatY(
  localProgress: MotionValue<number>,
  beatIndex: number,
  totalBeats: number,
) {
  return useTransform(localProgress, (p) => {
    const a = beatIndex / totalBeats;
    const b = (beatIndex + 1) / totalBeats;
    const w = b - a;
    const t = Math.max(0.04, 0.18 * w);
    if (p < a) {
      return beatIndex === 0 ? 0 : 16;
    }
    if (p < a + t) {
      return beatIndex === 0 ? 0 : 16 * (1 - (p - a) / t);
    }
    if (p < b - t) {
      return 0;
    }
    if (p < b) {
      return 16 * (1 - (b - p) / t);
    }
    return 16;
  });
}
