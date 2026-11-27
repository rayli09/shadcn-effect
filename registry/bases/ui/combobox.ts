/**
 * Combobox — shadcn/ui `combobox`, bases generation, ported 1:1 to
 * Effect UI.
 *
 * Generation: `bases/radix` (the `cn-*` hook generation; upstream's
 * bases combobox is itself built on Base UI's Combobox). Here: the
 * @effect/ui-kit `Combobox` headless Component (filtering, highlight,
 * keyboard, focus, placement, form inputs and data attributes are the
 * kit's job). The consumer owns `open`, `value` and `inputValue` in
 * their Model and stores what the kit's `RequestedOpen`,
 * `RequestedClose`, `Picked` and `RequestedInputValue` events ask for —
 * this wrapper only draws the shadcn anatomy around the kit parts:
 *
 *   inputGroup (input · clear · trigger with chevron) ·
 *   positioner > popup (data-slot="combobox-content") > empty · list >
 *   groups / items (with the check itemIndicator)
 *
 * With `chips: true` the input group is replaced by the kit's chips parts
 * (data-slot="combobox-chips" / "combobox-chip" / "combobox-chip-input"),
 * mirroring upstream ComboboxChips / ComboboxChip / ComboboxChipsInput.
 *
 * Class strings are byte-for-byte the bases/radix strings: structural
 * utilities inline, visual styling in the presets under the
 * `cn-combobox*` / `cn-menu-*` hooks.
 *
 * Declared divergences (in-file, on top of docs/PORTING-RULES.md):
 * - Upstream's sub-components collapse into this one component + the
 *   exported `COMBOBOX_*_CLASS` constants: Effect UI parts are drawn
 *   inside the kit component's `view`, not composed across files.
 * - The input group is the kit's `inputGroup` part wearing this
 *   generation's full `InputGroup` class string (imported from
 *   `./input-group.ts`) plus upstream ComboboxInput's
 *   `cn-combobox-input w-auto` — the same composition upstream makes
 *   (ComboboxInput renders an InputGroup). The kit `input` part itself
 *   is drawn bare inside it, as in the new-york port. ComboboxClear
 *   upstream renders an InputGroupButton (ghost, icon-xs); here the kit
 *   `clear` part is a plain button carrying upstream ComboboxClear's own
 *   `cn-combobox-clear` hook and the X icon.
 * - `ComboboxValue` has no standalone equivalent: with the kit's
 *   `inputInPopup` prop the `value` part plays that role inside the
 *   trigger. `ComboboxCollection` is the kit's `combobox.items` /
 *   `combobox.groups`, which this wrapper draws. `useComboboxAnchor` is
 *   a React ref hook — the kit anchors the popup to the input group
 *   itself, so there is nothing to port.
 * - Group labels: kit items carry a `group` key, so the label text comes
 *   from `groupLabels` (falling back to the key itself).
 * - The positioner carries a small reset class (border-0 bg-transparent
 *   p-0): the kit renders it as a manual popover, whose browser default
 *   border/padding/background must be reset, per the kit docs.
 * - Icons are the shared builders in @/lib/icons (lucide path data,
 *   ISC), not lucide-react: Check, ChevronDown, X. The trigger chevron
 *   additionally carries `data-slot="combobox-trigger-icon"`, chained
 *   onto the shared builder as the pre-hoist local builder set it.
 */
import {
  Combobox as KitCombobox,
  type ComboboxEvents,
  type ComboboxItem,
  type ComboboxProps as KitComboboxProps,
} from "@effect/ui-kit";
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import { CheckIcon, ChevronDownIcon, XIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { INPUT_GROUP_CLASS } from "./input-group.ts";

// ---------------------------------------------------------------------------
// Class strings — verbatim from shadcn bases/radix combobox.tsx
// ---------------------------------------------------------------------------

export const COMBOBOX_TRIGGER_CLASS = "cn-combobox-trigger";

/** Upstream puts this on the InputGroupButton wrapping the trigger; here
 * the kit trigger part is the button, so it carries both. The input group
 * root below carries InputGroup's `group/input-group` for it to match. */
export const COMBOBOX_TRIGGER_BUTTON_CLASS =
  "group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent";

export const COMBOBOX_TRIGGER_ICON_CLASS = "cn-combobox-trigger-icon pointer-events-none";

export const COMBOBOX_CLEAR_CLASS = "cn-combobox-clear";

export const COMBOBOX_CLEAR_ICON_CLASS = "cn-combobox-clear-icon pointer-events-none";

/** Upstream ComboboxInput's classes on the InputGroup it renders. */
export const COMBOBOX_INPUT_GROUP_CLASS = "cn-combobox-input w-auto";

export const COMBOBOX_CONTENT_CLASS =
  "cn-combobox-content cn-combobox-content-logical cn-menu-target cn-menu-translucent group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) data-[chips=true]:min-w-(--anchor-width)";

export const COMBOBOX_LIST_CLASS = "cn-combobox-list overflow-y-auto overscroll-contain";

export const COMBOBOX_ITEM_CLASS =
  "cn-combobox-item relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

export const COMBOBOX_ITEM_INDICATOR_CLASS = "cn-combobox-item-indicator";

export const COMBOBOX_ITEM_INDICATOR_ICON_CLASS =
  "cn-combobox-item-indicator-icon pointer-events-none";

export const COMBOBOX_GROUP_CLASS = "cn-combobox-group";

export const COMBOBOX_LABEL_CLASS = "cn-combobox-label";

export const COMBOBOX_EMPTY_CLASS = "cn-combobox-empty";

export const COMBOBOX_SEPARATOR_CLASS = "cn-combobox-separator";

export const COMBOBOX_CHIPS_CLASS = "cn-combobox-chips";

export const COMBOBOX_CHIP_CLASS =
  "cn-combobox-chip has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50";

export const COMBOBOX_CHIP_REMOVE_CLASS = "cn-combobox-chip-remove";

/** Upstream names the chip-remove button's icon hook `…-indicator-icon`; kept verbatim. */
export const COMBOBOX_CHIP_REMOVE_ICON_CLASS =
  "cn-combobox-chip-indicator-icon pointer-events-none";

export const COMBOBOX_CHIPS_INPUT_CLASS = "cn-combobox-chip-input min-w-16 flex-1 outline-none";

/** Reset for the kit's manual-popover positioner (see header), plus upstream's
 *  Positioner classes `isolate z-50` (consolidation fix, wave 1). */
const POSITIONER_CLASS = "isolate z-50 border-0 bg-transparent p-0";

// ---------------------------------------------------------------------------
// Combobox
// ---------------------------------------------------------------------------

export type ComboboxProps = KitComboboxProps;
export type { ComboboxEvents, ComboboxItem };

export const Combobox = <Msg, R = never>(
  h: Html.H<Msg>,
  options: {
    readonly props: KitComboboxProps;
    readonly onEmit: View.Child.Options<KitComboboxProps, ComboboxEvents, Msg>["onEmit"];
    /** Upstream ComboboxInput `showTrigger`, default true. */
    readonly showTrigger?: boolean | undefined;
    /** Upstream ComboboxInput `showClear`, default false. */
    readonly showClear?: boolean | undefined;
    /** Draw the chips anatomy (upstream ComboboxChips), default false. */
    readonly chips?: boolean | undefined;
    /** Upstream ComboboxChip `showRemove`, default true. */
    readonly showChipRemove?: boolean | undefined;
    /** Text drawn by the empty part, upstream ComboboxEmpty's children. */
    readonly emptyText?: string | undefined;
    /** Group key → label, drawn with the combobox-label part styling. */
    readonly groupLabels?: Readonly<Record<string, string>> | undefined;
    readonly class?: string | undefined;
    readonly contentClass?: string | undefined;
  },
) => {
  const showTrigger = options.showTrigger ?? true;
  const showClear = options.showClear ?? false;
  const chips = options.chips ?? false;
  const labelOf = (value: string): string =>
    options.props.items.find((item) => item.value === value)?.label ?? value;
  const selected: ReadonlyArray<string> =
    options.props.value === null || options.props.value === undefined
      ? []
      : typeof options.props.value === "string"
        ? [options.props.value]
        : options.props.value;

  return KitCombobox(h, {
    props: options.props,
    onEmit: options.onEmit,
    view: (combobox) => {
      const drawItem = (entry: ComboboxItem) =>
        combobox
          .item({ element: h.div, value: entry.value })
          .attr("data-slot", "combobox-item")
          .class(COMBOBOX_ITEM_CLASS)
          .children(
            entry.label,
            combobox
              .itemIndicator({
                element: h.span,
                value: entry.value,
              })
              ?.attr("data-slot", "combobox-item-indicator")
              .class(COMBOBOX_ITEM_INDICATOR_CLASS)
              .children(CheckIcon(h, { class: COMBOBOX_ITEM_INDICATOR_ICON_CLASS })),
          );
      const drawn: Array<View.Input<Msg, any>> = [];
      combobox.groups.forEach((group, groupIndex) => {
        if (groupIndex > 0) {
          drawn.push(
            combobox
              .separator(h.div)
              .attr("data-slot", "combobox-separator")
              .class(COMBOBOX_SEPARATOR_CLASS),
          );
        }
        const items = group.items.map(drawItem);
        if (group.key === undefined) {
          drawn.push(...items);
        } else {
          drawn.push(
            combobox
              .group({ element: h.div, group: group.key })
              .attr("data-slot", "combobox-group")
              .class(COMBOBOX_GROUP_CLASS)
              .children(
                combobox
                  .groupLabel({
                    element: h.div,
                    group: group.key,
                  })
                  .attr("data-slot", "combobox-label")
                  .class(COMBOBOX_LABEL_CLASS)
                  .children(options.groupLabels?.[group.key] ?? group.key),
                ...items,
              ),
          );
        }
      });

      const anchor = chips
        ? combobox
            .chips(h.div)
            .attr("data-slot", "combobox-chips")
            .class(cn(COMBOBOX_CHIPS_CLASS, options.class))
            .children(
              ...selected.map((value) =>
                combobox
                  .chip({ element: h.div, value })
                  .attr("data-slot", "combobox-chip")
                  .class(COMBOBOX_CHIP_CLASS)
                  .children(
                    labelOf(value),
                    (options.showChipRemove ?? true)
                      ? combobox
                          .chipRemove({
                            element: h.button,
                            value,
                          })
                          ?.attr("data-slot", "combobox-chip-remove")
                          .class(COMBOBOX_CHIP_REMOVE_CLASS)
                          .children(XIcon(h, { class: COMBOBOX_CHIP_REMOVE_ICON_CLASS }))
                      : undefined,
                  ),
              ),
              combobox
                .input(h.input)
                .attr("data-slot", "combobox-chip-input")
                .class(COMBOBOX_CHIPS_INPUT_CLASS),
            )
        : combobox
            .inputGroup(h.div)
            .class(cn(INPUT_GROUP_CLASS, COMBOBOX_INPUT_GROUP_CLASS, options.class))
            .children(
              combobox.input(h.input),
              showClear
                ? combobox
                    .clear({ element: h.button })
                    ?.attr("data-slot", "combobox-clear")
                    .class(COMBOBOX_CLEAR_CLASS)
                    .children(XIcon(h, { class: COMBOBOX_CLEAR_ICON_CLASS }))
                : undefined,
              showTrigger
                ? combobox
                    .trigger(h.button)
                    .attr("data-slot", "combobox-trigger")
                    .class(cn(COMBOBOX_TRIGGER_CLASS, COMBOBOX_TRIGGER_BUTTON_CLASS))
                    .children(
                      combobox.icon(h.span).children(
                        ChevronDownIcon(h, {
                          class: COMBOBOX_TRIGGER_ICON_CLASS,
                        }).attr("data-slot", "combobox-trigger-icon"),
                      ),
                    )
                : undefined,
            );

      return h.div.children(
        anchor,
        combobox
          .positioner(h.div)
          .class(POSITIONER_CLASS)
          .children(
            combobox
              .popup(h.div)
              .attr("data-slot", "combobox-content")
              .attr("data-chips", String(chips))
              .class(cn(COMBOBOX_CONTENT_CLASS, options.contentClass))
              .children(
                combobox
                  .empty(h.div)
                  .attr("data-slot", "combobox-empty")
                  .class(COMBOBOX_EMPTY_CLASS)
                  .children(options.emptyText ?? "No results found."),
                combobox
                  .list(h.div)
                  .attr("data-slot", "combobox-list")
                  .class(COMBOBOX_LIST_CLASS)
                  .children(...drawn),
              ),
          ),
      );
    },
  });
};
