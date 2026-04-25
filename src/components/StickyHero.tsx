import { motion, useTransform, type MotionValue } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

type StickyHeroProps = {
  localProgress: MotionValue<number>;
};

export default function StickyHero({ localProgress }: StickyHeroProps) {
  const opacity = useTransform(localProgress, [0.3, 0.8], [1, 0]);
  const scale = useTransform(localProgress, [0.3, 0.8], [1, 0.92]);

  return (
    <div className="h-dvh w-full flex flex-col items-center justify-center px-4 sm:px-6 text-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        style={{ opacity, scale }}
        className="flex flex-col items-center will-change-transform"
      >
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="text-sm uppercase tracking-widest text-emerald-400 mb-4 font-mono"
        >
          AI Coding Workflow
        </motion.p>
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold max-w-4xl leading-tight"
        >
          Pare de fazer <span className="text-emerald-400">vibe coding.</span>
        </motion.h1>
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-neutral-400 leading-relaxed"
        >
          Você pede código à IA sem processo, sem rastreabilidade, sem revisão.
          O resultado? Código frágil, débito técnico invisível e zero
          aproveitamento do potencial real dessas ferramentas.
        </motion.p>
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-4 max-w-2xl text-base sm:text-lg md:text-xl text-neutral-300 leading-relaxed"
        >
          Este é um workflow completo de desenvolvimento assistido por IA — da
          concepção da feature ao code review — com embasamento técnico sobre{" "}
          <strong className="text-emerald-400">por que</strong> essa abordagem
          funciona melhor.
        </motion.p>
        <motion.nav
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-10"
        >
          <a
            href="#workflow"
            className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold rounded-lg transition-colors"
          >
            Conhecer o workflow
          </a>
        </motion.nav>
      </motion.div>
    </div>
  );
}
