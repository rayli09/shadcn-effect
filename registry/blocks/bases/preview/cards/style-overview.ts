/**
 * StyleOverview — shadcn/ui block `preview` (cards/style-overview.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a "use client" React function in the create-app that reads
 * the current design-system selection from URL search params
 * (`useDesignSystemSearchParams`) and renders a Card: a heading line
 * "<Style title> - <heading font name, or body font name when the
 * heading font is unset or identical>", the fixed preview sentence,
 * and a 6-column grid of twelve color swatches, one per CSS variable,
 * each swatch's background set through an inline `--color` custom
 * property. Here: a named view function with the same markup and class
 * strings verbatim; the swatch's inline style becomes a `style`
 * attribute carrying the same `--color: var(<variant>)` declaration.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Create-app internals are not ported: `useDesignSystemSearchParams`,
 *   `@/registry/styles` (STYLES) and `@/app/(create)/lib/fonts` (FONTS)
 *   are not imported. The card renders with the create-app's default
 *   selection — upstream `DEFAULT_CONFIG` in `registry/config.ts`:
 *   style "nova", font "inter", fontHeading "inherit" — inlined below
 *   as local constants copied from those data files (STYLES entry
 *   `{ name: "nova", title: "Nova" }`; FONTS entries geist → "Geist"
 *   and inter → "Inter", the FONTS order preserved). With fontHeading
 *   "inherit" there is no FONTS match, so the heading falls back to
 *   the body font's name, exactly as upstream's expression does:
 *   the rendered heading is "Nova - Inter".
 */
import type { Html } from "@effect/ui/html";
import { Card, CardContent } from "@/components/ui/card.ts";

// Minimal style/font name data the card displays, copied from upstream
// `apps/v4/registry/styles.tsx` (STYLES) and
// `apps/v4/app/(app)/(create)/lib/fonts.ts` (FONTS, built from
// `apps/v4/lib/font-definitions.ts` titles). Only the entries the
// default selection resolves to are inlined.
const STYLES: ReadonlyArray<{ readonly name: string; readonly title: string }> = [
  { name: "nova", title: "Nova" },
];

const FONTS: ReadonlyArray<{ readonly name: string; readonly value: string }> = [
  { name: "Geist", value: "geist" },
  { name: "Inter", value: "inter" },
];

// Upstream `DEFAULT_CONFIG` (apps/v4/registry/config.ts): the values
// `useDesignSystemSearchParams` reports when no params are present.
const params: { readonly style: string; readonly font: string; readonly fontHeading: string } = {
  style: "nova",
  font: "inter",
  fontHeading: "inherit",
};

const currentFont = FONTS.find((font) => font.value === params.font);
const currentFontHeading = FONTS.find((font) => font.value === params.fontHeading);
const currentStyle = STYLES.find((style) => style.name === params.style);

const headingFontName =
  currentFontHeading?.name && currentFontHeading.name !== currentFont?.name
    ? currentFontHeading.name
    : currentFont?.name;

export const StyleOverview = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  Card(h, { class: options.class }).children(
    CardContent(h, { class: "flex flex-col gap-6 style-lyra:gap-4 style-mira:gap-4" }).children(
      h.div
        .class("flex flex-col gap-1")
        .children(
          h.div
            .class(
              "cn-font-heading text-2xl font-medium style-lyra:text-lg style-mira:text-lg style-sera:text-lg style-sera:font-semibold style-sera:tracking-wide style-sera:uppercase",
            )
            .children(`${currentStyle?.title} - ${headingFontName}`),
          h.div
            .class(
              "line-clamp-2 text-base text-muted-foreground style-lyra:text-sm style-mira:text-sm style-sera:text-sm style-sera:leading-relaxed",
            )
            .children(
              "Designers love packing quirky glyphs into test phrases. This is a preview of the typography styles.",
            ),
        ),
      h.div.class("grid grid-cols-6 gap-3").children(
        ...[
          "--background",
          "--foreground",
          "--primary",
          "--secondary",
          "--muted",
          "--accent",
          "--border",
          "--chart-1",
          "--chart-2",
          "--chart-3",
          "--chart-4",
          "--chart-5",
        ].map((variant) =>
          h.div
            .key(variant)
            .class("flex flex-col flex-wrap items-center gap-2")
            .children(
              h.div
                .class(
                  "relative aspect-square w-full rounded-lg bg-(--color) after:absolute after:inset-0 after:rounded-lg after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten style-sera:rounded-none style-sera:after:rounded-none",
                )
                .attr("style", `--color: var(${variant})`),
              h.div
                .class(
                  "hidden max-w-14 truncate font-mono text-[0.60rem] md:block style-lyra:max-w-10 style-mira:max-w-10",
                )
                .children(variant),
            ),
        ),
      ),
    ),
  );
