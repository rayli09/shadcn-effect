/**
 * NavFavorites (sidebar-10 block) — upstream
 * `registry/bases/radix/blocks/sidebar-10/components/nav-favorites.tsx`
 * ported to Effect UI. A view function: the provider's parts come first
 * (the `useSidebar()` replacement — `isMobile` is read from them), then
 * the caller's `h`, then the data.
 *
 * Declared divergences:
 * - The kit Menu's open state is the consumer's (it lives in a Model);
 *   this block is an example composition whose host Page owns no menu
 *   state, so each menu is drawn at upstream's initial state (`open:
 *   false`) and its events are no-ops. Wire `open` / `onEmit` to a Model
 *   in a real app.
 * - D-2: upstream's `SidebarMenuButton asChild` renders an
 *   <a href={item.url} title={item.name}>; there is no Slot here and
 *   `SidebarMenuButton` always renders its <button>, so the link
 *   collapses onto the button and `url` / `title` are carried in the
 *   data but not rendered.
 * - Icons lucide-react does not ship here: the glyphs below are LOCAL
 *   builders over the shared `icon()` helper, nodes copied verbatim from
 *   lucide's SVGs (ISC): star-off, link, arrow-up-right, trash-2.
 *   Upstream's `MoreHorizontalIcon` is the shared `EllipsisIcon`.
 */
import type * as Html from "@effect/ui/html/Html";
import { EllipsisIcon, icon, type IconOptions } from "@/lib/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.ts";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";

/** Lucide `star-off` (ISC). */
const StarOffIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M8.34 8.34 2 9.27l5 4.87L5.82 21 12 17.77 18.18 21l-.59-3.43" }],
      ["path", { d: "M18.42 12.76 22 9.27l-6.91-1L12 2l-1.44 2.91" }],
      ["line", { x1: "2", x2: "22", y1: "2", y2: "22" }],
    ],
    options,
  );

/** Lucide `link` (ISC). */
const LinkIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }],
      ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" }],
    ],
    options,
  );

/** Lucide `arrow-up-right` (ISC). */
const ArrowUpRightIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M7 7h10v10" }],
      ["path", { d: "M7 17 17 7" }],
    ],
    options,
  );

/** Lucide `trash-2` (ISC). */
const Trash2Icon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M3 6h18" }],
      ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }],
      ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }],
      ["line", { x1: "10", x2: "10", y1: "11", y2: "17" }],
      ["line", { x1: "14", x2: "14", y1: "11", y2: "17" }],
    ],
    options,
  );

export interface NavFavorite {
  readonly name: string;
  readonly url: string;
  readonly emoji: string;
}

export const NavFavorites = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: { readonly favorites: ReadonlyArray<NavFavorite> },
) =>
  SidebarGroup(h, { class: "group-data-[collapsible=icon]:hidden" }).children(
    SidebarGroupLabel(h).children("Favorites"),
    SidebarMenu(h).children(
      ...options.favorites.map((item) =>
        SidebarMenuItem(h)
          .key(item.name)
          .children(
            SidebarMenuButton(h).children(h.span.children(item.emoji), h.span.children(item.name)),
            DropdownMenu(h, {
              props: {
                open: false,
                items: [
                  { value: "remove", label: "Remove from Favorites" },
                  { value: "copy-link", label: "Copy Link" },
                  { value: "open", label: "Open in New Tab" },
                  { value: "delete", label: "Delete" },
                ],
                side: sidebar.isMobile ? "bottom" : "right",
                align: sidebar.isMobile ? "end" : "start",
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
                h.div(
                  DropdownMenuTrigger(menu, h, {
                    element: SidebarMenuAction(h, {
                      showOnHover: true,
                      class: "aria-expanded:bg-muted",
                    }),
                  }).children(EllipsisIcon(h), h.span.class("sr-only").children("More")),
                  DropdownMenuContent(menu, h, { class: "w-56 rounded-lg" }).children(
                    DropdownMenuItem(menu, h, { value: "remove" }).children(
                      StarOffIcon(h, { class: "text-muted-foreground" }),
                      h.span.children("Remove from Favorites"),
                    ),
                    DropdownMenuSeparator(menu, h),
                    DropdownMenuItem(menu, h, { value: "copy-link" }).children(
                      LinkIcon(h, { class: "text-muted-foreground" }),
                      h.span.children("Copy Link"),
                    ),
                    DropdownMenuItem(menu, h, { value: "open" }).children(
                      ArrowUpRightIcon(h, { class: "text-muted-foreground" }),
                      h.span.children("Open in New Tab"),
                    ),
                    DropdownMenuSeparator(menu, h),
                    DropdownMenuItem(menu, h, { value: "delete" }).children(
                      Trash2Icon(h, { class: "text-muted-foreground" }),
                      h.span.children("Delete"),
                    ),
                  ),
                ),
            }),
          ),
      ),
      SidebarMenuItem(h).children(
        SidebarMenuButton(h, { class: "text-sidebar-foreground/70" }).children(
          EllipsisIcon(h),
          h.span.children("More"),
        ),
      ),
    ),
  );
