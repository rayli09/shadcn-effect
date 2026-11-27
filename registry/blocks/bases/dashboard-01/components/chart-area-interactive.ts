/**
 * ChartAreaInteractive — from the upstream bases block `dashboard-01`
 * (`registry/bases/radix/blocks/dashboard-01/components/chart-area-interactive.tsx`),
 * ported 1:1 to Effect UI. Class strings, the chart data and the
 * chart config are verbatim from the source.
 *
 * Pairs with the `base-*` ui items (see site-header.ts's header). In
 * particular the chart is the bases chart port (`base-chart`): the
 * import below says `@/components/ui/chart.ts` because the bases
 * item installs to the same path as the new-york one.
 *
 * Upstream is a client component holding `timeRange` in React state;
 * here it is an `Html.component` whose Model owns the range, and the
 * ToggleGroup / Select / ChartContainer are hosted as child
 * components wired to its Messages. The date filtering is upstream's
 * own code, run in the view.
 *
 * Declared divergences (anything else is a bug):
 *
 * - `useIsMobile` + the effect that forces `"7d"` on mobile become a
 *   media-query subscription (`(max-width: 767px)`, the hook's own
 *   breakpoint) feeding `ChangedViewport`; the update applies
 *   upstream's effect exactly: when the viewport becomes mobile, the
 *   range is set to `"7d"`.
 * - The chart engine is this repo's (see the chart port's header):
 *   the two `<linearGradient>` fills are NOT reproduced — the engine
 *   fills each area with its series color at 0.25 opacity (chart
 *   port divergence 3), and the areas are stacked via `stackId: "a"`
 *   on both series, mobile first, as upstream orders them. The
 *   config is upstream's verbatim (both series colored
 *   `var(--primary)`, so the published `--color-desktop` /
 *   `--color-mobile` variables the gradients read are the same
 *   color the engine fills with).
 * - `type="natural"` (Recharts' curve interpolation) has no engine
 *   option; the area path is the engine's own.
 * - The X axis' `tickFormatter` (short dates) and `minTickGap` are
 *   not engine options: category labels render as the raw
 *   `"2024-04-01"` strings. The tooltip's `labelFormatter` is
 *   likewise not an engine option — the tooltip heads with the raw
 *   category value; `indicator="dot"` IS supported and passed as
 *   `tooltipIndicator: "dot"`. `cursor={false}` matches the engine,
 *   which draws no cursor.
 * - The Select's trigger `aria-label="Select a value"` and the
 *   items' `rounded-lg` classes are not reproducible: the select
 *   port draws its own trigger and items and exposes neither
 *   attribute nor per-item classes. `SelectValue`'s placeholder IS
 *   the kit's `placeholder` prop, passed verbatim. The trigger and
 *   content classes are the port's `triggerClass` / `contentClass`.
 * - The ToggleGroup's `onValueChange` receives the kit's value
 *   array; an emptied group maps to `""`, which falls into the
 *   filter's 90-day default branch exactly as upstream's `""` did.
 */
import * as Html from "@effect/ui/html/Html";
import { HtmlSubscription } from "@effect/ui/html";
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

export const description = "An interactive area chart";

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

export const ChartAreaInteractiveMessage = UiSchema.TaggedEnum({
  /** The mobile media query changed (the `useIsMobile` replacement). */
  ChangedViewport: { isMobile: Schema.Boolean },
  /** The range changed, from either the ToggleGroup or the Select. */
  SelectedTimeRange: { value: Schema.String },
  /** The range Select asked to open or close. */
  ChangedSelectOpen: { open: Schema.Boolean },
});

export const ChartAreaInteractiveModel = Schema.Struct({
  timeRange: Schema.String,
  isMobile: Schema.Boolean,
  selectOpen: Schema.Boolean,
});
export type ChartAreaInteractiveModel = typeof ChartAreaInteractiveModel.Type;

export const ChartAreaInteractive = Html.component({
  name: "Dashboard01ChartAreaInteractive",
  model: ChartAreaInteractiveModel,
  message: ChartAreaInteractiveMessage,
}).make({
  init: () => ({ timeRange: "90d", isMobile: false, selectOpen: false }),
  update: {
    // Upstream's effect: `if (isMobile) setTimeRange("7d")`, run
    // whenever the hook's value changes.
    ChangedViewport: ($, { isMobile }) =>
      isMobile ? $.evolve({ isMobile, timeRange: "7d" }) : $.evolve({ isMobile }),
    SelectedTimeRange: ($, { value }) => $.evolve({ timeRange: value, selectOpen: false }),
    ChangedSelectOpen: ($, { open }) => $.evolve({ selectOpen: open }),
  },
  subscriptions: () => [
    HtmlSubscription.onMediaQuery("(max-width: 767px)", (matches) =>
      ChartAreaInteractiveMessage.ChangedViewport({ isMobile: matches }),
    ),
  ],
  view: (h, model) => {
    const filteredData = chartData.filter((item) => {
      const date = new Date(item.date);
      const referenceDate = new Date("2024-06-30");
      let daysToSubtract = 90;
      if (model.timeRange === "30d") {
        daysToSubtract = 30;
      } else if (model.timeRange === "7d") {
        daysToSubtract = 7;
      }
      const startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - daysToSubtract);
      return date >= startDate;
    });
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
              value: model.timeRange === "" ? [] : [model.timeRange],
              items: [{ value: "90d" }, { value: "30d" }, { value: "7d" }],
            },
            onToggled: (value) =>
              ChartAreaInteractiveMessage.SelectedTimeRange({ value: value[0] ?? "" }),
            variant: "outline",
            class: "hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex",
            view: (group) =>
              group
                .root(h.div)
                .children(
                  ToggleGroupItem(group, { element: h.button, value: "90d" }).children(
                    "Last 3 months",
                  ),
                  ToggleGroupItem(group, { element: h.button, value: "30d" }).children(
                    "Last 30 days",
                  ),
                  ToggleGroupItem(group, { element: h.button, value: "7d" }).children(
                    "Last 7 days",
                  ),
                ),
          }),
          Select(h, {
            props: {
              open: model.selectOpen,
              value: model.timeRange === "" ? undefined : model.timeRange,
              placeholder: "Last 3 months",
              items: [
                { value: "90d", label: "Last 3 months" },
                { value: "30d", label: "Last 30 days" },
                { value: "7d", label: "Last 7 days" },
              ],
            },
            onEmit: {
              RequestedOpen: () => ChartAreaInteractiveMessage.ChangedSelectOpen({ open: true }),
              RequestedClose: () => ChartAreaInteractiveMessage.ChangedSelectOpen({ open: false }),
              Picked: ({ value }) =>
                ChartAreaInteractiveMessage.SelectedTimeRange({ value: String(value) }),
              Settled: () => undefined,
            },
            size: "sm",
            triggerClass:
              "flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden",
            contentClass: "rounded-xl",
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
            tooltipIndicator: "dot",
            class: "aspect-auto h-[250px] w-full",
          },
          onEmit: {
            ActiveChanged: () => undefined,
          },
        }),
      ),
    );
  },
});
