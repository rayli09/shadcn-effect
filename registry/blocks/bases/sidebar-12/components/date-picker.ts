/**
 * DatePicker (sidebar-12 block) — upstream
 * `registry/bases/radix/blocks/sidebar-12/components/date-picker.tsx`
 * ported to Effect UI.
 *
 * State: upstream holds the selection in `useState<Date | undefined>`
 * (initial value: the 12th of the current month). Here the selection is
 * this Component's Model — the kit Calendar's `value`, plus the visible
 * `month` and `today` the kit's props require — seeded in `init` from
 * the current date exactly as upstream computes its initial value, and
 * updated from the Calendar's `Picked` / `RequestedMonth` events.
 * Dates are the kit's `DateTime.Utc` values (midnight-UTC normalized),
 * not JS `Date`s, and the Model fields are `Schema.DateTimeUtc` (the
 * calendar port's date modeling).
 *
 * Declared divergences:
 * - Upstream's `captionLayout="dropdown"` is passed through; the
 *   calendar port renders the caption label only (see the calendar
 *   port's header — the kit has no dropdown machinery).
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as DateTime from "effect/DateTime";
import * as Schema from "effect/Schema";
import { Calendar } from "@/components/ui/calendar.ts";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar.ts";

export const DatePickerMessage = UiSchema.TaggedEnum({
  /** The Calendar's `Picked`: a day was selected. */
  PickedDate: { date: Schema.DateTimeUtc },
  /** The Calendar's `RequestedMonth`: the visible month should move. */
  RequestedMonth: { month: Schema.DateTimeUtc },
});

export const DatePicker = Html.component({
  name: "Sidebar12DatePicker",
  model: Schema.Struct({
    date: Schema.NullOr(Schema.DateTimeUtc),
    month: Schema.DateTimeUtc,
    today: Schema.DateTimeUtc,
  }),
  message: DatePickerMessage,
}).make({
  init: () => {
    const now = new Date();
    return {
      date: DateTime.makeUnsafe(new Date(now.getFullYear(), now.getMonth(), 12)),
      month: DateTime.makeUnsafe(new Date(now.getFullYear(), now.getMonth(), 1)),
      today: DateTime.makeUnsafe(now),
    };
  },
  update: {
    PickedDate: ($, { date }) => $.evolve({ date }),
    RequestedMonth: ($, { month }) => $.evolve({ month }),
  },
  view: (h, model) =>
    SidebarGroup(h, { class: "px-0" }).children(
      SidebarGroupContent(h).children(
        Calendar(h, {
          props: {
            value: model.date,
            month: model.month,
            today: model.today,
            locale: "en-US",
          },
          captionLayout: "dropdown",
          class: "bg-transparent [--cell-size:2.1rem]",
          onEmit: {
            Picked: ({ date }) => DatePickerMessage.PickedDate({ date }),
            RequestedMonth: ({ month }) => DatePickerMessage.RequestedMonth({ month }),
          },
        }),
      ),
    ),
});
