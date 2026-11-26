import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Scene } from "@effect/ui/testing";
import { Calendar as KitCalendar, RangeCalendar as KitRangeCalendar } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { DateTime, Effect, Schema } from "effect";
import {
  CALENDAR_CAPTION_LABEL_CLASS,
  CALENDAR_CAPTION_LABEL_TEXT_CLASS,
  CALENDAR_CLASS,
  CALENDAR_DAY_BUTTON_CLASS,
  CALENDAR_MONTH_GRID_CLASS,
  CALENDAR_ROOT_CLASS,
  CALENDAR_RTL_NEXT_CLASS,
  CALENDAR_RTL_PREVIOUS_CLASS,
  Calendar,
  RangeCalendar,
} from "../registry/ui/calendar.ts";
import { buttonVariants } from "../registry/ui/button.ts";
import { cn } from "../registry/lib/utils.ts";

// The consumer recipe (see tests/README.md): the port wraps the kit
// Calendar / RangeCalendar headless components, so the consumer owns the
// selected value and the visible month in its Model and stores what the
// kit's Picked / RequestedMonth events ask for. A Scene never runs the
// kit child's update, so picks and month steps are driven with
// scene.childEmit(KitCalendar, …) — standing in for what the child emits
// after a real press (README rule 1). Month and today are fixed props,
// so the rendered grid is deterministic.
//
// NOT covered here (declared gaps):
// - A real click on a day button or the nav buttons (a Play through the
//   kit child's own update, focus parking and keyboard navigation) — the
//   kit's own Calendar tests prove that machinery; this file proves the
//   port's drawing and the consumer wiring around it.
// - Range *draft* preview flags while a pick is in progress: the draft
//   lives in the kit child's Model, which a Scene never runs. Only the
//   committed range's cell/button flags are asserted.
// - Outside-day and today styling are drawn from props, not asserted
//   beyond the selected day (they are pure functions of the fixed props).

const utc = (iso: string): DateTime.Utc => DateTime.makeUnsafe(iso + "T00:00:00Z");

const NOVEMBER = utc("2026-11-01");
const TODAY = utc("2026-11-20");

const PickerMessage = UiSchema.TaggedEnum({
  PickedDate: { date: Schema.DateTimeUtc },
  RequestedMonth: { month: Schema.DateTimeUtc },
  PickedRange: {
    start: Schema.DateTimeUtc,
    end: Schema.DateTimeUtc,
  },
});

const DatePicker = Html.component({
  name: "DatePicker",
  model: Schema.Struct({
    date: Schema.NullOr(Schema.DateTimeUtc),
    month: Schema.DateTimeUtc,
  }),
  message: PickerMessage,
}).make({
  init: () => ({ date: utc("2026-11-15"), month: NOVEMBER }),
  update: {
    PickedDate: ($, { date }) => $.evolve({ date }),
    RequestedMonth: ($, { month }) => $.evolve({ month }),
    PickedRange: ($) => $.model,
  },
  view: (h, model) =>
    Calendar(h, {
      props: {
        value: model.date,
        month: model.month,
        today: TODAY,
        locale: "en-US",
      },
      onEmit: {
        Picked: ({ date }) => PickerMessage.PickedDate({ date }),
        RequestedMonth: ({ month }) => PickerMessage.RequestedMonth({ month }),
      },
    }),
});

const RangePicker = Html.component({
  name: "RangePicker",
  model: Schema.Struct({
    range: Schema.NullOr(
      Schema.Struct({
        start: Schema.DateTimeUtc,
        end: Schema.DateTimeUtc,
      }),
    ),
    month: Schema.DateTimeUtc,
  }),
  message: PickerMessage,
}).make({
  init: () => ({
    range: { start: utc("2026-11-10"), end: utc("2026-11-12") },
    month: NOVEMBER,
  }),
  update: {
    PickedDate: ($) => $.model,
    RequestedMonth: ($, { month }) => $.evolve({ month }),
    PickedRange: ($, { start, end }) => $.evolve({ range: { start, end } }),
  },
  view: (h, model) =>
    RangeCalendar(h, {
      props: {
        value: model.range,
        month: model.month,
        today: TODAY,
        locale: "en-US",
      },
      onEmit: {
        Picked: ({ start, end }) => PickerMessage.PickedRange({ start, end }),
        RequestedMonth: ({ month }) => PickerMessage.RequestedMonth({ month }),
      },
    }),
});

const root = Locator.attr("data-slot", "calendar");
const grid = Locator.tag("table");
const heading = Locator.attr("aria-live", "polite");
const selectedCell = Locator.attr("aria-selected", "true");
const dayButton = (day: string) => Locator.attr("data-day", day);

describe("Calendar (shadcn-effect port)", () => {
  it.effect("renders the fixed month: heading text, root classes, and the grid", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(DatePicker, {});
      const attrs = scene.get(root).attrs;
      // cn() is a pure join, so the root class is the constants in order.
      assert.strictEqual(
        attrs?.class,
        cn(
          CALENDAR_CLASS,
          CALENDAR_RTL_PREVIOUS_CLASS,
          CALENDAR_RTL_NEXT_CLASS,
          CALENDAR_ROOT_CLASS,
        ),
      );
      // The kit heading carries the localized month title.
      scene.expect(heading).toHaveText("November 2026");
      assert.strictEqual(
        scene.get(heading).attrs?.class,
        cn(CALENDAR_CAPTION_LABEL_CLASS, CALENDAR_CAPTION_LABEL_TEXT_CLASS),
      );
      assert.strictEqual(scene.get(grid).attrs?.class, CALENDAR_MONTH_GRID_CLASS);
      assert.strictEqual(scene.get(grid).attrs?.role, "grid");
    }),
  );

  it.effect(
    "the selected date: its cell is aria-selected and its day button carries the port's data attributes",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(DatePicker, {});
        // Exactly one cell is selected — the 15th, from the initial Model.
        scene.expect(selectedCell).toHaveCount(1);
        const cellAttrs = scene.get(selectedCell).attrs;
        assert.strictEqual(cellAttrs?.role, "gridcell");
        // The port stamps data-selected="true" on the selected cell.
        assert.strictEqual(cellAttrs?.["data-selected"], "true");
        const button = scene.get(dayButton("11/15/2026"));
        assert.strictEqual(button.attrs?.["data-selected-single"], "true");
        assert.strictEqual(button.attrs?.["data-range-start"], "false");
        assert.strictEqual(button.attrs?.["data-range-middle"], "false");
        assert.strictEqual(button.attrs?.["data-range-end"], "false");
        // The day button wears the ghost/icon Button classes plus the
        // upstream day-button string, joined by cn.
        assert.strictEqual(
          button.attrs?.class,
          cn(buttonVariants({ variant: "ghost", size: "icon" }), CALENDAR_DAY_BUTTON_CLASS),
        );
        scene.expect(dayButton("11/15/2026")).toHaveText("15");
      }),
  );

  it.effect("the child's Picked event moves the selection in the consumer Model", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(DatePicker, {});
      scene.childEmit(KitCalendar, {
        _tag: "Picked",
        date: utc("2026-11-20"),
      });
      scene.expect(selectedCell).toHaveCount(1);
      assert.strictEqual(
        scene.get(dayButton("11/20/2026")).attrs?.["data-selected-single"],
        "true",
      );
      assert.strictEqual(
        scene.get(dayButton("11/15/2026")).attrs?.["data-selected-single"],
        "false",
      );
    }),
  );

  it.effect("the child's RequestedMonth event changes the rendered month", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(DatePicker, {});
      scene.childEmit(KitCalendar, {
        _tag: "RequestedMonth",
        month: utc("2026-12-01"),
      });
      scene.expect(heading).toHaveText("December 2026");
      // The selection is in November, so no December cell is selected.
      scene.expect(selectedCell).toHaveCount(0);
    }),
  );

  it.effect("range: the committed range flags start, middle and end day buttons", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(RangePicker, {});
      assert.strictEqual(scene.get(dayButton("11/10/2026")).attrs?.["data-range-start"], "true");
      assert.strictEqual(scene.get(dayButton("11/11/2026")).attrs?.["data-range-middle"], "true");
      assert.strictEqual(scene.get(dayButton("11/12/2026")).attrs?.["data-range-end"], "true");
      // Nov 10–12 are all inside the range: three selected cells.
      scene.expect(selectedCell).toHaveCount(3);
    }),
  );

  it.effect("range: the child's Picked event replaces the range in the consumer Model", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(RangePicker, {});
      scene.childEmit(KitRangeCalendar, {
        _tag: "Picked",
        start: utc("2026-11-20"),
        end: utc("2026-11-21"),
      });
      assert.strictEqual(scene.get(dayButton("11/20/2026")).attrs?.["data-range-start"], "true");
      assert.strictEqual(scene.get(dayButton("11/21/2026")).attrs?.["data-range-end"], "true");
      assert.strictEqual(scene.get(dayButton("11/10/2026")).attrs?.["data-range-start"], "false");
      scene.expect(selectedCell).toHaveCount(2);
    }),
  );
});
