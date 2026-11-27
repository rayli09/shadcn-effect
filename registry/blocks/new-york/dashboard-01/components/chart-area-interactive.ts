/**
 * ChartAreaInteractive — shadcn/ui block `dashboard-01`
 * (`registry/new-york-v4/blocks/dashboard-01/components/chart-area-interactive.tsx`),
 * ported 1:1 to Effect UI. Class strings, the chart data and the chart
 * config are verbatim from the source.
 *
 * Upstream: a React component holding `timeRange` in `useState`, filtering
 * the 91 days of data against a 2024-06-30 reference date, and composing
 * Recharts (`AreaChart` with two stacked `Area`s) inside this repo's
 * `ChartContainer` anatomy (Card + ToggleGroup/Select range switcher).
 * Here: an `Html.component` — `timeRange` and the range `Select`'s open
 * state live in the Model, the filter is the same date arithmetic in the
 * view, and the chart is OUR chart port (`@/components/ui/chart.ts`):
 * `type: "area"`, series `mobile` then `desktop` (upstream's Area order),
 * both `stackId: "a"`, `categoryKey: "date"`, tooltip indicator "dot".
 *
 * Declared divergences (anything else is a bug):
 *
 * - The Recharts gradient fills (`url(#fillDesktop)` / `url(#fillMobile)`)
 *   are NOT reproduced: the chart engine draws each area with its series
 *   color at a flat 0.25 opacity (the chart port's own declared
 *   simplification). The `type="natural"` curve likewise becomes the
 *   engine's path, and the engine's grid is its own (upstream's
 *   `CartesianGrid vertical={false}` matches its horizontal-only lines).
 * - The XAxis `tickFormatter` and the tooltip `labelFormatter` (both
 *   render dates as "Apr 1") have no counterpart in the chart port's
 *   props: axis ticks and the tooltip label show the datum's ISO date
 *   string verbatim.
 * - Upstream renders no `YAxis`; the engine draws one by default, so
 *   `showYAxis: false` is passed.
 * - `useIsMobile` + `useEffect` (mobile viewports start at "7d") is NOT
 *   reproduced: there is no viewport read available at `init`, so the
 *   range starts at "90d" on every viewport, as upstream's initial state
 *   does. The ToggleGroup and the Select both switch it.
 * - The range `Select`'s `aria-label` ("Select a value") and the items'
 *   `rounded-lg` classes are NOT reproduced — the Select port exposes
 *   trigger/content classes and size only. Its trigger and content
 *   classes and `size: "sm"` are upstream's.
 * - Upstream also exports a `description` constant ("An interactive area
 *   chart") — block metadata for the registry site, not UI; not ported.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart.ts";
import { Select } from "@/components/ui/select.ts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.ts";

const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
  { date: "2024-04-11", desktop: 327, mobile: 350 },
  { date: "2024-04-12", desktop: 292, mobile: 210 },
  { date: "2024-04-13", desktop: 342, mobile: 380 },
  { date: "2024-04-14", desktop: 137, mobile: 220 },
  { date: "2024-04-15", desktop: 120, mobile: 170 },
  { date: "2024-04-16", desktop: 138, mobile: 190 },
  { date: "2024-04-17", desktop: 446, mobile: 360 },
  { date: "2024-04-18", desktop: 364, mobile: 410 },
  { date: "2024-04-19", desktop: 243, mobile: 180 },
  { date: "2024-04-20", desktop: 89, mobile: 150 },
  { date: "2024-04-21", desktop: 137, mobile: 200 },
  { date: "2024-04-22", desktop: 224, mobile: 170 },
  { date: "2024-04-23", desktop: 138, mobile: 230 },
  { date: "2024-04-24", desktop: 387, mobile: 290 },
  { date: "2024-04-25", desktop: 215, mobile: 250 },
  { date: "2024-04-26", desktop: 75, mobile: 130 },
  { date: "2024-04-27", desktop: 383, mobile: 420 },
  { date: "2024-04-28", desktop: 122, mobile: 180 },
  { date: "2024-04-29", desktop: 315, mobile: 240 },
  { date: "2024-04-30", desktop: 454, mobile: 380 },
  { date: "2024-05-01", desktop: 165, mobile: 220 },
  { date: "2024-05-02", desktop: 293, mobile: 310 },
  { date: "2024-05-03", desktop: 247, mobile: 190 },
  { date: "2024-05-04", desktop: 385, mobile: 420 },
  { date: "2024-05-05", desktop: 481, mobile: 390 },
  { date: "2024-05-06", desktop: 498, mobile: 520 },
  { date: "2024-05-07", desktop: 388, mobile: 300 },
  { date: "2024-05-08", desktop: 149, mobile: 210 },
  { date: "2024-05-09", desktop: 227, mobile: 180 },
  { date: "2024-05-10", desktop: 293, mobile: 330 },
  { date: "2024-05-11", desktop: 335, mobile: 270 },
  { date: "2024-05-12", desktop: 197, mobile: 240 },
  { date: "2024-05-13", desktop: 197, mobile: 160 },
  { date: "2024-05-14", desktop: 448, mobile: 490 },
  { date: "2024-05-15", desktop: 473, mobile: 380 },
  { date: "2024-05-16", desktop: 338, mobile: 400 },
  { date: "2024-05-17", desktop: 499, mobile: 420 },
  { date: "2024-05-18", desktop: 315, mobile: 350 },
  { date: "2024-05-19", desktop: 235, mobile: 180 },
  { date: "2024-05-20", desktop: 177, mobile: 230 },
  { date: "2024-05-21", desktop: 82, mobile: 140 },
  { date: "2024-05-22", desktop: 81, mobile: 120 },
  { date: "2024-05-23", desktop: 252, mobile: 290 },
  { date: "2024-05-24", desktop: 294, mobile: 220 },
  { date: "2024-05-25", desktop: 201, mobile: 250 },
  { date: "2024-05-26", desktop: 213, mobile: 170 },
  { date: "2024-05-27", desktop: 420, mobile: 460 },
  { date: "2024-05-28", desktop: 233, mobile: 190 },
  { date: "2024-05-29", desktop: 78, mobile: 130 },
  { date: "2024-05-30", desktop: 340, mobile: 280 },
  { date: "2024-05-31", desktop: 178, mobile: 230 },
  { date: "2024-06-01", desktop: 178, mobile: 200 },
  { date: "2024-06-02", desktop: 470, mobile: 410 },
  { date: "2024-06-03", desktop: 103, mobile: 160 },
  { date: "2024-06-04", desktop: 439, mobile: 380 },
  { date: "2024-06-05", desktop: 88, mobile: 140 },
  { date: "2024-06-06", desktop: 294, mobile: 250 },
  { date: "2024-06-07", desktop: 323, mobile: 370 },
  { date: "2024-06-08", desktop: 385, mobile: 320 },
  { date: "2024-06-09", desktop: 438, mobile: 480 },
  { date: "2024-06-10", desktop: 155, mobile: 200 },
  { date: "2024-06-11", desktop: 92, mobile: 150 },
  { date: "2024-06-12", desktop: 492, mobile: 420 },
  { date: "2024-06-13", desktop: 81, mobile: 130 },
  { date: "2024-06-14", desktop: 426, mobile: 380 },
  { date: "2024-06-15", desktop: 307, mobile: 350 },
  { date: "2024-06-16", desktop: 371, mobile: 310 },
  { date: "2024-06-17", desktop: 475, mobile: 520 },
  { date: "2024-06-18", desktop: 107, mobile: 170 },
  { date: "2024-06-19", desktop: 341, mobile: 290 },
  { date: "2024-06-20", desktop: 408, mobile: 450 },
  { date: "2024-06-21", desktop: 169, mobile: 210 },
  { date: "2024-06-22", desktop: 317, mobile: 270 },
  { date: "2024-06-23", desktop: 480, mobile: 530 },
  { date: "2024-06-24", desktop: 132, mobile: 180 },
  { date: "2024-06-25", desktop: 141, mobile: 190 },
  { date: "2024-06-26", desktop: 434, mobile: 380 },
  { date: "2024-06-27", desktop: 448, mobile: 490 },
  { date: "2024-06-28", desktop: 149, mobile: 200 },
  { date: "2024-06-29", desktop: 103, mobile: 160 },
  { date: "2024-06-30", desktop: 446, mobile: 400 },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const ranges = [
  { value: "90d", label: "Last 3 months", days: 90 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "7d", label: "Last 7 days", days: 7 },
] as const;

export const ChartAreaInteractiveMessage = UiSchema.TaggedEnum({
  TimeRangeChanged: { value: Schema.String },
  RangeSelectOpened: {},
  RangeSelectClosed: {},
});

export const ChartAreaInteractive = Html.component({
  name: "ChartAreaInteractive",
  model: Schema.Struct({ timeRange: Schema.String, rangeSelectOpen: Schema.Boolean }),
  message: ChartAreaInteractiveMessage,
}).make({
  init: () => ({ timeRange: "90d", rangeSelectOpen: false }),
  update: {
    TimeRangeChanged: ($, { value }) => $.evolve({ timeRange: value, rangeSelectOpen: false }),
    RangeSelectOpened: ($) => $.evolve({ rangeSelectOpen: true }),
    RangeSelectClosed: ($) => $.evolve({ rangeSelectOpen: false }),
  },
  view: (h, model) => {
    const daysToSubtract = ranges.find((range) => range.value === model.timeRange)?.days ?? 90;
    const startDate = new Date("2024-06-30");
    startDate.setDate(startDate.getDate() - daysToSubtract);
    const startIso = startDate.toISOString().slice(0, 10);
    const filteredData = chartData.filter((item) => item.date >= startIso);
    return Card(h, { class: "@container/card" }).children(
      CardHeader(h).children(
        CardTitle(h).children("Total Visitors"),
        CardDescription(h).children(
          h.span.class("hidden @[540px]/card:block").children("Total for the last 3 months"),
          h.span.class("@[540px]/card:hidden").children("Last 3 months"),
        ),
        CardAction(h).children(
          ToggleGroup(h, {
            props: {
              value: [model.timeRange],
              items: ranges.map((range) => ({ value: range.value })),
            },
            onToggled: (values) =>
              values[0] === undefined
                ? undefined
                : ChartAreaInteractiveMessage.TimeRangeChanged({ value: values[0] }),
            variant: "outline",
            class: "hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex",
            view: (group) =>
              group
                .root(h.div)
                .children(
                  ranges.map((range) =>
                    ToggleGroupItem(group, { element: h.button, value: range.value }).children(
                      range.label,
                    ),
                  ),
                ),
          }),
          Select(h, {
            props: {
              open: model.rangeSelectOpen,
              value: model.timeRange,
              items: ranges.map((range) => ({ value: range.value, label: range.label })),
              placeholder: "Last 3 months",
            },
            size: "sm",
            triggerClass:
              "flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden",
            contentClass: "rounded-xl",
            onEmit: {
              RequestedOpen: () => ChartAreaInteractiveMessage.RangeSelectOpened(),
              RequestedClose: () => ChartAreaInteractiveMessage.RangeSelectClosed(),
              Picked: ({ value }) =>
                typeof value === "string"
                  ? ChartAreaInteractiveMessage.TimeRangeChanged({ value })
                  : undefined,
              Settled: () => undefined,
            },
          }),
        ),
      ),
      CardContent(h, { class: "px-2 pt-4 sm:px-6 sm:pt-6" }).children(
        ChartContainer(h, {
          props: {
            config: chartConfig,
            data: filteredData,
            series: [
              { dataKey: "mobile", kind: "area", stackId: "a" },
              { dataKey: "desktop", kind: "area", stackId: "a" },
            ],
            type: "area",
            categoryKey: "date",
            showYAxis: false,
            tooltipIndicator: "dot",
            class: "aspect-auto h-[250px] w-full",
          },
        }),
      ),
    );
  },
});
