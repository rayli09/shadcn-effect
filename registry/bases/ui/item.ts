/**
 * Item (bases generation) — shadcn/ui `item` ported 1:1 to Effect UI.
 *
 * Same Effect port as `registry/ui/item.ts` (pure view functions over
 * `h.div` / `h.p` builders, variants as plain Records — no cva;
 * `ItemSeparator` reuses this generation's `Separator` port, the same reuse
 * upstream makes); only the class layer changes: class strings are
 * byte-for-byte the shadcn bases/radix strings — structural inline classes
 * plus `cn-*` hook classes whose utilities are supplied by the style
 * presets. The parity checker asserts every token in
 * `parity/bases-tokens.json["item"]`.
 *
 * Bases-generation anatomy diff vs new-york-v4: `itemVariants` gains a
 * third size, `xs` (upstream bases added it; new-york-v4 has only
 * default/sm).
 *
 * Declared divergence (PORTING-RULES.md D-2): upstream `Item` accepts
 * `asChild` (Radix Slot). There is no Slot in Effect UI, so `Item` always
 * renders the <div>; compose by rendering the item's classes on your own
 * element via `itemVariants(...)` if you need another tag.
 */
import type * as Html from "@effect/ui/html/Html";
import type { SeparatorElement } from "@effect/ui-kit";
import { cn } from "@/lib/utils";
import { Separator } from "./separator.ts";

type Div<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

export const ITEM_GROUP_CLASS = "cn-item-group group/item-group flex w-full flex-col";

export const ITEM_CONTENT_CLASS =
  "cn-item-content flex flex-1 flex-col [&+[data-slot=item-content]]:flex-none";

export const ITEM_TITLE_CLASS = "cn-item-title line-clamp-1 flex w-fit items-center";

export const ITEM_DESCRIPTION_CLASS =
  "cn-item-description line-clamp-2 font-normal [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary";

export const ITEM_ACTIONS_CLASS = "cn-item-actions flex items-center";

export const ITEM_HEADER_CLASS = "cn-item-header flex basis-full items-center justify-between";

export const ITEM_FOOTER_CLASS = "cn-item-footer flex basis-full items-center justify-between";

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

export type ItemVariant = "default" | "outline" | "muted";
export type ItemSize = "default" | "sm" | "xs";

const ITEM_BASE =
  "cn-item group/item flex w-full flex-wrap items-center transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors";

const ITEM_VARIANTS: Record<ItemVariant, string> = {
  default: "cn-item-variant-default",
  outline: "cn-item-variant-outline",
  muted: "cn-item-variant-muted",
};

const ITEM_SIZES: Record<ItemSize, string> = {
  default: "cn-item-size-default",
  sm: "cn-item-size-sm",
  xs: "cn-item-size-xs",
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
  "cn-item-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none";

const ITEM_MEDIA_VARIANTS: Record<ItemMediaVariant, string> = {
  default: "cn-item-media-variant-default",
  icon: "cn-item-media-variant-icon",
  image: "cn-item-media-variant-image",
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
 * horizontal, class `cn-item-separator` — the port chains the data-slot
 * over this generation's `Separator` (same pattern as ButtonGroupSeparator).
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
    class: cn("cn-item-separator", options.class),
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
