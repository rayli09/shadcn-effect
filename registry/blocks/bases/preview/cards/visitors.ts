/**
 * Visitors — shadcn/ui block `preview` (cards/visitors.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card (pb-0) whose
 * header carries a trend Badge computed from the last two rows of the
 * module-level `areaChartData` (percent change, "+" prefix, secondary
 * variant when non-negative, destructive otherwise), and whose content
 * is a Recharts `AreaChart` (natural curve, desktop series) inside the
 * bases `ChartContainer`, with a hidden XAxis and a line-indicator
 * tooltip. Here: a named view function; the trend computation is
 * upstream's, verbatim, and the chart is the Effect-native
 * `ChartContainer` from `@/components/ui/chart.ts` fed the upstream
 * data and config verbatim as props (type "area", categoryKey "month",
 * tooltipIndicator "line").
 *
 * Declared divergences (anything else is a bug):
 *
 * - Charts (D-4): recharts is banned and not reproduced. Upstream's
 *   `type="natural"` curve, `fillOpacity={0.15}`, `strokeWidth={2}` and
 *   margins have no ChartContainer props — the native engine draws its
 *   own area path (series color at 0.25 fill opacity). Upstream's
 *   XAxis is `hide`n and there is no YAxis or grid, so grid and both
 *   axes are switched off; the tooltip keeps upstream's line
 *   indicator and `cursor={false}` maps to the engine's tooltip with
 *   no cursor line option.
 */
import type { Html } from "@effect/ui/html";
import { Badge } from "@/components/ui/badge.ts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { ChartContainer } from "@/components/ui/chart.ts";
import { cn } from "@/lib/utils";

const areaChartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const areaChartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
};

const latestVisitors = areaChartData[areaChartData.length - 1]?.desktop ?? 0;
const previousVisitors = areaChartData[areaChartData.length - 2]?.desktop ?? latestVisitors;
const trendPercent =
  previousVisitors === 0
    ? 0
    : Math.round(((latestVisitors - previousVisitors) / previousVisitors) * 100);
const trendPrefix = trendPercent > 0 ? "+" : "";

export const Visitors = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  Card(h, { class: cn("pb-0", options.class) }).children(
    CardHeader(h).children(
      CardTitle(h).children("Visitors"),
      CardDescription(h).children("Last 6 months "),
      CardAction(h).children(
        Badge(h, { variant: trendPercent >= 0 ? "secondary" : "destructive" }).children(
          `${trendPrefix}${trendPercent}% vs last month`,
        ),
      ),
    ),
    CardContent(h, { class: "px-0" }).children(
      ChartContainer(h, {
        props: {
          id: "visitors",
          config: areaChartConfig,
          data: areaChartData,
          series: [{ dataKey: "desktop" }],
          type: "area",
          categoryKey: "month",
          showGrid: false,
          showXAxis: false,
          showYAxis: false,
          tooltipIndicator: "line",
          class: "h-48 w-full",
        },
      }),
    ),
  );
