/**
 * Toggle — shadcn/ui `toggle` ported 1:1 to Effect UI.
 *
 * Upstream: React + cva + Radix Toggle.Root. Here: the @effect/ui-kit
 * `Toggle` view function (native <button>, consumer owns `pressed`,
 * `onToggle` reports the value the user asked for). Variants are a plain
 * Record keyed by string unions — no cva, no React, no Radix.
 *
 * Upstream reuse chain, kept: `toggle-group` builds on this file's
 * `toggleVariants` (upstream toggle-group imports toggleVariants from
 * toggle), and ToggleGroupItem resolves them through the group.
 *
 * One adaptation the kit forces, honestly: Radix writes
 * `data-state="on" | "off"` and the upstream classes key off
 * `data-[state=on]:…`. The kit writes `data-pressed` instead, so this
 * wrapper also writes `data-state` from the `pressed` prop — without it
 * the upstream class strings would never match. The kit does not write
 * `data-state`, so the chained attribute survives its `forward` writes.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings.
 */
import { Toggle as KitToggle, type ToggleElement, type ToggleProps } from "@effect/ui-kit";
import { cn } from "../lib/utils.ts";

export type ToggleVariant = "default" | "outline";

export type ToggleSize = "default" | "sm" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none hover:bg-muted hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

const VARIANTS: Record<ToggleVariant, string> = {
  default: "bg-transparent",
  outline:
    "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
};

const SIZES: Record<ToggleSize, string> = {
  default: "h-9 min-w-9 px-2",
  sm: "h-8 min-w-8 px-1.5",
  lg: "h-10 min-w-10 px-2.5",
};

/** Upstream name kept: `toggleVariants({ variant, size })` in shadcn; here a pure function, not cva. */
export const toggleVariants = (
  options: {
    readonly variant?: ToggleVariant | undefined;
    readonly size?: ToggleSize | undefined;
    readonly class?: string | undefined;
  } = {},
): string =>
  cn(BASE, VARIANTS[options.variant ?? "default"], SIZES[options.size ?? "default"], options.class);

/**
 * A shadcn-styled toggle. Chain `.children(...)` on the result:
 *
 *   Toggle(h, {
 *     props: { pressed: model.bold },
 *     onToggle: ({ pressed }) => EditorMessage.ToggledBold({ pressed }),
 *     variant: "outline"
 *   }).children("B")
 */
export const Toggle = <Msg, R = never>(
  h: { readonly button: ToggleElement<Msg> },
  options: {
    readonly element?: ToggleElement<Msg, R> | undefined;
    readonly props: ToggleProps;
    readonly onToggle?:
      ((event: { readonly pressed: boolean }) => NoInfer<Msg> | undefined) | undefined;
    readonly variant?: ToggleVariant | undefined;
    readonly size?: ToggleSize | undefined;
    readonly class?: string | undefined;
  },
) =>
  KitToggle(h, {
    element: options.element,
    props: options.props,
    onToggle: options.onToggle,
  })
    .attr("data-slot", "toggle")
    .attr("data-state", options.props.pressed ? "on" : "off")
    .class(
      toggleVariants({
        variant: options.variant,
        size: options.size,
        class: options.class,
      }),
    );
