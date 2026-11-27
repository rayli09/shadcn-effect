/**
 * Accordion (bases generation) — shadcn/ui `accordion` ported 1:1 to
 * Effect UI, with the class layer of upstream's bases/radix generation
 * instead of new-york-v4's.
 *
 * Same port as registry/ui/accordion.ts — the @effect/ui-kit `Accordion`
 * and `AccordionItem` headless Components, which take a `view` closure
 * and hand back parts (`root`, `header`, `trigger`, `panel`). The
 * exported names are upstream's: `Accordion`, `AccordionItem`,
 * `AccordionTrigger`, `AccordionContent`; the latter two are part
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
 *                   AccordionChevron(h),
 *                   AccordionChevronUp(h)
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
 * consumer's Model, are passed as the `value` prop, and the `Toggled`
 * event reports the next value to store. No React state, no context.
 *
 * Class strings are byte-for-byte the shadcn bases/radix strings:
 * structural utilities stay inline, everything visual (item borders,
 * trigger padding/typography, content animation, icon sizing) moves to
 * the `cn-accordion*` hooks, which the style presets
 * (registry/styles/style-*.css) fill in.
 *
 * Anatomy diffs vs the new-york port, declared:
 *
 * - **Two trigger icons, swapped by state.** Upstream bases renders a
 *   chevron-down AND a chevron-up, both stamped
 *   `data-slot="accordion-trigger-icon"`, and swaps them with
 *   `group-aria-expanded/accordion-trigger:*` variants keyed on the
 *   trigger's `aria-expanded` (the kit trigger writes it, as Radix does).
 *   The new-york port's single rotating chevron is gone: append
 *   `AccordionChevron(h)` and `AccordionChevronUp(h)` after the label.
 * - **No kit-state class additions.** The new-york port appended
 *   `[&[data-panel-open]>svg]:rotate-180` and
 *   `data-open:animate-accordion-*` next to the upstream tokens; the
 *   bases hooks carry the state styling themselves (the presets' `.cn-accordion-content`
 *   rule applies `data-open:animate-accordion-down` etc.), so the class
 *   layer here is upstream's alone.
 * - **Root class.** The bases root carries `cn-accordion flex w-full
 *   flex-col` where new-york's carried none; `class` in options is the
 *   root's extra class, upstream's Root `className`.
 *
 * The chevrons are not lucide-react: they render the shared
 * `@/lib/icons` chevron builders (lucide path data, ISC), with the
 * upstream icon class strings verbatim and the upstream
 * `data-slot="accordion-trigger-icon"` stamped on each.
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
import { ChevronDownIcon, ChevronUpIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type { AccordionItemProps, AccordionProps };

type AccordionParts = Component.Headless.Parts<typeof KitAccordion>;
type AccordionItemParts = Component.Headless.Parts<typeof KitAccordionItem>;

/** The options a headless kit Component call takes, with its parts typed. */
type HeadlessOptions<Props, Events, Parts, Msg, RV, RF> = View.Child.Options<Props, Events, Msg> & {
  readonly fallback?:
    ((result: AsyncResult.Failure<never, unknown>) => View.Content<Msg, RF>) | undefined;
  readonly view: (parts: Parts) => View.Content<Msg, RV>;
};

export const ACCORDION_CLASS = "cn-accordion flex w-full flex-col";

export const ACCORDION_ITEM_CLASS = "cn-accordion-item";

export const ACCORDION_TRIGGER_CLASS =
  "cn-accordion-trigger group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent transition-all outline-none disabled:pointer-events-none disabled:opacity-50";

export const ACCORDION_CONTENT_CLASS = "cn-accordion-content overflow-hidden";

/** Upstream wraps the content's children in a div with this class. */
export const ACCORDION_CONTENT_INNER_CLASS =
  "cn-accordion-content-inner h-(--radix-accordion-content-height) [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4";

export const ACCORDION_CHEVRON_CLASS =
  "cn-accordion-trigger-icon pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden";

export const ACCORDION_CHEVRON_UP_CLASS =
  "cn-accordion-trigger-icon pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline";

/**
 * The accordion root. Same call shape as the kit's `Accordion`; the root
 * part additionally writes upstream's `data-slot="accordion"` and the
 * bases root class. `class` in options is the root's extra class,
 * upstream's Root `className`.
 */
export const Accordion = <Msg, RV = never, RF = never>(
  h: View.HelperBase<Msg, unknown>,
  options: HeadlessOptions<AccordionProps, AccordionEvents, AccordionParts, Msg, RV, RF> & {
    readonly class?: string | undefined;
  },
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
        root: (element) =>
          accordion.root(
            element.attr("data-slot", "accordion").class(cn(ACCORDION_CLASS, options.class)),
          ),
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
 * string. Chain `.children(label, AccordionChevron(h), AccordionChevronUp(h))`
 * on the result — upstream renders both chevrons after the label and the
 * `group-aria-expanded` variants swap them.
 */
export const AccordionTrigger = (
  item: AccordionItemParts,
  element: Parameters<AccordionItemParts["trigger"]>[0],
  options: { readonly class?: string | undefined } = {},
) =>
  item.trigger(
    element
      .attr("data-slot", "accordion-trigger")
      .class(cn(ACCORDION_TRIGGER_CLASS, options.class)),
  );

/**
 * The trigger's chevron-down: lucide `chevron-down` from the shared
 * `@/lib/icons` builder (no lucide-react), with the upstream icon class
 * string verbatim and upstream's `data-slot="accordion-trigger-icon"`.
 * Visible while the item is closed; `AccordionChevronUp` takes over when
 * it opens. The shared builder also stamps `aria-hidden="true"`, as
 * lucide-react does.
 */
export const AccordionChevron = <Msg>(h: Html.H<Msg>) =>
  ChevronDownIcon(h, { class: ACCORDION_CHEVRON_CLASS }).attr(
    "data-slot",
    "accordion-trigger-icon",
  );

/**
 * The trigger's chevron-up: lucide `chevron-up` from the shared
 * `@/lib/icons` builder, hidden until the item opens (upstream's second
 * trigger icon, same `data-slot`).
 */
export const AccordionChevronUp = <Msg>(h: Html.H<Msg>) =>
  ChevronUpIcon(h, { class: ACCORDION_CHEVRON_UP_CLASS }).attr(
    "data-slot",
    "accordion-trigger-icon",
  );

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
      .class(cn(ACCORDION_CONTENT_CLASS, options.class)),
  );
