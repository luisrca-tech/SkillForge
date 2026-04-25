import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { ScrollStoryProvider, useScrollStory } from "../context/ScrollStoryContext";
import {
  applyWheelToScrollRoot,
  shouldDelegateWheelToInner,
} from "../lib/rootWheelScroll";
import {
  STORY_SECTIONS,
  TOTAL_STORY_VH,
  type StorySection,
} from "../lib/scrollSections";
import {
  contentLocalAt,
  sectionOpacity,
  sectionScale,
  sectionZIndex,
} from "../lib/sectionTransition";
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

function WorkflowLayer() {
  return (
    <div className="h-dvh max-h-dvh w-full flex flex-col min-h-0 overflow-hidden items-center justify-center px-4 sm:px-6 py-4 pointer-events-none">
      <div className="w-full max-w-6xl mx-auto shrink-0 pointer-events-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-1">
          O Workflow
        </h2>
        <p className="text-neutral-400 text-sm text-center max-w-2xl mx-auto mb-4">
          7 skills que transformam o uso da IA em um processo disciplinado e
          reproduzível.
        </p>
      </div>
      <div className="w-full min-h-0 flex-1 max-w-6xl mx-auto will-change-transform">
        <WorkflowDiagram />
      </div>
    </div>
  );
}

function StackedSection({
  storyProgress,
  s,
  sectionIndex,
}: {
  storyProgress: MotionValue<number>;
  s: StorySection;
  sectionIndex: number;
}) {
  const contentLocal = useTransform(storyProgress, (p) =>
    contentLocalAt(p, sectionIndex),
  );
  const opacity = useTransform(storyProgress, (p) =>
    sectionOpacity(p, sectionIndex),
  );
  const scale = useTransform(storyProgress, (p) => sectionScale(p, sectionIndex));
  const zIndex = useTransform(storyProgress, (p) => sectionZIndex(p, sectionIndex));

  let body: ReactNode;
  if (s.id === "hero") {
    body = <StickyHero />;
  } else if (s.id === "workflow") {
    body = <WorkflowLayer />;
  } else if (s.id === "context-rot") {
    body = <StickyContextRot contentLocal={contentLocal} />;
  } else {
    const data = SKILL_PROPS[s.id as keyof typeof SKILL_PROPS];
    body = data ? (
      <StickySkillSection {...data} contentLocal={contentLocal} />
    ) : null;
  }

  return (
    <motion.div
      className="absolute inset-0 w-full h-dvh max-h-dvh pointer-events-none will-change-transform"
      style={{
        opacity,
        scale,
        zIndex,
        transformOrigin: "50% 50%",
      }}
    >
      {body}
    </motion.div>
  );
}

function HashOnLoad() {
  const ctx = useScrollStory();
  useEffect(() => {
    if (!ctx) {
      return;
    }
    const { scrollToHash } = ctx;
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      requestAnimationFrame(() => {
        scrollToHash(hash);
      });
    }
  }, [ctx]);
  return null;
}

function HashLinkCapture() {
  const ctx = useScrollStory();
  useEffect(() => {
    if (!ctx) {
      return;
    }
    const { scrollToHash } = ctx;
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("a[href^='#']");
      if (!el) {
        return;
      }
      if ((el as HTMLAnchorElement).getAttribute("href") === "#") {
        return;
      }
      e.preventDefault();
      scrollToHash((el as HTMLAnchorElement).getAttribute("href")!);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
    };
  }, [ctx]);
  return null;
}

function ScrollStoryLayout() {
  const storyProgress = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    const spacer = spacerRef.current;
    if (!root || !spacer) {
      return;
    }
    const update = () => {
      const S = spacer.offsetHeight;
      const V = root.clientHeight;
      const t = root.scrollTop;
      const cap = Math.max(0, S - V);
      const p = cap === 0 ? 0 : t >= cap ? 1 : t / cap;
      storyProgress.set(Math.min(1, Math.max(0, p)));
    };
    update();
    root.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(root);
    ro.observe(spacer);
    const onWheel: EventListener = (ev) => {
      const e = ev as WheelEvent;
      if (e.deltaY === 0) {
        return;
      }
      if (shouldDelegateWheelToInner(e.target, root, e)) {
        return;
      }
      e.preventDefault();
      applyWheelToScrollRoot(root, e);
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      root.removeEventListener("scroll", update);
      root.removeEventListener("wheel", onWheel);
      ro.disconnect();
    };
  }, [storyProgress]);

  return (
    <ScrollStoryProvider
      containerRef={containerRef}
      storyProgress={storyProgress}
    >
      <HashOnLoad />
      <HashLinkCapture />
      <div
        ref={containerRef}
        id="scroll-container"
        className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden overscroll-none touch-pan-y"
        tabIndex={-1}
      >
        <div className="fixed inset-0 z-40 pointer-events-none h-dvh max-h-dvh">
          <div className="relative w-full h-full min-h-0">
            {STORY_SECTIONS.map((s, sectionIndex) => (
              <StackedSection
                key={s.id}
                storyProgress={storyProgress}
                s={s}
                sectionIndex={sectionIndex}
              />
            ))}
          </div>
        </div>

        <div
          ref={spacerRef}
          className="relative w-full pointer-events-none"
          style={{ minHeight: `${TOTAL_STORY_VH}vh` }}
        >
          {STORY_SECTIONS.map((s) => (
            <div
              key={s.id}
              id={s.id}
              className="w-full"
              style={{ minHeight: `${s.vh}vh` }}
            />
          ))}
        </div>
        <footer className="relative z-[60] px-4 sm:px-6 py-12 sm:py-16 border-t border-neutral-800 bg-neutral-950">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <p className="text-sm uppercase tracking-widest text-emerald-400 font-mono">
              AI Coding Workflow
            </p>
            <p className="text-neutral-500 text-sm">
              Workflow profissional de desenvolvimento assistido por IA.
            </p>
            <nav className="flex items-center justify-center gap-6 text-sm text-neutral-600">
              <a
                href="#hero"
                className="hover:text-neutral-300 transition-colors"
              >
                Topo
              </a>
              <a
                href="#workflow"
                className="hover:text-neutral-300 transition-colors"
              >
                Workflow
              </a>
              <a
                href="#context-rot"
                className="hover:text-neutral-300 transition-colors"
              >
                Context Rot
              </a>
            </nav>
          </div>
        </footer>
      </div>
    </ScrollStoryProvider>
  );
}

export default function VerticalScrollPage() {
  return <ScrollStoryLayout />;
}
