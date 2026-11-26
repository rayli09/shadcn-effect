/**
 * HoverCard — shadcn/ui `hover-card` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix HoverCard (Root / Trigger / Content, with a
 * Portal carrying `data-slot="hover-card-portal"`). Here: the
 * @effect/ui-kit `PreviewCard` headless Component (MAPPING.md: hover-card →
 * PreviewCard). The consumer owns `open` in its Model and stores what the
 * kit's `RequestedOpen` / `RequestedClose` events ask for; the trigger is an
 * `<a>` the card previews, and focus never moves into the popup. This module
 * exports:
 *
 * - `HoverCard` — the kit `PreviewCard` Component, with shadcn's defaults
 *   applied (`align: "center"`, `sideOffset: 4`; kit defaults are side
 *   `"bottom"`, align `"center"`).
 * - `HoverCardTrigger` / `HoverCardPortal` / `HoverCardContent` — styled
 *   part appliers: pass the builder a kit part returns, get it back with
 *   upstream's `data-slot` (and, for content, the class string) applied, e.g.
 *   `HoverCardContent(previewCard.popup(h.div)).children(...)` and
 *   `HoverCardPortal(previewCard.portal(h.div))?.children(...)`.
 *
 * Timing divergence (declared, not hidden): Radix HoverCard defaults are
 * openDelay 700 ms / closeDelay 300 ms (shadcn does not override them); the
 * kit PreviewCard's delays are per-trigger options on the `trigger` part
 * (600 ms / 300 ms kit defaults), not Component props, so this wrapper
 * cannot set the 700 ms open delay — pass `{ delay: 700 }` to the trigger
 * part if exact upstream timing matters.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings. Two
 * upstream mechanisms do not exist in the kit and are kept for parity but
 * inert (declared, not hidden): the kit popup carries `data-open` /
 * `data-closed` (plus `data-starting-style` / `data-ending-style`), never
 * `data-state`, so the `data-[state=…]` animation classes never match; and
 * the kit sets `--transform-origin` on the positioner, not
 * `--radix-hover-card-content-transform-origin`, so the `origin-(--radix-…)`
 * utility resolves to nothing. The kit's own `data-side` does match the
 * `data-[side=…]` slide-in classes.
 */
import {
  PreviewCard as KitPreviewCard,
  type PreviewCardAlign,
  type PreviewCardEvents,
  type PreviewCardProps,
  type PreviewCardSide,
} from "@effect/ui-kit";
import type * as Component from "@effect/ui/Component";
import type * as View from "@effect/ui/View";
import type * as Html from "@effect/ui/html/Html";
import type * as AsyncResult from "effect/reactivity/AsyncResult";
import { cn } from "../lib/utils.ts";

/** The options a `HoverCard` call takes: the kit `PreviewCard` Component's call options, verbatim. */
export type HoverCardOptions<Msg, RV = never, RF = never> = View.Child.Options<
  PreviewCardProps,
  PreviewCardEvents,
  NoInfer<Msg>
> & {
  readonly fallback?:
    ((result: AsyncResult.Failure<never, unknown>) => View.Content<NoInfer<Msg>, RF>) | undefined;
  readonly view: (
    parts: Component.Headless.Parts<typeof KitPreviewCard>,
  ) => View.Content<NoInfer<Msg>, RV>;
  readonly slots?: never;
};

export type { PreviewCardAlign as HoverCardAlign, PreviewCardSide as HoverCardSide };

export const HOVER_CARD_CONTENT_CLASS =
  "z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95";

/**
 * The kit `PreviewCard` Component with shadcn's defaults: `align: "center"`
 * and `sideOffset: 4` (caller props win). Call it exactly like the kit's:
 *
 *   HoverCard(h, {
 *     props: { open: model.preview },
 *     onEmit: { RequestedOpen: ..., RequestedClose: ..., Settled: ... },
 *     view: (previewCard) => h.div(...)
 *   })
 */
export const HoverCard = <Msg, RV = never, RF = never>(
  h: View.HelperBase<Msg, unknown>,
  options: HoverCardOptions<Msg, RV, RF>,
) =>
  KitPreviewCard(h, {
    ...options,
    props: { align: "center", sideOffset: 4, ...options.props },
  });

/** Applies upstream's `data-slot="hover-card-trigger"` to a kit trigger part's builder. */
export const HoverCardTrigger = <Msg, R, E, N, T extends string>(
  trigger: Html.Element<Msg, R, E, N, T>,
) => trigger.attr("data-slot", "hover-card-trigger");

/**
 * Applies upstream's `data-slot="hover-card-portal"` to a kit portal part's
 * result. The kit portal returns `undefined` while the card is closed
 * (unless `keepMounted`), and so does this applier.
 */
export const HoverCardPortal = <Msg, R, E, N, T extends string>(
  portal: Html.Element<Msg, R, E, N, T> | undefined,
) => portal?.attr("data-slot", "hover-card-portal");

/**
 * Applies upstream's `data-slot="hover-card-content"` and content class
 * string to a kit popup part's builder:
 * `HoverCardContent(previewCard.popup(h.div), { class: "..." }).children(...)`.
 */
export const HoverCardContent = <Msg, R, E, N, T extends string>(
  popup: Html.Element<Msg, R, E, N, T>,
  options: { readonly class?: string | undefined } = {},
) =>
  popup.attr("data-slot", "hover-card-content").class(cn(HOVER_CARD_CONTENT_CLASS, options.class));
