/**
 * ContributionHistory — shadcn/ui block `preview-02`
 * (registry/bases/radix/blocks/preview-02/cards/contribution-history.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a Card whose Recharts BarChart plots six months of
 * contributions, followed by two muted Items (upcoming contribution,
 * auto-save plan) and a "View Full Report" footer Button. Here: a
 * view function with the same anatomy; the chart is the
 * Effect-native `ChartContainer` fed upstream's data/config verbatim
 * as props. Class strings, sample data and copy are byte-for-byte
 * upstream.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Create-app internals are not ported: upstream reads
 *   `useDesignSystemSearchParams` to square the Bar's corners for the
 *   lyra/sera styles (`radius={isRounded ? [6, 6, 0, 0] : 0}`). The
 *   default selection is the rounded rendering — moot here, since the
 *   chart engine draws square bars (chart port divergence #3).
 * - Chart (D-4 engine): upstream's Recharts composition becomes
 *   `ChartContainer` props — type "bar", series `amount`,
 *   categoryKey `month`, upstream's container class `h-[200px]
 *   w-full`. Upstream renders no YAxis and no CartesianGrid, so
 *   `showYAxis` and `showGrid` are false; the XAxis is on.
 * - Engine-unported Recharts features, per the chart port's header:
 *   the Bar's `maxBarSize={40}`, the BarChart `margin` and
 *   `accessibilityLayer`, and the XAxis' `tickLine` / `axisLine` /
 *   `tickMargin` are dropped.
 * - The tooltip's `hideLabel`, `cursor={false}` and content class
 *   `min-w-40` are not expressible in the container's props; the
 *   built-in tooltip shows the category label.
 * - Upstream imports `Badge` and `CardAction` but never renders
 *   them; the imports are not reproduced.
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
import { Item, ItemContent, ItemDescription } from "@/components/ui/item.ts";

const chartData = [
  { month: "Dec", amount: 800 },
  { month: "Jan", amount: 1100 },
  { month: "Feb", amount: 900 },
  { month: "Mar", amount: 1300 },
  { month: "Apr", amount: 750 },
  { month: "May", amount: 1400 },
];

const chartConfig = {
  amount: {
    label: "Contribution",
    color: "var(--chart-2)",
  },
};

export const ContributionHistory = <Msg>(h: Html.H<Msg>, options = {}) =>
  Card(h).children(
    CardHeader(h).children(
      CardTitle(h).children("Contribution History"),
      CardDescription(h).children("Last 6 months of activity"),
    ),
    CardContent(h).children(
      ChartContainer(h, {
        props: {
          id: "contribution-history",
          config: chartConfig,
          data: chartData,
          series: [{ dataKey: "amount" }],
          type: "bar",
          categoryKey: "month",
          showGrid: false,
          showYAxis: false,
          class: "h-[200px] w-full",
        },
      }),
    ),
    CardContent(h).children(
      h.div.class("grid w-full grid-cols-1 gap-3 md:grid-cols-2").children(
        Item(h, { variant: "muted", class: "flex-col items-stretch" }).children(
          ItemContent(h, { class: "gap-1" }).children(
            ItemDescription(h, {
              class: "text-xs font-medium tracking-wider text-muted-foreground uppercase",
            }).children("Upcoming"),
            h.span.class("cn-font-heading text-lg font-semibold").children("May 25, 2024"),
            h.span.class("text-sm text-muted-foreground").children("$1,000 scheduled"),
          ),
        ),
        Item(h, { variant: "muted", class: "flex-col items-stretch" }).children(
          ItemContent(h, { class: "gap-1" }).children(
            ItemDescription(h, {
              class: "text-xs font-medium tracking-wider text-muted-foreground uppercase",
            }).children("Auto-Save Plan"),
            h.span.class("cn-font-heading text-lg font-semibold").children("Accelerated"),
            h.span.class("text-sm text-muted-foreground").children("Recurring weekly"),
          ),
        ),
      ),
    ),
    CardFooter(h).children(Button(h, { class: "w-full" }).children("View Full Report")),
  );
