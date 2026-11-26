/**
 * AspectRatio — shadcn/ui `aspect-ratio` ported 1:1 to Effect UI.
 *
 * Upstream: a pass-through to the Radix AspectRatio root, which carries no
 * class string of its own (the only upstream token is `data-slot`).
 *
 * Declared divergence: Radix renders a wrapper <div> (position:relative,
 * padding-bottom: 100/ratio %) around an absolutely-positioned inner <div>.
 * This port renders a single <div data-slot="aspect-ratio"> with the modern
 * CSS `aspect-ratio` property as an inline style — same visual result, one
 * less wrapper element, no Radix. Chain `.children(...)` on the result:
 *
 *   AspectRatio(h, { ratio: 16 / 9 }).children(...)
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "../lib/utils.ts";

export const AspectRatio = <Msg, R = never>(
  h: {
    readonly div: Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;
  },
  options: {
    /** Width / height, as upstream's `ratio` prop. Defaults to 1 (square). */
    readonly ratio?: number | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  h.div
    .attr("data-slot", "aspect-ratio")
    .attr("style", `aspect-ratio: ${options.ratio ?? 1}`)
    .class(cn(options.class));
