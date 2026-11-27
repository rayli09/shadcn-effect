/**
 * NavMain — shadcn/ui block `sidebar-06`
 * (`registry/new-york-v4/blocks/sidebar-06/components/nav-main.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a React component reading `isMobile` from `useSidebar()`,
 * rendering one Radix `DropdownMenu` per nav item. Here: an
 * `Html.component` that `reads` the `SidebarProvider` (the port's
 * replacement for the context hook) for `isMobile`, and holds the open
 * menu's title in its Model — the kit Menu is controlled, so each
 * item's menu derives its `open` from that one value. Menu picks just
 * close the menu (upstream's items are `<a href="#">` links; the kit
 * Menu item is a button — see the dropdown-menu port's D-2 note).
 *
 * Upstream's prop type also carries `icon` / `isActive` per item; the
 * body never renders them, so the props Schema keeps only the fields
 * the view uses (`title`, `url`, `items`).
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { EllipsisIcon } from "@/lib/icons";
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
  SidebarProvider,
} from "@/components/ui/sidebar.ts";

export const NavMainProps = Schema.Struct({
  items: Schema.Array(
    Schema.Struct({
      title: Schema.String,
      url: Schema.String,
      items: Schema.optional(
        Schema.Array(Schema.Struct({ title: Schema.String, url: Schema.String })),
      ),
    }),
  ),
});

export const NavMainMessage = UiSchema.TaggedEnum({
  MenuOpened: { title: Schema.String },
  MenuClosed: {},
});

export const NavMain = Html.component({
  name: "NavMain",
  props: NavMainProps,
  model: Schema.Struct({ openItem: Schema.NullOr(Schema.String) }),
  message: NavMainMessage,
  reads: { sidebar: SidebarProvider },
}).make({
  init: () => ({ openItem: null }),
  update: {
    MenuOpened: ($, { title }) => $.evolve({ openItem: title }),
    MenuClosed: ($) => $.evolve({ openItem: null }),
  },
  view: (h, model) => {
    const isMobile = h.reads.sidebar.isMobile;
    return SidebarGroup(h).children(
      SidebarMenu(h).children(
        h.props.items.map((item) =>
          SidebarMenuItem(h).children(
            DropdownMenu(h, {
              props: {
                open: model.openItem === item.title,
                items: (item.items ?? []).map((sub) => ({ value: sub.title, label: sub.title })),
                side: isMobile ? "bottom" : "right",
                align: isMobile ? "end" : "start",
              },
              onEmit: {
                RequestedOpen: () => NavMainMessage.MenuOpened({ title: item.title }),
                RequestedClose: () => NavMainMessage.MenuClosed(),
                Picked: () => NavMainMessage.MenuClosed(),
                Highlighted: () => undefined,
                RequestedQuery: () => undefined,
                Settled: () => undefined,
              },
              view: (menu) =>
                h.div.children(
                  DropdownMenuTrigger(menu, h, {
                    element: SidebarMenuButton(h, {
                      class:
                        "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                    }),
                  }).children(`${item.title} `, EllipsisIcon(h, { class: "ml-auto" })),
                  item.items?.length
                    ? DropdownMenuContent(menu, h, { class: "min-w-56 rounded-lg" }).children(
                        item.items.map((sub) =>
                          DropdownMenuItem(menu, h, { value: sub.title }).children(sub.title),
                        ),
                      )
                    : undefined,
                ),
            }),
          ),
        ),
      ),
    );
  },
});
