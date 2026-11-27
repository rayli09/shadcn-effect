/**
 * NavMain — from the upstream bases block `sidebar-06`
 * (`registry/bases/radix/blocks/sidebar-06/components/nav-main.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * A view function: the provider's parts come first (the block-wide
 * replacement for upstream's context — `isMobile` is read from them,
 * upstream's `useSidebar()`), then the caller's `h`, then the data.
 * Upstream's `icon?: ReactNode` field is an icon *builder* reference
 * here (called at render as `item.icon(h)`); upstream's render does
 * not draw it, and neither does this port.
 *
 * Declared divergences:
 *
 * - The kit Menu's open state is the consumer's (it lives in a Model);
 *   this block is an example composition whose host Page owns no menu
 *   state, so each menu is drawn at upstream's initial state
 *   (`open: false`) and its events are no-ops. Wire `open` / `onEmit`
 *   to a Model in a real app.
 * - Upstream's `DropdownMenuTrigger asChild` (D-2): the trigger is the
 *   port's `SidebarMenuButton` builder stacked as the Menu trigger's
 *   `element` — the documented composition in the dropdown-menu port.
 *   Content `side` / `align` are Positioning props on the kit Menu
 *   call, not on the content part; upstream's implicit `sideOffset`
 *   default (Radix 4) is passed explicitly for the same reason.
 * - Upstream's `DropdownMenuItem asChild` renders an <a href>; the
 *   port's item is a <div> (D-2), so the sub-item's `url` is carried
 *   in the data but not rendered as an href.
 * - Upstream's `MoreHorizontalIcon` is the shared `EllipsisIcon`.
 */
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.ts";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { EllipsisIcon, type IconOptions } from "@/lib/icons";

/** An icon builder reference (lucide glyph), called at render with the caller's `h`. */
export type NavMainIcon = <Msg>(h: Html.H<Msg>, options?: IconOptions) => View.Content<Msg>;

export interface NavMainItem {
  readonly title: string;
  readonly url: string;
  readonly icon?: NavMainIcon | undefined;
  readonly isActive?: boolean | undefined;
  readonly items?: ReadonlyArray<{ readonly title: string; readonly url: string }> | undefined;
}

export const NavMain = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: { readonly items: ReadonlyArray<NavMainItem> },
) =>
  SidebarGroup(h).children(
    SidebarMenu(h).children(
      ...options.items.map((item) =>
        DropdownMenu(h, {
          key: item.title,
          props: {
            open: false,
            items: (item.items ?? []).map((subItem) => ({
              value: subItem.title,
              label: subItem.title,
            })),
            side: sidebar.isMobile ? "bottom" : "right",
            align: sidebar.isMobile ? "end" : "start",
            sideOffset: 4,
          },
          onEmit: {
            RequestedOpen: () => undefined,
            RequestedClose: () => undefined,
            Picked: () => undefined,
            Highlighted: () => undefined,
            RequestedQuery: () => undefined,
            Settled: () => undefined,
          },
          view: (menu) =>
            SidebarMenuItem(h).children(
              DropdownMenuTrigger(menu, h, {
                element: SidebarMenuButton(h, {
                  class:
                    "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                }),
              }).children(item.title, " ", EllipsisIcon(h, { class: "ml-auto" })),
              item.items?.length
                ? DropdownMenuContent(menu, h, { class: "min-w-56 rounded-lg" }).children(
                    ...item.items.map((subItem) =>
                      DropdownMenuItem(menu, h, { value: subItem.title }).children(subItem.title),
                    ),
                  )
                : undefined,
            ),
        }),
      ),
    ),
  );
