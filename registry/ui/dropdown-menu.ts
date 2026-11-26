/**
 * DropdownMenu — shadcn/ui `dropdown-menu` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix DropdownMenu (Root / Trigger / Portal / Content /
 * Item / CheckboxItem / RadioGroup / RadioItem / Label / Separator /
 * Shortcut / Sub / SubTrigger / SubContent). Here: the @effect/ui-kit
 * `Menu` headless component and its parts. The kit Menu is not a styled
 * component — it owns keyboard, focus, placement, typeahead and the ARIA
 * roles, and the consumer's view applies its parts to builders. These
 * wrappers apply the parts and stamp the upstream `data-slot` attributes
 * and class strings (byte-for-byte new-york-v4) on them, in the launch
 * example's idiom: style the element, apply the part, chain `.children`.
 *
 * How the upstream anatomy maps:
 *
 * - `DropdownMenu` (Root) is the kit `Menu` call itself — it renders no
 *   element of its own in either world. Re-exported below.
 * - `DropdownMenuPortal` has NO counterpart and is not exported: the kit
 *   positioner is a manual popover in the browser top layer, so no portal
 *   is needed (see the Menu module docs in @effect/ui-kit).
 * - `DropdownMenuSub` is another kit `Menu` call with `parentItem` set,
 *   drawn inside the parent's popup. Re-exported below as the same `Menu`.
 * - Open state is the consumer's: pass `open` in the Menu props and store
 *   what its `RequestedOpen` / `RequestedClose` events ask for. Item
 *   `disabled` likewise comes from the Menu's `items` prop, not the part.
 * - Upstream Content's `sideOffset = 4` default is a Positioning prop on
 *   the kit Menu call (`sideOffset: 4` in `props`), not on the part.
 *
 * Declared divergences (see docs/PORTING-RULES.md):
 *
 * - The class strings keep Radix's `data-[state=open]` / `data-[state=
 *   closed]` and `--radix-*` variable tokens verbatim for parity, but the
 *   kit emits `data-open` / `data-closed` / `data-popup-open` and sets
 *   `--transform-origin` / `--available-height` on the positioner instead
 *   — so the `data-[state=*]` animation utilities and the `max-h-(--radix-*)`
 *   / `origin-(--radix-*)` utilities are inert as written; key enter/exit
 *   animation CSS off the kit's attributes in your theme.
 * - `DropdownMenuLabel` is the kit's `groupLabel` part when a `group` is
 *   given (a label names its group for `aria-labelledby`); without one it
 *   is a plain styled `h.div`, as a free-standing Radix Label renders.
 */
import type * as Component from "@effect/ui/Component"
import type { Html } from "@effect/ui/html"
import type * as View from "@effect/ui/View"
import {
  Menu,
  type MenuProps,
  type MenuTriggerElement,
  type MenuTriggerOptions
} from "@effect/ui-kit"
import { cn } from "../lib/utils.ts"

/** What a kit `Menu`'s view receives: its parts and plain values. */
export type DropdownMenuParts = Component.Headless.Parts<typeof Menu>

/** The kit `Menu` props (open, items, Positioning fields, …). */
export type DropdownMenuProps = MenuProps

/**
 * The root: a kit `Menu` call. Draw the trigger and the popup inside its
 * `view` with the wrappers below:
 *
 *   DropdownMenu(h, {
 *     props: { open: model.open, items, sideOffset: 4 },
 *     onEmit: { RequestedOpen: ..., RequestedClose: ..., Picked: ... },
 *     view: (menu) => h.div(DropdownMenuTrigger(menu, h).children("Edit"), ...)
 *   })
 */
export const DropdownMenu = Menu

/** A submenu: a kit `Menu` call with `parentItem` set to the parent item's value. */
export const DropdownMenuSub = Menu

// ---------------------------------------------------------------------------
// Inline Lucide icons (ISC path data, drawn with `h.el` as in the Effect UI
// launch example's Icon component — the lucide-react package is banned).
// ---------------------------------------------------------------------------

const iconAttrs = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true"
} as const

const CheckIcon = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.el("svg")
    .attrs({ ...iconAttrs, class: options.class ?? "size-4" })
    .children(h.el("path").attrs({ d: "M20 6 9 17l-5-5" }))

const ChevronRightIcon = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.el("svg")
    .attrs({ ...iconAttrs, class: options.class ?? "size-4" })
    .children(h.el("path").attrs({ d: "m9 18 6-6-6-6" }))

const CircleIcon = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.el("svg")
    .attrs({ ...iconAttrs, class: options.class ?? "size-4" })
    .children(h.el("circle").attrs({ cx: "12", cy: "12", r: "10" }))

// ---------------------------------------------------------------------------
// Class strings — byte-for-byte shadcn new-york-v4.
// ---------------------------------------------------------------------------

export const DROPDOWN_MENU_CONTENT_CLASS =
  "z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"

export const DROPDOWN_MENU_ITEM_CLASS =
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"

export const DROPDOWN_MENU_CHECKBOX_ITEM_CLASS =
  "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

export const DROPDOWN_MENU_RADIO_ITEM_CLASS =
  "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

export const DROPDOWN_MENU_LABEL_CLASS =
  "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8"

export const DROPDOWN_MENU_SEPARATOR_CLASS = "-mx-1 my-1 h-px bg-border"

export const DROPDOWN_MENU_SHORTCUT_CLASS =
  "ml-auto text-xs tracking-widest text-muted-foreground"

export const DROPDOWN_MENU_SUB_TRIGGER_CLASS =
  "flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[inset]:pl-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground"

export const DROPDOWN_MENU_SUB_CONTENT_CLASS =
  "z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"

export const DROPDOWN_MENU_INDICATOR_CLASS =
  "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"

export type DropdownMenuItemVariant = "default" | "destructive"

type InsetOptions = {
  readonly inset?: boolean | undefined
  readonly class?: string | undefined
}

// ---------------------------------------------------------------------------
// Parts, styled. Each takes the parts object from the Menu's view closure.
// ---------------------------------------------------------------------------

/**
 * The trigger: the kit Menu's `trigger` part on an `h.button` (or a stacked
 * `element`, e.g. our shadcn `Button`). Chain `.children(label)`.
 */
export const DropdownMenuTrigger = <Msg, R = never>(
  menu: DropdownMenuParts,
  h: Html.H<Msg>,
  options: MenuTriggerOptions & {
    readonly element?: MenuTriggerElement<Msg, R> | undefined
  } = {}
) => {
  const { element, ...triggerOptions } = options
  return menu
    .trigger({ ...triggerOptions, element: element ?? h.button })
    .attr("data-slot", "dropdown-menu-trigger")
}

/**
 * The content: the kit `positioner` (top layer, no portal) wrapping the
 * `popup` with the upstream content classes. Chain `.children(items…)`
 * on the result — they land inside the popup.
 */
export const DropdownMenuContent = <Msg>(
  menu: DropdownMenuParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  menu.positioner(h.div).children(
    menu
      .popup(h.div)
      .attr("data-slot", "dropdown-menu-content")
      .class(cn(DROPDOWN_MENU_CONTENT_CLASS, options.class))
  )

/** A group of items: the kit `group` part. `group` keys it and its label. */
export const DropdownMenuGroup = <Msg, R = never>(
  menu: DropdownMenuParts,
  h: Html.H<Msg>,
  options: { readonly group: string },
  children: View.Content<Msg, R>
) =>
  menu
    .group({ element: h.div, group: options.group })
    .attr("data-slot", "dropdown-menu-group")
    .children(children)

/** A plain item. Picking it closes the menu unless `closeOnClick` is false. */
export const DropdownMenuItem = <Msg>(
  menu: DropdownMenuParts,
  h: Html.H<Msg>,
  options: InsetOptions & {
    readonly value: string
    readonly variant?: DropdownMenuItemVariant | undefined
    readonly closeOnClick?: boolean | undefined
  }
) =>
  menu
    .item({
      element: h.div,
      value: options.value,
      closeOnClick: options.closeOnClick
    })
    .attr("data-slot", "dropdown-menu-item")
    .attr("data-inset", options.inset === true ? "" : undefined)
    .attr("data-variant", options.variant ?? "default")
    .class(cn(DROPDOWN_MENU_ITEM_CLASS, options.class))

/**
 * A checkbox item with the upstream indicator: a left span holding the
 * kit's `checkboxItemIndicator` part, which draws only while checked,
 * with an inline Check icon inside.
 */
export const DropdownMenuCheckboxItem = <Msg, R = never>(
  menu: DropdownMenuParts,
  h: Html.H<Msg>,
  options: {
    readonly value: string
    readonly checked: boolean
    readonly closeOnClick?: boolean | undefined
    readonly class?: string | undefined
  },
  children: View.Content<Msg, R>
) =>
  menu
    .checkboxItem({
      element: h.div,
      value: options.value,
      checked: options.checked,
      closeOnClick: options.closeOnClick
    })
    .attr("data-slot", "dropdown-menu-checkbox-item")
    .class(cn(DROPDOWN_MENU_CHECKBOX_ITEM_CLASS, options.class))
    .children(
      h.span.class(DROPDOWN_MENU_INDICATOR_CLASS).children(
        menu
          .checkboxItemIndicator({ element: h.span, value: options.value })
          ?.children(CheckIcon(h, { class: "size-4" }))
      ),
      children
    )

/** The radio group: the kit `radioGroup` part; `value` is the checked item's value, or null. */
export const DropdownMenuRadioGroup = <Msg, R = never>(
  menu: DropdownMenuParts,
  h: Html.H<Msg>,
  options: { readonly value: string | null },
  children: View.Content<Msg, R>
) =>
  menu
    .radioGroup({ element: h.div, value: options.value })
    .attr("data-slot", "dropdown-menu-radio-group")
    .children(children)

/**
 * A radio item, checked while the enclosing radio group's value is its
 * own, with the upstream Circle indicator.
 */
export const DropdownMenuRadioItem = <Msg, R = never>(
  menu: DropdownMenuParts,
  h: Html.H<Msg>,
  options: {
    readonly value: string
    readonly closeOnClick?: boolean | undefined
    readonly class?: string | undefined
  },
  children: View.Content<Msg, R>
) =>
  menu
    .radioItem({
      element: h.div,
      value: options.value,
      closeOnClick: options.closeOnClick
    })
    .attr("data-slot", "dropdown-menu-radio-item")
    .class(cn(DROPDOWN_MENU_RADIO_ITEM_CLASS, options.class))
    .children(
      h.span.class(DROPDOWN_MENU_INDICATOR_CLASS).children(
        menu
          .radioItemIndicator({ element: h.span, value: options.value })
          ?.children(CircleIcon(h, { class: "size-2 fill-current" }))
      ),
      children
    )

/**
 * A label. With a `group`, it is the kit's `groupLabel` part for that
 * group (the group's `aria-labelledby` points at it); without one, a
 * plain styled div, as a free-standing upstream Label renders.
 */
export const DropdownMenuLabel = <Msg>(
  menu: DropdownMenuParts,
  h: Html.H<Msg>,
  options: InsetOptions & { readonly group?: string | undefined }
) =>
  (options.group === undefined
    ? h.div
    : menu.groupLabel({ element: h.div, group: options.group }))
    .attr("data-slot", "dropdown-menu-label")
    .attr("data-inset", options.inset === true ? "" : undefined)
    .class(cn(DROPDOWN_MENU_LABEL_CLASS, options.class))

/** A separator between items: the kit `separator` part. */
export const DropdownMenuSeparator = <Msg>(
  menu: DropdownMenuParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  menu
    .separator(h.div)
    .attr("data-slot", "dropdown-menu-separator")
    .class(cn(DROPDOWN_MENU_SEPARATOR_CLASS, options.class))

/** A shortcut hint: a plain span, exactly as upstream renders it. */
export const DropdownMenuShortcut = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.span
    .attr("data-slot", "dropdown-menu-shortcut")
    .class(cn(DROPDOWN_MENU_SHORTCUT_CLASS, options.class))

/**
 * The item that opens a submenu: the parent menu's `item` part stacked on
 * the submenu's `submenuTrigger` part (the kit's documented composition),
 * with the upstream ChevronRight icon appended after the children.
 * Draw `DropdownMenuSubContent` for the same submenu inside the popup too.
 */
export const DropdownMenuSubTrigger = <Msg, R = never>(
  menu: DropdownMenuParts,
  sub: DropdownMenuParts,
  h: Html.H<Msg>,
  options: InsetOptions & { readonly value: string },
  children: View.Content<Msg, R>
) =>
  menu
    .item({ element: sub.submenuTrigger(h.div), value: options.value })
    .attr("data-slot", "dropdown-menu-sub-trigger")
    .attr("data-inset", options.inset === true ? "" : undefined)
    .class(cn(DROPDOWN_MENU_SUB_TRIGGER_CLASS, options.class))
    .children(children, ChevronRightIcon(h, { class: "ml-auto size-4" }))

/**
 * A submenu's content: its `positioner` wrapping its `popup` with the
 * upstream sub-content classes. Place it inside the parent's popup,
 * next to the `DropdownMenuSubTrigger`.
 */
export const DropdownMenuSubContent = <Msg, R = never>(
  sub: DropdownMenuParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined },
  children: View.Content<Msg, R>
) =>
  sub.positioner(h.div).children(
    sub
      .popup(h.div)
      .attr("data-slot", "dropdown-menu-sub-content")
      .class(cn(DROPDOWN_MENU_SUB_CONTENT_CLASS, options.class))
      .children(children)
  )
