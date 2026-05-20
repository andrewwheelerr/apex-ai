# Apex AI — Design Reference

## Overview

Product register. Dark theme. Scene: fleet manager at a dealership reviewing overnight lead activity on a large monitor before the sales floor opens — high information density, minimal ornamentation.

Color strategy: **Committed** — one saturated electric blue carries the interactive layer. Everything else is deep navy with layered surface depth.

---

## Color Tokens

All colors use OKLCH. Defined in `src/index.css` via `@theme` for Tailwind v4 utility generation.

### Surfaces (deep navy stack)

| Token | OKLCH | Usage |
|---|---|---|
| `--color-bg` | `oklch(11% 0.014 252)` | Page background |
| `--color-surface` | `oklch(15% 0.018 252)` | Cards, sidebar, header bars |
| `--color-raised` | `oklch(19% 0.022 252)` | Inputs, hover states, secondary surfaces |
| `--color-high` | `oklch(24% 0.026 252)` | Active inputs, elevated elements |
| `--color-border` | `oklch(28% 0.020 252)` | Component borders |
| `--color-border-sub` | `oklch(21% 0.016 252)` | Subtle separators, row dividers |

### Accent (electric blue)

| Token | OKLCH | Usage |
|---|---|---|
| `--color-accent` | `oklch(63% 0.225 240)` | Primary interactive color |
| `--color-accent-hi` | `oklch(70% 0.215 240)` | Hover state, active nav text |
| `--color-accent-dim` | `oklch(23% 0.055 240)` | Active nav background, avatar backgrounds, status chip backgrounds |
| `--color-accent-muted` | `oklch(42% 0.090 240)` | Subdued accent contexts |

### Ink (text hierarchy)

| Token | OKLCH | Usage |
|---|---|---|
| `--color-ink-1` | `oklch(93% 0.008 252)` | Primary text, headings, values |
| `--color-ink-2` | `oklch(63% 0.012 252)` | Secondary text, table cells, labels |
| `--color-ink-3` | `oklch(41% 0.010 252)` | Tertiary, timestamps, hints, column headers |

### Semantic

| Token | OKLCH | Usage |
|---|---|---|
| `--color-ok` | `oklch(67% 0.155 148)` | Positive delta, success state |
| `--color-ok-dim` | `oklch(21% 0.048 148)` | Success background |
| `--color-warn` | `oklch(76% 0.138 68)` | Handed-off status, warning |
| `--color-warn-dim` | `oklch(21% 0.048 68)` | Warning background |
| `--color-err` | `oklch(62% 0.185 27)` | Error state |
| `--color-err-dim` | `oklch(19% 0.048 27)` | Error background |

**OKLCH rule:** Chroma is reduced as lightness approaches 0 or 100. All neutrals are tinted toward hue 252 (blue-navy direction) at chroma 0.008–0.026. Never `#000` or `#fff`.

---

## Typography

**Font:** Inter (Google Fonts), with system stack fallback. Loaded in `index.css`.

| Role | Size | Weight | Usage |
|---|---|---|---|
| Page title | 15px | 600 | Header bars |
| Section heading | 13px | 600 | Card titles, section names |
| Column header | 10px | 600 + uppercase + tracking-[0.07em] | Table column labels |
| Body / cell | 13px | 400–500 | Table content, descriptions |
| Label | 12px | 500 | Form labels |
| Supporting | 11–12px | 400 | Hints, timestamps, meta |
| Metric value | 28px | 600 + tracking-[-0.02em] | Dashboard KPI numbers |

Numeric values use `fontVariantNumeric: 'tabular-nums'` for alignment.

---

## Layout

**Sidebar:** 216px fixed. `bg-surface` + right border. Three zones: logo (58px h, bottom border), primary nav, bottom nav + dealer identity card.

**Content area:** `flex-1 overflow-auto`. Page header is a fixed 58px bar matching sidebar height — creates a continuous horizontal line across the layout.

**Content padding:** `px-8 py-6` for page content. `max-w-[720px]` on Settings to keep form width readable.

**Dashboard grid:** `grid-cols-[1fr_280px]` for chart + channel breakdown asymmetric split.

**Metrics strip:** `grid-cols-4` with `border-right` dividers — not individual cards.

---

## Component Patterns

### Nav items (sidebar)

Active state uses `background-color: accent-dim` + `color: accent-hi`. No left-border stripe. Rounded (`rounded-lg`) pill background.

### Status badges

Inline-flex with small pill background. Three states:
- **Active:** `bg-accent-dim text-accent` + animated dot
- **Handed Off:** `bg-warn-dim text-warn`
- **Closed:** `bg-raised text-ink-3`

### Form inputs

`bg-raised border-border`. On focus: `border-color → accent`. `border-radius: 8px`. No box-shadow.

### Save button

Default: `bg-accent text-white`. On save: transitions to `bg-ok-dim text-ok` with check icon for 2.2 seconds, then resets.

### Tone selector (Settings)

`grid-cols-3`. Each option is a button with label + description. Active: `bg-accent-dim border-accent text-accent-hi`. Inactive: `bg-raised border-border`.

### Keyword tags (Settings)

Inline pills with `× ` removal button. Flush row with `flex flex-wrap gap-1.5`.

---

## Absolute Bans (enforced in this codebase)

- No side-stripe borders (`border-left` > 1px as colored accent)
- No gradient text (`background-clip: text`)
- No glassmorphism
- No hero-metric template (big centered number + gradient accent)
- No identical card grids
- No nested cards

---

## File Structure

```
src/
  index.css              Theme tokens (@theme), Google Fonts import, global reset
  App.tsx                BrowserRouter + Routes
  components/
    Layout.tsx           Sidebar + Outlet shell
  pages/
    Onboarding.tsx       3-step setup wizard (no sidebar)
    Dashboard.tsx        ROI metrics + hourly chart + recent activity
    Conversations.tsx    Filterable conversation list
    Settings.tsx         Agent persona, greeting, escalation rules
```

---

## Extending

To add a new color: add `--color-{name}: oklch(...)` inside `@theme` in `src/index.css`. Tailwind v4 generates `bg-{name}`, `text-{name}`, `border-{name}` utilities automatically.

To add a new page: create `src/pages/NewPage.tsx`, import in `App.tsx`, add a `<Route>` inside the `<Layout>` route, and add a nav item to `Layout.tsx`'s `primaryNav` array.
