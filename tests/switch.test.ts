import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Scene } from "@effect/ui/testing";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { SWITCH_CLASS, SWITCH_THUMB_CLASS, Switch } from "../registry/ui/switch.ts";

// The consumer recipe (see tests/README.md): the kit Switch is a view
// function, so the consumer Component owns `notify` in its Model, maps the
// port's onToggle to its own Message, and stores what it reports.
const SettingsMessage = UiSchema.TaggedEnum({
  ToggledNotify: { checked: Schema.Boolean },
});

const NotifySettings = Html.component({
  name: "NotifySettings",
  props: Schema.Struct({ disabled: Schema.optional(Schema.Boolean) }),
  model: Schema.Struct({ notify: Schema.Boolean }),
  message: SettingsMessage,
}).make({
  init: () => ({ notify: false }),
  update: {
    ToggledNotify: ($, { checked }) => $.evolve({ notify: checked }),
  },
  view: (h, model) =>
    Switch(h, {
      props: {
        checked: model.notify,
        disabled: h.props.disabled,
        name: "notify",
      },
      onToggle: ({ checked }) => SettingsMessage.ToggledNotify({ checked }),
    }),
});

const root = Locator.attr("data-slot", "switch");
const thumb = Locator.attr("data-slot", "switch-thumb");

describe("Switch (shadcn-effect port)", () => {
  it.effect(
    "renders off: role, aria-checked, the data-state bridge on root and thumb, and the upstream classes",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(NotifySettings, {});
        const attrs = scene.get(root).attrs;
        assert.strictEqual(attrs?.role, "switch");
        assert.strictEqual(attrs?.["aria-checked"], "false");
        // The port writes Radix's data-state from the controlled prop (D-5),
        // alongside the kit's own data-unchecked flag.
        assert.strictEqual(attrs?.["data-state"], "unchecked");
        assert.strictEqual(attrs?.["data-unchecked"], "");
        assert.strictEqual(attrs?.["data-size"], "default");
        assert.strictEqual(attrs?.class, SWITCH_CLASS);
        const thumbAttrs = scene.get(thumb).attrs;
        assert.strictEqual(thumbAttrs?.["data-state"], "unchecked");
        assert.strictEqual(thumbAttrs?.class, SWITCH_THUMB_CLASS);
      }),
  );

  it.effect(
    "a click flips the consumer Model, and the re-render shows checked on root and thumb",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(NotifySettings, {});
        scene.fire(root, "click");
        const attrs = scene.get(root).attrs;
        assert.strictEqual(attrs?.["aria-checked"], "true");
        assert.strictEqual(attrs?.["data-state"], "checked");
        assert.strictEqual(attrs?.["data-checked"], "");
        assert.isUndefined(attrs?.["data-unchecked"]);
        assert.strictEqual(scene.get(thumb).attrs?.["data-state"], "checked");
        scene.fire(root, "click");
        assert.strictEqual(scene.get(root).attrs?.["aria-checked"], "false");
        assert.strictEqual(scene.get(root).attrs?.["data-state"], "unchecked");
      }),
  );

  it.effect(
    "a disabled switch ignores clicks: it renders disabled and exposes no click handler at all",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(NotifySettings, { disabled: true });
        assert.strictEqual(scene.get(root).attrs?.disabled, "");
        assert.strictEqual(scene.get(root).attrs?.["data-disabled"], "");
        // The kit Switch follows native <button disabled> semantics: with no
        // handler registered, a Scene fire is refused outright — no message
        // can be produced, so there is nothing to acknowledge.
        assert.throws(() => scene.fire(root, "click"), /nothing handles "click"/);
        assert.strictEqual(scene.get(root).attrs?.["aria-checked"], "false");
        assert.strictEqual(scene.get(root).attrs?.["data-state"], "unchecked");
      }),
  );
});
