import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import TerminalSimulator from "./TerminalSimulator";

interface TerminalLine {
  type: "prompt" | "response" | "divider";
  text: string;
}

interface Scenario {
  id: string;
  label: string;
  lines: TerminalLine[];
}

interface StickySkillSectionProps {
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
}

function useBeatOpacity(
  progress: ReturnType<typeof useScroll>["scrollYProgress"],
  beat: number,
  totalBeats: number,
) {
  const beatSize = 1 / totalBeats;
  const start = beat * beatSize;
  const fadeIn = start + beatSize * 0.3;

  return useTransform(progress, [start, fadeIn], [0, 1]);
}

function useBeatY(
  progress: ReturnType<typeof useScroll>["scrollYProgress"],
  beat: number,
  totalBeats: number,
) {
  const beatSize = 1 / totalBeats;
  const start = beat * beatSize;
  const fadeIn = start + beatSize * 0.3;

  return useTransform(progress, [start, fadeIn], [32, 0]);
}

export default function StickySkillSection({
  name,
  problem,
  skill,
  howItWorks,
  scenarios,
  variant = "default",
}: StickySkillSectionProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end start"],
  });

  const totalBeats = 4;

  const beat0Opacity = useBeatOpacity(scrollYProgress, 0, totalBeats);
  const beat0Y = useBeatY(scrollYProgress, 0, totalBeats);

  const beat1Opacity = useBeatOpacity(scrollYProgress, 1, totalBeats);
  const beat1Y = useBeatY(scrollYProgress, 1, totalBeats);

  const beat2Opacity = useBeatOpacity(scrollYProgress, 2, totalBeats);
  const beat2Y = useBeatY(scrollYProgress, 2, totalBeats);

  const beat3Opacity = useBeatOpacity(scrollYProgress, 3, totalBeats);
  const beat3Y = useBeatY(scrollYProgress, 3, totalBeats);

  const accentText =
    variant === "optional" ? "text-cyan-400" : "text-emerald-400";
  const accentBg =
    variant === "optional" ? "bg-cyan-950/20" : "bg-emerald-950/20";
  const accentBorder =
    variant === "optional" ? "border-cyan-900/30" : "border-emerald-900/30";
  const stepDot = variant === "optional" ? "bg-cyan-400" : "bg-emerald-400";

  return (
    <div ref={outerRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-dvh flex items-center will-change-transform">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 space-y-6 overflow-y-auto max-h-[90vh] py-8">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h2 className="text-3xl sm:text-4xl font-bold">
              <span className={`${accentText} font-mono text-2xl sm:text-3xl`}>
                /{name}
              </span>
            </h2>
            {variant === "optional" && (
              <span className="text-xs uppercase tracking-wider text-cyan-400/70 border border-cyan-400/30 rounded-full px-3 py-1">
                opcional
              </span>
            )}
          </div>

          <motion.div
            style={{ opacity: beat0Opacity, y: beat0Y }}
            className="bg-red-950/20 border border-red-900/30 rounded-2xl p-8 will-change-transform"
          >
            <h3 className="text-lg font-semibold text-red-400 mb-3">
              {problem.title}
            </h3>
            <p className="text-neutral-300 leading-relaxed">
              {problem.description}
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: beat1Opacity, y: beat1Y }}
            className={`${accentBg} border ${accentBorder} rounded-2xl p-8 will-change-transform`}
          >
            <h3 className={`text-lg font-semibold ${accentText} mb-3`}>
              {skill.title}
            </h3>
            <p className="text-neutral-300 leading-relaxed">
              {skill.description}
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: beat2Opacity, y: beat2Y }}
            className="will-change-transform"
          >
            <h3 className="text-lg font-semibold text-neutral-200 mb-4">
              {howItWorks.title}
            </h3>
            <ol className="space-y-3">
              {howItWorks.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className={`${stepDot} text-neutral-950 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-neutral-400">{step}</span>
                </li>
              ))}
            </ol>
          </motion.div>

          <motion.div
            style={{ opacity: beat3Opacity, y: beat3Y }}
            className="will-change-transform"
          >
            <h3 className="text-lg font-semibold text-neutral-200 mb-4">
              Exemplo interativo
            </h3>
            <TerminalSimulator scenarios={scenarios} title={`/${name}`} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
