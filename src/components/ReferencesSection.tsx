import { useMotionValue } from "motion/react";
import { Marquee } from "./ui/marquee";
import WorkflowParticles from "./WorkflowParticles";

const REFERENCES = [
  {
    id: 1,
    author: "Chroma",
    title: "Context Rot: How Increasing Input Tokens Impacts LLM Performance",
    url: "https://www.trychroma.com/research/context-rot",
  },
  {
    id: 2,
    author: "ZenML",
    title: "LLMOps Database — Resumo do estudo da Chroma",
    url: "https://www.zenml.io/llmops-database/context-rot-evaluating-llm-performance-degradation-with-increasing-input-tokens",
  },
  {
    id: 3,
    author: "Timothy B. Lee",
    title: "Understanding AI — Análise de degradação em janelas longas",
    url: "https://www.understandingai.org/p/why-large-language-models-struggle",
  },
  {
    id: 4,
    author: "Morph",
    title: "Context Rot — Guia completo de prevenção e mitigação",
    url: "https://www.morphllm.com/context-rot",
  },
  {
    id: 5,
    author: "Redis",
    title: "Estratégias de prevenção de Context Rot em produção",
    url: "https://redis.io/en/blog/context-rot/",
  },
  {
    id: 6,
    author: "Cobus Greyling",
    title: "Análise prática de Context Rot em aplicações LLM",
    url: "https://cobusgreyling.medium.com/llm-context-rot-28a6d0399655",
  },
  {
    id: 7,
    author: "Adaline Labs (Nilesh Barla)",
    title: "Impacto do context length na qualidade de outputs",
    url: "https://labs.adaline.ai/p/context-rot-why-llms-are-getting",
  },
  {
    id: 8,
    author: "arXiv (Liu et al.)",
    title: "Lost in the Middle: How LMs Use Long Contexts",
    url: "https://arxiv.org/abs/2307.03172",
  },
  {
    id: 9,
    author: "Anthropic / AWS / Azure",
    title: "Claude Opus 4.7 — Janela de 1M tokens e boas práticas",
    url: "https://www.anthropic.com/news/1m-context",
  },
];

function ReferenceCard({
  author,
  title,
  url,
}: {
  author: string;
  title: string;
  url: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col w-56 sm:w-64 shrink-0 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 transition-colors hover:border-emerald-800/60 hover:bg-emerald-950/20"
    >
      <p className="mb-1 font-mono text-[11px] text-neutral-500 line-clamp-1">
        {author}
      </p>
      <p className="flex-1 text-xs sm:text-sm leading-snug text-neutral-300 line-clamp-2 transition-colors group-hover:text-emerald-300">
        {title}
      </p>
      <span className="mt-2 text-xs text-neutral-600 transition-colors group-hover:text-emerald-500">
        ↗
      </span>
    </a>
  );
}

export default function ReferencesSection() {
  const fullSpeed = useMotionValue(1);
  return (
    <div className="relative h-dvh max-h-dvh w-full flex flex-col items-center justify-center overflow-hidden">
      <WorkflowParticles contentLocal={fullSpeed} />

      <div className="relative z-10 w-full flex flex-col items-center gap-6 sm:gap-8 px-4 pointer-events-none">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Referências &amp; Estudos
          </h2>
          <p className="mt-1.5 text-sm text-neutral-400 max-w-lg mx-auto">
            A ciência por trás das Skills on-demand e Context Rot.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3 pointer-events-auto">
          <Marquee pauseOnHover className="[--duration:35s]">
            {REFERENCES.map((ref) => (
              <ReferenceCard key={ref.id} {...ref} />
            ))}
          </Marquee>

          <Marquee reverse pauseOnHover className="[--duration:35s]">
            {REFERENCES.map((ref) => (
              <ReferenceCard key={ref.id} {...ref} />
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
}
