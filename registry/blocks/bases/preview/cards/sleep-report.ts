/**
 * SleepReport — shadcn/ui block `preview` (cards/sleep-report.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card with a stacked
 * Recharts `BarChart` (deep / light / rem, stackId "a") inside the
 * bases `ChartContainer`, a 4-up grid of sleep totals, and a footer
 * with a "Good" Badge and a handler-less "Details" Button. Here: a
 * named view function; the chart is the Effect-native `ChartContainer`
 * from `@/components/ui/chart.ts` fed the upstream data and config
 * verbatim as props (type "bar", categoryKey "hour", the three series
 * stacked under stackId "a"), and the rest of the markup and class
 * strings are byte-for-byte upstream.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Charts (D-4): recharts is banned and not reproduced. Upstream's
 *   per-Bar `radius` (0 / 0 / [2, 2, 0, 0]), `barSize={16}` and zero
 *   margins have no ChartContainer counterpart — the native engine
 *   draws square bars with its fixed margins. Upstream renders no
 *   tooltip, legend, grid or axes elements; the container's tooltip
 *   stays enabled (its default hover behavior) while grid and axes
 *   are switched off to match upstream's bare plot.
 * - Upstream's footer Button has no handler (a placeholder); here it
 *   is drawn without `onPress` — the same placeholder behavior.
 */
import type { Html } from "@effect/ui/html";
import { Badge } from "@/components/ui/badge.ts";
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

const sleepChartData = [
  { hour: "10pm", deep: 0, light: 30, rem: 0 },
  { hour: "11pm", deep: 20, light: 10, rem: 0 },
  { hour: "12am", deep: 40, light: 0, rem: 10 },
  { hour: "1am", deep: 30, light: 5, rem: 15 },
  { hour: "2am", deep: 10, light: 20, rem: 30 },
  { hour: "3am", deep: 25, light: 10, rem: 20 },
  { hour: "4am", deep: 15, light: 25, rem: 10 },
  { hour: "5am", deep: 5, light: 35, rem: 15 },
  { hour: "6am", deep: 0, light: 20, rem: 25 },
];

const sleepChartConfig = {
  deep: {
    label: "Deep",
    color: "var(--chart-1)",
  },
  light: {
    label: "Light",
    color: "var(--chart-2)",
  },
  rem: {
    label: "REM",
    color: "var(--chart-3)",
  },
};

export const SleepReport = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  Card(h, { class: options.class }).children(
    CardHeader(h).children(
      CardTitle(h).children("Sleep Report"),
      CardDescription(h).children("Last night · 7h 24m"),
    ),
    CardContent(h, { class: "flex flex-col gap-3" }).children(
      ChartContainer(h, {
        props: {
          id: "sleep-report",
          config: sleepChartConfig,
          data: sleepChartData,
          series: [
            { dataKey: "deep", stackId: "a" },
            { dataKey: "light", stackId: "a" },
            { dataKey: "rem", stackId: "a" },
          ],
          type: "bar",
          categoryKey: "hour",
          showGrid: false,
          showXAxis: false,
          showYAxis: false,
          class: "h-32 w-full",
        },
      }),
      h.div.class("grid grid-cols-4 gap-2").children(
        ...[
          { label: "Deep", value: "2h 10m" },
          { label: "Light", value: "3h 48m" },
          { label: "REM", value: "1h 26m" },
          { label: "Score", value: "84" },
        ].map((s) =>
          h.div
            .key(s.label)
            .class("text-center")
            .children(
              h.div.class("text-sm font-medium tabular-nums").children(s.value),
              h.div.class("text-xs text-muted-foreground").children(s.label),
            ),
        ),
      ),
    ),
    CardFooter(h).children(
      Badge(h, { variant: "outline" }).children("Good"),
      Button(h, { variant: "outline", size: "sm", class: "ml-auto" }).children("Details"),
    ),
  );
