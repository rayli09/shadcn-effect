/**
 * Chart — shadcn/ui `chart` ported 1:1 to Effect UI (D-4 lifted).
 *
 * Upstream wraps Recharts: a `ChartContainer` div (data-slot="chart")
 * holding a `ChartStyle` <style> that publishes each config entry's
 * color as a `--color-<key>` CSS variable, a ResponsiveContainer, and
 * whatever Recharts composition the consumer nests inside; plus
 * `ChartTooltipContent` / `ChartLegendContent`, the styled tooltip and
 * legend bodies Recharts feeds with computed payload state. Recharts is
 * a React-only engine, so the engine here is Effect-native:
 *
 * - `ChartContainer` is a Component (Schema Model + TaggedEnum
 *   Messages). Its props are data: `{ config, data, series }` plus the
 *   chart `type` ("bar" | "line" | "area" | "pie", with a per-series
 *   `kind` override — Recharts' composed charts), a `categoryKey`, and
 *   the plot `width` / `height` (the viewBox; upstream's
 *   INITIAL_DIMENSION 320×200 by default — the container div keeps
 *   upstream's responsive `aspect-video` class). The view draws real
 *   SVG from that data: cartesian grid + axis ticks, bars (grouped or
 *   `stackId`-stacked), line paths with dots, area paths (stacked the
 *   same way), pie slices. Scales are small pure helpers in this file
 *   (linear scale with nice ticks, band layout, arc paths) — no
 *   external dependencies.
 * - Hover is the Model's `activeIndex`. The plot carries one invisible
 *   hit rect per category band (pie: the slice itself) whose
 *   mouseenter / mouseleave send `Hovered` / `HoverCleared`; the update
 *   stores the index and emits `ActiveChanged`, and the tooltip overlay
 *   re-renders at the active datum's anchor with a payload built
 *   exactly the way Recharts builds one (`{ name, dataKey, value,
 *   color, payload }` per series), fed to the same
 *   `ChartTooltipContent` a consumer can use standalone.
 * - `ChartStyle`, `ChartTooltipContent` and `ChartLegendContent` are
 *   view functions with upstream's logic ported line-for-line where it
 *   is data, not React: the config → `--color-*` stylesheet, the label
 *   resolution (`getPayloadConfigFromPayload`, verbatim), the
 *   dot/line/dashed indicators, the legend swatches. Upstream reads the
 *   config from React context; here it is an explicit `config` option
 *   (the Effect-native replacement for `useChart()`).
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings; the
 * parity checker asserts every token in
 * `parity/upstream-tokens.json["chart"]`. The SVG elements carry the
 * Recharts class names upstream's container selectors key on
 * (`recharts-surface`, `recharts-layer`, `recharts-cartesian-grid`
 * lines at stroke "#ccc", `recharts-cartesian-axis-tick`,
 * `recharts-dot`, `recharts-sector`, the tooltip cursor), so the
 * verbatim container class actually styles the drawing.
 *
 * Declared divergences (everything not listed is a bug):
 *
 * 1. No arbitrary Recharts composition. `ChartTooltip` / `ChartLegend`
 *    (upstream's re-exports of the Recharts primitives) are not
 *    reproduced, and neither are XAxis/YAxis/CartesianGrid/Bar/Line/…
 *    elements, ReferenceLine, Brush, gradients or animations. What is
 *    provided is the data-driven builder surface above (bar, line,
 *    area, pie; grouped + stacked; grid and axes on/off) plus the
 *    container / tooltip / legend anatomy and classes 1:1.
 * 2. `ChartConfig`'s `label` is text (a string), not a ReactNode, and
 *    `icon` is an icon builder `(h) => View.Content` (this repo's
 *    lucide builders fit), not a React component type. The container's
 *    props are Schema data, so its built-in tooltip/legend honor
 *    `label` / `color` / `theme`; `icon` is honored by the standalone
 *    `ChartTooltipContent` / `ChartLegendContent`, which take the full
 *    `ChartConfig`.
 * 3. Geometry simplifications, all deterministic: the value domain
 *    always includes zero when a bar or area series is present (line-
 *    only charts get an auto domain), ticks are nice numbers
 *    (1/2/5×10^k, ~5), margins are fixed (8/8/24/36), bars are square
 *    (no `radius` prop), line dots are always drawn, area fill is the
 *    series color at 0.25 opacity, pie uses the first series only and
 *    draws no labels. Series colors are `var(--color-<dataKey>)` when
 *    the config colors that key (what `ChartStyle` emits), else the
 *    theme's `--chart-1`…`--chart-5` in order.
 * 4. DOM shape: upstream's ResponsiveContainer div is a single wrapper
 *    div here (a flex column holding the plot box and the optional
 *    legend); the tooltip is absolutely positioned over the plot at
 *    the active datum's anchor (upstream positions Recharts' tooltip
 *    layer by cursor). The legend is in-flow below (or above) the
 *    plot, so with a legend the container's total height grows past
 *    its `aspect-video` box. `data-slot="chart-tooltip"` /
 *    `data-slot="chart-legend"` are stamped on the content roots (and
 *    `data-slot="chart-hit"` on the hit rects) so tests and consumers
 *    can locate the pieces; upstream stamps only `data-slot="chart"`.
 * 5. No accessibility layer (upstream's own props Omit it), no touch
 *    hover (mouseenter/mouseleave only), and `id` defaults to "chart":
 *    pass an explicit `id` when mounting several charts whose configs
 *    differ, as upstream's generated ids keep their `--color-*`
 *    scopes apart.
 */
import * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Upstream constants (verbatim)
// ---------------------------------------------------------------------------

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

const INITIAL_DIMENSION = { width: 320, height: 200 } as const;

// ---------------------------------------------------------------------------
// Config + payload types (upstream's shapes; label/icon adapted, header #2)
// ---------------------------------------------------------------------------

/** An icon in a chart config: one of this repo's inline SVG builders. */
export type ChartConfigIcon = <Msg>(h: Html.H<Msg>) => View.Content<Msg>;

export type ChartConfig = Record<
  string,
  {
    label?: string | undefined;
    icon?: ChartConfigIcon | undefined;
  } & (
    | { color?: string | undefined; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>;

/**
 * The loose entry shape the style / tooltip / legend functions read:
 * both `ChartConfig` entries and the container props' data-only
 * entries are assignable to it (the xor above is a construction-time
 * nicety; at read time `theme` simply wins over `color`, as upstream's
 * `theme?.[t] ?? color` does).
 */
export interface ChartConfigEntryLike {
  readonly label?: string | undefined;
  readonly icon?: ChartConfigIcon | undefined;
  readonly color?: string | undefined;
  readonly theme?: Record<keyof typeof THEMES, string> | undefined;
}

export type ChartConfigLike = Record<string, ChartConfigEntryLike>;

/**
 * One entry of a tooltip payload, Recharts' shape as data: `name` /
 * `dataKey` identify the series, `value` is the datum's value for it,
 * `color` the series color, `payload` the datum row itself (which may
 * carry a `fill`, as pie cells do), `type` filters rows out when it is
 * "none".
 */
export interface ChartPayloadItem {
  readonly name?: string | number | undefined;
  readonly dataKey?: string | number | undefined;
  readonly value?: number | string | undefined;
  readonly color?: string | undefined;
  readonly type?: string | undefined;
  readonly payload?: (ChartDatum & { readonly fill?: string | undefined }) | undefined;
}

/** One entry of a legend payload: a series (or pie slice) + its color. */
export interface ChartLegendItem {
  readonly dataKey?: string | number | undefined;
  readonly color?: string | undefined;
  readonly type?: string | undefined;
  readonly payload?: ChartDatum | undefined;
}

// ---------------------------------------------------------------------------
// Props / Model / Messages / Events (Schema data — header #2)
// ---------------------------------------------------------------------------

/** The data-only part of a `ChartConfig` entry (what props can carry). */
export const ChartConfigEntry = Schema.Struct({
  label: Schema.optional(Schema.String),
  color: Schema.optional(Schema.String),
  theme: Schema.optional(Schema.Struct({ light: Schema.String, dark: Schema.String })),
});
export type ChartConfigEntry = typeof ChartConfigEntry.Type;

/** One data row: category/series values by key. */
export const ChartDatum = Schema.Record(
  Schema.String,
  Schema.Union([Schema.Number, Schema.String, Schema.Null]),
);
export type ChartDatum = typeof ChartDatum.Type;

export const ChartSeriesKind = Schema.Literals(["bar", "line", "area", "pie"]);
export type ChartSeriesKind = typeof ChartSeriesKind.Type;

/** One series: which data key to draw, how, and in which stack. */
export const ChartSeriesDefinition = Schema.Struct({
  dataKey: Schema.String,
  kind: Schema.optional(ChartSeriesKind),
  stackId: Schema.optional(Schema.String),
});
export type ChartSeriesDefinition = typeof ChartSeriesDefinition.Type;

export const ChartContainerProps = Schema.Struct({
  /** Chart id; scopes the `--color-*` variables (upstream's `id`). */
  id: Schema.optional(Schema.String),
  config: Schema.Record(Schema.String, ChartConfigEntry),
  data: Schema.Array(ChartDatum),
  series: Schema.Array(ChartSeriesDefinition),
  /** Chart-level kind; a series' own `kind` overrides it. */
  type: Schema.optional(ChartSeriesKind),
  /** The data key holding each row's category label. Default "name". */
  categoryKey: Schema.optional(Schema.String),
  /** Plot viewBox size; defaults to upstream's INITIAL_DIMENSION. */
  width: Schema.optional(Schema.Number),
  height: Schema.optional(Schema.Number),
  showGrid: Schema.optional(Schema.Boolean),
  showXAxis: Schema.optional(Schema.Boolean),
  showYAxis: Schema.optional(Schema.Boolean),
  showTooltip: Schema.optional(Schema.Boolean),
  showLegend: Schema.optional(Schema.Boolean),
  legendAlign: Schema.optional(Schema.Literals(["top", "bottom"])),
  /** Tooltip indicator, as upstream's ChartTooltipContent option. */
  tooltipIndicator: Schema.optional(Schema.Literals(["line", "dot", "dashed"])),
  class: Schema.optional(Schema.String),
});
export type ChartContainerProps = typeof ChartContainerProps.Type;

export const ChartModel = Schema.Struct({
  /** The hovered datum index, or null when nothing is hovered. */
  activeIndex: Schema.NullOr(Schema.Number),
});
export type ChartModel = typeof ChartModel.Type;

export const ChartMessage = UiSchema.TaggedEnum({
  /** The pointer entered a datum's hit area (band rect or pie slice). */
  Hovered: { index: Schema.Number },
  /** The pointer left the datum / the plot. */
  HoverCleared: {},
});
export type ChartMessage = typeof ChartMessage.Type;

export const ChartEvents = UiSchema.TaggedEnum({
  /** The active datum changed (upstream's tooltip `active` flip). */
  ActiveChanged: { index: Schema.NullOr(Schema.Number) },
});
export type ChartEvents = typeof ChartEvents.Type;

/** A node of the chart's own view tree. */
type ChartNode = View.Content<ChartMessage, never>;

// ---------------------------------------------------------------------------
// Class strings (byte-for-byte upstream new-york-v4)
// ---------------------------------------------------------------------------

export const CHART_CONTAINER_CLASS =
  "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden";

export const CHART_TOOLTIP_CLASS =
  "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl";

export const CHART_TOOLTIP_ITEM_CLASS =
  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground";

export const CHART_LEGEND_CLASS = "flex items-center justify-center gap-4";

export const CHART_LEGEND_ITEM_CLASS =
  "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground";

// ---------------------------------------------------------------------------
// Pure helpers: payload config lookup (verbatim), style text, scales
// ---------------------------------------------------------------------------

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfigLike, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

/** React-style inline style record → CSS text (camelCase → kebab-case). */
const styleText = (style: Readonly<Record<string, string>>): string =>
  Object.entries(style)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}: ${value}`)
    .join("; ");

/** Attribute number formatting: at most two decimals, no trailing zeros. */
const fmt = (value: number): string => String(Math.round(value * 100) / 100);

/** A datum's numeric value for a key (non-numbers draw as 0). */
const num = (value: number | string | null | undefined): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

/** The fallback series palette: the theme's chart colors, in order. */
const FALLBACK_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

/**
 * The color a series (or pie slice, by category key) draws with:
 * `var(--color-<key>)` when the config colors that key — the variable
 * `ChartStyle` emits — else the fallback palette by position.
 */
const seriesColor = (
  config: Readonly<Record<string, ChartConfigEntry>>,
  key: string,
  index: number,
): string => {
  const entry = config[key];
  return entry !== undefined && (entry.color !== undefined || entry.theme !== undefined)
    ? `var(--color-${key})`
    : FALLBACK_COLORS[index % FALLBACK_COLORS.length]!;
};

/** A linear scale from a value domain onto a pixel range. */
const linearScale = (
  domain: readonly [number, number],
  range: readonly [number, number],
): ((value: number) => number) => {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 === 0 ? 1 : d1 - d0;
  return (value) => r0 + ((value - d0) / span) * (r1 - r0);
};

/**
 * Nice-number ticks covering [min, max]: the domain snaps outward to
 * 1/2/5×10^k steps, ~`count` of them.
 */
const niceTicks = (
  min: number,
  max: number,
  count = 5,
): { domain: [number, number]; ticks: ReadonlyArray<number> } => {
  let lo = min;
  let hi = max;
  if (lo === hi) {
    lo -= 1;
    hi += 1;
  }
  const rawStep = (hi - lo) / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag;
  const domainLo = Math.floor(lo / step) * step;
  const domainHi = Math.ceil(hi / step) * step;
  const ticks: Array<number> = [];
  for (let v = domainLo; v <= domainHi + step / 2; v += step) {
    ticks.push(Math.round(v * 1e10) / 1e10);
  }
  return { domain: [domainLo, domainHi], ticks };
};

/** A polyline path through points (a line series' curve). */
const linePath = (points: ReadonlyArray<readonly [number, number]>): string =>
  points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${fmt(x)},${fmt(y)}`).join(" ");

/** A closed area path: along the top points, back along the base points. */
const areaPath = (
  top: ReadonlyArray<readonly [number, number]>,
  base: ReadonlyArray<readonly [number, number]>,
): string =>
  `${linePath(top)} ${[...base]
    .reverse()
    .map(([x, y]) => `L${fmt(x)},${fmt(y)}`)
    .join(" ")} Z`;

/** One pie slice's path (a wedge from the center). */
const arcPath = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string => {
  const x0 = cx + r * Math.cos(startAngle);
  const y0 = cy + r * Math.sin(startAngle);
  const x1 = cx + r * Math.cos(endAngle);
  const y1 = cy + r * Math.sin(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M${fmt(cx)},${fmt(cy)} L${fmt(x0)},${fmt(y0)} A${fmt(r)},${fmt(r)} 0 ${largeArc} 1 ${fmt(x1)},${fmt(y1)} Z`;
};

/** Axis tick text: integers plain, fractions to two decimals. */
const formatTick = (value: number): string =>
  Number.isInteger(value) ? String(value) : fmt(value);

// ---------------------------------------------------------------------------
// ChartStyle — the config → `--color-*` stylesheet (upstream, verbatim logic)
// ---------------------------------------------------------------------------

const chartStyleInner = (
  id: string,
  config: ChartConfigLike,
): { readonly __html: string } | undefined => {
  const colorConfig = Object.entries(config).filter(([, config]) => config.theme ?? config.color);

  if (!colorConfig.length) {
    return undefined;
  }

  const __html = Object.entries(THEMES)
    .map(
      ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ?? itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`,
    )
    .join("\n");
  return { __html };
};

/**
 * The <style> publishing each config entry's color as `--color-<key>`,
 * scoped to `[data-chart=<id>]`, light + `.dark` (upstream's ChartStyle).
 * Renders nothing when no entry carries a color.
 */
export const ChartStyle = <Msg, R = never>(
  h: Html.H<Msg>,
  options: { readonly id: string; readonly config: ChartConfigLike },
) => {
  const inner = chartStyleInner(options.id, options.config);
  return inner === undefined ? undefined : h.el("style").children(inner.__html);
};

// ---------------------------------------------------------------------------
// ChartTooltipContent — the styled tooltip body (upstream logic, ported)
// ---------------------------------------------------------------------------

export interface ChartTooltipContentOptions<Msg, R = never> {
  readonly config: ChartConfigLike;
  readonly active?: boolean | undefined;
  readonly payload?: ReadonlyArray<ChartPayloadItem> | undefined;
  readonly class?: string | undefined;
  readonly indicator?: "line" | "dot" | "dashed" | undefined;
  readonly hideLabel?: boolean | undefined;
  readonly hideIndicator?: boolean | undefined;
  readonly label?: string | number | undefined;
  readonly labelFormatter?:
    | ((
        value: string | undefined,
        payload: ReadonlyArray<ChartPayloadItem>,
      ) => View.Content<Msg, R>)
    | undefined;
  readonly labelClass?: string | undefined;
  readonly formatter?:
    | ((
        value: number | string,
        name: string | number,
        item: ChartPayloadItem,
        index: number,
        payload: ChartDatum | undefined,
      ) => View.Content<Msg, R>)
    | undefined;
  readonly color?: string | undefined;
  readonly nameKey?: string | undefined;
  readonly labelKey?: string | undefined;
}

/**
 * The tooltip body Recharts would feed: given `active` + a computed
 * `payload`, renders upstream's box — the resolved label, then one row
 * per payload item (icon or dot/line/dashed indicator in the series
 * color, the config label, the value locale-formatted). Renders
 * nothing when inactive or the payload is empty, as upstream's does.
 */
export const ChartTooltipContent = <Msg, R = never>(
  h: Html.H<Msg>,
  options: ChartTooltipContentOptions<Msg, R>,
): View.Content<Msg, R> | undefined => {
  const config = options.config;
  const payload = options.payload;
  const indicator = options.indicator ?? "dot";
  const hideLabel = options.hideLabel ?? false;
  const hideIndicator = options.hideIndicator ?? false;
  const label = options.label;

  const tooltipLabel = ((): View.Content<Msg, R> | undefined => {
    if (hideLabel || !payload?.length) {
      return undefined;
    }

    const [item] = payload;
    const key = `${options.labelKey ?? item?.dataKey ?? item?.name ?? "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !options.labelKey && typeof label === "string"
        ? (config[label]?.label ?? label)
        : itemConfig?.label;

    if (options.labelFormatter) {
      return h.div
        .class(cn("font-medium", options.labelClass))
        .children(options.labelFormatter(value, payload));
    }

    if (!value) {
      return undefined;
    }

    return h.div.class(cn("font-medium", options.labelClass)).children(value);
  })();

  if (options.active !== true || !payload?.length) {
    return undefined;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return h.div
    .attr("data-slot", "chart-tooltip")
    .class(cn(CHART_TOOLTIP_CLASS, options.class))
    .children(
      !nestLabel ? tooltipLabel : undefined,
      h.div.class("grid gap-1.5").children(
        payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${options.nameKey ?? item.name ?? item.dataKey ?? "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = options.color ?? item.payload?.fill ?? item.color;

            const indicatorNode =
              itemConfig?.icon !== undefined
                ? itemConfig.icon(h)
                : hideIndicator
                  ? undefined
                  : h.div
                      .attr(
                        "style",
                        styleText({
                          "--color-bg": indicatorColor ?? "",
                          "--color-border": indicatorColor ?? "",
                        }),
                      )
                      .class(
                        cn(
                          "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                          indicator === "dot" && "h-2.5 w-2.5",
                          indicator === "line" && "w-1",
                          indicator === "dashed" &&
                            "w-0 border-[1.5px] border-dashed bg-transparent",
                          nestLabel && indicator === "dashed" && "my-0.5",
                        ),
                      );

            const row =
              options.formatter !== undefined &&
              item?.value !== undefined &&
              item.name !== undefined
                ? options.formatter(item.value, item.name, item, index, item.payload)
                : [
                    indicatorNode,
                    h.div
                      .class(
                        cn(
                          "flex flex-1 justify-between leading-none",
                          nestLabel ? "items-end" : "items-center",
                        ),
                      )
                      .children(
                        h.div
                          .class("grid gap-1.5")
                          .children(
                            nestLabel ? tooltipLabel : undefined,
                            h.span
                              .class("text-muted-foreground")
                              .children(
                                itemConfig?.label ??
                                  (item.name === undefined ? undefined : String(item.name)),
                              ),
                          ),
                        item.value != null
                          ? h.span
                              .class("font-mono font-medium text-foreground tabular-nums")
                              .children(
                                typeof item.value === "number"
                                  ? item.value.toLocaleString()
                                  : String(item.value),
                              )
                          : undefined,
                      ),
                  ];

            return h.div
              .key(String(index))
              .class(cn(CHART_TOOLTIP_ITEM_CLASS, indicator === "dot" && "items-center"))
              .children(row);
          }),
      ),
    );
};

// ---------------------------------------------------------------------------
// ChartLegendContent — the styled legend body (upstream logic, ported)
// ---------------------------------------------------------------------------

export interface ChartLegendContentOptions {
  readonly config: ChartConfigLike;
  readonly payload?: ReadonlyArray<ChartLegendItem> | undefined;
  readonly class?: string | undefined;
  readonly hideIcon?: boolean | undefined;
  readonly verticalAlign?: "top" | "bottom" | undefined;
  readonly nameKey?: string | undefined;
}

/**
 * The legend body: one swatch + config label per payload item, padded
 * toward the plot (`pt-3` below it, `pb-3` above it). Renders nothing
 * for an empty payload, as upstream's does.
 */
export const ChartLegendContent = <Msg, R = never>(
  h: Html.H<Msg>,
  options: ChartLegendContentOptions,
): View.Content<Msg, R> | undefined => {
  const config = options.config;
  const payload = options.payload;
  const verticalAlign = options.verticalAlign ?? "bottom";

  if (!payload?.length) {
    return undefined;
  }

  return h.div
    .attr("data-slot", "chart-legend")
    .class(cn(CHART_LEGEND_CLASS, verticalAlign === "top" ? "pb-3" : "pt-3", options.class))
    .children(
      payload
        .filter((item) => item.type !== "none")
        .map((item, index) => {
          const key = `${options.nameKey ?? item.dataKey ?? "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return h.div
            .key(String(index))
            .class(CHART_LEGEND_ITEM_CLASS)
            .children(
              itemConfig?.icon && !(options.hideIcon ?? false)
                ? itemConfig.icon(h)
                : h.div
                    .attr("style", styleText({ backgroundColor: item.color ?? "" }))
                    .class("h-2 w-2 shrink-0 rounded-[2px]"),
              itemConfig?.label,
            );
        }),
    );
};

// ---------------------------------------------------------------------------
// The engine: layout + SVG drawing (pure, from props + active index)
// ---------------------------------------------------------------------------

interface ResolvedSeries {
  readonly dataKey: string;
  readonly kind: ChartSeriesKind;
  readonly stackId?: string | undefined;
}

const MARGIN = { top: 8, right: 8, bottom: 24, left: 36 } as const;

/** Group series into bar/area columns: stack groups in series order. */
const columnGroups = (
  series: ReadonlyArray<ResolvedSeries>,
  kind: "bar" | "area",
): ReadonlyArray<ReadonlyArray<ResolvedSeries>> => {
  const groups: Array<Array<ResolvedSeries>> = [];
  const byStack = new Map<string, Array<ResolvedSeries>>();
  for (const s of series) {
    if (s.kind !== kind) continue;
    if (s.stackId === undefined) {
      groups.push([s]);
    } else {
      const group = byStack.get(s.stackId);
      if (group) group.push(s);
      else {
        const fresh = [s];
        byStack.set(s.stackId, fresh);
        groups.push(fresh);
      }
    }
  }
  return groups;
};

interface CartesianLayout {
  readonly y: (value: number) => number;
  readonly ticks: ReadonlyArray<number>;
  readonly bandStep: number;
  readonly bandCenter: (index: number) => number;
  readonly plotW: number;
  readonly plotH: number;
}

const cartesianLayout = (
  data: ReadonlyArray<ChartDatum>,
  series: ReadonlyArray<ResolvedSeries>,
  width: number,
  height: number,
): CartesianLayout => {
  const plotW = width - MARGIN.left - MARGIN.right;
  const plotH = height - MARGIN.top - MARGIN.bottom;

  let lo = Infinity;
  let hi = -Infinity;
  const includeZero = series.some((s) => s.kind === "bar" || s.kind === "area");
  for (const datum of data) {
    const stacks = new Map<string, { pos: number; neg: number }>();
    for (const s of series) {
      const v = num(datum[s.dataKey]);
      if (s.stackId !== undefined && s.kind !== "line") {
        const acc = stacks.get(s.stackId) ?? { pos: 0, neg: 0 };
        if (v >= 0) acc.pos += v;
        else acc.neg += v;
        stacks.set(s.stackId, acc);
      } else {
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
    }
    for (const acc of stacks.values()) {
      lo = Math.min(lo, acc.neg);
      hi = Math.max(hi, acc.pos);
    }
  }
  if (!Number.isFinite(lo)) {
    lo = 0;
    hi = 1;
  }
  if (includeZero) {
    lo = Math.min(lo, 0);
    hi = Math.max(hi, 0);
  }
  const { domain, ticks } = niceTicks(lo, hi);
  const y = linearScale(domain, [MARGIN.top + plotH, MARGIN.top]);
  const bandStep = data.length > 0 ? plotW / data.length : plotW;
  return {
    y,
    ticks,
    bandStep,
    bandCenter: (index) => MARGIN.left + (index + 0.5) * bandStep,
    plotW,
    plotH,
  };
};

/** The tooltip payload Recharts would compute for the active datum. */
const tooltipPayloadOf = (
  config: Readonly<Record<string, ChartConfigEntry>>,
  data: ReadonlyArray<ChartDatum>,
  series: ReadonlyArray<ResolvedSeries>,
  index: number,
  categoryKey: string,
  isPie: boolean,
): ReadonlyArray<ChartPayloadItem> => {
  const datum = data[index];
  if (datum === undefined) return [];
  if (isPie) {
    const s = series[0];
    if (s === undefined) return [];
    const raw = datum[s.dataKey];
    return [
      {
        name: String(datum[categoryKey] ?? ""),
        dataKey: s.dataKey,
        value: raw === null || raw === undefined ? undefined : raw,
        color: seriesColor(config, String(datum[categoryKey] ?? ""), index),
        payload: datum,
      },
    ];
  }
  return series.map((s, si) => {
    const raw = datum[s.dataKey];
    return {
      name: s.dataKey,
      dataKey: s.dataKey,
      value: raw === null || raw === undefined ? undefined : raw,
      color: seriesColor(config, s.dataKey, si),
      payload: datum,
    };
  });
};

/** The legend payload: one item per series (pie: per slice). */
const legendPayloadOf = (
  config: Readonly<Record<string, ChartConfigEntry>>,
  data: ReadonlyArray<ChartDatum>,
  series: ReadonlyArray<ResolvedSeries>,
  categoryKey: string,
  isPie: boolean,
): ReadonlyArray<ChartLegendItem> =>
  isPie
    ? data.map((datum, i) => ({
        dataKey: String(datum[categoryKey] ?? ""),
        color: seriesColor(config, String(datum[categoryKey] ?? ""), i),
        payload: datum,
      }))
    : series.map((s, si) => ({
        dataKey: s.dataKey,
        color: seriesColor(config, s.dataKey, si),
      }));

// ---------------------------------------------------------------------------
// ChartContainer — the Component
// ---------------------------------------------------------------------------

/**
 * A shadcn chart, data-driven. The consumer owns nothing but the props
 * (see the file header for the full contract and example shapes):
 *
 *   ChartContainer(h, {
 *     props: {
 *       id: "visitors",
 *       config: { desktop: { label: "Desktop", color: "#2563eb" } },
 *       data: [{ month: "Jan", desktop: 186 }, { month: "Feb", desktop: 305 }],
 *       series: [{ dataKey: "desktop" }],
 *       type: "bar",
 *       categoryKey: "month",
 *     },
 *     onEmit: {
 *       ActiveChanged: ({ index }) => Msg.ChartHovered({ index }),
 *     },
 *   })
 */
export const ChartContainer = Html.component({
  name: "ChartContainer",
  props: ChartContainerProps,
  model: ChartModel,
  message: ChartMessage,
  events: ChartEvents,
}).make({
  init: () => ({ activeIndex: null }),
  update: {
    Hovered: ($, { index }) =>
      $.model.activeIndex === index
        ? $.evolve({})
        : $.evolve({ activeIndex: index }).emit(ChartEvents.ActiveChanged({ index })),
    HoverCleared: ($) =>
      $.model.activeIndex === null
        ? $.evolve({})
        : $.evolve({ activeIndex: null }).emit(ChartEvents.ActiveChanged({ index: null })),
  },
  view: (h, model) => {
    const props = h.props;
    const config = props.config;
    const data = props.data;
    const categoryKey = props.categoryKey ?? "name";
    const width = props.width ?? INITIAL_DIMENSION.width;
    const height = props.height ?? INITIAL_DIMENSION.height;
    const uniqueId = props.id ?? "chart";
    const chartId = `chart-${uniqueId.replace(/:/g, "")}`;
    const type = props.type ?? "bar";
    const isPie = type === "pie";
    const series: ReadonlyArray<ResolvedSeries> = props.series.map((s) => ({
      dataKey: s.dataKey,
      kind: s.kind ?? type,
      stackId: s.stackId,
    }));
    const active = model.activeIndex;
    const activeDatum = active !== null && active !== undefined ? data[active] : undefined;

    // -- cartesian geometry -------------------------------------------------
    const layout = isPie ? undefined : cartesianLayout(data, series, width, height);
    const showGrid = props.showGrid ?? true;
    const showXAxis = props.showXAxis ?? true;
    const showYAxis = props.showYAxis ?? true;

    const grid = (children: ReadonlyArray<ChartNode>) =>
      h.el("g").attrs({ class: "recharts-cartesian-grid" }).children(children);

    const cartesianNodes: Array<ChartNode> = [];
    if (layout !== undefined) {
      const { y, ticks, bandStep, bandCenter, plotH } = layout;

      if (showGrid) {
        cartesianNodes.push(
          grid(
            ticks.map((tick, i) =>
              h
                .el("line")
                .key(`grid-${i}`)
                .attrs({
                  class: "recharts-cartesian-grid_line",
                  x1: String(MARGIN.left),
                  x2: String(MARGIN.left + layout.plotW),
                  y1: fmt(y(tick)),
                  y2: fmt(y(tick)),
                  stroke: "#ccc",
                }),
            ),
          ),
        );
      }
      if (showYAxis) {
        cartesianNodes.push(
          h
            .el("g")
            .attrs({ class: "recharts-cartesian-axis-tick" })
            .children(
              ticks.map((tick, i) =>
                h
                  .el("text")
                  .key(`y-${i}`)
                  .attrs({
                    x: String(MARGIN.left - 8),
                    y: fmt(y(tick)),
                    dy: "0.32em",
                    "text-anchor": "end",
                  })
                  .children(formatTick(tick)),
              ),
            ),
        );
      }
      if (showXAxis) {
        cartesianNodes.push(
          h
            .el("g")
            .attrs({ class: "recharts-cartesian-axis-tick" })
            .children(
              data.map((datum, i) =>
                h
                  .el("text")
                  .key(`x-${i}`)
                  .attrs({
                    x: fmt(bandCenter(i)),
                    y: String(MARGIN.top + plotH + 16),
                    "text-anchor": "middle",
                  })
                  .children(String(datum[categoryKey] ?? "")),
              ),
            ),
        );
      }

      // Bars (grouped + stacked columns).
      const barGroups = columnGroups(series, "bar");
      if (barGroups.length > 0) {
        const groupW = bandStep * 0.6;
        const gap = barGroups.length > 1 ? 4 : 0;
        const colW = (groupW - (barGroups.length - 1) * gap) / barGroups.length;
        const bars: Array<ChartNode> = [];
        data.forEach((datum, i) => {
          const bandX = MARGIN.left + i * bandStep + (bandStep - groupW) / 2;
          barGroups.forEach((group, g) => {
            let posAcc = 0;
            let negAcc = 0;
            for (const s of group) {
              const v = num(datum[s.dataKey]);
              const si = series.indexOf(s);
              let yTop: number;
              let yBottom: number;
              if (v >= 0) {
                yTop = y(posAcc + v);
                yBottom = y(posAcc);
                posAcc += v;
              } else {
                yTop = y(negAcc);
                yBottom = y(negAcc + v);
                negAcc += v;
              }
              bars.push(
                h
                  .el("rect")
                  .key(`bar-${i}-${s.dataKey}`)
                  .attrs({
                    class: "recharts-rectangle",
                    x: fmt(bandX + g * (colW + gap)),
                    y: fmt(yTop),
                    width: fmt(colW),
                    height: fmt(Math.max(0, yBottom - yTop)),
                    fill: seriesColor(config, s.dataKey, si),
                  }),
              );
            }
          });
        });
        cartesianNodes.push(
          h.el("g").attrs({ class: "recharts-layer recharts-bar" }).children(bars),
        );
      }

      // Areas (stacked within a stackId group, baseline = domain floor).
      const areaGroups = columnGroups(series, "area");
      for (const group of areaGroups) {
        const lower = data.map(() => 0);
        const areas: Array<ChartNode> = [];
        for (const s of group) {
          const si = series.indexOf(s);
          const top: Array<readonly [number, number]> = data.map(
            (datum, i) => [bandCenter(i), y(lower[i]! + num(datum[s.dataKey]))] as const,
          );
          const base: Array<readonly [number, number]> = data.map(
            (datum, i) =>
              [
                bandCenter(i),
                group.length > 1 || s.stackId !== undefined ? y(lower[i]!) : MARGIN.top + plotH,
              ] as const,
          );
          areas.push(
            h
              .el("path")
              .key(`area-${s.dataKey}`)
              .attrs({
                class: "recharts-area-area",
                d: areaPath(top, base),
                fill: seriesColor(config, s.dataKey, si),
                "fill-opacity": "0.25",
                stroke: seriesColor(config, s.dataKey, si),
                "stroke-width": "2",
              }),
          );
          data.forEach((datum, i) => {
            lower[i] = lower[i]! + num(datum[s.dataKey]);
          });
        }
        cartesianNodes.push(
          h.el("g").attrs({ class: "recharts-layer recharts-area" }).children(areas),
        );
      }

      // Lines + dots.
      for (const s of series) {
        if (s.kind !== "line") continue;
        const si = series.indexOf(s);
        const points: Array<readonly [number, number]> = data.map(
          (datum, i) => [bandCenter(i), y(num(datum[s.dataKey]))] as const,
        );
        cartesianNodes.push(
          h
            .el("g")
            .attrs({ class: "recharts-layer recharts-line" })
            .children(
              h.el("path").attrs({
                class: "recharts-curve",
                d: linePath(points),
                fill: "none",
                stroke: seriesColor(config, s.dataKey, si),
                "stroke-width": "2",
              }),
              ...points.map(([x, yv], i) =>
                h
                  .el("circle")
                  .key(`dot-${s.dataKey}-${i}`)
                  .attrs({
                    class: "recharts-dot",
                    cx: fmt(x),
                    cy: fmt(yv),
                    r: active === i ? "4.5" : "3",
                    fill: seriesColor(config, s.dataKey, si),
                    stroke: "#fff",
                    "stroke-width": "1",
                  }),
              ),
            ),
        );
      }

      // The tooltip cursor over the active band.
      if (active !== null && active !== undefined && active < data.length) {
        const hasLine = series.some((s) => s.kind === "line");
        cartesianNodes.push(
          hasLine
            ? h.el("line").attrs({
                class: "recharts-curve recharts-tooltip-cursor",
                x1: fmt(bandCenter(active)),
                x2: fmt(bandCenter(active)),
                y1: String(MARGIN.top),
                y2: String(MARGIN.top + plotH),
                stroke: "#ccc",
              })
            : h.el("rect").attrs({
                class: "recharts-rectangle recharts-tooltip-cursor",
                x: fmt(MARGIN.left + active * bandStep),
                y: String(MARGIN.top),
                width: fmt(bandStep),
                height: String(plotH),
                fill: "#ccc",
              }),
        );
      }

      // Hit rects: one per category band, over the whole plot height.
      cartesianNodes.push(
        h.el("g").children(
          data.map((_, i) =>
            h
              .el("rect")
              .key(`hit-${i}`)
              .attrs({
                "data-slot": "chart-hit",
                "data-index": String(i),
                x: fmt(MARGIN.left + i * bandStep),
                y: String(MARGIN.top),
                width: fmt(bandStep),
                height: String(plotH),
                fill: "transparent",
              })
              .on("mouseenter", () => ChartMessage.Hovered({ index: i }))
              .on("mouseleave", () => ChartMessage.HoverCleared()),
          ),
        ),
      );
    }

    // -- pie geometry ---------------------------------------------------------
    const pieNodes: Array<ChartNode> = [];
    let pieAnchor: readonly [number, number] | undefined;
    if (isPie) {
      const s = series[0];
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.min(width, height) / 2 - 8;
      if (s !== undefined) {
        const values = data.map((datum) => Math.max(0, num(datum[s.dataKey])));
        const total = values.reduce((a, b) => a + b, 0);
        if (total > 0) {
          let angle = -Math.PI / 2;
          const slices: Array<ChartNode> = [];
          values.forEach((v, i) => {
            const sweep = (v / total) * Math.PI * 2;
            const start = angle;
            const end = angle + sweep;
            angle = end;
            if (v <= 0) return;
            const datum = data[i]!;
            const color = seriesColor(config, String(datum[categoryKey] ?? ""), i);
            if (active === i) {
              const mid = start + sweep / 2;
              pieAnchor = [cx + r * 0.7 * Math.cos(mid), cy + r * 0.7 * Math.sin(mid)];
            }
            const handlers = (el: View.ElementBuilder<ChartMessage, never>) =>
              el
                .on("mouseenter", () => ChartMessage.Hovered({ index: i }))
                .on("mouseleave", () => ChartMessage.HoverCleared());
            slices.push(
              sweep >= Math.PI * 2 - 1e-9
                ? handlers(
                    h
                      .el("circle")
                      .key(`slice-${i}`)
                      .attrs({
                        class: "recharts-sector",
                        cx: fmt(cx),
                        cy: fmt(cy),
                        r: fmt(r),
                        fill: color,
                        stroke: "#fff",
                      }),
                  )
                : handlers(
                    h
                      .el("path")
                      .key(`slice-${i}`)
                      .attrs({
                        class: "recharts-sector",
                        d: arcPath(cx, cy, r, start, end),
                        fill: color,
                        stroke: "#fff",
                      }),
                  ),
            );
          });
          pieNodes.push(h.el("g").attrs({ class: "recharts-layer recharts-pie" }).children(slices));
        }
      }
    }

    // -- tooltip overlay ------------------------------------------------------
    const showTooltip = props.showTooltip ?? true;
    let tooltip: ChartNode | undefined;
    if (showTooltip && activeDatum !== undefined && active !== null && active !== undefined) {
      let anchor: readonly [number, number] | undefined;
      if (isPie) {
        anchor = pieAnchor;
      } else if (layout !== undefined) {
        const ys = series.map((s) => layout.y(num(activeDatum[s.dataKey])));
        anchor = [layout.bandCenter(active), Math.min(...ys, MARGIN.top + layout.plotH)];
      }
      if (anchor !== undefined) {
        tooltip = h.div
          .attr("class", "absolute")
          .attr(
            "style",
            `left: ${fmt((anchor[0] / width) * 100)}%; top: ${fmt((anchor[1] / height) * 100)}%; transform: translate(-50%, calc(-100% - 8px));`,
          )
          .children(
            ChartTooltipContent(h, {
              config,
              active: true,
              payload: tooltipPayloadOf(config, data, series, active, categoryKey, isPie),
              label: isPie ? undefined : (activeDatum[categoryKey] ?? undefined),
              indicator: props.tooltipIndicator ?? "dot",
            }),
          );
      }
    }

    const legendAlign = props.legendAlign ?? "bottom";
    const legend =
      (props.showLegend ?? false)
        ? ChartLegendContent(h, {
            config,
            payload: legendPayloadOf(config, data, series, categoryKey, isPie),
            verticalAlign: legendAlign,
          })
        : undefined;

    const svg = h
      .el("svg")
      .attrs({
        viewBox: `0 0 ${width} ${height}`,
        class: "recharts-surface block h-auto w-full",
        role: "img",
      })
      .on("mouseleave", () => ChartMessage.HoverCleared())
      .children(...(isPie ? pieNodes : cartesianNodes));

    const plot = h.div.attr("class", "relative").children(svg, tooltip);

    return h.div
      .attr("data-slot", "chart")
      .attr("data-chart", chartId)
      .class(cn(CHART_CONTAINER_CLASS, props.class))
      .children(
        ChartStyle(h, { id: chartId, config }),
        h.div
          .attr("class", "flex w-full flex-col")
          .children(
            legendAlign === "top" ? legend : undefined,
            plot,
            legendAlign === "bottom" ? legend : undefined,
          ),
      );
  },
});
