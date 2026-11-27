/**
 * Page — shadcn/ui block `sidebar-10`
 * (`registry/new-york-v4/blocks/sidebar-10/page.tsx`), ported 1:1 to
 * Effect UI. Class strings are verbatim from the source.
 *
 * Upstream's default-exported React `Page` becomes the named export
 * `Sidebar10`: an `Html.component` whose view draws the port's
 * `SidebarProvider` (a headless Component, not context) and composes
 * `AppSidebar` + `SidebarInset` inside its `wrapper` part.
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
import { AppSidebar } from "./components/app-sidebar.ts";
import { NavActions } from "./components/nav-actions.ts";

export const Sidebar10Message = UiSchema.TaggedEnum({});

export const Sidebar10 = Html.component({
  name: "Sidebar10",
  model: Schema.Struct({}),
  message: Sidebar10Message,
}).make({
  init: () => ({}),
  update: {},
  view: (h) =>
    SidebarProvider(h, {
      props: {},
      view: (sidebar) =>
        sidebar.wrapper(h.div).children(
          AppSidebar(sidebar, h),
          SidebarInset(h).children(
            h.header.class("flex h-14 shrink-0 items-center gap-2").children(
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
              h.div.class("ml-auto px-3").children(NavActions(h, {})),
            ),
            h.div
              .class("flex flex-1 flex-col gap-4 px-4 py-10")
              .children(
                h.div.class("mx-auto h-24 w-full max-w-3xl rounded-xl bg-muted/50"),
                h.div.class("mx-auto h-full w-full max-w-3xl rounded-xl bg-muted/50"),
              ),
          ),
        ),
    }),
});
