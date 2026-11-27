/**
 * Empty — shadcn/ui `empty` ported 1:1 to Effect UI.
 *
 * Upstream: React + cva, no primitive — every part is a plain <div>. Here:
 * pure view functions returning `h.div` builders — Empty keeps no state, so
 * none of them is a Component. Variants are a plain Record keyed by a string
 * union — no cva.
 *
 * Upstream quirks preserved verbatim:
 * - `EmptyMedia` renders `data-slot="empty-icon"` (not "empty-media").
 * - `EmptyDescription` is typed against <p> props upstream but renders a
 *   <div>; the port renders the <div>.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings; the parity
 * checker (scripts/verify.mjs) fails if any upstream token disappears.
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";

type Div<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

export const EMPTY_CLASS =
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12";

export const EMPTY_HEADER_CLASS = "flex max-w-sm flex-col items-center gap-2 text-center";

export const EMPTY_TITLE_CLASS = "text-lg font-medium tracking-tight";

export const EMPTY_DESCRIPTION_CLASS =
  "text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary";

export const EMPTY_CONTENT_CLASS =
  "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance";

export type EmptyMediaVariant = "default" | "icon";

const EMPTY_MEDIA_BASE =
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0";

const EMPTY_MEDIA_VARIANTS: Record<EmptyMediaVariant, string> = {
  default: "bg-transparent",
  icon: "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-6",
};

/** Upstream name kept: `emptyMediaVariants({ variant })` in shadcn; here a pure function, not cva. */
export const emptyMediaVariants = (
  options: {
    readonly variant?: EmptyMediaVariant | undefined;
    readonly class?: string | undefined;
  } = {},
): string =>
  cn(EMPTY_MEDIA_BASE, EMPTY_MEDIA_VARIANTS[options.variant ?? "default"], options.class);

export const Empty = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "empty").class(cn(EMPTY_CLASS, options.class));

export const EmptyHeader = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "empty-header").class(cn(EMPTY_HEADER_CLASS, options.class));

export const EmptyMedia = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: {
    readonly variant?: EmptyMediaVariant | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  h.div
    .attr("data-slot", "empty-icon")
    .attr("data-variant", options.variant ?? "default")
    .class(emptyMediaVariants(options));

export const EmptyTitle = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "empty-title").class(cn(EMPTY_TITLE_CLASS, options.class));

export const EmptyDescription = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "empty-description").class(cn(EMPTY_DESCRIPTION_CLASS, options.class));

export const EmptyContent = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "empty-content").class(cn(EMPTY_CONTENT_CLASS, options.class));
