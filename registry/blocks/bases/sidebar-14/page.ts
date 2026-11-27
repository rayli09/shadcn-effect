/**
 * Page (sidebar-14 block) — upstream
 * `registry/bases/radix/blocks/sidebar-14/page.tsx` ported to Effect UI.
 *
 * Pairs with the `base-*` ui items: the imports below say
 * `@/components/ui/<x>` because the bases items install to the same
 * paths as the new-york ones — the class layer inside them is the
 * bases `cn-*` hook layer, styled by a `style-*` preset.
 *
 * Upstream: a default-exported React `Page` drawing a
 * `SidebarProvider` whose wrapper holds a `SidebarInset` (breadcrumb
 * header with a flipped `SidebarTrigger`, placeholder content) and
 * the block's right-sided `AppSidebar`. Here: a named `Page`
 * Component (empty Model/message — the page owns no state; the
 * provider owns the sidebar's) hosting the port's `SidebarProvider`
 * the same way, with the sidebar pieces taking the provider's parts
 * as their first argument instead of reading context. Class strings
 * byte-for-byte upstream, source order preserved (inset first, then
 * the right-sided sidebar).
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.ts";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { AppSidebar } from "./components/app-sidebar.ts";

export const PageMessage = UiSchema.TaggedEnum({});

export const Page = Html.component({
  name: "Sidebar14Page",
  model: Schema.Struct({}),
  message: PageMessage,
}).make({
  init: () => ({}),
  update: {},
  view: (h) =>
    SidebarProvider(h, {
      props: {},
      view: (sidebar: SidebarProviderParts) =>
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
                  h.div.class("min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min"),
                ),
            ),
            AppSidebar(sidebar, h, { side: "right" }),
          ),
    }),
});
