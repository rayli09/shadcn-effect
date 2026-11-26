/**
 * Badge — shadcn/ui `badge` ported 1:1 to Effect UI.
 *
 * Upstream: React + cva + Radix Slot rendering a <span>. Here: a pure view
 * function returning an `h.span` builder — Badge keeps no state, so it is not
 * a Component. `asChild` does not exist; to make a badge a link, render
 * `h.a` via BadgeLink below — the upstream `[a&]:` hover variants are kept in
 * the class strings verbatim so anchors style identically.
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "../lib/utils.ts";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";

const BASE =
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3";

const VARIANTS: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
  destructive:
    "bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
  outline: "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
  ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
  link: "text-primary underline-offset-4 [a&]:hover:underline",
};

/** Upstream name kept: `badgeVariants({ variant })` in shadcn; here a pure function, not cva. */
export const badgeVariants = (
  options: {
    readonly variant?: BadgeVariant | undefined;
    readonly class?: string | undefined;
  } = {},
): string => cn(BASE, VARIANTS[options.variant ?? "default"], options.class);

export const Badge = <Msg, R = never>(
  h: { readonly span: Html.Element<Msg, R, Html.EventsOf<"span">, HTMLSpanElement, "span"> },
  options: {
    readonly variant?: BadgeVariant | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  h.span
    .attr("data-slot", "badge")
    .attr("data-variant", options.variant ?? "default")
    .class(badgeVariants(options));
