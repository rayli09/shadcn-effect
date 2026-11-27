/**
 * PieChartCard — shadcn/ui block `preview` (registry/bases/radix/blocks/preview/cards/pie-chart-card.tsx), bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a Card titled "Browser Share" ("January - June 2026")
 * with an outline Badge naming the top browser in the header action,
 * a Recharts pie (donut) of `pieChartData` visitors per browser
 * inside a ChartContainer — tooltip with hidden label, a centered
 * Label showing the total visitor count over "Visitors", and a
 * legend keyed by browser — and a footer showing the top browser's
 * share percentage over a Progress bar tinted with chart-3. The data,
 * the config, and the computed total / top browser / share are
 * upstream's, verbatim. Here: a plain view function drawing the
 * chart port's `ChartContainer` child component with that data.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Charts: Recharts is banned; the pie is composed as data through
 *   the chart port's `ChartContainer` props — `type: "pie"`,
 *   `series: [{ dataKey: "visitors" }]`, `categoryKey: "browser"`,
 *   the upstream config and data (including each row's `fill`), the
 *   container's upstream class, `showLegend: true` and
 *   `showTooltip: true` with `tooltipIndicator: "dot"`. The engine
 *   pie uses the first series only and draws no labels (the chart
 *   port's declared geometry), so the following upstream Recharts
 *   features are dropped: the Pie's `innerRadius={50}` donut hole
 *   and `strokeWidth={5}`, the centered `<Label>` total/"Visitors"
 *   text, the tooltip's `cursor={false}` and `hideLabel` content
 *   options (the engine tooltip is its own), and the legend's
 *   `-translate-y-2` offset class (`className="translate-y-2"` on
 *   ChartLegend has no counterpart in the data-driven container).
 * - The per-row `fill: "var(--color-<browser>)"` values stay in the
 *   data verbatim; slice colors resolve through the config's
 *   `var(--chart-*)` colors, as the chart port declares.
 */
import type { Html } from "@effect/ui/html";
import { Badge } from "@/components/ui/badge.ts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { ChartContainer } from "@/components/ui/chart.ts";
import { Progress } from "@/components/ui/progress.ts";

const pieChartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
];

const pieChartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
};

export const PieChartCard = <Msg>(h: Html.H<Msg>) => {
  const totalVisitors = pieChartData.reduce((sum, item) => sum + item.visitors, 0);
  const topBrowser = pieChartData.reduce((max, item) =>
    item.visitors > max.visitors ? item : max,
  );
  const topBrowserShare = Math.round((topBrowser.visitors / totalVisitors) * 100);
  const topBrowserLabel =
    pieChartConfig[topBrowser.browser as keyof typeof pieChartConfig]?.label ?? "Top";

  return Card(h).children(
    CardHeader(h, { class: "pb-0" }).children(
      CardTitle(h).children("Browser Share"),
      CardDescription(h).children("January - June 2026"),
      CardAction(h).children(Badge(h, { variant: "outline" }).children(topBrowserLabel)),
    ),
    CardContent(h, { class: "pt-0" }).children(
      ChartContainer(h, {
        props: {
          config: pieChartConfig,
          data: pieChartData,
          series: [{ dataKey: "visitors" }],
          type: "pie",
          categoryKey: "browser",
          showLegend: true,
          showTooltip: true,
          tooltipIndicator: "dot",
          class: "mx-auto aspect-square max-h-[190px]",
        },
      }),
    ),
    CardFooter(h, { class: "flex-col items-stretch gap-2" }).children(
      h.div
        .class("flex items-center text-xs")
        .children(
          h.span.class("font-medium").children(topBrowserLabel),
          h.span
            .class("ml-auto text-muted-foreground tabular-nums")
            .children(`${topBrowserShare}%`),
        ),
      Progress(h, {
        props: { value: topBrowserShare },
        class: "**:data-[slot=progress-indicator]:bg-chart-3",
      }),
    ),
  );
};
