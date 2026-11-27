/**
 * DatePicker — shadcn/ui block `sidebar-12`
 * (`registry/new-york-v4/blocks/sidebar-12/components/date-picker.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a stateless React component rendering the shadcn
 * `Calendar` (uncontrolled, no selected date) inside a sidebar group.
 * Here: an `Html.component` — the calendar port is controlled, so the
 * selected date and the visible month live in the Model (nothing
 * selected, the current month shown, as upstream), and picks / month
 * requests arrive as Messages.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { DateTime } from "effect";
import { Calendar } from "@/components/ui/calendar.ts";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar.ts";

export const DatePickerMessage = UiSchema.TaggedEnum({
  PickedDate: { date: Schema.DateTimeUtc },
  RequestedMonth: { month: Schema.DateTimeUtc },
});

export const DatePicker = Html.component({
  name: "DatePicker",
  model: Schema.Struct({
    date: Schema.NullOr(Schema.DateTimeUtc),
    month: Schema.DateTimeUtc,
    today: Schema.DateTimeUtc,
  }),
  message: DatePickerMessage,
}).make({
  init: () => {
    const today = DateTime.nowUnsafe();
    const parts = DateTime.toParts(today);
    return {
      date: null,
      month: DateTime.makeUnsafe({ year: parts.year, month: parts.month, day: 1 }),
      today,
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
          props: { value: model.date, month: model.month, today: model.today, locale: "en-US" },
          onEmit: {
            Picked: ({ date }) => DatePickerMessage.PickedDate({ date }),
            RequestedMonth: ({ month }) => DatePickerMessage.RequestedMonth({ month }),
          },
          class:
            "[&_[role=gridcell]]:w-[33px] [&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground",
        }),
      ),
    ),
});
