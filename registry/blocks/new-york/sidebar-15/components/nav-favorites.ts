/**
 * NavFavorites — shadcn/ui block `sidebar-15`
 * (`registry/new-york-v4/blocks/sidebar-15/components/nav-favorites.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a React component reading `isMobile` from `useSidebar()`,
 * rendering one Radix `DropdownMenu` per favorite behind a hover
 * `SidebarMenuAction`. Here: an `Html.component` — the open menu's
 * favorite name lives in the Model (the kit Menu is controlled), and
 * the component `reads` the `SidebarProvider` (the port's replacement
 * for the context hook) for `isMobile`. Menu picks just close the menu.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's favorite button wraps an `<a href title>` via `asChild`;
 *   the sidebar port's `SidebarMenuButton` is always a `<button>` (the
 *   port's D-2), so the emoji + name render directly in the button; the
 *   anchor's `title` attribute is carried onto the button.
 * - Local icon builders: `StarOffIcon`, `LinkIcon`, `ArrowUpRightIcon`
 *   and `Trash2Icon` are not in `@/lib/icons`; they are defined in this
 *   file from the lucide-react 1.69 path data (ISC) via the lib's
 *   `icon()` helper.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
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
  SidebarProvider,
} from "@/components/ui/sidebar.ts";

/** Lucide `star-off` (ISC). */
export const StarOffIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "m10.344 4.688 1.181-2.393a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.237 3.152",
        },
      ],
      [
        "path",
        {
          d: "m17.945 17.945.43 2.505a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a8 8 0 0 0 .4-.099",
        },
      ],
      ["path", { d: "m2 2 20 20" }],
    ],
    options,
  );

/** Lucide `link` (ISC). */
export const LinkIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }],
      ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" }],
    ],
    options,
  );

/** Lucide `arrow-up-right` (ISC). */
export const ArrowUpRightIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M7 7h10v10" }],
      ["path", { d: "M7 17 17 7" }],
    ],
    options,
  );

/** Lucide `trash-2` (ISC). */
export const Trash2Icon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10 11v6" }],
      ["path", { d: "M14 11v6" }],
      ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }],
      ["path", { d: "M3 6h18" }],
      ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }],
    ],
    options,
  );

export const NavFavoritesProps = Schema.Struct({
  favorites: Schema.Array(
    Schema.Struct({ name: Schema.String, url: Schema.String, emoji: Schema.String }),
  ),
});

export const NavFavoritesMessage = UiSchema.TaggedEnum({
  MenuOpened: { name: Schema.String },
  MenuClosed: {},
});

export const NavFavorites = Html.component({
  name: "NavFavorites",
  props: NavFavoritesProps,
  model: Schema.Struct({ openMenu: Schema.NullOr(Schema.String) }),
  message: NavFavoritesMessage,
  reads: { sidebar: SidebarProvider },
}).make({
  init: () => ({ openMenu: null }),
  update: {
    MenuOpened: ($, { name }) => $.evolve({ openMenu: name }),
    MenuClosed: ($) => $.evolve({ openMenu: null }),
  },
  view: (h, model) => {
    const isMobile = h.reads.sidebar.isMobile;
    const favoriteItem = (item: { name: string; url: string; emoji: string }) => {
      const menu = DropdownMenu(h, {
        props: {
          open: model.openMenu === item.name,
          items: [
            { value: "remove", label: "Remove from Favorites" },
            { value: "copy-link", label: "Copy Link" },
            { value: "open", label: "Open in New Tab" },
            { value: "delete", label: "Delete" },
          ],
          side: isMobile ? "bottom" : "right",
          align: isMobile ? "end" : "start",
        },
        onEmit: {
          RequestedOpen: () => NavFavoritesMessage.MenuOpened({ name: item.name }),
          RequestedClose: () => NavFavoritesMessage.MenuClosed(),
          Picked: () => NavFavoritesMessage.MenuClosed(),
          Highlighted: () => undefined,
          RequestedQuery: () => undefined,
          Settled: () => undefined,
        },
        view: (menu) =>
          h.div.children(
            DropdownMenuTrigger(menu, h, {
              element: SidebarMenuAction(h, { showOnHover: true }),
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
      });
      return SidebarMenuItem(h).children(
        SidebarMenuButton(h)
          .attr("title", item.name)
          .children(h.span.children(item.emoji), h.span.children(item.name)),
        menu,
      );
    };
    return SidebarGroup(h, { class: "group-data-[collapsible=icon]:hidden" }).children(
      SidebarGroupLabel(h).children("Favorites"),
      SidebarMenu(h).children(
        h.props.favorites.map(favoriteItem),
        SidebarMenuItem(h).children(
          SidebarMenuButton(h, { class: "text-sidebar-foreground/70" }).children(
            EllipsisIcon(h),
            h.span.children("More"),
          ),
        ),
      ),
    );
  },
});
