import WorkflowParticlesCanvas from "./WorkflowParticlesCanvas";
import type { MotionValue } from "motion/react";
import type { MutableRefObject } from "react";
import type { HoveredNodeData } from "./WorkflowDiagram";

export default function WorkflowParticles({
  contentLocal,
  warp = false,
  hoveredNodeRef,
}: {
  contentLocal: MotionValue<number>;
  warp?: boolean;
  hoveredNodeRef?: MutableRefObject<HoveredNodeData>;
}) {
  if (typeof window === "undefined") return null;

  return (
    <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
      <WorkflowParticlesCanvas contentLocal={contentLocal} warp={warp} hoveredNodeRef={hoveredNodeRef} />
    </div>
  );
}
