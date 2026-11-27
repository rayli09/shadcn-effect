/**
 * Toggle (bases generation) — shadcn/ui `toggle` ported 1:1 to Effect
 * UI, with the class layer of upstream's bases/radix generation instead
 * of new-york-v4's.
 *
 * Same port as registry/ui/toggle.ts — the @effect/ui-kit `Toggle` view
 * function (native <button>, consumer owns `pressed`, `onToggle`
 * reports the value the user asked for). Variants are a plain Record
 * keyed by string unions — no cva, no React, no Radix. Only the classes
 * differ.
 *
 * Class strings are byte-for-byte the shadcn bases/radix strings: a
 * short structural base stays inline (`cn-toggle` hook, layout, the
 * `hover:bg-muted` wash, the focus ring), and every variant/size visual
 * moves to the `cn-toggle-variant-*` / `cn-toggle-size-*` hooks, which
 * the style presets (registry/styles/style-*.css) fill in.
 *
 * Anatomy diff vs the new-york port, declared: the base loses its
 * inline `gap-2 rounded-md text-sm font-medium transition-…` and
 * `aria-invalid:` / `data-[state=on]:` colour utilities, and the
 * variant/size Records hold single hook classes instead of utility
 * strings — the preset owns all of it now.
 *
 * Upstream reuse chain, kept: `toggle-group` builds on this file's
 * `toggleVariants` (upstream bases toggle-group imports toggleVariants
 * from toggle), and ToggleGroupItem resolves them through the group.
 *
 * Data-attribute bridging is kept exactly as the new-york port does it:
 * Radix writes `data-state="on" | "off"`, the kit writes `data-pressed`
 * instead, so this wrapper also writes `data-state` from the `pressed`
 * prop. The kit does not write `data-state`, so the chained attribute
 * survives its `forward` writes.
 */
import { Toggle as KitToggle, type ToggleElement, type ToggleProps } from "@effect/ui-kit";
import { cn } from "@/lib/utils";

export type ToggleVariant = "default" | "outline";

export type ToggleSize = "default" | "sm" | "lg";

const BASE =
  "cn-toggle group/toggle inline-flex items-center justify-center whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

const VARIANTS: Record<ToggleVariant, string> = {
  default: "cn-toggle-variant-default",
  outline: "cn-toggle-variant-outline",
};

const SIZES: Record<ToggleSize, string> = {
  default: "cn-toggle-size-default",
  sm: "cn-toggle-size-sm",
  lg: "cn-toggle-size-lg",
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
 * A shadcn-styled toggle (bases generation). Chain `.children(...)` on
 * the result:
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
