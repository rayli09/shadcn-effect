/**
 * Alert (bases generation) — shadcn/ui `alert` ported 1:1 to Effect UI.
 *
 * Same Effect port as `registry/ui/alert.ts` (pure view functions over
 * `h.div` builders, variants as a plain Record — no cva); only the class
 * layer changes: class strings are byte-for-byte the shadcn bases/radix
 * strings — structural inline classes plus `cn-*` hook classes whose
 * utilities are supplied by the style presets. The parity checker asserts
 * every token in `parity/bases-tokens.json["alert"]`.
 *
 * Anatomy diff vs the new-york generation: bases adds an `AlertAction`
 * part (`data-slot="alert-action"`, hook `cn-alert-action`) that
 * new-york-v4 does not have; it is ported here as a view function like
 * the other parts. Nothing in bases alert is unported.
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";

export type AlertVariant = "default" | "destructive";

const BASE = "cn-alert group/alert relative w-full";

const VARIANTS: Record<AlertVariant, string> = {
  default: "cn-alert-variant-default",
  destructive: "cn-alert-variant-destructive",
};

/** Upstream name kept: `alertVariants({ variant })` in shadcn; here a pure function, not cva. */
export const alertVariants = (
  options: {
    readonly variant?: AlertVariant | undefined;
    readonly class?: string | undefined;
  } = {},
): string => cn(BASE, VARIANTS[options.variant ?? "default"], options.class);

export const ALERT_TITLE_CLASS =
  "cn-alert-title [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground";

export const ALERT_DESCRIPTION_CLASS =
  "cn-alert-description [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground";

export const ALERT_ACTION_CLASS = "cn-alert-action";

type Div<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

/**
 * A shadcn-styled alert. Chain `.children(...)` on the result:
 *
 *   Alert(h, { variant: "destructive" }).children(
 *     AlertTitle(h).children("Error"),
 *     AlertDescription(h).children("Your session has expired.")
 *   )
 */
export const Alert = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: {
    readonly variant?: AlertVariant | undefined;
    readonly class?: string | undefined;
  } = {},
) => h.div.attr("data-slot", "alert").attr("role", "alert").class(alertVariants(options));

export const AlertTitle = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "alert-title").class(cn(ALERT_TITLE_CLASS, options.class));

export const AlertDescription = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "alert-description").class(cn(ALERT_DESCRIPTION_CLASS, options.class));

/** Bases-only part: the alert's action area, positioned by the preset's `cn-alert-action` rule. */
export const AlertAction = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "alert-action").class(cn(ALERT_ACTION_CLASS, options.class));
