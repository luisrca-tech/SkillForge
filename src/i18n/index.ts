import en from "./en.json";
import pt from "./pt.json";

export type Locale = "en" | "pt";

type TranslationKeys = keyof typeof en;

const translations: Record<Locale, Record<string, string>> = { en, pt };

export function createTranslator(locale: Locale) {
  const dict = translations[locale];
  return function t(key: TranslationKeys): string {
    return dict[key] ?? key;
  };
}

export type TranslatorFn = ReturnType<typeof createTranslator>;
