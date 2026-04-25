import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "motion/react";
import { NuqsAdapter } from "nuqs/adapters/react";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import {
  SECTIONS,
  type SectionId,
  DEFAULT_SECTION,
  findSection,
  advance,
  retreat,
  beatToLocalProgress,
} from "../lib/sections";
import { SectionNavProvider } from "../context/SectionNavContext";
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
import WorkflowDiagram from "./WorkflowDiagram";

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

function WorkflowLayer() {
  return (
    <div className="h-dvh max-h-dvh w-full flex flex-col min-h-0 overflow-hidden items-center justify-center gap-6 sm:gap-8 px-4 sm:px-6 py-4">
      <div className="w-full max-w-7xl mx-auto shrink-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-1.5">
          O Workflow
        </h2>
        <p className="text-neutral-400 text-sm text-center max-w-2xl mx-auto">
          7 skills que transformam o uso da IA em um processo disciplinado e
          reproduzível.
        </p>
      </div>
      <div className="w-full min-h-0 min-w-0 flex-1 max-w-7xl mx-auto will-change-transform flex flex-col">
        <div className="w-full h-full min-h-0 min-w-0 flex items-center justify-center pointer-events-auto">
          <WorkflowDiagram />
        </div>
      </div>
    </div>
  );
}

function SectionBody({
  sectionId,
  contentLocal,
}: {
  sectionId: SectionId;
  contentLocal: ReturnType<typeof useMotionValue<number>>;
}) {
  if (sectionId === "hero") {
    return <StickyHero />;
  }
  if (sectionId === "workflow") {
    return <WorkflowLayer />;
  }
  if (sectionId === "context-rot") {
    return <StickyContextRot contentLocal={contentLocal} />;
  }

  const data = SKILL_PROPS[sectionId as keyof typeof SKILL_PROPS];
  if (!data) return null;
  return <StickySkillSection {...data} contentLocal={contentLocal} />;
}

function SectionNavigator() {
  const [params, setParams] = useQueryStates({
    s: parseAsString.withDefault(DEFAULT_SECTION),
    b: parseAsInteger.withDefault(0),
  });

  const rawSectionId = params.s;
  const beat = params.b;
  const sectionId = (findSection(rawSectionId) ? rawSectionId : DEFAULT_SECTION) as SectionId;
  const section = findSection(sectionId)!;
  const clampedBeat = Math.max(0, Math.min(beat, section.beats - 1));

  const contentLocal = useMotionValue(
    beatToLocalProgress(clampedBeat, section.beats),
  );

  const prevSectionRef = useRef(sectionId);
  useEffect(() => {
    const target = beatToLocalProgress(clampedBeat, section.beats);
    if (prevSectionRef.current !== sectionId) {
      contentLocal.set(target);
      prevSectionRef.current = sectionId;
    } else {
      animate(contentLocal, target, { duration: 0.45, ease: "easeInOut" });
    }
  }, [sectionId, clampedBeat, section.beats, contentLocal]);

  const step = useCallback(
    (direction: "forward" | "backward") => {
      const state = { sectionId, beat: clampedBeat };
      const next = direction === "forward" ? advance(state) : retreat(state);
      if (next.sectionId !== sectionId || next.beat !== clampedBeat) {
        setParams({ s: next.sectionId, b: next.beat });
      }
    },
    [sectionId, clampedBeat, setParams],
  );

  const cooldownRef = useRef(false);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
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
            key={sectionId}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-dvh"
          >
            <SectionBody
              sectionId={sectionId}
              contentLocal={contentLocal}
            />
          </motion.div>
        </AnimatePresence>

        <footer className="fixed bottom-0 inset-x-0 z-50 px-4 py-3 border-t border-neutral-800/50 bg-neutral-950/80 backdrop-blur-sm">
          <nav className="flex items-center justify-center gap-6 text-xs text-neutral-600">
            <button
              onClick={() => setParams({ s: "hero", b: 0 })}
              className="hover:text-neutral-300 transition-colors"
            >
              Topo
            </button>
            <button
              onClick={() => setParams({ s: "workflow", b: 0 })}
              className="hover:text-neutral-300 transition-colors"
            >
              Workflow
            </button>
            <button
              onClick={() => setParams({ s: "context-rot", b: 0 })}
              className="hover:text-neutral-300 transition-colors"
            >
              Context Rot
            </button>
          </nav>
        </footer>
      </div>
    </SectionNavProvider>
  );
}

export default function VerticalScrollPage() {
  return (
    <NuqsAdapter>
      <SectionNavigator />
    </NuqsAdapter>
  );
}
