/**
 * ReleaseCatalog — shadcn/ui block `preview-02`
 * (cards/release-catalog.tsx), bases generation, ported 1:1 to
 * Effect UI.
 *
 * Upstream: a stateless React function rendering a Card whose header
 * holds a search InputGroup (uncontrolled) and a single-select
 * ToggleGroup (`defaultValue="etfs"`), and whose content lists four
 * holdings as muted Items. Here: a Component — the kit input and
 * toggle group are controlled (D-7), so the search text and the
 * selected filter live in the Model and changes arrive as Messages.
 * Upstream filters nothing with either control; neither does this —
 * the Messages only store the values.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `IconPlaceholder` is ported as its lucide rendering only:
 *   the shared `SearchIcon` builder from `@/lib/icons`.
 * - The ToggleGroup's value is the kit's array form: upstream's
 *   `type="single"` group with value "etfs" is `["etfs"]` here, and an
 *   empty selection (upstream's `""`) is `[]`.
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Badge } from "@/components/ui/badge.ts";
import { Card, CardContent, CardHeader } from "@/components/ui/card.ts";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group.ts";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item.ts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.ts";
import { SearchIcon } from "@/lib/icons";

const HOLDINGS = [
  {
    ticker: "VOO",
    name: "Vanguard S&P 500 ETF",
    type: "ETF",
    added: "Jan 2021",
    shares: "112",
    value: "$48,230.40",
  },
  {
    ticker: "VIG",
    name: "Vanguard Dividend Appreciation",
    type: "ETF",
    added: "Mar 2022",
    shares: "450",
    value: "$26,033.79",
  },
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    type: "Stock",
    added: "Nov 2020",
    shares: "85",
    value: "$18,488.90",
  },
  {
    ticker: "O",
    name: "Realty Income Corp",
    type: "REIT",
    added: "Jun 2023",
    shares: "320",
    value: "$15,136.59",
  },
] as const;

const FILTERS = [
  { value: "stocks", label: "Stocks" },
  { value: "etfs", label: "ETFs" },
  { value: "reits", label: "REITs" },
] as const;

export const ReleaseCatalogMessage = UiSchema.TaggedEnum({
  UpdatedQuery: { value: Schema.String },
  ToggledFilter: { value: Schema.Array(Schema.String) },
});

export const ReleaseCatalog = Html.component({
  name: "Preview02ReleaseCatalog",
  model: Schema.Struct({
    query: Schema.String,
    filter: Schema.Array(Schema.String),
  }),
  message: ReleaseCatalogMessage,
}).make({
  init: () => ({ query: "", filter: ["etfs"] }),
  update: {
    UpdatedQuery: ($, { value }) => $.evolve({ query: value }),
    ToggledFilter: ($, { value }) => $.evolve({ filter: value }),
  },
  view: (h, model) =>
    Card(h).children(
      CardHeader(h).children(
        h.div.class("flex items-center justify-between gap-3").children(
          InputGroup(h, { class: "max-w-sm" }).children(
            InputGroupAddon(h).children(SearchIcon(h)),
            InputGroupInput(h, {
              props: { value: model.query },
              onUpdate: ({ value }) => ReleaseCatalogMessage.UpdatedQuery({ value }),
            }).attr("placeholder", "Search holdings or tickers..."),
          ),
          ToggleGroup(h, {
            props: {
              value: model.filter,
              items: FILTERS.map((filter) => ({ value: filter.value })),
            },
            onToggled: (value) => ReleaseCatalogMessage.ToggledFilter({ value }),
            variant: "outline",
            spacing: 1,
            view: (group) =>
              group.root(h.div).children(
                FILTERS.map((filter) =>
                  ToggleGroupItem(group, {
                    element: h.button,
                    value: filter.value,
                  }).children(filter.label),
                ),
              ),
          }),
        ),
      ),
      CardContent(h).children(
        ItemGroup(h).children(
          HOLDINGS.map((holding) =>
            Item(h, { variant: "muted" }).children(
              ItemMedia(h).children(
                h.div
                  .class(
                    "flex size-12 items-center justify-center rounded-lg border text-sm font-semibold",
                  )
                  .children(holding.ticker),
              ),
              ItemContent(h).children(
                ItemTitle(h).children(holding.name),
                ItemDescription(h, { class: "text-xs tracking-wider uppercase" }).children(
                  `${holding.shares} Shares · ${holding.added}`,
                ),
              ),
              h.div
                .class("flex shrink-0 items-center gap-6")
                .children(
                  Badge(h, { variant: "outline" }).children(holding.type),
                  h.div
                    .class("flex flex-col items-end gap-0.5")
                    .children(
                      h.span
                        .class("text-xs tracking-wider text-muted-foreground uppercase")
                        .children("Value"),
                      h.span.class("font-medium tabular-nums").children(holding.value),
                    ),
                ),
            ),
          ),
        ),
      ),
    ),
});
