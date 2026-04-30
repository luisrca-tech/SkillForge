import { useLocale } from "../context/LocaleContext";

export default function LanguageSwitcher() {
  const { locale } = useLocale();

  const targetPath = locale === "en" ? "/pt/" : "/";
  const search = typeof window !== "undefined" ? window.location.search : "";

  return (
    <a
      href={`${targetPath}${search}`}
      className="fixed top-4 right-4 z-[60] flex items-center gap-0.5 rounded-full border border-neutral-700/60 bg-neutral-900/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium transition-colors hover:border-neutral-600"
    >
      <span className={locale === "en" ? "text-emerald-400" : "text-neutral-500"}>
        EN
      </span>
      <span className="text-neutral-600 mx-1">/</span>
      <span className={locale === "pt" ? "text-emerald-400" : "text-neutral-500"}>
        PT
      </span>
    </a>
  );
}
