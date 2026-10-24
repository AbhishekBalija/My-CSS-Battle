# Domain Docs

How engineering skills should consume this repository's domain documentation when exploring the codebase.

## Before exploring, read these

- `CONTEXT.md` at the repository root, or
- `CONTEXT-MAP.md` at the repository root if it exists, which points to one `CONTEXT.md` per context.
- `docs/adr/`, reading ADRs that touch the area being changed.

If any of these files do not exist, proceed silently. Do not flag their absence or suggest creating them upfront. The domain-modeling skill creates them when terms or decisions are resolved.

## File structure

This is a single-context repository:

```
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

## Use the glossary's vocabulary

When output names a domain concept, use the term defined in `CONTEXT.md`. If the needed concept is absent, reconsider whether new language is necessary or note the gap for domain modeling.

## Flag ADR conflicts

If a proposal contradicts an existing ADR, surface the conflict explicitly rather than silently overriding it.
