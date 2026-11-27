/**
 * Page — the upstream bases block `sidebar-10`
 * (`registry/bases/radix/blocks/sidebar-10/page.tsx`), ported 1:1 to
 * Effect UI. Class strings are verbatim from the source.
 *
 * Upstream's default-exported React `Page` becomes the named export
 * `Page`: an `Html.component` whose view draws the port's
 * `SidebarProvider` (a headless Component, not context) and composes
 * `AppSidebar` + `SidebarInset` inside its `wrapper` part, exactly as
 * the sidebar port's header example does. The header's `NavActions`
 * is its own Component (it owns the Popover's open state), drawn here
 * with the Page's `h`.
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

export const Page = Html.component({
  name: "Sidebar10Page",
  model: Schema.Struct({}),
  message: UiSchema.TaggedEnum({}),
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
                  class: "mr-2 data-vertical:h-4 data-vertical:self-auto",
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
