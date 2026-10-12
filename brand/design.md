# cmd. Institutional Banking Risk & Churn Analytics — UI/UX Design System Specification

> **Document Version:** 1.0.0  
> **Target Audience:** AI Engineering Agents, Frontend Developers, Design Contributors  
> **Last Updated:** October 2026  
> **Status:** Active Standard

---

## 1. Design Philosophy & Product Identity

### 1.1 Core Identity
`cmd.` (*Command*) is an enterprise-grade banking intelligence platform engineered for credit risk officers, portfolio analysts, and branch managers. The platform monitors high-value customer churn, evaluates multivariate behavioral signals, and delivers calibrated interventions.

### 1.2 Aesthetic Directives
- **Precision Financial Terminal:** High-density, clutter-free, executive-ready interface inspired by modern financial workstations (Linear, Bloomberg Terminal, Vercel design systems).
- **Strict B&W / Monochrome Color Hierarchy:** Data visualizations prioritize shades of white, silver, graphite, and charcoal rather than decorative rainbow colors.
- **Micro-Telemetry Contrast:** Functional indicators (system status, risk badges, deltas) use targeted semantic micro-accents while maintaining a dark background.

---

## 2. Color System & Accessibility Rules

### 2.1 Color Tokens

| Token Name | Hex Code | Purpose |
|---|---|---|
| `bg-background` | `#09090b` | Main application backdrop |
| `bg-card` / `bg-surface` | `#121216` | Standard cards, containers, sidebar backdrop |
| `bg-surface-subtle` | `#18181f` | Hover states, inactive buttons, nested wells |
| `bg-panel` | `#14141a` | Sticky header, brand banner, sub-nav bars |
| `border` | `#27272a` | Primary card borders, divider lines |
| `border-subtle` | `#222226` | Grid lines, chart axes, hairline rules |
| `border-light` | `#383842` | Interactive element hover borders |

### 2.2 Typography & Text Contrast Standards (CRITICAL)

> **Prohibited Text Colors:**
> Under no circumstances should text use `#1e1e24`, `text-neutral-700`, `text-zinc-700`, or raw dark charcoal on dark backgrounds. All text must maintain a minimum 4.5:1 WCAG AA contrast ratio.

| Hierarchy | Tailwind Utility | Hex Equivalent | Usage |
|---|---|---|---|
| **Primary Titles** | `text-white` / `text-foreground` | `#ffffff` / `#f4f4f5` | Page titles, KPI values, active table items |
| **Section Headings** | `text-neutral-100` | `#f4f4f5` | Card headings, primary modal labels |
| **Secondary Text** | `text-neutral-300` | `#d4d4d8` | Subtitles, descriptions, inactive tab labels, form field labels |
| **Muted & Metadata** | `text-neutral-400` / `text-muted` | `#a1a1aa` | Captions, axis labels, timestamps, delta comparisons |
| **Micro-Codes** | `font-mono text-zinc-400` | `#a1a1aa` | Account IDs, branch codes, model versions |

### 2.3 B&W Monochrome Chart Palette

To maintain the executive monochrome aesthetic, charts must use the graduated monochromatic scale:

```css
--chart-low:      #ffffff;  /* Pure White: Low risk accounts (majority base) */
--chart-medium:   #a1a1aa;  /* Silver Zinc-400: Moderate exposure */
--chart-high:     #71717a;  /* Graphite Zinc-500: Elevated churn risk */
--chart-critical: #3f3f46;  /* Charcoal Zinc-700: Urgent attrition alert */
```

- **Area Trajectory Fills:** White stroke (`#ffffff`, 2px) with a linear gradient fading from 10% opacity to 0% opacity (`#131316` background).
- **Cartesian Grid:** `#222226` subtle horizontal rules only (no vertical grid lines).

---

## 3. Typography Hierarchy

| Family | Stack | Purpose |
|---|---|---|
| **Sans** | `Inter`, system-ui, sans-serif | UI body copy, table data, navigation links, forms |
| **Display** | `'Space Grotesk'`, `'Host Grotesk'` | Landing page headlines, modal banners, hero titles |
| **Mono** | `'JetBrains Mono'`, monospace | Financial balances (₹), percentages (%), telemetry IDs, model tags |

---

## 4. Role-Based Access Control (RBAC) UX Directives

The application enforces three institutional roles. The interface **must dynamically adapt** to the authenticated user's role:

```
[ADMIN] Chief Risk Officer & Platform Admin
├── Dashboard
├── Customers & Customer 360
├── Segments (K-Means Clustering)
├── Risk Matrix
├── Churn Analytics & Benchmarks
├── Retention Recommendations
├── What-If Simulator
├── Compliance Reports
└── Institutional Admin Portal (EXCLUSIVE)

[ANALYST] Senior Risk & Churn Analyst
├── Dashboard
├── Customers & Customer 360
├── Segments (K-Means Clustering)
├── Risk Matrix
├── Churn Analytics & Benchmarks
├── Retention Recommendations
├── What-If Simulator
└── Compliance Reports
(Admin Portal is HIDDEN and RESTRICTED)

[MANAGER] Regional Branch Manager
├── Dashboard
├── Customers & Customer 360 (Branch focus)
├── Retention Recommendations
└── Compliance Reports
(Simulator, Segments, Risk Matrix, Churn Analytics, Admin Portal are HIDDEN and RESTRICTED)
```

### RBAC UI Enforcement Rules
1. **Sidebar Navigation:** Navigation items outside the active role's permissions must be **filtered out entirely** from the sidebar DOM. Never render inactive or disabled ghost links for features the role cannot access.
2. **Route Guards:** Any manual navigation attempt (e.g. `MANAGER` typing `/simulator` or `ANALYST` typing `/admin` into the browser URL) must be blocked by `ProtectedRoute` and redirected to `/dashboard`.
3. **Role Switcher:** The sidebar quick-switch role bar enables toggling between `ADMIN`, `ANALYST`, and `MANAGER` for instantaneous persona testing.

---

## 5. Model Selection & Reactive Telemetry

### 5.1 Supported Model Architectures

1. **`bankshield_hybrid` (BankShield-Hybrid - Custom Hybrid Stacking)**
   - *Architecture:* Multi-layer stacking ensemble (XGBoost + CatBoost + LightGBM + Logistic Meta-Learner + Platt Probability Calibration).
   - *Benchmark:* 98.45% Accuracy, 95.45% Precision, 18.4% Calibrated Portfolio Churn Rate.
   - *Rule:* Proprietary model; **cannot be combined** with standalone models.

2. **Standalone Models (`canCombine: true`):**
   - `xgboost`: Extreme Gradient Boosted Trees (19.3% churn rate).
   - `catboost`: Symmetric Oblivious Decision Trees (19.6% churn rate).
   - `lightgbm`: Leaf-Wise Histogram GBDT (18.9% churn rate).
   - `random_forest`: 100-Tree Bootstrap Bagging Ensemble (20.8% churn rate).
   - `logistic_regression`: L2-Regularized Linear Baseline (23.6% churn rate).

3. **`combined` (Blended Ensemble):**
   - *Architecture:* 50/50 Soft-Voting blend of up to 2 standalone base models.

### 5.2 Reactive UI Principles
- **Global Header Selector:** The engine badge in the top navigation (`Header.jsx`) controls the global `ModelContext`.
- **Immediate Re-evaluation:** Toggling the model must **immediately re-fetch** and update:
  - Top KPI cards (Churn Rate, High-Risk Accounts, Critical-Risk Accounts).
  - 12-Month Attrition Trajectory curve (`ChurnTrend.jsx`).
  - Risk Distribution Donut chart & legend (`RiskOverview.jsx`).
  - High-Vulnerability Watchlist ranking (`HighRiskCustomers.jsx`).
- **Dynamic Attribution:** Cards and legends must display the **name of the currently selected model** (e.g., `Logistic Regression Baseline classification` or `BankShield-Hybrid classification`). Never hardcode a static model name.

---

## 6. Layout & Taskbar Components

### 6.1 Sliding Taskbar (Sidebar)
- **Expanded Width:** `w-64` (256px). Displays brand logo, category headers, full navigation labels, active role pill, and user profile.
- **Collapsed Width:** `w-[68px]` (68px). Icon-only taskbar mode with centered icon buttons, compact `cmd.` icon tile, and role initial (`A`, `M`).
- **Toggle Control:** `PanelLeftClose` toggle button in sidebar header and a complementary toggle in the global top header.
- **Transitions:** `transition-all duration-300 ease-in-out`.

### 6.2 Resilient Offline Handling
- The dashboard must **never** crash or render a blocking full-page red error box during backend initialization or temporary connection delays.
- If the backend API on port `5000` is starting up or temporarily offline, the UI renders the calibrated institutional baseline metrics alongside a non-blocking notification banner:
  ```
  [OFFLINE MODE] Live API connection pending (port 5000). Displaying calibrated institutional portfolio baseline. [Retry Connection]
  ```

---

## 7. Anti-Patterns & Prohibited Practices

Future AI agents and developers modifying this codebase must adhere to these prohibitions:

1. ❌ **Do NOT add unrelated revenue or e-commerce widgets.** The project is exclusively calibrated for **banking customer churn, liquidity risk, and account attrition**.
2. ❌ **Do NOT use low-contrast charcoal text.** Always use `text-neutral-300` or `text-neutral-400` for secondary text on dark surfaces.
3. ❌ **Do NOT hardcode model names in components.** Always read from `activeModel` via `useModel()`.
4. ❌ **Do NOT expose Admin Portal or Simulator to Branch Managers.** Enforce RBAC in both navigation and routing.
5. ❌ **Do NOT bypass Platt Calibration for BankShield-Hybrid.** Standalone trees output raw probabilities; BankShield-Hybrid provides calibrated isotonic confidence bounds.
