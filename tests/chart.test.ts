import { UiSchema } from "@effect/ui";
import { Html, HtmlServer } from "@effect/ui/html";
import { Locator, Play, Scene, TestHost } from "@effect/ui/testing";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  CHART_CONTAINER_CLASS as BASE_CHART_CONTAINER_CLASS,
  CHART_TOOLTIP_CLASS as BASE_CHART_TOOLTIP_CLASS,
  ChartContainer as BaseChartContainer,
  ChartTooltipContent as BaseChartTooltipContent,
} from "../registry/bases/ui/chart.ts";
import {
  CHART_CONTAINER_CLASS,
  CHART_TOOLTIP_CLASS,
  ChartContainer,
  ChartTooltipContent,
} from "../registry/ui/chart.ts";

// Chart (wave 7, D-4 lifted) — the engine is a self-view Component, so
// the Scene pattern differs from the kit-child ports: a Scene made on a
// consumer renders a child component as an opaque stand-in, but a
// Scene made on ChartContainer itself evaluates its view with the init
// Model (hover starts empty). Rendering assertions therefore Scene the
// component directly and server-render it to a string; the hover walk
// is a Play on a small consumer, where the child's update runs for
// real and its ActiveChanged event lands in the consumer's Model.

const chartData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
];

const chartConfig = {
  desktop: { label: "Desktop", color: "#2563eb" },
  mobile: { label: "Mobile", color: "#60a5fa" },
};

const barProps = {
  id: "visitors",
  config: chartConfig,
  data: chartData,
  series: [{ dataKey: "desktop" }, { dataKey: "mobile" }],
  type: "bar",
  categoryKey: "month",
  showLegend: true,
} as const;

const lineProps = { ...barProps, type: "line", showLegend: false } as const;

const DemoMessage = UiSchema.TaggedEnum({
  ActiveChanged: { index: Schema.NullOr(Schema.Number) },
});

const BarDemo = Html.component({
  name: "BarChartDemo",
  model: Schema.Struct({ active: Schema.String }),
  message: DemoMessage,
}).make({
  init: () => ({ active: "none" }),
  update: {
    ActiveChanged: ($, { index }) => $.evolve({ active: index === null ? "none" : String(index) }),
  },
  view: (h, model) =>
    h.div.children(
      ChartContainer(h, {
        props: barProps,
        onEmit: {
          ActiveChanged: ({ index }) => DemoMessage.ActiveChanged({ index }),
        },
      }),
      h.output.attr("data-slot", "active-readout").children(model.active),
    ),
});

const root = Locator.attr("data-slot", "chart");
const tooltip = Locator.attr("data-slot", "chart-tooltip");
const legend = Locator.attr("data-slot", "chart-legend");
const readout = Locator.attr("data-slot", "active-readout");
const bars = Locator.attr("class", "recharts-rectangle");
const gridLines = Locator.attr("class", "recharts-cartesian-grid_line");
const hitBands = Locator.attr("data-slot", "chart-hit");
const hit1 = Locator.attr("data-index", "1");

describe("Chart (shadcn-effect port, new-york)", () => {
  it.effect("bar chart renders: container anatomy, bars, grid, legend", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(ChartContainer, barProps);
      const attrs = scene.get(root).attrs;
      assert.strictEqual(attrs?.["data-chart"], "chart-visitors");
      // No consumer class: the root carries the upstream string verbatim.
      assert.strictEqual(attrs?.class, CHART_CONTAINER_CLASS);

      // One bar per datum per series (3 x 2), colored via the config's
      // --color-* variables; the scale is nice-ticked to [0, 400], so
      // Jan desktop (186) is 78.12 tall in the 320x200 viewBox, and
      // each grouped column is 25.6 wide.
      scene.expect(bars).toHaveCount(6);
      const firstBar = scene.all(bars)[0]?.attrs;
      assert.strictEqual(firstBar?.fill, "var(--color-desktop)");
      assert.strictEqual(firstBar?.height, "78.12");
      assert.strictEqual(firstBar?.width, "25.6");

      // Grid lines at the five ticks, one hit band per category, and
      // no tooltip before any hover.
      scene.expect(gridLines).toHaveCount(5);
      scene.expect(hitBands).toHaveCount(3);
      scene.expect(tooltip).toHaveCount(0);

      // The legend resolves labels through the config.
      scene.expect(legend).toExist();
      scene.expect(Locator.text("Desktop")).toExist();
      scene.expect(Locator.text("Mobile")).toExist();
    }),
  );

  it.effect("the ChartStyle stylesheet lands in the server-rendered string", () =>
    Effect.gen(function* () {
      const { html } = yield* HtmlServer.renderToHtml(BarDemo, {});
      assert.include(html, "[data-chart=chart-visitors]");
      assert.include(html, "--color-desktop: #2563eb;");
      assert.include(html, "--color-mobile: #60a5fa;");
      // The dark block is scoped under .dark, as upstream's THEMES map.
      assert.include(html, ".dark [data-chart=chart-visitors]");
    }),
  );

  it.effect("line chart renders: one curve per series, dots at the data points", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(ChartContainer, lineProps);
      assert.strictEqual(scene.get(root).attrs?.class, CHART_CONTAINER_CLASS);
      scene.expect(Locator.attr("class", "recharts-curve")).toHaveCount(2);
      const dots = Locator.attr("class", "recharts-dot");
      scene.expect(dots).toHaveCount(6);
      assert.strictEqual(scene.all(dots)[0]?.attrs?.fill, "var(--color-desktop)");
      // No legend was asked for.
      scene.expect(legend).toHaveCount(0);
    }),
  );

  it.effect("a Play: hovering a band raises the tooltip for that datum, leaving clears it", () =>
    Effect.gen(function* () {
      const play = yield* Play.make(BarDemo, {});
      yield* play.expect(tooltip).toHaveCount(0);

      // Enter the Feb band: the child's Hovered update runs, the
      // ActiveChanged event reaches the consumer, and the tooltip
      // renders Feb's payload (label + both series values).
      yield* play.fire(hit1, "mouseenter");
      yield* play.expect(tooltip).toExist();
      yield* play.expect(readout).toHaveText("1");
      yield* play.expect(Locator.text("Feb")).toExist();
      yield* play.expect(Locator.text("305")).toExist();
      yield* play.expect(Locator.text("200")).toExist();

      // Leaving the band clears the hover everywhere.
      yield* play.fire(hit1, "mouseleave");
      yield* play.expect(tooltip).toHaveCount(0);
      yield* play.expect(readout).toHaveText("none");
    }).pipe(Effect.provide(TestHost.layer())),
  );

  it.effect("ChartTooltipContent standalone: label, config label, formatted value", () =>
    Effect.gen(function* () {
      const TooltipDemo = Html.component({
        name: "TooltipDemo",
        model: Schema.Struct({ shown: Schema.Boolean }),
        message: UiSchema.TaggedEnum({ Shown: {} }),
      }).make({
        init: () => ({ shown: true }),
        update: { Shown: ($) => $.evolve({ shown: true }) },
        view: (h) =>
          h.div.children(
            ChartTooltipContent(h, {
              config: chartConfig,
              active: true,
              label: "Feb",
              payload: [
                {
                  name: "desktop",
                  dataKey: "desktop",
                  value: 305,
                  color: "#2563eb",
                  payload: chartData[1],
                },
              ],
            }),
          ),
      });
      const scene = yield* Scene.make(TooltipDemo, {});
      const attrs = scene.get(tooltip).attrs;
      assert.strictEqual(attrs?.class, CHART_TOOLTIP_CLASS);
      scene.expect(Locator.text("Feb")).toExist();
      scene.expect(Locator.text("Desktop")).toExist();
      scene.expect(Locator.text("305")).toExist();
    }),
  );
});

describe("Chart (bases generation)", () => {
  it.effect("renders with the cn-chart hook layer; tooltip root is the cn-chart-tooltip hook", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(BaseChartContainer, barProps);
      const attrs = scene.get(root).attrs;
      assert.strictEqual(attrs?.class, BASE_CHART_CONTAINER_CLASS);
      assert.isTrue(BASE_CHART_CONTAINER_CLASS.startsWith("cn-chart "));
      // Same engine, same geometry: the drawing is identical.
      scene.expect(bars).toHaveCount(6);
      assert.strictEqual(scene.all(bars)[0]?.attrs?.fill, "var(--color-desktop)");

      const TooltipDemo = Html.component({
        name: "BasesTooltipDemo",
        model: Schema.Struct({ shown: Schema.Boolean }),
        message: UiSchema.TaggedEnum({ Shown: {} }),
      }).make({
        init: () => ({ shown: true }),
        update: { Shown: ($) => $.evolve({ shown: true }) },
        view: (h) =>
          h.div.children(
            BaseChartTooltipContent(h, {
              config: chartConfig,
              active: true,
              label: "Feb",
              payload: [
                {
                  name: "desktop",
                  dataKey: "desktop",
                  value: 305,
                  color: "#2563eb",
                  payload: chartData[1],
                },
              ],
            }),
          ),
      });
      const tooltipScene = yield* Scene.make(TooltipDemo, {});
      assert.strictEqual(tooltipScene.get(tooltip).attrs?.class, BASE_CHART_TOOLTIP_CLASS);
      assert.isTrue(BASE_CHART_TOOLTIP_CLASS.startsWith("cn-chart-tooltip "));
    }),
  );
});
