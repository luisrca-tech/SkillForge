import { motion } from "motion/react";
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

interface SkillSectionProps {
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

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

export default function SkillSection({
  name,
  problem,
  skill,
  howItWorks,
  scenarios,
  variant = "default",
}: SkillSectionProps) {
  const accentColor = variant === "optional" ? "cyan" : "emerald";
  const accentText = variant === "optional" ? "text-cyan-400" : "text-emerald-400";
  const accentBg = variant === "optional" ? "bg-cyan-950/20" : "bg-emerald-950/20";
  const accentBorder = variant === "optional" ? "border-cyan-900/30" : "border-emerald-900/30";
  const stepDot = variant === "optional" ? "bg-cyan-400" : "bg-emerald-400";

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={stagger}
      className="space-y-10"
    >
      <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
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
      </motion.div>

      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.6 }}
        className="bg-red-950/20 border border-red-900/30 rounded-2xl p-8"
      >
        <h3 className="text-lg font-semibold text-red-400 mb-3">
          {problem.title}
        </h3>
        <p className="text-neutral-300 leading-relaxed">{problem.description}</p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.6 }}
        className={`${accentBg} border ${accentBorder} rounded-2xl p-8`}
      >
        <h3 className={`text-lg font-semibold ${accentText} mb-3`}>
          {skill.title}
        </h3>
        <p className="text-neutral-300 leading-relaxed">{skill.description}</p>
      </motion.div>

      <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
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

      <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
        <h3 className="text-lg font-semibold text-neutral-200 mb-4">
          Exemplo interativo
        </h3>
        <TerminalSimulator
          scenarios={scenarios}
          title={`/${name}`}
        />
      </motion.div>
    </motion.div>
  );
}
