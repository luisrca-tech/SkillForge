interface TerminalLine {
  type: "prompt" | "response" | "divider";
  text: string;
}

interface Scenario {
  id: string;
  label: string;
  lines: TerminalLine[];
}

interface SkillData {
  name: string;
  variant?: "default" | "optional";
  problem: { title: string; description: string };
  skill: { title: string; description: string };
  howItWorks: { title: string; steps: string[] };
  scenarios: Scenario[];
}

export const grillMe: SkillData = {
  name: "grill-me",
  problem: {
    title: "O problema",
    description:
      "Você abre o editor, pede à IA para criar uma feature e começa a codar imediatamente. Sem entender os requisitos reais, as edge cases, as restrições do sistema. O resultado? Retrabalho infinito, PRs que voltam com dezenas de comentários, e features que não atendem ao que o usuário realmente precisa.",
  },
  skill: {
    title: "A skill",
    description:
      "O /grill-me é uma entrevista técnica conduzida pela IA antes de qualquer linha de código. Ela faz perguntas difíceis sobre a feature — escopo, limitações, dependências, edge cases — forçando você a pensar no problema antes de pensar na solução. É como ter um tech lead revisando sua ideia antes de você investir horas nela.",
  },
  howItWorks: {
    title: "Como funciona",
    steps: [
      "Você descreve a feature que quer construir em linguagem natural",
      "A IA faz perguntas técnicas incisivas sobre requisitos, restrições e cenários",
      "Você responde, e a IA aprofunda nas áreas mais fracas do seu raciocínio",
      "No final, você tem clareza total sobre o que precisa ser construído",
    ],
  },
  scenarios: [
    {
      id: "react",
      label: "Projeto React",
      lines: [
        {
          type: "prompt",
          text: "Quero criar um sistema de autenticação com login social",
        },
        {
          type: "response",
          text: "Quais providers de login social você precisa suportar? (Google, GitHub, Apple, etc.)",
        },
        { type: "prompt", text: "Google e GitHub para começar" },
        {
          type: "response",
          text: "Como você vai lidar com o caso de um usuário que já tem conta com email/senha e tenta fazer login social com o mesmo email? Merge automático ou erro?",
        },
        {
          type: "prompt",
          text: "Não tinha pensado nisso... merge automático faz sentido",
        },
        {
          type: "response",
          text: "E se o email do provider social for diferente do cadastrado? O usuário perde acesso à conta antiga? Precisa de um fluxo de vinculação de contas?",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "Antes de codar, defina: estratégia de merge de contas, tokens de refresh, e o que acontece quando um provider fica offline. Esses são os maiores riscos dessa feature.",
        },
      ],
    },
    {
      id: "api",
      label: "API Backend",
      lines: [
        {
          type: "prompt",
          text: "Preciso criar um endpoint de upload de arquivos para o nosso SaaS",
        },
        {
          type: "response",
          text: "Qual o tamanho máximo de arquivo que você pretende suportar? E quais formatos?",
        },
        {
          type: "prompt",
          text: "PDFs e imagens, até 10MB",
        },
        {
          type: "response",
          text: "Como você vai lidar com uploads simultâneos do mesmo usuário? E se o upload falhar no meio — o cliente faz retry do arquivo inteiro ou você suporta upload resumível?",
        },
        {
          type: "prompt",
          text: "Upload simples por enquanto, sem resumível",
        },
        {
          type: "response",
          text: "Onde os arquivos serão armazenados? S3? E o processamento — síncrono no request ou assíncrono via fila? Se síncrono, qual o timeout do endpoint?",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "Pontos críticos: validação de MIME type no servidor (não confie no Content-Type do cliente), scan de malware, e rate limiting por usuário. Defina isso antes de implementar.",
        },
      ],
    },
  ],
};

export const writeAPrd: SkillData = {
  name: "write-a-prd",
  problem: {
    title: "O problema",
    description:
      "Features começam como ideias vagas na cabeça do desenvolvedor e vão direto para o código. Sem documentação de requisitos, sem definição de escopo, sem critérios de aceite. Três sprints depois, ninguém lembra o que era pra ser construído, o escopo triplicou, e o PM pergunta 'mas isso era prioridade?'.",
  },
  skill: {
    title: "A skill",
    description:
      "O /write-a-prd gera um Product Requirements Document completo a partir das respostas que você deu no /grill-me (ou de uma descrição sua). O PRD inclui: problem statement, solução proposta, user stories, decisões de implementação, e o que está fora de escopo. É o contrato entre o que você prometeu e o que vai entregar.",
  },
  howItWorks: {
    title: "Como funciona",
    steps: [
      "A IA usa o contexto coletado no /grill-me como input principal",
      "Gera um PRD estruturado com seções padronizadas (Problem, Solution, User Stories, etc.)",
      "Você revisa, ajusta e valida cada seção antes de prosseguir",
      "O PRD serve como referência durante toda a implementação",
    ],
  },
  scenarios: [
    {
      id: "saas",
      label: "Feature SaaS",
      lines: [
        { type: "prompt", text: "Gerar PRD para o sistema de notificações" },
        {
          type: "response",
          text: "## Problem Statement",
        },
        {
          type: "response",
          text: "Usuários do SaaS não têm visibilidade sobre eventos importantes (pagamentos, convites, alertas de uso). Ações críticas são perdidas porque dependem do usuário verificar o dashboard manualmente.",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "## Solution",
        },
        {
          type: "response",
          text: "Sistema de notificações multi-canal (in-app, email, push) com preferências por usuário e agrupamento inteligente para evitar notification fatigue.",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "## User Stories",
        },
        {
          type: "response",
          text: "1. Como usuário, quero receber notificação quando meu pagamento falhar, para que eu possa corrigir antes de perder acesso",
        },
        {
          type: "response",
          text: "2. Como usuário, quero configurar quais notificações recebo por email vs. in-app, para não ser bombardeado",
        },
        {
          type: "response",
          text: "3. Como admin, quero ver a taxa de entrega das notificações, para garantir que o sistema está funcionando",
        },
      ],
    },
    {
      id: "cli",
      label: "Ferramenta CLI",
      lines: [
        {
          type: "prompt",
          text: "Gerar PRD para uma CLI de deploy automatizado",
        },
        {
          type: "response",
          text: "## Problem Statement",
        },
        {
          type: "response",
          text: "Deploys são feitos manualmente via SSH ou scripts ad-hoc. Cada desenvolvedor tem seu próprio processo, resultando em deploys inconsistentes, sem rollback, e sem audit trail.",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "## Solution",
        },
        {
          type: "response",
          text: "CLI declarativa que lê um deploy.yaml, executa builds, health checks e rollback automático em caso de falha. Integra com CI/CD existente via hooks.",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "## Out of Scope",
        },
        {
          type: "response",
          text: "- Orquestração multi-serviço (use Kubernetes para isso)",
        },
        {
          type: "response",
          text: "- Dashboard web (MVP é CLI-only)",
        },
        {
          type: "response",
          text: "- Suporte a Windows (Linux e macOS apenas no MVP)",
        },
      ],
    },
  ],
};
