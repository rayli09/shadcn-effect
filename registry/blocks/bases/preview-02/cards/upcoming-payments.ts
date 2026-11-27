/**
 * UpcomingPayments — shadcn/ui block `preview-02`
 * (cards/upcoming-payments.tsx), bases generation, ported 1:1 to
 * Effect UI.
 *
 * Upstream: a "use client" React function rendering a Card with a
 * single-date Calendar (selection held in `useState<Date | undefined>`,
 * initially today) inside an outline Item, above a static list of
 * three scheduled payments with secondary price Badges. Here it is a
 * Component: the selection is the Model — the kit Calendar's `value`,
 * plus the visible `month` and `today` the kit's props require —
 * seeded in `init` from the current date exactly as upstream computes
 * its initial value, and updated from the Calendar's `Picked` /
 * `RequestedMonth` events. Dates are the kit's `DateTime.Utc` values,
 * not JS `Date`s.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream spreads no extra props; the only prop here is `class`,
 *   appended to the Card's classes.
 * - Upstream's Calendar className (`w-full [--cell-size:--spacing(8)]
 *   md:[--cell-size:--spacing(10)] style-sera:md:[--cell-size:
 *   --spacing(9)]`) is passed through as the port Calendar's `class`
 *   option, verbatim.
 * - The payment list is static in both worlds: picking a date does not
 *   filter it (upstream wires no such behavior either).
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { DateTime, Schema } from "effect";
import { Badge } from "@/components/ui/badge.ts";
import { Calendar } from "@/components/ui/calendar.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.ts";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item.ts";

export const UpcomingPaymentsMessage = UiSchema.TaggedEnum({
  PickedDate: { date: Schema.DateTimeUtc },
  RequestedMonth: { month: Schema.DateTimeUtc },
});

export const UpcomingPayments = Html.component({
  name: "Preview02UpcomingPayments",
  props: Schema.Struct({ class: Schema.optional(Schema.String) }),
  model: Schema.Struct({
    date: Schema.NullOr(Schema.DateTimeUtc),
    month: Schema.DateTimeUtc,
    today: Schema.DateTimeUtc,
  }),
  message: UpcomingPaymentsMessage,
}).make({
  init: () => {
    const today = DateTime.nowUnsafe();
    const parts = DateTime.toParts(today);
    return {
      date: today,
      month: DateTime.makeUnsafe({ year: parts.year, month: parts.month, day: 1 }),
      today,
    };
  },
  update: {
    PickedDate: ($, { date }) => $.evolve({ date }),
    RequestedMonth: ($, { month }) => $.evolve({ month }),
  },
  view: (h, model) =>
    Card(h, { class: h.props.class }).children(
      CardHeader(h).children(
        CardTitle(h).children("Upcoming Payments"),
        CardDescription(h).children("Select a date to view scheduled payments."),
      ),
      CardContent(h, { class: "flex flex-col gap-4" }).children(
        Item(h, { variant: "outline", class: "justify-center" }).children(
          Calendar(h, {
            props: {
              value: model.date,
              month: model.month,
              today: model.today,
              locale: "en-US",
            },
            class:
              "w-full [--cell-size:--spacing(8)] md:[--cell-size:--spacing(10)] style-sera:md:[--cell-size:--spacing(9)]",
            onEmit: {
              Picked: ({ date }) => UpcomingPaymentsMessage.PickedDate({ date }),
              RequestedMonth: ({ month }) => UpcomingPaymentsMessage.RequestedMonth({ month }),
            },
          }),
        ),
        ItemGroup(h, { class: "w-full" }).children(
          Item(h, { variant: "muted" }).children(
            ItemContent(h).children(
              ItemTitle(h).children("Netflix Subscription"),
              ItemDescription(h).children("Apr 15, 2024"),
            ),
            Badge(h, { variant: "secondary" }).children("$19.99"),
          ),
          Item(h, { variant: "muted" }).children(
            ItemContent(h).children(
              ItemTitle(h).children("Rent Payment"),
              ItemDescription(h).children("Apr 1, 2024"),
            ),
            Badge(h, { variant: "secondary" }).children("$2,400.00"),
          ),
          Item(h, { variant: "muted" }).children(
            ItemContent(h).children(
              ItemTitle(h).children("Auto Insurance"),
              ItemDescription(h).children("Apr 22, 2024"),
            ),
            Badge(h, { variant: "secondary" }).children("$186.00"),
          ),
        ),
      ),
    ),
});
