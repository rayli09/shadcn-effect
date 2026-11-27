/**
 * Skeleton (bases generation) — shadcn/ui `skeleton` ported 1:1 to
 * Effect UI.
 *
 * Same Effect port as `registry/ui/skeleton.ts` (a pure view function
 * returning an `h.div` builder — Skeleton keeps no state, so it is not a
 * Component); only the class layer changes: the class string is
 * byte-for-byte the shadcn bases/radix string — the `cn-skeleton` hook
 * class (its utilities, including the shape and background the new-york
 * generation carried inline, are supplied by the style presets) plus the
 * inline `animate-pulse`. The parity checker asserts every token in
 * `parity/bases-tokens.json["skeleton"]`.
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";

export const SKELETON_CLASS = "cn-skeleton animate-pulse";

export const Skeleton = <Msg, R = never>(
  h: {
    readonly div: Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;
  },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "skeleton").class(cn(SKELETON_CLASS, options.class));
