# SkillForge — PRD

## Problem Statement

Desenvolvedores que usam ferramentas de AI coding (Claude Code, Cursor, Copilot) frequentemente caem no padrão de "vibe coding" — pedem código à IA sem processo, sem rastreabilidade, sem revisão estruturada. O resultado é código frágil, débito técnico invisível e zero aproveitamento do potencial real dessas ferramentas.

Não existe hoje um recurso visual e acessível em português que apresente um workflow profissional completo de desenvolvimento assistido por IA — desde a concepção da feature até o code review — com embasamento técnico sobre por que essa abordagem funciona melhor (Context Rot, otimização de tokens).

Desenvolvedores de todos os níveis (júnior a sênior) precisam de um guia prático que mostre como estruturar o uso de IA no desenvolvimento de software com um processo disciplinado e reproduzível.

## Solution

**SkillForge** é um site estático em Astro que apresenta um workflow completo de desenvolvimento assistido por IA através de uma landing page interativa. O site combina:

1. Um manifesto que posiciona o problema (vibe coding vs. processo estruturado)
2. Um diagrama interativo do workflow construído com React Flow, onde cada nó representa uma skill e é clicável
3. Uma seção científica fundamentada em estudos sobre Context Rot que explica por que skills on-demand são mais eficientes que regras globais na janela de contexto dos LLMs
4. Seções detalhadas para cada uma das 7 skills do workflow, com terminal simulado semi-interativo que demonstra a skill em ação

O site é 100% estático, em pt-BR, com design híbrido (layout clean/moderno + estética terminal nos exemplos), dark mode como padrão, e deploy na Vercel.

## User Stories

1. Como um desenvolvedor que usa IA para codar, eu quero entender a diferença entre vibe coding e um workflow estruturado, para que eu possa avaliar se meu processo atual é eficiente
2. Como um desenvolvedor júnior, eu quero ver o workflow completo de forma visual em um diagrama, para que eu entenda a ordem e a relação entre cada etapa
3. Como um desenvolvedor sênior, eu quero entender o embasamento técnico (Context Rot) por trás do workflow, para que eu possa justificar a adoção no meu time
4. Como um visitante do site, eu quero clicar em qualquer nó do diagrama e ser levado à seção correspondente, para que eu possa navegar direto para o que me interessa
5. Como um desenvolvedor curioso, eu quero ver cada skill em ação através de um terminal simulado, para que eu entenda como a interação funciona na prática
6. Como um usuário do terminal simulado, eu quero escolher entre diferentes fluxos/cenários clicando em opções, para que eu veja como a skill se adapta a diferentes situações
7. Como um visitante, eu quero que o site tenha animações suaves de scroll conforme eu navego, para que a experiência de leitura seja envolvente e dinâmica
8. Como um desenvolvedor, eu quero entender o problema que cada skill resolve antes de ver como ela funciona, para que eu tenha contexto sobre quando usá-la
9. Como um visitante, eu quero ler sobre a skill `grill-me`, para que eu entenda como ela me ajuda a definir requisitos através de entrevista técnica antes de codar
10. Como um visitante, eu quero ler sobre a skill `write-a-prd`, para que eu entenda o que é um PRD e como a IA me ajuda a produzir um documento de requisitos completo
11. Como um visitante, eu quero ler sobre a skill `plan-to-tracker` (etapa opcional), para que eu entenda como mover stories de um PRD para ferramentas de gestão (ClickUp, Jira, Linear) via MCP
12. Como um visitante, eu quero ler sobre a skill `prd-to-plan`, para que eu entenda como o PRD é quebrado em stories técnicas curtas que referencio durante a implementação
13. Como um visitante, eu quero ler sobre a skill `do-work`, para que eu entenda como a IA executa o código e gerencia branches automaticamente
14. Como um visitante, eu quero ler sobre a skill `improve-codebase-architecture`, para que eu entenda como usar essa skill como code review para encontrar gaps na implementação
15. Como um visitante, eu quero ler sobre a skill `handle-coderabbit`, para que eu entenda como integrar feedback automatizado do CodeRabbit ou GitHub Copilot via CLI
16. Como um desenvolvedor, eu quero entender por que skills on-demand são mais eficientes que regras globais, para que eu otimize meu uso de tokens na janela de contexto
17. Como um visitante, eu quero ver referências a estudos reais sobre Context Rot, para que eu confie no embasamento técnico do workflow
18. Como um visitante, eu quero que o diagrama do workflow se construa visualmente com animação enquanto eu faço scroll, para que a experiência seja impactante na primeira visita
19. Como um visitante mobile, eu quero que o site seja responsivo e funcional no celular, para que eu possa ler e interagir em qualquer dispositivo
20. Como um desenvolvedor que já usa Claude Code, eu quero entender como configurar e usar cada skill no meu ambiente, para que eu possa adotar o workflow imediatamente
21. Como um visitante, eu quero que o site carregue rápido mesmo com animações e componentes interativos, para que a experiência não seja prejudicada por performance
22. Como um visitante, eu quero que a seção hero me convença em segundos de que vale a pena continuar lendo, para que eu não abandone a página
23. Como um visitante, eu quero que cada seção de skill siga o mesmo formato consistente, para que eu possa escanear rapidamente e encontrar o que preciso
24. Como um líder técnico, eu quero compartilhar o link do site com meu time como referência de boas práticas de AI coding, para que o time adote um processo unificado

## Implementation Decisions

### Stack tecnológico
- **Framework**: Astro com ilhas de interatividade em React
- **Estilização**: Tailwind CSS com dark mode como padrão
- **Diagrama do workflow**: React Flow como componente React renderizado via `client:only="react"` no Astro
- **Animações de scroll**: biblioteca leve de scroll animations (Intersection Observer API ou lib como AOS/framer-motion)
- **Terminal simulado**: componente React customizado com efeito typewriter e opções clicáveis para alternar fluxos
- **Deploy**: Vercel com build estático do Astro

### Estrutura da página (ordem de cima para baixo)
1. **Hero** — headline impactante + mini-manifesto (3-4 linhas) sobre vibe coding vs. processo
2. **Diagrama do workflow** — React Flow com 7 nós (+ 1 opcional), animação de construção no scroll, nós clicáveis como âncoras
3. **Seção "A ciência por trás"** — Context Rot, performance de LLMs na faixa 80k-120k tokens, skills vs. regras globais
4. **7 seções de skills** — cada uma seguindo o template: "O problema" → "A skill" → "Como funciona" → "Exemplo interativo"
5. **Footer**

### Diagrama do workflow (React Flow)
- Cada skill é um nó no grafo
- Fluxo linear: grill-me → write-a-prd → prd-to-plan → do-work → improve-codebase-architecture → handle-coderabbit
- Nó `plan-to-tracker` é branch opcional saindo de `write-a-prd` com visual diferenciado (borda tracejada ou cor diferente)
- Clicar em um nó faz smooth scroll até a seção correspondente
- O diagrama se "monta" progressivamente com animação quando entra no viewport

### Terminal simulado semi-interativo
- Componente React reutilizável que recebe um array de "cenários"
- Cada cenário é uma conversa pré-gravada (perguntas e respostas)
- O texto aparece com efeito typewriter
- O usuário pode clicar em botões/tabs para alternar entre cenários diferentes (ex: "Veja para projeto React" vs "Veja para projeto Python")
- Estética: fundo escuro, fonte monospace, cores neon (verde/ciano), barra de título simulando terminal

### Design system
- Layout geral: clean, moderno, com bastante whitespace, tipografia sans-serif
- Blocos de terminal: fundo escuro (#1a1a2e ou similar), fonte monospace, cores neon
- Dark mode como padrão (sem toggle no MVP)
- Responsivo mobile-first

### Seção Context Rot — referências
- Chroma — "Context Rot: How Increasing Input Tokens Impacts LLM Performance" (Jul 2025) — estudo principal
- ZenML LLMOps Database — resumo do estudo da Chroma
- Understanding AI — Timothy B. Lee (Nov 2025)
- Morph — guia completo (Mar 2026)
- Redis — estratégias de prevenção (Jan 2026)
- Cobus Greyling — análise Medium/Substack
- Adaline Labs — Nilesh Barla (Ago 2025)
- arXiv — "Context Discipline and Performance Correlation" (Dez 2025)
- Documentação Claude Opus 4.7 e janela de 1M tokens (Claude API Docs, AWS, Azure, Caylent)

### Conteúdo
- Idioma: pt-BR exclusivo, sem estrutura de i18n
- Tom: acessível para júniores, com profundidade técnica para seniores
- Cada skill segue template fixo para consistência

## Out of Scope

- **Internacionalização (i18n)** — sem inglês ou outros idiomas no MVP, sem estrutura de routing por idioma
- **Chat real com IA** — sem integração com Claude API para interação live; os terminais são pré-gravados
- **Vídeos e GIFs demonstrativos** — apenas texto e terminal simulado no MVP
- **Blog ou seção de artigos** — o site é uma landing page única
- **Autenticação ou área logada** — site 100% público e estático
- **Analytics avançado** — apenas o analytics padrão da Vercel
- **SEO avançado** — meta tags básicas, sem estratégia de conteúdo para busca orgânica
- **Seção "sobre o autor"** — não definida como requisito no MVP
- **CTA final** — não definido (pode ser adicionado como melhoria rápida)

## Further Notes

- **Validação técnica prioritária**: testar React Flow como ilha Astro (`client:only="react"`) no início do projeto para garantir compatibilidade antes de investir no design do diagrama
- **Conteúdo como gargalo**: os textos de cada skill e os cenários do terminal simulado precisam ser escritos manualmente — isso é trabalho de conteúdo que pode levar mais tempo que o código
- **Performance**: as animações de scroll e o React Flow adicionam JS ao client; medir Lighthouse score cedo e otimizar se necessário
- **Evolução natural**: a seção de Context Rot pode se tornar um artigo standalone no futuro se houver interesse
- **Skills futuras**: o diagrama React Flow é flexível para adicionar novos nós se o workflow ganhar etapas extras
