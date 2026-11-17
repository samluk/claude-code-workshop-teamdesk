# Unicorn theme: implementation plan

Companion to [unicorn-theme.md](unicorn-theme.md). The spec says what to build. This says who builds which part and in what order.

## Work split

The two build tasks touch disjoint files, so they run in parallel.

| # | Task | Agent | Files |
| --- | --- | --- | --- |
| A | Gradient background, keyframes, reduced-motion rule, glass overrides for light and dark | Sonnet | `apps/web/src/styles.css` |
| B | `UnicornToggle` component, header wiring, init-script extension | Haiku | `apps/web/src/components/unicorn-toggle.tsx` (new), `apps/web/src/components/header.tsx`, `apps/web/src/routes/__root.tsx` |

Task A is Sonnet because it needs judgement about contrast and glass over a moving gradient. Task B is small and mechanical (it copies the pattern of `theme-toggle.tsx`), so Haiku.

Contract between A and B: the toggle sets `data-unicorn="on"` on `<html>` and stores `localStorage.unicorn = "on"`. The CSS keys everything off `html[data-unicorn="on"]`, with `.dark` and `.light` classes for the variants.

## Order

1. Save this plan and commit it with the spec.
2. Launch A and B in parallel.
3. Read both diffs. Fix anything that breaks the spec or CLAUDE.md (no edits to `components/ui/**`, no barrel files).
4. Run `bun run check`, then `bun test`.
5. Verify in the browser: all four light/dark and unicorn combinations, a reload for persistence, mobile width, and reduced motion.
6. Fix issues, then commit.

## Commit boundaries

1. Spec and plan.
2. Implementation, once check, tests and the browser verification pass.

If a fix round is large, it gets its own commit.

## Done when

Every acceptance criterion in the spec holds, `bun run check` passes and `bun test` passes.
