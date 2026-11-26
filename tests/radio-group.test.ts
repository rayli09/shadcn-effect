import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Scene } from "@effect/ui/testing";
import { RadioGroup as KitRadioGroup } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  RADIO_GROUP_CLASS,
  RADIO_GROUP_ITEM_CLASS,
  RadioGroup,
} from "../registry/ui/radio-group.ts";

// The consumer recipe (see tests/README.md): the kit RadioGroup is a
// headless component, so the consumer Component owns the picked value in
// its Model and maps the port's onPick to its own Message. The port
// composes the items from its spec (items live inside the group's view
// closure in Effect UI — see the port's header).
const BillingMessage = UiSchema.TaggedEnum({
  PickedPlan: { value: Schema.String },
});

const BillingForm = Html.component({
  name: "BillingForm",
  props: Schema.Struct({
    disableYearly: Schema.optional(Schema.Boolean),
  }),
  model: Schema.Struct({ plan: Schema.String }),
  message: BillingMessage,
}).make({
  init: () => ({ plan: "monthly" }),
  update: {
    PickedPlan: ($, { value }) => $.evolve({ plan: value }),
  },
  view: (h, model) =>
    RadioGroup(h, {
      props: {
        value: model.plan,
        name: "plan",
        items: [
          { value: "monthly", label: "Monthly" },
          {
            value: "yearly",
            label: "Yearly",
            disabled: h.props.disableYearly,
          },
        ],
      },
      onPick: ({ value }) => BillingMessage.PickedPlan({ value }),
    }),
});

const root = Locator.attr("data-slot", "radio-group");
const indicator = Locator.attr("data-slot", "radio-group-indicator");
const radio = (label: string) => Locator.attr("aria-label", label);

describe("RadioGroup (shadcn-effect port)", () => {
  it.effect(
    "renders the picked radio: role, aria-checked, the data-state bridge, the indicator, and the upstream classes",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(BillingForm, {});
        assert.strictEqual(scene.get(root).attrs?.role, "radiogroup");
        assert.strictEqual(scene.get(root).attrs?.class, RADIO_GROUP_CLASS);
        const monthly = scene.get(radio("Monthly")).attrs;
        assert.strictEqual(monthly?.role, "radio");
        assert.strictEqual(monthly?.["aria-checked"], "true");
        // The port writes data-state from the controlled value (the kit
        // mounts the indicator only while its radio is checked).
        assert.strictEqual(monthly?.["data-state"], "checked");
        assert.strictEqual(monthly?.class, RADIO_GROUP_ITEM_CLASS);
        const yearly = scene.get(radio("Yearly")).attrs;
        assert.strictEqual(yearly?.["aria-checked"], "false");
        assert.strictEqual(yearly?.["data-state"], "unchecked");
        // Exactly one indicator in the tree: the checked radio's.
        scene.expect(indicator).toHaveCount(1);
        assert.strictEqual(scene.get(indicator).attrs?.["data-state"], "checked");
      }),
  );

  it.effect(
    "the child's Picked event flips the consumer Model, and the re-render moves checked state and indicator",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(BillingForm, {});
        // A Scene never runs a child's update, so the Scene idiom is
        // childEmit: stand in for what the kit RadioGroup emits, and the
        // consumer's onEmit mapping + update run for real.
        scene.childEmit(KitRadioGroup, { _tag: "Picked", value: "yearly" });
        const yearly = scene.get(radio("Yearly")).attrs;
        assert.strictEqual(yearly?.["aria-checked"], "true");
        assert.strictEqual(yearly?.["data-state"], "checked");
        const monthly = scene.get(radio("Monthly")).attrs;
        assert.strictEqual(monthly?.["aria-checked"], "false");
        assert.strictEqual(monthly?.["data-state"], "unchecked");
        scene.expect(indicator).toHaveCount(1);
        assert.strictEqual(scene.get(indicator).attrs?.["data-state"], "checked");
      }),
  );

  it.effect("a disabled radio renders disabled and stays unchecked", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(BillingForm, { disableYearly: true });
      const yearly = scene.get(radio("Yearly")).attrs;
      assert.strictEqual(yearly?.disabled, "");
      assert.strictEqual(yearly?.["data-disabled"], "");
      assert.strictEqual(yearly?.["aria-checked"], "false");
      assert.strictEqual(yearly?.["data-state"], "unchecked");
    }),
  );
});
