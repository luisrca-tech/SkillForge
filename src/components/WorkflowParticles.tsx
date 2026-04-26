import { lazy, Suspense } from "react";
import type { MotionValue } from "motion/react";

const WorkflowParticlesCanvas = lazy(() => import("./WorkflowParticlesCanvas"));

export default function WorkflowParticles({
  contentLocal,
}: {
  contentLocal: MotionValue<number>;
}) {
  if (typeof window === "undefined") return null;

  return (
    <div
      className="absolute inset-0"
      style={{
        pointerEvents: "none",
        animation: "particles-fade-in 0.6s ease-out forwards",
        opacity: 0,
      }}
    >
      <Suspense fallback={null}>
        <WorkflowParticlesCanvas contentLocal={contentLocal} />
      </Suspense>
    </div>
  );
}
