import WorkflowParticlesCanvas from "./WorkflowParticlesCanvas";
import type { MotionValue } from "motion/react";

export default function WorkflowParticles({
  contentLocal,
  warp = false,
}: {
  contentLocal: MotionValue<number>;
  warp?: boolean;
}) {
  if (typeof window === "undefined") return null;

  return (
    <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
      <WorkflowParticlesCanvas contentLocal={contentLocal} warp={warp} />
    </div>
  );
}
