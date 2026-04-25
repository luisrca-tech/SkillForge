import { motion, useTransform, type MotionValue } from "motion/react";
import TerminalSimulator from "./TerminalSimulator";
import {
  useSubstitutiveBeatOpacity,
  useSubstitutiveBeatY,
} from "../lib/substitutiveBeats";

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

const TOTAL_BEATS = 3;

export default function StickySkillSection({
  name,
  problem,
  skill,
  howItWorks,
  scenarios,
  variant = "default",
  contentLocal,
}: StickySkillSectionProps) {
  const beat0Opacity = useSubstitutiveBeatOpacity(
    contentLocal,
    0,
    TOTAL_BEATS,
  );
  const beat0Y = useSubstitutiveBeatY(contentLocal, 0, TOTAL_BEATS);

  const beat1Opacity = useSubstitutiveBeatOpacity(
    contentLocal,
    1,
    TOTAL_BEATS,
  );
  const beat1Y = useSubstitutiveBeatY(contentLocal, 1, TOTAL_BEATS);

  const beat2Opacity = useSubstitutiveBeatOpacity(
    contentLocal,
    2,
    TOTAL_BEATS,
  );
  const beat2Y = useSubstitutiveBeatY(contentLocal, 2, TOTAL_BEATS);

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
    <div className="h-dvh max-h-dvh w-full flex flex-col min-h-0 overflow-hidden will-change-transform px-4 sm:px-6 py-6 pointer-events-none">
      <motion.div
        style={{ opacity: titleLock }}
        className="shrink-0 flex items-center gap-3 mb-3 flex-wrap pointer-events-auto"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          <span className={`${accentText} font-mono text-xl sm:text-2xl md:text-3xl`}>
            /{name}
          </span>
        </h2>
        {variant === "optional" && (
          <span className="text-xs uppercase tracking-wider text-cyan-400/70 border border-cyan-400/30 rounded-full px-3 py-1">
            opcional
          </span>
        )}
      </motion.div>

      <div className="flex-1 min-h-0 relative w-full max-w-4xl mx-auto pointer-events-auto">
        <motion.div
          style={{ opacity: beat0Opacity, y: beat0Y }}
          className="absolute inset-0 flex flex-col gap-3 min-h-0 will-change-transform"
        >
          <div className="grid md:grid-cols-2 gap-3 min-h-0">
            <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-4 sm:p-6 min-h-0">
              <h3 className="text-base font-semibold text-red-400 mb-2">
                {problem.title}
              </h3>
              <p className="text-neutral-300 text-sm leading-relaxed line-clamp-6 md:line-clamp-8">
                {problem.description}
              </p>
            </div>
            <div
              className={`${accentBg} border ${accentBorder} rounded-2xl p-4 sm:p-6 min-h-0`}
            >
              <h3 className={`text-base font-semibold ${accentText} mb-2`}>
                {skill.title}
              </h3>
              <p className="text-neutral-300 text-sm leading-relaxed line-clamp-6 md:line-clamp-8">
                {skill.description}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: beat1Opacity, y: beat1Y }}
          className="absolute inset-0 flex flex-col min-h-0 justify-center will-change-transform"
        >
          <h3 className="text-base sm:text-lg font-semibold text-neutral-200 mb-3 shrink-0">
            {howItWorks.title}
          </h3>
          <ol className="space-y-2 min-h-0">
            {howItWorks.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm sm:text-base">
                <span
                  className={`${stepDot} text-neutral-950 text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5`}
                >
                  {i + 1}
                </span>
                <span className="text-neutral-400 leading-relaxed">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </motion.div>

        <motion.div
          style={{ opacity: beat2Opacity, y: beat2Y }}
          className="absolute inset-0 flex flex-col min-h-0 will-change-transform"
        >
          <h3 className="text-base sm:text-lg font-semibold text-neutral-200 mb-2 shrink-0">
            Exemplo interativo
          </h3>
          <div className="flex-1 min-h-0 max-h-full overflow-hidden pointer-events-auto">
            <TerminalSimulator scenarios={scenarios} title={`/${name}`} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
