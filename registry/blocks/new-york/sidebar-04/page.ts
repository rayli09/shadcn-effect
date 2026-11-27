/**
 * Page — shadcn/ui block `sidebar-04`
 * (`registry/new-york-v4/blocks/sidebar-04/page.tsx`), ported 1:1 to
 * Effect UI. Class strings are verbatim from the source.
 *
 * Upstream's default-exported React `Page` becomes the named export
 * `Sidebar04`: an `Html.component` whose view draws the port's
 * `SidebarProvider` (a headless Component, not context) and composes
 * `AppSidebar` + `SidebarInset` inside its `wrapper` part.
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
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.ts";
import { AppSidebar } from "./components/app-sidebar.ts";

export const Sidebar04Message = UiSchema.TaggedEnum({});

export const Sidebar04 = Html.component({
  name: "Sidebar04",
  model: Schema.Struct({}),
  message: Sidebar04Message,
}).make({
  init: () => ({}),
  update: {},
  view: (h) =>
    SidebarProvider(h, {
      props: {},
      view: (sidebar) =>
        sidebar
          .wrapper(h.div)
          // Upstream sets `--sidebar-width: 19rem` via the provider's
          // `style` prop; the wrapper part carries the width custom
          // properties, so the style is restated here in full (the
          // icon width keeps the port's default).
          .attr("style", "--sidebar-width: 19rem; --sidebar-width-icon: 3rem")
          .children(
            AppSidebar(sidebar, h),
            SidebarInset(h).children(
              h.header.class("flex h-16 shrink-0 items-center gap-2 border-b px-4").children(
                SidebarTrigger(sidebar, h, { class: "-ml-1" }),
                Separator(h, {
                  orientation: "vertical",
                  class: "mr-2 data-[orientation=vertical]:h-4",
                }),
                Breadcrumb(h).children(
                  BreadcrumbList(h).children(
                    BreadcrumbItem(h, { class: "hidden md:block" }).children(
                      BreadcrumbLink(h).attr("href", "#").children("Build Your Application"),
                    ),
                    BreadcrumbSeparator(h, { class: "hidden md:block" }),
                    BreadcrumbItem(h).children(BreadcrumbPage(h).children("Data Fetching")),
                  ),
                ),
              ),
              h.div
                .class("flex flex-1 flex-col gap-4 p-4 pt-0")
                .children(
                  h.div
                    .class("grid auto-rows-min gap-4 md:grid-cols-3")
                    .children(
                      h.div.class("aspect-video rounded-xl bg-muted/50"),
                      h.div.class("aspect-video rounded-xl bg-muted/50"),
                      h.div.class("aspect-video rounded-xl bg-muted/50"),
                    ),
                  h.div.class("min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"),
                ),
            ),
          ),
    }),
});
