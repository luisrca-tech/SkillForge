import { useCallback, useEffect, useState } from "react";
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

const NODE_WIDTH = 240;
const NODE_HEIGHT = 56;
const GAP_X = 100;
const GAP_Y = 120;
const NODES_PER_ROW = 3;

function buildInitialNodes(): Node[] {
  const nodes: Node[] = SKILLS.map((skill, i) => {
    const row = Math.floor(i / NODES_PER_ROW);
    const col = i % NODES_PER_ROW;
    const x = col * (NODE_WIDTH + GAP_X);
    const y = row * (NODE_HEIGHT + GAP_Y);
    return {
      id: skill.id,
      type: "skill",
      position: { x, y },
      data: { label: skill.label, anchor: skill.anchor, optional: false },
    };
  });

  const branchSourceIndex = 1;
  const sourceNode = nodes[branchSourceIndex];
  nodes.push({
    id: OPTIONAL_SKILL.id,
    type: "skill",
    position: {
      x: sourceNode.position.x,
      y: sourceNode.position.y + NODE_HEIGHT + GAP_Y + 60,
    },
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
    id: `e-write-a-prd-plan-to-tracker`,
    source: "write-a-prd",
    target: "plan-to-tracker",
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

  const handleClick = useCallback(() => {
    const el = document.querySelector(anchor);
    el?.scrollIntoView({ behavior: "smooth" });
  }, [anchor]);

  return (
    <>
      <Handle type="target" position={Position.Left} id="left" className="!bg-emerald-400 !w-2 !h-2 !border-0" />
      <Handle type="target" position={Position.Top} id="top" className="!bg-emerald-400 !w-2 !h-2 !border-0" />
      <button
        onClick={handleClick}
        className={`px-5 py-3 rounded-lg font-mono text-sm cursor-pointer transition-all duration-200 w-full text-left
          ${
            optional
              ? "bg-cyan-950/50 text-cyan-400 border border-dashed border-cyan-400/40 hover:border-cyan-400 hover:bg-cyan-950/80"
              : "bg-emerald-950/50 text-emerald-400 border border-emerald-400/40 hover:border-emerald-400 hover:bg-emerald-950/80"
          }`}
      >
        {label}
        {optional && (
          <span className="ml-2 text-[10px] uppercase tracking-wider text-cyan-400/60">
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

export default function WorkflowDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(buildInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdges());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    const el = document.getElementById("workflow-diagram");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    const allNodes = buildInitialNodes();
    const allEdges = buildEdges();
    const totalNodes = allNodes.length;

    setNodes([]);
    setEdges([]);

    allNodes.forEach((node, i) => {
      setTimeout(() => {
        setNodes((prev) => [...prev, node]);
        if (i === totalNodes - 1) {
          setTimeout(() => setEdges(allEdges), 150);
        }
      }, i * 120);
    });
  }, [visible]);

  const diagramWidth = NODES_PER_ROW * (NODE_WIDTH + GAP_X) - GAP_X;
  const rows = Math.ceil((SKILLS.length + 1) / NODES_PER_ROW);
  const diagramHeight = rows * (NODE_HEIGHT + GAP_Y) + GAP_Y + 60;

  return (
    <div
      id="workflow-diagram"
      className="w-full overflow-x-auto"
      style={{ minHeight: diagramHeight + 40 }}
    >
      <div
        style={{ width: Math.max(diagramWidth + 80, 800), height: diagramHeight + 40 }}
        className="mx-auto"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          className="!bg-transparent"
        />
      </div>
    </div>
  );
}
