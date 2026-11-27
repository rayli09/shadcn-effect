/**
 * Page — shadcn/ui block `sidebar-12`
 * (`registry/new-york-v4/blocks/sidebar-12/page.tsx`), ported 1:1 to
 * Effect UI. Class strings are verbatim from the source.
 *
 * Upstream's default-exported React `Page` becomes the named export
 * `Sidebar12`: an `Html.component` whose view draws the port's
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

export const Sidebar12Message = UiSchema.TaggedEnum({});

export const Sidebar12 = Html.component({
  name: "Sidebar12",
  model: Schema.Struct({}),
  message: Sidebar12Message,
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
            h.header
              .class(
                "sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4",
              )
              .children(
                SidebarTrigger(sidebar, h, { class: "-ml-1" }),
                Separator(h, {
                  orientation: "vertical",
                  class: "mr-2 data-[orientation=vertical]:h-4",
                }),
                Breadcrumb(h).children(
                  BreadcrumbList(h).children(
                    BreadcrumbItem(h).children(BreadcrumbPage(h).children("October 2024")),
                  ),
                ),
              ),
            h.div
              .class("flex flex-1 flex-col gap-4 p-4")
              .children(
                h.div
                  .class("grid auto-rows-min gap-4 md:grid-cols-5")
                  .children(
                    Array.from({ length: 20 }, () =>
                      h.div.class("aspect-square rounded-xl bg-muted/50"),
                    ),
                  ),
              ),
          ),
        ),
    }),
});
