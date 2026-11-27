/**
 * Marker (bases generation) — shadcn/ui `marker` ported 1:1 to Effect UI.
 *
 * Same Effect port as `registry/ui/marker.ts` (pure view functions returning
 * `h.div` / `h.span` builders — Marker keeps no state, so none of them is a
 * Component; variants as a plain Record, no cva); only the class layer
 * changes: class strings are byte-for-byte the shadcn bases/radix strings —
 * a structural inline base plus `cn-*` hook classes (`cn-marker`,
 * `cn-marker-variant-*`) whose utilities are supplied by the style presets.
 * The parity checker asserts every token in
 * `parity/bases-tokens.json["marker"]`.
 *
 * Declared divergence (PORTING-RULES.md D-2): upstream `Marker` accepts
 * `asChild` (Radix Slot). There is no Slot in Effect UI, so `Marker` always
 * renders the <div>; compose by rendering the marker's classes on your own
 * element via `markerVariants(...)` if you need another tag.
 *
 * Anatomy diff vs the new-york port: identical elements, data-slots and
 * exports. The bases generation moves almost everything visual into the
 * presets — the root loses `min-h-4 gap-2 text-left text-sm
 * text-muted-foreground` and the `[&_svg…]` / `[a]:` rules, MarkerIcon
 * loses its `size-4` + svg sizing rule, and MarkerContent loses the
 * separator-group and link rules; all of that now lives in the presets'
 * `cn-marker*` rules.
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";

type Div<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

type Span<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"span">, HTMLSpanElement, "span">;

export const MARKER_ICON_CLASS = "cn-marker-icon shrink-0";

export const MARKER_CONTENT_CLASS = "cn-marker-content min-w-0 wrap-break-word";

export type MarkerVariant = "default" | "separator" | "border";

const MARKER_BASE = "cn-marker group/marker relative flex w-full items-center";

const MARKER_VARIANTS: Record<MarkerVariant, string> = {
  default: "cn-marker-variant-default",
  separator: "cn-marker-variant-separator",
  border: "cn-marker-variant-border",
};

/** Upstream name kept: `markerVariants({ variant })` in shadcn; here a pure function, not cva. */
export const markerVariants = (
  options: {
    readonly variant?: MarkerVariant | undefined;
    readonly class?: string | undefined;
  } = {},
): string => cn(MARKER_BASE, MARKER_VARIANTS[options.variant ?? "default"], options.class);

export const Marker = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: {
    readonly variant?: MarkerVariant | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  h.div
    .attr("data-slot", "marker")
    .attr("data-variant", options.variant ?? "default")
    .class(markerVariants(options));

export const MarkerIcon = <Msg, R = never>(
  h: { readonly span: Span<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.span
    .attr("data-slot", "marker-icon")
    .attr("aria-hidden", "true")
    .class(cn(MARKER_ICON_CLASS, options.class));

export const MarkerContent = <Msg, R = never>(
  h: { readonly span: Span<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.span.attr("data-slot", "marker-content").class(cn(MARKER_CONTENT_CLASS, options.class));
