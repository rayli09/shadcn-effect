/**
 * Calendar — shadcn/ui `calendar` ported 1:1 to Effect UI.
 *
 * Upstream: React + react-day-picker (DayPicker) + a shadcn `CalendarDayButton`
 * built on the shadcn Button. Here: the @effect/ui-kit `Calendar` (single
 * date) and `RangeCalendar` (range) headless Components — react-day-picker is
 * banned, the kit computes the grid, keyboard navigation, focus and ARIA.
 * The consumer owns the selected value and the visible month in their Model
 * and stores what the kit's `Picked` / `RequestedMonth` events ask for; this
 * wrapper only draws the shadcn anatomy around the kit parts:
 *
 *   root (data-slot="calendar") > nav (previous / next) + months > month >
 *   month_caption (kit heading) + month_grid (kit grid > weekday / cell > day)
 *
 * The kit shows `months` consecutive months under one root (upstream PR
 * #427): the shared parts (`root` / `previous` / `next` / `weekday` /
 * `weekdays`) sit at the top level and each shown month's parts live in
 * `parts.months`, one entry per month. The view iterates those entries,
 * drawing one upstream month section per entry inside the single `months`
 * container. `CalendarDayButton` is kept as a styled part applier (upstream
 * name): it stamps the upstream `data-day` / `data-selected-single` /
 * `data-range-*` attributes and the ghost/icon Button classes onto a kit
 * `day` part's builder.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings. The
 * react-day-picker default class names (`getDefaultClassNames()`, e.g.
 * `rdp-day`) are runtime values of the banned engine, not upstream literals,
 * and are not reproduced.
 *
 * NOT reproduced 1:1 (declared, on top of docs/PORTING-RULES.md):
 * - `mode="multiple"` — the kit has no multi-select calendar (its `value`
 *   is a single date; verified against the current kit source). `mode="range"`
 *   is `RangeCalendar` below; `mode="single"` is `Calendar`.
 * - `captionLayout="dropdown*"` — the kit has no month/year dropdown
 *   machinery (month changes arrive as `RequestedMonth`); the caption always
 *   renders the label. The dropdown class constants are exported for parity.
 *   Upstream's `formatMonthDropdown` formatter has no counterpart either.
 * - DayPicker's `disabled` date matchers (Date / range / weekday / array)
 *   become the kit's `min` / `max` props plus an `isUnavailable` predicate
 *   option, which is passed to the kit `day` part's `available` machinery.
 * - The day button's `group-data-[focused=true]/day:*` utilities key off
 *   `data-focused` on the *cell* in react-day-picker; the kit writes
 *   `data-focused` on the day *button* itself, so those utilities stay inert
 *   (D-5 family). The classes are kept verbatim.
 * - Range preview: while a range pick is in progress, the kit day buttons
 *   carry the preview via their own `data-range-*` flags, but the *cell*
 *   range classes (`range_start` / `range_middle` / `range_end`) are drawn
 *   from the committed `value` only — the draft lives in the kit's Model.
 * - `showWeekNumber` renders the ISO-8601 week number; react-day-picker uses
 *   date-fns `getWeek` with locale options, so edge weeks can differ by one.
 * - Custom `components` overrides (Root / Chevron / DayButton / WeekNumber
 *   React components) do not exist; the chevrons are the shared inline-SVG
 *   builders in ../lib/icons.ts (lucide path data, ISC) — lucide-react is
 *   banned in this registry.
 */
import {
  Calendar as KitCalendar,
  RangeCalendar as KitRangeCalendar,
  type CalendarEvents as KitCalendarEvents,
  type CalendarProps as KitCalendarProps,
  type RangeCalendarEvents as KitRangeCalendarEvents,
  type RangeCalendarProps as KitRangeCalendarProps,
} from "@effect/ui-kit";
import type * as Component from "@effect/ui/Component";
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import * as DateTime from "effect/DateTime";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "../lib/icons.ts";
import { cn } from "../lib/utils.ts";
import { buttonVariants, type ButtonVariant } from "./button.ts";

// ---------------------------------------------------------------------------
// Icons — the shared builders in ../lib/icons.ts (inline Lucide SVG; the
// lucide-react package is banned). Those builders also set xmlns / width /
// height on the <svg>, which the file-local builders they replaced did
// not, so every call site removes them again via `svgAttrRemovals`
// (`.attrs` with an `undefined` value removes the attribute) and the
// rendered <svg> keeps exactly the attributes it had before.
// ---------------------------------------------------------------------------

const svgAttrRemovals = {
  xmlns: undefined,
  width: undefined,
  height: undefined,
} as const;

// ---------------------------------------------------------------------------
// Class strings — verbatim from shadcn new-york-v4 calendar.tsx
// (the `...ClassNames` halves that came from getDefaultClassNames() are
// react-day-picker runtime values and are not literals; see header).
// ---------------------------------------------------------------------------

export const CALENDAR_CLASS =
  "group/calendar bg-background p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent";

export const CALENDAR_RTL_PREVIOUS_CLASS = String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`;

export const CALENDAR_RTL_NEXT_CLASS = String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`;

export const CALENDAR_ROOT_CLASS = "w-fit";

export const CALENDAR_MONTHS_CLASS = "relative flex flex-col gap-4 md:flex-row";

export const CALENDAR_MONTH_CLASS = "flex w-full flex-col gap-4";

export const CALENDAR_NAV_CLASS =
  "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1";

/** The nav buttons additionally wear `buttonVariants({ variant: buttonVariant })`. */
export const CALENDAR_NAV_BUTTON_CLASS =
  "size-(--cell-size) p-0 select-none aria-disabled:opacity-50";

export const CALENDAR_MONTH_CAPTION_CLASS =
  "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)";

export const CALENDAR_DROPDOWNS_CLASS =
  "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium";

export const CALENDAR_DROPDOWN_ROOT_CLASS =
  "relative rounded-md border border-input shadow-xs has-focus:border-ring has-focus:ring-[3px] has-focus:ring-ring/50";

export const CALENDAR_DROPDOWN_CLASS = "absolute inset-0 bg-popover opacity-0";

export const CALENDAR_CAPTION_LABEL_CLASS = "font-medium select-none";

export const CALENDAR_CAPTION_LABEL_TEXT_CLASS = "text-sm";

export const CALENDAR_CAPTION_LABEL_DROPDOWN_CLASS =
  "flex h-8 items-center gap-1 rounded-md pr-1 pl-2 text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground";

export const CALENDAR_MONTH_GRID_CLASS = "w-full border-collapse";

export const CALENDAR_WEEKDAYS_CLASS = "flex";

export const CALENDAR_WEEKDAY_CLASS =
  "flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none";

export const CALENDAR_WEEK_CLASS = "mt-2 flex w-full";

export const CALENDAR_WEEK_NUMBER_HEADER_CLASS = "w-(--cell-size) select-none";

export const CALENDAR_WEEK_NUMBER_CLASS = "text-[0.8rem] text-muted-foreground select-none";

export const CALENDAR_WEEK_NUMBER_INNER_CLASS =
  "flex size-(--cell-size) items-center justify-center text-center";

export const CALENDAR_DAY_CLASS =
  "group/day relative aspect-square h-full w-full p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-md";

export const CALENDAR_DAY_FIRST_SELECTED_CLASS =
  "[&:first-child[data-selected=true]_button]:rounded-l-md";

export const CALENDAR_DAY_NTH_SELECTED_CLASS =
  "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md";

export const CALENDAR_RANGE_START_CLASS = "rounded-l-md bg-accent";

export const CALENDAR_RANGE_MIDDLE_CLASS = "rounded-none";

export const CALENDAR_RANGE_END_CLASS = "rounded-r-md bg-accent";

export const CALENDAR_TODAY_CLASS =
  "rounded-md bg-accent text-accent-foreground data-[selected=true]:rounded-none";

export const CALENDAR_OUTSIDE_CLASS = "text-muted-foreground aria-selected:text-muted-foreground";

export const CALENDAR_DISABLED_CLASS = "text-muted-foreground opacity-50";

export const CALENDAR_HIDDEN_CLASS = "invisible";

export const CALENDAR_DAY_BUTTON_CLASS =
  "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-accent-foreground [&>span]:text-xs [&>span]:opacity-70";

/** Upstream renders the nav / dropdown chevrons at `size-4`. */
export const CALENDAR_CHEVRON_CLASS = "size-4";

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export type CalendarCaptionLayout = "label" | "dropdown" | "dropdown-months" | "dropdown-years";

/** Upstream's per-slot `classNames` overrides: a key replaces that slot's whole class string, as upstream's spread does. */
export interface CalendarClassNames {
  readonly root?: string | undefined;
  readonly months?: string | undefined;
  readonly month?: string | undefined;
  readonly nav?: string | undefined;
  readonly button_previous?: string | undefined;
  readonly button_next?: string | undefined;
  readonly month_caption?: string | undefined;
  readonly dropdowns?: string | undefined;
  readonly dropdown_root?: string | undefined;
  readonly dropdown?: string | undefined;
  readonly caption_label?: string | undefined;
  readonly month_grid?: string | undefined;
  readonly weekdays?: string | undefined;
  readonly weekday?: string | undefined;
  readonly week?: string | undefined;
  readonly week_number_header?: string | undefined;
  readonly week_number?: string | undefined;
  readonly day?: string | undefined;
  readonly range_start?: string | undefined;
  readonly range_middle?: string | undefined;
  readonly range_end?: string | undefined;
  readonly today?: string | undefined;
  readonly outside?: string | undefined;
  readonly disabled?: string | undefined;
  readonly hidden?: string | undefined;
}

interface CalendarStyleOptions {
  /**
   * Upstream `numberOfMonths`: how many consecutive months to show under
   * one root. Maps to the kit's `months` prop and overrides
   * `props.months` when set. Default `1`.
   */
  readonly numberOfMonths?: number | undefined;
  /** Upstream `buttonVariant`: the shadcn Button variant the nav buttons wear. Default `"ghost"`. */
  readonly buttonVariant?: ButtonVariant | undefined;
  /** Upstream `captionLayout`. Only `"label"` renders; see header. Default `"label"`. */
  readonly captionLayout?: CalendarCaptionLayout | undefined;
  /** Upstream `showOutsideDays`. Default `true`; when `false`, outside cells render empty with the `hidden` class. */
  readonly showOutsideDays?: boolean | undefined;
  /** Upstream `showWeekNumber`. Default `false`. */
  readonly showWeekNumber?: boolean | undefined;
  readonly classNames?: CalendarClassNames | undefined;
  readonly class?: string | undefined;
  /** Days that render unavailable (focusable, never picked): the kit `day` part's `unavailable` flag, per date. */
  readonly isUnavailable?: ((date: DateTime.Utc) => boolean) | undefined;
}

// ---------------------------------------------------------------------------
// Date helpers — every date is compared by its normalized (midnight-UTC) day,
// exactly as the kit normalizes them.
// ---------------------------------------------------------------------------

const dayKey = (date: DateTime.DateTime): number =>
  DateTime.toEpochMillis(DateTime.removeTime(date));

const sameDay = (a: DateTime.DateTime, b: DateTime.DateTime): boolean => dayKey(a) === dayKey(b);

const sameMonth = (a: DateTime.DateTime, b: DateTime.DateTime): boolean => {
  const x = DateTime.removeTime(a);
  const y = DateTime.removeTime(b);
  return (
    DateTime.getPartUtc(x, "month") === DateTime.getPartUtc(y, "month") &&
    DateTime.getPartUtc(x, "year") === DateTime.getPartUtc(y, "year")
  );
};

const outOfRange = (
  date: DateTime.DateTime,
  min: DateTime.DateTime | undefined,
  max: DateTime.DateTime | undefined,
): boolean =>
  (min !== undefined && dayKey(date) < dayKey(min)) ||
  (max !== undefined && dayKey(date) > dayKey(max));

const inRange = (
  date: DateTime.DateTime,
  start: DateTime.DateTime,
  end: DateTime.DateTime,
): boolean => dayKey(date) >= dayKey(start) && dayKey(date) <= dayKey(end);

/** ISO-8601 week number of the week containing `date` (see header note). */
const isoWeekNumber = (date: DateTime.DateTime): number => {
  const d = new Date(DateTime.toDateUtc(DateTime.removeTime(date)));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart) / 86400000 + 1) / 7);
};

/** Upstream `data-day={day.date.toLocaleDateString()}`: default-locale short date of the normalized day. */
const formatDay = (date: DateTime.DateTime, locale: KitCalendarProps["locale"]): string =>
  new Intl.DateTimeFormat(locale, { timeZone: "UTC" }).format(
    DateTime.toDateUtc(DateTime.removeTime(date)),
  );

// ---------------------------------------------------------------------------
// CalendarDayButton — upstream name kept. Upstream it is the shadcn Button
// (ghost / icon) wearing the day modifiers as data attributes; here it is a
// styled applier for a kit `day` part's builder (D-6).
// ---------------------------------------------------------------------------

export interface CalendarDayButtonOptions {
  /** The `data-day` value: the day's locale date string. */
  readonly day: string;
  readonly selectedSingle?: boolean | undefined;
  readonly rangeStart?: boolean | undefined;
  readonly rangeEnd?: boolean | undefined;
  readonly rangeMiddle?: boolean | undefined;
  readonly class?: string | undefined;
}

export const CalendarDayButton = <Msg, R, E, N, T extends string>(
  button: Html.Element<Msg, R, E, N, T>,
  options: CalendarDayButtonOptions,
) =>
  button
    .attr("data-day", options.day)
    .attr("data-selected-single", String(options.selectedSingle ?? false))
    .attr("data-range-start", String(options.rangeStart ?? false))
    .attr("data-range-end", String(options.rangeEnd ?? false))
    .attr("data-range-middle", String(options.rangeMiddle ?? false))
    .class(
      cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        CALENDAR_DAY_BUTTON_CLASS,
        options.class,
      ),
    );

// ---------------------------------------------------------------------------
// The shared drawing. Both kit components expose the same part layout:
// shared parts at the top level (`root` / `previous` / `next` / `weekday`
// plus the `weekdays` names) and one entry per shown month in
// `parts.months` (`month` / `title` / `weeks` / `heading` / `grid` / `cell`
// / `day`). Only the per-day selection modifiers differ, and those are
// supplied by the caller.
// ---------------------------------------------------------------------------

type KitCalendarMonthParts = Component.Headless.Parts<typeof KitCalendar>["months"][number];

interface DayModifiers {
  readonly selected: boolean;
  readonly selectedSingle: boolean;
  readonly rangeStart: boolean;
  readonly rangeMiddle: boolean;
  readonly rangeEnd: boolean;
}

interface DrawInfo {
  readonly today: DateTime.DateTime;
  readonly min: DateTime.DateTime | undefined;
  readonly max: DateTime.DateTime | undefined;
  readonly disabled: boolean;
  readonly locale: KitCalendarProps["locale"];
  readonly buttonVariant: ButtonVariant;
  readonly captionLayout: CalendarCaptionLayout;
  readonly showOutsideDays: boolean;
  readonly showWeekNumber: boolean;
  readonly classNames: CalendarClassNames | undefined;
  readonly class: string | undefined;
  readonly isUnavailable: ((date: DateTime.Utc) => boolean) | undefined;
  readonly modifiers: (date: DateTime.Utc) => DayModifiers;
}

const drawCalendar = <Msg>(
  h: Html.H<Msg>,
  parts: Component.Headless.Parts<typeof KitCalendar>,
  info: DrawInfo,
) => {
  const slot = (key: keyof CalendarClassNames, def: string): string =>
    info.classNames?.[key] ?? def;

  const captionLabelClass = slot(
    "caption_label",
    cn(
      CALENDAR_CAPTION_LABEL_CLASS,
      info.captionLayout === "label"
        ? CALENDAR_CAPTION_LABEL_TEXT_CLASS
        : CALENDAR_CAPTION_LABEL_DROPDOWN_CLASS,
    ),
  );

  const dayDefault = cn(
    CALENDAR_DAY_CLASS,
    info.showWeekNumber ? CALENDAR_DAY_NTH_SELECTED_CLASS : CALENDAR_DAY_FIRST_SELECTED_CLASS,
  );

  const drawDay = (monthParts: KitCalendarMonthParts, date: DateTime.Utc) => {
    const mods = info.modifiers(date);
    const outside = !sameMonth(date, monthParts.month);
    const today = sameDay(date, info.today);
    const disabledDay = info.disabled || outOfRange(date, info.min, info.max);
    const hidden = outside && !info.showOutsideDays;
    const cell = monthParts
      .cell({ element: h.td, date })
      .class(
        cn(
          slot("day", dayDefault),
          mods.rangeStart && slot("range_start", CALENDAR_RANGE_START_CLASS),
          mods.rangeMiddle && slot("range_middle", CALENDAR_RANGE_MIDDLE_CLASS),
          mods.rangeEnd && slot("range_end", CALENDAR_RANGE_END_CLASS),
          today && slot("today", CALENDAR_TODAY_CLASS),
          outside && slot("outside", CALENDAR_OUTSIDE_CLASS),
          disabledDay && slot("disabled", CALENDAR_DISABLED_CLASS),
          hidden && slot("hidden", CALENDAR_HIDDEN_CLASS),
        ),
      );
    const selected = mods.selected ? cell.attr("data-selected", "true") : cell;
    if (hidden) return selected;
    return selected.children(
      CalendarDayButton(
        monthParts.day({
          element: h.button,
          date,
          unavailable: info.isUnavailable?.(date),
        }),
        {
          day: formatDay(date, info.locale),
          selectedSingle: mods.selectedSingle,
          rangeStart: mods.rangeStart,
          rangeEnd: mods.rangeEnd,
          rangeMiddle: mods.rangeMiddle,
        },
      ).children(String(DateTime.getPartUtc(date, "day"))),
    );
  };

  const drawMonthSection = (monthParts: KitCalendarMonthParts) =>
    h.div.class(slot("month", CALENDAR_MONTH_CLASS)).children(
      h.div.class(slot("month_caption", CALENDAR_MONTH_CAPTION_CLASS)).children(
        monthParts
          .heading(h.div)
          .class(captionLabelClass)
          .children(
            monthParts.title,
            // The dropdown caption layouts render no dropdown in the
            // kit (see header); the chevron is drawn so the caption
            // keeps upstream's anatomy, inert.
            info.captionLayout === "label"
              ? undefined
              : ChevronDownIcon(h, { class: CALENDAR_CHEVRON_CLASS }).attrs(svgAttrRemovals),
          ),
      ),
      monthParts
        .grid(h.table)
        .class(slot("month_grid", CALENDAR_MONTH_GRID_CLASS))
        .children(
          h.thead(
            h.tr
              .class(slot("weekdays", CALENDAR_WEEKDAYS_CLASS))
              .children(
                info.showWeekNumber
                  ? h.th.class(slot("week_number_header", CALENDAR_WEEK_NUMBER_HEADER_CLASS))
                  : undefined,
                ...parts.weekdays.map((weekday, index) =>
                  parts
                    .weekday({ element: h.th, index })
                    .class(slot("weekday", CALENDAR_WEEKDAY_CLASS))
                    .children(weekday.short),
                ),
              ),
          ),
          h.tbody(
            ...monthParts.weeks.map((week) =>
              h.tr
                .class(slot("week", CALENDAR_WEEK_CLASS))
                .children(
                  info.showWeekNumber
                    ? h.td
                        .class(slot("week_number", CALENDAR_WEEK_NUMBER_CLASS))
                        .children(
                          h.div
                            .class(CALENDAR_WEEK_NUMBER_INNER_CLASS)
                            .children(String(isoWeekNumber(week[0]!))),
                        )
                    : undefined,
                  ...week.map((date) => drawDay(monthParts, date)),
                ),
            ),
          ),
        ),
    );

  return parts
    .root(h.div)
    .attr("data-slot", "calendar")
    .class(
      cn(
        CALENDAR_CLASS,
        CALENDAR_RTL_PREVIOUS_CLASS,
        CALENDAR_RTL_NEXT_CLASS,
        slot("root", CALENDAR_ROOT_CLASS),
        info.class,
      ),
    )
    .children(
      h.div.class(slot("nav", CALENDAR_NAV_CLASS)).children(
        parts
          .previous(h.button)
          .class(
            cn(
              buttonVariants({ variant: info.buttonVariant }),
              slot("button_previous", CALENDAR_NAV_BUTTON_CLASS),
            ),
          )
          .children(ChevronLeftIcon(h, { class: CALENDAR_CHEVRON_CLASS }).attrs(svgAttrRemovals)),
        parts
          .next(h.button)
          .class(
            cn(
              buttonVariants({ variant: info.buttonVariant }),
              slot("button_next", CALENDAR_NAV_BUTTON_CLASS),
            ),
          )
          .children(ChevronRightIcon(h, { class: CALENDAR_CHEVRON_CLASS }).attrs(svgAttrRemovals)),
      ),
      h.div
        .class(slot("months", CALENDAR_MONTHS_CLASS))
        .children(...parts.months.map(drawMonthSection)),
    );
};

const drawInfo = (
  props: {
    readonly today: DateTime.DateTime;
    readonly min?: DateTime.DateTime | undefined;
    readonly max?: DateTime.DateTime | undefined;
    readonly disabled?: boolean | undefined;
    readonly locale?: KitCalendarProps["locale"];
  },
  options: CalendarStyleOptions,
  modifiers: (date: DateTime.Utc) => DayModifiers,
): DrawInfo => ({
  today: props.today,
  min: props.min,
  max: props.max,
  disabled: props.disabled === true,
  locale: props.locale,
  buttonVariant: options.buttonVariant ?? "ghost",
  captionLayout: options.captionLayout ?? "label",
  showOutsideDays: options.showOutsideDays ?? true,
  showWeekNumber: options.showWeekNumber ?? false,
  classNames: options.classNames,
  class: options.class,
  isUnavailable: options.isUnavailable,
  modifiers,
});

// ---------------------------------------------------------------------------
// Calendar (single) / RangeCalendar (range)
// ---------------------------------------------------------------------------

export type CalendarProps = KitCalendarProps;
export type { KitCalendarEvents as CalendarEvents };
export type RangeCalendarProps = KitRangeCalendarProps;
export type { KitRangeCalendarEvents as RangeCalendarEvents };

/** The port's `numberOfMonths` option, mapped onto the kit's `months` prop. */
const withMonths = <P extends { readonly months?: number | undefined }>(
  props: P,
  numberOfMonths: number | undefined,
): P => (numberOfMonths === undefined ? props : { ...props, months: numberOfMonths });

export const Calendar = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly props: KitCalendarProps;
    readonly onEmit: View.Child.Options<KitCalendarProps, KitCalendarEvents, Msg>["onEmit"];
  } & CalendarStyleOptions,
) =>
  KitCalendar(h, {
    props: withMonths(options.props, options.numberOfMonths),
    onEmit: options.onEmit,
    view: (calendar) =>
      drawCalendar(
        h,
        calendar,
        drawInfo(options.props, options, (date) => {
          const selected = options.props.value !== null && sameDay(date, options.props.value);
          return {
            selected,
            selectedSingle: selected,
            rangeStart: false,
            rangeMiddle: false,
            rangeEnd: false,
          };
        }),
      ),
  });

export const RangeCalendar = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly props: KitRangeCalendarProps;
    readonly onEmit: View.Child.Options<
      KitRangeCalendarProps,
      KitRangeCalendarEvents,
      Msg
    >["onEmit"];
  } & CalendarStyleOptions,
) =>
  KitRangeCalendar(h, {
    props: withMonths(options.props, options.numberOfMonths),
    onEmit: options.onEmit,
    view: (rangeCalendar) =>
      drawCalendar(
        h,
        rangeCalendar,
        drawInfo(options.props, options, (date) => {
          const value = options.props.value;
          if (value === null) {
            return {
              selected: false,
              selectedSingle: false,
              rangeStart: false,
              rangeMiddle: false,
              rangeEnd: false,
            };
          }
          const start = DateTime.min(value.start, value.end);
          const end = DateTime.max(value.start, value.end);
          const rangeStart = sameDay(date, start);
          const rangeEnd = sameDay(date, end);
          const selected = inRange(date, start, end);
          const rangeMiddle = selected && !rangeStart && !rangeEnd;
          return {
            selected,
            selectedSingle: selected && !rangeStart && !rangeEnd && !rangeMiddle,
            rangeStart,
            rangeMiddle,
            rangeEnd,
          };
        }),
      ),
  });
