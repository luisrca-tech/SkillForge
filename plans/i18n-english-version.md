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

## Phase 3: Skills Content ✅

**User stories**: 5, 17

### What was built

- Extracted shared interfaces to `src/data/skills.types.ts` (`SkillData`, `Scenario`, `TerminalLine`)
- Created `src/data/skills.en.ts` with all 7 skills fully translated to English (titles, descriptions, steps, terminal dialogues)
- Created `src/data/skills.pt.ts` preserving all original Portuguese content
- Converted `src/data/skills.ts` into a barrel module with `getSkills(locale)` that selects the correct locale file
- Updated `VerticalScrollPage` to resolve skills data via `useLocale()` + `getSkillProps(locale)` instead of static imports
- Both locale files import from the shared types file, so TypeScript enforces identical shapes

### Acceptance criteria

- [x] `skills.en.ts` and `skills.pt.ts` exist with identical export shapes
- [x] All 7 skills are fully translated in `skills.en.ts` (titles, descriptions, steps, terminal dialogues)
- [x] Visiting `/` renders all skill sections in English
- [x] Visiting `/pt/` renders all skill sections in Portuguese (matching current behavior)
- [x] The barrel export selects the correct locale file based on context
- [x] TypeScript enforces that both locale files export the same shape

---

## Phase 4: Context Rot + References + UI Components ✅

**User stories**: 6, 7, 8, 12

### What was built

- Added ~70 translation keys to `en.json` and `pt.json` covering all ContextRot, StickyContextRot, ReferencesSection, DownloadButton, and SkillsInstallDialog strings
- `ContextRot.tsx` and `StickyContextRot.tsx` use `useLocale()` + `t()` for all headings, paragraphs (split around inline `<strong>`/`<em>`/`<code>` elements), comparison list items, and analogy text
- `ReferencesSection.tsx` uses `t()` for heading, subtitle, and all 9 reference titles (via `titleKey` mapped to `TranslationKeys`)
- `DownloadButton.tsx` uses `t("download.label")` for the button text
- `SkillsInstallDialog.tsx` uses `t()` for title, description, WSL hint, path note, and close button
- Shared keys (e.g. `contextRot.heading`, `contextRot.whatIsTitle`) are reused between `ContextRot` and `StickyContextRot`; abbreviated variants use `sticky.*` prefix
- Reference titles shared between ContextRot inline grid and ReferencesSection marquee via `ref.N.title` keys; ReferencesSection ref 8 uses `ref.8.marquee.title` for its different paper

### Acceptance criteria

- [x] `ContextRot` section is fully translated — headings, paragraphs, comparison lists, analogy
- [x] `ReferencesSection` heading, subtitle, and reference titles are translated
- [x] `DownloadButton` label is translated ("Baixar skills" → "Download skills")
- [x] `SkillsInstallDialog` title, description, WSL help text, and close button are translated
- [x] No hardcoded Portuguese strings remain in any component outside of the locale files
- [x] Both `/` and `/pt/` render all sections correctly in their respective languages

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
