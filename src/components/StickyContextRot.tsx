import { motion, useTransform, type MotionValue } from "motion/react";
import {
  useSubstitutiveBeatOpacity,
  useSubstitutiveBeatY,
} from "../lib/substitutiveBeats";

const references = [
  {
    id: 1,
    author: "Chroma",
    title: "Context Rot: How Increasing Input Tokens Impacts LLM Performance",
    date: "Jul 2025",
    highlight: true,
  },
  {
    id: 2,
    author: "ZenML",
    title: "LLMOps Database — Resumo do estudo da Chroma",
    date: "2025",
  },
  {
    id: 3,
    author: "Timothy B. Lee",
    title: "Understanding AI — Análise de degradação em janelas longas",
    date: "Nov 2025",
  },
  {
    id: 4,
    author: "Morph",
    title: "Context Rot — Guia completo de prevenção e mitigação",
    date: "Mar 2026",
  },
  {
    id: 5,
    author: "Redis",
    title: "Estratégias de prevenção de Context Rot em produção",
    date: "Jan 2026",
  },
  {
    id: 6,
    author: "Cobus Greyling",
    title: "Análise prática de Context Rot em aplicações LLM",
    date: "2025",
  },
  {
    id: 7,
    author: "Adaline Labs (Nilesh Barla)",
    title: "Impacto do context length na qualidade de outputs",
    date: "Ago 2025",
  },
  {
    id: 8,
    author: "arXiv",
    title: "Context Discipline and Performance Correlation",
    date: "Dez 2025",
  },
  {
    id: 9,
    author: "Anthropic / AWS / Azure",
    title: "Claude Opus 4.7 — Janela de 1M tokens e boas práticas",
    date: "2026",
  },
];

const TOTAL_BEATS = 5;

type StickyContextRotProps = {
  contentLocal: MotionValue<number>;
};

export default function StickyContextRot({ contentLocal }: StickyContextRotProps) {
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
  const beat3Opacity = useSubstitutiveBeatOpacity(
    contentLocal,
    3,
    TOTAL_BEATS,
  );
  const beat3Y = useSubstitutiveBeatY(contentLocal, 3, TOTAL_BEATS);
  const beat4Opacity = useSubstitutiveBeatOpacity(
    contentLocal,
    4,
    TOTAL_BEATS,
  );
  const beat4Y = useSubstitutiveBeatY(contentLocal, 4, TOTAL_BEATS);

  const titleLock = useTransform(
    contentLocal,
    [0, 0.02],
    [0.96, 1],
    { clamp: true },
  );

  return (
    <div className="h-dvh max-h-dvh w-full flex flex-col min-h-0 overflow-hidden will-change-transform px-4 sm:px-6 py-4 pointer-events-none">
      <motion.div
        style={{ opacity: titleLock }}
        className="shrink-0 text-center mb-2 pointer-events-auto"
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
          A Ciência por Trás
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm max-w-2xl mx-auto mt-1 line-clamp-2">
          Por que skills on-demand são mais eficientes que regras globais na
          janela de contexto dos LLMs.
        </p>
      </motion.div>

      <div className="flex-1 min-h-0 relative w-full max-w-4xl mx-auto pointer-events-auto">
        <motion.div
          style={{ opacity: beat0Opacity, y: beat0Y }}
          className="absolute inset-0 flex flex-col justify-center will-change-transform overflow-hidden"
        >
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 sm:p-6 min-h-0">
            <h3 className="text-base sm:text-lg font-semibold text-emerald-400 mb-2">
              O que é Context Rot?
            </h3>
            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mb-2 line-clamp-4 sm:line-clamp-none">
              LLMs como Claude, GPT e Gemini possuem janelas de contexto cada vez
              maiores — 128k, 200k, até 1M tokens. Mas{" "}
              <strong className="text-neutral-100">
                maior janela não significa melhor performance
              </strong>
              . Estudos mostram que a qualidade das respostas degrada
              significativamente quando o input ultrapassa a faixa de 80k–120k
              tokens.
            </p>
            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
              Esse fenômeno é chamado de{" "}
              <strong className="text-emerald-400">Context Rot</strong>: quanto
              mais informação irrelevante ou redundante é empurrada para a janela
              de contexto, pior o modelo se sai em tarefas que exigem precisão.
            </p>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: beat1Opacity, y: beat1Y }}
          className="absolute inset-0 flex flex-col justify-center min-h-0 will-change-transform"
        >
            <div className="grid md:grid-cols-2 gap-2 min-h-0 text-xs sm:text-sm">
            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3 sm:p-4 min-h-0 overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⚠</span>
                <h4 className="text-sm font-semibold text-red-400">
                  Regras Globais (CLAUDE.md gigante)
                </h4>
              </div>
              <ul className="space-y-1.5 text-neutral-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 shrink-0">✗</span>
                  <span>
                    Todas as instruções carregadas em toda interação, mesmo quando
                    irrelevantes
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 shrink-0">✗</span>
                  <span>
                    Consome tokens do contexto antes mesmo da sua primeira
                    mensagem
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 shrink-0">✗</span>
                  <span>Instruções conflitantes se acumulam</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 shrink-0">✗</span>
                  <span>Performance degrada à medida que o arquivo cresce</span>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-3 sm:p-4 min-h-0 overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⚡</span>
                <h4 className="text-sm font-semibold text-emerald-400">
                  Skills On-Demand
                </h4>
              </div>
              <ul className="space-y-1.5 text-neutral-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 shrink-0">✓</span>
                  <span>
                    Apenas a skill relevante é carregada na hora que você
                    precisa
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 shrink-0">✓</span>
                  <span>Contexto limpo e focado</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 shrink-0">✓</span>
                  <span>Sem conflito entre instruções</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 shrink-0">✓</span>
                  <span>Adicione skills sem poluir o contexto</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: beat2Opacity, y: beat2Y }}
          className="absolute inset-0 flex flex-col justify-center will-change-transform overflow-hidden"
        >
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-3 sm:p-5 min-h-0">
            <h3 className="text-base sm:text-lg font-semibold text-emerald-400 mb-2">
              Por que isso importa na prática?
            </h3>
            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mb-2">
              Um{" "}
              <code className="text-emerald-400">CLAUDE.md</code> enorme
              consome os tokens mais valiosos — os primeiros. O contexto já está
              parcialmente &quot;podre&quot; com instruções que não se aplicam à
              tarefa.
            </p>
            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mb-2">
              A pesquisa da Chroma (2025) demonstrou perda de até{" "}
              <strong className="text-neutral-100">
                30% de precisão em retrieval
              </strong>{" "}
              com contexto irrelevante, mesmo dentro do limite técnico.
            </p>
            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
              Menos lixo, melhor resultado.
            </p>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: beat3Opacity, y: beat3Y }}
          className="absolute inset-0 flex flex-col justify-center will-change-transform"
        >
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-3 sm:p-5 min-h-0">
            <h3 className="text-base sm:text-lg font-semibold text-emerald-400 mb-2">
              A analogia
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-red-400 mb-1 font-mono">
                  Regras Globais
                </p>
                <p className="text-neutral-300 leading-relaxed">
                  Reunião com{" "}
                  <strong className="text-neutral-100">
                    todos os documentos de todos os projetos
                  </strong>
                  . A informação relevante existe, mas enterrada em ruído.
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-1 font-mono">
                  Skills On-Demand
                </p>
                <p className="text-neutral-300 leading-relaxed">
                  Apenas o{" "}
                  <strong className="text-neutral-100">briefing relevante</strong>{" "}
                  para aquela pauta. Foco total.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: beat4Opacity, y: beat4Y }}
          className="absolute inset-0 flex flex-col min-h-0 will-change-transform"
        >
          <h3 className="text-sm sm:text-base font-semibold text-center mb-2 shrink-0">
            Referências & Estudos
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 min-h-0 overflow-hidden">
            {references.map((ref) => (
              <div
                key={ref.id}
                className={`rounded-lg p-2 sm:p-2.5 border ${
                  ref.highlight
                    ? "bg-emerald-950/30 border-emerald-800/50"
                    : "bg-neutral-900/50 border-neutral-800"
                }`}
              >
                <p className="text-[10px] text-neutral-500 mb-0.5 font-mono line-clamp-1">
                  {ref.author}
                </p>
                <p
                  className={`text-[10px] sm:text-xs leading-snug line-clamp-3 ${
                    ref.highlight ? "text-emerald-300" : "text-neutral-300"
                  }`}
                >
                  {ref.title}
                </p>
                <p className="text-[9px] text-neutral-600 mt-0.5">{ref.date}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
