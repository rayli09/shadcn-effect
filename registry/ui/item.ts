/**
 * Item — shadcn/ui `item` ported 1:1 to Effect UI.
 *
 * Upstream: React + cva + Radix Slot over plain <div>s (and one <p>). Here:
 * pure view functions returning `h.div` / `h.p` builders — Item keeps no
 * state, so none of them is a Component. Variants are plain Records keyed by
 * string unions — no cva. `ItemSeparator` reuses this repo's `Separator`
 * port, the same reuse upstream makes of shadcn's Separator.
 *
 * Declared divergence (PORTING-RULES.md D-2): upstream `Item` accepts
 * `asChild` (Radix Slot). There is no Slot in Effect UI, so `Item` always
 * renders the <div>; compose by rendering the item's classes on your own
 * element via `itemVariants(...)` if you need another tag.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings; the parity
 * checker (scripts/verify.mjs) fails if any upstream token disappears.
 */
import type * as Html from "@effect/ui/html/Html";
import type { SeparatorElement } from "@effect/ui-kit";
import { cn } from "../lib/utils.ts";
import { Separator } from "./separator.ts";

type Div<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

export const ITEM_GROUP_CLASS = "group/item-group flex flex-col";

export const ITEM_CONTENT_CLASS =
  "flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none";

export const ITEM_TITLE_CLASS = "flex w-fit items-center gap-2 text-sm leading-snug font-medium";

export const ITEM_DESCRIPTION_CLASS =
  "line-clamp-2 text-sm leading-normal font-normal text-balance text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary";

export const ITEM_ACTIONS_CLASS = "flex items-center gap-2";

export const ITEM_HEADER_CLASS = "flex basis-full items-center justify-between gap-2";

export const ITEM_FOOTER_CLASS = "flex basis-full items-center justify-between gap-2";

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

export type ItemVariant = "default" | "outline" | "muted";
export type ItemSize = "default" | "sm";

const ITEM_BASE =
  "group/item flex flex-wrap items-center rounded-md border border-transparent text-sm transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors [a]:hover:bg-accent/50";

const ITEM_VARIANTS: Record<ItemVariant, string> = {
  default: "bg-transparent",
  outline: "border-border",
  muted: "bg-muted/50",
};

const ITEM_SIZES: Record<ItemSize, string> = {
  default: "gap-4 p-4",
  sm: "gap-2.5 px-4 py-3",
};

/** Upstream name kept: `itemVariants({ variant, size })` in shadcn; here a pure function, not cva. */
export const itemVariants = (
  options: {
    readonly variant?: ItemVariant | undefined;
    readonly size?: ItemSize | undefined;
    readonly class?: string | undefined;
  } = {},
): string =>
  cn(
    ITEM_BASE,
    ITEM_VARIANTS[options.variant ?? "default"],
    ITEM_SIZES[options.size ?? "default"],
    options.class,
  );

export const Item = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: {
    readonly variant?: ItemVariant | undefined;
    readonly size?: ItemSize | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  h.div
    .attr("data-slot", "item")
    .attr("data-variant", options.variant ?? "default")
    .attr("data-size", options.size ?? "default")
    .class(itemVariants(options));

// ---------------------------------------------------------------------------
// ItemMedia
// ---------------------------------------------------------------------------

export type ItemMediaVariant = "default" | "icon" | "image";

const ITEM_MEDIA_BASE =
  "flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none";

const ITEM_MEDIA_VARIANTS: Record<ItemMediaVariant, string> = {
  default: "bg-transparent",
  icon: "size-8 rounded-sm border bg-muted [&_svg:not([class*='size-'])]:size-4",
  image: "size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover",
};

/** Upstream name kept: `itemMediaVariants({ variant })` in shadcn; here a pure function, not cva. */
export const itemMediaVariants = (
  options: {
    readonly variant?: ItemMediaVariant | undefined;
    readonly class?: string | undefined;
  } = {},
): string => cn(ITEM_MEDIA_BASE, ITEM_MEDIA_VARIANTS[options.variant ?? "default"], options.class);

export const ItemMedia = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: {
    readonly variant?: ItemMediaVariant | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  h.div
    .attr("data-slot", "item-media")
    .attr("data-variant", options.variant ?? "default")
    .class(itemMediaVariants(options));

// ---------------------------------------------------------------------------
// Remaining parts
// ---------------------------------------------------------------------------

export const ItemGroup = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.div
    .attr("role", "list")
    .attr("data-slot", "item-group")
    .class(cn(ITEM_GROUP_CLASS, options.class));

/**
 * Upstream renders shadcn's Separator with `data-slot="item-separator"`,
 * horizontal, class `my-0` — the port chains the data-slot over this repo's
 * `Separator` (same pattern as ButtonGroupSeparator).
 */
export const ItemSeparator = <Msg, R = never>(
  h: { readonly div: SeparatorElement<Msg> },
  options: {
    readonly element?: SeparatorElement<Msg, R> | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  Separator(h, {
    element: options.element,
    orientation: "horizontal",
    class: cn("my-0", options.class),
  }).attr("data-slot", "item-separator");

export const ItemContent = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "item-content").class(cn(ITEM_CONTENT_CLASS, options.class));

export const ItemTitle = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "item-title").class(cn(ITEM_TITLE_CLASS, options.class));

export const ItemDescription = <Msg, R = never>(
  h: {
    readonly p: Html.Element<Msg, R, Html.EventsOf<"p">, HTMLParagraphElement, "p">;
  },
  options: { readonly class?: string | undefined } = {},
) => h.p.attr("data-slot", "item-description").class(cn(ITEM_DESCRIPTION_CLASS, options.class));

export const ItemActions = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "item-actions").class(cn(ITEM_ACTIONS_CLASS, options.class));

export const ItemHeader = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "item-header").class(cn(ITEM_HEADER_CLASS, options.class));

export const ItemFooter = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "item-footer").class(cn(ITEM_FOOTER_CLASS, options.class));
