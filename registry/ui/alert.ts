/**
 * Alert — shadcn/ui `alert` ported 1:1 to Effect UI.
 *
 * Upstream: React + cva, no primitive — Alert, AlertTitle and AlertDescription
 * are plain <div>s (Alert with role="alert"). Here: pure view functions
 * returning `h.div` builders — Alert keeps no state, so none of them is a
 * Component. Variants are a plain Record keyed by a string union — no cva.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings; the parity
 * checker (scripts/verify.mjs) fails if any upstream token disappears.
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";

export type AlertVariant = "default" | "destructive";

const BASE =
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current";

const VARIANTS: Record<AlertVariant, string> = {
  default: "bg-card text-card-foreground",
  destructive:
    "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current",
};

/** Upstream name kept: `alertVariants({ variant })` in shadcn; here a pure function, not cva. */
export const alertVariants = (
  options: {
    readonly variant?: AlertVariant | undefined;
    readonly class?: string | undefined;
  } = {},
): string => cn(BASE, VARIANTS[options.variant ?? "default"], options.class);

type Div<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

/**
 * A shadcn-styled alert. Chain `.children(...)` on the result:
 *
 *   Alert(h, { variant: "destructive" }).children(
 *     AlertTitle(h).children("Error"),
 *     AlertDescription(h).children("Your session has expired.")
 *   )
 *
 * An icon is just an `h.svg` child — the base class's `has-[>svg]:` /
 * `[&>svg]:` variants lay it out exactly as upstream.
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
) =>
  h.div
    .attr("data-slot", "alert-title")
    .class(cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", options.class));

export const AlertDescription = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.div
    .attr("data-slot", "alert-description")
    .class(
      cn(
        "col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed",
        options.class,
      ),
    );
