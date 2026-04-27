import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence, useMotionValue, animate, type MotionValue } from "motion/react";
import { NuqsAdapter } from "nuqs/adapters/react";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import {
  type SectionId,
  SECTIONS,
  SECTION_LABELS,
  SECTION_GROUP,
  DEFAULT_SECTION,
  findSection,
  sectionIndex,
  advance,
  retreat,
  beatToLocalProgress,
  createSkillBeatsResolver,
} from "../lib/sections";
import { SectionNavProvider } from "../context/SectionNavContext";
import { AnimationObserverProvider } from "../context/AnimationObserverContext";
import {
  grillMe,
  writeAPrd,
  prdToPlan,
  planToTracker,
  doWork,
  improveCodebaseArchitecture,
  handleCoderabbit,
} from "../data/skills";
import StickyHero from "./StickyHero";
import StickySkillSection from "./StickySkillSection";
import StickyContextRot from "./StickyContextRot";
import ReferencesSection from "./ReferencesSection";
import WorkflowDiagram, { type NodeScreenPosition, type HoveredNodeData } from "./WorkflowDiagram";
import DownloadButton from "./DownloadButton";
import WorkflowParticles from "./WorkflowParticles";

const SKILL_PROPS = {
  "skill-grill-me": grillMe,
  "skill-write-a-prd": writeAPrd,
  "skill-prd-to-plan": prdToPlan,
  "skill-plan-to-tracker": planToTracker,
  "skill-do-work": doWork,
  "skill-improve-codebase-architecture": improveCodebaseArchitecture,
  "skill-handle-coderabbit": handleCoderabbit,
} as const;

const WHEEL_COOLDOWN_MS = 700;
const TOUCH_THRESHOLD_PX = 50;
const ZOOM_DURATION_MS = 500;
const ZOOM_OUT_EXIT_MS = 200;
const ZOOM_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function WorkflowLayer({
  contentLocal,
  visibleCount,
  isZooming,
  isZoomingOut,
  nodePosition,
  onNodeReveal,
}: {
  contentLocal: MotionValue<number>;
  visibleCount: number;
  isZooming: boolean;
  isZoomingOut: boolean;
  nodePosition: NodeScreenPosition | null;
  onNodeReveal?: (nodeId: string, position: NodeScreenPosition) => void;
}) {
  const showCta = visibleCount === 7;
  const nodePositionRef = useRef<NodeScreenPosition | null>(null);
  const hoveredNodeRef = useRef<HoveredNodeData>({ position: null, startTime: 0 });

  const handleNodeReveal = useCallback(
    (nodeId: string, position: NodeScreenPosition) => {
      nodePositionRef.current = position;
      onNodeReveal?.(nodeId, position);
    },
    [onNodeReveal],
  );

  const origin = isZoomingOut ? nodePosition : nodePositionRef.current;
  const transformOrigin = origin ? `${origin.x}px ${origin.y}px` : "50% 50%";
  const animating = isZooming || isZoomingOut;

  const zoomT = { duration: ZOOM_DURATION_MS / 1000, ease: ZOOM_EASE } as const;

  return (
    <div className="h-dvh max-h-dvh w-full relative overflow-hidden">
      <WorkflowParticles contentLocal={contentLocal} warp={animating} hoveredNodeRef={hoveredNodeRef} />
      <div className="absolute inset-0 flex w-full flex-col items-center justify-center gap-6 sm:gap-8 py-4 px-0">
        <motion.div
          {...(isZoomingOut && { initial: { scale: 3, filter: "blur(12px)", opacity: 1 } })}
          animate={
            isZooming
              ? { scale: 3, filter: "blur(12px)", opacity: 0 }
              : { scale: 1, filter: "blur(0px)", opacity: 1 }
          }
          transition={zoomT}
          style={{ transformOrigin, willChange: animating ? "transform, filter, opacity" : "auto" }}
          className="w-full max-w-7xl mx-auto shrink-0 relative"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-1.5">
            O Workflow
          </h2>
          <p className="text-neutral-400 text-sm text-center max-w-2xl mx-auto">
            7 skills que transformam o uso da IA em um processo disciplinado e
            reproduzível.
          </p>
          <div
            className="mt-3 w-full flex flex-col items-stretch pointer-events-auto sm:mt-0 sm:absolute sm:right-0 sm:-bottom-2 sm:w-auto sm:items-end"
            style={{
              opacity: showCta ? 1 : 0,
              transform: `translateX(${showCta ? 0 : 8}px)`,
              transition: "opacity 0.4s ease, transform 0.4s ease",
              pointerEvents: showCta ? "auto" : "none",
            }}
          >
            <DownloadButton className="w-full justify-center sm:w-auto" />
          </div>
        </motion.div>
        <motion.div
          {...(isZoomingOut && { initial: { opacity: 0, filter: "blur(12px)" } })}
          animate={
            isZooming
              ? { opacity: 0, filter: "blur(12px)" }
              : { opacity: 1, filter: "blur(0px)" }
          }
          transition={zoomT}
          className="w-full min-h-0 min-w-0 flex-1 max-w-7xl mx-auto flex flex-col will-change-[opacity,filter]"
        >
          <div className="w-full h-full min-h-0 min-w-0 flex items-center justify-center pointer-events-auto">
            <WorkflowDiagram
              contentLocal={contentLocal}
              visibleCount={visibleCount}
              isZoomingOut={isZoomingOut}
              onNodeReveal={handleNodeReveal}
              hoveredNodeRef={hoveredNodeRef}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const LG_MQ = "(min-width: 1024px)";

function subscribeLg(callback: () => void) {
  const mq = window.matchMedia(LG_MQ);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getLgSnapshot() {
  return window.matchMedia(LG_MQ).matches;
}

function getLgServerSnapshot() {
  return false;
}

function useIsLg() {
  return useSyncExternalStore(subscribeLg, getLgSnapshot, getLgServerSnapshot);
}

function SectionBody({
  sectionId,
  beat,
  totalBeats,
  isWideLayout,
  isZooming,
  isZoomingOut,
  nodePosition,
  onNodeReveal,
}: {
  sectionId: SectionId;
  beat: number;
  totalBeats: number;
  isWideLayout: boolean;
  isZooming: boolean;
  isZoomingOut: boolean;
  nodePosition: NodeScreenPosition | null;
  onNodeReveal?: (nodeId: string, position: NodeScreenPosition) => void;
}) {
  const contentLocal = useMotionValue(beatToLocalProgress(beat, totalBeats));

  const prevBeatRef = useRef(beat);
  useEffect(() => {
    const target = beatToLocalProgress(beat, totalBeats);
    if (prevBeatRef.current !== beat) {
      animate(contentLocal, target, { duration: 0.45, ease: "easeInOut" });
      prevBeatRef.current = beat;
    }
  }, [beat, totalBeats, contentLocal]);

  if (sectionId === "hero") {
    return <StickyHero />;
  }
  if (sectionId.startsWith("workflow-")) {
    const n = parseInt(sectionId.split("-")[1], 10);
    return <WorkflowLayer contentLocal={contentLocal} visibleCount={n} isZooming={isZooming} isZoomingOut={isZoomingOut} nodePosition={nodePosition} onNodeReveal={onNodeReveal} />;
  }
  if (sectionId === "context-rot") {
    return <StickyContextRot contentLocal={contentLocal} />;
  }
  if (sectionId === "references") {
    return <ReferencesSection />;
  }

  const data = SKILL_PROPS[sectionId as keyof typeof SKILL_PROPS];
  if (!data) return null;
  return (
    <StickySkillSection
      {...data}
      sectionId={sectionId}
      contentLocal={contentLocal}
      beat={beat}
      isWideLayout={isWideLayout}
    />
  );
}

function SectionNavigator() {
  const [params, setParams] = useQueryStates({
    s: parseAsString.withDefault(DEFAULT_SECTION),
    b: parseAsInteger.withDefault(0),
  });

  const isLg = useIsLg();
  const resolveBeats = useMemo(() => createSkillBeatsResolver(isLg), [isLg]);

  const rawSectionId = params.s;
  const beat = params.b;
  const sectionId = (findSection(rawSectionId) ? rawSectionId : DEFAULT_SECTION) as SectionId;
  const totalBeats = resolveBeats(sectionId);
  const clampedBeat = Math.max(0, Math.min(beat, totalBeats - 1));

  const [isZooming, setIsZooming] = useState(false);
  const [isZoomingOut, setIsZoomingOut] = useState(false);
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoomOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoomOutRafRef = useRef<number | null>(null);
  const nodePositionRef = useRef<NodeScreenPosition | null>(null);

  const handleNodeReveal = useCallback(
    (_nodeId: string, position: NodeScreenPosition) => {
      nodePositionRef.current = position;
    },
    [],
  );

  useEffect(() => {
    if (isLg && sectionId.startsWith("skill-") && beat > 0) {
      setParams({ s: sectionId, b: 0 });
    }
  }, [isLg, sectionId, beat, setParams]);

  const step = useCallback(
    (direction: "forward" | "backward") => {
      if (isZooming) return;

      if (zoomOutRafRef.current) {
        cancelAnimationFrame(zoomOutRafRef.current);
        zoomOutRafRef.current = null;
      }
      if (zoomOutTimerRef.current) {
        clearTimeout(zoomOutTimerRef.current);
        zoomOutTimerRef.current = null;
        setIsZoomingOut(false);
      }

      const state = { sectionId, beat: clampedBeat };
      const next =
        direction === "forward"
          ? advance(state, resolveBeats)
          : retreat(state, resolveBeats);
      if (next.sectionId === sectionId && next.beat === clampedBeat) return;

      const leavingWorkflow = sectionId.startsWith("workflow-");
      const enteringSkill = next.sectionId.startsWith("skill-");
      const leavingSkill = sectionId.startsWith("skill-");
      const enteringWorkflow = next.sectionId.startsWith("workflow-");

      if (leavingWorkflow && enteringSkill && direction === "forward") {
        setIsZooming(true);
        zoomTimerRef.current = setTimeout(() => {
          setParams({ s: next.sectionId, b: next.beat });
          setIsZooming(false);
        }, ZOOM_DURATION_MS);
      } else if (leavingSkill && enteringWorkflow && direction === "forward") {
        setIsZoomingOut(true);
        zoomOutRafRef.current = requestAnimationFrame(() => {
          zoomOutRafRef.current = null;
          setParams({ s: next.sectionId, b: next.beat });
          zoomOutTimerRef.current = setTimeout(() => {
            zoomOutTimerRef.current = null;
            setIsZoomingOut(false);
          }, ZOOM_OUT_EXIT_MS + ZOOM_DURATION_MS);
        });
      } else if (leavingSkill && enteringWorkflow && direction === "backward") {
        setParams({ s: next.sectionId, b: next.beat });
      } else {
        setParams({ s: next.sectionId, b: next.beat });
      }
    },
    [sectionId, clampedBeat, setParams, isZooming, resolveBeats],
  );

  useEffect(() => {
    return () => {
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
      if (zoomOutTimerRef.current) clearTimeout(zoomOutTimerRef.current);
      if (zoomOutRafRef.current) cancelAnimationFrame(zoomOutRafRef.current);
    };
  }, []);

  const cooldownRef = useRef(false);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      const scrollable = target?.closest("[data-scroll-capture]") as HTMLElement | null;
      if (scrollable) {
        const atTop = scrollable.scrollTop <= 0 && e.deltaY < 0;
        const atBottom =
          scrollable.scrollTop + scrollable.clientHeight >=
            scrollable.scrollHeight - 1 && e.deltaY > 0;
        if (!atTop && !atBottom) return;
      }
      e.preventDefault();
      if (cooldownRef.current || Math.abs(e.deltaY) < 5) return;
      cooldownRef.current = true;
      step(e.deltaY > 0 ? "forward" : "backward");
      setTimeout(() => {
        cooldownRef.current = false;
      }, WHEEL_COOLDOWN_MS);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [step]);

  useEffect(() => {
    const NAVIGABLE_KEYS: Record<string, "forward" | "backward"> = {
      ArrowDown: "forward",
      PageDown: "forward",
      ArrowUp: "backward",
      PageUp: "backward",
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const direction = NAVIGABLE_KEYS[e.key];
      if (!direction) return;

      const active = document.activeElement as HTMLElement | null;
      if (!active) return;

      const tag = active.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (active.isContentEditable) return;
      if (active.closest("[data-scroll-capture]")) return;

      e.preventDefault();
      if (cooldownRef.current) return;
      cooldownRef.current = true;
      step(direction);
      setTimeout(() => {
        cooldownRef.current = false;
      }, WHEEL_COOLDOWN_MS);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step]);

  const touchStartY = useRef<number | null>(null);
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      touchStartY.current = null;
      if (Math.abs(deltaY) < TOUCH_THRESHOLD_PX || cooldownRef.current) return;
      cooldownRef.current = true;
      step(deltaY > 0 ? "forward" : "backward");
      setTimeout(() => {
        cooldownRef.current = false;
      }, WHEEL_COOLDOWN_MS);
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [step]);

  const onNavigate = useCallback(
    (id: SectionId, b = 0) => {
      setParams({ s: id, b });
    },
    [setParams],
  );

  return (
    <SectionNavProvider onNavigate={onNavigate}>
      <div className="fixed inset-0 overflow-hidden bg-neutral-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${sectionId}-${clampedBeat}`}
            initial={isZoomingOut ? { opacity: 1 } : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={isZoomingOut ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: isZoomingOut ? ZOOM_OUT_EXIT_MS / 1000 : 0.5, ease: "easeInOut" }}
            className="w-full h-dvh"
          >
            <SectionBody
              sectionId={sectionId}
              beat={clampedBeat}
              totalBeats={totalBeats}
              isWideLayout={isLg}
              isZooming={isZooming}
              isZoomingOut={isZoomingOut}
              nodePosition={nodePositionRef.current}
              onNodeReveal={handleNodeReveal}
            />
          </motion.div>
        </AnimatePresence>

        <footer className="fixed bottom-0 inset-x-0 z-50 px-4 py-3 border-t border-neutral-800/50 bg-neutral-950/80 backdrop-blur-sm">
          <nav className="flex items-center justify-center text-xs">
            {SECTIONS.filter((s) => !s.hidden).map((sec, i, visible) => {
              const activeIdx = sectionIndex(sectionId);
              const secIdx = sectionIndex(sec.id);
              const isActive = sec.id === sectionId || (secIdx > 0 && SECTIONS[secIdx - 1]?.id === sectionId && SECTIONS[secIdx - 1]?.hidden);
              const isPast = secIdx < activeIdx;
              const prevGroup = i > 0 ? SECTION_GROUP[visible[i - 1].id] : SECTION_GROUP[sec.id];
              const isGroupStart = SECTION_GROUP[sec.id] !== prevGroup;

              return (
                <button
                  key={sec.id}
                  onClick={() => setParams({ s: sec.id, b: 0 })}
                  className={[
                    "cursor-pointer transition-colors",
                    isGroupStart && i > 0 ? "ml-4 md:ml-5" : "ml-1.5 md:ml-2",
                    isActive
                      ? "text-emerald-400"
                      : isPast
                        ? "text-neutral-500 hover:text-neutral-300"
                        : "text-neutral-700 hover:text-neutral-400",
                  ].join(" ")}
                  aria-current={isActive ? "step" : undefined}
                  title={SECTION_LABELS[sec.id]}
                >
                  <span className="md:hidden flex items-center justify-center">
                    <span
                      className={[
                        "block rounded-full transition-all",
                        isActive ? "w-2.5 h-2.5 bg-emerald-400" : "w-1.5 h-1.5 bg-current",
                      ].join(" ")}
                    />
                  </span>
                  <span className="hidden md:inline">
                    {SECTION_LABELS[sec.id]}
                  </span>
                </button>
              );
            })}
          </nav>
        </footer>
      </div>
    </SectionNavProvider>
  );
}

export default function VerticalScrollPage() {
  return (
    <NuqsAdapter>
      <AnimationObserverProvider>
        <SectionNavigator />
      </AnimationObserverProvider>
    </NuqsAdapter>
  );
}
