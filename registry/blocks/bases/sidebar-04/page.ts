/**
 * Page — the upstream bases block `sidebar-04`
 * (`registry/bases/radix/blocks/sidebar-04/page.tsx`), ported 1:1 to
 * Effect UI. Class strings are verbatim from the source.
 *
 * Upstream's default-exported React `Page` becomes the named export
 * `Page`: an `Html.component` whose view draws the port's
 * `SidebarProvider` (a headless Component, not context) and composes
 * `AppSidebar` + `SidebarInset` inside its `wrapper` part, exactly as
 * the sidebar port's header example does.
 *
 * Declared divergence — upstream's provider `style` prop
 * (`--sidebar-width: 19rem`): the `wrapper` part writes the width
 * variables as a `style` attribute, and chaining `.attr("style", …)`
 * after the part replaces it rather than merging per-property (the
 * sidebar port's rule 11). The replacement below therefore restates
 * the provider's `--sidebar-width-icon` default alongside upstream's
 * width override, which is the style upstream's merge produces.
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

export const Page = Html.component({
  name: "Sidebar04Page",
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
          .attr("style", "--sidebar-width: 19rem; --sidebar-width-icon: 3rem")
          .children(
            AppSidebar(sidebar, h),
            SidebarInset(h).children(
              h.header.class("flex h-16 shrink-0 items-center gap-2 px-4").children(
                SidebarTrigger(sidebar, h, { class: "-ml-1" }),
                Separator(h, {
                  orientation: "vertical",
                  class: "mr-2 data-vertical:h-4 data-vertical:self-auto",
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
                  h.div.class("min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min"),
                ),
            ),
          ),
    }),
});
