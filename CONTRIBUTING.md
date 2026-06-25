# Contributing to CSSBattle Analytics

Thanks for wanting to contribute! Here's how to do it right.

## PR Workflow

1. **Fork** the repo
2. **Create a branch** from `main` with a clear name:
   - `feat/description` — new feature
   - `fix/description` — bug fix
   - `a11y/description` — accessibility
   - `perf/description` — performance
   - `docs/description` — documentation
3. **Make your changes**
4. **Run checks** before pushing:
   ```bash
   bun run lint
   bun run build
   ```
5. **Write a good PR description** (use the template below)

## Code Standards

### TypeScript & React
- Strict mode — no `any`, no `@ts-ignore`
- Use the `@/` path alias for imports (e.g., `import { cn } from '@/lib/utils'`)
- Prefer `const` + arrow functions over `function` declarations

### CSS / Tailwind
- Use Tailwind utility classes first
- Add custom styles in `src/index.css` using `@utility` if needed
- Use the project's design tokens (e.g., `text-primary`, `bg-card`, `border-border`)

### Naming
- **Files**: `PascalCase` for components, `camelCase` for utilities
- **Components**: Named exports preferred, default exports acceptable
- **Props**: Define interfaces with `interface` keyword, not `type`

### Accessibility
- Every `<img>` needs `alt`
- Every icon-only `<button>` / `<a>` needs `aria-label`
- Interactive elements must be keyboard-accessible
- Use semantic HTML (`<nav>`, `<section>`, `<button>`, etc.)

### Performance
- Wrap expensive computations in `useMemo` / `useCallback`
- Memoize list items with stable keys (never bare array indices)
- Lazy-load route components with `React.lazy`

## Commit Style

Keep commits small and descriptive:

```
type: short description

- bullet point details if needed
```

Types: `feat`, `fix`, `a11y`, `perf`, `docs`, `chore`, `refactor`

## PR Checklist

Before submitting, confirm:
- [ ] `bun run lint` passes (no new warnings)
- [ ] `bun run build` passes
- [ ] No `console.log` left in production code
- [ ] No `any` or `@ts-ignore` added
- [ ] New components have proper `aria-label` / alt text where needed
- [ ] PR description explains what and why

## Need Help?

Open a [discussion](https://github.com/AbhishekBalija/My-CSS-Battle/discussions) or tag `@AbhishekBalija` in your PR.
