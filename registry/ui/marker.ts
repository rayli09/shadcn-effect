/**
 * Marker — shadcn/ui `marker` ported 1:1 to Effect UI.
 *
 * Upstream: React + cva + Radix Slot over a <div> and two <span>s. Here:
 * pure view functions returning `h.div` / `h.span` builders — Marker keeps
 * no state, so none of them is a Component. Variants are a plain Record
 * keyed by a string union — no cva.
 *
 * Declared divergence (PORTING-RULES.md D-2): upstream `Marker` accepts
 * `asChild` (Radix Slot). There is no Slot in Effect UI, so `Marker` always
 * renders the <div>; compose by rendering the marker's classes on your own
 * element via `markerVariants(...)` if you need another tag.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings; the parity
 * checker (scripts/verify.mjs) fails if any upstream token disappears.
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";

type Div<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

type Span<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"span">, HTMLSpanElement, "span">;

export const MARKER_ICON_CLASS = "size-4 shrink-0 [&_svg:not([class*='size-'])]:size-4";

export const MARKER_CONTENT_CLASS =
  "min-w-0 wrap-break-word group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground";

export type MarkerVariant = "default" | "separator" | "border";

const MARKER_BASE =
  "group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-sm text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [a]:underline [a]:underline-offset-3 [a]:hover:text-foreground";

const MARKER_VARIANTS: Record<MarkerVariant, string> = {
  default: "",
  separator:
    "before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-border after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-border",
  border: "border-b border-border pb-2",
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
