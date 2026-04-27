import { motion, useTransform, type MotionValue } from "motion/react";
import {
  useSubstitutiveBeatOpacity,
  useSubstitutiveBeatY,
} from "../lib/substitutiveBeats";

const TOTAL_BEATS = 2;

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

  const titleLock = useTransform(
    contentLocal,
    [0, 0.02, 0.6667, 0.7267],
    [0.96, 1, 1, 0],
    { clamp: true },
  );

  return (
    <div className="box-border h-dvh max-h-dvh w-full flex flex-col min-h-0 overflow-hidden will-change-transform px-4 sm:px-6 pt-2 sm:pt-4 pb-16 sm:pb-[4.5rem] pointer-events-none">
      <motion.div
        style={{ opacity: titleLock }}
        className="shrink-0 text-center mb-0.5 sm:mb-1.5 pointer-events-auto"
      >
        <h2 className="text-base sm:text-xl md:text-2xl font-bold leading-tight">
          A Ciência por Trás
        </h2>
        <p className="text-neutral-400 text-[10px] sm:text-xs max-w-2xl mx-auto mt-0.5 line-clamp-2 leading-snug sm:leading-normal">
          Por que skills on-demand são mais eficientes que regras globais na
          janela de contexto dos LLMs.
        </p>
      </motion.div>

      <div className="flex-1 min-h-0 relative w-full max-w-4xl mx-auto pointer-events-auto">
        <motion.div
          style={{ opacity: beat0Opacity, y: beat0Y }}
          className="absolute inset-0 flex flex-col justify-center min-h-0 will-change-transform"
        >
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl min-h-0 max-h-full overflow-y-auto overflow-x-hidden px-2.5 sm:px-4 md:px-5 py-2 sm:py-3.5 md:py-4 flex flex-col gap-2 sm:gap-4 md:gap-5">
            <div className="space-y-1.5 sm:space-y-2.5">
              <h3 className="text-xs sm:text-base md:text-lg font-semibold text-emerald-400">
                O que é Context Rot?
              </h3>
              <p className="text-neutral-300 text-[11px] sm:text-sm md:text-[0.9375rem] leading-snug sm:leading-relaxed">
                LLMs como Claude, GPT e Gemini possuem janelas de contexto cada vez
                maiores — 128k, 200k, até 1M tokens. Mas{" "}
                <strong className="text-neutral-100">
                  maior janela não significa melhor performance
                </strong>
                . Estudos mostram que a qualidade das respostas degrada
                significativamente quando o input ultrapassa a faixa de 80k–120k
                tokens.
              </p>
              <p className="text-neutral-300 text-[11px] sm:text-sm md:text-[0.9375rem] leading-snug sm:leading-relaxed">
                Esse fenômeno é chamado de{" "}
                <strong className="text-emerald-400">Context Rot</strong>: quanto
                mais informação irrelevante ou redundante é empurrada para a janela
                de contexto, pior o modelo se sai em tarefas que exigem precisão.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-1.5 sm:gap-3 md:gap-4 text-[11px] sm:text-sm shrink-0">
              <div className="bg-red-950/20 border border-red-900/30 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2.5">
                <div className="flex items-center gap-1 mb-0.5 sm:mb-1.5">
                  <span className="text-sm sm:text-lg leading-none">⚠</span>
                  <h4 className="text-[11px] sm:text-sm md:text-base font-semibold text-red-400 leading-tight">
                    Regras Globais (CLAUDE.md gigante)
                  </h4>
                </div>
                <ul className="space-y-0.5 sm:space-y-1.5 text-neutral-400 leading-snug sm:leading-normal">
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
              <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2.5">
                <div className="flex items-center gap-1 mb-0.5 sm:mb-1.5">
                  <span className="text-sm sm:text-lg leading-none">⚡</span>
                  <h4 className="text-[11px] sm:text-sm md:text-base font-semibold text-emerald-400 leading-tight">
                    Skills On-Demand
                  </h4>
                </div>
                <ul className="space-y-0.5 sm:space-y-1.5 text-neutral-400 leading-snug sm:leading-normal">
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
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: beat1Opacity, y: beat1Y }}
          className="absolute inset-0 flex flex-col justify-center min-h-0 will-change-transform"
        >
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl min-h-0 max-h-full overflow-y-auto overflow-x-hidden px-2.5 sm:px-4 md:px-5 py-2 sm:py-3.5 md:py-4 flex flex-col gap-2 sm:gap-4 md:gap-5">
            <div className="space-y-1.5 sm:space-y-2.5">
              <h3 className="text-xs sm:text-base md:text-lg font-semibold text-emerald-400">
                Por que isso importa na prática?
              </h3>
              <p className="text-neutral-300 text-[11px] sm:text-sm md:text-[0.9375rem] leading-snug sm:leading-relaxed">
                Um{" "}
                <code className="text-emerald-400">CLAUDE.md</code> enorme
                consome os tokens mais valiosos — os primeiros. O contexto já está
                parcialmente &quot;podre&quot; com instruções que não se aplicam à
                tarefa.
              </p>
              <p className="text-neutral-300 text-[11px] sm:text-sm md:text-[0.9375rem] leading-snug sm:leading-relaxed">
                A pesquisa da Chroma (2025) demonstrou perda de até{" "}
                <strong className="text-neutral-100">
                  30% de precisão em retrieval
                </strong>{" "}
                com contexto irrelevante, mesmo dentro do limite técnico. Menos
                lixo, melhor resultado.
              </p>
            </div>
            <div className="space-y-1.5 sm:space-y-2.5">
              <h4 className="text-[11px] sm:text-sm md:text-base font-semibold text-emerald-400/90">
                A analogia
              </h4>
              <div className="grid sm:grid-cols-2 gap-1.5 sm:gap-3 md:gap-4 text-[11px] sm:text-sm">
                <div className="bg-red-950/20 border border-red-900/30 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2.5">
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-red-400 mb-1 font-mono">
                    Regras Globais
                  </p>
                  <p className="text-neutral-300 leading-snug sm:leading-relaxed">
                    Reunião com{" "}
                    <strong className="text-neutral-100">
                      todos os documentos de todos os projetos
                    </strong>
                    . A informação relevante existe, mas enterrada em ruído.
                  </p>
                </div>
                <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2.5">
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-emerald-400 mb-1 font-mono">
                    Skills On-Demand
                  </p>
                  <p className="text-neutral-300 leading-snug sm:leading-relaxed">
                    Apenas o{" "}
                    <strong className="text-neutral-100">briefing relevante</strong>{" "}
                    para aquela pauta. Foco total.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
