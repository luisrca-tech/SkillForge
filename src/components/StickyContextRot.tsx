import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

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

export default function StickyContextRot() {
  const outerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end start"],
  });

  const totalBeats = 5;

  const beat0Opacity = useBeatOpacity(scrollYProgress, 0, totalBeats);
  const beat0Y = useBeatY(scrollYProgress, 0, totalBeats);

  const beat1Opacity = useBeatOpacity(scrollYProgress, 1, totalBeats);
  const beat1Y = useBeatY(scrollYProgress, 1, totalBeats);

  const beat2Opacity = useBeatOpacity(scrollYProgress, 2, totalBeats);
  const beat2Y = useBeatY(scrollYProgress, 2, totalBeats);

  const beat3Opacity = useBeatOpacity(scrollYProgress, 3, totalBeats);
  const beat3Y = useBeatY(scrollYProgress, 3, totalBeats);

  const beat4Opacity = useBeatOpacity(scrollYProgress, 4, totalBeats);
  const beat4Y = useBeatY(scrollYProgress, 4, totalBeats);

  return (
    <div ref={outerRef} className="relative h-[500vh]">
      <div className="sticky top-0 h-dvh flex items-center will-change-transform">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 space-y-6 overflow-y-auto max-h-[90vh] py-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-2">
            A Ciência por Trás
          </h2>
          <p className="text-neutral-400 text-center max-w-2xl mx-auto text-lg mb-4">
            Por que skills on-demand são mais eficientes que regras globais na
            janela de contexto dos LLMs.
          </p>

          <motion.div
            style={{ opacity: beat0Opacity, y: beat0Y }}
            className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 sm:p-10 will-change-transform"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-emerald-400 mb-4">
              O que é Context Rot?
            </h3>
            <p className="text-neutral-300 leading-relaxed mb-4">
              LLMs como Claude, GPT e Gemini possuem janelas de contexto cada vez
              maiores — 128k, 200k, até 1M tokens. Mas{" "}
              <strong className="text-neutral-100">
                maior janela não significa melhor performance
              </strong>
              . Estudos mostram que a qualidade das respostas degrada
              significativamente quando o input ultrapassa a faixa de 80k–120k
              tokens.
            </p>
            <p className="text-neutral-300 leading-relaxed">
              Esse fenômeno é chamado de{" "}
              <strong className="text-emerald-400">Context Rot</strong>: quanto
              mais informação irrelevante ou redundante é empurrada para a janela
              de contexto, pior o modelo se sai em tarefas que exigem precisão —
              como gerar código, seguir instruções complexas ou manter coerência em
              conversas longas.
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: beat1Opacity, y: beat1Y }}
            className="grid md:grid-cols-2 gap-6 will-change-transform"
          >
            <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚠</span>
                <h4 className="text-lg font-semibold text-red-400">
                  Regras Globais (CLAUDE.md gigante)
                </h4>
              </div>
              <ul className="space-y-3 text-neutral-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1 shrink-0">✗</span>
                  <span>
                    Todas as instruções carregadas em toda interação, mesmo quando
                    irrelevantes
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1 shrink-0">✗</span>
                  <span>
                    Consome tokens do contexto antes mesmo da sua primeira
                    mensagem
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1 shrink-0">✗</span>
                  <span>
                    Instruções conflitantes se acumulam e confundem o modelo
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1 shrink-0">✗</span>
                  <span>
                    Performance degrada à medida que o arquivo de regras cresce
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚡</span>
                <h4 className="text-lg font-semibold text-emerald-400">
                  Skills On-Demand
                </h4>
              </div>
              <ul className="space-y-3 text-neutral-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1 shrink-0">✓</span>
                  <span>
                    Apenas a skill relevante é carregada na hora que você precisa
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1 shrink-0">✓</span>
                  <span>
                    Contexto limpo e focado — o modelo sabe exatamente o que fazer
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1 shrink-0">✓</span>
                  <span>
                    Sem conflito entre instruções — cada skill é autocontida
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1 shrink-0">✓</span>
                  <span>
                    Escala sem degradação — adicione novas skills sem poluir o
                    contexto
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            style={{ opacity: beat2Opacity, y: beat2Y }}
            className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 sm:p-10 will-change-transform"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-emerald-400 mb-4">
              Por que isso importa na prática?
            </h3>
            <p className="text-neutral-300 leading-relaxed mb-4">
              Um arquivo <code className="text-emerald-400">CLAUDE.md</code> com
              centenas de regras parece organizado — mas na realidade está
              consumindo os tokens mais valiosos da janela de contexto: os
              primeiros. Quando você pede ao modelo para implementar uma feature, o
              contexto já está parcialmente "podre" com instruções que não se
              aplicam àquela tarefa.
            </p>
            <p className="text-neutral-300 leading-relaxed mb-4">
              A pesquisa da Chroma (2025) demonstrou que modelos perdem até{" "}
              <strong className="text-neutral-100">
                30% de precisão em tarefas de retrieval
              </strong>{" "}
              quando o contexto é preenchido com informação irrelevante, mesmo que
              esteja dentro do limite técnico da janela.
            </p>
            <p className="text-neutral-300 leading-relaxed">
              O paper do arXiv sobre{" "}
              <em className="text-neutral-200">
                Context Discipline and Performance Correlation
              </em>{" "}
              reforça: disciplina no que entra na janela de contexto tem correlação
              direta com a qualidade do output. Menos lixo, melhor resultado.
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: beat3Opacity, y: beat3Y }}
            className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 sm:p-10 will-change-transform"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-emerald-400 mb-6">
              A analogia
            </h3>
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <p className="text-sm uppercase tracking-wider text-red-400 mb-2 font-mono">
                  Regras Globais
                </p>
                <p className="text-neutral-300 leading-relaxed">
                  É como entrar em uma reunião carregando{" "}
                  <strong className="text-neutral-100">
                    todos os documentos de todos os projetos
                  </strong>{" "}
                  da empresa. A informação relevante existe, mas está enterrada em
                  ruído. Você gasta mais tempo procurando do que decidindo.
                </p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-emerald-400 mb-2 font-mono">
                  Skills On-Demand
                </p>
                <p className="text-neutral-300 leading-relaxed">
                  É como entrar na reunião com{" "}
                  <strong className="text-neutral-100">
                    apenas o briefing relevante
                  </strong>{" "}
                  para aquela pauta. Foco total, decisões rápidas, zero distração.
                  Exatamente o que o modelo precisa para performar.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            style={{ opacity: beat4Opacity, y: beat4Y }}
            className="will-change-transform"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-center mb-6">
              Referências & Estudos
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {references.map((ref) => (
                <div
                  key={ref.id}
                  className={`rounded-xl p-5 border transition-colors ${
                    ref.highlight
                      ? "bg-emerald-950/30 border-emerald-800/50"
                      : "bg-neutral-900/50 border-neutral-800"
                  }`}
                >
                  <p className="text-sm text-neutral-500 mb-1 font-mono">
                    {ref.author}
                  </p>
                  <p
                    className={`text-sm leading-snug ${
                      ref.highlight ? "text-emerald-300" : "text-neutral-300"
                    }`}
                  >
                    {ref.title}
                  </p>
                  <p className="text-xs text-neutral-600 mt-2">{ref.date}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
