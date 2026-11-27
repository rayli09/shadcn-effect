/**
 * Badge (bases generation) — shadcn/ui `badge` ported 1:1 to Effect UI.
 *
 * Same Effect port as `registry/ui/badge.ts` (a pure view function returning
 * an `h.span` builder — Badge keeps no state, so it is not a Component;
 * variants as a plain Record, no cva); only the class layer changes: class
 * strings are byte-for-byte the shadcn bases/radix strings — a structural
 * inline base plus `cn-*` hook classes (`cn-badge`, `cn-badge-variant-*`)
 * whose utilities are supplied by the style presets. The parity checker
 * asserts every token in `parity/bases-tokens.json["badge"]`.
 *
 * `asChild` does not exist (D-2); the upstream `[a&]:` hover variants of the
 * new-york generation are gone here — in the bases generation anchor
 * styling lives in the presets' `cn-badge-variant-*` rules.
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";

const BASE =
  "cn-badge group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none";

const VARIANTS: Record<BadgeVariant, string> = {
  default: "cn-badge-variant-default",
  secondary: "cn-badge-variant-secondary",
  destructive: "cn-badge-variant-destructive",
  outline: "cn-badge-variant-outline",
  ghost: "cn-badge-variant-ghost",
  link: "cn-badge-variant-link",
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
