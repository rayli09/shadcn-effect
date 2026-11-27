/**
 * RollerShades — shadcn/ui block `preview-02` (cards/roller-shades.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a React function with `useState([50])` for the shade
 * position: a preview box whose inner shade height is `${position}%`,
 * a Slider (max 100) flanked by Open/Close labels, and a single-select
 * outline ToggleGroup whose value is derived from the position
 * (≤10 "open", ≥90 "closed", else "half") and whose picks set the
 * position to 0 / 50 / 100. Here: a Component whose Model holds the
 * position; slider moves and preset picks arrive as Messages, and the
 * preset is derived in the view exactly as upstream derives it.
 *
 * Declared divergences (anything else is a bug):
 *
 * - The ToggleGroup's value is the kit's array form: upstream's single
 *   string preset is `[preset]` here, and deselecting (upstream's `""`,
 *   which upstream ignores) is `[]`, likewise ignored.
 * - The shade's inline `style={{ height }}` is written as a `style`
 *   attribute string with the same value.
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { Slider } from "@/components/ui/slider.ts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.ts";

const PRESETS = [
  { value: "open", label: "Open", position: 0 },
  { value: "half", label: "Half", position: 50 },
  { value: "closed", label: "Closed", position: 100 },
] as const;

export const RollerShadesMessage = UiSchema.TaggedEnum({
  MovedPosition: { value: Schema.Number },
  PickedPreset: { value: Schema.Array(Schema.String) },
});

export const RollerShades = Html.component({
  name: "Preview02RollerShades",
  model: Schema.Struct({ position: Schema.Number }),
  message: RollerShadesMessage,
}).make({
  init: () => ({ position: 50 }),
  update: {
    MovedPosition: ($, { value }) => $.evolve({ position: value }),
    PickedPreset: ($, { value }) => {
      const preset = PRESETS.find((entry) => entry.value === value[0]);
      return preset === undefined ? $.evolve({}) : $.evolve({ position: preset.position });
    },
  },
  view: (h, model) => {
    const preset = model.position <= 10 ? "open" : model.position >= 90 ? "closed" : "half";
    return Card(h).children(
      CardHeader(h).children(
        CardTitle(h).children("Living Room"),
        CardDescription(h).children("Roller Shades"),
      ),
      CardContent(h, { class: "flex flex-col gap-4" }).children(
        h.div
          .class("flex h-32 flex-col overflow-hidden rounded-lg border bg-muted")
          .children(
            h.div
              .class("bg-muted-foreground transition-all duration-300")
              .attrs({ style: `height: ${model.position}%` }),
          ),
        h.div.class("flex items-center gap-3").children(
          h.span
            .class("text-xs font-medium tracking-wider text-muted-foreground uppercase")
            .children("Open"),
          Slider(h, {
            props: { value: [model.position], max: 100 },
            onValueChange: ({ value }) =>
              RollerShadesMessage.MovedPosition({
                value: Array.isArray(value) ? (value[0] ?? 50) : value,
              }),
            class: "flex-1",
          }),
          h.span
            .class("text-xs font-medium tracking-wider text-muted-foreground uppercase")
            .children("Close"),
        ),
      ),
      CardFooter(h).children(
        ToggleGroup(h, {
          props: {
            value: [preset],
            items: PRESETS.map((entry) => ({ value: entry.value })),
          },
          onToggled: (value) => RollerShadesMessage.PickedPreset({ value }),
          variant: "outline",
          spacing: 1,
          class: "w-full",
          view: (group) =>
            group.root(h.div).children(
              PRESETS.map((entry) =>
                ToggleGroupItem(group, {
                  element: h.button,
                  value: entry.value,
                  class: "flex-1",
                }).children(entry.label),
              ),
            ),
        }),
      ),
    );
  },
});
