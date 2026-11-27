/**
 * Page — the upstream bases block `sidebar-16`
 * (`registry/bases/radix/blocks/sidebar-16/page.tsx`), ported 1:1 to
 * Effect UI. Class strings are verbatim from the source.
 *
 * Pairs with the `base-*` ui items: the imports below say
 * `@/components/ui/<x>` because the bases items install to the same
 * paths as the new-york ones — the class layer inside them is the
 * bases `cn-*` hook layer, styled by a `style-*` preset.
 *
 * Upstream's default-exported React `Page` becomes the named export
 * `Page`: an `Html.component` (empty Model/message — the page owns no
 * state; the provider owns the sidebar's) whose view draws the port's
 * `SidebarProvider` inside upstream's outer <div> and composes
 * `SiteHeader` + `AppSidebar` + `SidebarInset` inside its `wrapper`
 * part, exactly as the sidebar port's header example does. Upstream's
 * `className="flex flex-col"` on the provider is chained onto the
 * `wrapper` part (the part IS the provider's rendered element);
 * upstream's module-level `iframeHeight` / `description` exports are
 * kept verbatim.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar.ts";
import { AppSidebar } from "./components/app-sidebar.ts";
import { SiteHeader } from "./components/site-header.ts";

export const iframeHeight = "800px";

export const description = "A sidebar with a header and a search form.";

export const Page = Html.component({
  name: "Sidebar16Page",
  model: Schema.Struct({}),
  message: UiSchema.TaggedEnum({}),
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
                        h.div.class("min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min"),
                      ),
                  ),
                ),
            ),
      }),
    ),
});
