# Apex AI — Design Reference

## Overview

Product register. Light theme. Scene: dealership sales manager reviewing overnight lead activity on a 27-inch monitor before the floor opens — clean, high-contrast, iOS-native feel.

Color strategy: **Restrained** — tinted neutrals plus one saturated brand blue as the sole interactive accent.

---

## Color Tokens

Defined inline via hex values throughout the codebase.

### Surfaces

| Role | Value | Usage |
|---|---|---|
| Page background | `#F2F2F7` | App shell, page bg |
| Sidebar | `#FAFAFA` | Sidebar background |
| Card / panel | `#FFFFFF` | Cards, table bg, inputs |

### Brand

| Role | Value | Usage |
|---|---|---|
| Brand blue | `#007AFF` | Interactive color, active states, CTAs |
| Active nav bg | `rgba(0,122,255,0.07)` | Sidebar active item background |

### Ink (text hierarchy)

| Role | Value | Usage |
|---|---|---|
| Primary text | `#1D1D1F` | Headings, names, values |
| Secondary text | `#3A3A3C` | Table content, labels |
| Tertiary text | `#8E8E93` | Timestamps, hints, section labels, captions |

### Semantic

| Role | Value | Usage |
|---|---|---|
| Success | `#34C759` | Positive deltas, success saved state |
| Warning | `#FF9500` | Handed Off badges |
| Danger | `#FF3B30` | Errors, auth errors |

### Borders

All borders: `0.5px solid rgba(0,0,0,0.08)` — used consistently everywhere.

---

## Typography

**Font:** Inter (Google Fonts), weights 400 and 500 only. No weight above 500.

| Role | Size | Weight | Notes |
|---|---|---|---|
| Display | 28px | 500 | Page titles, letter-spacing -0.5px |
| Heading | 20px | 500 | Section headings |
| Body | 15px | 400 | Default text |
| Small | 13px | 400 | Table cells, secondary content |
| Caption | 11px | 500 | Uppercase + tracked — section labels, column headers |

---

## Layout

**Sidebar:** 220px fixed. `#FAFAFA` bg + 0.5px right border. Never collapses.

**Content area:** `flex-1 overflow-auto`. Page background `#F2F2F7`.

**Page padding:** 32px horizontal, 28px vertical.

**Card gap:** 16px between cards. **Section gap:** 32px between major sections.

**Border radius:** 10px standard, 14px for hero cards.

---

## Component Patterns

### Sidebar logo
`Apex` in `#1D1D1F` + `AI` in `#007AFF`. Font 17px / weight 500.

### Dealer switcher
White card (`#FFFFFF`), 0.5px border, 10px radius. Blue square avatar (bg `#007AFF`, white text) with dealer initials. Dropdown opens below with shadow `0 4px 16px rgba(0,0,0,0.10)`.

### Nav items
`display: flex; gap: 8px`. Icon 16px / strokeWidth 1.6. Font 14px / weight 400.
Active: `backgroundColor: rgba(0,122,255,0.07)`, `color: #007AFF`. No border stripes.

### Section labels (sidebar)
10px / weight 500 / uppercase / letterSpacing 0.08em / color `#8E8E93`. Padding `0 12px`.

### KPI hero card (Dashboard)
`backdrop-filter: blur(12px)`, `background: rgba(255,255,255,0.72)`, `border-radius: 14px`. Gradient backdrop behind: `linear-gradient(135deg, rgba(0,122,255,0.13) 0%, rgba(52,199,89,0.05) 60%, transparent 100%)`.
KPI values: 28px / 500 / letterSpacing -0.5px. Column dividers: 0.5px border-right.

### Status badges
Inline pill, border-radius 6px.
- Active: `bg rgba(0,122,255,0.10)` / `color #007AFF`
- Handed Off: `bg rgba(255,149,0,0.10)` / `color #FF9500`
- Closed: `bg rgba(0,0,0,0.06)` / `color #8E8E93`

### Table
White card with 0.5px border, 10px radius. Column headers: 11px / 500 / uppercase / tracked / `#8E8E93`. Row borders: 0.5px. Hover: `rgba(0,0,0,0.02)`.

### Form inputs
`border-radius: 10px`, `border: 0.5px solid rgba(0,0,0,0.12)`, `background: #FFFFFF`, `font-size: 15px`. Focus: borderColor → `#007AFF`.

### Save button
Default: `background: #007AFF`, `color: #FFFFFF`. Saved: `background: rgba(52,199,89,0.12)`, `color: #34C759` + Check icon. Resets after 2.2s.

### Toggle
40x24px pill. On: `#007AFF`. Off: `rgba(0,0,0,0.12)`. White 18px knob. Transition: `left 0.15s`.

### Kanban cards
White card, 10px radius, 0.5px border. Column dot: 8px circle in column accent color. Card hover: `box-shadow: 0 2px 8px rgba(0,0,0,0.07)`.

### Integration cards
2-column grid. Logo avatar: 40x40 with `logoColor + 18` (hex alpha) bg. Status badge inline pill. Connect button: `#007AFF` → becomes gray check when connected.

---

## Absolute Bans

- No side-stripe borders (`border-left` > 1px as accent)
- No gradient text
- No font-weight above 500
- No dark/navy backgrounds

---

## File Structure

```
src/
  index.css              Google Fonts (Inter 400/500), body reset (light theme)
  App.tsx                BrowserRouter + Routes (6 pages)
  components/
    Layout.tsx           220px sidebar + Outlet
  pages/
    Dashboard.tsx        Frosted glass KPI hero + bar chart + conversation feed
    Conversations.tsx    Filterable table with search/status filter + View CTA
    Leads.tsx            Kanban board (4 columns: New/Contacted/Appt Set/Handed Off)
    Settings.tsx         2-col: Dealership Info + AI Agent Settings / Notifications
    AgentConfig.tsx      Model picker + system prompt editor + escalation rules
    Integrations.tsx     8 integration cards with connect/disconnect + category filter
```
