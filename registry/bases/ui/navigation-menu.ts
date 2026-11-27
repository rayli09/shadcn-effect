/**
 * NavigationMenu (bases generation) — shadcn/ui `navigation-menu`
 * ported 1:1 to Effect UI, with the class layer of upstream's
 * bases/radix generation instead of new-york-v4's.
 *
 * Same port as registry/ui/navigation-menu.ts — the @effect/ui-kit
 * `NavigationMenu` headless component and its parts, styled wrappers
 * stamping `data-slot` and classes. Only the classes differ.
 *
 * Class strings are byte-for-byte the shadcn bases/radix strings:
 * structural utilities stay inline, everything visual (padding,
 * colours, hover/focus states, the trigger chevron's rotation,
 * panel/viewport/indicator styling) moves to the
 * `cn-navigation-menu-*` hooks, which the style presets
 * (registry/styles/style-*.css) fill in. The parity checker asserts
 * every token in `parity/bases-tokens.json["navigation-menu"]`.
 *
 * Anatomy diffs vs the new-york port, declared: the list loses its
 * inline `gap-1` (the preset owns spacing); the trigger style is the
 * bases cva base — hook + group + layout utilities only, with no
 * colour/typography tokens inline; the link string is the bare
 * `cn-navigation-menu-link` hook; the viewport sizes with the
 * `h-(--radix-…)` / `md:w-(--radix-…)` utility form instead of
 * `h-[var(--radix-…)]`.
 *
 * Upstream: React + Radix NavigationMenu (Root / List / Item / Trigger /
 * Content / Viewport / Link / Indicator). Here: the @effect/ui-kit
 * `NavigationMenu` headless component and its parts. These wrappers apply
 * the parts and stamp the upstream `data-slot` attributes and class
 * strings (byte-for-byte bases/radix) on them, in the launch example's
 * idiom: style the element, apply the part, chain `.children`.
 *
 * How the upstream anatomy maps:
 *
 * - `NavigationMenu` (Root) is the styled wrapper below over the kit
 *   `NavigationMenu`: it draws the kit's `root` part (`<nav>`) with the
 *   upstream classes and `data-viewport`, and draws the consumer's view
 *   (from the `view` closure) inside it. The kit's only prop is
 *   `orientation` ("horizontal" by default; "vertical" swaps the list's
 *   arrow keys to Down/Up).
 * - `NavigationMenuList` / `NavigationMenuItem` / `NavigationMenuLink`
 *   are the kit's `list` / `item` / `link` parts, styled. Elements match
 *   upstream: `<ul>`, `<li>`, `<a>`. Which link is current is the
 *   consumer's to say (usually from the route): pass `active` and the
 *   kit writes `aria-current="page"` and `data-active`.
 * - `navigationMenuTriggerStyle` is upstream's cva export as a pure
 *   function: it returns the trigger class string, no cva.
 * - `NavigationMenuTrigger` is a PRESENTATIONAL view function: a styled
 *   `<button>` carrying the trigger style, the `group` class and the
 *   ChevronDown icon, exactly the markup upstream renders. See the
 *   divergences — it opens nothing on its own.
 *
 * Declared divergences (see docs/PORTING-RULES.md):
 *
 * - The kit `NavigationMenu` is a navigation landmark, NOT Radix's
 *   dropdown-panel system: it owns arrow-key focus movement between the
 *   links of a list and the current link's ARIA, and it has no open
 *   state, no panels, no positioning and no events. Behavior parity for
 *   what the kit does model (keyboard, `aria-current`) is the kit's;
 *   Radix's hover/click panel behavior has no counterpart here.
 * - `NavigationMenuContent`, `NavigationMenuViewport` and
 *   `NavigationMenuIndicator` are NOT exported as components: upstream
 *   they render only in response to a panel being open, state the kit
 *   doesn't have, so in the kit world those elements never render
 *   (the same treatment as `DropdownMenuPortal`; likewise
 *   `data-slot="navigation-menu-content"`,
 *   `data-slot="navigation-menu-viewport"` and
 *   `data-slot="navigation-menu-indicator"` are absent — no element ever
 *   carries them here). Their class strings
 *   are exported verbatim as the `NAVIGATION_MENU_CONTENT_CLASS` /
 *   `NAVIGATION_MENU_VIEWPORT_CLASS` (+ wrapper) /
 *   `NAVIGATION_MENU_INDICATOR_CLASS` (+ inner) constants, for consumers
 *   composing a panel from other kit primitives (e.g. Popover or Menu)
 *   under a `NavigationMenuTrigger`-styled button. Note the viewport
 *   classes size off `--radix-navigation-menu-viewport-height` /
 *   `--radix-navigation-menu-viewport-width`, variables nothing in the
 *   kit ever sets.
 * - `NavigationMenuTrigger` opens nothing: the kit has no trigger part.
 *   Wire it as the `element` of a kit Menu/Popover trigger part, or use
 *   it as a plain nav button; the panel is the consumer's composition.
 * - The root's `data-viewport` attribute is kept (option `viewport`,
 *   default `true`, as upstream), but with no Viewport/Content ported
 *   the `group-data-[viewport=false]/navigation-menu:` variants in the
 *   content classes have nothing to act on.
 * - Link `active`: the kit writes `data-active` as a flag (present with
 *   an empty value) where Radix writes `data-active="true"`, so the
 *   wrapper re-stamps `data-active="true"` after the part is applied —
 *   an attribute chained after a part is the consumer's to answer for,
 *   per the kit docs — keeping the value the presets' `data-active`
 *   selectors expect (D-5 bridge). The kit also writes its own internal
 *   `data-navigation-menu-link` attribute on links, which upstream
 *   doesn't have.
 * - The bases class strings drop the `data-[state=open]` /
 *   `data-[motion=…]` animation utilities the new-york strings carried
 *   inline — that styling lives in the presets now, keyed on
 *   `data-open` / `data-popup-open` of a real panel system. The kit
 *   emits neither here, so the preset's trigger-chevron rotation
 *   (`group-data-open/…:rotate-180`) and panel animations stay inert
 *   in this port (D-5); the panel itself remains the consumer's
 *   composition, per the Content/Viewport divergence above.
 */
import type * as Component from "@effect/ui/Component";
import type { Html } from "@effect/ui/html";
import type * as View from "@effect/ui/View";
import { NavigationMenu as KitNavigationMenu, type NavigationMenuProps } from "@effect/ui-kit";
import { ChevronDownIcon as SharedChevronDownIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

/** What a kit `NavigationMenu`'s view receives: its parts and plain values. */
export type NavigationMenuParts = Component.Headless.Parts<typeof KitNavigationMenu>;

/** The kit `NavigationMenu` props (orientation). */
export type { NavigationMenuProps };

// ---------------------------------------------------------------------------
// Lucide icons from the shared @/lib/icons builders (ISC path data;
// the lucide-react package is banned). The shared builder also stamps
// lucide's `xmlns` / `width` / `height` defaults, which the file-local
// builder it replaced omitted.
// ---------------------------------------------------------------------------

const ChevronDownIcon = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  SharedChevronDownIcon(h, {
    class: options.class ?? NAVIGATION_MENU_TRIGGER_ICON_CLASS,
  });

// ---------------------------------------------------------------------------
// Class strings — byte-for-byte shadcn bases/radix.
// ---------------------------------------------------------------------------

export const NAVIGATION_MENU_CLASS =
  "cn-navigation-menu group/navigation-menu relative flex max-w-max flex-1 items-center justify-center";

export const NAVIGATION_MENU_LIST_CLASS =
  "cn-navigation-menu-list group flex flex-1 list-none items-center justify-center";

export const NAVIGATION_MENU_ITEM_CLASS = "cn-navigation-menu-item relative";

export const NAVIGATION_MENU_TRIGGER_CLASS =
  "cn-navigation-menu-trigger group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center outline-none disabled:pointer-events-none";

export const NAVIGATION_MENU_TRIGGER_ICON_CLASS = "cn-navigation-menu-trigger-icon";

export const NAVIGATION_MENU_CONTENT_CLASS =
  "cn-navigation-menu-content top-0 left-0 w-full group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none md:absolute md:w-auto";

export const NAVIGATION_MENU_VIEWPORT_WRAPPER_CLASS =
  "cn-navigation-menu-viewport-wrapper absolute top-full left-0 isolate z-50 flex justify-center";

export const NAVIGATION_MENU_VIEWPORT_CLASS =
  "cn-navigation-menu-viewport origin-top-center relative mt-1.5 h-(--radix-navigation-menu-viewport-height) w-full overflow-hidden md:w-(--radix-navigation-menu-viewport-width)";

export const NAVIGATION_MENU_LINK_CLASS = "cn-navigation-menu-link";

export const NAVIGATION_MENU_INDICATOR_CLASS =
  "cn-navigation-menu-indicator top-full z-1 flex h-1.5 items-end justify-center overflow-hidden";

export const NAVIGATION_MENU_INDICATOR_INNER_CLASS =
  "cn-navigation-menu-indicator-arrow relative top-[60%] h-2 w-2 rotate-45";

/**
 * Upstream's cva export as a pure function: the trigger class string,
 * with an optional extra class appended (no cva, per PORTING-RULES).
 */
export const navigationMenuTriggerStyle = (
  options: { readonly class?: string | undefined } = {},
): string => cn(NAVIGATION_MENU_TRIGGER_CLASS, options.class);

// ---------------------------------------------------------------------------
// The root.
// ---------------------------------------------------------------------------

/**
 * The root: the kit `NavigationMenu` with its `root` part drawn with the
 * upstream classes. Draw the list inside the `view` closure — the
 * closure's content lands inside the root `<nav>`:
 *
 *   NavigationMenu(h, {
 *     view: (nav) =>
 *       NavigationMenuList(nav, h).children(
 *         NavigationMenuItem(nav, h).children(
 *           NavigationMenuLink(nav, h, { active: path === "/" }).children("Home")
 *         )
 *       )
 *   })
 *
 * Naming the landmark is the consumer's job: chain `aria-label` /
 * `aria-labelledby` on the root via the kit call's view if the page has
 * more than one `<nav>`.
 */
export const NavigationMenu = <Msg, RV = never>(
  h: Html.H<Msg>,
  options: {
    readonly props?: NavigationMenuProps | undefined;
    readonly viewport?: boolean | undefined;
    readonly class?: string | undefined;
    readonly view: (nav: NavigationMenuParts) => View.Content<Msg, RV>;
  },
) =>
  KitNavigationMenu(h, {
    props: options.props ?? {},
    view: (nav) =>
      nav
        .root(h.nav)
        .attr("data-slot", "navigation-menu")
        .attr("data-viewport", (options.viewport ?? true) ? "true" : "false")
        .class(cn(NAVIGATION_MENU_CLASS, options.class))
        .children(options.view(nav)),
  });

// ---------------------------------------------------------------------------
// Parts, styled. Each takes the parts object from the view closure.
// ---------------------------------------------------------------------------

/** The list of items: the kit `list` part on an `h.ul`. */
export const NavigationMenuList = <Msg>(
  nav: NavigationMenuParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  nav
    .list(h.ul)
    .attr("data-slot", "navigation-menu-list")
    .class(cn(NAVIGATION_MENU_LIST_CLASS, options.class));

/** One item of the list: the kit `item` part on an `h.li`. */
export const NavigationMenuItem = <Msg>(
  nav: NavigationMenuParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  nav
    .item(h.li)
    .attr("data-slot", "navigation-menu-item")
    .class(cn(NAVIGATION_MENU_ITEM_CLASS, options.class));

/**
 * An `<a>` builder: what `NavigationMenuLink` accepts as `element`, from
 * the caller's `h.a`, and what it returns.
 */
export type NavigationMenuLinkElement<Msg, R = never> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"a">,
  HTMLAnchorElement,
  "a"
>;

/**
 * A link: the kit `link` part. Set `href` on the `element` (an `h.a`, or
 * your router's link builder); `active` marks it as the current page —
 * the kit writes `aria-current="page"`, and the wrapper re-stamps
 * `data-active="true"` after the part so the value the presets'
 * `data-active` selectors expect is present (see the header).
 */
export const NavigationMenuLink = <Msg, R = never>(
  nav: NavigationMenuParts,
  h: Html.H<Msg>,
  options: {
    readonly element?: NavigationMenuLinkElement<Msg, R> | undefined;
    readonly active?: boolean | undefined;
    readonly class?: string | undefined;
  } = {},
) => {
  const element: NavigationMenuLinkElement<Msg, R> = options.element ?? h.a;
  return nav
    .link({ element, active: options.active === true })
    .attr("data-slot", "navigation-menu-link")
    .attr("data-active", options.active === true ? "true" : undefined)
    .class(cn(NAVIGATION_MENU_LINK_CLASS, options.class));
};

/**
 * The trigger, PRESENTATIONAL only: a styled `h.button` with the trigger
 * style, the `group` class and the ChevronDown icon appended after the
 * children, exactly as upstream renders it. The kit has no trigger part
 * and no panel for it to open — stack it as the `element` of a kit
 * Menu/Popover trigger, or use it as a plain nav button (see header).
 */
export const NavigationMenuTrigger = <Msg, R = never>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
  children: View.Content<Msg, R>,
) =>
  h.button
    .attr("data-slot", "navigation-menu-trigger")
    .class(cn(navigationMenuTriggerStyle(), "group", options.class))
    .children(children, " ", ChevronDownIcon(h));
