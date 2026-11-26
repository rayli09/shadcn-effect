/**
 * Pagination — shadcn/ui `pagination` ported 1:1 to Effect UI.
 *
 * Upstream: React, plain markup; PaginationLink is an <a> wearing
 * `buttonVariants({ variant: isActive ? "outline" : "ghost", size })`.
 * Here: pure view functions returning @effect/ui Html builders, reusing the
 * ported `buttonVariants` from ./button.ts — the same reuse chain as
 * upstream, no duplicated class strings. Export names, rendered elements,
 * `data-slot`s and class strings are upstream's, byte-for-byte.
 *
 * Declared divergences (nothing else differs):
 *
 * - **Icons** — lucide-react is banned; ChevronLeft / ChevronRight /
 *   MoreHorizontal are file-local inline SVG builders from lucide path data
 *   (ISC), built with `h.el("svg")` per PORTING-RULES / D-7. Like upstream,
 *   PaginationPrevious / PaginationNext / PaginationEllipsis always render
 *   their icon + label children (upstream's explicit JSX children override
 *   any passed children there too).
 * - **`data-active` / `aria-current`** — written exactly as upstream React
 *   renders them: `aria-current="page"` only when active, `data-active`
 *   present ("true"/"false") only when `isActive` is given.
 */
import type * as Html from "@effect/ui/html/Html"
import { type Html as HtmlNs } from "@effect/ui/html"
import { cn } from "../lib/utils.ts"
import { buttonVariants, type ButtonSize } from "./button.ts"

export const PAGINATION_CLASS = "mx-auto flex w-full justify-center"

export const PAGINATION_CONTENT_CLASS = "flex flex-row items-center gap-1"

export const PAGINATION_ELLIPSIS_CLASS =
  "flex size-9 items-center justify-center"

export const PAGINATION_PREVIOUS_CLASS = "gap-1 px-2.5 sm:pl-2.5"

export const PAGINATION_NEXT_CLASS = "gap-1 px-2.5 sm:pr-2.5"

/** Lucide `chevron-left` path data (ISC). */
const CHEVRON_LEFT_PATH = "m15 18-6-6 6-6"

/** Lucide `chevron-right` path data (ISC). */
const CHEVRON_RIGHT_PATH = "m9 18 6-6-6-6"

/** Lucide `more-horizontal` circle centers (ISC): three dots at cy=12, r=1. */
const MORE_HORIZONTAL_CENTERS = ["5", "12", "19"] as const

const lucideAttrs = (cls?: string) => ({
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  ...(cls === undefined ? {} : { class: cls })
})

/** Lucide `chevron-left`, inline (upstream's ChevronLeftIcon). */
export const PaginationChevronLeft = <Msg>(h: HtmlNs.H<Msg>) =>
  h.el("svg").attrs(lucideAttrs()).children(
    h.el("path").attr("d", CHEVRON_LEFT_PATH)
  )

/** Lucide `chevron-right`, inline (upstream's ChevronRightIcon). */
export const PaginationChevronRight = <Msg>(h: HtmlNs.H<Msg>) =>
  h.el("svg").attrs(lucideAttrs()).children(
    h.el("path").attr("d", CHEVRON_RIGHT_PATH)
  )

/** Lucide `more-horizontal`, inline (upstream's MoreHorizontalIcon). */
export const PaginationMoreHorizontal = <Msg>(
  h: HtmlNs.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.el("svg").attrs(lucideAttrs(options.class)).children(
    ...MORE_HORIZONTAL_CENTERS.map((cx) =>
      h.el("circle").attrs({ cx, cy: "12", r: "1" })
    )
  )

type Element<Msg, R, Tag extends keyof HTMLElementTagNameMap> = Html.Element<
  Msg,
  R,
  Html.EventsOf<Tag>,
  HTMLElementTagNameMap[Tag],
  Tag
>

/**
 * The pagination <nav> (role="navigation", aria-label="pagination").
 * Chain `.children(PaginationContent(h).children(...))` on the result.
 */
export const Pagination = <Msg, R = never>(
  h: { readonly nav: Element<Msg, R, "nav"> },
  options: { readonly class?: string | undefined } = {}
) =>
  h.nav
    .attr("role", "navigation")
    .attr("aria-label", "pagination")
    .attr("data-slot", "pagination")
    .class(cn(PAGINATION_CLASS, options.class))

export const PaginationContent = <Msg, R = never>(
  h: { readonly ul: Element<Msg, R, "ul"> },
  options: { readonly class?: string | undefined } = {}
) =>
  h.ul
    .attr("data-slot", "pagination-content")
    .class(cn(PAGINATION_CONTENT_CLASS, options.class))

export const PaginationItem = <Msg, R = never>(
  h: { readonly li: Element<Msg, R, "li"> },
  options: { readonly class?: string | undefined } = {}
) => {
  const item = h.li.attr("data-slot", "pagination-item")
  return options.class === undefined ? item : item.class(options.class)
}

export type PaginationLinkOptions = {
  readonly isActive?: boolean | undefined
  readonly size?: ButtonSize | undefined
  readonly class?: string | undefined
}

/**
 * A page link: an <a> wearing `buttonVariants` — "outline" when active,
 * "ghost" otherwise; `size` defaults to "icon", as upstream. Chain
 * `.attr("href", ...)` and `.children(...)` on the result.
 */
export const PaginationLink = <Msg, R = never>(
  h: { readonly a: Element<Msg, R, "a"> },
  options: PaginationLinkOptions = {}
) => {
  const link = h.a
    .attr("data-slot", "pagination-link")
    .class(
      cn(
        buttonVariants({
          variant: options.isActive ? "outline" : "ghost",
          size: options.size ?? "icon"
        }),
        options.class
      )
    )
  if (options.isActive === undefined) return link
  const withActive = link.attr("data-active", String(options.isActive))
  return options.isActive
    ? withActive.attr("aria-current", "page")
    : withActive
}

/** Previous-page link: ChevronLeft + "Previous" (hidden below sm), size "default". */
export const PaginationPrevious = <Msg>(
  h: HtmlNs.H<Msg>,
  options: Omit<PaginationLinkOptions, "size"> & {
    readonly class?: string | undefined
  } = {}
) =>
  PaginationLink(h, {
    isActive: options.isActive,
    size: "default",
    class: cn(PAGINATION_PREVIOUS_CLASS, options.class)
  })
    .attr("aria-label", "Go to previous page")
    .children(
      PaginationChevronLeft(h),
      h.span.class("hidden sm:block").children("Previous")
    )

/** Next-page link: "Next" (hidden below sm) + ChevronRight, size "default". */
export const PaginationNext = <Msg>(
  h: HtmlNs.H<Msg>,
  options: Omit<PaginationLinkOptions, "size"> & {
    readonly class?: string | undefined
  } = {}
) =>
  PaginationLink(h, {
    isActive: options.isActive,
    size: "default",
    class: cn(PAGINATION_NEXT_CLASS, options.class)
  })
    .attr("aria-label", "Go to next page")
    .children(
      h.span.class("hidden sm:block").children("Next"),
      PaginationChevronRight(h)
    )

/** The skipped-pages ellipsis: MoreHorizontal icon + sr-only "More pages". */
export const PaginationEllipsis = <Msg>(
  h: HtmlNs.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.span
    .attr("aria-hidden", "true")
    .attr("data-slot", "pagination-ellipsis")
    .class(cn(PAGINATION_ELLIPSIS_CLASS, options.class))
    .children(
      PaginationMoreHorizontal(h, { class: "size-4" }),
      h.span.class("sr-only").children("More pages")
    )
