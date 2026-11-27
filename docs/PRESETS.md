# Presets (styles + theme colors)

A preset = one **style** (`style-<name>`) layered over one **theme color**
(the built-in neutral theme, or a `theme-<color>` override). Styles and theme
colors are independent: any style combines with any color.

## Install

```sh
# 1. base theme (required — provides the Tailwind v4 setup and default vars)
pnpm dlx shadcn@latest add rayli09/shadcn-effect/theme

# 2. optional: a different base color (stone, zinc, mauve, olive, mist, taupe)
pnpm dlx shadcn@latest add rayli09/shadcn-effect/theme-zinc

# 3. a style preset (luma, lyra, maia, mira, nova, rhea, sera, vega)
pnpm dlx shadcn@latest add rayli09/shadcn-effect/style-nova
```

## Wire up the CSS

Import order matters — later files override earlier ones:

```css
@import "./styles/theme.css"; /* 1. base theme (neutral) */
@import "./styles/theme-zinc.css"; /* 2. optional color override */
@import "./styles/style-nova.css"; /* 3. style preset */
```

Then add the preset's class to your root element (e.g. `<html>` or the app
root `<div>`). Every rule in a preset file is scoped under that class:

```html
<html class="style-nova"></html>
```

Swap presets by changing that one class (and the matching import).

## What presets do and don't cover

- **Presets style the `base-*` (hooks) generation only.** The preset files
  target the `cn-*` hook classes (`.cn-button`, `.cn-accordion-trigger`, …)
  that the `base-*` items emit. They do **not** affect the classic new-york
  items (`button`, `card`, …), which carry their full utility classes inline
  and only respond to the theme variables.
- **Theme colors apply to both generations.** `theme-<color>` only redefines
  the CSS variables (`--background`, `--primary`, `--sidebar-*`, …) in `:root`
  and `.dark`; anything reading the vars picks it up.
- **Fonts are yours to configure.** The presets ship no font variables or
  `@font-face` rules. Set your font stack in your own CSS (e.g. `--font-sans`
  in a `@theme` block) — the preset `@apply` rules inherit it.
- **Animations:** covered by `theme.css` — it imports `tw-animate-css`
  (upstream's own globals do the same) for `animate-in` / `animate-out` and
  the `fade-*` / `zoom-*` / `slide-*` modifiers, defines
  `--animate-accordion-down/up` with keyframes, and defines
  `--animate-caret-blink` with shadcn's standard caret-blink keyframes
  (upstream v4 uses the utility without shipping a definition in apps/v4).
