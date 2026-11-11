# cmd. Banking Risk & Churn Intelligence — Design System Specification (DESIGN.md)

> **Document Version:** 2.0.0  
> **Status:** Active Standard  
> **Last Updated:** November 2026  
> **Source Specification:** [brand/design.md](brand/design.md)

---

## 1. Executive Summary & Design Philosophy

`cmd.` (*Command*) is an enterprise-grade institutional banking risk intelligence platform engineered for credit risk officers, portfolio managers, and regional branch directors.

### Core Visual Principles
- **Financial Precision Terminal:** High-density, clutter-free, executive interface inspired by modern financial workstations (Linear, Bloomberg Terminal, Vercel).
- **Monochrome & High-Contrast Hierarchy:** Dark canvas (`#09090b`), surface containers (`#131316`), and crisp foreground text (`#f4f4f5`) ensuring strict WCAG 2.1 AA compliance (minimum 4.5:1 text contrast).
- **Semantic Micro-Telemetry:** Functional indicators (risk badges, pipeline states, deltas) use targeted semantic accents without rainbow noise.

---

## 2. Color Palette & Token Architecture

### 2.1 Base Theme Tokens (`frontend/src/index.css`)

| Token | Hex Value | Usage |
|---|---|---|
| `--background` / `--bg-app` | `#09090b` | Darkest background viewport canvas |
| `--card` / `--bg-surface` | `#131316` | Cards, panels, navigation drawers |
| `--bg-surface-subtle` | `#18181c` | Secondary button backgrounds, inputs, wells |
| `--bg-surface-hover` | `#1e1e22` | Hover highlights |
| `--border` | `#222226` | Hairline dividers, card outlines |
| `--text-foreground` | `#f4f4f5` | Primary titles, KPI values, table data |
| `--text-muted` | `#a1a1aa` | Field labels, captions, timestamps |
| `--text-dim` | `#94a3b8` | Subdued metadata, secondary footnotes |

### 2.2 Semantic Risk Indicators

| Risk Tier | Probability Range | Badge Background | Text Color | Indicator Dot |
|---|---|---|---|---|
| **CRITICAL** | `80% - 100%` | `bg-red-950/60` | `text-red-400` | Red pulse (`animate-ping`) |
| **HIGH** | `60% - 79%` | `bg-rose-950/50` | `text-rose-400` | Rose solid dot |
| **MEDIUM / WARNING**| `30% - 59%` | `bg-amber-950/50` | `text-amber-400`| Amber solid dot |
| **LOW / SAFE** | `0% - 29%` | `bg-emerald-950/50`| `text-emerald-400`| Emerald solid dot |
| **NEUTRAL** | N/A | `bg-surface-subtle`| `text-neutral-300` | Zinc dot |

---

## 3. Typography & Numerical Representation

- **Display & Headings:** `Host Grotesk` (prioritized in CSS and Tailwind configuration).
- **Body & Controls:** System sans stack (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`).
- **Data & Numbers:** `JetBrains Mono`, `tabular-nums` for currency (`₹`), percentages (`%`), account IDs, and timestamps.

### Formatting Utilities (`frontend/src/utils/formatters.js`)
- `formatCurrency(val)`: Formats in Indian Rupees (`₹1,30,888`).
- `formatPercent(val)`: Intelligently converts ratios (`0.184`) or percentages (`18.4`) to `18.4%`.
- `formatNumber(val)`: Standard localized digit grouping (`12,000`).
- `formatDate(val)`: Localized readable short dates (`11 Nov 2026`).

---

## 4. Craft Floor Invariants & Distillation Rules

To preserve executive elegance and maintain institutional standards, all components must adhere to:

1. **No Stacked Eyebrow / Kicker Tags:**
   - Do NOT place small uppercase category tags directly stacked above `h1` or `h2` headings (e.g. `DECISION ENGINE ARCHITECTURE` over a heading). Headings must be self-contained and clear.
2. **No Nested Cards Within Cards:**
   - Avoid nesting bordered container cards inside parent cards. Use flat rows with subtle dividers (`divide-y divide-border/40`), white space, or subtle well backgrounds (`bg-surface-subtle`).
3. **Flat Page Header Architecture:**
   - Page headers are flat with a bottom hairline divider (`border-b border-border/40`), matching `Dashboard.jsx`.
4. **No Stock Emoji for Icons:**
   - Use Lucide icons with fixed sizing (`w-4 h-4`) and semantic styling.
5. **No Visual Clutter in Hero:**
   - Hero headlines must remain crisp and unobstructed. Complex interactive timelines belong in dedicated sections with proper focus.
6. **Strict Lowercase Import Casing:**
   - Always import UI primitives with lowercase paths (`../components/ui/card`, `../components/ui/button`, `../components/ui/badge`) to prevent APFS vs Linux casing divergences.

---

## 5. Resilience & Error Handling

- **Route Error Boundary:** `<ErrorBoundary>` wraps the application router outlet in `App.jsx`, catching unhandled JavaScript crashes gracefully with recovery options.
- **Actionable Error Banners:** `<ErrorBanner error={...} onRetry={...} />` provides non-blocking alerts with retry buttons on all analytical pages.
- **Offline Mode Fallback:** If the backend API on port `5001` is initializing or temporarily offline, the dashboard displays calibrated institutional baseline figures with a non-blocking retry banner.

---

## 6. Architecture & Ports Standard

| Service | Technology | Port | Purpose |
|---|---|---|---|
| **Frontend** | React 18, Vite 8, Tailwind CSS | `5173` | Interactive analytical web application |
| **Backend API** | Node.js, Express, TypeScript, Mongoose | `5001` | Business logic, JWT auth, MongoDB proxy |
| **ML Service** | Python 3.9+, FastAPI, XGBoost, SHAP | `8000` | Real-time churn inference, calibration, K-Means |

