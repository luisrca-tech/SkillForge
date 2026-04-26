import { createContext, useCallback, useContext, useState } from "react";

interface AnimationObserverContextValue {
  hasPlayed: (sectionId: string) => boolean;
  markPlayed: (sectionId: string) => void;
}

const AnimationObserverContext = createContext<AnimationObserverContextValue | null>(null);

export function AnimationObserverProvider({ children }: { children: React.ReactNode }) {
  const [playedSections, setPlayedSections] = useState<Set<string>>(() => new Set());

  const hasPlayed = useCallback(
    (sectionId: string) => playedSections.has(sectionId),
    [playedSections],
  );

  const markPlayed = useCallback(
    (sectionId: string) => {
      setPlayedSections((prev) => {
        if (prev.has(sectionId)) return prev;
        const next = new Set(prev);
        next.add(sectionId);
        return next;
      });
    },
    [],
  );

  return (
    <AnimationObserverContext.Provider value={{ hasPlayed, markPlayed }}>
      {children}
    </AnimationObserverContext.Provider>
  );
}

export function useAnimationObserver() {
  const ctx = useContext(AnimationObserverContext);
  if (!ctx) throw new Error("useAnimationObserver must be used within AnimationObserverProvider");
  return ctx;
}
