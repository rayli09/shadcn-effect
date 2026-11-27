/**
 * Page — shadcn/ui block `sidebar-02`
 * (`registry/new-york-v4/blocks/sidebar-02/page.tsx`), ported 1:1 to
 * Effect UI. Class strings are verbatim from the source.
 *
 * Upstream's default-exported React `Page` becomes the named export
 * `Sidebar02`: an `Html.component` whose view draws the port's
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

export const Sidebar02Message = UiSchema.TaggedEnum({});

export const Sidebar02 = Html.component({
  name: "Sidebar02",
  model: Schema.Struct({}),
  message: Sidebar02Message,
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
            AppSidebar(sidebar, h),
            SidebarInset(h).children(
              h.header
                .class(
                  "sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4",
                )
                .children(
                  SidebarTrigger(sidebar, h, { class: "-ml-1" }),
                  Separator(h, { orientation: "vertical", class: "mr-2 h-4" }),
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
                .class("flex flex-1 flex-col gap-4 p-4")
                .children(
                  Array.from({ length: 24 }, () =>
                    h.div.class("aspect-video h-12 w-full rounded-lg bg-muted/50"),
                  ),
                ),
            ),
          ),
    }),
});
