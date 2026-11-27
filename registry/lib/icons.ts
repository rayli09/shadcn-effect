/**
 * Icons — shared inline SVG builders for the registry.
 *
 * lucide-react is BANNED here (see docs/PORTING-RULES.md), so every icon is
 * an inline SVG built from lucide's own path data (ISC-licensed) with
 * `h.el("svg")` — the Html vocabulary has no `svg` tag, and `h.el` is
 * @effect/ui's documented by-name escape hatch (the hosts' `svgTags` set
 * gives the element the SVG namespace). This module hoists the builders
 * wave 1 duplicated file-locally in checkbox / select / combobox / command /
 * dropdown-menu / dialog / accordion / radio-group / spinner; those files
 * keep their local copies until the coordinator migrates them.
 *
 * Every builder takes `(h, options?)` and returns the svg view; the class
 * goes through `options.class` because the generic `h.el` builders have no
 * `.class()` helper (that lives only on the Html element builders). The svg
 * carries lucide's own attributes: xmlns, 24×24, viewBox 0 0 24 24,
 * fill none, stroke currentColor, stroke-width 2, round caps/joins,
 * aria-hidden.
 */
import { Html } from "@effect/ui/html";

type IconNode = readonly [tag: string, attrs: Readonly<Record<string, string>>];

export type IconOptions = { readonly class?: string | undefined };

/** Generic lucide glyph: an <svg> with lucide's base attrs around `nodes`. */
export const icon = <Msg>(
  h: Html.H<Msg>,
  nodes: ReadonlyArray<IconNode>,
  options: IconOptions = {},
) =>
  h
    .el("svg")
    .attrs({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
      ...(options.class !== undefined ? { class: options.class } : {}),
    })
    .children(nodes.map(([tag, attrs], index) => h.el(tag).key(String(index)).attrs(attrs)));

/** Lucide `check` (ISC): <path d="M20 6 9 17l-5-5" /> */
export const CheckIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(h, [["path", { d: "M20 6 9 17l-5-5" }]], options);

/** Lucide `chevron-down` (ISC): <path d="m6 9 6 6 6-6" /> */
export const ChevronDownIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(h, [["path", { d: "m6 9 6 6 6-6" }]], options);

/** Lucide `chevron-right` (ISC): <path d="m9 18 6-6-6-6" /> */
export const ChevronRightIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(h, [["path", { d: "m9 18 6-6-6-6" }]], options);

/** Lucide `chevron-up` (ISC): <path d="m18 15-6-6-6 6" /> */
export const ChevronUpIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(h, [["path", { d: "m18 15-6-6-6 6" }]], options);

/** Lucide `x` (ISC): <path d="M18 6 6 18" /> + <path d="m6 6 12 12" /> */
export const XIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M18 6 6 18" }],
      ["path", { d: "m6 6 12 12" }],
    ],
    options,
  );

/** Lucide `search` (ISC): <circle cx="11" cy="11" r="8" /> + <path d="m21 21-4.3-4.3" /> */
export const SearchIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "11", cy: "11", r: "8" }],
      ["path", { d: "m21 21-4.3-4.3" }],
    ],
    options,
  );

/** Lucide `loader-circle` (ISC, the Loader2 glyph): <path d="M21 12a9 9 0 1 1-6.219-8.56" /> */
export const LoaderCircleIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(h, [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }]], options);

/** Lucide `circle` (ISC): <circle cx="12" cy="12" r="10" /> */
export const CircleIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(h, [["circle", { cx: "12", cy: "12", r: "10" }]], options);

/** Lucide `arrow-down` (ISC): <path d="M12 5v14" /> + <path d="m19 12-7 7-7-7" /> */
export const ArrowDownIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 5v14" }],
      ["path", { d: "m19 12-7 7-7-7" }],
    ],
    options,
  );

/** Lucide `chevron-left` (ISC): <path d="m15 18-6-6 6-6" /> */
export const ChevronLeftIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(h, [["path", { d: "m15 18-6-6 6-6" }]], options);

/** Lucide `ellipsis` / `more-horizontal` (ISC): three circles. */
export const EllipsisIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "5", cy: "12", r: "1" }],
      ["circle", { cx: "12", cy: "12", r: "1" }],
      ["circle", { cx: "19", cy: "12", r: "1" }],
    ],
    options,
  );

/** Lucide `minus` (ISC): <path d="M5 12h14" /> */
export const MinusIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(h, [["path", { d: "M5 12h14" }]], options);

/** Lucide `panel-left` (ISC): rect + <path d="M9 3v18" /> */
export const PanelLeftIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }],
      ["path", { d: "M9 3v18" }],
    ],
    options,
  );

/** Lucide `calendar` (ISC). */
export const CalendarIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M8 2v4" }],
      ["path", { d: "M16 2v4" }],
      ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2" }],
      ["path", { d: "M3 10h18" }],
    ],
    options,
  );

/** Lucide `circle-check` (ISC). */
export const CircleCheckIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["path", { d: "m16 9-5.5 5.5L8 12" }],
    ],
    options,
  );

/** Lucide `info` (ISC). */
export const InfoIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["path", { d: "M12 16v-4" }],
      ["path", { d: "M12 8h.01" }],
    ],
    options,
  );

/** Lucide `triangle-alert` (ISC). */
export const TriangleAlertIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }],
      ["path", { d: "M12 9v4" }],
      ["path", { d: "M12 17h.01" }],
    ],
    options,
  );

/** Lucide `octagon-x` (ISC). */
export const OctagonXIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m15 9-6 6" }],
      [
        "path",
        {
          d: "M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z",
        },
      ],
      ["path", { d: "m9 9 6 6" }],
    ],
    options,
  );

/** Lucide `gallery-vertical-end` (ISC). */
export const GalleryVerticalEndIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M7 2h10" }],
      ["path", { d: "M5 6h14" }],
      ["rect", { width: "18", height: "12", x: "3", y: "10", rx: "2" }],
    ],
    options,
  );
