/**
 * ButtonGroup (bases generation) — shadcn/ui `button-group` ported 1:1
 * to Effect UI, with the class layer of upstream's bases/radix
 * generation instead of new-york-v4's.
 *
 * Same port as registry/ui/button-group.ts — upstream is a pure
 * composition (a `role="group"` div whose classes stitch its children
 * together, a text segment, and a separator segment built on shadcn's
 * Separator), there is no kit part for it because there is no behaviour
 * to own, so these are pure view functions returning element builders.
 * The separator is this generation's `Separator` port
 * (registry/bases/ui/separator.ts) — the same reuse upstream bases
 * makes. Only the classes differ.
 *
 * Class strings are byte-for-byte the shadcn bases/radix strings:
 * structural utilities stay inline, everything visual moves to the
 * `cn-button-group` / `cn-button-group-orientation-*` /
 * `cn-button-group-text` / `cn-button-group-separator` hooks, which the
 * style presets (registry/styles/style-*.css) fill in.
 *
 * Anatomy diffs vs the new-york port, declared:
 *
 * - **The root loses its `has-[…]` stitching helpers** (nested-group
 *   gap, select-trigger rounding) to the `cn-button-group` preset hook;
 *   the focus-stitching utilities switch from the `[&>*]:` form to
 *   upstream bases' `*:focus-visible:` form.
 * - **The text segment loses `gap-2 rounded-md border bg-muted px-4
 *   text-sm font-medium shadow-xs` and the svg sizing rule** to the
 *   `cn-button-group-text` hook.
 * - **The separator segment loses `m-0! bg-input` and its
 *   `data-[orientation=vertical]:h-auto`** to the
 *   `cn-button-group-separator` hook, gaining instead the
 *   `data-horizontal:` / `data-vertical:` sizing utilities. (This also
 *   retires the new-york port's D-1 note about `bg-border` vs
 *   `bg-input`: neither class is emitted in this generation.)
 *
 * `asChild` on ButtonGroupText does not exist (PORTING-RULES D-2): the
 * text segment is a <div>; render a different element by chaining the
 * builder you pass in through your own view code.
 */
import type * as Html from "@effect/ui/html/Html";
import type { SeparatorElement } from "@effect/ui-kit";
import { cn } from "@/lib/utils";
import { Separator } from "./separator.ts";

export type ButtonGroupOrientation = "horizontal" | "vertical";

type DivElement<Msg, R = never> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

const BASE =
  "cn-button-group group/button-group flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1";

const ORIENTATIONS: Record<ButtonGroupOrientation, string> = {
  horizontal:
    "cn-button-group-orientation-horizontal [&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
  vertical:
    "cn-button-group-orientation-vertical flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
};

const TEXT_CLASS = "cn-button-group-text flex items-center [&_svg]:pointer-events-none";

const SEPARATOR_CLASS =
  "cn-button-group-separator relative self-stretch data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto";

/** Upstream name kept: `buttonGroupVariants({ orientation })` in shadcn; here a pure function, not cva. */
export const buttonGroupVariants = (
  options: {
    readonly orientation?: ButtonGroupOrientation | undefined;
    readonly class?: string | undefined;
  } = {},
): string => cn(BASE, ORIENTATIONS[options.orientation ?? "horizontal"], options.class);

/**
 * A group that stitches its buttons into one segment (bases
 * generation). Chain `.children(...)` with this repo's `Button`s (or
 * inputs / select triggers) inside.
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
 * The group's separator segment: this generation's `Separator` with
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
