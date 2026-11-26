/**
 * Table — shadcn/ui `table` ported 1:1 to Effect UI.
 *
 * Upstream: pure markup — styled native table elements, with `Table`
 * rendering a scroll container <div data-slot="table-container"> around the
 * <table data-slot="table"> (upstream's `className` and children land on the
 * <table>, never the container). There is no kit part for a data table, so
 * these are view functions on `h.table` / `h.thead` / … with the exact
 * upstream class strings and `data-slot` attributes. `Table` composes the
 * container + table pair itself (the native-select wrapper pattern), so the
 * rendered DOM is identical to upstream; pass the sections/rows as
 * `children`, built with the part functions below.
 *
 * Table keeps no state, so none of these are Components. Upstream spreads
 * arbitrary element props; here the caller chains builder methods
 * (`.attr(...)`, `.on(...)`, …) on the returned builders instead — the
 * repo-wide view-function shape (see badge.ts). One consequence: the row's
 * `data-[state=selected]:bg-muted` variant fires only when the caller sets
 * `data-state="selected"` on the row builder — exactly as upstream, where
 * the attribute likewise comes from the caller's table state, not the
 * component.
 */
import type * as Html from "@effect/ui/html/Html"
import type * as View from "@effect/ui/View"
import { cn } from "../lib/utils.ts"

export const TABLE_CONTAINER_CLASS = "relative w-full overflow-x-auto"

export const TABLE_CLASS = "w-full caption-bottom text-sm"

export const TABLE_HEADER_CLASS = "[&_tr]:border-b"

export const TABLE_BODY_CLASS = "[&_tr:last-child]:border-0"

export const TABLE_FOOTER_CLASS =
  "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0"

export const TABLE_ROW_CLASS =
  "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted"

export const TABLE_HEAD_CLASS =
  "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"

export const TABLE_CELL_CLASS =
  "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"

export const TABLE_CAPTION_CLASS = "mt-4 text-sm text-muted-foreground"

/** A `<div>` builder for the scroll container. */
export type TableContainerElement<Msg, R = never> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"div">,
  HTMLDivElement,
  "div"
>

/** A `<table>` builder. */
export type TableElement<Msg, R = never> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"table">,
  HTMLTableElement,
  "table"
>

/** A `<thead>` / `<tbody>` / `<tfoot>` builder. */
export type TableSectionElement<
  Msg,
  Tag extends "thead" | "tbody" | "tfoot",
  R = never
> = Html.Element<Msg, R, Html.EventsOf<Tag>, HTMLTableSectionElement, Tag>

/** A `<tr>` builder. */
export type TableRowElement<Msg, R = never> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"tr">,
  HTMLTableRowElement,
  "tr"
>

/** A `<th>` / `<td>` builder. */
export type TableCellElement<
  Msg,
  Tag extends "th" | "td",
  R = never
> = Html.Element<Msg, R, Html.EventsOf<Tag>, HTMLTableCellElement, Tag>

/** A `<caption>` builder. */
export type TableCaptionElement<Msg, R = never> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"caption">,
  HTMLTableCaptionElement,
  "caption"
>

/**
 * A shadcn-styled table: the scroll container wrapping the <table>.
 *
 *   Table(h, {
 *     children: [
 *       TableHeader(h).children(
 *         TableRow(h).children(TableHead(h).children("Name"))
 *       ),
 *       TableBody(h).children(...)
 *     ]
 *   })
 *
 * `class` lands on the <table>, as upstream's `className` does.
 */
export const Table = <
  Msg,
  R = never,
  C extends View.Children<Msg> = View.Children<Msg>
>(
  h: {
    readonly div: TableContainerElement<Msg, R>
    readonly table: TableElement<Msg, R>
  },
  options: {
    readonly class?: string | undefined
    /** The table's children: TableCaption / TableHeader / TableBody / TableFooter builders. */
    readonly children?: C | undefined
  } = {}
) => {
  const table = h.table
    .attr("data-slot", "table")
    .class(cn(TABLE_CLASS, options.class))
  return h.div
    .attr("data-slot", "table-container")
    .class(TABLE_CONTAINER_CLASS)
    .children(
      options.children !== undefined ? table.children(options.children) : table
    )
}

/** The table's header section (<thead>). */
export const TableHeader = <Msg, R = never>(
  h: { readonly thead: TableSectionElement<Msg, "thead", R> },
  options: { readonly class?: string | undefined } = {}
) =>
  h.thead
    .attr("data-slot", "table-header")
    .class(cn(TABLE_HEADER_CLASS, options.class))

/** The table's body section (<tbody>). */
export const TableBody = <Msg, R = never>(
  h: { readonly tbody: TableSectionElement<Msg, "tbody", R> },
  options: { readonly class?: string | undefined } = {}
) =>
  h.tbody
    .attr("data-slot", "table-body")
    .class(cn(TABLE_BODY_CLASS, options.class))

/** The table's footer section (<tfoot>). */
export const TableFooter = <Msg, R = never>(
  h: { readonly tfoot: TableSectionElement<Msg, "tfoot", R> },
  options: { readonly class?: string | undefined } = {}
) =>
  h.tfoot
    .attr("data-slot", "table-footer")
    .class(cn(TABLE_FOOTER_CLASS, options.class))

/** A table row (<tr>). */
export const TableRow = <Msg, R = never>(
  h: { readonly tr: TableRowElement<Msg, R> },
  options: { readonly class?: string | undefined } = {}
) =>
  h.tr
    .attr("data-slot", "table-row")
    .class(cn(TABLE_ROW_CLASS, options.class))

/** A header cell (<th>). */
export const TableHead = <Msg, R = never>(
  h: { readonly th: TableCellElement<Msg, "th", R> },
  options: { readonly class?: string | undefined } = {}
) =>
  h.th
    .attr("data-slot", "table-head")
    .class(cn(TABLE_HEAD_CLASS, options.class))

/** A body cell (<td>). */
export const TableCell = <Msg, R = never>(
  h: { readonly td: TableCellElement<Msg, "td", R> },
  options: { readonly class?: string | undefined } = {}
) =>
  h.td
    .attr("data-slot", "table-cell")
    .class(cn(TABLE_CELL_CLASS, options.class))

/** The table's caption (<caption>). */
export const TableCaption = <Msg, R = never>(
  h: { readonly caption: TableCaptionElement<Msg, R> },
  options: { readonly class?: string | undefined } = {}
) =>
  h.caption
    .attr("data-slot", "table-caption")
    .class(cn(TABLE_CAPTION_CLASS, options.class))
