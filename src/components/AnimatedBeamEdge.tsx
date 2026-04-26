import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { getBezierPath, type EdgeProps } from "@xyflow/react";
import { motion, useAnimationControls } from "motion/react";

type BeamEdgeData = {
  beamColor: string;
  baseColor: string;
  sequenceIndex?: number;
  sequentialMode?: boolean;
};

const BASE_OPACITY = 0.4;
const BEAM_STROKE_WIDTH = 4;
const DRAW_DURATION = 0.6;
const DRAW_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const REVEAL_BEAM_DURATION = 0.5;
const SEQ_BEAM_DURATION = 0.8;
const SEQ_OVERLAP = 0.1;
const SEQ_EDGE_COUNT = 5;
const SEQ_CYCLE =
  SEQ_EDGE_COUNT * SEQ_BEAM_DURATION -
  (SEQ_EDGE_COUNT - 1) * SEQ_OVERLAP;
const SEQ_GLOW_STD = 6;
const REVEAL_GLOW_STD = 4;

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

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
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
  const {
    beamColor,
    baseColor,
    sequenceIndex,
    sequentialMode = false,
  } = (data ?? {}) as BeamEdgeData;
  const reducedMotion = useReducedMotion();
  const beamControls = useAnimationControls();
  const wasVisibleRef = useRef(false);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [drawComplete, setDrawComplete] = useState(false);

  const visible = Number(style?.opacity ?? 1) > 0;

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [sourceX, sourceY, targetX, targetY]);

  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      setDrawComplete(false);

      if (reducedMotion) {
        setDrawComplete(true);
      } else {
        const drawTimer = setTimeout(() => {
          setDrawComplete(true);
          if (!sequentialMode) {
            beamControls.start({
              x1: ["10%", "110%"],
              x2: ["0%", "100%"],
              y1: ["0%", "0%"],
              y2: ["0%", "0%"],
            });
          }
        }, DRAW_DURATION * 1000);
        return () => clearTimeout(drawTimer);
      }
    }

    if (!visible && wasVisibleRef.current) {
      setDrawComplete(false);
      beamControls.stop();
    }

    wasVisibleRef.current = visible;
  }, [visible, reducedMotion, beamControls, sequentialMode]);

  useEffect(() => {
    if (!sequentialMode || !drawComplete || !visible || reducedMotion) return;

    if (sequenceIndex == null) {
      beamControls.start({
        x1: ["10%", "110%"],
        x2: ["0%", "100%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      });
      return;
    }

    const edgeDelay =
      sequenceIndex * (SEQ_BEAM_DURATION - SEQ_OVERLAP);

    const loopBeam = () => {
      beamControls.set({ x1: "0%", x2: "0%", y1: "0%", y2: "0%" });

      const delayTimer = setTimeout(() => {
        beamControls.start({
          x1: ["10%", "110%"],
          x2: ["0%", "100%"],
          y1: ["0%", "0%"],
          y2: ["0%", "0%"],
        });
      }, edgeDelay * 1000);

      return delayTimer;
    };

    let delayTimer = loopBeam();
    const interval = setInterval(() => {
      delayTimer = loopBeam();
    }, SEQ_CYCLE * 1000);

    return () => {
      clearTimeout(delayTimer);
      clearInterval(interval);
    };
  }, [
    sequentialMode,
    sequenceIndex,
    drawComplete,
    visible,
    reducedMotion,
    beamControls,
  ]);

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const strokeWidth = (style?.strokeWidth as number) ?? 2;

  const isDrawing = visible && !reducedMotion && pathLength > 0;

  const glowStd =
    sequentialMode && sequenceIndex != null ? SEQ_GLOW_STD : REVEAL_GLOW_STD;
  const beamDuration =
    sequentialMode && sequenceIndex != null
      ? SEQ_BEAM_DURATION
      : REVEAL_BEAM_DURATION;

  return (
    <g
      style={{
        opacity: style?.opacity ?? 1,
        transition: style?.transition as string | undefined,
      }}
    >
      <path
        ref={pathRef}
        d={edgePath}
        fill="none"
        stroke={baseColor}
        strokeWidth={strokeWidth}
        strokeOpacity={reducedMotion ? 1 : BASE_OPACITY}
        strokeLinecap="round"
        style={
          isDrawing
            ? {
                strokeDasharray: pathLength,
                strokeDashoffset: drawComplete ? 0 : pathLength,
                transition: drawComplete
                  ? "none"
                  : `stroke-dashoffset ${DRAW_DURATION}s cubic-bezier(${DRAW_EASE.join(",")})`,
              }
            : undefined
        }
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
            <filter
              id={glowFilterId}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation={glowStd}
                result="blur"
              />
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
              animate={beamControls}
              transition={{
                duration: beamDuration,
                ease: DRAW_EASE,
                repeat: sequentialMode ? 0 : Infinity,
                repeatDelay: 0,
              }}
            >
              <stop stopColor={beamColor} stopOpacity="0" />
              <stop
                offset={sequentialMode && sequenceIndex != null ? "5%" : "0%"}
                stopColor={beamColor}
              />
              <stop
                offset={
                  sequentialMode && sequenceIndex != null ? "50%" : "32.5%"
                }
                stopColor={beamColor}
              />
              <stop offset="100%" stopColor={beamColor} stopOpacity="0" />
            </motion.linearGradient>
          </defs>

          {drawComplete && (
            <path
              d={edgePath}
              fill="none"
              strokeWidth={BEAM_STROKE_WIDTH}
              stroke={`url(#${gradientId})`}
              strokeLinecap="round"
              filter={`url(#${glowFilterId})`}
            />
          )}
        </>
      )}
    </g>
  );
}
