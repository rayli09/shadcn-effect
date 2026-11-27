/**
 * NavSecondary — from the upstream bases block `dashboard-01`
 * (`registry/bases/radix/blocks/dashboard-01/components/nav-secondary.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Pairs with the `base-*` ui items (see site-header.ts's header).
 *
 * A view function: the provider's parts come first (the block-wide
 * convention; this piece reads nothing from them), then the caller's
 * `h`, then the data. Upstream's `icon: ReactNode` field is an icon
 * *builder* reference here, called at render as `item.icon(h)`.
 * Upstream spreads `React.ComponentPropsWithoutRef<typeof SidebarGroup>`
 * onto the group; the only prop the block passes is `className`
 * (`"mt-auto"` from app-sidebar), so that is the one option here.
 *
 * Declared divergences:
 *
 * - `SidebarMenuButton asChild` around an <a> (D-2): the port's
 *   `SidebarMenuButton` always renders a <button>, so the rows are
 *   drawn by `SidebarMenuLink` below, which stacks the menu button's
 *   variants and `data-*` stamps on an `h.a` — exactly the stamps
 *   `SidebarMenuButton` itself writes, on the anchor upstream
 *   rendered (the sidebar-07 nav-projects composition).
 */
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  sidebarMenuButtonVariants,
  type SidebarMenuButtonSize,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import type { IconOptions } from "@/lib/icons";

/**
 * Upstream's `SidebarMenuButton asChild` row: an <a> wearing the menu
 * button's variants and stamps (see the header). `size` defaults to
 * `"default"`, as upstream's button does.
 */
const SidebarMenuLink = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly href: string;
    readonly isActive?: boolean | undefined;
    readonly size?: SidebarMenuButtonSize | undefined;
    readonly class?: string | undefined;
  },
  ...children: ReadonlyArray<View.Content<Msg>>
) =>
  h.a
    .attr("href", options.href)
    .attrs({
      "data-slot": "sidebar-menu-button",
      "data-sidebar": "menu-button",
      "data-size": options.size ?? "default",
      "data-active": String(options.isActive ?? false),
    })
    .class(sidebarMenuButtonVariants({ size: options.size, class: options.class }))
    .children(...children);

/** An icon builder reference (lucide glyph), called at render with the caller's `h`. */
export type NavSecondaryIcon = <Msg>(h: Html.H<Msg>, options?: IconOptions) => View.Content<Msg>;

export interface NavSecondaryItem {
  readonly title: string;
  readonly url: string;
  readonly icon: NavSecondaryIcon;
}

export const NavSecondary = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: {
    readonly items: ReadonlyArray<NavSecondaryItem>;
    readonly class?: string | undefined;
  },
) =>
  SidebarGroup(h, { class: options.class }).children(
    SidebarGroupContent(h).children(
      SidebarMenu(h).children(
        ...options.items.map((item) =>
          SidebarMenuItem(h)
            .key(item.title)
            .children(
              SidebarMenuLink(h, { href: item.url }, item.icon(h), h.span.children(item.title)),
            ),
        ),
      ),
    ),
  );
