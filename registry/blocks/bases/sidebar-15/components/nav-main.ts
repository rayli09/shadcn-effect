/**
 * NavMain (sidebar-15 block) — upstream
 * `registry/bases/radix/blocks/sidebar-15/components/nav-main.tsx` ported
 * to Effect UI. A view function: the provider's parts come first (the
 * block-wide replacement for upstream's context), then the caller's `h`,
 * then the data — upstream's props, with `icon` holding an icon *builder*
 * reference instead of ReactNode JSX (called at render: `item.icon(h)`).
 *
 * Declared divergence (D-2): upstream's `SidebarMenuButton asChild`
 * renders an <a href={item.url}>; there is no Slot here and
 * `SidebarMenuButton` always renders its <button>, so the link collapses
 * onto the button and `url` is carried in the data but not rendered as an
 * href (the same collapse the sidebar port declares for its own asChild
 * pieces).
 */
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import type { IconOptions } from "@/lib/icons";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";

/** An icon builder reference (lucide glyph), called at render with the caller's `h`. */
export type NavMainIcon = <Msg>(h: Html.H<Msg>, options?: IconOptions) => View.Content<Msg>;

export interface NavMainItem {
  readonly title: string;
  readonly url: string;
  readonly icon: NavMainIcon;
  readonly isActive?: boolean | undefined;
}

export const NavMain = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: { readonly items: ReadonlyArray<NavMainItem> },
) =>
  SidebarMenu(h).children(
    ...options.items.map((item) =>
      SidebarMenuItem(h)
        .key(item.title)
        .children(
          SidebarMenuButton(h, { isActive: item.isActive }).children(
            item.icon(h),
            h.span.children(item.title),
          ),
        ),
    ),
  );
