/**
 * Dashboard01Page — from the upstream bases block `dashboard-01`
 * (`registry/bases/radix/blocks/dashboard-01/page.tsx`), ported 1:1 to
 * Effect UI. Class strings are verbatim from the source.
 *
 * Pairs with the `base-*` ui items (see
 * components/site-header.ts's header for the generation note). The
 * page is an `Html.component` hosting the bases `SidebarProvider`
 * kit component, whose view hands us the provider's parts — the
 * pattern the landed bases blocks (sidebar-07 et al.) use.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream passes the sidebar CSS variables as the provider's
 *   `style` prop (`--sidebar-width: calc(var(--spacing) * 72)`,
 *   `--header-height: calc(var(--spacing) * 12)`); the provider
 *   port's props carry no style, so the values are stamped on the
 *   provider's wrapper part instead — the landed pages' precedent
 *   (sidebar-04 / sidebar-09 stamp their width overrides the same
 *   way). `--sidebar-width-icon: 3rem` is the provider's own
 *   default, restated by the pages that override the width.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar.ts";
import { AppSidebar } from "./components/app-sidebar.ts";
import { ChartAreaInteractive } from "./components/chart-area-interactive.ts";
import { DataTable } from "./components/data-table.ts";
import { SectionCards } from "./components/section-cards.ts";
import { SiteHeader } from "./components/site-header.ts";
import { data } from "./data.ts";

export const Dashboard01PageMessage = UiSchema.TaggedEnum({});
export const Dashboard01PageModel = Schema.Struct({});
export type Dashboard01PageModel = typeof Dashboard01PageModel.Type;

export const Dashboard01Page = Html.component({
  name: "Dashboard01Page",
  model: Dashboard01PageModel,
  message: Dashboard01PageMessage,
}).make({
  init: () => ({}),
  update: {},
  view: (h) =>
    SidebarProvider(h, {
      props: {},
      view: (sidebar) =>
        sidebar
          .wrapper(h.div)
          .attr(
            "style",
            "--sidebar-width: calc(var(--spacing) * 72); --sidebar-width-icon: 3rem; --header-height: calc(var(--spacing) * 12)",
          )
          .children(
            AppSidebar(sidebar, h, { variant: "inset" }),
            SidebarInset(h).children(
              SiteHeader(sidebar, h),
              h.div
                .class("flex flex-1 flex-col")
                .children(
                  h.div
                    .class("@container/main flex flex-1 flex-col gap-2")
                    .children(
                      h.div
                        .class("flex flex-col gap-4 py-4 md:gap-6 md:py-6")
                        .children(
                          SectionCards(h),
                          h.div
                            .class("px-4 lg:px-6")
                            .children(ChartAreaInteractive(h, { props: {} })),
                          DataTable(h, { props: { data } }),
                        ),
                    ),
                ),
            ),
          ),
    }),
});
