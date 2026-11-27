/**
 * ButtonGroup — shadcn/ui `button-group` ported 1:1 to Effect UI.
 *
 * Upstream: React + cva + Radix Slot, a pure composition — a `role="group"`
 * div whose classes stitch its children together, a text segment, and a
 * separator segment built on shadcn's Separator. There is no kit part for
 * it because there is no behaviour to own: state, keyboard and ARIA are
 * the children's (the buttons'), exactly as upstream. So these are pure
 * view functions returning element builders, and the separator is this
 * repo's `Separator` port (registry/ui/separator.ts) — the same reuse
 * upstream makes.
 *
 * `asChild` on ButtonGroupText does not exist (PORTING-RULES D-2): the
 * text segment is a <div>; render a different element by chaining the
 * builder you pass in through your own view code.
 *
 * One D-1 note: upstream's `cn` (tailwind-merge) would drop the base
 * separator's `bg-border` in favour of this segment's `bg-input`. Here
 * both classes are emitted and the later stylesheet rule wins — the
 * declared `cn` divergence, not a silent one.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings.
 */
import type * as Html from "@effect/ui/html/Html";
import type { SeparatorElement } from "@effect/ui-kit";
import { cn } from "@/lib/utils";
import { Separator } from "./separator.ts";

export type ButtonGroupOrientation = "horizontal" | "vertical";

type DivElement<Msg, R = never> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

const BASE =
  "flex w-fit items-stretch has-[>[data-slot=button-group]]:gap-2 [&>*]:focus-visible:relative [&>*]:focus-visible:z-10 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1";

const ORIENTATIONS: Record<ButtonGroupOrientation, string> = {
  horizontal:
    "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
  vertical:
    "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
};

const TEXT_CLASS =
  "flex items-center gap-2 rounded-md border bg-muted px-4 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4";

const SEPARATOR_CLASS = "relative m-0! self-stretch bg-input data-[orientation=vertical]:h-auto";

/** Upstream name kept: `buttonGroupVariants({ orientation })` in shadcn; here a pure function, not cva. */
export const buttonGroupVariants = (
  options: {
    readonly orientation?: ButtonGroupOrientation | undefined;
    readonly class?: string | undefined;
  } = {},
): string => cn(BASE, ORIENTATIONS[options.orientation ?? "horizontal"], options.class);

/**
 * A group that stitches its buttons into one segment. Chain
 * `.children(...)` with this repo's `Button`s (or inputs / select
 * triggers) inside.
 */
export const ButtonGroup = <Msg, R = never>(
  h: { readonly div: DivElement<Msg, R> },
  options: {
    readonly orientation?: ButtonGroupOrientation | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  h.div
    .attr("role", "group")
    .attr("data-slot", "button-group")
    .attr("data-orientation", options.orientation)
    .class(buttonGroupVariants(options));

/** A non-button segment of the group (a label or an amount), styled to match. */
export const ButtonGroupText = <Msg, R = never>(
  h: { readonly div: DivElement<Msg, R> },
  options: {
    readonly class?: string | undefined;
  } = {},
) => h.div.class(cn(TEXT_CLASS, options.class));

/**
 * The group's separator segment: this repo's `Separator` with
 * `data-slot="button-group-separator"`, vertical by default, as upstream.
 */
export const ButtonGroupSeparator = <Msg, R = never>(
  h: { readonly div: SeparatorElement<Msg> },
  options: {
    readonly element?: SeparatorElement<Msg, R> | undefined;
    readonly orientation?: "horizontal" | "vertical" | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  Separator(h, {
    element: options.element,
    orientation: options.orientation ?? "vertical",
    class: cn(SEPARATOR_CLASS, options.class),
  }).attr("data-slot", "button-group-separator");
