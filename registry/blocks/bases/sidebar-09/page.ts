/**
 * Page — the upstream bases block `sidebar-09`
 * (`registry/bases/radix/blocks/sidebar-09/page.tsx`), ported 1:1 to
 * Effect UI. Class strings are verbatim from the source.
 *
 * Upstream's default-exported React `Page` becomes the named export
 * `Page`: an `Html.component` whose view draws the port's
 * `SidebarProvider` (a headless Component, not context) and composes
 * `AppSidebar` + `SidebarInset` inside its `wrapper` part, exactly as
 * the sidebar port's header example does.
 *
 * Declared divergence: upstream passes
 * `style={{ "--sidebar-width": "350px" }}` to the provider. The port's
 * `wrapper` part writes the width vars itself; chaining a `style`
 * attribute after the part replaces it (the sidebar port's divergence
 * 11), so the full style is written here — upstream's 350px width plus
 * the port's default `--sidebar-width-icon` value.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.ts";
import { Separator } from "@/components/ui/separator.ts";
import {
  SIDEBAR_WIDTH_ICON,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar.ts";
import { AppSidebar } from "./components/app-sidebar.ts";

export const Page = Html.component({
  name: "Sidebar09Page",
  model: Schema.Struct({}),
  message: UiSchema.TaggedEnum({}),
}).make({
  init: () => ({}),
  update: {},
  view: (h) =>
    SidebarProvider(h, {
      props: {},
      view: (sidebar) =>
        sidebar
          .wrapper(h.div)
          .attr("style", `--sidebar-width: 350px; --sidebar-width-icon: ${SIDEBAR_WIDTH_ICON}`)
          .children(
            AppSidebar(sidebar, h),
            SidebarInset(h).children(
              h.header
                .class("sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4")
                .children(
                  SidebarTrigger(sidebar, h, { class: "-ml-1" }),
                  Separator(h, {
                    orientation: "vertical",
                    class: "mr-2 data-vertical:h-4 data-vertical:self-auto",
                  }),
                  Breadcrumb(h).children(
                    BreadcrumbList(h).children(
                      BreadcrumbItem(h, { class: "hidden md:block" }).children(
                        BreadcrumbLink(h).attr("href", "#").children("All Inboxes"),
                      ),
                      BreadcrumbSeparator(h, { class: "hidden md:block" }),
                      BreadcrumbItem(h).children(BreadcrumbPage(h).children("Inbox")),
                    ),
                  ),
                ),
              h.div
                .class("flex flex-1 flex-col gap-4 p-4")
                .children(
                  ...Array.from({ length: 24 }, (_, index) =>
                    h.div
                      .key(String(index))
                      .class("aspect-video h-12 w-full rounded-lg bg-muted/50"),
                  ),
                ),
            ),
          ),
    }),
});
