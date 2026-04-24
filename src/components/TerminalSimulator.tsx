import { useState, useEffect, useRef, useCallback } from "react";

interface TerminalLine {
  type: "prompt" | "response" | "divider";
  text: string;
}

interface Scenario {
  id: string;
  label: string;
  lines: TerminalLine[];
}

interface TerminalSimulatorProps {
  scenarios: Scenario[];
  title?: string;
}

const CHAR_DELAY = 12;
const LINE_DELAY = 80;

export default function TerminalSimulator({
  scenarios,
  title = "terminal",
}: TerminalSimulatorProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  const activeScenario = scenarios[activeTab];

  const resetAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setDisplayedLines([]);
    setCurrentLineIndex(0);
    setCurrentCharIndex(0);
    setIsTyping(true);
    lastTimeRef.current = 0;
  }, []);

  useEffect(() => {
    resetAnimation();
  }, [activeTab, resetAnimation]);

  useEffect(() => {
    if (!isTyping || !activeScenario) return;

    const lines = activeScenario.lines;

    if (currentLineIndex >= lines.length) {
      setIsTyping(false);
      return;
    }

    const currentLine = lines[currentLineIndex];
    const fullText = currentLine.text;

    if (currentLine.type === "divider") {
      const timeout = setTimeout(() => {
        setDisplayedLines((prev) => {
          const next = [...prev];
          next[currentLineIndex] = fullText;
          return next;
        });
        setCurrentLineIndex((i) => i + 1);
        setCurrentCharIndex(0);
      }, LINE_DELAY);
      return () => clearTimeout(timeout);
    }

    if (currentCharIndex === 0 && currentLine.type === "prompt") {
      setDisplayedLines((prev) => {
        const next = [...prev];
        next[currentLineIndex] = "";
        return next;
      });
    }

    if (currentCharIndex >= fullText.length) {
      const timeout = setTimeout(() => {
        setCurrentLineIndex((i) => i + 1);
        setCurrentCharIndex(0);
      }, LINE_DELAY);
      return () => clearTimeout(timeout);
    }

    const delay = currentLine.type === "response" ? CHAR_DELAY / 2 : CHAR_DELAY;

    const frame = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      if (time - lastTimeRef.current >= delay) {
        lastTimeRef.current = time;
        setDisplayedLines((prev) => {
          const next = [...prev];
          next[currentLineIndex] = fullText.slice(0, currentCharIndex + 1);
          return next;
        });
        setCurrentCharIndex((c) => c + 1);
      } else {
        animationRef.current = requestAnimationFrame(frame);
      }
    };

    animationRef.current = requestAnimationFrame(frame);
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isTyping, currentLineIndex, currentCharIndex, activeScenario]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedLines]);

  return (
    <div className="rounded-xl overflow-hidden border border-neutral-800 bg-[#0d1117]">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-neutral-800">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-neutral-500 font-mono ml-2">
          {title}
        </span>
      </div>

      {scenarios.length > 1 && (
        <div className="flex border-b border-neutral-800 bg-[#161b22]">
          {scenarios.map((scenario, index) => (
            <button
              key={scenario.id}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 text-xs font-mono transition-colors ${
                index === activeTab
                  ? "text-emerald-400 border-b-2 border-emerald-400 bg-[#0d1117]"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {scenario.label}
            </button>
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        className="p-4 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed h-64 sm:h-80 md:h-96 overflow-y-auto"
      >
        {activeScenario?.lines.map((line, index) => {
          const text = displayedLines[index];
          if (text === undefined) return null;

          if (line.type === "divider") {
            return (
              <div
                key={index}
                className="border-t border-neutral-800 my-3"
              />
            );
          }

          if (line.type === "prompt") {
            return (
              <div key={index} className="mb-2">
                <span className="text-emerald-400">{"❯ "}</span>
                <span className="text-cyan-300">{text}</span>
              </div>
            );
          }

          return (
            <div key={index} className="text-neutral-400 mb-2 pl-4">
              {text}
              {index === currentLineIndex && isTyping && (
                <span className="inline-block w-1.5 h-4 bg-emerald-400 ml-0.5 align-text-bottom animate-pulse" />
              )}
            </div>
          );
        })}
        {!isTyping && currentLineIndex >= (activeScenario?.lines.length ?? 0) && (
          <div className="mt-2">
            <span className="text-emerald-400">{"❯ "}</span>
            <span className="inline-block w-1.5 h-4 bg-emerald-400 ml-0.5 align-text-bottom animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
