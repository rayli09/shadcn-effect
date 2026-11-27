/**
 * BarChartCard — shadcn/ui block `preview`
 * (registry/bases/radix/blocks/preview/cards/bar-chart-card.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card titled
 * "Traffic channels" with a Recharts grouped BarChart (desktop +
 * mobile per month) and legend inside a ChartContainer, a
 * three-column totals strip (Desktop / Mobile / Mix Delta, computed
 * from the data exactly as upstream computes them), and a full-width
 * "View report" footer button. Here: a view function with the same
 * markup, class strings and data byte-for-byte upstream; the chart
 * is the Effect-native ChartContainer (D-4) fed the upstream
 * data/config as props.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Chart: upstream composes Recharts `<BarChart>` + `<CartesianGrid
 *   vertical={false} strokeDasharray="3 3">` + `<XAxis
 *   tickFormatter={3-letter months}>` + a dashed-indicator tooltip +
 *   a legend + two `<Bar radius={…}>`s. The port is `ChartContainer`
 *   with `type: "bar"`, `desktop`/`mobile` series,
 *   `categoryKey: "month"`, `showLegend: true`,
 *   `tooltipIndicator: "dashed"` and the Y axis off (upstream draws
 *   none). The engine's declared simplifications apply: bars are
 *   square (no `radius`), the grid is solid (no dash pattern), and
 *   the X tick labels are the full month names (no `tickFormatter`)
 *   — see the chart port's header.
 * - Upstream reads `useDesignSystemSearchParams()` (create-app
 *   chrome, not ported) only to pick the Bar `radius` from the
 *   current style (rounded unless lyra/sera). Bar radius is a
 *   Recharts feature the chart engine declares unported, so the
 *   params read and the radius are dropped together.
 * - The "View report" button is upstream's placeholder (no handler),
 *   so it carries no `onPress`.
 */
import type { Html } from "@effect/ui/html";
import { Button } from "@/components/ui/button.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { ChartContainer } from "@/components/ui/chart.ts";

const barChartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const barChartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
};

const desktopTotal = barChartData.reduce((sum, item) => sum + item.desktop, 0);
const mobileTotal = barChartData.reduce((sum, item) => sum + item.mobile, 0);
const desktopDelta = Math.round(((desktopTotal - mobileTotal) / mobileTotal) * 100);
const desktopDeltaPrefix = desktopDelta > 0 ? "+" : "";

const totalCell = <Msg>(h: Html.H<Msg>, label: string, value: string) =>
  h.div
    .class("px-2 text-center")
    .children(
      h.div.class("text-[0.65rem] text-muted-foreground uppercase").children(label),
      h.div.class("text-sm font-medium tabular-nums").children(value),
    );

export const BarChartCard = <Msg>(h: Html.H<Msg>, _options: {} = {}) =>
  Card(h).children(
    CardHeader(h).children(
      CardTitle(h, { class: "text-lg" }).children("Traffic channels"),
      CardDescription(h, { class: "line-clamp-2 text-sm leading-snug" }).children(
        "Monthly desktop and mobile traffic for the last six months—compare volume and mix across platforms and devices at a glance.",
      ),
    ),
    CardContent(h, { class: "flex flex-col gap-4 pt-0" }).children(
      ChartContainer(h, {
        props: {
          id: "preview-bar-chart",
          config: barChartConfig,
          data: barChartData,
          series: [{ dataKey: "desktop" }, { dataKey: "mobile" }],
          type: "bar",
          categoryKey: "month",
          showYAxis: false,
          showLegend: true,
          tooltipIndicator: "dashed",
          class: "max-h-[180px] w-full",
        },
      }),
      h.div
        .class("grid w-full grid-cols-3 divide-x divide-border/60")
        .children(
          totalCell(h, "Desktop", desktopTotal.toLocaleString()),
          totalCell(h, "Mobile", mobileTotal.toLocaleString()),
          totalCell(h, "Mix Delta", `${desktopDeltaPrefix}${desktopDelta}%`),
        ),
    ),
    CardFooter(h).children(Button(h, { class: "w-full" }).children("View report")),
  );
