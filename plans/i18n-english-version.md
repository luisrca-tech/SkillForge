# Plan: i18n English Version

> Source PRD: plans/prd-i18n-english-version.md

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: `/` = English (default), `/pt/` = Portuguese. Astro `i18n` config with `defaultLocale: 'en'`, `locales: ['en', 'pt']`, `prefixDefaultLocale: false`.
- **Translation files**: `src/i18n/en.json` + `src/i18n/pt.json` for UI strings (flat-namespaced, e.g. `hero.title`). `src/data/skills.en.ts` + `src/data/skills.pt.ts` for heavy skills content.
- **Locale plumbing**: Astro page determines locale and passes it to a React context provider (`LocaleProvider`). A type-safe `t(key)` helper reads from the loaded JSON. Components receive translated skills data as props.
- **Page structure**: `src/pages/index.astro` serves English; `src/pages/pt/index.astro` serves Portuguese. Both render the same `VerticalScrollPage` component with different locale props.
- **WorkflowDiagram constraint**: Only imports/logic may change — no layout, styling, or constants modifications. Translations passed as props from parent.

---

## Phase 1: i18n Foundation + Hero ✅

**User stories**: 1, 2, 9, 16, 18

### What was built

- Astro i18n routing configured (`defaultLocale: 'en'`, `prefixDefaultLocale: false`)
- Locale JSON files at `src/i18n/en.json` and `src/i18n/pt.json` with hero + workflow heading keys
- Type-safe `t()` helper via `createTranslator()` in `src/i18n/index.ts` (`TranslationKeys` = `keyof typeof en`)
- `LocaleProvider` context at `src/context/LocaleContext.tsx` with `useLocale()` hook
- Pages: `src/pages/index.astro` (English, `lang="en"`) and `src/pages/pt/index.astro` (Portuguese, `lang="pt-BR"`)
- `HeroSection` and `WorkflowLayer` heading/subtitle use `t()` instead of hardcoded strings

### Acceptance criteria

- [x] Visiting `/` renders the hero section fully in English
- [x] Visiting `/pt/` renders the hero section fully in Portuguese (identical to current behavior)
- [x] The `t()` helper is type-safe — a missing or misspelled key produces a TypeScript error
- [x] The JSON locale files exist at `src/i18n/en.json` and `src/i18n/pt.json`
- [x] The Astro config includes i18n routing with `defaultLocale: 'en'` and `prefixDefaultLocale: false`
- [x] All other sections still render correctly (no regressions from plumbing changes)

---

## Phase 2: Language Switcher + Section Nav ✅

**User stories**: 3, 4, 10, 14

### What was built

- `LanguageSwitcher` component at `src/components/LanguageSwitcher.tsx` — fixed top-right pill, links to alternate locale preserving query params, active locale highlighted in emerald, `z-[60]`
- `SECTION_LABELS` replaced with `SECTION_LABEL_KEYS` (maps `SectionId` → `TranslationKeys`) in `src/lib/sections.ts`
- Footer nav in `SectionNavigator` uses `t(SECTION_LABEL_KEYS[sec.id])` for locale-aware labels
- `TranslationKeys` type exported from `src/i18n/index.ts` for cross-module type safety
- Nav label translations added to both JSON files (`nav.hero`, `nav.references`, etc.)

### Acceptance criteria

- [x] A fixed `EN / PT` pill is visible in the top-right corner on all screen sizes
- [x] Clicking the pill navigates to the other locale and preserves query parameters
- [x] The active locale is visually highlighted in the pill
- [x] Bottom section navigator labels are translated per locale
- [x] The switcher does not overlap or interfere with page content or the bottom nav
- [x] The switcher has appropriate `z-index` to stay above all content layers

---

## Phase 3: Skills Content

**User stories**: 5, 17

### What to build

Split the current `skills.ts` into `skills.en.ts` and `skills.pt.ts`, each exporting the same data shape with locale-appropriate content. The current Portuguese content moves to `skills.pt.ts`; English translations are authored in `skills.en.ts`. Create a barrel module that selects the correct file based on the current locale. Update `VerticalScrollPage` to pass the locale-resolved skills data to skill section components. All 7 skills must be fully translated: titles, descriptions, step lists, and terminal dialogue lines.

### Acceptance criteria

- [ ] `skills.en.ts` and `skills.pt.ts` exist with identical export shapes
- [ ] All 7 skills are fully translated in `skills.en.ts` (titles, descriptions, steps, terminal dialogues)
- [ ] Visiting `/` renders all skill sections in English
- [ ] Visiting `/pt/` renders all skill sections in Portuguese (matching current behavior)
- [ ] The barrel export selects the correct locale file based on context
- [ ] TypeScript enforces that both locale files export the same shape

---

## Phase 4: Context Rot + References + UI Components

**User stories**: 6, 7, 8, 12

### What to build

Extract all remaining hardcoded Portuguese strings from `ContextRot.tsx`, `ReferencesSection.tsx`, `DownloadButton.tsx`, and `SkillsInstallDialog.tsx` into the locale JSON files and translate them. This includes: Context Rot headings, explanatory paragraphs, comparison panel items (Global Rules vs. On-Demand Skills), the analogy section, reference titles (both inline in ContextRot and in the marquee), the download button label, and the install dialog title/description/help text/footer button.

### Acceptance criteria

- [ ] `ContextRot` section is fully translated — headings, paragraphs, comparison lists, analogy
- [ ] `ReferencesSection` heading, subtitle, and reference titles are translated
- [ ] `DownloadButton` label is translated ("Baixar skills" → "Download skills")
- [ ] `SkillsInstallDialog` title, description, WSL help text, and close button are translated
- [ ] No hardcoded Portuguese strings remain in any component outside of the locale files
- [ ] Both `/` and `/pt/` render all sections correctly in their respective languages

---

## Phase 5: SEO + Sitemap

**User stories**: 11, 12, 13, 15

### What to build

Add `hreflang` link tags to both locale pages, pointing to each other as alternates. Move `<title>` and `<meta name="description">` into the locale JSON files so each version gets language-appropriate metadata. Install and configure `@astrojs/sitemap` to generate sitemap entries for both `/` and `/pt/`. Ensure the `<html lang="...">` attribute is set correctly per locale (`en` vs `pt-BR`).

### Acceptance criteria

- [ ] Both pages include `<link rel="alternate" hreflang="en" href="/">` and `<link rel="alternate" hreflang="pt" href="/pt/">`
- [ ] `<title>` and `<meta description>` are translated per locale
- [ ] `<html lang="en">` on `/` and `<html lang="pt-BR">` on `/pt/`
- [ ] Sitemap includes both `/` and `/pt/` URLs
- [ ] `@astrojs/sitemap` is configured and generating output at build time
