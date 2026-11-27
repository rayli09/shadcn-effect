/**
 * Card (bases generation) — shadcn/ui `card` ported 1:1 to Effect UI,
 * with the class layer of upstream's bases/radix generation instead of
 * new-york-v4's.
 *
 * Same port as registry/ui/card.ts — pure markup upstream, so pure
 * view functions returning `h.div` builders here, same names, same
 * `data-slot` attributes. Card keeps no state, so none of these are
 * Components; chain `.children(...)` on the returned builder to fill a
 * part, exactly as JSX nesting did upstream.
 *
 * Class strings are byte-for-byte the shadcn bases/radix strings:
 * structural utilities stay inline, everything visual (radius,
 * border, padding, gaps, title typography) moves to the `cn-card*`
 * hooks, which the style presets (registry/styles/style-*.css) fill
 * in.
 *
 * Anatomy diffs vs the new-york port, declared:
 *
 * - **`size` is new.** The bases Card takes `size: "default" | "sm"`
 *   (default "default") and stamps it as `data-size` on the shell;
 *   the preset hooks size the card's padding and gaps off it.
 *   New-york's Card had no size.
 * - **The title wears `cn-font-heading`** alongside `cn-card-title` —
 *   the presets' shared heading-font hook.
 *
 * Upstream spreads arbitrary div props onto the element; here the
 * caller chains builder methods (`.attr(...)`, `.on(...)`, …) on the
 * returned builder instead — the repo-wide view-function shape (see
 * badge.ts).
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";

type DivElement<Msg, R = never> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

/** Upstream's Card sizes; the shell stamps the picked one as `data-size`. */
export type CardSize = "default" | "sm";

export const CARD_CLASS = "cn-card group/card flex flex-col";

export const CARD_HEADER_CLASS =
  "cn-card-header group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]";

export const CARD_TITLE_CLASS = "cn-card-title cn-font-heading";

export const CARD_DESCRIPTION_CLASS = "cn-card-description";

export const CARD_ACTION_CLASS =
  "cn-card-action col-start-2 row-span-2 row-start-1 self-start justify-self-end";

export const CARD_CONTENT_CLASS = "cn-card-content";

export const CARD_FOOTER_CLASS = "cn-card-footer flex items-center";

/**
 * The card shell. `size` (default "default") is stamped as `data-size`,
 * as upstream. Chain `.children(...)` with the parts below.
 */
export const Card = <Msg, R = never>(
  h: { readonly div: DivElement<Msg, R> },
  options: { readonly size?: CardSize | undefined; readonly class?: string | undefined } = {},
) =>
  h.div
    .attr("data-slot", "card")
    .attr("data-size", options.size ?? "default")
    .class(cn(CARD_CLASS, options.class));

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
