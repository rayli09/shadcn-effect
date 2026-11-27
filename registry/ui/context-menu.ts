/**
 * ContextMenu — shadcn/ui `context-menu` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix ContextMenu. Here: the @effect/ui-kit
 * `ContextMenu`, which is a function over a headless `Menu`: the parts,
 * events, items, submenus, focus and transitions are the Menu's, its
 * `trigger` part is the area a right click (or a 500ms touch long press)
 * opens the menu at the pointer from, and it is always modal. These
 * wrappers apply the parts and stamp the upstream `data-slot` attributes
 * and class strings (byte-for-byte new-york-v4) on them.
 *
 * How the upstream anatomy maps:
 *
 * - `ContextMenu` (Root) is the kit `ContextMenu` call itself — it
 *   renders no element of its own in either world. Re-exported below.
 * - `ContextMenuPortal` has NO counterpart and is not exported: the kit
 *   positioner is a manual popover in the browser top layer, so no
 *   portal is needed.
 * - `ContextMenuSub` is a kit `Menu` call with `parentItem` set, drawn
 *   inside the context menu's popup. Re-exported below as `Menu`.
 * - Open state is the consumer's: pass `open` in the props and store
 *   what its `RequestedOpen` / `RequestedClose` events ask for. Item
 *   `disabled` comes from the `items` prop, not the part, and so does
 *   checked state: a checkbox or radio item is checked when its `items`
 *   entry carries `checked: true` (Effect-TS/ui PR #474).
 *
 * Declared divergences (see docs/PORTING-RULES.md):
 *
 * - The class strings keep Radix's `data-[state=open]` / `data-[state=
 *   closed]` and `--radix-*` variable tokens verbatim for parity, but
 *   the kit emits `data-open` / `data-closed` / `data-popup-open` and
 *   sets `--transform-origin` / `--available-height` on the positioner
 *   instead — so the `data-[state=*]` animation utilities and the
 *   `max-h-(--radix-*)` / `origin-(--radix-*)` utilities are inert as
 *   written; key enter/exit animation CSS off the kit's attributes in
 *   your theme.
 * - `ContextMenuLabel` is the kit's `groupLabel` part when a `group` is
 *   given (a label names its group for `aria-labelledby`); without one
 *   it is a plain styled `h.div`, as a free-standing Radix Label renders.
 */
import type * as Component from "@effect/ui/Component";
import type { Html } from "@effect/ui/html";
import type * as View from "@effect/ui/View";
import {
  ContextMenu as KitContextMenu,
  type ContextMenuParts,
  type ContextMenuProps,
  Menu,
} from "@effect/ui-kit";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

/** What a kit `ContextMenu`'s view receives: its parts and plain values. */
export type { ContextMenuParts };

/** What a kit `Menu`'s view receives — the parts of a submenu drawn inside a context menu. */
export type ContextMenuSubParts = Component.Headless.Parts<typeof Menu>;

/** The kit `ContextMenu` props (open, items, Positioning fields, …). */
export type { ContextMenuProps };

/**
 * The root: a kit `ContextMenu` call. Draw the trigger area and the
 * popup inside its `view` with the wrappers below:
 *
 *   ContextMenu(h, {
 *     props: { open: model.open, items },
 *     onEmit: { RequestedOpen: ..., RequestedClose: ..., Picked: ... },
 *     view: (menu) => ContextMenuTrigger(menu, h).children("report.pdf", ...)
 *   })
 */
export const ContextMenu = KitContextMenu;

/** A submenu: a kit `Menu` call with `parentItem` set to the parent item's value. */
export const ContextMenuSub = Menu;

// ---------------------------------------------------------------------------
// Icons — the shared builders in ../lib/icons.ts (inline Lucide SVG; the
// lucide-react package is banned). Those builders also set xmlns / width /
// height on the <svg>, which the file-local builders they replaced did
// not, so every call site removes them again via `svgAttrRemovals`
// (`.attrs` with an `undefined` value removes the attribute) and the
// rendered <svg> keeps exactly the attributes it had before.
// ---------------------------------------------------------------------------

const svgAttrRemovals = {
  xmlns: undefined,
  width: undefined,
  height: undefined,
} as const;

// ---------------------------------------------------------------------------
// Class strings — byte-for-byte shadcn new-york-v4.
// ---------------------------------------------------------------------------

export const CONTEXT_MENU_CONTENT_CLASS =
  "z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95";

export const CONTEXT_MENU_ITEM_CLASS =
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!";

export const CONTEXT_MENU_CHECKBOX_ITEM_CLASS =
  "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

export const CONTEXT_MENU_RADIO_ITEM_CLASS =
  "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

export const CONTEXT_MENU_LABEL_CLASS =
  "px-2 py-1.5 text-sm font-medium text-foreground data-[inset]:pl-8";

export const CONTEXT_MENU_SEPARATOR_CLASS = "-mx-1 my-1 h-px bg-border";

export const CONTEXT_MENU_SHORTCUT_CLASS = "ml-auto text-xs tracking-widest text-muted-foreground";

export const CONTEXT_MENU_SUB_TRIGGER_CLASS =
  "flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[inset]:pl-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground";

export const CONTEXT_MENU_SUB_CONTENT_CLASS =
  "z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95";

export const CONTEXT_MENU_INDICATOR_CLASS =
  "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center";

export type ContextMenuItemVariant = "default" | "destructive";

type InsetOptions = {
  readonly inset?: boolean | undefined;
  readonly class?: string | undefined;
};

// ---------------------------------------------------------------------------
// Parts, styled. Each takes the parts object from the ContextMenu's view.
// ---------------------------------------------------------------------------

/**
 * The trigger area: the kit's `trigger` part (the Menu's contextTrigger)
 * on an `h.div`. Chain `.children(…)` for the area's content — and draw
 * the `ContextMenuContent` inside it, as the kit's example does.
 */
export const ContextMenuTrigger = <Msg>(
  menu: ContextMenuParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => menu.trigger(h.div).attr("data-slot", "context-menu-trigger").class(cn(options.class));

/**
 * The content: the kit `positioner` (placed at the pointer, top layer,
 * no portal) wrapping the `popup` with the upstream content classes.
 * Chain `.children(items…)` on the result — they land inside the popup.
 */
export const ContextMenuContent = <Msg>(
  menu: ContextMenuParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  menu
    .positioner(h.div)
    .children(
      menu
        .popup(h.div)
        .attr("data-slot", "context-menu-content")
        .class(cn(CONTEXT_MENU_CONTENT_CLASS, options.class)),
    );

/** A group of items: the kit `group` part. `group` keys it and its label. */
export const ContextMenuGroup = <Msg, R = never>(
  menu: ContextMenuParts,
  h: Html.H<Msg>,
  options: { readonly group: string },
  children: View.Content<Msg, R>,
) =>
  menu
    .group({ element: h.div, group: options.group })
    .attr("data-slot", "context-menu-group")
    .children(children);

/** A plain item. Picking it closes the menu unless `closeOnClick` is false. */
export const ContextMenuItem = <Msg>(
  menu: ContextMenuParts,
  h: Html.H<Msg>,
  options: InsetOptions & {
    readonly value: string;
    readonly variant?: ContextMenuItemVariant | undefined;
    readonly closeOnClick?: boolean | undefined;
  },
) =>
  menu
    .item({
      element: h.div,
      value: options.value,
      closeOnClick: options.closeOnClick,
    })
    .attr("data-slot", "context-menu-item")
    .attr("data-inset", options.inset === true ? "" : undefined)
    .attr("data-variant", options.variant ?? "default")
    .class(cn(CONTEXT_MENU_ITEM_CLASS, options.class));

/**
 * A checkbox item with the upstream indicator: a left span holding the
 * kit's `checkboxItemIndicator` part, which draws only while checked,
 * with an inline Check icon inside. Checked state is NOT an option here:
 * the kit reads it from the Menu's `items` prop — the item is checked
 * when its entry there carries `checked: true`, and `Picked` reports
 * the new state (the opposite of the entry's current `checked`).
 */
export const ContextMenuCheckboxItem = <Msg, R = never>(
  menu: ContextMenuParts,
  h: Html.H<Msg>,
  options: {
    readonly value: string;
    readonly closeOnClick?: boolean | undefined;
    readonly class?: string | undefined;
  },
  children: View.Content<Msg, R>,
) =>
  menu
    .checkboxItem({
      element: h.div,
      value: options.value,
      closeOnClick: options.closeOnClick,
    })
    .attr("data-slot", "context-menu-checkbox-item")
    .class(cn(CONTEXT_MENU_CHECKBOX_ITEM_CLASS, options.class))
    .children(
      h.span
        .class(CONTEXT_MENU_INDICATOR_CLASS)
        .children(
          menu
            .checkboxItemIndicator({ element: h.span, value: options.value })
            ?.children(CheckIcon(h, { class: "size-4" }).attrs(svgAttrRemovals)),
        ),
      children,
    );

/**
 * The radio group: the kit `radioGroup` part, a plain grouping element.
 * It carries no value of its own: each radio item is checked when its
 * entry in the Menu's `items` prop carries `checked: true`, so the
 * consumer derives the entries from its Model (exactly one checked).
 * Checked state comes from the items data (Effect-TS/ui PR #474, fixing
 * issue #445, which this repo's D-8 finding reported), so build order
 * no longer matters and `children` is a plain argument again — the D-8
 * children callback this wrapper used to require is gone.
 */
export const ContextMenuRadioGroup = <Msg, R = never>(
  menu: ContextMenuParts,
  h: Html.H<Msg>,
  children: View.Content<Msg, R>,
) => menu.radioGroup(h.div).attr("data-slot", "context-menu-radio-group").children(children);

/**
 * A radio item, checked while its entry in the Menu's `items` prop
 * carries `checked: true`, with the upstream Circle indicator.
 */
export const ContextMenuRadioItem = <Msg, R = never>(
  menu: ContextMenuParts,
  h: Html.H<Msg>,
  options: {
    readonly value: string;
    readonly closeOnClick?: boolean | undefined;
    readonly class?: string | undefined;
  },
  children: View.Content<Msg, R>,
) =>
  menu
    .radioItem({
      element: h.div,
      value: options.value,
      closeOnClick: options.closeOnClick,
    })
    .attr("data-slot", "context-menu-radio-item")
    .class(cn(CONTEXT_MENU_RADIO_ITEM_CLASS, options.class))
    .children(
      h.span
        .class(CONTEXT_MENU_INDICATOR_CLASS)
        .children(
          menu
            .radioItemIndicator({ element: h.span, value: options.value })
            ?.children(CircleIcon(h, { class: "size-2 fill-current" }).attrs(svgAttrRemovals)),
        ),
      children,
    );

/**
 * A label. With a `group`, it is the kit's `groupLabel` part for that
 * group (the group's `aria-labelledby` points at it); without one, a
 * plain styled div, as a free-standing upstream Label renders.
 */
export const ContextMenuLabel = <Msg>(
  menu: ContextMenuParts,
  h: Html.H<Msg>,
  options: InsetOptions & { readonly group?: string | undefined },
) =>
  (options.group === undefined ? h.div : menu.groupLabel({ element: h.div, group: options.group }))
    .attr("data-slot", "context-menu-label")
    .attr("data-inset", options.inset === true ? "" : undefined)
    .class(cn(CONTEXT_MENU_LABEL_CLASS, options.class));

/** A separator between items: the kit `separator` part. */
export const ContextMenuSeparator = <Msg>(
  menu: ContextMenuParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  menu
    .separator(h.div)
    .attr("data-slot", "context-menu-separator")
    .class(cn(CONTEXT_MENU_SEPARATOR_CLASS, options.class));

/** A shortcut hint: a plain span, exactly as upstream renders it. */
export const ContextMenuShortcut = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  h.span
    .attr("data-slot", "context-menu-shortcut")
    .class(cn(CONTEXT_MENU_SHORTCUT_CLASS, options.class));

/**
 * The item that opens a submenu: the parent context menu's `item` part
 * stacked on the submenu's `submenuTrigger` part (the kit's documented
 * composition), with the upstream ChevronRight icon appended after the
 * children. Draw `ContextMenuSubContent` for the same submenu inside
 * the popup too.
 */
export const ContextMenuSubTrigger = <Msg, R = never>(
  menu: ContextMenuParts,
  sub: ContextMenuSubParts,
  h: Html.H<Msg>,
  options: InsetOptions & { readonly value: string },
  children: View.Content<Msg, R>,
) =>
  menu
    .item({ element: sub.submenuTrigger(h.div), value: options.value })
    .attr("data-slot", "context-menu-sub-trigger")
    .attr("data-inset", options.inset === true ? "" : undefined)
    .class(cn(CONTEXT_MENU_SUB_TRIGGER_CLASS, options.class))
    .children(children, ChevronRightIcon(h, { class: "ml-auto" }).attrs(svgAttrRemovals));

/**
 * A submenu's content: its `positioner` wrapping its `popup` with the
 * upstream sub-content classes. Place it inside the parent's popup,
 * next to the `ContextMenuSubTrigger`.
 */
export const ContextMenuSubContent = <Msg, R = never>(
  sub: ContextMenuSubParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined },
  children: View.Content<Msg, R>,
) =>
  sub
    .positioner(h.div)
    .children(
      sub
        .popup(h.div)
        .attr("data-slot", "context-menu-sub-content")
        .class(cn(CONTEXT_MENU_SUB_CONTENT_CLASS, options.class))
        .children(children),
    );
