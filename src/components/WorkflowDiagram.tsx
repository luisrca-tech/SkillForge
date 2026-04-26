import { useCallback, useLayoutEffect, useEffect, useRef, useState } from "react";
import { useMotionValueEvent, type MotionValue } from "motion/react";
import { useAnimationObserver } from "../context/AnimationObserverContext";
import {
  ReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type NodeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useStore,
  useUpdateNodeInternals,
} from "@xyflow/react";
import AnimatedBeamEdge from "./AnimatedBeamEdge";
import "@xyflow/react/dist/style.css";

const SKILLS = [
  { id: "grill-me", label: "/grill-me", anchor: "#skill-grill-me" },
  {
    id: "write-a-prd",
    label: "/write-a-prd",
    anchor: "#skill-write-a-prd",
  },
  {
    id: "prd-to-plan",
    label: "/prd-to-plan",
    anchor: "#skill-prd-to-plan",
  },
  { id: "do-work", label: "/do-work", anchor: "#skill-do-work" },
  {
    id: "improve-codebase-architecture",
    label: "/improve-codebase-architecture",
    anchor: "#skill-improve-codebase-architecture",
  },
  {
    id: "handle-coderabbit",
    label: "/handle-coderabbit",
    anchor: "#skill-handle-coderabbit",
  },
] as const;

const OPTIONAL_SKILL = {
  id: "plan-to-tracker",
  label: "/plan-to-tracker",
  anchor: "#skill-plan-to-tracker",
} as const;

const NODE_WIDTH = 268;
const NODE_HEIGHT = 58;
const GAP_X = 104;
const GAP_Y = 72;
const NODES_PER_ROW = 3;
const TOP_PAD = 40;
const OPTIONAL_ABOVE_WRITE_GAP = 80;
const HANDLE_EXTRA_GAP_X = 64;

function buildInitialNodes(): Node[] {
  const nodes: Node[] = SKILLS.map((skill, i) => {
    const row = Math.floor(i / NODES_PER_ROW);
    const col = i % NODES_PER_ROW;
    const x = col * (NODE_WIDTH + GAP_X);
    const y = row * (NODE_HEIGHT + GAP_Y) + TOP_PAD;
    return {
      id: skill.id,
      type: "skill",
      position: { x, y },
      style: { width: NODE_WIDTH },
      data: { label: skill.label, anchor: skill.anchor, optional: false, handles: SKILL_HANDLES[skill.id] },
    };
  });

  const handleIdx = nodes.findIndex((n) => n.id === "handle-coderabbit");
  if (handleIdx >= 0) {
    const n = nodes[handleIdx];
    nodes[handleIdx] = {
      ...n,
      style: { width: NODE_WIDTH },
      position: { x: n.position.x + HANDLE_EXTRA_GAP_X, y: n.position.y },
    };
  }

  const branchSourceIndex = 1;
  const sourceNode = nodes[branchSourceIndex];
  nodes.push({
    id: OPTIONAL_SKILL.id,
    type: "skill",
    position: {
      x: sourceNode.position.x,
      y: sourceNode.position.y - (NODE_HEIGHT + GAP_Y + OPTIONAL_ABOVE_WRITE_GAP),
    },
    style: { width: NODE_WIDTH },
    data: {
      label: OPTIONAL_SKILL.label,
      anchor: OPTIONAL_SKILL.anchor,
      optional: true,
      handles: SKILL_HANDLES[OPTIONAL_SKILL.id],
    },
  });

  return nodes;
}

const SKILL_HANDLES: Record<string, Set<string>> = {
  "grill-me": new Set(["right"]),
  "write-a-prd": new Set(["left", "top", "right"]),
  "prd-to-plan": new Set(["left", "bottom"]),
  "plan-to-tracker": new Set(["bottom"]),
  "do-work": new Set(["top", "right"]),
  "improve-codebase-architecture": new Set(["left", "right"]),
  "handle-coderabbit": new Set(["left"]),
};

function buildEdges(): Edge[] {
  const edges: Edge[] = [];

  for (let i = 0; i < SKILLS.length - 1; i++) {
    const isEndOfRow = (i + 1) % NODES_PER_ROW === 0;
    const targetId = SKILLS[i + 1].id;
    edges.push({
      id: `e-${SKILLS[i].id}-${targetId}`,
      source: SKILLS[i].id,
      target: targetId,
      sourceHandle: isEndOfRow ? "bottom" : "right",
      targetHandle: isEndOfRow ? "top" : "left",
      type: "animatedBeam",
      style: { strokeWidth: 2 },
      data: { beamColor: "#6ee7b7", baseColor: "#34d399" },
    });
  }

  edges.push({
    id: "e-plan-to-tracker-write-a-prd",
    source: "plan-to-tracker",
    target: "write-a-prd",
    sourceHandle: "bottom",
    targetHandle: "top",
    type: "animatedBeam",
    style: { strokeWidth: 2 },
    data: { beamColor: "#67e8f9", baseColor: "#22d3ee" },
  });

  return edges;
}

function SkillNode({ data }: NodeProps) {
  const { label, optional, handles } = data as {
    label: string;
    optional: boolean;
    handles?: Set<string>;
  };

  const h = handles ?? new Set(["left", "top", "right", "bottom"]);

  return (
    <>
      {h.has("left") && <Handle type="target" position={Position.Left} id="left" className="!bg-emerald-400 !w-2 !h-2 !border-0" />}
      {h.has("top") && <Handle type="target" position={Position.Top} id="top" className="!bg-emerald-400 !w-2 !h-2 !border-0" />}
      <div
        className={`px-3.5 py-2.5 rounded-lg font-mono text-[13px] leading-snug cursor-default transition-all duration-200 w-full min-w-0 text-left
          ${optional
            ? "bg-cyan-950/50 text-cyan-400 border border-dashed border-cyan-400/40"
            : "bg-emerald-950/50 text-emerald-400 border border-emerald-400/40"
          }`}
      >
        <span className="block break-words pr-0.5 text-pretty">{label}</span>
        {optional && (
          <span className="mt-0.5 inline-block text-[10px] uppercase tracking-wider text-cyan-400/60">
            opcional
          </span>
        )}
      </div>
      {h.has("right") && <Handle type="source" position={Position.Right} id="right" className="!bg-emerald-400 !w-2 !h-2 !border-0" />}
      {h.has("bottom") && <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-emerald-400 !w-2 !h-2 !border-0" />}
    </>
  );
}

const nodeTypes: NodeTypes = { skill: SkillNode };
const edgeTypes: EdgeTypes = { animatedBeam: AnimatedBeamEdge };

const REVEAL_ORDER = [
  "grill-me",
  "write-a-prd",
  "prd-to-plan",
  "plan-to-tracker",
  "do-work",
  "improve-codebase-architecture",
  "handle-coderabbit",
] as const;

const STAGGER_DELAY = 0.2;
const NODE_FADE = "opacity 0.35s ease";
const EDGE_FADE = "opacity 0.3s ease";
const DRAW_SETTLE_MS = 500;

function applyVisibility(
  nodes: Node[],
  visibleIds: Set<string>,
  delaySec: number,
): Node[] {
  const transition = delaySec > 0 ? `${NODE_FADE} ${delaySec}s` : NODE_FADE;
  return nodes.map((node) => {
    const revealed = visibleIds.has(node.id);
    return {
      ...node,
      data: { ...node.data, visible: revealed },
      style: {
        ...node.style,
        opacity: revealed ? 1 : 0,
        transition,
        pointerEvents: (revealed ? "auto" : "none") as "auto" | "none",
      },
    };
  });
}

const MAIN_EDGE_IDS_ORDERED = SKILLS.slice(0, -1).map(
  (s, i) => `e-${s.id}-${SKILLS[i + 1].id}`,
);
const EDGE_SEQUENCE_INDEX: Record<string, number> = {};
MAIN_EDGE_IDS_ORDERED.forEach((id, i) => {
  EDGE_SEQUENCE_INDEX[id] = i;
});

function applyEdgeVisibility(
  edges: Edge[],
  visibleIds: Set<string>,
  delaySec: number,
  sequentialMode: boolean,
): Edge[] {
  const transition = delaySec > 0 ? `${EDGE_FADE} ${delaySec}s` : EDGE_FADE;
  return edges.map((edge) => ({
    ...edge,
    data: {
      ...edge.data,
      sequentialMode,
      sequenceIndex: EDGE_SEQUENCE_INDEX[edge.id],
    },
    style: {
      ...edge.style,
      opacity:
        visibleIds.has(edge.source) && visibleIds.has(edge.target) ? 1 : 0,
      transition,
    },
  }));
}

const FIT: { padding: number; maxZoom: number } = { padding: 0.2, maxZoom: 1.2 };

/** Re-fits the graph after layout / resize so the viewport centers on the full bounding box (staggered node mount used to run fitView on an empty graph). */
function WorkflowFitView({
  isZoomingOut,
  onEdgesReady,
}: {
  isZoomingOut?: boolean;
  onEdgesReady?: () => void;
}) {
  const { fitView } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const nodeCount = useStore((s) => s.nodes.length);
  const edgeCount = useStore((s) => s.edges.length);
  const allNodeIds = useStore((s) => s.nodes.map((n) => n.id));
  const prevIsZoomingOut = useRef(isZoomingOut);

  useEffect(() => {
    const wasZoomingOut = prevIsZoomingOut.current;
    prevIsZoomingOut.current = isZoomingOut;
    if (!wasZoomingOut || isZoomingOut) return;
    // Call updateNodeInternals immediately (scale=1, viewport correct from onInit),
    // then show edges in the next frame — total delay ~16ms after animation completes.
    updateNodeInternals(allNodeIds);
    requestAnimationFrame(() => onEdgesReady?.());
  }, [isZoomingOut, updateNodeInternals, allNodeIds, onEdgesReady]);

  const runFit = useCallback(() => {
    if (nodeCount < 1 || isZoomingOut) return;
    requestAnimationFrame(() => {
      fitView({ ...FIT, duration: 0 });
    });
  }, [nodeCount, isZoomingOut, fitView]);

  useLayoutEffect(() => {
    runFit();
  }, [nodeCount, edgeCount, runFit]);

  useEffect(() => {
    const el = document.getElementById("workflow-diagram");
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => runFit());
    ro.observe(el);
    return () => ro.disconnect();
  }, [runFit]);

  return null;
}

export type NodeScreenPosition = { x: number; y: number };

function NodePositionReporter({
  nodeId,
  onNodeReveal,
}: {
  nodeId: string;
  onNodeReveal?: (nodeId: string, position: NodeScreenPosition) => void;
}) {
  const { getNode, flowToScreenPosition } = useReactFlow();

  useEffect(() => {
    if (!onNodeReveal) return;
    const node = getNode(nodeId);
    if (!node) return;

    const centerX = node.position.x + (node.measured?.width ?? NODE_WIDTH) / 2;
    const centerY = node.position.y + (node.measured?.height ?? NODE_HEIGHT) / 2;
    const screen = flowToScreenPosition({ x: centerX, y: centerY });
    onNodeReveal(nodeId, screen);
  }, [nodeId, onNodeReveal, getNode, flowToScreenPosition]);

  return null;
}

export default function WorkflowDiagram({
  contentLocal,
  visibleCount,
  isZoomingOut,
  onNodeReveal,
}: {
  contentLocal: MotionValue<number>;
  visibleCount: number;
  isZoomingOut?: boolean;
  onNodeReveal?: (nodeId: string, position: NodeScreenPosition) => void;
}) {
  const { hasPlayed, markPlayed } = useAnimationObserver();
  const count = Math.max(1, Math.min(REVEAL_ORDER.length, visibleCount));
  const newestId = REVEAL_ORDER[count - 1];
  const diagramKey = `workflow-diagram-${count}`;
  const alreadyPlayed = hasPlayed(diagramKey);
  const full = count >= REVEAL_ORDER.length;

  const instantIds = alreadyPlayed
    ? new Set<string>(REVEAL_ORDER.slice(0, count))
    : new Set<string>(REVEAL_ORDER.slice(0, count - 1));

  const [edgesReady, setEdgesReady] = useState(!isZoomingOut);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    applyVisibility(buildInitialNodes(), instantIds, 0),
  );

  const initialEdgeIds = isZoomingOut ? new Set<string>() : instantIds;
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    applyEdgeVisibility(buildEdges(), initialEdgeIds, 0, alreadyPlayed && full).map(
      (edge): Edge => ({
        ...edge,
        data: {
          ...edge.data,
          skipDraw: Number(edge.style?.opacity ?? 0) > 0,
        },
      }),
    ),
  );

  const seqTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const edgesReadyRef = useRef(edgesReady);
  edgesReadyRef.current = edgesReady;

  useEffect(() => {
    if (isZoomingOut) {
      setEdgesReady(false);
    }
  }, [isZoomingOut]);

  useEffect(() => {
    if (edgesReady) return;
    setEdges((prev) =>
      prev.map((e) => ({ ...e, style: { ...e.style, opacity: 0, transition: "none" } })),
    );
  }, [edgesReady, setEdges]);

  const handleEdgesReady = useCallback(() => {
    setEdgesReady(true);
    const allVisible = new Set<string>(REVEAL_ORDER.slice(0, count));
    const prevVisible = new Set<string>(REVEAL_ORDER.slice(0, count - 1));
    setEdges((prev) =>
      prev.map((edge) => {
        const isVisible = allVisible.has(edge.source) && allVisible.has(edge.target);
        const wasAlreadyVisible = prevVisible.has(edge.source) && prevVisible.has(edge.target);
        return {
          ...edge,
          data: {
            ...edge.data,
            sequentialMode: full,
            sequenceIndex: EDGE_SEQUENCE_INDEX[edge.id],
            skipDraw: alreadyPlayed || wasAlreadyVisible,
          },
          style: {
            ...edge.style,
            opacity: isVisible ? 1 : 0,
            transition: alreadyPlayed || wasAlreadyVisible || !isVisible ? "none" : EDGE_FADE,
          },
        };
      }),
    );
  }, [count, full, alreadyPlayed, setEdges]);

  useEffect(() => {
    if (alreadyPlayed) return;

    const allVisible = new Set<string>(REVEAL_ORDER.slice(0, count));
    const frame = requestAnimationFrame(() => {
      setNodes((prev) => applyVisibility(prev, allVisible, STAGGER_DELAY));
      if (edgesReadyRef.current) {
        setEdges((prev) => applyEdgeVisibility(prev, allVisible, STAGGER_DELAY, false));

        if (full) {
          seqTimerRef.current = setTimeout(() => {
            setEdges((prev) =>
              applyEdgeVisibility(prev, allVisible, 0, true),
            );
          }, DRAW_SETTLE_MS);
        }
      }
      markPlayed(diagramKey);
    });
    return () => {
      cancelAnimationFrame(frame);
      if (seqTimerRef.current) clearTimeout(seqTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useMotionValueEvent(contentLocal, "change", (p) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id !== newestId) return node;
        return {
          ...node,
          data: { ...node.data, visible: p > 0 },
          style: {
            ...node.style,
            opacity: Math.max(0, Math.min(1, p)),
            pointerEvents: (p > 0 ? "auto" : "none") as "auto" | "none",
          },
        };
      }),
    );
  });

  return (
    <div
      id="workflow-diagram"
      className="h-full w-full min-h-0 min-w-0 pointer-events-auto"
    >
      <div className="h-full w-full min-h-0 min-w-0 react-flow-pass-wheel">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView={false}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          onInit={(instance) => {
            instance.fitView({ ...FIT, duration: 0 });
          }}
          proOptions={{ hideAttribution: true }}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          className="!h-full !w-full !bg-transparent"
        >
          <WorkflowFitView isZoomingOut={isZoomingOut} onEdgesReady={handleEdgesReady} />
          <NodePositionReporter nodeId={newestId} onNodeReveal={onNodeReveal} />
        </ReactFlow>
      </div>
    </div>
  );
}
