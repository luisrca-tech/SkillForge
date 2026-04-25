import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type RefObject,
} from "react";
import type { MotionValue } from "motion/react";

export type ScrollStoryContextValue = {
  containerRef: RefObject<HTMLDivElement | null>;
  storyProgress: MotionValue<number>;
  scrollToHash: (hash: string) => void;
};

const ScrollStoryContext = createContext<ScrollStoryContextValue | null>(null);

export function useScrollStory() {
  return useContext(ScrollStoryContext);
}

export function useScrollToSection() {
  const ctx = useScrollStory();
  return ctx?.scrollToHash;
}

type ProviderProps = {
  children: React.ReactNode;
  containerRef: RefObject<HTMLDivElement | null>;
  storyProgress: MotionValue<number>;
};

export function ScrollStoryProvider({
  children,
  containerRef,
  storyProgress,
}: ProviderProps) {
  const scrollToHash = useCallback(
    (hash: string) => {
      const id = hash.startsWith("#") ? hash.slice(1) : hash;
      if (!id) {
        return;
      }
      const el = document.getElementById(id);
      const root = containerRef.current;
      if (!el || !root) {
        return;
      }
      const top =
        el.getBoundingClientRect().top -
        root.getBoundingClientRect().top +
        root.scrollTop;
      root.scrollTo({ top, behavior: "smooth" });
    },
    [containerRef],
  );

  const value = useMemo<ScrollStoryContextValue>(
    () => ({
      containerRef,
      storyProgress,
      scrollToHash,
    }),
    [containerRef, storyProgress, scrollToHash],
  );

  return (
    <ScrollStoryContext.Provider value={value}>
      {children}
    </ScrollStoryContext.Provider>
  );
}
