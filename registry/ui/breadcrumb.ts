/**
 * Breadcrumb — shadcn/ui `breadcrumb` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix Slot (only for BreadcrumbLink's `asChild`), no
 * stateful primitive — every part is plain markup. Here: pure view functions
 * returning @effect/ui Html builders; none of them is a Component. Export
 * names, rendered elements, `data-slot`s and class strings are upstream's,
 * byte-for-byte.
 *
 * Declared divergences (nothing else differs):
 *
 * - **D-2 `asChild`** — BreadcrumbLink always renders an <a>; there is no
 *   Slot. Composition is done by stacking builders, per PORTING-RULES D-2.
 * - **BreadcrumbSeparator default icon** — upstream renders
 *   `{children ?? <ChevronRight />}`: consumer children *replace* the
 *   chevron. An Html builder's `.children()` *appends*, so this port returns
 *   the <li> with the chevron already applied (the exact upstream default
 *   DOM); chaining `.children(...)` adds after the chevron instead of
 *   replacing it. For a fully custom separator, apply
 *   `BREADCRUMB_SEPARATOR_CLASS` to a plain `h.li` with
 *   `data-slot="breadcrumb-separator"`, `role="presentation"` and
 *   `aria-hidden="true"`.
 * - **Icons** — lucide-react is banned; ChevronRight / MoreHorizontal are
 *   the shared inline SVG builders from `../lib/icons.ts` (lucide path
 *   data, ISC), re-exported below under their upstream names. The shared
 *   builders also stamp `aria-hidden="true"` (they are decorative; the
 *   separator/ellipsis parents carry `aria-hidden` too).
 */
import type * as Html from "@effect/ui/html/Html";
import { type Html as HtmlNs } from "@effect/ui/html";
import { ChevronRightIcon, EllipsisIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export const BREADCRUMB_LIST_CLASS =
  "flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5";

export const BREADCRUMB_ITEM_CLASS = "inline-flex items-center gap-1.5";

export const BREADCRUMB_LINK_CLASS = "transition-colors hover:text-foreground";

export const BREADCRUMB_PAGE_CLASS = "font-normal text-foreground";

export const BREADCRUMB_SEPARATOR_CLASS = "[&>svg]:size-3.5";

export const BREADCRUMB_ELLIPSIS_CLASS = "flex size-9 items-center justify-center";

/** The default BreadcrumbSeparator glyph: lucide `chevron-right`, inline. */
export const BreadcrumbChevronRight = <Msg>(h: HtmlNs.H<Msg>) => ChevronRightIcon(h);

/** The BreadcrumbEllipsis glyph: lucide `more-horizontal`, inline. */
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
 * The breadcrumb <nav>. Upstream carries no class string; chain
 * `.children(BreadcrumbList(h).children(...))` on the result.
 */
export const Breadcrumb = <Msg, R = never>(
  h: { readonly nav: Element<Msg, R, "nav"> },
  options: { readonly class?: string | undefined } = {},
) => {
  const nav = h.nav.attr("aria-label", "breadcrumb").attr("data-slot", "breadcrumb");
  return options.class === undefined ? nav : nav.class(options.class);
};

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
 * The separator <li>, with the default chevron already applied as its child
 * (upstream's default render). See the header for the append-vs-replace
 * divergence on custom children.
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
    .children(
      BreadcrumbMoreHorizontal(h, { class: "size-4" }),
      h.span.class("sr-only").children("More"),
    );
