# Kubogent — Claude Code Guidelines

## Project Overview

Kubogent is a React + TypeScript SPA for managing Kubernetes clusters and MLOps workflows (model catalog, pipelines, deployments). It is a prototype/frontend-only app using mock data.

## Tech Stack

- **React 19** with `react-router-dom` v7
- **TypeScript 5.9** (strict mode)
- **Vite 5** (bundler)
- **Tailwind CSS 3** (custom dark-theme design tokens)
- **ESLint 9** (flat config, typescript-eslint + react-hooks + react-refresh)
- **lucide-react** for icons, **recharts** for charts, **@xyflow/react** for pipeline graphs

## Development Commands

```bash
npm run dev      # start dev server
npm run build    # tsc -b && vite build
npm run lint     # eslint .
npm run preview  # preview production build
```

## Strict Lint & Quality Checks

### TypeScript — Non-Negotiable Rules

These flags are enforced in `tsconfig.app.json` and must never be loosened:

| Flag | What it enforces |
|---|---|
| `strict: true` | Strict null checks, strict function types, etc. |
| `noUnusedLocals` | No unused local variables |
| `noUnusedParameters` | No unused function parameters |
| `noFallthroughCasesInSwitch` | Every switch case must `break`/`return` |
| `noUncheckedSideEffectImports` | Bare imports with side effects must be explicit |
| `erasableSyntaxOnly` | No legacy TS-only syntax (enums, namespaces, decorators) |

**Never add `// @ts-ignore` or `// @ts-expect-error`** without a comment explaining exactly why.

**Avoid `any`**. The existing `/* eslint-disable @typescript-eslint/no-explicit-any */` in `DataTable.tsx` and `Column` type in `types/index.ts` are known exceptions because of the generic table abstraction. Do not add new `any` usages. Use proper generics, `unknown`, or discriminated unions instead.

### ESLint Rules (enforced via `eslint.config.js`)

- `eslint-plugin-react-hooks` — exhaustive deps rule is on. Always include every reactive value in `useEffect`/`useCallback`/`useMemo` dependency arrays.
- `eslint-plugin-react-refresh` — every component file must export only React components (no mixing of utility exports and components in the same file).
- `typescript-eslint/recommended` — all recommended rules are active.

Run `npm run lint` and fix all errors before committing. Zero warnings policy: treat ESLint warnings as errors.

## React & UI Quality Rules

### Component Structure

- One default export per file; keep it a React component.
- Shared/reusable components live in `src/components/shared/`. Page-specific components live inside their page directory under `src/pages/`.
- Never put business logic or data-fetching in shared components — they are pure presentational.

### Props & Typing

- All component props must be typed with an explicit `interface` or `type` (no inline object type literals for props).
- Never use `React.FC` — plain function declarations are preferred:
  ```tsx
  // good
  export default function MyComponent({ title }: MyComponentProps) { ... }

  // bad
  const MyComponent: React.FC<MyComponentProps> = ({ title }) => { ... }
  ```
- Optional props that have sensible defaults must use default parameter values, not `??` in the body.

### Hooks

- Hooks must be called at the top level — no conditional hook calls.
- `useEffect` must always have a dependency array. Never use an empty `[]` without a comment if the intent is truly "run once on mount".
- Derive values with `useMemo`/`useCallback` only when the computation is expensive or referential stability matters. Do not memoize everything by default.
- Do not store derived state in `useState`. Compute it from existing state/props.

### Event Handlers

- Inline arrow functions in JSX are acceptable for simple handlers but prefer named handlers for logic that spans more than one expression.
- Use optional chaining for optional callbacks: `onRowClick?.(row)` (as seen in `DataTable`).

### Styling — Tailwind Only

- Use **only** Tailwind utility classes and the custom design tokens defined in `tailwind.config.js`. Never write inline `style={{}}` objects unless you need dynamic values that Tailwind cannot express (e.g., computed widths from data).
- **Design token reference** (always use these, not raw hex values):

  | Token | Usage |
  |---|---|
  | `bg-primary` / `bg-secondary` / `bg-tertiary` / `bg-elevated` | Background layers |
  | `border` / `border-light` | Borders |
  | `text-primary` / `text-secondary` / `text-muted` | Text hierarchy |
  | `accent-blue` | Primary actions, active nav, links |
  | `accent-green` | Success, healthy status |
  | `accent-amber` | Warning status |
  | `accent-red` | Error / destructive actions |
  | `accent-purple` | AI / intelligence indicators |
  | `accent-cyan` | Supplementary accent |

- Interactive elements must include `transition-colors` for smooth state changes.
- Hover states follow the pattern `hover:bg-bg-tertiary hover:text-text-primary`.
- Active/selected states use `bg-accent-blue/10 text-accent-blue border-l-2 border-accent-blue`.

### Icons

- Use **only** `lucide-react` for icons. Consistent sizing: `w-4 h-4` for inline/nav icons, `w-5 h-5` for slightly larger contexts.
- Never import icons you do not use (enforced by `noUnusedLocals`).

### Routing

- Use `NavLink` (not `Link`) for navigation items that need active-state styling.
- Use `useNavigate` for programmatic navigation; never manipulate `window.location` directly.
- All routes are declared in `src/App.tsx` — add new routes there, not scattered across components.

### Key Props

- Never use array index as `key` when the list can be reordered or filtered. Use a stable unique identifier (`id`, `name`, etc.).
- The existing `key={i}` in `DataTable` is a known exception because the table data is static per render.

### Accessibility

- Every interactive element that is not a native `<button>` or `<a>` must have `role`, `tabIndex`, and keyboard event handlers.
- `<button>` elements must have a descriptive `aria-label` when the visible text alone is insufficient (e.g., icon-only buttons).
- Images must have `alt` text.

### State Management

- No external state library. Use `useState` and `useContext` (or prop drilling for shallow trees).
- Session persistence uses `sessionStorage` (see `App.tsx`). Do not use `localStorage` without explicit discussion.

## File Naming Conventions

- React component files: `PascalCase.tsx`
- Non-component TypeScript files: `camelCase.ts`
- All source files under `src/`

---

## Design Language & Style Guide

Kubogent follows an **Apple-inspired design philosophy**: extreme restraint, purposeful whitespace, deep dark surfaces, and a single accent color per semantic meaning. Every pixel should feel intentional — no decoration for its own sake.

### Core Principles

1. **Clarity over cleverness** — The UI communicates state instantly. No ambiguity about what is interactive, what is active, what is in error.
2. **Depth through darkness** — Hierarchy is expressed by layering progressively lighter dark surfaces, not by adding color or shadows.
3. **Restraint** — Default to less. One accent color per element. One level of visual weight per section. No gradients, no glows, no decorative borders.
4. **Motion with purpose** — Transitions only for state changes (`transition-colors`). Animation only for live/in-progress states (`animate-pulse`). Never animate for aesthetics.

---

### Surface & Depth System

The four background layers create a spatial hierarchy, from deepest to nearest:

| Layer | Token | Hex | Used for |
|---|---|---|---|
| Page canvas | `bg-bg-primary` | `#0a0a0a` | Full-page background, the void behind everything |
| Base surface | `bg-bg-secondary` | `#111111` | Sidebar, topbar, cards, modals, panels |
| Recessed surface | `bg-bg-tertiary` | `#1a1a1a` | Inputs, table row hover, icon containers, code blocks |
| Elevated surface | `bg-bg-elevated` | `#222222` | Tooltips, dropdowns, popovers — things that float above cards |

**Rule**: never skip a level. A tooltip inside a card uses `bg-elevated`, not `bg-tertiary`. A card on a page uses `bg-secondary`, not `bg-primary`. The gradual lightening creates perceived depth without shadows.

Borders separate surfaces of the same layer. Use `border-border` (`#262626`) as the default. Use `border-border-light` (`#333333`) only for lighter-weight dividers within a surface (e.g., list item separators inside a card).

---

### Color Palette

#### Accent Colors — Semantic, Not Decorative

Accent colors are used **only** for semantic meaning. Never use an accent color purely because it looks nice.

| Token | Hex | Semantic meaning | Use for |
|---|---|---|---|
| `accent-blue` | `#3b82f6` | Primary / action | CTA buttons, active nav item, focus rings, links, progress indicators |
| `accent-green` | `#22c55e` | Success / healthy | Running/Active/Ready status, completed steps, positive trends |
| `accent-amber` | `#f59e0b` | Warning / in-progress | Deploying/Building/Pending status, warnings |
| `accent-red` | `#ef4444` | Error / destructive | Failed/Error status, validation errors, destructive actions |
| `accent-purple` | `#a855f7` | AI / intelligence | AI features, the Kubogent brand mark, ML-specific indicators |
| `accent-cyan` | `#06b6d4` | Supplementary | Secondary data series in charts, secondary metrics |

#### Accent Opacity Variants

Accents at reduced opacity create tinted surfaces without overwhelming the dark palette:

- **`/10` opacity** — subtle tinted background for active/selected states (e.g., `bg-accent-blue/10` on active nav)
- **`/20` opacity** — icon container backgrounds, avatar backgrounds, success state containers (e.g., `bg-accent-green/20`)
- **Full opacity** — text, dot indicators, button fills, active underlines

```tsx
// Correct: active nav item
'bg-accent-blue/10 text-accent-blue border-l-2 border-accent-blue'

// Correct: icon container
'bg-accent-purple/20 flex items-center justify-center'
// with icon inside:
'text-accent-purple'

// Wrong: using full opacity as a background
'bg-accent-blue text-white'  // ← only acceptable for primary CTA buttons
```

#### Text Hierarchy

Three levels, always used in strict hierarchy — never apply a lighter text color to more prominent content:

| Token | Hex | Used for |
|---|---|---|
| `text-text-primary` | `#f5f5f5` | Page titles, card titles, active labels, primary values, body content |
| `text-text-secondary` | `#a3a3a3` | Descriptions, inactive nav labels, form labels, table headers, secondary values |
| `text-text-muted` | `#737373` | Timestamps, helper text, placeholders, disabled states, breadcrumb separators |

---

### Typography

Kubogent uses the Tailwind default system font stack (San Francisco on macOS/iOS, Segoe UI on Windows, system-ui elsewhere) — matching the Apple platform aesthetic without a custom font dependency.

#### Type Scale

| Role | Classes | Where used |
|---|---|---|
| Page title | `text-2xl font-semibold text-text-primary` | `<PageHeader>` h1 |
| Section / modal title | `text-lg font-semibold text-text-primary` | Modal headers, wizard headings |
| Card / panel title | `text-sm font-medium text-text-primary` | Chart titles, card section headers |
| Metric value | `text-3xl font-semibold text-text-primary` | `<MetricCard>` primary number |
| Body / table cell | `text-sm text-text-primary` | Table row content, list items |
| Label / nav item | `text-sm font-medium` | Nav labels, tab labels, button text |
| Description / caption | `text-sm text-text-secondary` | Page sub-descriptions, form hints |
| Meta / timestamp | `text-xs text-text-muted` | Timestamps, secondary metadata |
| Badge / tag | `text-xs font-medium` | `<StatusBadge>`, labels |
| Table header | `text-xs font-medium text-text-muted uppercase tracking-wider` | `<DataTable>` `<th>` |

**Rules:**
- Never use `font-bold` — `font-semibold` (600) is the heaviest weight in use.
- Never go below `text-xs` (12px).
- Title hierarchy is enforced by size + weight together — do not use `font-semibold` on body text.

---

### Spacing & Layout

#### Page Layout

Pages are rendered inside `AppLayout` which applies `p-6` to the content area. Do not add extra top-level padding inside page components.

```tsx
// Correct: page component starts with PageHeader directly
export default function ClustersListPage() {
  return (
    <div>
      <PageHeader title="Clusters" ... />
      ...
    </div>
  )
}
```

#### Vertical Rhythm

| Gap | Usage |
|---|---|
| `mb-6` | After `<PageHeader>` before content |
| `mb-8` | After `<TabGroup>` before tab content; after metric grid before next section |
| `mb-4` | Between a card title and its content |
| `mb-2` | Between tightly related elements (metric value → trend) |
| `mb-1` | Between a form label and its input |
| `space-y-6` | Stacked content sections within a tab |
| `space-y-4` | Form fields in a form |
| `space-y-3` | Items in a list/feed (activity items) |
| `space-y-1` | Tightly packed nav items |

#### Grid Layouts

- Metric cards: `grid grid-cols-2 lg:grid-cols-5 gap-4`
- Detail panels / chart pairs: `grid grid-cols-1 lg:grid-cols-2 gap-6`
- Never use a grid for a single item — use a block or flex container.

#### Flex Patterns

```tsx
// Header row: title left, actions right
'flex items-start justify-between'

// Inline label + value / icon + text
'flex items-center gap-2'   // tight
'flex items-center gap-3'   // standard
'flex items-center gap-4'   // topbar actions

// Centered content (empty states, login)
'flex items-center justify-center'
```

---

### Border Radius

Everything is rounded — sharp corners do not appear in this design:

| Size | Token | Used for |
|---|---|---|
| `rounded-xl` | 12px | Cards, modals, panels, wizard containers, data tables, empty states |
| `rounded-lg` | 8px | Buttons, inputs, icon containers (`w-8 h-8`), dropdowns, tooltips |
| `rounded-full` | 9999px | Status dots, badges (`<StatusBadge>`), avatar circles, step indicators, notification dots |
| `rounded` | 4px | Small inline tags, tight utility elements |

---

### Component Patterns

#### Cards

The fundamental container unit. Always `bg-bg-secondary border border-border rounded-xl`.

```tsx
// Standard card
<div className="bg-bg-secondary border border-border rounded-xl p-5">

// Card with a header section divided by a border
<div className="bg-bg-secondary border border-border rounded-xl">
  <div className="px-6 py-4 border-b border-border">...</div>
  <div className="p-6">...</div>
</div>
```

#### Buttons

Three variants only. Do not invent new button styles.

```tsx
// Primary — filled, blue. Use for the single most important action on a view.
'px-6 py-2 text-sm font-medium bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors'

// Confirm / complete — filled, green. Use for final "Deploy" / "Create" actions.
'px-6 py-2 text-sm font-medium bg-accent-green text-white rounded-lg hover:bg-accent-green/90 transition-colors'

// Ghost — text only. Use for secondary/back actions and inline controls.
'px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors'

// Icon button — square, no label.
'p-2 rounded-lg hover:bg-bg-tertiary transition-colors'
// Icon inside: 'w-4 h-4 text-text-secondary'
```

Never use `bg-accent-red` for a destructive button — use the Ghost style with `text-accent-red` instead, to maintain restraint.

#### Inputs & Form Controls

```tsx
// Text input
'w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors'

// Search input (with leading icon)
'w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors'
// Leading icon positioned: 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted'

// Form label
'block text-sm text-text-secondary mb-1'

// Select / dropdown — same surface as text input
// Focus ring: always focus:border-accent-blue, never a box-shadow ring
```

#### Status Badges

Always use `<StatusBadge>` — never hand-roll status indicators. The component owns the full status → color mapping (see `src/components/shared/StatusBadge.tsx`).

The pattern is a pill with a leading dot:
```
rounded-full  px-2.5 py-1  text-xs font-medium
[bg-accent-X/10] [text-accent-X]
  ↳ dot: w-1.5 h-1.5 rounded-full [bg-accent-X]
        animate-pulse  ← only when in a transitional state (Deploying, Building, Pending)
```

#### Tabs

Always use `<TabGroup>`. The active tab is indicated by `text-accent-blue` + a 2px `bg-accent-blue` underline bar (`h-0.5 rounded-full`). The tab strip sits on a `border-b border-border` rule.

#### Empty States

Centered in a card, with a muted message only. No illustrations.

```tsx
<div className="bg-bg-secondary border border-border rounded-xl p-12 text-center">
  <p className="text-text-muted">No data found</p>
</div>
```

For success/completion states, add an icon container:

```tsx
<div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-4">
  <Check className="w-8 h-8 text-accent-green" />
</div>
```

#### Icon Containers

Wrap icons in a square container when they need visual weight (metric card icon, logo, avatar):

```tsx
// Standard icon container
'w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center'
// Icon: 'w-4 h-4 text-text-secondary'

// Accent icon container (AI/brand)
'w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center'
// Icon: 'w-4 h-4 text-accent-purple'

// Large icon container (success states, branding)
'w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center'
// Icon: 'w-5 h-5 text-accent-purple'
```

---

### Charts (Recharts)

Recharts does not understand Tailwind classes — use raw hex values that match the design tokens.

| Element | Value |
|---|---|
| Grid lines | `stroke="#262626"` `strokeDasharray="3 3"` |
| Axis tick text | `fill: '#a3a3a3'` `fontSize: 12` |
| Tooltip background | `backgroundColor: '#1a1a1a'` |
| Tooltip border | `border: '1px solid #262626'` `borderRadius: 8` |
| Primary line / area | `stroke="#3b82f6"` (accent-blue) |
| Success area | `stroke="#22c55e"` `fill="#22c55e"` `fillOpacity={0.2}` |
| Error area | `stroke="#ef4444"` `fill="#ef4444"` `fillOpacity={0.2}` |
| Stroke width | `strokeWidth={2}` for lines, `strokeWidth={1.5}` for sparklines |
| Dot | `dot={{ fill: '#3b82f6', r: 4 }}` — only on line charts, omit on area charts |

Sparklines (background charts in `<MetricCard>`) use `opacity-40` and no axes/grid — they are visual texture, not readable data.

---

### Animation & Motion

| Class | When to use |
|---|---|
| `transition-colors` | On every interactive element that changes color on hover/focus/active |
| `animate-pulse` | Status dots for transitional states only: Deploying, Building, Provisioning, Updating, Pending, firing |
| Nothing else | Do not add `transition-all`, `transition-opacity`, enter/exit animations, or keyframe animations |

Motion in this design is purely functional — it signals "something is happening" (`animate-pulse`) or "this element responds to you" (`transition-colors`). Never add motion for aesthetics.

---

## What to Avoid

- Do not add dependencies without discussion — the dependency list is intentionally lean.
- Do not create new abstraction layers (HOCs, custom hook libraries, context providers) speculatively.
- Do not use `enums` — use `type` union strings instead (enforced by `erasableSyntaxOnly`).
- Do not disable ESLint rules inline without a comment justifying the exception.
- Do not add `console.log` statements — remove them before committing.
