/**
 * Page — the upstream bases block `sidebar-15`
 * (`registry/bases/radix/blocks/sidebar-15/page.tsx`), ported 1:1 to
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
 * `SidebarProvider` and composes BOTH of the block's sidebars inside
 * its `wrapper` part — upstream renders `SidebarLeft` and
 * `SidebarRight` inside one provider, so both take the same provider
 * parts here (the right one drawn with `side: "right"`), exactly as
 * the sidebar port's header example does.
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

export const Page = Html.component({
  name: "Sidebar15Page",
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
          SidebarLeft(sidebar, h),
          SidebarInset(h).children(
            h.header
              .class("sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background")
              .children(
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
              ),
            h.div
              .class("flex flex-1 flex-col gap-4 p-4")
              .children(
                h.div.class("mx-auto h-24 w-full max-w-3xl rounded-xl bg-muted/50"),
                h.div.class("mx-auto h-screen w-full max-w-3xl rounded-xl bg-muted/50"),
              ),
          ),
          SidebarRight(sidebar, h),
        ),
    }),
});
