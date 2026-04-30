import type { Locale } from "../i18n";
import * as en from "./skills.en";
import * as pt from "./skills.pt";

export type { SkillData, Scenario, TerminalLine } from "./skills.types";

const skillsByLocale: Record<Locale, typeof en> = { en, pt };

export function getSkills(locale: Locale) {
  return skillsByLocale[locale];
}
