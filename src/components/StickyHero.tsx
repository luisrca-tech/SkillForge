import { motion } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

export default function StickyHero() {
  return (
    <div className="h-dvh w-full flex flex-col items-center justify-center px-4 sm:px-6 text-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="flex flex-col items-center"
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
          Você pede código à IA sem processo, sem rastreabilidade, sem revisão. O
          resultado? Código frágil, débito técnico invisível e zero aproveitamento
          do potencial real dessas ferramentas.
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
        <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="mt-10">
          <span className="inline-block px-6 py-3 bg-emerald-500/20 text-emerald-400 font-semibold rounded-lg border border-emerald-500/30">
            Scroll para começar
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
