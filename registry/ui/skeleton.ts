/**
 * Skeleton — shadcn/ui `skeleton` ported 1:1 to Effect UI.
 *
 * Upstream: a plain React <div> with a pulse animation. Here: a pure view
 * function returning an `h.div` builder — Skeleton keeps no state, so it is
 * not a Component. Class string is byte-for-byte upstream.
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "../lib/utils.ts";

export const SKELETON_CLASS = "animate-pulse rounded-md bg-accent";

export const Skeleton = <Msg, R = never>(
  h: {
    readonly div: Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;
  },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "skeleton").class(cn(SKELETON_CLASS, options.class));
