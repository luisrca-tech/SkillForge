import { motion } from "motion/react";
import { useLocale } from "../context/LocaleContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

export default function HeroSection() {
  const { t } = useLocale();

  return (
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
        {t("hero.eyebrow")}
      </motion.p>
      <motion.h1
        variants={fadeUp}
        transition={{ duration: 0.6 }}
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold max-w-4xl leading-tight"
      >
        {t("hero.title")}<span className="text-emerald-400">{t("hero.titleHighlight")}</span>
      </motion.h1>
      <motion.p
        variants={fadeUp}
        transition={{ duration: 0.6 }}
        className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-neutral-400 leading-relaxed"
      >
        {t("hero.description")}
      </motion.p>
      <motion.p
        variants={fadeUp}
        transition={{ duration: 0.6 }}
        className="mt-4 max-w-2xl text-base sm:text-lg md:text-xl text-neutral-300 leading-relaxed"
      >
        {t("hero.value")}
        <strong className="text-emerald-400">{t("hero.valueHighlightWhy")}</strong>
        {t("hero.valueHighlightEnd")}
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
          {t("hero.cta")}
        </a>
      </motion.nav>
    </motion.div>
  );
}
