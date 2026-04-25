import { useCallback, useLayoutEffect, useEffect, useRef } from "react";
import { useMotionValueEvent, type MotionValue } from "motion/react";
import { useNavigateTo } from "../context/SectionNavContext";
import type { SectionId } from "../lib/sections";
import {
  ReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useStore,
} from "@xyflow/react";
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
      data: { label: skill.label, anchor: skill.anchor, optional: false },
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
    },
  });

  return nodes;
}

function buildEdges(): Edge[] {
  const edges: Edge[] = [];

  for (let i = 0; i < SKILLS.length - 1; i++) {
    const isEndOfRow = (i + 1) % NODES_PER_ROW === 0;
    edges.push({
      id: `e-${SKILLS[i].id}-${SKILLS[i + 1].id}`,
      source: SKILLS[i].id,
      target: SKILLS[i + 1].id,
      sourceHandle: isEndOfRow ? "bottom" : "right",
      targetHandle: isEndOfRow ? "top" : "left",
      animated: true,
      style: { stroke: "#34d399", strokeWidth: 2 },
    });
  }

  edges.push({
    id: "e-plan-to-tracker-write-a-prd",
    source: "plan-to-tracker",
    target: "write-a-prd",
    sourceHandle: "bottom",
    targetHandle: "top",
    animated: true,
    style: { stroke: "#22d3ee", strokeWidth: 2, strokeDasharray: "6 4" },
  });

  return edges;
}

function SkillNode({ data }: NodeProps) {
  const { label, anchor, optional } = data as {
    label: string;
    anchor: string;
    optional: boolean;
  };

  const navigateTo = useNavigateTo();

  const handleClick = useCallback(() => {
    const id = anchor.startsWith("#") ? anchor.slice(1) : anchor;
    if (navigateTo) {
      navigateTo(id as SectionId);
    }
  }, [anchor, navigateTo]);

  return (
    <>
      <Handle type="target" position={Position.Left} id="left" className="!bg-emerald-400 !w-2 !h-2 !border-0" />
      <Handle type="target" position={Position.Top} id="top" className="!bg-emerald-400 !w-2 !h-2 !border-0" />
      <button
        type="button"
        onClick={handleClick}
        className={`px-3.5 py-2.5 rounded-lg font-mono text-[13px] leading-snug cursor-pointer transition-all duration-200 w-full min-w-0 text-left
          ${
            optional
              ? "bg-cyan-950/50 text-cyan-400 border border-dashed border-cyan-400/40 hover:border-cyan-400 hover:bg-cyan-950/80"
              : "bg-emerald-950/50 text-emerald-400 border border-emerald-400/40 hover:border-emerald-400 hover:bg-emerald-950/80"
          }`}
      >
        <span className="block break-words pr-0.5 text-pretty">{label}</span>
        {optional && (
          <span className="mt-0.5 inline-block text-[10px] uppercase tracking-wider text-cyan-400/60">
            opcional
          </span>
        )}
      </button>
      <Handle type="source" position={Position.Right} id="right" className="!bg-emerald-400 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-emerald-400 !w-2 !h-2 !border-0" />
    </>
  );
}

const nodeTypes: NodeTypes = { skill: SkillNode };

const REVEAL_ORDER = [
  "grill-me",
  "write-a-prd",
  "prd-to-plan",
  "plan-to-tracker",
  "do-work",
  "improve-codebase-architecture",
  "handle-coderabbit",
] as const;

const TOTAL_WORKFLOW_BEATS = REVEAL_ORDER.length;

function computeVisibleCount(p: number): number {
  return Math.max(1, Math.min(
    TOTAL_WORKFLOW_BEATS,
    Math.floor(p * TOTAL_WORKFLOW_BEATS) + 1,
  ));
}

function applyVisibility(nodes: Node[], visibleIds: Set<string>): Node[] {
  return nodes.map((node) => {
    const revealed = visibleIds.has(node.id);
    return {
      ...node,
      style: {
        ...node.style,
        opacity: revealed ? 1 : 0,
        transition: "opacity 0.4s ease",
        pointerEvents: (revealed ? "auto" : "none") as "auto" | "none",
      },
    };
  });
}

function applyEdgeVisibility(edges: Edge[], visibleIds: Set<string>): Edge[] {
  return edges.map((edge) => ({
    ...edge,
    style: {
      ...edge.style,
      opacity:
        visibleIds.has(edge.source) && visibleIds.has(edge.target) ? 1 : 0,
      transition: "opacity 0.4s ease",
    },
  }));
}

const FIT: { padding: number; maxZoom: number } = { padding: 0.2, maxZoom: 1.2 };

/** Re-fits the graph after layout / resize so the viewport centers on the full bounding box (staggered node mount used to run fitView on an empty graph). */
function WorkflowFitView() {
  const { fitView } = useReactFlow();
  const nodeCount = useStore((s) => s.nodes.length);
  const edgeCount = useStore((s) => s.edges.length);

  const runFit = useCallback(() => {
    if (nodeCount < 1) return;
    requestAnimationFrame(() => {
      fitView({ ...FIT, duration: 0 });
    });
  }, [nodeCount, fitView]);

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

export default function WorkflowDiagram({
  contentLocal,
}: {
  contentLocal: MotionValue<number>;
}) {
  const initialCount = computeVisibleCount(contentLocal.get());
  const initialVisible = new Set<string>(REVEAL_ORDER.slice(0, initialCount));

  const [nodes, setNodes, onNodesChange] = useNodesState(
    applyVisibility(buildInitialNodes(), initialVisible),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    applyEdgeVisibility(buildEdges(), initialVisible),
  );

  const prevCountRef = useRef(initialCount);

  useMotionValueEvent(contentLocal, "change", (p) => {
    const visibleCount = computeVisibleCount(p);
    if (visibleCount === prevCountRef.current) return;
    prevCountRef.current = visibleCount;

    const visibleIds = new Set<string>(REVEAL_ORDER.slice(0, visibleCount));
    setNodes((prev) => applyVisibility(prev, visibleIds));
    setEdges((prev) => applyEdgeVisibility(prev, visibleIds));
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
          <WorkflowFitView />
        </ReactFlow>
      </div>
    </div>
  );
}
