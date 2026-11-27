/**
 * NavSecondary — from the upstream bases block `sidebar-08`
 * (`registry/bases/radix/blocks/sidebar-08/components/nav-secondary.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * A view function: the provider's parts come first (the block-wide
 * convention; this piece reads nothing from them), then the caller's
 * `h`, then the data. Upstream spreads its remaining props onto the
 * `SidebarGroup`; the one the block passes is `className`, carried
 * here as the `class` option (DOM prop spreading is otherwise not
 * reproduced — the sidebar port's rule 6). Upstream's
 * `icon: ReactNode` field is an icon *builder* reference here, called
 * at render as `item.icon(h)`.
 *
 * Declared divergence — `SidebarMenuButton asChild` around an <a>
 * (D-2): the port's `SidebarMenuButton` always renders a <button>, so
 * the rows are drawn by `SidebarMenuLink` below, which stacks the
 * menu button's variants and `data-*` stamps on an `h.a` — exactly
 * the stamps `SidebarMenuButton` itself writes, on the anchor upstream
 * rendered.
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
              SidebarMenuLink(
                h,
                { href: item.url, size: "sm" },
                item.icon(h),
                h.span.children(item.title),
              ),
            ),
        ),
      ),
    ),
  );
