import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { HtmlLocator } from "@effect/ui/html/testing";
import { Locator, Scene } from "@effect/ui/testing";
import { Slider as KitSlider } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  SLIDER_CLASS,
  SLIDER_RANGE_CLASS,
  SLIDER_THUMB_CLASS,
  SLIDER_TRACK_CLASS,
  Slider,
  type SliderValue,
} from "../registry/ui/slider.ts";

// The consumer recipe (see tests/README.md): the port wraps the kit
// Slider headless component, so a test defines the smallest consumer
// Component that owns the value, and drives the kit child with
// childEmit — the child's `Moved` / `Committed` events are what the
// port surfaces as upstream's onValueChange / onValueCommit.
//
// Declared untestable here: pointer drag geometry, keyboard stepping
// and thumb collision are the kit Slider's own update, which a Scene
// never runs (they are covered by the kit's headless tests). What IS
// tested is the port's rendering contract: the stacked root, the
// CSS-variable positioning the port appends (the kit publishes
// --slider-thumb-position / --slider-indicator-* and the port's classes
// consume them), and that Moved/Committed move the consumer's Model and
// the re-render follows.

const VolumeMessage = UiSchema.TaggedEnum({
  MovedVolume: { value: Schema.Number },
  CommittedVolume: { value: Schema.Number },
});

const Volume = Html.component({
  name: "Volume",
  model: Schema.Struct({
    volume: Schema.Number,
    committed: Schema.NullOr(Schema.Number),
  }),
  message: VolumeMessage,
}).make({
  init: () => ({ volume: 40, committed: null }),
  update: {
    MovedVolume: ($, { value }) => $.evolve({ volume: value }),
    CommittedVolume: ($, { value }) => $.evolve({ committed: value }),
  },
  view: (h, model) =>
    h.div.children(
      Slider(h, {
        props: { value: model.volume },
        onValueChange: ({ value }) => VolumeMessage.MovedVolume({ value: value as number }),
        onValueCommit: ({ value }) => VolumeMessage.CommittedVolume({ value: value as number }),
        name: "volume",
        ariaLabels: ["Volume"],
      }),
      h.span
        .attr("data-slot", "committed-status")
        .children(model.committed === null ? "none" : `committed ${model.committed}`),
    ),
});

const RangeMessage = UiSchema.TaggedEnum({
  MovedRange: { value: Schema.Array(Schema.Number) },
});

const PriceRange = Html.component({
  name: "PriceRange",
  model: Schema.Struct({ range: Schema.Array(Schema.Number) }),
  message: RangeMessage,
}).make({
  init: () => ({ range: [20, 80] }),
  update: {
    MovedRange: ($, { value }) => $.evolve({ range: value }),
  },
  view: (h, model) =>
    Slider(h, {
      props: { value: model.range },
      onValueChange: ({ value }) =>
        RangeMessage.MovedRange({ value: value as ReadonlyArray<number> }),
      name: "price",
      ariaLabels: ["Minimum", "Maximum"],
    }),
});

const root = Locator.attr("data-slot", "slider");
const track = Locator.attr("data-slot", "slider-track");
const rangePart = Locator.attr("data-slot", "slider-range");
const thumb = Locator.attr("data-slot", "slider-thumb");
const thumbAt = (index: number) => Locator.attr("data-index", String(index));
const input = Locator.tag("input");
const committedStatus = Locator.attr("data-slot", "committed-status");

// The port appends these arbitrary-property classes so the kit's
// indicator variables position the range (see the port's header).
const RANGE_POSITION_HORIZONTAL =
  "[left:var(--slider-indicator-start)] [width:var(--slider-indicator-size)]";

describe("Slider (shadcn-effect port)", () => {
  it.effect(
    "renders at 40: stacked root, track/range/thumb classes, thumb position var, and the named range input",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(Volume, {});
        const rootAttrs = scene.get(root).attrs;
        assert.strictEqual(rootAttrs?.class, SLIDER_CLASS);
        assert.strictEqual(rootAttrs?.["data-orientation"], "horizontal");
        assert.strictEqual(scene.get(track).attrs?.class, SLIDER_TRACK_CLASS);
        const rangeAttrs = scene.get(rangePart).attrs;
        assert.strictEqual(rangeAttrs?.class, `${SLIDER_RANGE_CLASS} ${RANGE_POSITION_HORIZONTAL}`);
        assert.include(rangeAttrs?.style ?? "", "--slider-indicator-start:0%");
        assert.include(rangeAttrs?.style ?? "", "--slider-indicator-size:40%");
        const thumbAttrs = scene.get(thumb).attrs;
        assert.include(thumbAttrs?.class ?? "", SLIDER_THUMB_CLASS);
        assert.include(thumbAttrs?.style ?? "", "--slider-thumb-position:40%");
        const inputAttrs = scene.get(input).attrs;
        assert.strictEqual(inputAttrs?.type, "range");
        // The input's value is a property, not an attribute record entry.
        assert.strictEqual(HtmlLocator.value(scene.get(input)), "40");
        assert.strictEqual(inputAttrs?.["aria-valuenow"], "40");
        assert.strictEqual(inputAttrs?.name, "volume");
        assert.strictEqual(inputAttrs?.["aria-label"], "Volume");
      }),
  );

  it.effect("Moved moves the Model and the thumb follows; Committed is reported separately", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(Volume, {});
      // A Scene never runs the kit child's update, so a drag is stood
      // in for by what the child emits as it moves.
      scene.childEmit(KitSlider, { _tag: "Moved", value: 65 });
      assert.include(scene.get(thumb).attrs?.style ?? "", "--slider-thumb-position:65%");
      assert.include(scene.get(rangePart).attrs?.style ?? "", "--slider-indicator-size:65%");
      assert.strictEqual(HtmlLocator.value(scene.get(input)), "65");
      // Committed lands on release, under upstream's onValueCommit.
      scene.expect(committedStatus).toHaveText("none");
      scene.childEmit(KitSlider, { _tag: "Committed", value: 65 });
      scene.expect(committedStatus).toHaveText("committed 65");
    }),
  );

  it.effect(
    "edge: a range slider draws one thumb per value, and a Moved array moves the addressed thumb",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(PriceRange, {});
        scene.expect(thumb).toHaveCount(2);
        assert.include(scene.get(thumbAt(0)).attrs?.style ?? "", "--slider-thumb-position:20%");
        assert.include(scene.get(thumbAt(1)).attrs?.style ?? "", "--slider-thumb-position:80%");
        // The indicator spans the two thumbs.
        assert.include(scene.get(rangePart).attrs?.style ?? "", "--slider-indicator-start:20%");
        assert.include(scene.get(rangePart).attrs?.style ?? "", "--slider-indicator-size:60%");
        const moved: SliderValue = [30, 80];
        scene.childEmit(KitSlider, { _tag: "Moved", value: moved });
        assert.include(scene.get(thumbAt(0)).attrs?.style ?? "", "--slider-thumb-position:30%");
        assert.include(scene.get(thumbAt(1)).attrs?.style ?? "", "--slider-thumb-position:80%");
        assert.include(scene.get(rangePart).attrs?.style ?? "", "--slider-indicator-start:30%");
      }),
  );
});
