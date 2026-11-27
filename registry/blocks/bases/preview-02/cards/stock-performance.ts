/**
 * StockPerformance — shadcn/ui block `preview-02`
 * (cards/stock-performance.tsx), bases generation, ported 1:1 to
 * Effect UI.
 *
 * Upstream: a React function with `useState("VOO")` for the ticker: a
 * Combobox over seven tickers, and a Recharts AreaChart of the selected
 * ticker's 6-month prices (VOO and AAPL have bespoke series, every
 * other ticker falls back to a default series). Here: a Component —
 * the kit Combobox is controlled, so the ticker, the popup's open
 * state, and the input text live in the Model and combobox events
 * arrive as Messages; the chart is the Effect-native `ChartContainer`
 * from `@/components/ui/chart.ts` composed from the upstream data and
 * config verbatim (type "area", series `price`, categoryKey `month`).
 * Recharts is never imported.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Engine-unported Recharts features (chart port D-4): the area's
 *   linear-gradient fill becomes the engine's flat series-color fill
 *   at 0.25 opacity; the dashed CartesianGrid (`strokeDasharray="3 3"`,
 *   vertical off) becomes the engine's own grid; the chart margins and
 *   `accessibilityLayer` have no engine props. The XAxis month labels
 *   are the engine's category axis.
 * - Upstream's tooltip (`ChartTooltipContent hideLabel`) maps to the
 *   container's built-in tooltip; `hideLabel` has no container prop,
 *   so the tooltip shows the month label.
 * - The Combobox port draws its whole anatomy from props (input,
 *   trigger, list, empty state) — upstream's composed
 *   ComboboxInput/Content/Empty/List/Item JSX collapses into the one
 *   call, with `placeholder` and `emptyText` as options. The Field
 *   `id` ("ticker-select") is carried by the Field, not the input.
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.ts";
import { ChartContainer } from "@/components/ui/chart.ts";
import { Combobox } from "@/components/ui/combobox.ts";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field.ts";
import { Separator } from "@/components/ui/separator.ts";

const TICKERS = ["VOO", "VIG", "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"] as const;

const CHART_DATA: Record<string, ReadonlyArray<{ month: string; price: number }>> = {
  VOO: [
    { month: "Jan", price: 412 },
    { month: "Feb", price: 438 },
    { month: "Mar", price: 395 },
    { month: "Apr", price: 450 },
    { month: "May", price: 420 },
    { month: "Jun", price: 462 },
  ],
  AAPL: [
    { month: "Jan", price: 185 },
    { month: "Feb", price: 210 },
    { month: "Mar", price: 172 },
    { month: "Apr", price: 198 },
    { month: "May", price: 178 },
    { month: "Jun", price: 215 },
  ],
};

const DEFAULT_DATA: ReadonlyArray<{ month: string; price: number }> = [
  { month: "Jan", price: 100 },
  { month: "Feb", price: 118 },
  { month: "Mar", price: 95 },
  { month: "Apr", price: 125 },
  { month: "May", price: 108 },
  { month: "Jun", price: 130 },
];

export const StockPerformanceMessage = UiSchema.TaggedEnum({
  ComboOpened: {},
  ComboClosed: {},
  ComboPicked: { value: Schema.NullOr(Schema.String) },
  ComboInput: { text: Schema.String },
});

export const StockPerformance = Html.component({
  name: "Preview02StockPerformance",
  model: Schema.Struct({
    ticker: Schema.String,
    open: Schema.Boolean,
    inputValue: Schema.String,
  }),
  message: StockPerformanceMessage,
}).make({
  init: () => ({ ticker: "VOO", open: false, inputValue: "" }),
  update: {
    ComboOpened: ($) => $.evolve({ open: true }),
    ComboClosed: ($) => $.evolve({ open: false }),
    ComboPicked: ($, { value }) => (value === null ? $.evolve({}) : $.evolve({ ticker: value })),
    ComboInput: ($, { text }) => $.evolve({ inputValue: text }),
  },
  view: (h, model) =>
    Card(h).children(
      CardHeader(h).children(
        CardTitle(h).children("Stock Performance"),
        CardDescription(h).children("6-month price history."),
      ),
      CardContent(h, { class: "flex flex-col gap-4" }).children(
        FieldGroup(h).children(
          Field(h, {
            key: "ticker-select",
            props: { id: "ticker-select" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("Ticker"),
                Combobox(h, {
                  props: {
                    open: model.open,
                    value: model.ticker,
                    inputValue: model.inputValue,
                    items: TICKERS.map((ticker) => ({ value: ticker, label: ticker })),
                    placeholder: "Search ticker...",
                  },
                  emptyText: "No tickers found.",
                  onEmit: {
                    RequestedOpen: () => StockPerformanceMessage.ComboOpened(),
                    RequestedClose: () => StockPerformanceMessage.ComboClosed(),
                    Picked: ({ value }) =>
                      StockPerformanceMessage.ComboPicked({
                        value: typeof value === "string" ? value : null,
                      }),
                    RequestedInputValue: ({ inputValue }) =>
                      StockPerformanceMessage.ComboInput({ text: inputValue }),
                    Highlighted: () => undefined,
                    Settled: () => undefined,
                  },
                }),
              ),
          }),
        ),
        Separator(h, { class: "style-sera:hidden" }),
        ChartContainer(h, {
          props: {
            id: "stock-performance",
            config: {
              price: { label: "Price", color: "var(--chart-1)" },
            },
            data: [...(CHART_DATA[model.ticker] ?? DEFAULT_DATA)],
            series: [{ dataKey: "price", kind: "area" }],
            type: "area",
            categoryKey: "month",
            class: "h-[200px] w-full",
          },
        }),
      ),
    ),
});
