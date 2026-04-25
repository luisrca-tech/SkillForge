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
