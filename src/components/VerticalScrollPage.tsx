import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate, useMotionValueEvent, type MotionValue } from "motion/react";
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
import DownloadButton from "./DownloadButton";

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

const CTA_THRESHOLD = 0.875;

function WorkflowLayer({ contentLocal }: { contentLocal: MotionValue<number> }) {
  const [showCta, setShowCta] = useState(contentLocal.get() >= CTA_THRESHOLD);

  useMotionValueEvent(contentLocal, "change", (p) => {
    setShowCta(p >= CTA_THRESHOLD);
  });

  return (
    <div className="h-dvh max-h-dvh w-full flex flex-col min-h-0 overflow-hidden items-center justify-center gap-6 sm:gap-8 px-4 sm:px-6 py-4 relative">
      <div className="w-full max-w-7xl mx-auto shrink-0 relative">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-1.5">
          O Workflow
        </h2>
        <p className="text-neutral-400 text-sm text-center max-w-2xl mx-auto">
          7 skills que transformam o uso da IA em um processo disciplinado e
          reproduzível.
        </p>
        <div
          className="absolute right-0 -bottom-2 pointer-events-auto"
          style={{
            opacity: showCta ? 1 : 0,
            transform: `translateX(${showCta ? 0 : 8}px)`,
            transition: "opacity 0.4s ease, transform 0.4s ease",
            pointerEvents: showCta ? "auto" : "none",
          }}
        >
          <DownloadButton />
        </div>
      </div>
      <div className="w-full min-h-0 min-w-0 flex-1 max-w-7xl mx-auto will-change-transform flex flex-col">
        <div className="w-full h-full min-h-0 min-w-0 flex items-center justify-center pointer-events-auto">
          <WorkflowDiagram contentLocal={contentLocal} />
        </div>
      </div>
    </div>
  );
}

function SectionBody({
  sectionId,
  beat,
  totalBeats,
}: {
  sectionId: SectionId;
  beat: number;
  totalBeats: number;
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
  if (sectionId === "workflow") {
    return <WorkflowLayer contentLocal={contentLocal} />;
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
            key={sectionId}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-dvh"
          >
            <SectionBody
              sectionId={sectionId}
              beat={clampedBeat}
              totalBeats={section.beats}
            />
          </motion.div>
        </AnimatePresence>

        <footer className="fixed bottom-0 inset-x-0 z-50 px-4 py-3 border-t border-neutral-800/50 bg-neutral-950/80 backdrop-blur-sm">
          <nav className="flex items-center justify-center text-xs">
            {SECTIONS.map((sec, i) => {
              const activeIdx = sectionIndex(sectionId);
              const isActive = sec.id === sectionId;
              const isPast = i < activeIdx;
              const prevGroup = i > 0 ? SECTION_GROUP[SECTIONS[i - 1].id] : SECTION_GROUP[sec.id];
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
      <SectionNavigator />
    </NuqsAdapter>
  );
}
