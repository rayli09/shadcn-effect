/**
 * Tooltip — shadcn/ui `tooltip` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix Tooltip (Provider / Root / Trigger / Content with
 * an Arrow inside Content). Here: the @effect/ui-kit `Tooltip` and
 * `TooltipProvider` headless Components. The consumer owns `open` in its
 * Model and stores what the kit's `RequestedOpen` / `RequestedClose` events
 * ask for; there is no Radix-style component split, so this module exports:
 *
 * - `TooltipProvider` — the kit provider Component (groups tooltips so a
 *   second hover opens instantly). Its only prop is `timeout` (400 ms by
 *   default in the kit).
 * - `Tooltip` — the kit Component, with shadcn's `sideOffset: 0` default
 *   applied (kit defaults are side `"top"`, align `"center"`).
 * - `TooltipTrigger` / `TooltipContent` / `TooltipArrow` — styled part
 *   appliers: pass the builder a kit part returns, get it back with
 *   upstream's `data-slot` and class string applied, e.g.
 *   `TooltipContent(tooltip.popup(h.div)).children(TooltipArrow(tooltip.arrow(h.div)), "Bold")`.
 *
 * NOT reproduced: upstream Provider's `delayDuration = 0`. The kit provider
 * has no delay prop — delay is per-Tooltip (`delay`, 600 ms kit default).
 * To match shadcn's effective zero-delay group behavior, pass `delay: 0`
 * in each Tooltip's props. Also not reproduced: upstream's
 * `data-slot="tooltip-provider"` — the kit provider renders no element of
 * its own (its view is the consumer's markup), so there is nothing to stamp
 * it on. See the lane report.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings. Two
 * upstream mechanisms do not exist in the kit and are kept for parity but
 * inert (declared, not hidden): the kit popup carries `data-open` /
 * `data-closed` and `data-instant`, never `data-state`, so the
 * `data-[state=closed]:…` classes never match; and the kit sets
 * `--transform-origin` on the positioner, not
 * `--radix-tooltip-content-transform-origin`, so the `origin-(--radix-…)`
 * utility resolves to nothing. The kit's own `data-side` does match the
 * `data-[side=…]` slide-in classes.
 */
import {
  Tooltip as KitTooltip,
  TooltipProvider as KitTooltipProvider,
  type TooltipAlign,
  type TooltipEvents,
  type TooltipProps,
  type TooltipProviderProps,
  type TooltipSide,
} from "@effect/ui-kit";
import type * as Component from "@effect/ui/Component";
import type * as View from "@effect/ui/View";
import type * as Html from "@effect/ui/html/Html";
import type * as AsyncResult from "effect/reactivity/AsyncResult";
import { cn } from "@/lib/utils";

export type { TooltipAlign, TooltipSide };

/** The options a `Tooltip` call takes: the kit Component's call options, verbatim. */
export type TooltipOptions<Msg, RV = never, RF = never> = View.Child.Options<
  TooltipProps,
  TooltipEvents,
  NoInfer<Msg>
> & {
  readonly fallback?:
    ((result: AsyncResult.Failure<never, unknown>) => View.Content<NoInfer<Msg>, RF>) | undefined;
  readonly view: (
    parts: Component.Headless.Parts<typeof KitTooltip>,
  ) => View.Content<NoInfer<Msg>, RV>;
  readonly slots?: never;
};

/** The options a `TooltipProvider` call takes: the kit Component's call options, verbatim (it emits no events). */
export type TooltipProviderOptions<Msg, RV = never, RF = never> = View.Child.Options<
  TooltipProviderProps,
  never,
  NoInfer<Msg>
> & {
  readonly fallback?:
    ((result: AsyncResult.Failure<never, unknown>) => View.Content<NoInfer<Msg>, RF>) | undefined;
  readonly view: (
    parts: Component.Headless.Parts<typeof KitTooltipProvider>,
  ) => View.Content<NoInfer<Msg>, RV>;
  readonly slots?: never;
};

export const TOOLTIP_CONTENT_CLASS =
  "z-50 w-fit origin-(--radix-tooltip-content-transform-origin) animate-in rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95";

export const TOOLTIP_ARROW_CLASS =
  "z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground";

/**
 * The kit `TooltipProvider` Component. Wrap a group with nothing to add to
 * each tooltip: `TooltipProvider(h, { props: {}, view: () => h.div(...) })`.
 * Upstream's `delayDuration` prop has no kit equivalent (see header).
 */
export const TooltipProvider = <Msg, RV = never, RF = never>(
  h: View.HelperBase<Msg, unknown>,
  options: TooltipProviderOptions<Msg, RV, RF>,
) => KitTooltipProvider(h, options);

/**
 * The kit `Tooltip` Component with shadcn's default: `sideOffset: 0`
 * (caller props win). Call it exactly like the kit's:
 *
 *   Tooltip(h, {
 *     props: { open: model.tip },
 *     onEmit: { RequestedOpen: ..., RequestedClose: ... },
 *     view: (tooltip) => h.div(...)
 *   })
 */
export const Tooltip = <Msg, RV = never, RF = never>(
  h: View.HelperBase<Msg, unknown>,
  options: TooltipOptions<Msg, RV, RF>,
) =>
  KitTooltip(h, {
    ...options,
    props: { sideOffset: 0, ...options.props },
  });

/** Applies upstream's `data-slot="tooltip-trigger"` to a kit trigger part's builder. */
export const TooltipTrigger = <Msg, R, E, N, T extends string>(
  trigger: Html.Element<Msg, R, E, N, T>,
) => trigger.attr("data-slot", "tooltip-trigger");

/**
 * Applies upstream's `data-slot="tooltip-content"` and content class string
 * to a kit popup part's builder (the popup sits inside the kit positioner
 * part, which is the kit's top-layer element — there is no separate Portal).
 */
export const TooltipContent = <Msg, R, E, N, T extends string>(
  popup: Html.Element<Msg, R, E, N, T>,
  options: { readonly class?: string | undefined } = {},
) => popup.attr("data-slot", "tooltip-content").class(cn(TOOLTIP_CONTENT_CLASS, options.class));

/** Applies upstream's arrow class string to a kit arrow part's builder. Upstream's arrow carries no `data-slot`. */
export const TooltipArrow = <Msg, R, E, N, T extends string>(
  arrow: Html.Element<Msg, R, E, N, T>,
) => arrow.class(TOOLTIP_ARROW_CLASS);
