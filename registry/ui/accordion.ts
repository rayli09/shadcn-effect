/**
 * Accordion — shadcn/ui `accordion` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix Accordion (Root / Item / Header / Trigger / Content
 * as separate components). Here: the @effect/ui-kit `Accordion` and
 * `AccordionItem` headless Components, which take a `view` closure and hand
 * back parts (`root`, `header`, `trigger`, `panel`). The exported names are
 * upstream's: `Accordion`, `AccordionItem`, `AccordionTrigger`,
 * `AccordionContent`. `AccordionTrigger` / `AccordionContent` are part
 * appliers — call them inside the item's view, exactly where upstream
 * rendered the Radix parts:
 *
 *   Accordion(h, {
 *     props: { value: model.open },
 *     onEmit: { Toggled: ({ value }) => Msg.ToggledQuestions({ open: value }) },
 *     view: (accordion) =>
 *       accordion.root(h.div).children(
 *         AccordionItem(h, {
 *           key: entry.id,
 *           props: { value: entry.id, index },
 *           view: (item) =>
 *             item.root(h.div).children(
 *               item.header(h.h3).children(
 *                 AccordionTrigger(item, h.button).children(
 *                   entry.question,
 *                   AccordionChevron(h)
 *                 )
 *               ),
 *               AccordionContent(item, h.div)?.children(
 *                 h.div.class(ACCORDION_CONTENT_INNER_CLASS).children(entry.answer)
 *               )
 *             )
 *         })
 *       )
 *   })
 *
 * State is the consumer's, as in the kit: the open values live in the
 * consumer's Model, are passed as the `value` prop, and the `Toggled` event
 * reports the next value to store. No React state, no context.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings. Two
 * adaptations are added alongside them, because the kit writes different
 * state attributes than Radix (declared here, not silent):
 *
 * - Trigger: upstream rotates the chevron with `[&[data-state=open]>svg]`;
 *   the kit trigger has no `data-state`, it has `data-panel-open` while
 *   open, so `[&[data-panel-open]>svg]:rotate-180` is added next to the
 *   upstream token.
 * - Content: upstream animates with `data-[state=open]` / `data-[state=closed]`;
 *   the kit panel has `data-open` / `data-closed`, so `data-open:animate-…` /
 *   `data-closed:animate-…` are added next to the upstream tokens. The
 *   `animate-accordion-up/down` utilities themselves need the
 *   `--animate-accordion-*` keyframes in the theme (registry/styles/theme.css).
 *
 * The chevron is not lucide-react: `AccordionChevron` renders the shared
 * `../lib/icons.ts` chevron-down builder (lucide path data, ISC), with
 * the upstream icon class string verbatim. Append it after the label —
 * `.children()` adds after what the builder already holds, so the DOM order
 * matches upstream: label first, chevron last.
 */
import { type Component, type View } from "@effect/ui";
import type { Html } from "@effect/ui/html";
import {
  Accordion as KitAccordion,
  AccordionItem as KitAccordionItem,
  type AccordionEvents,
  type AccordionItemEvents,
  type AccordionItemProps,
  type AccordionProps,
} from "@effect/ui-kit";
import type { AsyncResult } from "effect/reactivity";
import { ChevronDownIcon } from "../lib/icons.ts";
import { cn } from "../lib/utils.ts";

export type { AccordionItemProps, AccordionProps };

type AccordionParts = Component.Headless.Parts<typeof KitAccordion>;
type AccordionItemParts = Component.Headless.Parts<typeof KitAccordionItem>;

/** The options a headless kit Component call takes, with its parts typed. */
type HeadlessOptions<Props, Events, Parts, Msg, RV, RF> = View.Child.Options<Props, Events, Msg> & {
  readonly fallback?:
    ((result: AsyncResult.Failure<never, unknown>) => View.Content<Msg, RF>) | undefined;
  readonly view: (parts: Parts) => View.Content<Msg, RV>;
};

export const ACCORDION_ITEM_CLASS = "border-b last:border-b-0";

export const ACCORDION_TRIGGER_CLASS =
  "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180";

/** Kit-state equivalent of the upstream `[&[data-state=open]>svg]` selector. */
export const ACCORDION_TRIGGER_OPEN_CLASS = "[&[data-panel-open]>svg]:rotate-180";

export const ACCORDION_CONTENT_CLASS =
  "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down";

/** Kit-state equivalents of the upstream `data-[state=…]` animation hooks. */
export const ACCORDION_CONTENT_STATE_CLASS =
  "data-closed:animate-accordion-up data-open:animate-accordion-down";

/** Upstream wraps the content's children in a div with this class. */
export const ACCORDION_CONTENT_INNER_CLASS = "pt-0 pb-4";

export const ACCORDION_CHEVRON_CLASS =
  "pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200";

/**
 * The accordion root. Same call shape as the kit's `Accordion`; the root
 * part additionally writes upstream's `data-slot="accordion"`. Upstream's
 * Root carries no class string.
 */
export const Accordion = <Msg, RV = never, RF = never>(
  h: View.HelperBase<Msg, unknown>,
  options: HeadlessOptions<AccordionProps, AccordionEvents, AccordionParts, Msg, RV, RF>,
) =>
  KitAccordion(h, {
    key: options.key,
    props: options.props,
    onEmit: options.onEmit,
    onFailure: options.onFailure,
    fallback: options.fallback,
    view: (accordion) =>
      options.view({
        ...accordion,
        root: (element) => accordion.root(element.attr("data-slot", "accordion")),
      }),
  });

/**
 * One accordion item. Same call shape as the kit's `AccordionItem`; the
 * root part additionally writes `data-slot="accordion-item"` and the
 * upstream item class, and the header part writes upstream's fixed
 * `flex` class (upstream's Header takes no consumer class). `class` in
 * options is the root's extra class, upstream's Item `className`.
 */
export const AccordionItem = <Msg, RV = never, RF = never>(
  h: View.HelperBase<Msg, unknown>,
  options: HeadlessOptions<
    AccordionItemProps,
    AccordionItemEvents,
    AccordionItemParts,
    Msg,
    RV,
    RF
  > & {
    readonly class?: string | undefined;
  },
) =>
  KitAccordionItem(h, {
    key: options.key,
    props: options.props,
    onEmit: options.onEmit,
    onFailure: options.onFailure,
    fallback: options.fallback,
    view: (item) =>
      options.view({
        ...item,
        root: (element) =>
          item.root(
            element
              .attr("data-slot", "accordion-item")
              .class(cn(ACCORDION_ITEM_CLASS, options.class)),
          ),
        header: (element) => item.header(element.attr("class", "flex")),
      }),
  });

/**
 * Applies the item's `trigger` part with upstream's `data-slot` and class
 * string. Chain `.children(label, AccordionChevron(h))` on the result.
 */
export const AccordionTrigger = (
  item: AccordionItemParts,
  element: Parameters<AccordionItemParts["trigger"]>[0],
  options: { readonly class?: string | undefined } = {},
) =>
  item.trigger(
    element
      .attr("data-slot", "accordion-trigger")
      .class(cn(ACCORDION_TRIGGER_CLASS, ACCORDION_TRIGGER_OPEN_CLASS, options.class)),
  );

/**
 * The trigger's chevron: lucide `chevron-down` from the shared
 * `../lib/icons.ts` builder (no lucide-react), with the upstream icon
 * class string verbatim. The shared builder also stamps
 * `aria-hidden="true"`, as lucide-react does; the file-local builder it
 * replaced did not.
 */
export const AccordionChevron = <Msg>(h: Html.H<Msg>) =>
  ChevronDownIcon(h, { class: ACCORDION_CHEVRON_CLASS });

/**
 * Applies the item's `panel` part with upstream's `data-slot` and class
 * string. Like the kit panel, the result is `undefined` once the panel has
 * closed (unless `keepMounted` / `hiddenUntilFound` is set), so consume it
 * with `?.children(...)`. Upstream puts the consumer's `className` on an
 * inner div, not the panel: render that div with
 * `ACCORDION_CONTENT_INNER_CLASS` (plus your class) inside.
 */
export const AccordionContent = (
  item: AccordionItemParts,
  element: Parameters<AccordionItemParts["panel"]>[0],
  options: { readonly class?: string | undefined } = {},
) =>
  item.panel(
    element
      .attr("data-slot", "accordion-content")
      .class(cn(ACCORDION_CONTENT_CLASS, ACCORDION_CONTENT_STATE_CLASS, options.class)),
  );
