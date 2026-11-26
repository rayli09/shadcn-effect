/**
 * Combobox — shadcn/ui `combobox` ported 1:1 to Effect UI.
 *
 * Upstream: React + Base UI Combobox, with the input styled by InputGroup.
 * Here: the @effect/ui-kit `Combobox` headless Component (filtering,
 * highlight, keyboard, focus, placement, form inputs and data attributes
 * are the kit's job). The consumer owns `open`, `value` and `inputValue`
 * in their Model and stores what the kit's `RequestedOpen`,
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
 * Class strings are byte-for-byte the shadcn new-york-v4 strings.
 *
 * Declared divergences (in-file, on top of docs/PORTING-RULES.md):
 * - Upstream's sub-components collapse into this one component + the
 *   exported `COMBOBOX_*_CLASS` constants: Effect UI parts are drawn
 *   inside the kit component's `view`, not composed across files.
 * - The input's own styling upstream comes from InputGroup /
 *   InputGroupInput (a different registry item); here the kit `input`
 *   part is drawn bare inside the input group, and the input group
 *   carries only upstream's `w-auto`. ComboboxClear upstream renders an
 *   InputGroupButton (ghost, icon-xs); here the kit `clear` part is a
 *   plain button with the X icon and no extra class, as upstream's
 *   ComboboxClear itself sets none.
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
 * - Icons are inline SVG builders from lucide path data (ISC), not
 *   lucide-react: Check, ChevronDown, X.
 */
import {
  Combobox as KitCombobox,
  type ComboboxEvents,
  type ComboboxItem,
  type ComboboxProps as KitComboboxProps
} from "@effect/ui-kit"
import type * as Html from "@effect/ui/html/Html"
import type * as View from "@effect/ui/View"
import { cn } from "../lib/utils.ts"

// ---------------------------------------------------------------------------
// Icons — inline lucide path data (ISC), drawn with h.el, as in Effect UI's
// own launch example. Local to this file until registry/lib/icons.ts lands.
// ---------------------------------------------------------------------------

type IconNode = readonly [
  tag: string,
  attrs: Readonly<Record<string, string>>
]

const icon = <Msg>(
  h: Html.H<Msg>,
  nodes: ReadonlyArray<IconNode>,
  cls: string,
  slot?: string | undefined
) =>
  h.el("svg").attrs({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
    ...(slot === undefined ? {} : { "data-slot": slot }),
    class: cls
  }).children(
    nodes.map(([tag, attrs], index) =>
      h.el(tag).key(String(index)).attrs(attrs)
    )
  )

const CheckIcon = <Msg>(h: Html.H<Msg>, cls: string) =>
  icon(h, [["path", { d: "M20 6 9 17l-5-5" }]], cls)

const ChevronDownIcon = <Msg>(h: Html.H<Msg>, cls: string) =>
  icon(
    h,
    [["path", { d: "m6 9 6 6 6-6" }]],
    cls,
    "combobox-trigger-icon"
  )

const XIcon = <Msg>(h: Html.H<Msg>, cls: string) =>
  icon(
    h,
    [
      ["path", { d: "M18 6 6 18" }],
      ["path", { d: "m6 6 12 12" }]
    ],
    cls
  )

// ---------------------------------------------------------------------------
// Class strings — verbatim from shadcn new-york-v4 combobox.tsx
// ---------------------------------------------------------------------------

export const COMBOBOX_TRIGGER_CLASS = "[&_svg:not([class*='size-'])]:size-4"

/** Upstream puts this on the InputGroupButton wrapping the trigger; here
 * the kit trigger part is the button, so it carries both. The input group
 * root below carries InputGroup's `group/input-group` for it to match. */
export const COMBOBOX_TRIGGER_BUTTON_CLASS =
  "group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"

export const COMBOBOX_TRIGGER_ICON_CLASS =
  "pointer-events-none size-4 text-muted-foreground"

export const COMBOBOX_CONTENT_CLASS =
  "group/combobox-content relative max-h-96 w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) overflow-hidden rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[chips=true]:min-w-(--anchor-width) data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"

export const COMBOBOX_LIST_CLASS =
  "max-h-[min(calc(--spacing(96)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto p-1 data-empty:p-0"

export const COMBOBOX_ITEM_CLASS =
  "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

export const COMBOBOX_ITEM_INDICATOR_CLASS =
  "pointer-events-none absolute right-2 flex size-4 items-center justify-center"

export const COMBOBOX_ITEM_INDICATOR_ICON_CLASS =
  "pointer-events-none size-4 pointer-coarse:size-5"

export const COMBOBOX_LABEL_CLASS =
  "px-2 py-1.5 text-xs text-muted-foreground pointer-coarse:px-3 pointer-coarse:py-2 pointer-coarse:text-sm"

export const COMBOBOX_EMPTY_CLASS =
  "hidden w-full justify-center py-2 text-center text-sm text-muted-foreground group-data-empty/combobox-content:flex"

export const COMBOBOX_SEPARATOR_CLASS = "-mx-1 my-1 h-px bg-border"

export const COMBOBOX_CHIPS_CLASS =
  "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent bg-clip-padding px-2.5 py-1.5 text-sm shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-[3px] has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1.5 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40"

export const COMBOBOX_CHIP_CLASS =
  "flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0"

export const COMBOBOX_CHIP_REMOVE_CLASS =
  "-ml-1 opacity-50 hover:opacity-100"

export const COMBOBOX_CHIPS_INPUT_CLASS = "min-w-16 flex-1 outline-none"

/** Reset for the kit's manual-popover positioner (see header), plus upstream's
 *  Positioner classes `isolate z-50` (consolidation fix, wave 1). */
const POSITIONER_CLASS = "isolate z-50 border-0 bg-transparent p-0"

// ---------------------------------------------------------------------------
// Combobox
// ---------------------------------------------------------------------------

export type ComboboxProps = KitComboboxProps
export type { ComboboxEvents, ComboboxItem }

export const Combobox = <Msg, R = never>(
  h: Html.H<Msg>,
  options: {
    readonly props: KitComboboxProps
    readonly onEmit: View.Child.Options<
      KitComboboxProps,
      ComboboxEvents,
      Msg
    >["onEmit"]
    /** Upstream ComboboxInput `showTrigger`, default true. */
    readonly showTrigger?: boolean | undefined
    /** Upstream ComboboxInput `showClear`, default false. */
    readonly showClear?: boolean | undefined
    /** Draw the chips anatomy (upstream ComboboxChips), default false. */
    readonly chips?: boolean | undefined
    /** Upstream ComboboxChip `showRemove`, default true. */
    readonly showChipRemove?: boolean | undefined
    /** Text drawn by the empty part, upstream ComboboxEmpty's children. */
    readonly emptyText?: string | undefined
    /** Group key → label, drawn with the combobox-label part styling. */
    readonly groupLabels?:
      | Readonly<Record<string, string>>
      | undefined
    readonly class?: string | undefined
    readonly contentClass?: string | undefined
  }
) => {
  const showTrigger = options.showTrigger ?? true
  const showClear = options.showClear ?? false
  const chips = options.chips ?? false
  const labelOf = (value: string): string =>
    options.props.items.find((item) => item.value === value)?.label ??
    value
  const selected: ReadonlyArray<string> =
    options.props.value === null || options.props.value === undefined
      ? []
      : typeof options.props.value === "string"
      ? [options.props.value]
      : options.props.value

  return KitCombobox(h, {
    props: options.props,
    onEmit: options.onEmit,
    view: (combobox) => {
      const drawItem = (entry: ComboboxItem) =>
        combobox.item({ element: h.div, value: entry.value })
          .attr("data-slot", "combobox-item")
          .class(COMBOBOX_ITEM_CLASS)
          .children(
            entry.label,
            combobox.itemIndicator({
              element: h.span,
              value: entry.value
            })
              ?.attr("data-slot", "combobox-item-indicator")
              .class(COMBOBOX_ITEM_INDICATOR_CLASS)
              .children(
                CheckIcon(h, COMBOBOX_ITEM_INDICATOR_ICON_CLASS)
              )
          )
      const drawn: Array<View.Input<Msg, any>> = []
      combobox.groups.forEach((group, groupIndex) => {
        if (groupIndex > 0) {
          drawn.push(
            combobox.separator(h.div)
              .attr("data-slot", "combobox-separator")
              .class(COMBOBOX_SEPARATOR_CLASS)
          )
        }
        const items = group.items.map(drawItem)
        if (group.key === undefined) {
          drawn.push(...items)
        } else {
          drawn.push(
            combobox.group({ element: h.div, group: group.key })
              .attr("data-slot", "combobox-group")
              .children(
                combobox.groupLabel({
                  element: h.div,
                  group: group.key
                })
                  .attr("data-slot", "combobox-label")
                  .class(COMBOBOX_LABEL_CLASS)
                  .children(
                    options.groupLabels?.[group.key] ?? group.key
                  ),
                ...items
              )
          )
        }
      })

      const anchor = chips
        ? combobox.chips(h.div)
          .attr("data-slot", "combobox-chips")
          .class(cn(COMBOBOX_CHIPS_CLASS, options.class))
          .children(
            ...selected.map((value) =>
              combobox.chip({ element: h.div, value })
                .attr("data-slot", "combobox-chip")
                .class(COMBOBOX_CHIP_CLASS)
                .children(
                  labelOf(value),
                  (options.showChipRemove ?? true)
                    ? combobox.chipRemove({
                      element: h.button,
                      value
                    })
                      ?.attr("data-slot", "combobox-chip-remove")
                      .class(COMBOBOX_CHIP_REMOVE_CLASS)
                      .children(XIcon(h, "pointer-events-none"))
                    : undefined
                )
            ),
            combobox.input(h.input)
              .attr("data-slot", "combobox-chip-input")
              .class(COMBOBOX_CHIPS_INPUT_CLASS)
          )
        : combobox.inputGroup(h.div)
          .class(cn("group/input-group w-auto", options.class))
          .children(
            combobox.input(h.input),
            showClear
              ? combobox.clear({ element: h.button })?.children(
                XIcon(h, "pointer-events-none")
              )
              : undefined,
            showTrigger
              ? combobox.trigger(h.button)
                .attr("data-slot", "combobox-trigger")
                .class(
                  cn(
                    COMBOBOX_TRIGGER_CLASS,
                    COMBOBOX_TRIGGER_BUTTON_CLASS
                  )
                )
                .children(
                  combobox.icon(h.span).children(
                    ChevronDownIcon(
                      h,
                      COMBOBOX_TRIGGER_ICON_CLASS
                    )
                  )
                )
              : undefined
          )

      return h.div.children(
        anchor,
        combobox.positioner(h.div)
          .class(POSITIONER_CLASS)
          .children(
            combobox.popup(h.div)
              .attr("data-slot", "combobox-content")
              .attr("data-chips", String(chips))
              .class(cn(COMBOBOX_CONTENT_CLASS, options.contentClass))
              .children(
                combobox.empty(h.div)
                  .attr("data-slot", "combobox-empty")
                  .class(COMBOBOX_EMPTY_CLASS)
                  .children(options.emptyText ?? "No results found."),
                combobox.list(h.div)
                  .attr("data-slot", "combobox-list")
                  .class(COMBOBOX_LIST_CLASS)
                  .children(...drawn)
              )
          )
      )
    }
  })
}
