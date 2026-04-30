import { motion } from "motion/react";
import { useLocale } from "../context/LocaleContext";
import type { TranslationKeys } from "../i18n";

const referenceKeys = [
  { id: 1, author: "Chroma", titleKey: "ref.1.title" as TranslationKeys, date: "Jul 2025" },
  { id: 2, author: "ZenML", titleKey: "ref.2.title" as TranslationKeys, date: "2025" },
  { id: 3, author: "Timothy B. Lee", titleKey: "ref.3.title" as TranslationKeys, date: "Nov 2025" },
  { id: 4, author: "Morph", titleKey: "ref.4.title" as TranslationKeys, date: "Mar 2026" },
  { id: 5, author: "Redis", titleKey: "ref.5.title" as TranslationKeys, date: "Jan 2026" },
  { id: 6, author: "Cobus Greyling", titleKey: "ref.6.title" as TranslationKeys, date: "2025" },
  { id: 7, author: "Adaline Labs (Nilesh Barla)", titleKey: "ref.7.title" as TranslationKeys, date: "Ago 2025" },
  { id: 8, author: "arXiv", titleKey: "ref.8.title" as TranslationKeys, date: "Dez 2025" },
  { id: 9, author: "Anthropic / AWS / Azure", titleKey: "ref.9.title" as TranslationKeys, date: "2026" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function ContextRot() {
  const { t } = useLocale();

  return (
    <div className="space-y-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="space-y-12"
      >
        <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            {t("contextRot.heading")}
          </h2>
          <p className="text-neutral-400 text-center max-w-2xl mx-auto text-lg">
            {t("contextRot.subheading")}
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 sm:p-10 space-y-8"
        >
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-emerald-400 mb-4">
              {t("contextRot.whatIsTitle")}
            </h3>
            <p className="text-neutral-300 leading-relaxed mb-4">
              {t("contextRot.whatIsP1Before")}
              <strong className="text-neutral-100">
                {t("contextRot.whatIsP1Strong")}
              </strong>
              {t("contextRot.whatIsP1After")}
            </p>
            <p className="text-neutral-300 leading-relaxed">
              {t("contextRot.whatIsP2Before")}
              <strong className="text-emerald-400">Context Rot</strong>
              {t("contextRot.whatIsP2After")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⚠</span>
              <h4 className="text-lg font-semibold text-red-400">
                {t("contextRot.globalRulesTitle")}
              </h4>
            </div>
            <ul className="space-y-3 text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1 shrink-0">✗</span>
                <span>{t("contextRot.globalRule1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1 shrink-0">✗</span>
                <span>{t("contextRot.globalRule2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1 shrink-0">✗</span>
                <span>{t("contextRot.globalRule3")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1 shrink-0">✗</span>
                <span>{t("contextRot.globalRule4")}</span>
              </li>
            </ul>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⚡</span>
              <h4 className="text-lg font-semibold text-emerald-400">
                {t("contextRot.onDemandTitle")}
              </h4>
            </div>
            <ul className="space-y-3 text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1 shrink-0">✓</span>
                <span>{t("contextRot.onDemand1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1 shrink-0">✓</span>
                <span>{t("contextRot.onDemand2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1 shrink-0">✓</span>
                <span>{t("contextRot.onDemand3")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1 shrink-0">✓</span>
                <span>{t("contextRot.onDemand4")}</span>
              </li>
            </ul>
          </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="space-y-8"
      >
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 sm:p-10 space-y-8"
        >
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-emerald-400 mb-4">
              {t("contextRot.practicalTitle")}
            </h3>
            <p className="text-neutral-300 leading-relaxed mb-4">
              {t("contextRot.practicalP1Before")}
              <code className="text-emerald-400">CLAUDE.md</code>
              {t("contextRot.practicalP1After")}
            </p>
            <p className="text-neutral-300 leading-relaxed mb-4">
              {t("contextRot.practicalP2Before")}
              <strong className="text-neutral-100">
                {t("contextRot.practicalP2Strong")}
              </strong>
              {t("contextRot.practicalP2After")}
            </p>
            <p className="text-neutral-300 leading-relaxed">
              {t("contextRot.practicalP3Before")}
              <em className="text-neutral-200">
                Context Discipline and Performance Correlation
              </em>
              {t("contextRot.practicalP3After")}
            </p>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-emerald-400 mb-6">
              {t("contextRot.analogyTitle")}
            </h3>
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <p className="text-sm uppercase tracking-wider text-red-400 mb-2 font-mono">
                  {t("contextRot.analogyGlobalLabel")}
                </p>
                <p className="text-neutral-300 leading-relaxed">
                  {t("contextRot.analogyGlobalBefore")}
                  <strong className="text-neutral-100">
                    {t("contextRot.analogyGlobalStrong")}
                  </strong>
                  {t("contextRot.analogyGlobalAfter")}
                </p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-emerald-400 mb-2 font-mono">
                  {t("contextRot.analogyOnDemandLabel")}
                </p>
                <p className="text-neutral-300 leading-relaxed">
                  {t("contextRot.analogyOnDemandBefore")}
                  <strong className="text-neutral-100">
                    {t("contextRot.analogyOnDemandStrong")}
                  </strong>
                  {t("contextRot.analogyOnDemandAfter")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={stagger}
        className="space-y-6"
      >
        <motion.h3
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-xl sm:text-2xl font-semibold text-center"
        >
          {t("contextRot.referencesHeading")}
        </motion.h3>
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {referenceKeys.map((ref) => (
            <div
              key={ref.id}
              className="group rounded-xl p-5 border bg-neutral-900/50 border-neutral-800 transition-colors hover:bg-emerald-950/30 hover:border-emerald-800/50"
            >
              <p className="text-sm text-neutral-500 mb-1 font-mono">
                {ref.author}
              </p>
              <p className="text-sm leading-snug text-neutral-300 transition-colors group-hover:text-emerald-300">
                {t(ref.titleKey)}
              </p>
              <p className="text-xs text-neutral-600 mt-2">{ref.date}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
