/**
 * Select — shadcn/ui `select`, bases generation, ported 1:1 to Effect UI.
 *
 * Generation: `bases/radix` (the `cn-*` hook generation). Upstream: React
 * + Radix Select. Here: the @effect/ui-kit `Select` headless Component
 * (an Elm-Architecture part owner: keyboard, typeahead, focus,
 * placement, form inputs and data attributes are the kit's job). The
 * consumer still owns `open` and `value` in their Model and stores what
 * the kit's `RequestedOpen` / `RequestedClose` / `Picked` events ask
 * for — this wrapper only draws the shadcn anatomy around the kit parts:
 *
 *   trigger (value + chevron icon) · positioner > popup (data-slot=
 *   "select-content") > scroll-up · list > groups / items (itemText +
 *   itemIndicator with a check) · scroll-down
 *
 * Class strings are byte-for-byte the bases/radix strings: structural
 * utilities inline, visual styling in the presets under the `cn-select*`
 * / `cn-menu-*` hooks.
 *
 * Declared divergences (in-file, on top of docs/PORTING-RULES.md):
 * - Upstream's sub-components (SelectTrigger, SelectContent, SelectItem, …)
 *   collapse into this one component + the exported `SELECT_*_CLASS`
 *   constants: Effect UI parts are not composable across files the way
 *   Radix parts are, they are drawn inside the kit component's `view`.
 * - The wrapper renders a root <div data-slot="select">: a kit `view` must
 *   return one node, while Radix Root renders no DOM.
 * - `position: "popper"` maps to the kit's `alignItemWithTrigger: false`
 *   (unless the consumer set it in props); the `--radix-select-*` CSS
 *   variables in the upstream strings stay verbatim but are inert — the
 *   kit sets `--anchor-width` / `--available-height` etc. on the
 *   positioner. The `data-align-trigger` (on the popup) and
 *   `data-position` (on the list/viewport) attributes upstream writes
 *   ARE written here, so the `data-[align-trigger=true]` and
 *   `data-[position=popper]` variants in the strings stay live.
 * - The positioner carries a small reset class (border-0 bg-transparent
 *   p-0): the kit renders it as a manual popover, and the browser's
 *   default popover border/padding/background must be reset, per the
 *   kit docs.
 * - The single new-york `SELECT_SCROLL_BUTTON_CLASS` splits into
 *   `SELECT_SCROLL_UP_BUTTON_CLASS` / `SELECT_SCROLL_DOWN_BUTTON_CLASS`:
 *   the bases generation gives each button its own hook class.
 * - Icons are the shared builders in @/lib/icons (lucide path data,
 *   ISC), not lucide-react: Check, ChevronDown, ChevronUp. Upstream's
 *   scroll-button icons carry no class of their own; neither do these.
 */
import {
  Select as KitSelect,
  type SelectEvents,
  type SelectItem as KitSelectItem,
  type SelectProps as KitSelectProps,
} from "@effect/ui-kit";
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Class strings — verbatim from shadcn bases/radix select.tsx
// ---------------------------------------------------------------------------

export const SELECT_TRIGGER_CLASS =
  "cn-select-trigger flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0";

export const SELECT_TRIGGER_ICON_CLASS = "cn-select-trigger-icon pointer-events-none";

export const SELECT_CONTENT_CLASS =
  "cn-select-content cn-menu-target cn-menu-translucent relative z-50 max-h-(--radix-select-content-available-height) origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto data-[align-trigger=true]:animate-none";

export const SELECT_CONTENT_POPPER_CLASS =
  "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1";

export const SELECT_VIEWPORT_CLASS = "cn-select-viewport";

export const SELECT_VIEWPORT_POPPER_CLASS =
  "data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)";

export const SELECT_GROUP_CLASS = "cn-select-group";

export const SELECT_LABEL_CLASS = "cn-select-label";

export const SELECT_ITEM_CLASS =
  "cn-select-item relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

export const SELECT_ITEM_INDICATOR_CLASS = "cn-select-item-indicator";

export const SELECT_ITEM_INDICATOR_ICON_CLASS = "cn-select-item-indicator-icon pointer-events-none";

export const SELECT_SEPARATOR_CLASS = "cn-select-separator pointer-events-none";

export const SELECT_SCROLL_UP_BUTTON_CLASS = "cn-select-scroll-up-button";

export const SELECT_SCROLL_DOWN_BUTTON_CLASS = "cn-select-scroll-down-button";

/** Reset for the kit's manual-popover positioner (see header). */
const POSITIONER_CLASS = "border-0 bg-transparent p-0";

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------

export type SelectSize = "sm" | "default";

/** A kit Select item, plus an optional group key used only for drawing. */
export type SelectItem = KitSelectItem & {
  readonly group?: string | undefined;
};

export type SelectProps = KitSelectProps;
export type { SelectEvents };

export const Select = <Msg, R = never>(
  h: Html.H<Msg>,
  options: {
    readonly props: KitSelectProps & {
      readonly items: ReadonlyArray<SelectItem>;
    };
    readonly onEmit: View.Child.Options<KitSelectProps, SelectEvents, Msg>["onEmit"];
    readonly size?: SelectSize | undefined;
    /** Upstream SelectContent `position`, default "item-aligned". */
    readonly position?: "item-aligned" | "popper" | undefined;
    /** Group key → label, drawn with the select-label part styling. */
    readonly groupLabels?: Readonly<Record<string, string>> | undefined;
    readonly class?: string | undefined;
    readonly triggerClass?: string | undefined;
    readonly contentClass?: string | undefined;
  },
) => {
  const size = options.size ?? "default";
  const position = options.position ?? "item-aligned";
  const items = options.props.items;
  const kitProps: KitSelectProps = {
    ...options.props,
    items: items.map(({ value, label, disabled }) => ({
      value,
      label,
      disabled,
    })),
    alignItemWithTrigger:
      options.props.alignItemWithTrigger ?? (position === "popper" ? false : undefined),
  };

  return KitSelect(h, {
    props: kitProps,
    onEmit: options.onEmit,
    view: (select) => {
      // Draw the items in order, wrapping runs of one `group` in the kit's
      // group part, with a separator between groups (upstream
      // SelectSeparator).
      const drawItem = (entry: SelectItem) =>
        select
          .item({ element: h.div, value: entry.value })
          .attr("data-slot", "select-item")
          .class(SELECT_ITEM_CLASS)
          .children(
            h.span
              .attr("data-slot", "select-item-indicator")
              .class(SELECT_ITEM_INDICATOR_CLASS)
              .children(
                select
                  .itemIndicator({
                    element: h.span,
                    value: entry.value,
                  })
                  ?.children(CheckIcon(h, { class: SELECT_ITEM_INDICATOR_ICON_CLASS })),
              ),
            select.itemText(h.div).children(entry.label),
          );
      const drawn: Array<View.Input<Msg, any>> = [];
      let i = 0;
      while (i < items.length) {
        const group = items[i]!.group;
        const run: Array<SelectItem> = [];
        while (i < items.length && items[i]!.group === group) {
          run.push(items[i]!);
          i++;
        }
        if (group === undefined) {
          drawn.push(...run.map(drawItem));
        } else {
          if (drawn.length > 0) {
            drawn.push(
              select
                .separator(h.div)
                .attr("data-slot", "select-separator")
                .class(SELECT_SEPARATOR_CLASS),
            );
          }
          drawn.push(
            select
              .group({ element: h.div, group })
              .attr("data-slot", "select-group")
              .class(SELECT_GROUP_CLASS)
              .children(
                select
                  .groupLabel({ element: h.div, group })
                  .attr("data-slot", "select-label")
                  .class(SELECT_LABEL_CLASS)
                  .children(options.groupLabels?.[group] ?? group),
                ...run.map(drawItem),
              ),
          );
        }
      }
      return h.div
        .attr("data-slot", "select")
        .class(cn(options.class))
        .children(
          select
            .trigger(h.button)
            .attr("data-slot", "select-trigger")
            .attr("data-size", size)
            .class(cn(SELECT_TRIGGER_CLASS, options.triggerClass))
            .children(
              select.value(h.span).attr("data-slot", "select-value"),
              select
                .icon(h.span)
                .children(ChevronDownIcon(h, { class: SELECT_TRIGGER_ICON_CLASS })),
            ),
          select
            .positioner(h.div)
            .class(POSITIONER_CLASS)
            .children(
              select
                .popup(h.div)
                .attr("data-slot", "select-content")
                .attr("data-align-trigger", String(position === "item-aligned"))
                .class(
                  cn(
                    SELECT_CONTENT_CLASS,
                    position === "popper" && SELECT_CONTENT_POPPER_CLASS,
                    options.contentClass,
                  ),
                )
                .children(
                  select
                    .scrollUpArrow({ element: h.div })
                    ?.attr("data-slot", "select-scroll-up-button")
                    .class(SELECT_SCROLL_UP_BUTTON_CLASS)
                    .children(ChevronUpIcon(h)),
                  select
                    .list(h.div)
                    .attr("data-position", position)
                    .class(cn(SELECT_VIEWPORT_CLASS, SELECT_VIEWPORT_POPPER_CLASS))
                    .children(...drawn),
                  select
                    .scrollDownArrow({ element: h.div })
                    ?.attr("data-slot", "select-scroll-down-button")
                    .class(SELECT_SCROLL_DOWN_BUTTON_CLASS)
                    .children(ChevronDownIcon(h)),
                ),
            ),
        );
    },
  });
};
