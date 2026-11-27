/**
 * Button (bases generation) — shadcn/ui `button` ported 1:1 to Effect UI.
 *
 * Same Effect port as `registry/ui/button.ts` (the @effect/ui-kit `Button`
 * view function, variants as a plain Record keyed by a string union — no
 * cva, no React, no Slot); only the class layer changes: class strings are
 * byte-for-byte the shadcn bases/radix strings — a structural inline base
 * plus `cn-*` hook classes (`cn-button`, `cn-button-variant-*`,
 * `cn-button-size-*`) whose utilities are supplied by the style presets.
 * The parity checker asserts every token in
 * `parity/bases-tokens.json["button"]`.
 *
 * `asChild` has no meaning in Effect UI (D-2): composition is done by
 * passing `element` to stack a kit part on the same <button> builder.
 */
import { Button as KitButton, type ButtonElement, type ButtonProps } from "@effect/ui-kit";
import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

export type ButtonSize =
  "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";

const BASE =
  "cn-button group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

const VARIANTS: Record<ButtonVariant, string> = {
  default: "cn-button-variant-default",
  destructive: "cn-button-variant-destructive",
  outline: "cn-button-variant-outline",
  secondary: "cn-button-variant-secondary",
  ghost: "cn-button-variant-ghost",
  link: "cn-button-variant-link",
};

const SIZES: Record<ButtonSize, string> = {
  default: "cn-button-size-default",
  xs: "cn-button-size-xs",
  sm: "cn-button-size-sm",
  lg: "cn-button-size-lg",
  icon: "cn-button-size-icon",
  "icon-xs": "cn-button-size-icon-xs",
  "icon-sm": "cn-button-size-icon-sm",
  "icon-lg": "cn-button-size-icon-lg",
};

/** Upstream name kept: `buttonVariants({ variant, size })` in shadcn; here a pure function, not cva. */
export const buttonVariants = (
  options: {
    readonly variant?: ButtonVariant | undefined;
    readonly size?: ButtonSize | undefined;
    readonly class?: string | undefined;
  } = {},
): string =>
  cn(BASE, VARIANTS[options.variant ?? "default"], SIZES[options.size ?? "default"], options.class);

/**
 * A shadcn-styled button (bases generation). Chain `.children(...)` on the
 * result, exactly like the kit Button in the Effect UI launch article:
 *
 *   Button(h, { onPress: Msg.ClickedSave(), variant: "destructive" }).children("Delete")
 */
export const Button = <Msg, R = never>(
  h: { readonly button: ButtonElement<Msg> },
  options: {
    readonly element?: ButtonElement<Msg, R> | undefined;
    readonly props?: ButtonProps | undefined;
    readonly onPress?: Msg | undefined;
    readonly variant?: ButtonVariant | undefined;
    readonly size?: ButtonSize | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  KitButton(h, {
    element: options.element,
    props: options.props,
    onPress: options.onPress,
  })
    .attr("data-slot", "button")
    .attr("data-variant", options.variant ?? "default")
    .attr("data-size", options.size ?? "default")
    .class(
      buttonVariants({
        variant: options.variant,
        size: options.size,
        class: options.class,
      }),
    );
