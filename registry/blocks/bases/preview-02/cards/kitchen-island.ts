/**
 * KitchenIsland — shadcn/ui block `preview-02`
 * (cards/kitchen-island.tsx), bases generation, ported 1:1 to Effect
 * UI.
 *
 * Upstream: a "use client" React function rendering a Card for a
 * smart-light fixture — a power Switch in the header action, a
 * single-select ToggleGroup of scene presets (picking one loads the
 * preset's slider values from the SCENES table below, verbatim), and
 * four outline Items each pairing an icon + label with a Slider
 * (brightness, color temp, volume, fade), every control disabled while
 * the Switch is off. Here it is a Component: the switch, scene and
 * slider values live in the Model, scene picks arrive as one Message
 * whose update applies the preset exactly as upstream's
 * `handleSceneChange` did (an empty pick is ignored).
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream spreads no extra props; the only prop here is `class`,
 *   appended to the Card's classes.
 * - Upstream models each slider value as a one-element array
 *   (`useState([90])`); here each is a plain number in the Model — the
 *   kit Slider accepts a single number for a single thumb and renders
 *   identically.
 * - Upstream's `IconPlaceholder` is a create-app component that swaps
 *   icon libraries; only its lucide rendering is ported — the `Sun`,
 *   `Thermometer`, `Volume2` and `Timer` glyphs, as the file-local
 *   builders below (lucide path data, ISC, via the shared `icon()`
 *   helper). The tabler / hugeicons / phosphor / remixicon alternatives
 *   are not ported.
 * - The ToggleGroup's items are also declared in its `items` prop
 *   (the kit's data-driven shape), with each item's `disabled` derived
 *   from the same Model flag that disables the sliders; upstream
 *   repeats `disabled={!enabled}` on each ToggleGroupItem.
 */
import { UiSchema } from "@effect/ui";
import type * as View from "@effect/ui/View";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item.ts";
import { Slider } from "@/components/ui/slider.ts";
import { Switch } from "@/components/ui/switch.ts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.ts";
import { icon, type IconOptions } from "@/lib/icons";

/** Lucide `sun` (ISC). */
const SunIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "12", cy: "12", r: "4" }],
      ["path", { d: "M12 2v2" }],
      ["path", { d: "M12 20v2" }],
      ["path", { d: "m4.93 4.93 1.41 1.41" }],
      ["path", { d: "m17.66 17.66 1.41 1.41" }],
      ["path", { d: "M2 12h2" }],
      ["path", { d: "M20 12h2" }],
      ["path", { d: "m6.34 17.66-1.41 1.41" }],
      ["path", { d: "m19.07 4.93-1.41 1.41" }],
    ],
    options,
  );

/** Lucide `thermometer` (ISC). */
const ThermometerIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(h, [["path", { d: "M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" }]], options);

/** Lucide `volume-2` (ISC). */
const Volume2Icon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
        },
      ],
      ["path", { d: "M16 9a5 5 0 0 1 0 6" }],
      ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728" }],
    ],
    options,
  );

/** Lucide `timer` (ISC). */
const TimerIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["line", { x1: "10", x2: "14", y1: "2", y2: "2" }],
      ["line", { x1: "12", x2: "15", y1: "14", y2: "11" }],
      ["circle", { cx: "12", cy: "14", r: "8" }],
    ],
    options,
  );

const SCENES = {
  cooking: { brightness: 90, colorTemp: 70, volume: 30, fade: 0 },
  dining: { brightness: 50, colorTemp: 40, volume: 20, fade: 60 },
  nightlight: { brightness: 15, colorTemp: 20, volume: 0, fade: 80 },
  focus: { brightness: 100, colorTemp: 85, volume: 0, fade: 0 },
} as const;

type SceneName = keyof typeof SCENES;

const isSceneName = (value: string): value is SceneName =>
  Object.prototype.hasOwnProperty.call(SCENES, value);

export const KitchenIslandMessage = UiSchema.TaggedEnum({
  ToggledEnabled: { checked: Schema.Boolean },
  SelectedScene: { value: Schema.Array(Schema.String) },
  MovedBrightness: { value: Schema.Number },
  MovedColorTemp: { value: Schema.Number },
  MovedVolume: { value: Schema.Number },
  MovedFade: { value: Schema.Number },
});

export const KitchenIsland = Html.component({
  name: "Preview02KitchenIsland",
  props: Schema.Struct({ class: Schema.optional(Schema.String) }),
  model: Schema.Struct({
    enabled: Schema.Boolean,
    scene: Schema.String,
    brightness: Schema.Number,
    colorTemp: Schema.Number,
    volume: Schema.Number,
    fade: Schema.Number,
  }),
  message: KitchenIslandMessage,
}).make({
  init: () => ({
    enabled: true,
    scene: "cooking",
    brightness: 90,
    colorTemp: 70,
    volume: 30,
    fade: 0,
  }),
  update: {
    ToggledEnabled: ($, { checked }) => $.evolve({ enabled: checked }),
    SelectedScene: ($, { value }) => {
      const scene = value[0];
      if (scene === undefined || !isSceneName(scene)) {
        return $.evolve({});
      }
      const preset = SCENES[scene];
      return $.evolve({
        scene,
        brightness: preset.brightness,
        colorTemp: preset.colorTemp,
        volume: preset.volume,
        fade: preset.fade,
      });
    },
    MovedBrightness: ($, { value }) => $.evolve({ brightness: value }),
    MovedColorTemp: ($, { value }) => $.evolve({ colorTemp: value }),
    MovedVolume: ($, { value }) => $.evolve({ volume: value }),
    MovedFade: ($, { value }) => $.evolve({ fade: value }),
  },
  view: (h, model) => {
    const sliderRow = (
      glyph: View.Content<typeof KitchenIslandMessage.Type, never>,
      label: string,
      value: number,
      moved: (value: number) => typeof KitchenIslandMessage.Type,
      sliderClass?: string,
    ) =>
      Item(h, { size: "sm", variant: "outline" }).children(
        ItemMedia(h, { variant: "icon" }).children(glyph),
        ItemContent(h, { class: "flex-row items-center gap-3" }).children(
          ItemTitle(h, { class: "shrink-0" }).children(label),
        ),
        ItemActions(h, { class: "flex-1" }).children(
          Slider(h, {
            props: { value, max: 100, disabled: !model.enabled },
            onValueChange: ({ value: next }) => moved(next as number),
            class: sliderClass,
          }),
        ),
      );
    return Card(h, { class: h.props.class }).children(
      CardHeader(h).children(
        CardTitle(h).children("Kitchen Island"),
        CardDescription(h).children("Hue Color Ambient"),
        CardAction(h).children(
          Switch(h, {
            props: { checked: model.enabled },
            onToggle: ({ checked }) => KitchenIslandMessage.ToggledEnabled({ checked }),
          }),
        ),
      ),
      CardContent(h, { class: "flex flex-col gap-4" }).children(
        h.div.class("flex flex-col gap-2").children(
          h.span.class("sr-only").children("Scenes"),
          ToggleGroup(h, {
            props: {
              value: [model.scene],
              items: [
                { value: "cooking", disabled: !model.enabled },
                { value: "dining", disabled: !model.enabled },
                { value: "nightlight", disabled: !model.enabled },
                { value: "focus", disabled: !model.enabled },
              ],
            },
            onToggled: (value) => KitchenIslandMessage.SelectedScene({ value }),
            variant: "outline",
            spacing: 1,
            class: "flex-wrap",
            view: (group) =>
              group
                .root(h.div)
                .children(
                  ToggleGroupItem(group, { element: h.button, value: "cooking" }).children(
                    "Cooking",
                  ),
                  ToggleGroupItem(group, { element: h.button, value: "dining" }).children("Dining"),
                  ToggleGroupItem(group, { element: h.button, value: "nightlight" }).children(
                    "Nightlight",
                  ),
                  ToggleGroupItem(group, { element: h.button, value: "focus" }).children("Focus"),
                ),
          }),
        ),
        ItemGroup(h).children(
          sliderRow(
            SunIcon(h),
            "Brightness",
            model.brightness,
            (value) => KitchenIslandMessage.MovedBrightness({ value }),
            "w-full",
          ),
          sliderRow(ThermometerIcon(h), "Color Temp", model.colorTemp, (value) =>
            KitchenIslandMessage.MovedColorTemp({ value }),
          ),
          sliderRow(Volume2Icon(h), "Volume", model.volume, (value) =>
            KitchenIslandMessage.MovedVolume({ value }),
          ),
          sliderRow(TimerIcon(h), "Fade", model.fade, (value) =>
            KitchenIslandMessage.MovedFade({ value }),
          ),
        ),
      ),
    );
  },
});
