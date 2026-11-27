/**
 * Dashboard01 — shadcn/ui block `dashboard-01`
 * (`registry/new-york-v4/blocks/dashboard-01/page.tsx`), ported 1:1 to
 * Effect UI. Class strings and layout are verbatim from the source.
 *
 * Upstream: a React page composing `SidebarProvider` (carrying the
 * `--sidebar-width` / `--header-height` custom properties as an inline
 * style), `AppSidebar` (variant "inset"), `SiteHeader`, `SectionCards`,
 * `ChartAreaInteractive` and `DataTable` fed by `data.json`.
 * Here: an `Html.component` hosting this repo's `SidebarProvider`, the
 * same composition from `./components/*`, and the records from
 * `./data.ts`. The style properties land on the provider's wrapper
 * element — the element the provider's own root renders — via its
 * `style` attribute.
 *
 * The parts' own divergences are declared in their files (the native
 * table substitution and the chart engine's simplifications in
 * `components/data-table.ts` and `components/chart-area-interactive.ts`).
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

export const Dashboard01Message = UiSchema.TaggedEnum({});

export const Dashboard01 = Html.component({
  name: "Dashboard01",
  model: Schema.Struct({}),
  message: Dashboard01Message,
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
            "--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12)",
          )
          .children(
            AppSidebar(sidebar, h, { variant: "inset" }),
            SidebarInset(h).children(
              SiteHeader(sidebar, h),
              h.div.class("flex flex-1 flex-col").children(
                h.div.class("@container/main flex flex-1 flex-col gap-2").children(
                  h.div.class("flex flex-col gap-4 py-4 md:gap-6 md:py-6").children(
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
