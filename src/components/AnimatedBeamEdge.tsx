import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { getBezierPath, type EdgeProps } from "@xyflow/react";
import { motion, useAnimationControls } from "motion/react";

type BeamEdgeData = {
  beamColor: string;
  baseColor: string;
  targetDescription?: string;
};

const BASE_OPACITY = 0.4;
const BEAM_DURATION = 0.5;
const BEAM_STROKE_WIDTH = 4;
const CARD_HOLD_MS = 1500;
const CARD_WIDTH = 200;
const CARD_HEIGHT = 64;
const CARD_OFFSET_Y = 28;

function getReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeReducedMotion(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
}

type CardPhase = "idle" | "visible" | "exiting";

function DescriptionCard({
  description,
  color,
  visible,
  reducedMotion,
}: {
  description: string;
  color: string;
  visible: boolean;
  reducedMotion: boolean;
}) {
  const [phase, setPhase] = useState<CardPhase>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (visible && !hasShownRef.current) {
      hasShownRef.current = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase("visible");
        });
      });

      timerRef.current = setTimeout(() => {
        setPhase("exiting");
      }, CARD_HOLD_MS);
    }

    if (!visible) {
      hasShownRef.current = false;
      clearTimeout(timerRef.current);
      setPhase("idle");
    }

    return () => clearTimeout(timerRef.current);
  }, [visible]);

  const isShown = phase === "visible";
  const isExiting = phase === "exiting";

  return (
    <div
      style={{
        opacity: isShown ? 1 : 0,
        transform: `translateY(${isShown ? 0 : isExiting ? -4 : 8}px)`,
        transition: reducedMotion
          ? "opacity 0.1s"
          : "opacity 0.35s ease, transform 0.35s ease",
        pointerEvents: "none",
        background: "rgba(24, 24, 27, 0.80)",
        borderColor: color,
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 6,
        padding: "6px 10px",
        width: CARD_WIDTH,
        backdropFilter: "blur(12px)",
      }}
      className="text-[11px] leading-tight text-zinc-200"
    >
      {description}
    </div>
  );
}

export default function AnimatedBeamEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
}: EdgeProps) {
  const gradientId = useId();
  const glowFilterId = `beam-glow-${gradientId}`;
  const { beamColor, baseColor, targetDescription } = (data ?? {}) as BeamEdgeData;
  const reducedMotion = useReducedMotion();
  const controls = useAnimationControls();
  const wasVisibleRef = useRef(false);

  const visible = Number(style?.opacity ?? 1) > 0;

  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      controls.start({
        x1: ["10%", "110%"],
        x2: ["0%", "100%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      });
    }
    wasVisibleRef.current = visible;
  }, [visible, controls]);

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const strokeWidth = (style?.strokeWidth as number) ?? 2;

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  return (
    <g
      style={{
        opacity: style?.opacity ?? 1,
        transition: style?.transition as string | undefined,
      }}
    >
      <path
        d={edgePath}
        fill="none"
        stroke={baseColor}
        strokeWidth={strokeWidth}
        strokeOpacity={reducedMotion ? 1 : BASE_OPACITY}
        strokeLinecap="round"
      />

      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="react-flow__edge-interaction"
      />

      {!reducedMotion && (
        <>
          <defs>
            <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <motion.linearGradient
              className="transform-gpu"
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
              animate={controls}
              transition={{
                duration: BEAM_DURATION,
                ease: [0.16, 1, 0.3, 1],
                repeat: Infinity,
                repeatDelay: 0,
              }}
            >
              <stop stopColor={beamColor} stopOpacity="0" />
              <stop stopColor={beamColor} />
              <stop offset="32.5%" stopColor={beamColor} />
              <stop offset="100%" stopColor={beamColor} stopOpacity="0" />
            </motion.linearGradient>
          </defs>

          <path
            d={edgePath}
            fill="none"
            strokeWidth={BEAM_STROKE_WIDTH}
            stroke={`url(#${gradientId})`}
            strokeLinecap="round"
            filter={`url(#${glowFilterId})`}
          />
        </>
      )}

      {targetDescription && (
        <foreignObject
          x={midX - CARD_WIDTH / 2}
          y={midY - CARD_HEIGHT - CARD_OFFSET_Y}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          style={{ overflow: "visible", pointerEvents: "none" }}
        >
          <DescriptionCard
            description={targetDescription}
            color={baseColor}
            visible={visible}
            reducedMotion={reducedMotion}
          />
        </foreignObject>
      )}
    </g>
  );
}
