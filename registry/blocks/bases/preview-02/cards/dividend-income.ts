/**
 * DividendIncome — shadcn/ui block `preview-02`
 * (registry/bases/radix/blocks/preview-02/cards/dividend-income.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a Card listing four portfolio holdings (the `HOLDINGS`
 * sample data, verbatim below); each muted Item shows the holding's
 * name/shares, a mini Recharts BarChart of its quarterly dividends,
 * and its payout amount, and the header carries a ghost icon Button
 * in a CardAction. Here: a view function with the same anatomy; each
 * mini chart is the Effect-native `ChartContainer` fed that holding's
 * data verbatim as props, keyed by holding and given its own chart
 * `id` (the container's config-scope id, per its header). Class
 * strings, sample data and copy are byte-for-byte upstream.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Create-app internals are not ported: upstream reads
 *   `useDesignSystemSearchParams` to square the bars' corners for
 *   the lyra/sera styles (`radius={isRounded ? [3, 3, 0, 0] : 0}`).
 *   The default selection is the rounded rendering — moot here,
 *   since the chart engine draws square bars (chart port divergence
 *   #3).
 * - Chart (D-4 engine): each upstream BarChart becomes
 *   `ChartContainer` props — type "bar", series `value`,
 *   categoryKey `q`, upstream's container class `hidden h-8 w-24
 *   md:block`. Upstream renders no axes and no grid in the mini
 *   charts, so `showXAxis`, `showYAxis` and `showGrid` are false.
 * - Engine-unported Recharts features, per the chart port's header:
 *   the BarChart `margin` is dropped, and the tooltip's `hideLabel`
 *   and `cursor={false}` are not expressible in the container's
 *   props; the built-in tooltip shows the category label.
 * - Upstream's `key={holding.name}` on each Item is React's list
 *   key; the port's list items are plain view content, so the key
 *   survives only on the `ChartContainer` child components, which
 *   need it to keep their hover state apart.
 */
import type { Html } from "@effect/ui/html";
import { Button } from "@/components/ui/button.ts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { ChartContainer } from "@/components/ui/chart.ts";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item.ts";
import { XIcon } from "@/lib/icons";

const HOLDINGS = [
  {
    name: "Vanguard VIG",
    shares: "450 Shares",
    amount: "$1,842.10",
    data: [
      { q: "Q1", value: 380 },
      { q: "Q2", value: 420 },
      { q: "Q3", value: 390 },
      { q: "Q4", value: 652 },
    ],
  },
  {
    name: "S&P 500 VOO",
    shares: "112 Shares",
    amount: "$928.40",
    data: [
      { q: "Q1", value: 180 },
      { q: "Q2", value: 210 },
      { q: "Q3", value: 320 },
      { q: "Q4", value: 218 },
    ],
  },
  {
    name: "Apple AAPL",
    shares: "85 Shares",
    amount: "$340.00",
    data: [
      { q: "Q1", value: 60 },
      { q: "Q2", value: 70 },
      { q: "Q3", value: 120 },
      { q: "Q4", value: 90 },
    ],
  },
  {
    name: "Realty Income",
    shares: "320 Shares",
    amount: "$1,139.50",
    data: [
      { q: "Q1", value: 240 },
      { q: "Q2", value: 260 },
      { q: "Q3", value: 280 },
      { q: "Q4", value: 360 },
    ],
  },
];

const miniChartConfig = {
  value: {
    label: "Dividend",
    color: "var(--chart-2)",
  },
};

export const DividendIncome = <Msg>(h: Html.H<Msg>, options = {}) =>
  Card(h).children(
    CardHeader(h).children(
      CardTitle(h).children("Q2 Dividend Income"),
      CardDescription(h).children("Quarterly dividend payouts across your portfolio holdings."),
      CardAction(h).children(
        Button(h, { variant: "ghost", size: "icon-sm", class: "bg-muted" }).children(XIcon(h)),
      ),
    ),
    CardContent(h).children(
      ItemGroup(h).children(
        HOLDINGS.map((holding, index) =>
          Item(h, { variant: "muted" }).children(
            ItemContent(h).children(
              ItemTitle(h).children(holding.name),
              ItemDescription(h).children(holding.shares),
            ),
            ChartContainer(h, {
              key: holding.name,
              props: {
                id: `dividend-income-${index}`,
                config: miniChartConfig,
                data: holding.data,
                series: [{ dataKey: "value" }],
                type: "bar",
                categoryKey: "q",
                showGrid: false,
                showXAxis: false,
                showYAxis: false,
                class: "hidden h-8 w-24 md:block",
              },
            }),
            h.span
              .class("hidden text-sm font-semibold tabular-nums md:block")
              .children(holding.amount),
          ),
        ),
      ),
    ),
  );
