/**
 * Bubble — shadcn/ui `bubble` ported 1:1 to Effect UI.
 *
 * Upstream: React + cva + Radix Slot over plain <div>s. Here: pure view
 * functions returning `h.div` builders — Bubble keeps no state, so none of
 * them is a Component. Variants are plain Records keyed by string unions —
 * no cva. The variant styling targets the content child through
 * `*:data-[slot=bubble-content]:…` selectors, exactly as upstream.
 *
 * Declared divergence (PORTING-RULES.md D-2): upstream `BubbleContent`
 * accepts `asChild` (Radix Slot). There is no Slot in Effect UI, so
 * `BubbleContent` always renders the <div>; compose by rendering its class
 * string (`BUBBLE_CONTENT_CLASS`) on your own element if you need another
 * tag.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings; the parity
 * checker (scripts/verify.mjs) fails if any upstream token disappears.
 */
import type * as Html from "@effect/ui/html/Html"
import { cn } from "../lib/utils.ts"

type Div<Msg, R> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"div">,
  HTMLDivElement,
  "div"
>

export const BUBBLE_GROUP_CLASS = "flex min-w-0 flex-col gap-2"

export const BUBBLE_CONTENT_CLASS =
  "w-fit max-w-full min-w-0 overflow-hidden rounded-xl border border-transparent px-3 py-2 text-sm leading-relaxed wrap-break-word group-data-[align=end]/bubble:self-end [button]:text-left [button,a]:transition-colors [button,a]:outline-none [button,a]:focus-visible:border-ring [button,a]:focus-visible:ring-3 [button,a]:focus-visible:ring-ring/50"

// ---------------------------------------------------------------------------
// Bubble
// ---------------------------------------------------------------------------

export type BubbleVariant =
  | "default"
  | "secondary"
  | "muted"
  | "tinted"
  | "outline"
  | "ghost"
  | "destructive"

export type BubbleAlign = "start" | "end"

const BUBBLE_BASE =
  "group/bubble relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[variant=ghost]:max-w-full"

const BUBBLE_VARIANTS: Record<BubbleVariant, string> = {
  default:
    "*:data-[slot=bubble-content]:bg-primary *:data-[slot=bubble-content]:text-primary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-primary/80",
  secondary:
    "*:data-[slot=bubble-content]:bg-secondary *:data-[slot=bubble-content]:text-secondary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
  muted:
    "*:data-[slot=bubble-content]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_5%)]",
  tinted:
    "*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.93_calc(c*0.4)_h)] *:data-[slot=bubble-content]:text-foreground dark:*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.3_calc(c*0.4)_h)] [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.88_calc(c*0.5)_h)] dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.35_calc(c*0.5)_h)]",
  outline:
    "*:data-[slot=bubble-content]:border-border *:data-[slot=bubble-content]:bg-background [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-input/30",
  ghost:
    "border-none *:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted/50",
  destructive:
    "*:data-[slot=bubble-content]:bg-destructive/10 *:data-[slot=bubble-content]:text-destructive dark:*:data-[slot=bubble-content]:bg-destructive/20 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/20 dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/30"
}

/** Upstream name kept: `bubbleVariants({ variant })` in shadcn; here a pure function, not cva. */
export const bubbleVariants = (options: {
  readonly variant?: BubbleVariant | undefined
  readonly class?: string | undefined
} = {}): string =>
  cn(
    BUBBLE_BASE,
    BUBBLE_VARIANTS[options.variant ?? "default"],
    options.class
  )

export const Bubble = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: {
    readonly variant?: BubbleVariant | undefined
    readonly align?: BubbleAlign | undefined
    readonly class?: string | undefined
  } = {}
) =>
  h.div
    .attr("data-slot", "bubble")
    .attr("data-variant", options.variant ?? "default")
    .attr("data-align", options.align ?? "start")
    .class(bubbleVariants(options))

// ---------------------------------------------------------------------------
// BubbleReactions
// ---------------------------------------------------------------------------

export type BubbleReactionsSide = "top" | "bottom"
export type BubbleReactionsAlign = "start" | "end"

const BUBBLE_REACTIONS_BASE =
  "absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-sm ring-3 ring-card has-[button]:p-0"

const BUBBLE_REACTIONS_SIDES: Record<BubbleReactionsSide, string> = {
  top: "top-0 -translate-y-3/4",
  bottom: "bottom-0 translate-y-3/4"
}

const BUBBLE_REACTIONS_ALIGNS: Record<BubbleReactionsAlign, string> = {
  start: "left-3",
  end: "right-3"
}

/** Upstream name kept: `bubbleReactionsVariants({ side, align })` in shadcn; here a pure function, not cva. */
export const bubbleReactionsVariants = (options: {
  readonly side?: BubbleReactionsSide | undefined
  readonly align?: BubbleReactionsAlign | undefined
  readonly class?: string | undefined
} = {}): string =>
  cn(
    BUBBLE_REACTIONS_BASE,
    BUBBLE_REACTIONS_SIDES[options.side ?? "bottom"],
    BUBBLE_REACTIONS_ALIGNS[options.align ?? "end"],
    options.class
  )

export const BubbleReactions = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: {
    readonly side?: BubbleReactionsSide | undefined
    readonly align?: BubbleReactionsAlign | undefined
    readonly class?: string | undefined
  } = {}
) =>
  h.div
    .attr("data-slot", "bubble-reactions")
    .attr("data-align", options.align ?? "end")
    .attr("data-side", options.side ?? "bottom")
    .class(bubbleReactionsVariants(options))

// ---------------------------------------------------------------------------
// Remaining parts
// ---------------------------------------------------------------------------

export const BubbleGroup = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {}
) =>
  h.div
    .attr("data-slot", "bubble-group")
    .class(cn(BUBBLE_GROUP_CLASS, options.class))

export const BubbleContent = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {}
) =>
  h.div
    .attr("data-slot", "bubble-content")
    .class(cn(BUBBLE_CONTENT_CLASS, options.class))
