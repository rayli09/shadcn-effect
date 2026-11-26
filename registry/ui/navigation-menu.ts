/**
 * NavigationMenu — shadcn/ui `navigation-menu` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix NavigationMenu (Root / List / Item / Trigger /
 * Content / Viewport / Link / Indicator). Here: the @effect/ui-kit
 * `NavigationMenu` headless component and its parts. These wrappers apply
 * the parts and stamp the upstream `data-slot` attributes and class
 * strings (byte-for-byte new-york-v4) on them, in the launch example's
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
 *   per the kit docs — keeping upstream's `data-[active=true]:`
 *   variants live (D-5 bridge). The kit also writes its own internal
 *   `data-navigation-menu-link` attribute on links, which upstream
 *   doesn't have.
 * - The class strings keep Radix's `data-[state=open]` /
 *   `data-[motion=…]` tokens verbatim for parity, but the kit emits no
 *   `data-state` / `data-motion` on anything here — so the trigger's
 *   `data-[state=open]:` variants, the chevron's
 *   `group-data-[state=open]:rotate-180` and the content/viewport/
 *   indicator animation utilities are inert as written (D-5); key
 *   animation CSS off the kit's attributes in your theme.
 */
import type * as Component from "@effect/ui/Component";
import type { Html } from "@effect/ui/html";
import type * as View from "@effect/ui/View";
import { NavigationMenu as KitNavigationMenu, type NavigationMenuProps } from "@effect/ui-kit";
import { ChevronDownIcon as SharedChevronDownIcon } from "../lib/icons.ts";
import { cn } from "../lib/utils.ts";

/** What a kit `NavigationMenu`'s view receives: its parts and plain values. */
export type NavigationMenuParts = Component.Headless.Parts<typeof KitNavigationMenu>;

/** The kit `NavigationMenu` props (orientation). */
export type { NavigationMenuProps };

// ---------------------------------------------------------------------------
// Lucide icons from the shared `../lib/icons.ts` builders (ISC path data;
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
// Class strings — byte-for-byte shadcn new-york-v4.
// ---------------------------------------------------------------------------

export const NAVIGATION_MENU_CLASS =
  "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center";

export const NAVIGATION_MENU_LIST_CLASS =
  "group flex flex-1 list-none items-center justify-center gap-1";

export const NAVIGATION_MENU_ITEM_CLASS = "relative";

export const NAVIGATION_MENU_TRIGGER_CLASS =
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-[color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50 data-[state=open]:text-accent-foreground data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent";

export const NAVIGATION_MENU_TRIGGER_ICON_CLASS =
  "relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180";

export const NAVIGATION_MENU_CONTENT_CLASS =
  "top-0 left-0 w-full p-2 pr-2.5 data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out md:absolute md:w-auto group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95";

export const NAVIGATION_MENU_VIEWPORT_WRAPPER_CLASS =
  "absolute top-full left-0 isolate z-50 flex justify-center";

export const NAVIGATION_MENU_VIEWPORT_CLASS =
  "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]";

export const NAVIGATION_MENU_LINK_CLASS =
  "flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground data-[active=true]:hover:bg-accent data-[active=true]:focus:bg-accent [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground";

export const NAVIGATION_MENU_INDICATOR_CLASS =
  "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in";

export const NAVIGATION_MENU_INDICATOR_INNER_CLASS =
  "relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md";

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
 * `data-active="true"` after the part so upstream's
 * `data-[active=true]:` classes stay live (see the header).
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
