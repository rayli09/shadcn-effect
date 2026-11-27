/**
 * UsageCard — shadcn/ui block `preview` (cards/usage-card.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card titled
 * "5 days remaining in cycle" with an `ItemGroup` of six usage rows
 * from a module-level `items` array (name, percentage, value). Each row
 * is an `Item` with `asChild` around an `<a href="#">`, holding a
 * file-local `CircularGauge` SVG (two circles, the second's
 * stroke-dasharray driven by the percentage), the name, and the value
 * in a mono span. Here: a named view function plus a local
 * `CircularGauge` view helper reproducing the same SVG geometry — the
 * circumference / stroke-percent math is upstream's, verbatim — drawn
 * with `h.el("svg")` / `h.el("circle")` and the same attributes, with
 * the dash arrays carried as `style` attributes exactly as upstream's
 * `style` props did.
 *
 * Declared divergences (anything else is a bug):
 *
 * - D-2 `asChild`: upstream's `Item asChild` renders the `<a href="#">`
 *   as the row element. There is no Slot in Effect UI and the ported
 *   `Item` always renders its div, so the anchor collapses onto the
 *   Item div and the `href="#"` is not rendered (the same collapse the
 *   sidebar ports declare for their asChild pieces).
 * - Upstream's Item `size="xs"` is a bases-generation size; the
 *   in-repo `Item` wrapper's size union predates it, so the size is
 *   stamped as the `cn-item-size-xs` preset hook class plus a
 *   `data-size="xs"` attribute bridge (D-9) — the bases preset styles
 *   it exactly as upstream's variant does (the activate-agent-dialog
 *   pattern).
 */
import type { Html } from "@effect/ui/html";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.ts";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item.ts";
import { cn } from "@/lib/utils";

// Usage items with percentage and value.
const items = [
  {
    name: "Edge Requests",
    value: "$1.83K",
    percentage: 67.34,
  },
  {
    name: "Fast Data Transfer",
    percentage: 52.18,
    value: "$952.51",
  },
  {
    name: "Monitoring data points",
    percentage: 89.42,
    value: "$901.20",
  },
  {
    name: "Web Analytics Events",
    percentage: 45.67,
    value: "$603.71",
  },
  {
    name: "ISR Writes",
    percentage: 26.23,
    value: "524.52K / 2M",
  },
  {
    name: "Function Duration",
    percentage: 5.11,
    value: "5.11 GB Hrs / 1K GB Hrs",
  },
];

// Circular gauge SVG component for displaying a percentage.
const CircularGauge = <Msg>(h: Html.H<Msg>, options: { readonly percentage: number }) => {
  const normalizedPercentage = Math.min(Math.max(options.percentage, 0), 100);
  const circumference = 2 * Math.PI * 42.5;
  const strokePercent = (normalizedPercentage / 100) * circumference;

  return h
    .el("svg")
    .attrs({
      "aria-hidden": "true",
      fill: "none",
      height: "16",
      width: "16",
      "stroke-width": "2",
      viewBox: "0 0 100 100",
      class: "-rotate-90",
    })
    .children(
      h.el("circle").attrs({
        cx: "50",
        cy: "50",
        r: "42.5",
        "stroke-width": "12",
        "stroke-dashoffset": "0",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        class: "opacity-20",
        stroke: "currentColor",
        style: `stroke-dasharray: ${circumference} ${circumference}`,
      }),
      h.el("circle").attrs({
        cx: "50",
        cy: "50",
        r: "42.5",
        "stroke-width": "12",
        "stroke-dashoffset": "0",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        stroke: "currentColor",
        class: "transition-all duration-300",
        style: `stroke-dasharray: ${strokePercent} ${circumference}`,
      }),
    );
};

export const UsageCard = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  Card(h, { class: cn("w-full max-w-sm gap-4", options.class) }).children(
    CardHeader(h).children(
      CardTitle(h, { class: "px-1 text-sm" }).children("5 days remaining in cycle"),
    ),
    CardContent(h).children(
      ItemGroup(h, { class: "gap-0" }).children(
        ...items.map((item) =>
          Item(h, { class: "cn-item-size-xs px-0 group-hover/item-group:bg-transparent" })
            .attr("data-size", "xs")
            .key(item.name)
            .children(
              ItemMedia(h, { variant: "icon", class: "text-primary" }).children(
                CircularGauge(h, { percentage: item.percentage }),
              ),
              ItemContent(h, { class: "inline-block truncate" }).children(
                ItemTitle(h, { class: "inline" }).children(item.name),
              ),
              ItemActions(h).children(
                h.span
                  .class("font-mono text-xs font-medium text-muted-foreground tabular-nums")
                  .children(item.value),
              ),
            ),
        ),
      ),
    ),
  );
