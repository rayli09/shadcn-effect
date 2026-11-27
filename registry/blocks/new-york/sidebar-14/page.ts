/**
 * Page — shadcn/ui block `sidebar-14`
 * (`registry/new-york-v4/blocks/sidebar-14/page.tsx`), ported 1:1 to
 * Effect UI. Class strings are verbatim from the source.
 *
 * Upstream's default-exported React `Page` becomes the named export
 * `Sidebar14`: an `Html.component` whose view draws the port's
 * `SidebarProvider` (a headless Component, not context) and composes
 * `SidebarInset` + `AppSidebar` (on the right) inside its `wrapper`
 * part.
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
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.ts";
import { AppSidebar } from "./components/app-sidebar.ts";

export const Sidebar14Message = UiSchema.TaggedEnum({});

export const Sidebar14 = Html.component({
  name: "Sidebar14",
  model: Schema.Struct({}),
  message: Sidebar14Message,
}).make({
  init: () => ({}),
  update: {},
  view: (h) =>
    SidebarProvider(h, {
      props: {},
      view: (sidebar) =>
        sidebar
          .wrapper(h.div)
          .children(
            SidebarInset(h).children(
              h.header
                .class("flex h-16 shrink-0 items-center gap-2 border-b px-4")
                .children(
                  Breadcrumb(h).children(
                    BreadcrumbList(h).children(
                      BreadcrumbItem(h, { class: "hidden md:block" }).children(
                        BreadcrumbLink(h).attr("href", "#").children("Build Your Application"),
                      ),
                      BreadcrumbSeparator(h, { class: "hidden md:block" }),
                      BreadcrumbItem(h).children(BreadcrumbPage(h).children("Data Fetching")),
                    ),
                  ),
                  SidebarTrigger(sidebar, h, { class: "-mr-1 ml-auto rotate-180" }),
                ),
              h.div
                .class("flex flex-1 flex-col gap-4 p-4")
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
            AppSidebar(sidebar, h, { side: "right" }),
          ),
    }),
});
