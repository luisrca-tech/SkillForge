import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

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
  const outerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0.3, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.3, 0.8], [1, 0.92]);

  return (
    <div ref={outerRef} className="relative h-[200vh]">
      <div className="sticky top-0 h-dvh flex flex-col items-center justify-center px-4 sm:px-6 text-center">
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
            SkillForge
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
            SkillForge é um workflow completo de desenvolvimento assistido por IA
            — da concepção da feature ao code review — com embasamento técnico
            sobre{" "}
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
    </div>
  );
}
