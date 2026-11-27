/**
 * WeeklyFitnessSummary — shadcn/ui block `preview`
 * (cards/weekly-fitness-summary.tsx), bases generation, ported 1:1 to
 * Effect UI.
 *
 * Upstream: a stateless React function rendering a Card with a 7-column
 * grid of per-day cells from the module-level `FITNESS_WEEKLY_LOAD`
 * array; each cell shows the day letter over a muted track whose fill
 * div is sized by an inline `style={{ height: "<load>%" }}`. The footer
 * holds a full-width "View details" Button with no handler. Here: a
 * named view function; the data, copy and class strings are verbatim
 * upstream, and the inline style becomes a `style` attribute carrying
 * the same declaration.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's footer Button has no handler (a placeholder); here it is
 *   drawn without `onPress`, so a press does nothing — the same
 *   placeholder behavior.
 */
import type { Html } from "@effect/ui/html";
import { Button } from "@/components/ui/button.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";

const FITNESS_WEEKLY_LOAD = [
  { day: "M", load: 84 },
  { day: "T", load: 52 },
  { day: "W", load: 73 },
  { day: "T", load: 66 },
  { day: "F", load: 91 },
  { day: "S", load: 48 },
  { day: "S", load: 61 },
];

export const WeeklyFitnessSummary = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  Card(h, { class: options.class }).children(
    CardHeader(h).children(
      CardTitle(h).children("Weekly Fitness Summary"),
      CardDescription(h).children("Calories and workout load by day"),
    ),
    CardContent(h, { class: "flex flex-col gap-4" }).children(
      h.div.class("grid grid-cols-7 gap-1.5").children(
        ...FITNESS_WEEKLY_LOAD.map((day, index) =>
          h.div
            .key(`${day.day}-${index}`)
            .class("rounded-md p-1.5 text-center ring ring-border")
            .children(
              h.div.class("text-sm text-muted-foreground").children(day.day),
              h.div
                .class("relative mt-1 h-16 overflow-hidden rounded-sm bg-muted")
                .children(
                  h.div
                    .class("absolute inset-x-0 bottom-0 rounded-sm bg-chart-3")
                    .attr("style", `height: ${day.load}%`),
                ),
            ),
        ),
      ),
    ),
    CardFooter(h).children(Button(h, { class: "w-full" }).children("View details")),
  );
