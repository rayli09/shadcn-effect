/**
 * Select — shadcn/ui `select` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix Select. Here: the @effect/ui-kit `Select` headless
 * Component (an Elm-Architecture part owner: keyboard, typeahead, focus,
 * placement, form inputs and data attributes are the kit's job). The consumer
 * still owns `open` and `value` in their Model and stores what the kit's
 * `RequestedOpen` / `RequestedClose` / `Picked` events ask for — this wrapper
 * only draws the shadcn anatomy around the kit parts:
 *
 *   trigger (value + chevron icon) · positioner > popup (data-slot=
 *   "select-content") > scroll-up · list > groups / items (itemText +
 *   itemIndicator with a check) · scroll-down
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings.
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
 *   variables in the upstream strings stay verbatim but are inert — the kit
 *   sets `--anchor-width` / `--available-height` etc. on the positioner.
 * - The positioner carries a small reset class (border-0 bg-transparent
 *   p-0): the kit renders it as a manual popover, and the browser's default
 *   popover border/padding/background must be reset, per the kit docs.
 * - Icons are the shared builders in registry/lib/icons.ts (lucide path
 *   data, ISC), not lucide-react: Check, ChevronDown, ChevronUp.
 */
import {
  Select as KitSelect,
  type SelectEvents,
  type SelectItem as KitSelectItem,
  type SelectProps as KitSelectProps,
} from "@effect/ui-kit";
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "../lib/icons.ts";
import { cn } from "../lib/utils.ts";

// ---------------------------------------------------------------------------
// Class strings — verbatim from shadcn new-york-v4 select.tsx
// ---------------------------------------------------------------------------

export const SELECT_TRIGGER_CLASS =
  "flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground";

export const SELECT_CONTENT_CLASS =
  "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95";

export const SELECT_CONTENT_POPPER_CLASS =
  "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1";

export const SELECT_VIEWPORT_CLASS = "p-1";

export const SELECT_VIEWPORT_POPPER_CLASS =
  "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1";

export const SELECT_LABEL_CLASS = "px-2 py-1.5 text-xs text-muted-foreground";

export const SELECT_ITEM_CLASS =
  "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2";

export const SELECT_ITEM_INDICATOR_CLASS =
  "absolute right-2 flex size-3.5 items-center justify-center";

export const SELECT_SEPARATOR_CLASS = "pointer-events-none -mx-1 my-1 h-px bg-border";

export const SELECT_SCROLL_BUTTON_CLASS = "flex cursor-default items-center justify-center py-1";

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
                  ?.children(CheckIcon(h, { class: "size-4" })),
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
              select.icon(h.span).children(ChevronDownIcon(h, { class: "size-4 opacity-50" })),
            ),
          select
            .positioner(h.div)
            .class(POSITIONER_CLASS)
            .children(
              select
                .popup(h.div)
                .attr("data-slot", "select-content")
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
                    .class(SELECT_SCROLL_BUTTON_CLASS)
                    .children(ChevronUpIcon(h, { class: "size-4" })),
                  select
                    .list(h.div)
                    .class(
                      cn(
                        SELECT_VIEWPORT_CLASS,
                        position === "popper" && SELECT_VIEWPORT_POPPER_CLASS,
                      ),
                    )
                    .children(...drawn),
                  select
                    .scrollDownArrow({ element: h.div })
                    ?.attr("data-slot", "select-scroll-down-button")
                    .class(SELECT_SCROLL_BUTTON_CLASS)
                    .children(ChevronDownIcon(h, { class: "size-4" })),
                ),
            ),
        );
    },
  });
};
