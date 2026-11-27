/**
 * Page — shadcn/ui block `sidebar-15`
 * (`registry/new-york-v4/blocks/sidebar-15/page.tsx`), ported 1:1 to
 * Effect UI. Class strings are verbatim from the source.
 *
 * Upstream's default-exported React `Page` becomes the named export
 * `Sidebar15`: an `Html.component` whose view draws the port's
 * `SidebarProvider` (a headless Component, not context) and composes
 * `SidebarLeft` + `SidebarInset` + `SidebarRight` inside its `wrapper`
 * part.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb.ts";
import { Separator } from "@/components/ui/separator.ts";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.ts";
import { SidebarLeft } from "./components/sidebar-left.ts";
import { SidebarRight } from "./components/sidebar-right.ts";

export const Sidebar15Message = UiSchema.TaggedEnum({});

export const Sidebar15 = Html.component({
  name: "Sidebar15",
  model: Schema.Struct({}),
  message: Sidebar15Message,
}).make({
  init: () => ({}),
  update: {},
  view: (h) =>
    SidebarProvider(h, {
      props: {},
      view: (sidebar) =>
        sidebar.wrapper(h.div).children(
          SidebarLeft(sidebar, h),
          SidebarInset(h).children(
            h.header
              .class("sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background")
              .children(
                h.div.class("flex flex-1 items-center gap-2 px-3").children(
                  SidebarTrigger(sidebar, h),
                  Separator(h, {
                    orientation: "vertical",
                    class: "mr-2 data-[orientation=vertical]:h-4",
                  }),
                  Breadcrumb(h).children(
                    BreadcrumbList(h).children(
                      BreadcrumbItem(h).children(
                        BreadcrumbPage(h, { class: "line-clamp-1" }).children(
                          "Project Management & Task Tracking",
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            h.div
              .class("flex flex-1 flex-col gap-4 p-4")
              .children(
                h.div.class("mx-auto h-24 w-full max-w-3xl rounded-xl bg-muted/50"),
                h.div.class("mx-auto h-[100vh] w-full max-w-3xl rounded-xl bg-muted/50"),
              ),
          ),
          SidebarRight(sidebar, h),
        ),
    }),
});
