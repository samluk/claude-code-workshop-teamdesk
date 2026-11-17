# Unicorn rainbow theme

Status: ready to build. Budget: about 20 minutes. Frontend only: no schema, tRPC, service or test changes.

## Goal

Add an optional "unicorn" look to Teamdesk: a slowly drifting pastel rainbow page background with frosted-glass surfaces on top. It is a separate toggle that layers over the existing light/dark/auto mode, so there are four combinations: light, dark, and each with unicorn on.

## Decisions (from the interview)

| Question | Decision |
| --- | --- |
| How is it switched on? | Its own toggle, independent of the light/dark/auto button. |
| How far does the look go? | Colors plus animation. |
| What is animated? | The whole-page background drifts. No animation on buttons, headings or the header. |
| Cards, tables, forms? | Frosted glass: semi-transparent fill with backdrop blur. |
| Dark mode + unicorn? | Deep jewel tones (dark purples, magentas, teals) behind dark glass. |
| Toggle placement? | Outline button with a sparkles icon and the label "Unicorn", beside the existing theme button in the header. It looks pressed when on. |

## Assumptions (not asked, easy to change)

- Default is off. The choice persists in `localStorage` under the key `unicorn` (`"on"` or absent), the same way the existing `theme` key works.
- The brand terracotta primary color and the fonts stay as they are. Only the background and the surfaces change.
- Users with `prefers-reduced-motion: reduce` get the same gradient, static. No drift.
- No unicorn emoji, sparkle decorations or logo changes. The only new icon is the sparkles icon on the toggle.

## Behavior

1. A new `UnicornToggle` button sits next to `ThemeToggle` in [header.tsx](../../apps/web/src/components/header.tsx).
2. Clicking it toggles `data-unicorn="on"` on `<html>` and saves or clears `localStorage.unicorn`.
3. The button uses `aria-pressed` for its on/off state and has a clear `aria-label`. The visible label is "Unicorn" in both states, and the pressed state is styled with `variant="secondary"` (off: `variant="outline"`).
4. On load, an inline init script in [__root.tsx](../../apps/web/src/routes/__root.tsx) sets `data-unicorn` before first paint. Extend the existing `THEME_INIT_SCRIPT` rather than adding a second script, so there is no flash of the plain theme.
5. The toggle works on every route and is independent of the light/dark state. Changing light/dark while unicorn is on keeps unicorn on.

## Styling

All of this goes in [styles.css](../../apps/web/src/styles.css), keyed off `html[data-unicorn="on"]`.

- **Background:** the `body` gets a large multi-stop gradient (`background-size` about 300% 300%) animated by one `@keyframes` that moves `background-position`. The cycle is slow, about 30 to 60 seconds. `background-attachment: fixed` so it does not scroll with content.
  - Light + unicorn: pastel pink, lavender, sky blue, mint, butter yellow.
  - Dark + unicorn: deep purple, magenta, indigo, teal.
- **Surfaces:** under unicorn, make the surface tokens translucent and blur what is behind them. Target elements through the `data-slot` attributes the shadcn components already expose (`card`, `table-container`, `input`), so none of the generated `components/ui/**` files are edited.
  - Light: roughly `oklch(1 0 0 / 0.6)` fill. Dark: roughly `oklch(0.25 0.02 300 / 0.55)` fill.
  - `backdrop-filter: blur(12px)` and a thin translucent border.
- **Popovers, dialogs, select menus:** keep these effectively opaque (at least 90% alpha). Blurred text over a moving gradient is hard to read, and they sit on top of other glass.
- **Header:** it is already `bg-background/90` with a backdrop blur, so it picks up the tinted `--background` and needs no extra work beyond a check.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` sets `animation: none` on the unicorn background.

## Acceptance criteria

- The Unicorn button appears in the header on desktop and on mobile width, without breaking the header's wrapping.
- Toggling it on shows a drifting rainbow background. Toggling it off restores the exact current look.
- The setting survives a reload, with no flash of the plain theme on load.
- All four combinations are legible. Body text on glass surfaces has a contrast ratio of at least 4.5:1 (spot-check cards, the bookings table, form inputs and the muted text).
- With reduced motion enabled, the background does not move.
- `bun run check` passes.

## Out of scope

- Per-user or server-side theme storage. This is `localStorage` only.
- Seasonal or other color themes, or a theme picker.
- Animating anything except the page background.
- Editing `apps/web/src/components/ui/**`, which CLAUDE.md marks as generated.
- Tests. There is no existing UI test harness for the theme toggle, and this is a visual feature that needs a manual check in the browser.

## Files expected to change

- `apps/web/src/styles.css` (gradient, keyframes, glass overrides, reduced-motion)
- `apps/web/src/components/unicorn-toggle.tsx` (new)
- `apps/web/src/components/header.tsx` (render the toggle)
- `apps/web/src/routes/__root.tsx` (extend `THEME_INIT_SCRIPT`)

## Build order (about 20 minutes)

1. Gradient, keyframes and reduced-motion rule in `styles.css`, checked by setting the `data-unicorn` attribute in devtools (5 min).
2. Glass overrides for cards, tables, inputs and popovers, in light and dark (7 min).
3. `UnicornToggle`, header wiring and the init script (5 min).
4. Manual check of all four combinations on two routes plus mobile width, then `bun run check` (3 min).
