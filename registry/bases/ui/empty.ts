/**
 * Empty (bases generation) — shadcn/ui `empty` ported 1:1 to Effect UI.
 *
 * Same Effect port as `registry/ui/empty.ts` (pure view functions over
 * `h.div` builders, variants as a plain Record — no cva); only the class
 * layer changes: class strings are byte-for-byte the shadcn bases/radix
 * strings — structural inline classes plus `cn-*` hook classes whose
 * utilities are supplied by the style presets. The parity checker asserts
 * every token in `parity/bases-tokens.json["empty"]`.
 *
 * Upstream quirks preserved verbatim:
 * - `EmptyMedia` renders `data-slot="empty-icon"` (not "empty-media").
 * - `EmptyDescription` is typed against <p> props upstream but renders a
 *   <div>; the port renders the <div>.
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";

type Div<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

export const EMPTY_CLASS =
  "cn-empty flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance";

export const EMPTY_HEADER_CLASS = "cn-empty-header flex max-w-sm flex-col items-center";

export const EMPTY_TITLE_CLASS = "cn-empty-title cn-font-heading";

export const EMPTY_DESCRIPTION_CLASS =
  "cn-empty-description text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary";

export const EMPTY_CONTENT_CLASS =
  "cn-empty-content flex w-full max-w-sm min-w-0 flex-col items-center text-balance";

export type EmptyMediaVariant = "default" | "icon";

const EMPTY_MEDIA_BASE =
  "cn-empty-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0";

const EMPTY_MEDIA_VARIANTS: Record<EmptyMediaVariant, string> = {
  default: "cn-empty-media-default",
  icon: "cn-empty-media-icon",
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
