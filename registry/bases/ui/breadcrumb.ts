/**
 * Breadcrumb (bases generation) — shadcn/ui `breadcrumb` ported 1:1 to
 * Effect UI, with the class layer of upstream's bases/radix generation
 * instead of new-york-v4's.
 *
 * Same port as registry/ui/breadcrumb.ts — upstream has no stateful
 * primitive here (Radix Slot only, for BreadcrumbLink's `asChild`), so
 * every part is a pure view function returning an @effect/ui Html
 * builder; none of them is a Component. Export names, rendered
 * elements and `data-slot`s are upstream's.
 *
 * Class strings are byte-for-byte the shadcn bases/radix strings: a
 * few structural utilities stay inline (`flex`, `flex-wrap`,
 * `items-center`, …), everything visual (gaps, type size, colours)
 * moves to the `cn-breadcrumb*` hooks, which the style presets
 * (registry/styles/style-*.css) fill in.
 *
 * Anatomy diffs vs the new-york port, declared:
 *
 * - **The <nav> gains a class.** Bases stamps `cn-breadcrumb` where
 *   new-york's nav carried no class string at all.
 * - **The separator chevron wears `cn-rtl-flip`** (upstream's class for
 *   the default glyph, so RTL layouts flip it) instead of inheriting
 *   the `[&>svg]:size-3.5` sizing from its parent — the separator hook
 *   owns the sizing now.
 * - **The ellipsis icon loses its `size-4`.** Bases renders the
 *   MoreHorizontal glyph unclassed; the `cn-breadcrumb-ellipsis` hook
 *   sizes it.
 *
 * Declared divergences carried over from the new-york port:
 *
 * - **D-2 `asChild`** — BreadcrumbLink always renders an <a>; there is
 *   no Slot. Composition is done by stacking builders, per
 *   PORTING-RULES D-2.
 * - **BreadcrumbSeparator default icon** — upstream renders
 *   `{children ?? <ChevronRight />}`: consumer children *replace* the
 *   chevron. An Html builder's `.children()` *appends*, so this port
 *   returns the <li> with the chevron already applied (the exact
 *   upstream default DOM); chaining `.children(...)` adds after the
 *   chevron instead of replacing it. For a fully custom separator,
 *   apply `BREADCRUMB_SEPARATOR_CLASS` to a plain `h.li` with
 *   `data-slot="breadcrumb-separator"`, `role="presentation"` and
 *   `aria-hidden="true"`.
 * - **Icons** — lucide-react is banned; ChevronRight / MoreHorizontal
 *   are the shared inline SVG builders from `@/lib/icons` (lucide path
 *   data, ISC), re-exported below under their upstream names. The
 *   shared builders also stamp `aria-hidden="true"` (they are
 *   decorative; the separator/ellipsis parents carry `aria-hidden`
 *   too).
 */
import type * as Html from "@effect/ui/html/Html";
import { type Html as HtmlNs } from "@effect/ui/html";
import { ChevronRightIcon, EllipsisIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export const BREADCRUMB_CLASS = "cn-breadcrumb";

export const BREADCRUMB_LIST_CLASS =
  "cn-breadcrumb-list flex flex-wrap items-center wrap-break-word";

export const BREADCRUMB_ITEM_CLASS = "cn-breadcrumb-item inline-flex items-center";

export const BREADCRUMB_LINK_CLASS = "cn-breadcrumb-link";

export const BREADCRUMB_PAGE_CLASS = "cn-breadcrumb-page";

export const BREADCRUMB_SEPARATOR_CLASS = "cn-breadcrumb-separator";

export const BREADCRUMB_ELLIPSIS_CLASS = "cn-breadcrumb-ellipsis flex items-center justify-center";

/** The default BreadcrumbSeparator glyph: lucide `chevron-right`, inline, wearing upstream's `cn-rtl-flip`. */
export const BreadcrumbChevronRight = <Msg>(h: HtmlNs.H<Msg>) =>
  ChevronRightIcon(h, { class: "cn-rtl-flip" });

/** The BreadcrumbEllipsis glyph: lucide `more-horizontal`, inline, unclassed as upstream renders it. */
export const BreadcrumbMoreHorizontal = <Msg>(
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
 * The breadcrumb <nav>. Chain `.children(BreadcrumbList(h).children(...))`
 * on the result.
 */
export const Breadcrumb = <Msg, R = never>(
  h: { readonly nav: Element<Msg, R, "nav"> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.nav
    .attr("aria-label", "breadcrumb")
    .attr("data-slot", "breadcrumb")
    .class(cn(BREADCRUMB_CLASS, options.class));

export const BreadcrumbList = <Msg, R = never>(
  h: { readonly ol: Element<Msg, R, "ol"> },
  options: { readonly class?: string | undefined } = {},
) => h.ol.attr("data-slot", "breadcrumb-list").class(cn(BREADCRUMB_LIST_CLASS, options.class));

export const BreadcrumbItem = <Msg, R = never>(
  h: { readonly li: Element<Msg, R, "li"> },
  options: { readonly class?: string | undefined } = {},
) => h.li.attr("data-slot", "breadcrumb-item").class(cn(BREADCRUMB_ITEM_CLASS, options.class));

/**
 * A breadcrumb link (<a>). Chain `.attr("href", ...)` and `.children(...)`
 * on the result. No `asChild` — see the header (D-2).
 */
export const BreadcrumbLink = <Msg, R = never>(
  h: { readonly a: Element<Msg, R, "a"> },
  options: { readonly class?: string | undefined } = {},
) => h.a.attr("data-slot", "breadcrumb-link").class(cn(BREADCRUMB_LINK_CLASS, options.class));

/** The current page: a <span> with role="link", aria-disabled, aria-current. */
export const BreadcrumbPage = <Msg, R = never>(
  h: { readonly span: Element<Msg, R, "span"> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.span
    .attr("data-slot", "breadcrumb-page")
    .attr("role", "link")
    .attr("aria-disabled", "true")
    .attr("aria-current", "page")
    .class(cn(BREADCRUMB_PAGE_CLASS, options.class));

/**
 * The separator <li>, with the default chevron already applied as its
 * child (upstream's default render). See the header for the
 * append-vs-replace divergence on custom children.
 */
export const BreadcrumbSeparator = <Msg>(
  h: HtmlNs.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  h.li
    .attr("data-slot", "breadcrumb-separator")
    .attr("role", "presentation")
    .attr("aria-hidden", "true")
    .class(cn(BREADCRUMB_SEPARATOR_CLASS, options.class))
    .children(BreadcrumbChevronRight(h));

/** The collapsed-pages ellipsis: MoreHorizontal icon + sr-only "More". */
export const BreadcrumbEllipsis = <Msg>(
  h: HtmlNs.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  h.span
    .attr("data-slot", "breadcrumb-ellipsis")
    .attr("role", "presentation")
    .attr("aria-hidden", "true")
    .class(cn(BREADCRUMB_ELLIPSIS_CLASS, options.class))
    .children(BreadcrumbMoreHorizontal(h), h.span.class("sr-only").children("More"));
