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

## Verification results

- `bun run check` passes and `bun test` passes (55 passed, 1 skipped).
- All four light/dark and unicorn combinations were checked in a browser, on desktop and at 375px wide, with no horizontal scroll. The setting persists across a reload with no flash, and turning it off restores the plain look.
- Contrast was measured, not estimated. For each mode it composites page, glass card, glass input, header and popover over 29 to 36 points along the gradient, for foreground, muted and label text. The worst case is 5.57:1 in light and 5.15:1 in dark. One failure showed up first (label text on the plain page, 4.31:1 in light), and darkening `--brand-label` in the light unicorn block fixed it.
- Reduced motion was run with headless Chrome emulating `prefers-reduced-motion`. With `reduce`, the body animation is `none` and no `unicorn-drift` animation runs, while the gradient stays. Without it, the animation runs.
- Not verified: real iOS Safari. It ignores `background-attachment: fixed`, so the gradient should scroll with the page there instead of staying fixed. The iOS Simulator needs a full Xcode install, which this Mac does not have.

## Environment note

`bun run check` failed at first because of the environment, not the feature. Scripts run under Bun with no real Node installed, and under Bun the local request that `wrangler types` makes to generate runtime types goes out to the real internet and returns a mock response from dummy.com. Wrangler then reuses that bad `worker-configuration.d.ts` as its cache. The fix was to generate the runtime types by running the installed `workerd` locally and splice them into the generated file. Installing Node avoids the problem.
