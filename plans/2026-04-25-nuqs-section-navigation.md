# Nuqs Section Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the scroll-driven 2800vh spacer architecture with discrete section/beat navigation using nuqs query params (`?s=hero&b=0`), with wheel/touch gestures advancing through beats and AnimatePresence handling section transitions.

**Architecture:** Each section has a known beat count (hero=1, workflow=1, context-rot=5, each skill=3). Wheel/touch gestures advance or retreat one beat at a time — crossing a section boundary triggers AnimatePresence enter/exit. Within a section, beats drive a `localProgress` MotionValue animated to `(beat * 2 + 1) / (totalBeats * 2)`, preserving the existing substitutiveBeats opacity/y math untouched.

**Tech Stack:** Astro + React islands, nuqs (React SPA adapter), motion (framer-motion), vitest

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/lib/sections.ts` | Section definitions, beat counts, pure advance/retreat/beatToLocalProgress functions |
| Create | `src/lib/sections.test.ts` | Unit tests for navigation logic |
| Create | `src/context/SectionNavContext.tsx` | Context providing `navigateTo(sectionId, beat?)` |
| Create | `vitest.config.ts` | Test runner config |
| Modify | `src/components/VerticalScrollPage.tsx` | Complete rewrite: NuqsAdapter, wheel/touch handler, AnimatePresence |
| Modify | `src/components/StickyHero.tsx` | Remove `localProgress` prop (AnimatePresence handles exit) |
| Modify | `src/components/WorkflowDiagram.tsx` | Replace `useScrollToSection` with `useNavigateTo`, remove IntersectionObserver |
| Keep | `src/components/StickySkillSection.tsx` | Unchanged — still receives `localProgress: MotionValue<number>` |
| Keep | `src/components/StickyContextRot.tsx` | Unchanged — still receives `localProgress: MotionValue<number>` |
| Keep | `src/lib/substitutiveBeats.ts` | Unchanged — math works with animated localProgress values |
| Delete | `src/lib/scrollSections.ts` | Replaced by `sections.ts` |
| Delete | `src/context/ScrollStoryContext.tsx` | Replaced by `SectionNavContext.tsx` |

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install nuqs and vitest**

```bash
npm install nuqs
npm install -D vitest
```

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Add test script to package.json**

Add to the `"scripts"` section:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add nuqs and vitest dependencies"
```

---

### Task 2: Section navigation logic (TDD)

**Files:**
- Create: `src/lib/sections.ts`
- Create: `src/lib/sections.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/sections.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  advance,
  retreat,
  beatToLocalProgress,
  findSection,
  sectionIndex,
  SECTIONS,
  type NavState,
} from "./sections";

describe("findSection", () => {
  it("returns the section for a valid id", () => {
    const s = findSection("context-rot");
    expect(s).toEqual({ id: "context-rot", beats: 5 });
  });

  it("returns undefined for an invalid id", () => {
    expect(findSection("nope")).toBeUndefined();
  });
});

describe("sectionIndex", () => {
  it("returns 0 for hero", () => {
    expect(sectionIndex("hero")).toBe(0);
  });

  it("returns -1 for unknown id", () => {
    expect(sectionIndex("unknown")).toBe(-1);
  });

  it("returns correct index for last section", () => {
    expect(sectionIndex("skill-handle-coderabbit")).toBe(SECTIONS.length - 1);
  });
});

describe("advance", () => {
  it("advances beat within a multi-beat section", () => {
    const result = advance({ sectionId: "context-rot", beat: 0 });
    expect(result).toEqual({ sectionId: "context-rot", beat: 1 });
  });

  it("advances to next section when on last beat", () => {
    const result = advance({ sectionId: "context-rot", beat: 4 });
    expect(result).toEqual({ sectionId: "skill-grill-me", beat: 0 });
  });

  it("stays put on last beat of last section", () => {
    const result = advance({ sectionId: "skill-handle-coderabbit", beat: 2 });
    expect(result).toEqual({ sectionId: "skill-handle-coderabbit", beat: 2 });
  });

  it("advances single-beat section to next section", () => {
    const result = advance({ sectionId: "hero", beat: 0 });
    expect(result).toEqual({ sectionId: "workflow", beat: 0 });
  });

  it("advances workflow to context-rot", () => {
    const result = advance({ sectionId: "workflow", beat: 0 });
    expect(result).toEqual({ sectionId: "context-rot", beat: 0 });
  });
});

describe("retreat", () => {
  it("retreats beat within a multi-beat section", () => {
    const result = retreat({ sectionId: "context-rot", beat: 3 });
    expect(result).toEqual({ sectionId: "context-rot", beat: 2 });
  });

  it("retreats to previous section last beat when on beat 0", () => {
    const result = retreat({ sectionId: "skill-grill-me", beat: 0 });
    expect(result).toEqual({ sectionId: "context-rot", beat: 4 });
  });

  it("stays put on first beat of first section", () => {
    const result = retreat({ sectionId: "hero", beat: 0 });
    expect(result).toEqual({ sectionId: "hero", beat: 0 });
  });

  it("retreats from workflow to hero last beat", () => {
    const result = retreat({ sectionId: "workflow", beat: 0 });
    expect(result).toEqual({ sectionId: "hero", beat: 0 });
  });
});

describe("beatToLocalProgress", () => {
  it("returns 0 for single-beat sections", () => {
    expect(beatToLocalProgress(0, 1)).toBe(0);
  });

  it("maps beat 0 of 3 to 1/6", () => {
    expect(beatToLocalProgress(0, 3)).toBeCloseTo(1 / 6);
  });

  it("maps beat 1 of 3 to 3/6", () => {
    expect(beatToLocalProgress(1, 3)).toBeCloseTo(3 / 6);
  });

  it("maps beat 2 of 3 to 5/6", () => {
    expect(beatToLocalProgress(2, 3)).toBeCloseTo(5 / 6);
  });

  it("maps beat 0 of 5 to 1/10", () => {
    expect(beatToLocalProgress(0, 5)).toBeCloseTo(1 / 10);
  });

  it("maps beat 4 of 5 to 9/10", () => {
    expect(beatToLocalProgress(4, 5)).toBeCloseTo(9 / 10);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/sections.test.ts
```

Expected: FAIL — `./sections` module not found.

- [ ] **Step 3: Implement sections.ts**

Create `src/lib/sections.ts`:

```ts
export type SectionId =
  | "hero"
  | "workflow"
  | "context-rot"
  | "skill-grill-me"
  | "skill-write-a-prd"
  | "skill-prd-to-plan"
  | "skill-plan-to-tracker"
  | "skill-do-work"
  | "skill-improve-codebase-architecture"
  | "skill-handle-coderabbit";

export type Section = {
  id: SectionId;
  beats: number;
};

export const SECTIONS: Section[] = [
  { id: "hero", beats: 1 },
  { id: "workflow", beats: 1 },
  { id: "context-rot", beats: 5 },
  { id: "skill-grill-me", beats: 3 },
  { id: "skill-write-a-prd", beats: 3 },
  { id: "skill-prd-to-plan", beats: 3 },
  { id: "skill-plan-to-tracker", beats: 3 },
  { id: "skill-do-work", beats: 3 },
  { id: "skill-improve-codebase-architecture", beats: 3 },
  { id: "skill-handle-coderabbit", beats: 3 },
];

export const DEFAULT_SECTION: SectionId = "hero";

export function findSection(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export function sectionIndex(id: string): number {
  return SECTIONS.findIndex((s) => s.id === id);
}

export type NavState = { sectionId: SectionId; beat: number };

export function advance(state: NavState): NavState {
  const idx = sectionIndex(state.sectionId);
  const section = SECTIONS[idx];
  if (!section) return state;

  if (state.beat < section.beats - 1) {
    return { sectionId: state.sectionId, beat: state.beat + 1 };
  }

  if (idx < SECTIONS.length - 1) {
    return { sectionId: SECTIONS[idx + 1].id, beat: 0 };
  }

  return state;
}

export function retreat(state: NavState): NavState {
  const idx = sectionIndex(state.sectionId);
  if (idx < 0) return state;

  if (state.beat > 0) {
    return { sectionId: state.sectionId, beat: state.beat - 1 };
  }

  if (idx > 0) {
    const prev = SECTIONS[idx - 1];
    return { sectionId: prev.id, beat: prev.beats - 1 };
  }

  return state;
}

export function beatToLocalProgress(beat: number, totalBeats: number): number {
  if (totalBeats <= 1) return 0;
  return (beat * 2 + 1) / (totalBeats * 2);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/sections.test.ts
```

Expected: All 16 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/sections.ts src/lib/sections.test.ts
git commit -m "feat: add section navigation logic with beat-based advance/retreat"
```

---

### Task 3: Create SectionNavContext

**Files:**
- Create: `src/context/SectionNavContext.tsx`

- [ ] **Step 1: Create the context**

Create `src/context/SectionNavContext.tsx`:

```tsx
import { createContext, useCallback, useContext, useMemo } from "react";
import type { SectionId } from "../lib/sections";

export type SectionNavContextValue = {
  navigateTo: (sectionId: SectionId, beat?: number) => void;
};

const SectionNavContext = createContext<SectionNavContextValue | null>(null);

export function useSectionNav() {
  return useContext(SectionNavContext);
}

export function useNavigateTo() {
  const ctx = useSectionNav();
  return ctx?.navigateTo;
}

type ProviderProps = {
  children: React.ReactNode;
  onNavigate: (sectionId: SectionId, beat?: number) => void;
};

export function SectionNavProvider({ children, onNavigate }: ProviderProps) {
  const navigateTo = useCallback(
    (sectionId: SectionId, beat = 0) => {
      onNavigate(sectionId, beat);
    },
    [onNavigate],
  );

  const value = useMemo<SectionNavContextValue>(
    () => ({ navigateTo }),
    [navigateTo],
  );

  return (
    <SectionNavContext.Provider value={value}>
      {children}
    </SectionNavContext.Provider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/context/SectionNavContext.tsx
git commit -m "feat: add SectionNavContext for query-param navigation"
```

---

### Task 4: Rewrite VerticalScrollPage

**Files:**
- Modify: `src/components/VerticalScrollPage.tsx` (complete rewrite)

- [ ] **Step 1: Rewrite the component**

Replace the entire contents of `src/components/VerticalScrollPage.tsx` with:

```tsx
import { useCallback, useEffect, useRef, type ReactNode } from "react";
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
    <div className="h-dvh max-h-dvh w-full flex flex-col min-h-0 overflow-hidden items-center justify-center px-4 sm:px-6 py-4">
      <div className="w-full max-w-6xl mx-auto shrink-0">
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

function SectionBody({
  sectionId,
  localProgress,
}: {
  sectionId: SectionId;
  localProgress: ReturnType<typeof useMotionValue<number>>;
}) {
  if (sectionId === "hero") {
    return <StickyHero />;
  }
  if (sectionId === "workflow") {
    return <WorkflowLayer />;
  }
  if (sectionId === "context-rot") {
    return <StickyContextRot localProgress={localProgress} />;
  }

  const data = SKILL_PROPS[sectionId as keyof typeof SKILL_PROPS];
  if (!data) return null;
  return <StickySkillSection {...data} localProgress={localProgress} />;
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

  const localProgress = useMotionValue(
    beatToLocalProgress(clampedBeat, section.beats),
  );

  const prevSectionRef = useRef(sectionId);
  useEffect(() => {
    const target = beatToLocalProgress(clampedBeat, section.beats);
    if (prevSectionRef.current !== sectionId) {
      localProgress.set(target);
      prevSectionRef.current = sectionId;
    } else {
      animate(localProgress, target, { duration: 0.45, ease: "easeInOut" });
    }
  }, [sectionId, clampedBeat, section.beats, localProgress]);

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
              localProgress={localProgress}
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx astro check
```

Expected: No type errors in `VerticalScrollPage.tsx`. (There will be errors in other files we haven't updated yet — that's expected.)

- [ ] **Step 3: Commit**

```bash
git add src/components/VerticalScrollPage.tsx
git commit -m "feat: rewrite VerticalScrollPage with nuqs query-param navigation"
```

---

### Task 5: Simplify StickyHero

**Files:**
- Modify: `src/components/StickyHero.tsx`

The hero no longer needs `localProgress` — AnimatePresence handles the exit animation. Remove the `localProgress` prop and the opacity/scale transforms.

- [ ] **Step 1: Update StickyHero**

Replace the entire contents of `src/components/StickyHero.tsx` with:

```tsx
import { motion } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

export default function StickyHero() {
  return (
    <div className="h-dvh w-full flex flex-col items-center justify-center px-4 sm:px-6 text-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="flex flex-col items-center"
      >
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="text-sm uppercase tracking-widest text-emerald-400 mb-4 font-mono"
        >
          AI Coding Workflow
        </motion.p>
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold max-w-4xl leading-tight"
        >
          Pare de fazer <span className="text-emerald-400">vibe coding.</span>
        </motion.h1>
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-neutral-400 leading-relaxed"
        >
          Voce pede codigo a IA sem processo, sem rastreabilidade, sem revisao.
          O resultado? Codigo fragil, debito tecnico invisivel e zero
          aproveitamento do potencial real dessas ferramentas.
        </motion.p>
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-4 max-w-2xl text-base sm:text-lg md:text-xl text-neutral-300 leading-relaxed"
        >
          Este e um workflow completo de desenvolvimento assistido por IA — da
          concepcao da feature ao code review — com embasamento tecnico sobre{" "}
          <strong className="text-emerald-400">por que</strong> essa abordagem
          funciona melhor.
        </motion.p>
        <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="mt-10">
          <span className="inline-block px-6 py-3 bg-emerald-500/20 text-emerald-400 font-semibold rounded-lg border border-emerald-500/30">
            Scroll para comecar
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
```

Note: The old CTA `<a href="#workflow">Conhecer o workflow</a>` relied on hash navigation. Replace it with a non-interactive hint ("Scroll para comecar") since wheel/touch now advances sections. Preserve the original Portuguese text with accents from the existing file — the accents shown above are simplified; copy them from the current file.

- [ ] **Step 2: Commit**

```bash
git add src/components/StickyHero.tsx
git commit -m "refactor: remove localProgress from StickyHero, use AnimatePresence exit"
```

---

### Task 6: Update WorkflowDiagram

**Files:**
- Modify: `src/components/WorkflowDiagram.tsx`

Two changes: (1) replace `useScrollToSection` with `useNavigateTo` from the new context, (2) remove `IntersectionObserver` — trigger the staggered node animation on mount since the section is always visible when rendered.

- [ ] **Step 1: Update imports**

In `src/components/WorkflowDiagram.tsx`, replace:

```ts
import { useScrollToSection } from "../context/ScrollStoryContext";
```

with:

```ts
import { useNavigateTo } from "../context/SectionNavContext";
import type { SectionId } from "../lib/sections";
```

- [ ] **Step 2: Update SkillNode click handler**

In the `SkillNode` function, replace:

```ts
  const scrollToSection = useScrollToSection();

  const handleClick = useCallback(() => {
    if (scrollToSection) {
      scrollToSection(anchor);
      return;
    }
    const el = document.querySelector(anchor);
    el?.scrollIntoView({ behavior: "smooth" });
  }, [anchor, scrollToSection]);
```

with:

```ts
  const navigateTo = useNavigateTo();

  const handleClick = useCallback(() => {
    const id = anchor.startsWith("#") ? anchor.slice(1) : anchor;
    if (navigateTo) {
      navigateTo(id as SectionId);
    }
  }, [anchor, navigateTo]);
```

- [ ] **Step 3: Remove IntersectionObserver, animate on mount**

In the `WorkflowDiagram` function, remove the first `useEffect` (the IntersectionObserver one) and change the second `useEffect` to run immediately on mount instead of waiting for `visible`:

Replace both `useEffect` blocks:

```ts
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
```

with:

```ts
  useEffect(() => {
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
  }, []);
```

Also remove the `useState` import for `visible` (keep `useCallback`, `useEffect`, `useState` only if still needed — `useState` is still used by `useNodesState`/`useEdgesState` indirectly, but the explicit `useState(false)` for `visible` should be removed).

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx astro check
```

Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/WorkflowDiagram.tsx
git commit -m "refactor: update WorkflowDiagram to use SectionNavContext, animate on mount"
```

---

### Task 7: Delete dead code

**Files:**
- Delete: `src/lib/scrollSections.ts`
- Delete: `src/context/ScrollStoryContext.tsx`

- [ ] **Step 1: Verify no remaining imports**

```bash
grep -rn "scrollSections\|ScrollStoryContext\|useScrollStory\|useScrollToSection" src/ --include="*.tsx" --include="*.ts"
```

Expected: No results (all references updated in previous tasks).

- [ ] **Step 2: Delete the files**

```bash
rm src/lib/scrollSections.ts src/context/ScrollStoryContext.tsx
```

- [ ] **Step 3: Run full type check**

```bash
npx astro check
```

Expected: Clean — no type errors.

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove scroll-driven architecture (scrollSections, ScrollStoryContext)"
```

---

### Task 8: Manual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test golden path**

Open `http://localhost:4321` in a browser. Verify:

1. Hero section loads with stagger animation
2. Scroll down → hero exits (fade+scale), workflow enters (fade+slide up)
3. Scroll down → workflow exits, context-rot enters at beat 0
4. Scroll down 4 more times → context-rot cycles through all 5 beats (substitutive content swaps)
5. Scroll down → context-rot exits, skill-grill-me enters at beat 0
6. Each skill section cycles through 3 beats, then transitions to the next skill
7. Last skill (handle-coderabbit) stays on beat 2 when scrolling down further
8. Scroll up reverses everything correctly

- [ ] **Step 3: Test query params**

1. Navigate to `http://localhost:4321/?s=context-rot&b=3` — should land directly on context-rot beat 3
2. Scroll down — URL updates to `?s=context-rot&b=4`
3. Click footer "Topo" button — returns to hero

- [ ] **Step 4: Test WorkflowDiagram clicks**

1. Navigate to workflow section
2. Click a skill node in the diagram → should jump to that skill section

- [ ] **Step 5: Test touch on mobile viewport**

1. Open dev tools mobile emulation
2. Swipe up → advances section/beat
3. Swipe down → retreats

- [ ] **Step 6: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address manual testing feedback"
```
