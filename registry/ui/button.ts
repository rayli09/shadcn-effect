/**
 * Button — shadcn/ui `button` ported 1:1 to Effect UI.
 *
 * Upstream: React + cva + Radix Slot. Here: the @effect/ui-kit `Button` view
 * function (native <button>, focusable-when-disabled, onPress sends a Message
 * to the owning Component's update). Variants are a plain Record keyed by a
 * string union — no cva, no React, no Slot: `asChild` has no meaning in
 * Effect UI, composition is done by passing `element` to stack a kit part
 * (e.g. a Tooltip trigger) on the same <button> builder.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings; the parity
 * checker (scripts/verify.mjs) fails if any upstream token disappears.
 */
import { Button as KitButton, type ButtonElement, type ButtonProps } from "@effect/ui-kit";
import { cn } from "../lib/utils.ts";

export type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

export type ButtonSize =
  "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

const VARIANTS: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive:
    "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
  outline:
    "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
  link: "text-primary underline-offset-4 hover:underline",
};

const SIZES: Record<ButtonSize, string> = {
  default: "h-9 px-4 py-2 has-[>svg]:px-3",
  xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
  sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
  lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
  icon: "size-9",
  "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
  "icon-sm": "size-8",
  "icon-lg": "size-10",
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
 * A shadcn-styled button. Chain `.children(...)` on the result, exactly like
 * the kit Button in the Effect UI launch article:
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
