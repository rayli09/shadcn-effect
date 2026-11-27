/**
 * AnalyticsCard — shadcn/ui block `preview`
 * (registry/bases/radix/blocks/preview/cards/analytics-card.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a small Card titled
 * "Analytics" — a "418.2K Visitors" description with a +10% Badge, a
 * "View Analytics" outline button in the header action cell, and a
 * Recharts AreaChart of monthly visitors inside a ChartContainer.
 * Here: a view function with the same markup, class strings and data
 * byte-for-byte upstream; the chart is the Effect-native
 * ChartContainer (D-4) fed the upstream data/config as props.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Chart: upstream composes Recharts `<AreaChart>` + `<Area
 *   type="linear" fillOpacity={0.4}>` + a tooltip with
 *   `defaultIndex={2}` and `cursor={false}`. The port is
 *   `ChartContainer` with `type: "area"`, one `visitors` series,
 *   `categoryKey: "month"`, `tooltipIndicator: "line"` and the axes
 *   and grid off (upstream draws none). The engine's area fill is the
 *   series color at 0.25 opacity (upstream: 0.4), it has no
 *   `defaultIndex` (the tooltip starts unhovered) and no cursor
 *   toggle — the D-4 engine's declared simplifications, not silent
 *   drops.
 * - Upstream's `size="sm"` on the Card uses the bases generation's
 *   small card size; the in-repo `Card` wrapper's options predate it,
 *   so the size is stamped as a `data-size="sm"` attribute bridge
 *   (D-9) — the bases preset keys the small-card spacing (and this
 *   card's own `data-[size=sm]:pb-0` class) off it, exactly as
 *   upstream's variant does.
 * - The "View Analytics" button is upstream's placeholder (no
 *   handler), so it carries no `onPress`.
 */
import type { Html } from "@effect/ui/html";
import { Badge } from "@/components/ui/badge.ts";
import { Button } from "@/components/ui/button.ts";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.ts";
import { ChartContainer } from "@/components/ui/chart.ts";

// Monthly visitor data for the area chart.
const chartData = [
  { month: "January", visitors: 186 },
  { month: "February", visitors: 305 },
  { month: "March", visitors: 237 },
  { month: "April", visitors: 73 },
  { month: "May", visitors: 209 },
  { month: "June", visitors: 214 },
];

// Chart configuration for the visitors dataset.
const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "var(--chart-1)",
  },
};

export const AnalyticsCard = <Msg>(h: Html.H<Msg>, _options: {} = {}) =>
  Card(h, { class: "mx-auto w-full max-w-sm data-[size=sm]:pb-0" })
    .attr("data-size", "sm")
    .children(
      CardHeader(h).children(
        CardTitle(h).children("Analytics"),
        CardDescription(h).children("418.2K Visitors ", Badge(h).children("+10%")),
        CardAction(h).children(
          Button(h, { variant: "outline", size: "sm" }).children("View Analytics"),
        ),
      ),
      ChartContainer(h, {
        props: {
          id: "preview-analytics",
          config: chartConfig,
          data: chartData,
          series: [{ dataKey: "visitors" }],
          type: "area",
          categoryKey: "month",
          showGrid: false,
          showXAxis: false,
          showYAxis: false,
          tooltipIndicator: "line",
          class: "aspect-[1/0.35]",
        },
      }),
    );
