import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Scene } from "@effect/ui/testing";
import { ToggleGroup as KitToggleGroup } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { cn } from "../registry/lib/utils.ts";
import { toggleVariants } from "../registry/ui/toggle.ts";
import {
  ToggleGroup,
  ToggleGroupItem,
  TOGGLE_GROUP_ITEM_CLASS,
  TOGGLE_GROUP_ITEM_SPACING_CLASS,
  TOGGLE_GROUP_ROOT_CLASS,
} from "../registry/ui/toggle-group.ts";

// The consumer recipe (see tests/README.md): the kit ToggleGroup is a
// headless component, so the consumer Component owns the pressed values
// in its Model, maps the port's onToggled to its own Message, and draws
// the styled items inside the port's view closure.
const EditorMessage = UiSchema.TaggedEnum({
  ToggledAlign: { value: Schema.Array(Schema.String) },
});

const alignments = ["left", "center", "right"] as const;

const AlignEditor = Html.component({
  name: "AlignEditor",
  props: Schema.Struct({
    multiple: Schema.optional(Schema.Boolean),
    outline: Schema.optional(Schema.Boolean),
  }),
  model: Schema.Struct({ align: Schema.Array(Schema.String) }),
  message: EditorMessage,
}).make({
  init: () => ({ align: ["left"] }),
  update: {
    ToggledAlign: ($, { value }) => $.evolve({ align: value }),
  },
  view: (h, model) =>
    ToggleGroup(h, {
      props: {
        value: model.align,
        items: alignments.map((value) => ({ value })),
        multiple: h.props.multiple,
      },
      onToggled: (value) => EditorMessage.ToggledAlign({ value }),
      variant: h.props.outline === true ? "outline" : "default",
      view: (group) =>
        group
          .root(h.div)
          .children(
            alignments.map((value) =>
              ToggleGroupItem(group, { element: h.button, value }).children(value),
            ),
          ),
    }),
});

const root = Locator.attr("data-slot", "toggle-group");
const item = (value: string) => Locator.text(value, { exact: true });

describe("ToggleGroup (shadcn-effect port)", () => {
  it.effect(
    "renders the pressed item: aria-pressed, the data-state bridge, resolved variant, and the toggleVariants class chain",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(AlignEditor, {});
        const rootAttrs = scene.get(root).attrs;
        assert.strictEqual(rootAttrs?.["data-variant"], "default");
        assert.strictEqual(rootAttrs?.["data-spacing"], "0");
        assert.strictEqual(rootAttrs?.class, TOGGLE_GROUP_ROOT_CLASS);
        const left = scene.get(item("left")).attrs;
        assert.strictEqual(left?.["aria-pressed"], "true");
        // The port writes Radix's data-state from the controlled value (D-5),
        // alongside the kit's own data-pressed flag.
        assert.strictEqual(left?.["data-state"], "on");
        assert.strictEqual(left?.["data-pressed"], "");
        assert.strictEqual(left?.["data-variant"], "default");
        assert.strictEqual(left?.["data-size"], "default");
        // The item class is built from toggle.ts's toggleVariants (the
        // upstream reuse chain), then the group's own item classes — the
        // exact composition the port renders, asserted in full.
        assert.strictEqual(
          left?.class,
          cn(
            toggleVariants({ variant: "default" }),
            TOGGLE_GROUP_ITEM_CLASS,
            TOGGLE_GROUP_ITEM_SPACING_CLASS,
          ),
        );
        const center = scene.get(item("center")).attrs;
        assert.strictEqual(center?.["aria-pressed"], "false");
        assert.strictEqual(center?.["data-state"], "off");
        assert.isUndefined(center?.["data-pressed"]);
      }),
  );

  it.effect("the child's Toggled event moves the single pressed item in the consumer Model", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(AlignEditor, {});
      // A Scene never runs a child's update, so the Scene idiom is
      // childEmit: stand in for what the kit ToggleGroup emits (single
      // mode: pressing center releases left), and the consumer's onEmit
      // mapping + update run for real.
      scene.childEmit(KitToggleGroup, { _tag: "Toggled", value: ["center"] });
      assert.strictEqual(scene.get(item("center")).attrs?.["data-state"], "on");
      assert.strictEqual(scene.get(item("center")).attrs?.["aria-pressed"], "true");
      assert.strictEqual(scene.get(item("left")).attrs?.["data-state"], "off");
      assert.strictEqual(scene.get(item("left")).attrs?.["aria-pressed"], "false");
    }),
  );

  it.effect("multiple mode keeps several items pressed at once", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(AlignEditor, { multiple: true });
      scene.childEmit(KitToggleGroup, {
        _tag: "Toggled",
        value: ["left", "right"],
      });
      assert.strictEqual(scene.get(item("left")).attrs?.["data-state"], "on");
      assert.strictEqual(scene.get(item("right")).attrs?.["data-state"], "on");
      assert.strictEqual(scene.get(item("right")).attrs?.["aria-pressed"], "true");
      assert.strictEqual(scene.get(item("center")).attrs?.["data-state"], "off");
    }),
  );

  it.effect("the group's outline variant resolves onto the root and every item", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(AlignEditor, { outline: true });
      assert.strictEqual(scene.get(root).attrs?.["data-variant"], "outline");
      const left = scene.get(item("left")).attrs;
      assert.strictEqual(left?.["data-variant"], "outline");
      assert.strictEqual(
        left?.class,
        cn(
          toggleVariants({ variant: "outline" }),
          TOGGLE_GROUP_ITEM_CLASS,
          TOGGLE_GROUP_ITEM_SPACING_CLASS,
        ),
      );
    }),
  );
});
