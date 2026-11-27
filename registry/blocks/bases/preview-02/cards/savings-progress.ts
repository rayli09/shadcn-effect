/**
 * SavingsProgress — shadcn/ui block `preview-02`
 * (cards/savings-progress.tsx), bases generation, ported 1:1 to
 * Effect UI.
 *
 * Upstream: a stateless React function rendering a Card with a Recharts
 * donut (PieChart: saved 24000 / remaining 6000, innerRadius 70,
 * outerRadius 95, strokeWidth 0, startAngle 90, endAngle -270) with a
 * centered Label ("$24,000" / "80% of $30,000"), and a footer of three
 * stat rows divided by Separators. Here: a named view function drawing
 * the Effect-native `ChartContainer` from `@/components/ui/chart.ts`
 * with the upstream data and config composed as props (type "pie",
 * series `value`, categoryKey `name`). Recharts is never imported.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Engine-unported Recharts features (chart port D-4): the pie's
 *   inner/outer radius, stroke width, and start/end angles have no
 *   engine props — the engine draws its own donut geometry from the
 *   same data and colors (`var(--color-saved)` / `var(--color-remaining)`
 *   resolve from the config exactly as upstream's `fill` did).
 * - The centered Label text is not drawn: the engine's pie draws no
 *   labels (chart header, divergence 3). The "$24,000" / "80% of
 *   $30,000" center text is the one piece of upstream copy not rendered.
 * - Upstream's tooltip (`ChartTooltipContent hideLabel`) maps to the
 *   container's built-in tooltip; `hideLabel` has no container prop, so
 *   the tooltip shows the slice label.
 * - The only prop is `class`, appended to the Card root's classes.
 */
import type { Html } from "@effect/ui/html";
import { Card, CardContent, CardFooter } from "@/components/ui/card.ts";
import { ChartContainer } from "@/components/ui/chart.ts";
import { Separator } from "@/components/ui/separator.ts";
import { cn } from "@/lib/utils";

const ROWS = [
  { label: "Projected Finish", value: "October 2024", valueClass: "text-sm font-semibold" },
  { label: "Monthly Average", value: "$1,250", valueClass: "text-sm font-semibold tabular-nums" },
  { label: "Top Contributor", value: "Auto-Transfer", valueClass: "text-sm font-semibold" },
] as const;

export const SavingsProgress = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  Card(h, { class: cn(options.class) }).children(
    CardContent(h).children(
      ChartContainer(h, {
        props: {
          id: "savings-progress",
          config: {
            saved: { label: "Saved", color: "var(--chart-2)" },
            remaining: { label: "Remaining", color: "var(--chart-1)" },
          },
          data: [
            { name: "saved", value: 24000 },
            { name: "remaining", value: 6000 },
          ],
          series: [{ dataKey: "value", kind: "pie" }],
          type: "pie",
          categoryKey: "name",
          class: "mx-auto aspect-square max-h-[220px]",
        },
      }),
    ),
    CardFooter(h, { class: "flex-col gap-0" }).children(
      ROWS.flatMap((row, index) => [
        ...(index > 0 ? [Separator(h)] : []),
        h.div
          .class("flex w-full items-center justify-between py-3")
          .children(
            h.span.class("text-sm text-muted-foreground").children(row.label),
            h.span.class(row.valueClass).children(row.value),
          ),
      ]),
    ),
  );
