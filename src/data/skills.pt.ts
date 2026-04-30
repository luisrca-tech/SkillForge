import type { SkillData } from "./skills.types";

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

export const prdToPlan: SkillData = {
  name: "prd-to-plan",
  problem: {
    title: "O problema",
    description:
      "Você tem um PRD completo, mas ele é um documento de negócio — não um plano de execução. Tentar implementar direto do PRD resulta em commits gigantes, stories vagas tipo 'implementar autenticação', e zero rastreabilidade entre o que foi planejado e o que foi entregue. O desenvolvedor pula de seção em seção do PRD sem ordem clara.",
  },
  skill: {
    title: "A skill",
    description:
      "O /prd-to-plan transforma o PRD em um plano técnico com fases sequenciais, cada uma contendo stories curtas e específicas com critérios de aceite. O plano é otimizado para ser consumido por IA durante a implementação — cada story referencia exatamente o que construir, sem ambiguidade.",
  },
  howItWorks: {
    title: "Como funciona",
    steps: [
      "A IA lê o PRD e identifica as dependências entre componentes",
      "Agrupa o trabalho em fases com ordem lógica de implementação",
      "Cada fase contém stories técnicas curtas com critérios de aceite claros",
      "O plano serve como input direto para o /do-work executar fase por fase",
    ],
  },
  scenarios: [
    {
      id: "fullstack",
      label: "App Fullstack",
      lines: [
        {
          type: "prompt",
          text: "Gerar plano técnico a partir do PRD do sistema de notificações",
        },
        {
          type: "response",
          text: "## Phase 1: Modelo de dados e API base",
        },
        {
          type: "response",
          text: "Story 1.1: Criar tabela notifications com campos user_id, type, channel, payload, read_at, created_at",
        },
        {
          type: "response",
          text: "Story 1.2: Endpoint POST /notifications — criar notificação e enfileirar para entrega",
        },
        {
          type: "response",
          text: "Story 1.3: Endpoint GET /notifications — listar com paginação e filtro por read/unread",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "## Phase 2: Entrega multi-canal",
        },
        {
          type: "response",
          text: "Story 2.1: Worker que consome a fila e despacha via email (SendGrid) ou push (FCM)",
        },
        {
          type: "response",
          text: "Story 2.2: Tabela user_notification_preferences com configuração por canal e tipo",
        },
      ],
    },
    {
      id: "mobile",
      label: "App Mobile",
      lines: [
        {
          type: "prompt",
          text: "Gerar plano técnico para o app de delivery",
        },
        {
          type: "response",
          text: "## Phase 1: Setup e navegação",
        },
        {
          type: "response",
          text: "Story 1.1: Scaffold React Native com Expo Router, configurar navegação bottom tabs",
        },
        {
          type: "response",
          text: "Story 1.2: Tela de login com autenticação via API existente",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "## Phase 2: Fluxo de pedido",
        },
        {
          type: "response",
          text: "Story 2.1: Tela de listagem de restaurantes com busca e filtros",
        },
        {
          type: "response",
          text: "Story 2.2: Tela de cardápio com adição ao carrinho e variações de item",
        },
        {
          type: "response",
          text: "Story 2.3: Checkout com endereço, método de pagamento e confirmação",
        },
      ],
    },
  ],
};

export const planToTracker: SkillData = {
  name: "plan-to-tracker",
  variant: "optional",
  problem: {
    title: "O problema",
    description:
      "O plano técnico existe, mas as stories ficam presas em um arquivo Markdown que ninguém consulta depois da primeira semana. O PM cobra status no ClickUp, o time atualiza Jira manualmente, e a fonte da verdade se fragmenta entre o plano, o tracker e a cabeça do dev. Stories são copiadas com erros, perdem contexto, e o tracker vira um cemitério de tickets desatualizados.",
  },
  skill: {
    title: "A skill",
    description:
      "O /plan-to-tracker é um passo opcional que sincroniza as stories do plano diretamente para o seu tracker de projetos (ClickUp, Jira, Linear) via MCP. Cada story vira um ticket com título, descrição, critérios de aceite e labels corretos — sem copiar e colar manual. O plano e o tracker ficam em sincronia desde o início.",
  },
  howItWorks: {
    title: "Como funciona",
    steps: [
      "A IA lê o plano gerado pelo /prd-to-plan e identifica cada story",
      "Conecta ao seu tracker via MCP server (ClickUp, Jira, Linear)",
      "Cria tickets com título, descrição formatada e critérios de aceite",
      "Organiza os tickets em sprints ou fases conforme o plano original",
    ],
  },
  scenarios: [
    {
      id: "clickup",
      label: "ClickUp",
      lines: [
        {
          type: "prompt",
          text: "Sincronizar plano com o ClickUp no espaço 'Backend v2'",
        },
        {
          type: "response",
          text: "Conectando ao ClickUp via MCP server...",
        },
        {
          type: "response",
          text: "Espaço 'Backend v2' encontrado. Criando lista 'Phase 1: Modelo de dados e API base'...",
        },
        {
          type: "response",
          text: "✓ Ticket criado: 'Criar tabela notifications' — prioridade: alta, tags: [database, backend]",
        },
        {
          type: "response",
          text: "✓ Ticket criado: 'Endpoint POST /notifications' — prioridade: alta, tags: [api, backend]",
        },
        {
          type: "response",
          text: "✓ Ticket criado: 'Endpoint GET /notifications' — prioridade: média, tags: [api, backend]",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "6 tickets criados em 2 listas. Dependências configuradas. Link do board: clickup.com/...",
        },
      ],
    },
    {
      id: "linear",
      label: "Linear",
      lines: [
        {
          type: "prompt",
          text: "Exportar stories para o Linear no projeto 'Mobile App'",
        },
        {
          type: "response",
          text: "Conectando ao Linear via MCP server...",
        },
        {
          type: "response",
          text: "Projeto 'Mobile App' encontrado. Criando ciclo 'Phase 1: Setup e navegação'...",
        },
        {
          type: "response",
          text: "✓ MOB-42: 'Scaffold React Native com Expo Router' — estimate: 3pts, label: setup",
        },
        {
          type: "response",
          text: "✓ MOB-43: 'Tela de login com autenticação' — estimate: 5pts, label: auth",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "8 issues criados em 3 ciclos. Projeto atualizado: linear.app/team/mobile-app",
        },
      ],
    },
  ],
};

export const doWork: SkillData = {
  name: "do-work",
  problem: {
    title: "O problema",
    description:
      "Você pede à IA para implementar uma feature e ela gera 500 linhas de código de uma vez. Sem testes, sem commits incrementais, sem branches. Se algo quebra no meio, você não sabe onde. O histórico do Git é um único commit 'implement feature' que mistura modelo, API, frontend e migrations. Code review? Impossível.",
  },
  skill: {
    title: "A skill",
    description:
      "O /do-work é o executor. Ele pega uma story do plano e implementa seguindo TDD rigoroso: cria a branch, escreve o teste primeiro (red), implementa o mínimo para passar (green), refatora, e faz commit. Uma story por vez, um teste por vez. O resultado é código testado, commits atômicos e rastreabilidade total entre a story e o código.",
  },
  howItWorks: {
    title: "Como funciona",
    steps: [
      "Lê a story do plano e cria uma branch específica para ela",
      "Escreve o primeiro teste (red) — o teste deve falhar",
      "Implementa o código mínimo para o teste passar (green)",
      "Refatora mantendo os testes verdes, faz commit e repete",
      "Ao finalizar a story, abre PR com descrição vinculada ao plano",
    ],
  },
  scenarios: [
    {
      id: "backend",
      label: "Story Backend",
      lines: [
        {
          type: "prompt",
          text: "Executar Story 1.1: Criar tabela notifications",
        },
        {
          type: "response",
          text: "Branch criada: feat/story-1.1-notifications-table",
        },
        {
          type: "response",
          text: "Escrevendo teste: 'should create notification with required fields'...",
        },
        {
          type: "response",
          text: "✗ Teste falhou (red) — tabela não existe ainda. Correto.",
        },
        {
          type: "response",
          text: "Criando migration: add_notifications_table com campos user_id, type, channel, payload, read_at, created_at...",
        },
        {
          type: "response",
          text: "✓ Teste passou (green). Commit: 'feat: add notifications table with base schema'",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "Escrevendo teste: 'should enforce NOT NULL on user_id and type'...",
        },
        {
          type: "response",
          text: "✓ Teste passou. Commit: 'feat: add NOT NULL constraints to notifications'",
        },
      ],
    },
    {
      id: "frontend",
      label: "Story Frontend",
      lines: [
        {
          type: "prompt",
          text: "Executar Story 2.3: Tela de checkout",
        },
        {
          type: "response",
          text: "Branch criada: feat/story-2.3-checkout-screen",
        },
        {
          type: "response",
          text: "Implementando componente CheckoutScreen com formulário de endereço...",
        },
        {
          type: "response",
          text: "✓ Componente renderiza com campos: endereço, método de pagamento, resumo do pedido",
        },
        {
          type: "response",
          text: "Adicionando validação de formulário com Zod schema...",
        },
        {
          type: "response",
          text: "✓ Validação funcional. Commit: 'feat: add checkout screen with address form'",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "Integrando com API de pagamento — loading state, error handling, confirmação...",
        },
        {
          type: "response",
          text: "✓ Fluxo completo. Commit: 'feat: integrate checkout with payment API'",
        },
      ],
    },
  ],
};

export const improveCodebaseArchitecture: SkillData = {
  name: "improve-codebase-architecture",
  problem: {
    title: "O problema",
    description:
      "O código funciona, os testes passam, o PR está aberto — mas ninguém fez uma revisão estrutural. Padrões foram quebrados, responsabilidades estão misturadas, abstrações desnecessárias foram criadas, e a arquitetura foi comprometida sem que ninguém percebesse. O code review humano foca em detalhes de implementação e deixa passar problemas sistêmicos.",
  },
  skill: {
    title: "A skill",
    description:
      "O /improve-codebase-architecture funciona como um code review arquitetural automatizado. A IA analisa o código implementado buscando gaps: violações de padrões do projeto, acoplamento excessivo, abstrações prematuras, inconsistências com o restante da codebase. Não é um linter — é uma revisão que entende o contexto do projeto e sugere melhorias estruturais.",
  },
  howItWorks: {
    title: "Como funciona",
    steps: [
      "A IA lê o código recém-implementado e o compara com os padrões da codebase",
      "Identifica violações de arquitetura, code smells e inconsistências",
      "Sugere refatorações específicas com justificativa técnica",
      "Você aplica as mudanças e roda os testes para garantir que nada quebrou",
    ],
  },
  scenarios: [
    {
      id: "patterns",
      label: "Padrões violados",
      lines: [
        {
          type: "prompt",
          text: "Revisar a implementação do módulo de notificações",
        },
        {
          type: "response",
          text: "Analisando src/notifications/ contra os padrões da codebase...",
        },
        {
          type: "response",
          text: "⚠ NotificationService mistura lógica de negócio com acesso ao banco. O restante da codebase usa Repository pattern — extrair NotificationRepository.",
        },
        {
          type: "response",
          text: "⚠ O enum NotificationType está definido inline no service. Outros módulos definem enums em src/types/ — mover para manter consistência.",
        },
        {
          type: "response",
          text: "✓ Testes seguem o padrão do projeto (describe/it, fixtures separados).",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "2 issues encontrados. Nenhum é crítico, mas ambos geram debt se não corrigidos agora. Sugestão: corrigir antes do merge.",
        },
      ],
    },
    {
      id: "coupling",
      label: "Acoplamento",
      lines: [
        {
          type: "prompt",
          text: "Verificar acoplamento no módulo de checkout",
        },
        {
          type: "response",
          text: "Analisando dependências de src/checkout/...",
        },
        {
          type: "response",
          text: "⚠ CheckoutService importa diretamente UserRepository, PaymentGateway e EmailService. 3 dependências externas — alto acoplamento.",
        },
        {
          type: "response",
          text: "O restante da codebase usa injeção de dependência via constructor. CheckoutService instancia dependências internamente.",
        },
        {
          type: "response",
          text: "Sugestão: receber dependências via constructor e criar CheckoutServiceFactory para composição.",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "Isso também vai facilitar os testes — atualmente o test file faz mock de 3 módulos com jest.mock(). Com DI, basta passar mocks no constructor.",
        },
      ],
    },
  ],
};

export const handleCoderabbit: SkillData = {
  name: "handle-coderabbit",
  problem: {
    title: "O problema",
    description:
      "Você abre um PR e o CodeRabbit (ou outro bot de review) deixa 15 comentários. Alguns são relevantes, outros são falsos positivos. Você precisa ler cada um, decidir o que é válido, implementar as correções, responder os comentários, e re-request review. É um processo manual e tedioso que transforma um merge de 5 minutos em 30 minutos de trabalho burocrático.",
  },
  skill: {
    title: "A skill",
    description:
      "O /handle-coderabbit automatiza o ciclo de feedback de code review automatizado. A IA lê os comentários do CodeRabbit (ou GitHub Copilot review), classifica cada um como válido ou falso positivo, implementa as correções necessárias, e responde os comentários diretamente no PR — tudo via CLI, sem sair do terminal.",
  },
  howItWorks: {
    title: "Como funciona",
    steps: [
      "A IA lê todos os comentários do bot de review no PR aberto",
      "Classifica cada comentário: correção necessária, sugestão válida, ou falso positivo",
      "Implementa as correções e melhorias aceitas automaticamente",
      "Responde cada comentário no PR explicando a ação tomada",
      "Faz commit das correções e solicita re-review",
    ],
  },
  scenarios: [
    {
      id: "coderabbit",
      label: "CodeRabbit",
      lines: [
        {
          type: "prompt",
          text: "Processar review do CodeRabbit no PR #47",
        },
        {
          type: "response",
          text: "Lendo 8 comentários do CodeRabbit no PR #47...",
        },
        {
          type: "response",
          text: "✓ Comentário 1: 'Missing error handling in fetchUser' — VÁLIDO. Adicionando try/catch com error boundary.",
        },
        {
          type: "response",
          text: "✗ Comentário 2: 'Consider using optional chaining' — FALSO POSITIVO. O valor nunca é null aqui (garantido pelo schema Zod).",
        },
        {
          type: "response",
          text: "✓ Comentário 3: 'SQL injection risk in query builder' — VÁLIDO. Substituindo concatenação por parameterized query.",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "5/8 comentários corrigidos, 3 marcados como falso positivo com justificativa. Commit: 'fix: address CodeRabbit review feedback'. Re-review solicitado.",
        },
      ],
    },
    {
      id: "copilot",
      label: "GitHub Copilot",
      lines: [
        {
          type: "prompt",
          text: "Processar review do Copilot no PR #52",
        },
        {
          type: "response",
          text: "Lendo 5 sugestões do GitHub Copilot no PR #52...",
        },
        {
          type: "response",
          text: "✓ Sugestão 1: 'Extract magic number 86400 to named constant' — VÁLIDO. Criando SECONDS_PER_DAY.",
        },
        {
          type: "response",
          text: "✓ Sugestão 2: 'This async function never awaits' — VÁLIDO. Removendo async desnecessário.",
        },
        {
          type: "response",
          text: "✗ Sugestão 3: 'Consider memoizing this computation' — FALSO POSITIVO. Função é chamada uma vez no startup, memoização não traz benefício.",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "3/5 sugestões aplicadas, 2 rejeitadas com justificativa. Commit: 'fix: apply Copilot review suggestions'.",
        },
      ],
    },
  ],
};
