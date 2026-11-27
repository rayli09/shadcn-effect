/**
 * Pagination (bases generation) — shadcn/ui `pagination` ported 1:1 to
 * Effect UI, with the class layer of upstream's bases/radix generation
 * instead of new-york-v4's.
 *
 * Same port as registry/ui/pagination.ts — pure view functions
 * returning @effect/ui Html builders. Upstream's PaginationLink is a
 * bases `Button` worn by an <a> (`asChild`), so the anchor carries
 * `buttonVariants({ variant: isActive ? "outline" : "ghost", size })`;
 * here the anchor wears the bases `buttonVariants` from ./button.ts
 * directly — the same reuse chain as upstream, no duplicated class
 * strings — plus upstream's own `cn-pagination-link` hook on top.
 * Export names, rendered elements and `data-slot`s are upstream's.
 *
 * Class strings are byte-for-byte the shadcn bases/radix strings:
 * structural utilities stay inline, everything visual (content gap,
 * prev/next padding, ellipsis sizing) moves to the `cn-pagination*`
 * hooks, which the style presets (registry/styles/style-*.css) fill
 * in.
 *
 * Anatomy diffs vs the new-york port, declared:
 *
 * - **Prev/next are hook classes now.** `cn-pagination-previous` /
 *   `cn-pagination-next` replace the inline `gap-1 px-2.5 sm:pl-2.5` /
 *   `sm:pr-2.5` utilities, and the label spans gain
 *   `cn-pagination-previous-text` / `cn-pagination-next-text`.
 * - **Icons carry `data-icon` and `cn-rtl-flip`.** Upstream stamps
 *   data-icon="inline-start" on the previous chevron and
 *   data-icon="inline-end" on the next (the bases button styles key
 *   icon padding off it), and both wear `cn-rtl-flip` so RTL layouts
 *   flip them.
 * - **`text` is an option.** Upstream's PaginationPrevious /
 *   PaginationNext take a `text` prop (default "Previous" / "Next");
 *   the new-york port hardcoded the labels.
 * - **The ellipsis icon loses its `size-4`** — bases renders the
 *   MoreHorizontal glyph unclassed; the `cn-pagination-ellipsis` hook
 *   sizes it.
 *
 * Declared divergences carried over from the new-york port:
 *
 * - **Icons** — lucide-react is banned; ChevronLeft / ChevronRight /
 *   MoreHorizontal are the shared inline SVG builders from
 *   `@/lib/icons` (lucide path data, ISC), re-exported below under
 *   their upstream names. The shared builders also stamp
 *   `aria-hidden="true"` (decorative glyphs). Like upstream,
 *   PaginationPrevious / PaginationNext / PaginationEllipsis always
 *   render their icon + label children (upstream's explicit JSX
 *   children override any passed children there too).
 * - **`data-active` / `aria-current`** — written exactly as upstream
 *   React renders them: `aria-current="page"` only when active,
 *   `data-active` present ("true"/"false") only when `isActive` is
 *   given.
 */
import type * as Html from "@effect/ui/html/Html";
import { type Html as HtmlNs } from "@effect/ui/html";
import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonSize } from "./button.ts";

export const PAGINATION_CLASS = "cn-pagination mx-auto flex w-full justify-center";

export const PAGINATION_CONTENT_CLASS = "cn-pagination-content flex items-center";

export const PAGINATION_LINK_CLASS = "cn-pagination-link";

export const PAGINATION_ELLIPSIS_CLASS = "cn-pagination-ellipsis flex items-center justify-center";

export const PAGINATION_PREVIOUS_CLASS = "cn-pagination-previous";

export const PAGINATION_NEXT_CLASS = "cn-pagination-next";

export const PAGINATION_PREVIOUS_TEXT_CLASS = "cn-pagination-previous-text hidden sm:block";

export const PAGINATION_NEXT_TEXT_CLASS = "cn-pagination-next-text hidden sm:block";

/** Lucide `chevron-left`, inline (upstream's ChevronLeftIcon). */
export const PaginationChevronLeft = <Msg>(h: HtmlNs.H<Msg>) => ChevronLeftIcon(h);

/** Lucide `chevron-right`, inline (upstream's ChevronRightIcon). */
export const PaginationChevronRight = <Msg>(h: HtmlNs.H<Msg>) => ChevronRightIcon(h);

/** Lucide `more-horizontal`, inline (upstream's MoreHorizontalIcon). */
export const PaginationMoreHorizontal = <Msg>(
  h: HtmlNs.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => EllipsisIcon(h, { class: options.class });

type Element<Msg, R, Tag extends keyof HTMLElementTagNameMap> = Html.Element<
  Msg,
  R,
  Html.EventsOf<Tag>,
  HTMLElementTagNameMap[Tag],
  Tag
>;

/**
 * The pagination <nav> (role="navigation", aria-label="pagination").
 * Chain `.children(PaginationContent(h).children(...))` on the result.
 */
export const Pagination = <Msg, R = never>(
  h: { readonly nav: Element<Msg, R, "nav"> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.nav
    .attr("role", "navigation")
    .attr("aria-label", "pagination")
    .attr("data-slot", "pagination")
    .class(cn(PAGINATION_CLASS, options.class));

export const PaginationContent = <Msg, R = never>(
  h: { readonly ul: Element<Msg, R, "ul"> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.ul.attr("data-slot", "pagination-content").class(cn(PAGINATION_CONTENT_CLASS, options.class));

export const PaginationItem = <Msg, R = never>(
  h: { readonly li: Element<Msg, R, "li"> },
  options: { readonly class?: string | undefined } = {},
) => {
  const item = h.li.attr("data-slot", "pagination-item");
  return options.class === undefined ? item : item.class(options.class);
};

export type PaginationLinkOptions = {
  readonly isActive?: boolean | undefined;
  readonly size?: ButtonSize | undefined;
  readonly class?: string | undefined;
};

/**
 * A page link: an <a> wearing the bases `buttonVariants` — "outline"
 * when active, "ghost" otherwise — plus the `cn-pagination-link` hook;
 * `size` defaults to "icon", as upstream. Chain `.attr("href", ...)`
 * and `.children(...)` on the result.
 */
export const PaginationLink = <Msg, R = never>(
  h: { readonly a: Element<Msg, R, "a"> },
  options: PaginationLinkOptions = {},
) => {
  const link = h.a.attr("data-slot", "pagination-link").class(
    cn(
      buttonVariants({
        variant: options.isActive ? "outline" : "ghost",
        size: options.size ?? "icon",
      }),
      PAGINATION_LINK_CLASS,
      options.class,
    ),
  );
  if (options.isActive === undefined) return link;
  const withActive = link.attr("data-active", String(options.isActive));
  return options.isActive ? withActive.attr("aria-current", "page") : withActive;
};

/** Previous-page link: ChevronLeft (data-icon="inline-start") + label, size "default". */
export const PaginationPrevious = <Msg>(
  h: HtmlNs.H<Msg>,
  options: Omit<PaginationLinkOptions, "size"> & {
    readonly class?: string | undefined;
    /** The label text; upstream's `text` prop. Default "Previous". */
    readonly text?: string | undefined;
  } = {},
) =>
  PaginationLink(h, {
    isActive: options.isActive,
    size: "default",
    class: cn(PAGINATION_PREVIOUS_CLASS, options.class),
  })
    .attr("aria-label", "Go to previous page")
    .children(
      ChevronLeftIcon(h, { class: "cn-rtl-flip" }).attr("data-icon", "inline-start"),
      h.span.class(PAGINATION_PREVIOUS_TEXT_CLASS).children(options.text ?? "Previous"),
    );

/** Next-page link: label + ChevronRight (data-icon="inline-end"), size "default". */
export const PaginationNext = <Msg>(
  h: HtmlNs.H<Msg>,
  options: Omit<PaginationLinkOptions, "size"> & {
    readonly class?: string | undefined;
    /** The label text; upstream's `text` prop. Default "Next". */
    readonly text?: string | undefined;
  } = {},
) =>
  PaginationLink(h, {
    isActive: options.isActive,
    size: "default",
    class: cn(PAGINATION_NEXT_CLASS, options.class),
  })
    .attr("aria-label", "Go to next page")
    .children(
      h.span.class(PAGINATION_NEXT_TEXT_CLASS).children(options.text ?? "Next"),
      ChevronRightIcon(h, { class: "cn-rtl-flip" }).attr("data-icon", "inline-end"),
    );

/** The skipped-pages ellipsis: MoreHorizontal icon + sr-only "More pages". */
export const PaginationEllipsis = <Msg>(
  h: HtmlNs.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  h.span
    .attr("aria-hidden", "true")
    .attr("data-slot", "pagination-ellipsis")
    .class(cn(PAGINATION_ELLIPSIS_CLASS, options.class))
    .children(PaginationMoreHorizontal(h), h.span.class("sr-only").children("More pages"));
