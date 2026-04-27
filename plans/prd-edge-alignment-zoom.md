# PRD: Edge Alignment During Zoom-Out Transition

## Problem Statement

Ao navegar para frente pelo workflow (ex: `workflow-1` → `skill-grill-me` → `workflow-2` → `skill-write-a-prd` → …), as edges do diagrama ReactFlow ficam desalinhadas em relação aos handles dos nodes após a animação de zoom-out. O misalignment afeta todas as edges visíveis, ocorre em 100% das navegações forward e em qualquer tamanho de viewport.

Ao navegar no sentido inverso (backward, em direção ao hero), as edges ficam corretamente alinhadas — o que confirma que as posições corretas já existem no estado do ReactFlow; o problema está em como o ciclo de zoom-out as altera ou atrasa.

Atualmente as edges são ocultadas (`opacity: 0`) durante o zoom-out e reveladas somente após a animação terminar. Além de introduzir a janela onde o estado pode corromper, essa abordagem impede que as edges sejam visíveis durante a animação, o que empobrece a experiência.

## Solution

Remover a lógica que oculta as edges durante o estado `isZoomingOut`. As edges devem ser sempre visíveis — tanto durante a animação de zoom-out quanto após ela. Como nodes e edges residem no mesmo container CSS que é escalado pela `motion.div`, o CSS `scale` transforma tudo uniformemente: a relação visual entre handles e endpoints de edges é preservada em qualquer nível de escala.

O problema central está na dança de `updateNodeInternals` + `fitView` que ocorre após o zoom-out terminar. Essa sequência causa uma recalculação de posições de handles e viewport que produz o desalinhamento — em vez de corrigir. Suprimindo o estado `edgesReady` e eliminando a chamada condicional de `updateNodeInternals` pós-zoom, as edges mantêm as posições corretas estabelecidas no `onInit`.

## User Stories

1. Como usuário navegando forward pelo workflow, quero que as edges estejam visíveis e alinhadas durante toda a animação de zoom-out, para que o diagrama pareça coerente e contínuo.
2. Como usuário navegando forward pelo workflow, quero que as edges permaneçam alinhadas nos handles após a animação de zoom-out terminar, para que o diagrama fique correto em repouso.
3. Como usuário navegando backward pelo workflow, quero que as edges continuem alinhadas como já funcionam hoje, para que a navegação inversa não seja regredida.
4. Como usuário em qualquer tamanho de viewport (mobile, tablet, desktop), quero que as edges estejam sempre alinhadas independente da resolução.
5. Como usuário com `prefers-reduced-motion` ativo, quero que as edges apareçam corretamente sem qualquer animação de transição, mantendo o comportamento de fallback existente.
6. Como desenvolvedor mantendo o codebase, quero que a lógica de visibilidade de edges seja simples e sem estado condicional baseado em `isZoomingOut`, para que o comportamento seja previsível.

## Implementation Decisions

### Módulos afetados

- **`WorkflowDiagram.tsx`**: Remoção do estado `edgesReady` e de toda a lógica associada a ele (`setEdgesReady`, `handleEdgesReady`, os `useEffect`s que ocultam/revelam edges com base em `isZoomingOut`).
- **`WorkflowFitView`** (componente interno de `WorkflowDiagram.tsx`): Remoção do `useEffect` que detecta a transição `wasZoomingOut → false` e chama `updateNodeInternals` + `onEdgesReady`. Esse bloco é o principal suspeito de corromper as posições ao recomputar handles após a mudança de viewport causada por `fitView`.
- **`VerticalScrollPage.tsx` / `WorkflowLayer`**: Remoção da prop `isZoomingOut` passada para `WorkflowDiagram`, ou torná-la no-op dentro do componente se ainda usada por outros fins.

### Decisões técnicas

- **`edgesReady` eliminado**: A inicialização de edges passa a usar sempre `instantIds` (mesma lógica que o backward). O estado binário que controlava quando as edges podiam ser exibidas é removido.
- **`updateNodeInternals` pós-zoom removido**: `updateNodeInternals` continua podendo ser chamado em outros contextos legítimos (ex: resize), mas não mais na transição `isZoomingOut → false`.
- **`onEdgesReady` prop removida de `WorkflowFitView`**: A interface do componente interno simplifica; `WorkflowFitView` continua responsável apenas por `fitView` e `ResizeObserver`.
- **`fitView` no `onInit` preservado**: Continua sendo o único ponto de configuração inicial do viewport. A chamada de `fitView` no `runFit` (via `useLayoutEffect`) também é preservada, pois é necessária para o resize responsivo.
- **Edge visibility durante zoom-out**: Como edges, handles e nodes estão todos dentro da mesma `motion.div` escalada, o CSS `scale` transforma o container inteiro uniformemente. A relação visual entre handle e endpoint de edge é matematicamente preservada em qualquer valor de scale — nenhuma compensação extra é necessária.

### Invariante arquitetural

A posição de uma edge é determinada pelas posições dos handles em _flow coordinates_ (espaço interno do ReactFlow). CSS transforms no container pai não afetam esse espaço. O problema surgiu porque a lógica de `isZoomingOut` introduzia um ciclo de re-medição (_measure → fitView → updateNodeInternals_) que acontecia com o viewport em um estado inconsistente após a animação. A solução é manter as posições estabelecidas no `onInit` intactas.

## Out of Scope

- Reescrever a lógica de animação zoom-in/zoom-out (scope do plano `zoom-depth-of-field-transitions.md`).
- Modificar como nodes são revelados progressivamente (stagger logic).
- Alterar o comportamento de `AnimatedBeamEdge` (draw animation, beam sequencing).
- Adicionar novas edges ou handles ao diagrama.
- Otimizar performance do ReactFlow além da remoção do ciclo de re-medição desnecessário.

## Further Notes

- O fato de o backward funcionar corretamente é o teste de regressão mais direto: após a mudança, o comportamento forward deve ser idêntico ao backward em termos de alinhamento de edges.
- A remoção do `edgesReady` simplifica significativamente o componente (~30–40 linhas removidas), o que é um sinal de que a abstração estava errada desde o início — ela foi adicionada para mitigar o sintoma em vez de resolver a causa raiz.
- Se após a remoção do ciclo de re-medição as edges ainda aparecerem desalinhadas em algum caso, o próximo passo de investigação é verificar se há alguma chamada de `fitView` sendo disparada pelo `ResizeObserver` durante a animação (improvável, pois CSS scale não altera `clientWidth/clientHeight`).
