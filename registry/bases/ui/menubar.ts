/**
 * Menubar (bases generation) — shadcn/ui `menubar` ported 1:1 to
 * Effect UI, with the class layer of upstream's bases/radix generation
 * instead of new-york-v4's.
 *
 * Same port as registry/ui/menubar.ts — the @effect/ui-kit `Menubar`
 * headless component for the bar and an ordinary kit `Menu` per menu,
 * the wave-5 items-driven checked state (Effect-TS/ui PR #474),
 * styled wrappers stamping `data-slot` and classes. Only the classes
 * differ.
 *
 * Class strings are byte-for-byte the shadcn bases/radix strings:
 * structural utilities stay inline, everything visual (padding,
 * radius, colours, focus/open states) moves to the `cn-menubar-*`
 * hooks (plus the shared `cn-menu-target` / `cn-menu-translucent`
 * menu-surface hooks), which the style presets
 * (registry/styles/style-*.css) fill in. The parity checker asserts
 * every token in `parity/bases-tokens.json["menubar"]`.
 *
 * Anatomy diffs vs the new-york port, declared: the bar itself is
 * just `cn-menubar flex items-center` (height, border, background and
 * shadow are the preset's now); the checkbox and radio indicators get
 * distinct hooks (`cn-menubar-checkbox-item-indicator` /
 * `cn-menubar-radio-item-indicator`), so the single
 * `MENUBAR_INDICATOR_CLASS` constant is replaced by
 * `MENUBAR_CHECKBOX_INDICATOR_CLASS` / `MENUBAR_RADIO_INDICATOR_CLASS`;
 * items key their disabled state off the `data-disabled:` variant
 * instead of `data-[disabled]:`; the radio item's indicator icon is
 * upstream bases' Check, not new-york's Circle; the sub-trigger
 * chevron carries `cn-rtl-flip` so presets can mirror it in RTL.
 *
 * Upstream: React + Radix Menubar (Root / Menu / Trigger / Content /
 * Item / CheckboxItem / RadioGroup / RadioItem / Label / Separator /
 * Shortcut / Sub / SubTrigger / SubContent). Here: the @effect/ui-kit
 * `Menubar` headless component for the bar itself, and an ordinary kit
 * `Menu` for each menu inside it — which is exactly how the kit's own
 * Menubar example composes them. The bar keeps one trigger in the Tab
 * order, moves focus between triggers, and tells each Menu inside that
 * it sits in a menubar; each menu keeps its own parts and events. These
 * wrappers apply the parts and stamp the upstream `data-slot`
 * attributes and class strings (byte-for-byte bases/radix) on them.
 *
 * How the upstream anatomy maps:
 *
 * - `Menubar` (Root) is the styled wrapper below over the kit `Menubar`:
 *   it draws the bar's `root` part with the upstream classes and draws
 *   the consumer's menus (from the `view` closure) inside it.
 * - `MenubarMenu` is a kit `Menu` call drawn inside the root. Re-exported
 *   below. Keep which menu is open as one value in your Model, as the
 *   kit's Menubar example does, and give each menu a `key`.
 * - `MenubarPortal` has NO counterpart and is not exported: the kit
 *   positioner is a manual popover in the browser top layer, so no
 *   portal is needed.
 * - `MenubarSub` is another kit `Menu` call with `parentItem` set,
 *   drawn inside its parent menu's popup. Re-exported below as `Menu`.
 * - Upstream Content's `align = "start"`, `alignOffset = -4` and
 *   `sideOffset = 8` defaults are Positioning props on the kit Menu
 *   call (`align`, `alignOffset`, `sideOffset` in `props`), not on the
 *   part. A menu's own `modal`, `openOnHover` and `delay` don't apply
 *   in a menubar — the bar's `modal` prop governs.
 * - Item `disabled` comes from each Menu's `items` prop, not the part,
 *   and so does checked state: a checkbox or radio item is checked when
 *   its `items` entry carries `checked: true` (Effect-TS/ui PR #474).
 *
 * Declared divergences (see docs/PORTING-RULES.md):
 *
 * - The bases class strings keep the `--radix-*` origin variables
 *   (`origin-(--radix-*)`) verbatim for parity, but the kit emits
 *   `data-open` / `data-closed` / `data-popup-open` (and
 *   `data-instant="group"` when the open menu moves between triggers)
 *   and sets `--transform-origin` on the positioner instead — so the
 *   `origin-(--radix-*)` utilities are inert as written. Everything
 *   else visual lives in the presets, which key off the kit's own
 *   attributes.
 * - `MenubarLabel` is the kit's `groupLabel` part when a `group` is
 *   given (a label names its group for `aria-labelledby`); without one
 *   it is a plain styled `h.div`, as a free-standing Radix Label renders.
 */
import type * as Component from "@effect/ui/Component";
import type { Html } from "@effect/ui/html";
import type * as View from "@effect/ui/View";
import {
  Menu,
  Menubar as KitMenubar,
  type MenubarProps,
  type MenuTriggerElement,
  type MenuTriggerOptions,
} from "@effect/ui-kit";
import { CheckIcon, ChevronRightIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

/** What the kit `Menubar`'s view receives: its `root` part and plain values. */
export type MenubarParts = Component.Headless.Parts<typeof KitMenubar>;

/** What a kit `Menu`'s view receives — the parts of one menu inside the bar, or of a submenu. */
export type MenubarMenuParts = Component.Headless.Parts<typeof Menu>;

/** The kit `Menubar` props (orientation, modal, disabled, loopFocus). */
export type { MenubarProps };

/** One menu of the bar: a kit `Menu` call drawn inside the root. */
export const MenubarMenu = Menu;

/** A submenu: a kit `Menu` call with `parentItem` set to the parent item's value. */
export const MenubarSub = Menu;

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

export const MENUBAR_CLASS = "cn-menubar flex items-center";

export const MENUBAR_TRIGGER_CLASS =
  "cn-menubar-trigger flex items-center outline-hidden select-none";

export const MENUBAR_CONTENT_CLASS =
  "cn-menubar-content cn-menu-target cn-menu-translucent z-50 origin-(--radix-menubar-content-transform-origin) overflow-hidden";

export const MENUBAR_ITEM_CLASS =
  "cn-menubar-item group/menubar-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0";

export const MENUBAR_CHECKBOX_ITEM_CLASS =
  "cn-menubar-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0";

export const MENUBAR_RADIO_ITEM_CLASS =
  "cn-menubar-radio-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0";

export const MENUBAR_LABEL_CLASS = "cn-menubar-label";

export const MENUBAR_SEPARATOR_CLASS = "cn-menubar-separator -mx-1 my-1 h-px";

export const MENUBAR_SHORTCUT_CLASS = "cn-menubar-shortcut ml-auto";

export const MENUBAR_SUB_TRIGGER_CLASS =
  "cn-menubar-sub-trigger flex cursor-default items-center outline-none select-none";

export const MENUBAR_SUB_CONTENT_CLASS =
  "cn-menubar-sub-content cn-menu-target cn-menu-translucent z-50 origin-(--radix-menubar-content-transform-origin) overflow-hidden";

export const MENUBAR_CHECKBOX_INDICATOR_CLASS =
  "cn-menubar-checkbox-item-indicator pointer-events-none absolute flex items-center justify-center";

export const MENUBAR_RADIO_INDICATOR_CLASS =
  "cn-menubar-radio-item-indicator pointer-events-none absolute flex items-center justify-center";

export type MenubarItemVariant = "default" | "destructive";

type InsetOptions = {
  readonly inset?: boolean | undefined;
  readonly class?: string | undefined;
};

// ---------------------------------------------------------------------------
// The bar itself.
// ---------------------------------------------------------------------------

/**
 * The bar: the kit `Menubar` with its `root` part drawn with the
 * upstream classes. Draw each menu inside the `view` closure — the
 * closure's content lands inside the root, where the bar finds its
 * triggers in document order:
 *
 *   Menubar(h, {
 *     view: (bar) => menus.map((m) => MenubarMenu(h, { key: m.name, ... }))
 *   })
 */
export const Menubar = <Msg, RV = never>(
  h: Html.H<Msg>,
  options: {
    readonly props?: MenubarProps | undefined;
    readonly class?: string | undefined;
    readonly view: (bar: MenubarParts) => View.Children<Msg, RV>;
  },
) =>
  KitMenubar(h, {
    props: options.props ?? {},
    view: (bar) =>
      bar
        .root(h.div)
        .attr("data-slot", "menubar")
        .class(cn(MENUBAR_CLASS, options.class))
        .children(options.view(bar)),
  });

// ---------------------------------------------------------------------------
// Parts of one menu inside the bar, styled. Each takes the parts object
// from that menu's view closure.
// ---------------------------------------------------------------------------

/**
 * A menu's trigger inside the bar: the kit Menu's `trigger` part on an
 * `h.button` (or a stacked `element`). Chain `.children(name)`.
 */
export const MenubarTrigger = <Msg, R = never>(
  menu: MenubarMenuParts,
  h: Html.H<Msg>,
  options: MenuTriggerOptions & {
    readonly element?: MenuTriggerElement<Msg, R> | undefined;
    readonly class?: string | undefined;
  } = {},
) => {
  const { class: className, element, ...triggerOptions } = options;
  return menu
    .trigger({ ...triggerOptions, element: element ?? h.button })
    .attr("data-slot", "menubar-trigger")
    .class(cn(MENUBAR_TRIGGER_CLASS, className));
};

/**
 * A menu's content: the kit `positioner` (top layer, no portal) wrapping
 * the `popup` with the upstream content classes. Chain `.children(…)`
 * on the result — they land inside the popup. Set the upstream defaults
 * `align: "start"`, `alignOffset: -4`, `sideOffset: 8` as Positioning
 * props on the menu call.
 */
export const MenubarContent = <Msg>(
  menu: MenubarMenuParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  menu
    .positioner(h.div)
    .children(
      menu
        .popup(h.div)
        .attr("data-slot", "menubar-content")
        .class(cn(MENUBAR_CONTENT_CLASS, options.class)),
    );

/** A group of items in one menu: the kit `group` part. `group` keys it and its label. */
export const MenubarGroup = <Msg, R = never>(
  menu: MenubarMenuParts,
  h: Html.H<Msg>,
  options: { readonly group: string },
  children: View.Content<Msg, R> | ReadonlyArray<View.Content<Msg, R>>,
) =>
  menu
    .group({ element: h.div, group: options.group })
    .attr("data-slot", "menubar-group")
    .children(...(Array.isArray(children) ? children : [children]));

/** A plain item. Picking it closes the menu unless `closeOnClick` is false. */
export const MenubarItem = <Msg>(
  menu: MenubarMenuParts,
  h: Html.H<Msg>,
  options: InsetOptions & {
    readonly value: string;
    readonly variant?: MenubarItemVariant | undefined;
    readonly closeOnClick?: boolean | undefined;
  },
) =>
  menu
    .item({
      element: h.div,
      value: options.value,
      closeOnClick: options.closeOnClick,
    })
    .attr("data-slot", "menubar-item")
    .attr("data-inset", options.inset === true ? "" : undefined)
    .attr("data-variant", options.variant ?? "default")
    .class(cn(MENUBAR_ITEM_CLASS, options.class));

/**
 * A checkbox item with the upstream indicator: a left span holding the
 * kit's `checkboxItemIndicator` part, which draws only while checked,
 * with an inline Check icon inside. Checked state is NOT an option here:
 * the kit reads it from the Menu's `items` prop — the item is checked
 * when its entry there carries `checked: true`, and `Picked` reports
 * the new state (the opposite of the entry's current `checked`).
 */
export const MenubarCheckboxItem = <Msg, R = never>(
  menu: MenubarMenuParts,
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
    .attr("data-slot", "menubar-checkbox-item")
    .class(cn(MENUBAR_CHECKBOX_ITEM_CLASS, options.class))
    .children(
      h.span
        .class(MENUBAR_CHECKBOX_INDICATOR_CLASS)
        .children(
          menu
            .checkboxItemIndicator({ element: h.span, value: options.value })
            ?.children(CheckIcon(h).attrs(svgAttrRemovals)),
        ),
      children,
    );

/**
 * The radio group of one menu: the kit `radioGroup` part, a plain
 * grouping element. It carries no value of its own: each radio item is
 * checked when its entry in the Menu's `items` prop carries
 * `checked: true`, so the consumer derives the entries from its Model
 * (exactly one checked). Checked state comes from the items data
 * (Effect-TS/ui PR #474, fixing issue #445, which this repo's D-8
 * finding reported), so build order no longer matters and `children`
 * is a plain argument again — the D-8 children callback this wrapper
 * used to require is gone.
 */
export const MenubarRadioGroup = <Msg, R = never>(
  menu: MenubarMenuParts,
  h: Html.H<Msg>,
  children: View.Content<Msg, R> | ReadonlyArray<View.Content<Msg, R>>,
) =>
  menu
    .radioGroup(h.div)
    .attr("data-slot", "menubar-radio-group")
    .children(...(Array.isArray(children) ? children : [children]));

/**
 * A radio item, checked while its entry in the Menu's `items` prop
 * carries `checked: true`, with the upstream Check indicator (bases
 * renders a check for radio items too, not new-york's circle).
 */
export const MenubarRadioItem = <Msg, R = never>(
  menu: MenubarMenuParts,
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
    .attr("data-slot", "menubar-radio-item")
    .class(cn(MENUBAR_RADIO_ITEM_CLASS, options.class))
    .children(
      h.span
        .class(MENUBAR_RADIO_INDICATOR_CLASS)
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
export const MenubarLabel = <Msg>(
  menu: MenubarMenuParts,
  h: Html.H<Msg>,
  options: InsetOptions & { readonly group?: string | undefined },
) =>
  (options.group === undefined ? h.div : menu.groupLabel({ element: h.div, group: options.group }))
    .attr("data-slot", "menubar-label")
    .attr("data-inset", options.inset === true ? "" : undefined)
    .class(cn(MENUBAR_LABEL_CLASS, options.class));

/** A separator between items: the kit `separator` part. */
export const MenubarSeparator = <Msg>(
  menu: MenubarMenuParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  menu
    .separator(h.div)
    .attr("data-slot", "menubar-separator")
    .class(cn(MENUBAR_SEPARATOR_CLASS, options.class));

/** A shortcut hint: a plain span, exactly as upstream renders it. */
export const MenubarShortcut = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => h.span.attr("data-slot", "menubar-shortcut").class(cn(MENUBAR_SHORTCUT_CLASS, options.class));

/**
 * The item that opens a submenu: the parent menu's `item` part stacked
 * on the submenu's `submenuTrigger` part (the kit's documented
 * composition), with the upstream ChevronRight icon appended after the
 * children. Draw `MenubarSubContent` for the same submenu inside the
 * popup too.
 */
export const MenubarSubTrigger = <Msg, R = never>(
  menu: MenubarMenuParts,
  sub: MenubarMenuParts,
  h: Html.H<Msg>,
  options: InsetOptions & { readonly value: string },
  children: View.Content<Msg, R> | ReadonlyArray<View.Content<Msg, R>>,
) =>
  menu
    .item({ element: sub.submenuTrigger(h.div), value: options.value })
    .attr("data-slot", "menubar-sub-trigger")
    .attr("data-inset", options.inset === true ? "" : undefined)
    .class(cn(MENUBAR_SUB_TRIGGER_CLASS, options.class))
    .children(
      children,
      ChevronRightIcon(h, { class: "cn-rtl-flip ml-auto size-4" }).attrs(svgAttrRemovals),
    );

/**
 * A submenu's content: its `positioner` wrapping its `popup` with the
 * upstream sub-content classes. Place it inside the parent menu's
 * popup, next to the `MenubarSubTrigger`.
 */
export const MenubarSubContent = <Msg, R = never>(
  sub: MenubarMenuParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined },
  children: View.Content<Msg, R> | ReadonlyArray<View.Content<Msg, R>>,
) =>
  sub.positioner(h.div).children(
    sub
      .popup(h.div)
      .attr("data-slot", "menubar-sub-content")
      .class(cn(MENUBAR_SUB_CONTENT_CLASS, options.class))
      .children(...(Array.isArray(children) ? children : [children])),
  );
