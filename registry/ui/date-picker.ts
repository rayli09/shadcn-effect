/**
 * DatePicker — the shadcn/ui "Date Picker" composition, ported to Effect UI.
 *
 * There is no upstream `ui/date-picker.tsx` in new-york-v4: shadcn ships the
 * date picker as a docs composition — a `Popover` whose trigger is an
 * outline `Button` showing the picked date (or "Pick a date") and whose
 * content is the single-mode `Calendar`. This port is that same composition
 * over this registry's own ports, per docs/PORTING-RULES.md:
 *
 * - `Popover` / `PopoverContent` from `./popover.ts` (kit Popover),
 * - `Calendar` from `./calendar.ts` (kit Calendar),
 * - `buttonVariants` from `./button.ts` for the trigger, which is the kit
 *   popover's `trigger` part stacked on a <button> (D-2: composition is
 *   `element` stacking, not `asChild`). The trigger therefore renders exactly
 *   what upstream's Button renders: `data-slot="button"`,
 *   `data-variant="outline"`, `data-size="default"`, the outline classes.
 *
 * State is the consumer's, as everywhere in this registry: `open`, the
 * picked `date` and the visible `month` are props; `onOpenChange`,
 * `onPick` and `onRequestMonth` turn the kit events into the consumer's
 * Messages. Upstream's example closes the popover inside `onSelect`
 * (`setDate(d); setOpen(false)`) — here the consumer does the same in the
 * update for their `onPick` message; the composition owns no state.
 *
 * Class strings are byte-for-byte the shadcn docs example's strings
 * (`w-[240px] justify-start text-left font-normal`, `text-muted-foreground`
 * when empty, the icon's `mr-2 h-4 w-4`, the content's `w-auto p-0`).
 *
 * NOT reproduced 1:1 (declared):
 * - The date label is formatted with `Intl.DateTimeFormat`
 *   (`month: "long", day: "numeric", year: "numeric"`, UTC) instead of
 *   date-fns `format(date, "PPP")` — date-fns is banned; the ordinal suffix
 *   ("April 29th, 2026" vs "April 29, 2026") is the visible difference.
 * - Upstream's `initialFocus` on the Calendar has no wiring here: focus on
 *   open is the kit Popover/Dialog's own model.
 * - The kit `@effect/ui-kit` also ships a purpose-built `DatePicker`
 *   component (segmented field + calendar popup); this port deliberately
 *   follows the brief — the shadcn composition over this registry's ports —
 *   not that primitive.
 * - The trigger and the (portaled) content are wrapped in one plain <div>:
 *   an Effect UI view returns one node where upstream returns a fragment.
 */
import type { PopoverAlign } from "@effect/ui-kit";
import type * as Html from "@effect/ui/html/Html";
import * as DateTime from "effect/DateTime";
import { CalendarIcon } from "../lib/icons.ts";
import { cn } from "../lib/utils.ts";
import { buttonVariants } from "./button.ts";
import { Calendar, type CalendarProps } from "./calendar.ts";
import { Popover, PopoverContent } from "./popover.ts";

// ---------------------------------------------------------------------------
// Icon — the shared `CalendarIcon` builder in ../lib/icons.ts (inline
// Lucide SVG; lucide-react is banned). That builder also sets xmlns /
// width / height on the <svg>, which the file-local builder it replaced
// did not, so the call site removes them again via `svgAttrRemovals`
// (`.attrs` with an `undefined` value removes the attribute) and the
// rendered <svg> keeps exactly the attributes it had before.
// ---------------------------------------------------------------------------

const svgAttrRemovals = {
  xmlns: undefined,
  width: undefined,
  height: undefined,
} as const;

// ---------------------------------------------------------------------------
// Class strings — verbatim from the shadcn Date Picker docs example
// ---------------------------------------------------------------------------

export const DATE_PICKER_TRIGGER_CLASS = "w-[240px] justify-start text-left font-normal";

export const DATE_PICKER_TRIGGER_EMPTY_CLASS = "text-muted-foreground";

export const DATE_PICKER_ICON_CLASS = "mr-2 h-4 w-4";

export const DATE_PICKER_CONTENT_CLASS = "w-auto p-0";

export const DATE_PICKER_PLACEHOLDER = "Pick a date";

// ---------------------------------------------------------------------------
// DatePicker
// ---------------------------------------------------------------------------

export type DatePickerDate = DateTime.Utc | null;

export interface DatePickerOptions<Msg> {
  /** The popover's open state (consumer Model), as upstream `open`. */
  readonly open: boolean;
  /** The picked date, or `null` for the placeholder state. */
  readonly date: DatePickerDate;
  /** Any date in the visible month (consumer Model). */
  readonly month: DateTime.Utc;
  /** The current day (passed in so rendering stays pure). */
  readonly today: DateTime.Utc;
  readonly min?: CalendarProps["min"];
  readonly max?: CalendarProps["max"];
  /** Consecutive months shown in the popup calendar (the Calendar port's `numberOfMonths`). Default `1`. */
  readonly numberOfMonths?: number | undefined;
  readonly locale?: CalendarProps["locale"];
  readonly firstDayOfWeek?: CalendarProps["firstDayOfWeek"];
  readonly disabled?: boolean | undefined;
  /** Placeholder text; upstream's literal is `"Pick a date"`. */
  readonly placeholder?: string | undefined;
  /** Upstream `PopoverContent align`; the docs example uses `"start"`. */
  readonly align?: PopoverAlign | undefined;
  /** Extra trigger classes, after the example's own (D-1: no merge). */
  readonly class?: string | undefined;
  readonly onOpenChange: (open: boolean) => Msg | undefined;
  readonly onPick: (date: DateTime.Utc) => Msg | undefined;
  readonly onRequestMonth: (month: DateTime.Utc) => Msg | undefined;
}

export const DatePicker = <Msg>(h: Html.H<Msg>, options: DatePickerOptions<Msg>) =>
  Popover(h, {
    props: { open: options.open, align: options.align ?? "start" },
    onEmit: {
      RequestedOpen: () => options.onOpenChange(true),
      RequestedClose: () => options.onOpenChange(false),
      Settled: () => undefined,
    },
    view: (popover) =>
      h.div.children(
        popover
          .trigger({ element: h.button })
          .attr("data-slot", "button")
          .attr("data-variant", "outline")
          .attr("data-size", "default")
          .class(
            cn(
              buttonVariants({ variant: "outline" }),
              DATE_PICKER_TRIGGER_CLASS,
              options.date === null && DATE_PICKER_TRIGGER_EMPTY_CLASS,
              options.class,
            ),
          )
          .children(
            CalendarIcon(h, { class: DATE_PICKER_ICON_CLASS }).attrs(svgAttrRemovals),
            options.date === null
              ? h.span.children(options.placeholder ?? DATE_PICKER_PLACEHOLDER)
              : DateTime.formatIntl(
                  DateTime.removeTime(options.date),
                  new Intl.DateTimeFormat(options.locale, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  }),
                ),
          ),
        popover.portal(h.dialog)?.children(
          popover.positioner(h.div).children(
            PopoverContent(popover.popup(h.div), {
              class: DATE_PICKER_CONTENT_CLASS,
            }).children(
              Calendar(h, {
                numberOfMonths: options.numberOfMonths,
                props: {
                  value: options.date,
                  month: options.month,
                  today: options.today,
                  min: options.min,
                  max: options.max,
                  locale: options.locale,
                  firstDayOfWeek: options.firstDayOfWeek,
                  disabled: options.disabled,
                },
                onEmit: {
                  Picked: ({ date }) => options.onPick(date),
                  RequestedMonth: ({ month }) => options.onRequestMonth(month),
                },
              }),
            ),
          ),
        ),
      ),
  });
