import { useEffect } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import TerminalSimulator from "./TerminalSimulator";
import { useAnimationObserver } from "../context/AnimationObserverContext";
import { useReducedMotion } from "./AnimatedBeamEdge";

interface TerminalLine {
  type: "prompt" | "response" | "divider";
  text: string;
}

interface Scenario {
  id: string;
  label: string;
  lines: TerminalLine[];
}

export interface StickySkillSectionProps {
  name: string;
  sectionId: string;
  problem: {
    title: string;
    description: string;
  };
  skill: {
    title: string;
    description: string;
  };
  howItWorks: {
    title: string;
    steps: string[];
  };
  scenarios: Scenario[];
  variant?: "default" | "optional";
  contentLocal: MotionValue<number>;
}

export default function StickySkillSection({
  name,
  sectionId,
  problem,
  skill,
  howItWorks,
  scenarios,
  variant = "default",
  contentLocal,
}: StickySkillSectionProps) {
  const { hasPlayed, markPlayed } = useAnimationObserver();
  const reducedMotion = useReducedMotion();
  const skipAnimation = hasPlayed(sectionId) || reducedMotion;

  useEffect(() => {
    if (!skipAnimation) {
      markPlayed(sectionId);
    }
  }, [sectionId, skipAnimation, markPlayed]);
  const accentText =
    variant === "optional" ? "text-cyan-400" : "text-emerald-400";
  const accentBg =
    variant === "optional" ? "bg-cyan-950/20" : "bg-emerald-950/20";
  const accentBorder =
    variant === "optional" ? "border-cyan-900/30" : "border-emerald-900/30";
  const stepDot = variant === "optional" ? "bg-cyan-400" : "bg-emerald-400";

  const titleLock = useTransform(
    contentLocal,
    [0, 0.02],
    [0.96, 1],
    { clamp: true },
  );

  return (
    <div className="h-dvh max-h-dvh w-full flex flex-col min-h-0 overflow-hidden will-change-transform px-4 sm:px-6 pt-4 sm:pt-5 pb-14 pointer-events-none">
      <motion.div
        style={{ opacity: titleLock }}
        className="shrink-0 flex items-center gap-3 mb-2 sm:mb-3 flex-wrap pointer-events-auto"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          <span
            className={`${accentText} font-mono text-xl sm:text-2xl md:text-3xl`}
          >
            /{name}
          </span>
        </h2>
        {variant === "optional" && (
          <span className="text-xs uppercase tracking-wider text-cyan-400/70 border border-cyan-400/30 rounded-full px-3 py-1">
            opcional
          </span>
        )}
      </motion.div>

      <div className="flex-1 min-h-0 flex flex-col w-full max-w-5xl mx-auto pointer-events-auto gap-3 sm:gap-4">
        <div className="shrink-0 grid md:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl min-h-0 overflow-hidden px-3 sm:px-4 py-2 sm:py-2.5">
            <h3 className="text-sm sm:text-base font-semibold text-red-400 mb-0.5 sm:mb-1">
              {problem.title}
            </h3>
            <p className="text-neutral-300 text-xs sm:text-sm leading-snug sm:leading-relaxed">
              {problem.description}
            </p>
          </div>
          <div
            className={`${accentBg} border ${accentBorder} rounded-xl min-h-0 overflow-hidden px-3 sm:px-4 py-2 sm:py-2.5`}
          >
            <h3
              className={`text-sm sm:text-base font-semibold ${accentText} mb-0.5 sm:mb-1`}
            >
              {skill.title}
            </h3>
            <p className="text-neutral-300 text-xs sm:text-sm leading-snug sm:leading-relaxed">
              {skill.description}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <h3 className="text-sm sm:text-base font-semibold text-neutral-200 mb-1.5 sm:mb-2">
            {howItWorks.title}
          </h3>
          <ol className="space-y-1 sm:space-y-1.5">
            {howItWorks.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                <span
                  className={`${stepDot} text-neutral-950 text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5`}
                >
                  {i + 1}
                </span>
                <span className="text-neutral-300 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <h3 className="text-sm sm:text-base font-semibold text-neutral-200 shrink-0">
          Exemplo prático
        </h3>
        <div className="flex-1 min-h-0 overflow-hidden pointer-events-auto">
          <TerminalSimulator scenarios={scenarios} title={`/${name}`} skipAnimation={skipAnimation} />
        </div>
      </div>
    </div>
  );
}
