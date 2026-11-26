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
import { Html } from "@effect/ui/html"

type IconNode = readonly [
  tag: string,
  attrs: Readonly<Record<string, string>>
]

export type IconOptions = { readonly class?: string | undefined }

/** Generic lucide glyph: an <svg> with lucide's base attrs around `nodes`. */
export const icon = <Msg>(
  h: Html.H<Msg>,
  nodes: ReadonlyArray<IconNode>,
  options: IconOptions = {}
) =>
  h.el("svg").attrs({
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
    ...(options.class !== undefined ? { class: options.class } : {})
  }).children(
    nodes.map(([tag, attrs], index) =>
      h.el(tag).key(String(index)).attrs(attrs)
    )
  )

/** Lucide `check` (ISC): <path d="M20 6 9 17l-5-5" /> */
export const CheckIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(h, [["path", { d: "M20 6 9 17l-5-5" }]], options)

/** Lucide `chevron-down` (ISC): <path d="m6 9 6 6 6-6" /> */
export const ChevronDownIcon = <Msg>(
  h: Html.H<Msg>,
  options: IconOptions = {}
) => icon(h, [["path", { d: "m6 9 6 6 6-6" }]], options)

/** Lucide `chevron-right` (ISC): <path d="m9 18 6-6-6-6" /> */
export const ChevronRightIcon = <Msg>(
  h: Html.H<Msg>,
  options: IconOptions = {}
) => icon(h, [["path", { d: "m9 18 6-6-6-6" }]], options)

/** Lucide `chevron-up` (ISC): <path d="m18 15-6-6-6 6" /> */
export const ChevronUpIcon = <Msg>(
  h: Html.H<Msg>,
  options: IconOptions = {}
) => icon(h, [["path", { d: "m18 15-6-6-6 6" }]], options)

/** Lucide `x` (ISC): <path d="M18 6 6 18" /> + <path d="m6 6 12 12" /> */
export const XIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M18 6 6 18" }],
      ["path", { d: "m6 6 12 12" }]
    ],
    options
  )

/** Lucide `search` (ISC): <circle cx="11" cy="11" r="8" /> + <path d="m21 21-4.3-4.3" /> */
export const SearchIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "11", cy: "11", r: "8" }],
      ["path", { d: "m21 21-4.3-4.3" }]
    ],
    options
  )

/** Lucide `loader-circle` (ISC, the Loader2 glyph): <path d="M21 12a9 9 0 1 1-6.219-8.56" /> */
export const LoaderCircleIcon = <Msg>(
  h: Html.H<Msg>,
  options: IconOptions = {}
) => icon(h, [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }]], options)

/** Lucide `circle` (ISC): <circle cx="12" cy="12" r="10" /> */
export const CircleIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(h, [["circle", { cx: "12", cy: "12", r: "10" }]], options)

/** Lucide `arrow-down` (ISC): <path d="M12 5v14" /> + <path d="m19 12-7 7-7-7" /> */
export const ArrowDownIcon = <Msg>(
  h: Html.H<Msg>,
  options: IconOptions = {}
) =>
  icon(
    h,
    [
      ["path", { d: "M12 5v14" }],
      ["path", { d: "m19 12-7 7-7-7" }]
    ],
    options
  )
