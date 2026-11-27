/**
 * Popover — shadcn/ui `popover` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix Popover (Root / Trigger / Content / Anchor /
 * Header / Title / Description). Here: the @effect/ui-kit `Popover` headless
 * Component — a non-modal Dialog placed by Positioning. The consumer owns
 * `open` in its Model and stores what the kit's `RequestedOpen` /
 * `RequestedClose` events ask for; there is no Radix-style Root/Trigger
 * component split, so this module exports:
 *
 * - `Popover` — the kit Component, with shadcn's defaults applied
 *   (`align: "center"`, `sideOffset: 4`; kit defaults are side `"bottom"`,
 *   align `"center"`).
 * - `PopoverTrigger` / `PopoverContent` — styled part appliers: pass the
 *   builder a kit part returns, get it back with upstream's `data-slot`
 *   and class string applied, e.g.
 *   `PopoverContent(popover.popup(h.div)).children(...)` and
 *   `PopoverTrigger(popover.trigger({ element: h.button })).children("Open")`.
 * - `PopoverHeader` / `PopoverTitle` / `PopoverDescription` — pure view
 *   functions (upstream renders plain div / div / p markup for these).
 *
 * NOT reproduced: `PopoverAnchor`. The kit has no anchor part — placement
 * against another element is the `anchor` prop on `PopoverProps` (an element
 * id or a Rect), not a rendered child. See the lane report.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings. Two
 * upstream mechanisms do not exist in the kit and are kept for parity but
 * inert (declared, not hidden): the kit popup carries `data-open` /
 * `data-closed` (plus `data-starting-style` / `data-ending-style`), never
 * `data-state`, so the `data-[state=…]` animation classes never match; and
 * the kit sets `--transform-origin` on the positioner, not
 * `--radix-popover-content-transform-origin`, so the `origin-(--radix-…)`
 * utility resolves to nothing. The kit's own `data-side` does match the
 * `data-[side=…]` slide-in classes.
 */
import {
  Popover as KitPopover,
  type PopoverAlign,
  type PopoverEvents,
  type PopoverProps,
  type PopoverSide,
} from "@effect/ui-kit";
import type * as Component from "@effect/ui/Component";
import type * as View from "@effect/ui/View";
import type * as Html from "@effect/ui/html/Html";
import type * as AsyncResult from "effect/reactivity/AsyncResult";
import { cn } from "@/lib/utils";

export type { PopoverAlign, PopoverSide };

/** The options a `Popover` call takes: the kit Component's call options, verbatim. */
export type PopoverOptions<Msg, RV = never, RF = never> = View.Child.Options<
  PopoverProps,
  PopoverEvents,
  NoInfer<Msg>
> & {
  readonly fallback?:
    ((result: AsyncResult.Failure<never, unknown>) => View.Content<NoInfer<Msg>, RF>) | undefined;
  readonly view: (
    parts: Component.Headless.Parts<typeof KitPopover>,
  ) => View.Content<NoInfer<Msg>, RV>;
  readonly slots?: never;
};

export const POPOVER_CONTENT_CLASS =
  "z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95";

export const POPOVER_HEADER_CLASS = "flex flex-col gap-1 text-sm";

export const POPOVER_TITLE_CLASS = "font-medium";

export const POPOVER_DESCRIPTION_CLASS = "text-muted-foreground";

/**
 * The kit `Popover` Component with shadcn's defaults: `align: "center"` and
 * `sideOffset: 4` (caller props win). Call it exactly like the kit's:
 *
 *   Popover(h, {
 *     props: { open: model.open },
 *     onEmit: { RequestedOpen: ..., RequestedClose: ..., Settled: ... },
 *     view: (popover) => h.div(...)
 *   })
 */
export const Popover = <Msg, RV = never, RF = never>(
  h: View.HelperBase<Msg, unknown>,
  options: PopoverOptions<Msg, RV, RF>,
) =>
  KitPopover(h, {
    ...options,
    props: { align: "center", sideOffset: 4, ...options.props },
  });

/** Applies upstream's `data-slot="popover-trigger"` to a kit trigger part's builder. */
export const PopoverTrigger = <Msg, R, E, N, T extends string>(
  trigger: Html.Element<Msg, R, E, N, T>,
) => trigger.attr("data-slot", "popover-trigger");

/**
 * Applies upstream's `data-slot="popover-content"` and content class string
 * to a kit popup part's builder:
 * `PopoverContent(popover.popup(h.div), { class: "..." }).children(...)`.
 */
export const PopoverContent = <Msg, R, E, N, T extends string>(
  popup: Html.Element<Msg, R, E, N, T>,
  options: { readonly class?: string | undefined } = {},
) => popup.attr("data-slot", "popover-content").class(cn(POPOVER_CONTENT_CLASS, options.class));

export const PopoverHeader = <Msg, R = never>(
  h: {
    readonly div: Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;
  },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "popover-header").class(cn(POPOVER_HEADER_CLASS, options.class));

/** Upstream types this as an h2 but renders a plain <div>; the rendered output is what is ported. */
export const PopoverTitle = <Msg, R = never>(
  h: {
    readonly div: Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;
  },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "popover-title").class(cn(POPOVER_TITLE_CLASS, options.class));

export const PopoverDescription = <Msg, R = never>(
  h: {
    readonly p: Html.Element<Msg, R, Html.EventsOf<"p">, HTMLParagraphElement, "p">;
  },
  options: { readonly class?: string | undefined } = {},
) =>
  h.p.attr("data-slot", "popover-description").class(cn(POPOVER_DESCRIPTION_CLASS, options.class));
