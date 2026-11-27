/**
 * CardOverview — shadcn/ui block `preview-02`
 * (registry/bases/radix/blocks/preview-02/cards/card-overview.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a 2-column grid of three Cards — balance, payment due
 * (with a "Pay Early" Button), and a full-width yearly-activity Card
 * whose Recharts BarChart plots monthly amounts. Here: a view
 * function with the same anatomy; the chart is the Effect-native
 * `ChartContainer` fed upstream's data/config verbatim as props.
 * Class strings, sample data and copy are byte-for-byte upstream.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Chart (D-4 engine): upstream's Recharts composition becomes
 *   `ChartContainer` props — type "bar", series `amount`,
 *   categoryKey `month`, upstream's container class `h-20 w-full`.
 *   Upstream renders no YAxis and no CartesianGrid, so `showYAxis`
 *   and `showGrid` are false; the XAxis is on.
 * - Engine-unported Recharts features, per the chart port's header:
 *   the Bar's `radius={[3, 3, 0, 0]}` (bars are square), the BarChart
 *   `margin`, and the XAxis' `tickFormatter` (first-letter labels —
 *   the engine draws full month names), `tickLine` / `axisLine` /
 *   `tickMargin` and its `text-[10px]` class have no equivalent and
 *   are dropped.
 * - The tooltip's `hideLabel` and `cursor={false}` are not
 *   expressible in the container's props; the built-in tooltip shows
 *   the category label.
 */
import type { Html } from "@effect/ui/html";
import { Badge } from "@/components/ui/badge.ts";
import { Button } from "@/components/ui/button.ts";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card.ts";
import { ChartContainer } from "@/components/ui/chart.ts";

const activityData = [
  { month: "Jan", amount: 40 },
  { month: "Feb", amount: 55 },
  { month: "Mar", amount: 35 },
  { month: "Apr", amount: 60 },
  { month: "May", amount: 45 },
  { month: "Jun", amount: 50 },
  { month: "Jul", amount: 65 },
  { month: "Aug", amount: 40 },
  { month: "Sep", amount: 55 },
  { month: "Oct", amount: 70 },
  { month: "Nov", amount: 45 },
  { month: "Dec", amount: 80 },
];

const chartConfig = {
  amount: {
    label: "Activity",
    color: "var(--chart-2)",
  },
};

export const CardOverview = <Msg>(h: Html.H<Msg>, options = {}) =>
  h.div.class("grid grid-cols-2 gap-3").children(
    Card(h).children(
      CardContent(h).children(
        CardDescription(h).children("Card Balance"),
        CardTitle(h, { class: "text-2xl tabular-nums" }).children("US$12.94"),
        CardDescription(h, { class: "tabular-nums" }).children("US$11,337.06 Available"),
      ),
    ),
    Card(h, { class: "flex flex-col justify-between" }).children(
      CardContent(h, { class: "flex flex-1 flex-col justify-between" }).children(
        h.div
          .class("flex flex-col gap-1")
          .children(
            CardDescription(h).children("Payment Due"),
            CardTitle(h, { class: "text-2xl" }).children("1 Apr"),
          ),
        Button(h, { variant: "outline", size: "sm", class: "mt-3 w-full" }).children("Pay Early"),
      ),
    ),
    Card(h, { class: "col-span-2" }).children(
      CardContent(h, { class: "flex flex-col gap-2" }).children(
        h.div
          .class("flex items-center justify-between")
          .children(
            CardDescription(h).children("Yearly Activity"),
            Badge(h, { variant: "secondary" }).children("+US$0.25 Daily Cash"),
          ),
        ChartContainer(h, {
          props: {
            id: "card-overview",
            config: chartConfig,
            data: activityData,
            series: [{ dataKey: "amount" }],
            type: "bar",
            categoryKey: "month",
            showGrid: false,
            showYAxis: false,
            class: "h-20 w-full",
          },
        }),
      ),
    ),
  );
