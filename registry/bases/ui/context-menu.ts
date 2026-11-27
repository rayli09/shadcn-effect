/**
 * ContextMenu (bases generation) — shadcn/ui `context-menu` ported
 * 1:1 to Effect UI, with the class layer of upstream's bases/radix
 * generation instead of new-york-v4's.
 *
 * Same port as registry/ui/context-menu.ts — the @effect/ui-kit
 * `ContextMenu` (a function over a headless `Menu`), the wave-5
 * items-driven checked state (Effect-TS/ui PR #474), styled wrappers
 * stamping `data-slot` and classes. Only the classes differ.
 *
 * Class strings are byte-for-byte the shadcn bases/radix strings:
 * structural utilities stay inline, everything visual (padding,
 * radius, colours, focus/open states) moves to the
 * `cn-context-menu-*` hooks (plus the shared `cn-menu-target` /
 * `cn-menu-translucent` menu-surface hooks), which the style presets
 * (registry/styles/style-*.css) fill in. The parity checker asserts
 * every token in `parity/bases-tokens.json["context-menu"]`.
 *
 * Anatomy diffs vs the new-york port, declared: the trigger gains a
 * class string (`cn-context-menu-trigger select-none` — new-york's
 * trigger was unstyled); items key their disabled state off the
 * `data-disabled:` variant instead of `data-[disabled]:`; the item
 * indicator span is positioned by the preset's
 * `cn-context-menu-item-indicator` hook (right side) instead of the
 * inline `absolute left-2 …` classes; the radio item's indicator icon
 * is upstream bases' Check, not new-york's Circle; the sub-trigger
 * chevron carries `cn-rtl-flip` so presets can mirror it in RTL.
 *
 * Upstream: React + Radix ContextMenu. Here: the @effect/ui-kit
 * `ContextMenu`, which is a function over a headless `Menu`: the parts,
 * events, items, submenus, focus and transitions are the Menu's, its
 * `trigger` part is the area a right click (or a 500ms touch long press)
 * opens the menu at the pointer from, and it is always modal. These
 * wrappers apply the parts and stamp the upstream `data-slot` attributes
 * and class strings (byte-for-byte bases/radix) on them.
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
 * - The bases class strings keep the `--radix-*` sizing/origin
 *   variables (`max-h-(--radix-*)`, `origin-(--radix-*)`) verbatim for
 *   parity, but the kit emits `data-open` / `data-closed` /
 *   `data-popup-open` and sets `--transform-origin` /
 *   `--available-height` on the positioner instead — so the
 *   `max-h-(--radix-*)` / `origin-(--radix-*)` utilities are inert as
 *   written. Everything else visual lives in the presets, which key
 *   off the kit's own attributes.
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
import { CheckIcon, ChevronRightIcon } from "@/lib/icons";
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
// Icons — the shared builders in @/lib/icons (inline Lucide SVG; the
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
// Class strings — byte-for-byte shadcn bases/radix.
// ---------------------------------------------------------------------------

export const CONTEXT_MENU_TRIGGER_CLASS = "cn-context-menu-trigger select-none";

export const CONTEXT_MENU_CONTENT_CLASS =
  "cn-context-menu-content cn-menu-target cn-menu-translucent z-50 max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto";

export const CONTEXT_MENU_ITEM_CLASS =
  "cn-context-menu-item group/context-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

export const CONTEXT_MENU_CHECKBOX_ITEM_CLASS =
  "cn-context-menu-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

export const CONTEXT_MENU_RADIO_ITEM_CLASS =
  "cn-context-menu-radio-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

export const CONTEXT_MENU_LABEL_CLASS = "cn-context-menu-label";

export const CONTEXT_MENU_SEPARATOR_CLASS = "cn-context-menu-separator";

export const CONTEXT_MENU_SHORTCUT_CLASS = "cn-context-menu-shortcut";

export const CONTEXT_MENU_SUB_TRIGGER_CLASS =
  "cn-context-menu-sub-trigger flex cursor-default items-center outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0";

export const CONTEXT_MENU_SUB_CONTENT_CLASS =
  "cn-context-menu-sub-content cn-menu-target cn-menu-translucent z-50 origin-(--radix-context-menu-content-transform-origin) overflow-hidden";

export const CONTEXT_MENU_INDICATOR_CLASS = "cn-context-menu-item-indicator pointer-events-none";

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
) =>
  menu
    .trigger(h.div)
    .attr("data-slot", "context-menu-trigger")
    .class(cn(CONTEXT_MENU_TRIGGER_CLASS, options.class));

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
  children: View.Content<Msg, R> | ReadonlyArray<View.Content<Msg, R>>,
) =>
  menu
    .group({ element: h.div, group: options.group })
    .attr("data-slot", "context-menu-group")
    .children(...(Array.isArray(children) ? children : [children]));

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
  children: View.Content<Msg, R> | ReadonlyArray<View.Content<Msg, R>>,
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
            ?.children(CheckIcon(h).attrs(svgAttrRemovals)),
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
  children: View.Content<Msg, R> | ReadonlyArray<View.Content<Msg, R>>,
) =>
  menu
    .radioGroup(h.div)
    .attr("data-slot", "context-menu-radio-group")
    .children(...(Array.isArray(children) ? children : [children]));

/**
 * A radio item, checked while its entry in the Menu's `items` prop
 * carries `checked: true`, with the upstream Check indicator (bases
 * renders a check for radio items too, not new-york's circle).
 */
export const ContextMenuRadioItem = <Msg, R = never>(
  menu: ContextMenuParts,
  h: Html.H<Msg>,
  options: {
    readonly value: string;
    readonly closeOnClick?: boolean | undefined;
    readonly class?: string | undefined;
  },
  children: View.Content<Msg, R> | ReadonlyArray<View.Content<Msg, R>>,
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
            ?.children(CheckIcon(h).attrs(svgAttrRemovals)),
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
  children: View.Content<Msg, R> | ReadonlyArray<View.Content<Msg, R>>,
) =>
  menu
    .item({ element: sub.submenuTrigger(h.div), value: options.value })
    .attr("data-slot", "context-menu-sub-trigger")
    .attr("data-inset", options.inset === true ? "" : undefined)
    .class(cn(CONTEXT_MENU_SUB_TRIGGER_CLASS, options.class))
    .children(
      children,
      ChevronRightIcon(h, { class: "cn-rtl-flip ml-auto" }).attrs(svgAttrRemovals),
    );

/**
 * A submenu's content: its `positioner` wrapping its `popup` with the
 * upstream sub-content classes. Place it inside the parent's popup,
 * next to the `ContextMenuSubTrigger`.
 */
export const ContextMenuSubContent = <Msg, R = never>(
  sub: ContextMenuSubParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined },
  children: View.Content<Msg, R> | ReadonlyArray<View.Content<Msg, R>>,
) =>
  sub.positioner(h.div).children(
    sub
      .popup(h.div)
      .attr("data-slot", "context-menu-sub-content")
      .class(cn(CONTEXT_MENU_SUB_CONTENT_CLASS, options.class))
      .children(...(Array.isArray(children) ? children : [children])),
  );
