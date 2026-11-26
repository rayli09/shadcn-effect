/**
 * Card — shadcn/ui `card` ported 1:1 to Effect UI.
 *
 * Upstream: pure markup — seven React functions, each a styled <div> with a
 * `data-slot`. Here: pure view functions returning `h.div` builders, same
 * names, same `data-slot` attributes, class strings byte-for-byte upstream.
 * Card keeps no state, so none of these are Components; chain `.children(...)`
 * on the returned builder to fill a part, exactly as JSX nesting did upstream.
 *
 * Nothing in upstream card is unreproducible: no primitive, no variants, no
 * icons. Upstream spreads arbitrary div props onto the element; here the
 * caller chains builder methods (`.attr(...)`, `.on(...)`, …) on the returned
 * builder instead — the repo-wide view-function shape (see badge.ts).
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "../lib/utils.ts";

type DivElement<Msg, R = never> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

export const CARD_CLASS =
  "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm";

export const CARD_HEADER_CLASS =
  "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6";

export const CARD_TITLE_CLASS = "leading-none font-semibold";

export const CARD_DESCRIPTION_CLASS = "text-sm text-muted-foreground";

export const CARD_ACTION_CLASS = "col-start-2 row-span-2 row-start-1 self-start justify-self-end";

export const CARD_CONTENT_CLASS = "px-6";

export const CARD_FOOTER_CLASS = "flex items-center px-6 [.border-t]:pt-6";

/** The card shell: a bordered, padded column. Chain `.children(...)` with the parts below. */
export const Card = <Msg, R = never>(
  h: { readonly div: DivElement<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "card").class(cn(CARD_CLASS, options.class));

/** The card's header grid; a `CardAction` child claims its second column. */
export const CardHeader = <Msg, R = never>(
  h: { readonly div: DivElement<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "card-header").class(cn(CARD_HEADER_CLASS, options.class));

/** The card's title line. */
export const CardTitle = <Msg, R = never>(
  h: { readonly div: DivElement<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "card-title").class(cn(CARD_TITLE_CLASS, options.class));

/** Muted supporting text under the title. */
export const CardDescription = <Msg, R = never>(
  h: { readonly div: DivElement<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "card-description").class(cn(CARD_DESCRIPTION_CLASS, options.class));

/** An action (e.g. a button) pinned to the header's top-right cell. */
export const CardAction = <Msg, R = never>(
  h: { readonly div: DivElement<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "card-action").class(cn(CARD_ACTION_CLASS, options.class));

/** The card's main content region. */
export const CardContent = <Msg, R = never>(
  h: { readonly div: DivElement<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "card-content").class(cn(CARD_CONTENT_CLASS, options.class));

/** The card's footer row. */
export const CardFooter = <Msg, R = never>(
  h: { readonly div: DivElement<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "card-footer").class(cn(CARD_FOOTER_CLASS, options.class));
