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

## What to Avoid

- Do not add dependencies without discussion — the dependency list is intentionally lean.
- Do not create new abstraction layers (HOCs, custom hook libraries, context providers) speculatively.
- Do not use `enums` — use `type` union strings instead (enforced by `erasableSyntaxOnly`).
- Do not disable ESLint rules inline without a comment justifying the exception.
- Do not add `console.log` statements — remove them before committing.
