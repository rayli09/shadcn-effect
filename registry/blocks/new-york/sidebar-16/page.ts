/**
 * Page — shadcn/ui block `sidebar-16`
 * (`registry/new-york-v4/blocks/sidebar-16/page.tsx`), ported 1:1 to
 * Effect UI. Class strings are verbatim from the source.
 *
 * Upstream's default-exported React `Page` becomes the named export
 * `Sidebar16`: an `Html.component` whose view draws the port's
 * `SidebarProvider` (a headless Component, not context) inside the
 * `--header-height` wrapper div, with the provider's `wrapper` part
 * carrying upstream's `flex flex-col` class. Upstream's module-level
 * `iframeHeight` / `description` exports are kept as consts.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar.ts";
import { AppSidebar } from "./components/app-sidebar.ts";
import { SiteHeader } from "./components/site-header.ts";

export const iframeHeight = "800px";

export const description = "A sidebar with a header and a search form.";

export const Sidebar16Message = UiSchema.TaggedEnum({});

export const Sidebar16 = Html.component({
  name: "Sidebar16",
  model: Schema.Struct({}),
  message: Sidebar16Message,
}).make({
  init: () => ({}),
  update: {},
  view: (h) =>
    h.div.class("[--header-height:calc(--spacing(14))]").children(
      SidebarProvider(h, {
        props: {},
        view: (sidebar) =>
          sidebar
            .wrapper(h.div)
            .class("flex flex-col")
            .children(
              SiteHeader(sidebar, h),
              h.div
                .class("flex flex-1")
                .children(
                  AppSidebar(sidebar, h),
                  SidebarInset(h).children(
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
                ),
            ),
      }),
    ),
});
