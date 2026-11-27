/**
 * Bubble (bases generation) — shadcn/ui `bubble` ported 1:1 to Effect UI.
 *
 * Same Effect port as `registry/ui/bubble.ts` (pure view functions over
 * `h.div` builders, variants as plain Records — no cva); only the class
 * layer changes: class strings are byte-for-byte the shadcn bases/radix
 * strings — structural inline classes plus `cn-*` hook classes whose
 * utilities are supplied by the style presets. The parity checker asserts
 * every token in `parity/bases-tokens.json["bubble"]`.
 *
 * Declared divergence (PORTING-RULES.md D-2): upstream `BubbleContent`
 * accepts `asChild` (Radix Slot). There is no Slot in Effect UI, so
 * `BubbleContent` always renders the <div>; compose by rendering its class
 * string (`BUBBLE_CONTENT_CLASS`) on your own element if you need another
 * tag.
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";

type Div<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

export const BUBBLE_GROUP_CLASS = "cn-bubble-group flex min-w-0 flex-col";

export const BUBBLE_CONTENT_CLASS =
  "cn-bubble-content w-fit max-w-full min-w-0 overflow-hidden wrap-break-word [button]:text-left [button,a]:transition-colors";

// ---------------------------------------------------------------------------
// Bubble
// ---------------------------------------------------------------------------

export type BubbleVariant =
  "default" | "secondary" | "muted" | "tinted" | "outline" | "ghost" | "destructive";

export type BubbleAlign = "start" | "end";

const BUBBLE_BASE = "cn-bubble group/bubble relative flex w-fit min-w-0 flex-col";

const BUBBLE_VARIANTS: Record<BubbleVariant, string> = {
  default: "cn-bubble-variant-default",
  secondary: "cn-bubble-variant-secondary",
  muted: "cn-bubble-variant-muted",
  tinted: "cn-bubble-variant-tinted",
  outline: "cn-bubble-variant-outline",
  ghost: "cn-bubble-variant-ghost",
  destructive: "cn-bubble-variant-destructive",
};

/** Upstream name kept: `bubbleVariants({ variant })` in shadcn; here a pure function, not cva. */
export const bubbleVariants = (
  options: {
    readonly variant?: BubbleVariant | undefined;
    readonly class?: string | undefined;
  } = {},
): string => cn(BUBBLE_BASE, BUBBLE_VARIANTS[options.variant ?? "default"], options.class);

export const Bubble = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: {
    readonly variant?: BubbleVariant | undefined;
    readonly align?: BubbleAlign | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  h.div
    .attr("data-slot", "bubble")
    .attr("data-variant", options.variant ?? "default")
    .attr("data-align", options.align ?? "start")
    .class(bubbleVariants(options));

// ---------------------------------------------------------------------------
// BubbleReactions
// ---------------------------------------------------------------------------

export type BubbleReactionsSide = "top" | "bottom";
export type BubbleReactionsAlign = "start" | "end";

const BUBBLE_REACTIONS_BASE =
  "cn-bubble-reactions absolute z-10 flex w-fit items-center justify-center";

const BUBBLE_REACTIONS_SIDES: Record<BubbleReactionsSide, string> = {
  top: "cn-bubble-reactions-side-top",
  bottom: "cn-bubble-reactions-side-bottom",
};

const BUBBLE_REACTIONS_ALIGNS: Record<BubbleReactionsAlign, string> = {
  start: "cn-bubble-reactions-align-start",
  end: "cn-bubble-reactions-align-end",
};

/** Upstream name kept: `bubbleReactionsVariants({ side, align })` in shadcn; here a pure function, not cva. */
export const bubbleReactionsVariants = (
  options: {
    readonly side?: BubbleReactionsSide | undefined;
    readonly align?: BubbleReactionsAlign | undefined;
    readonly class?: string | undefined;
  } = {},
): string =>
  cn(
    BUBBLE_REACTIONS_BASE,
    BUBBLE_REACTIONS_SIDES[options.side ?? "bottom"],
    BUBBLE_REACTIONS_ALIGNS[options.align ?? "end"],
    options.class,
  );

export const BubbleReactions = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: {
    readonly side?: BubbleReactionsSide | undefined;
    readonly align?: BubbleReactionsAlign | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  h.div
    .attr("data-slot", "bubble-reactions")
    .attr("data-align", options.align ?? "end")
    .attr("data-side", options.side ?? "bottom")
    .class(bubbleReactionsVariants(options));

// ---------------------------------------------------------------------------
// Remaining parts
// ---------------------------------------------------------------------------

export const BubbleGroup = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "bubble-group").class(cn(BUBBLE_GROUP_CLASS, options.class));

export const BubbleContent = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "bubble-content").class(cn(BUBBLE_CONTENT_CLASS, options.class));
