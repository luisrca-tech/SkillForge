export interface TerminalLine {
  type: "prompt" | "response" | "divider";
  text: string;
}

export interface Scenario {
  id: string;
  label: string;
  lines: TerminalLine[];
}

export interface SkillData {
  name: string;
  variant?: "default" | "optional";
  problem: { title: string; description: string };
  skill: { title: string; description: string };
  howItWorks: { title: string; steps: string[] };
  scenarios: Scenario[];
}
