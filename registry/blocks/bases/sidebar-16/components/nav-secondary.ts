/**
 * NavSecondary (sidebar-16 block) — upstream
 * `registry/bases/radix/blocks/sidebar-16/components/nav-secondary.tsx`
 * ported to Effect UI. A view function: the provider's parts come first,
 * then the caller's `h`, then the data. Upstream spreads the rest of its
 * props onto `SidebarGroup`; here that is the explicit `class` option.
 * `icon` holds an icon *builder* reference instead of ReactNode JSX
 * (called at render: `item.icon(h)`).
 *
 * Declared divergence (D-2): upstream's `SidebarMenuButton asChild`
 * renders an <a href={item.url}>; there is no Slot here and
 * `SidebarMenuButton` always renders its <button>, so the link collapses
 * onto the button and `url` is carried in the data but not rendered as an
 * href.
 */
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import type { IconOptions } from "@/lib/icons";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";

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
              SidebarMenuButton(h, { size: "sm" }).children(
                item.icon(h),
                h.span.children(item.title),
              ),
            ),
        ),
      ),
    ),
  );
