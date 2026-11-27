/**
 * PowerUsage — shadcn/ui block `preview-02` (cards/power-usage.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a "use client" React function rendering a Card with a
 * Recharts bar chart of hourly power usage (data and config below,
 * verbatim) over a Separator, a two-up stats grid, and a footer with a
 * battery-level Progress bar. Here: a pure view function — the card
 * itself keeps no state (the chart's hover state lives inside the
 * `ChartContainer` child component) — composing the same data/config
 * into this repo's Effect-native `ChartContainer` from
 * `@/components/ui/chart.ts`. Recharts is never imported.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Create-app internals are not ported: upstream reads
 *   `useDesignSystemSearchParams()` to square the bar corners on the
 *   lyra/sera styles (`radius={isRounded ? [4, 4, 0, 0] : 0}`).
 *   Default-selection rendering is the rounded form, but the chart
 *   engine has no bar-radius prop and draws square bars — the nearest
 *   supported form.
 * - The engine's margins and axis geometry are fixed, so upstream's
 *   `margin={{ left: 0, right: 0, top: 4, bottom: 0 }}`, the XAxis
 *   `tickMargin={6}` / `tickLine={false}` / `axisLine={false}` and its
 *   `text-xs` class map onto the engine's own axis rendering; the
 *   category axis is on (`showXAxis`, the default) and, as upstream
 *   draws neither, the grid and Y axis are off (`showGrid: false`,
 *   `showYAxis: false`).
 * - Upstream's tooltip is `cursor={false}` with
 *   `<ChartTooltipContent hideLabel />`; the container's tooltip takes
 *   no cursor or hide-label props, so it renders in the engine's
 *   default form (label shown, `tooltipIndicator` unset).
 */
import type { Html } from "@effect/ui/html";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { ChartContainer } from "@/components/ui/chart.ts";
import { Progress } from "@/components/ui/progress.ts";
import { Separator } from "@/components/ui/separator.ts";

const chartData = [
  { hour: "6a", usage: 1.2 },
  { hour: "8a", usage: 2.8 },
  { hour: "10a", usage: 3.1 },
  { hour: "12p", usage: 2.4 },
  { hour: "2p", usage: 3.4 },
  { hour: "4p", usage: 2.9 },
  { hour: "6p", usage: 3.8 },
  { hour: "8p", usage: 3.2 },
];

const chartConfig = {
  usage: {
    label: "Usage (kW)",
    color: "var(--chart-2)",
  },
};

export const PowerUsage = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  Card(h, { class: options.class }).children(
    CardHeader(h).children(
      CardTitle(h).children("Power Usage"),
      CardDescription(h).children("Whole Home"),
    ),
    CardContent(h, { class: "flex flex-col gap-4" }).children(
      ChartContainer(h, {
        props: {
          config: chartConfig,
          data: chartData,
          series: [{ dataKey: "usage", kind: "bar" }],
          type: "bar",
          categoryKey: "hour",
          showGrid: false,
          showYAxis: false,
          class: "h-[140px] w-full",
        },
      }),
      Separator(h),
      h.div
        .class("grid grid-cols-2 gap-4")
        .children(
          h.div
            .class("flex flex-col gap-0.5")
            .children(
              h.span.class("text-sm text-muted-foreground").children("Currently Using"),
              h.span.class("text-lg font-semibold tabular-nums").children("3.4 kW"),
            ),
          h.div
            .class("flex flex-col gap-0.5")
            .children(
              h.span.class("text-sm text-muted-foreground").children("Solar Gen"),
              h.span.class("text-lg font-semibold text-chart-1 tabular-nums").children("+1.2 kW"),
            ),
        ),
    ),
    CardFooter(h, { class: "flex-col items-start gap-1" }).children(
      h.span.class("text-sm text-muted-foreground").children("Battery Level"),
      h.div
        .class("flex w-full items-center gap-2")
        .children(
          Progress(h, { props: { value: 85 }, class: "flex-1" }),
          h.span.class("text-sm font-medium tabular-nums").children("85%"),
        ),
    ),
  );
