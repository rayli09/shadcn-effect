import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Play, Scene, TestHost } from "@effect/ui/testing";
import { Collapsible as KitCollapsible } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../registry/ui/collapsible.ts";

// The consumer recipe (see tests/README.md): our port is a view function
// over the kit Collapsible headless Component, so the test defines the
// smallest consumer Component that owns `open` in its Model, maps the
// kit's `Toggled` event to its own Message, and stores what it reports.
//
// One declared gap: upstream Radix writes `data-state="open" | "closed"`;
// the kit writes `data-open` / `data-closed` (and `data-panel-open` on the
// trigger) instead, and the port adds no bridge (see the port's header).
// These tests pin the kit attributes, which are what the port's markup
// actually carries.
const ShippingMessage = UiSchema.TaggedEnum({
  ToggledDetails: { open: Schema.Boolean },
});

const ShippingDetails = Html.component({
  name: "ShippingDetails",
  props: Schema.Struct({
    disabled: Schema.optional(Schema.Boolean),
    startOpen: Schema.optional(Schema.Boolean),
  }),
  model: Schema.Struct({ details: Schema.Boolean }),
  message: ShippingMessage,
}).make({
  init: ($) => ({ details: $.props.startOpen === true }),
  update: {
    ToggledDetails: ($, { open }) => $.evolve({ details: open }),
  },
  view: (h, model) =>
    Collapsible(h, {
      props: { open: model.details, disabled: h.props.disabled },
      onEmit: {
        Toggled: ({ open }) => ShippingMessage.ToggledDetails({ open }),
        // The kit's onEmit map is exhaustive: Settled (transitions
        // finished) carries nothing the consumer stores.
        Settled: () => undefined,
      },
      view: (collapsible) =>
        collapsible
          .root(h.div)
          .children(
            CollapsibleTrigger(collapsible, h.button).children("Shipping details"),
            CollapsibleContent(collapsible, h.div)?.children("3 to 5 days."),
          ),
    }),
});

const root = Locator.attr("data-slot", "collapsible");
const trigger = Locator.attr("data-slot", "collapsible-trigger");
const content = Locator.attr("data-slot", "collapsible-content");

describe("Collapsible (shadcn-effect port)", () => {
  it.effect(
    "renders closed: data-slots, the kit's data-closed flag, and no panel in the page",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(ShippingDetails, {});
        const rootAttrs = scene.get(root).attrs;
        assert.strictEqual(rootAttrs?.["data-closed"], "");
        assert.isUndefined(rootAttrs?.["data-open"]);
        const triggerAttrs = scene.get(trigger).attrs;
        assert.strictEqual(triggerAttrs?.type, "button");
        assert.strictEqual(triggerAttrs?.["aria-expanded"], "false");
        // aria-controls is written only while the panel is open.
        assert.isUndefined(triggerAttrs?.["aria-controls"]);
        assert.isUndefined(triggerAttrs?.["data-panel-open"]);
        // The closed panel is not rendered at all (no keepMounted).
        assert.isUndefined(scene.query(content));
      }),
  );

  it.effect(
    "the child's Toggled event flips the consumer Model, and the re-render shows the open panel",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(ShippingDetails, {});
        // A Scene never runs a child's update, so a click on the trigger —
        // whose only handler lives in the kit Collapsible's parts — is
        // refused. The Scene idiom is childEmit: stand in for what the
        // child emits, and the consumer's onEmit mapping + update run for
        // real. (A real click is the Play test below.)
        scene.childEmit(KitCollapsible, {
          _tag: "Toggled",
          open: true,
          reason: "trigger-press",
        });
        const rootAttrs = scene.get(root).attrs;
        assert.strictEqual(rootAttrs?.["data-open"], "");
        assert.isUndefined(rootAttrs?.["data-closed"]);
        const triggerAttrs = scene.get(trigger).attrs;
        assert.strictEqual(triggerAttrs?.["aria-expanded"], "true");
        assert.strictEqual(triggerAttrs?.["data-panel-open"], "");
        const contentAttrs = scene.get(content).attrs;
        assert.strictEqual(contentAttrs?.["data-open"], "");
        // The trigger's aria-controls points at the panel's id.
        assert.strictEqual(triggerAttrs?.["aria-controls"], contentAttrs?.id);
        scene.expect(content).toHaveText("3 to 5 days.");
        // And back again: the port is controlled, so the next Toggled asks
        // for false and the consumer stores it; the panel leaves the page.
        scene.childEmit(KitCollapsible, {
          _tag: "Toggled",
          open: false,
          reason: "trigger-press",
        });
        assert.strictEqual(scene.get(root).attrs?.["data-closed"], "");
        assert.strictEqual(scene.get(trigger).attrs?.["aria-expanded"], "false");
        assert.isUndefined(scene.query(content));
      }),
  );

  it.effect("renders open from the start when the consumer's Model starts open", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(ShippingDetails, { startOpen: true });
      assert.strictEqual(scene.get(root).attrs?.["data-open"], "");
      assert.strictEqual(scene.get(trigger).attrs?.["aria-expanded"], "true");
      assert.strictEqual(scene.get(content).attrs?.["data-open"], "");
    }),
  );

  it.effect(
    "a disabled collapsible renders disabled on root and trigger, with the panel closed",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(ShippingDetails, { disabled: true });
        assert.strictEqual(scene.get(root).attrs?.["data-disabled"], "");
        const triggerAttrs = scene.get(trigger).attrs;
        assert.strictEqual(triggerAttrs?.disabled, "");
        assert.strictEqual(triggerAttrs?.["data-disabled"], "");
        assert.strictEqual(triggerAttrs?.["aria-expanded"], "false");
        assert.isUndefined(scene.query(content));
      }),
  );

  // A Play mounts the component on TestHost with the runtime running, so
  // the kit child's own update runs and a real click reaches it — the one
  // thing a Scene cannot do with a headless child.
  it.effect("a Play: a real click toggles, and a disabled collapsible ignores the click", () =>
    Effect.gen(function* () {
      const play = yield* Play.make(ShippingDetails, {});
      yield* play.click(trigger);
      yield* play.expect(trigger).toHaveAttribute("aria-expanded", "true");
      yield* play.expect(root).toHaveAttribute("data-open", "");
      yield* play.expect(content).toExist();
      yield* play.click(trigger);
      yield* play.expect(trigger).toHaveAttribute("aria-expanded", "false");
      yield* play.expect(root).toHaveAttribute("data-closed", "");

      const disabled = yield* Play.make(ShippingDetails, { disabled: true });
      yield* disabled.click(trigger);
      // No expectIgnored: the click does produce the child's internal
      // ClickedTrigger message — its update swallows it (disabled), emits
      // no Toggled, and the consumer's Model never moves. In a browser the
      // native disabled attribute stops the click from arriving at all.
      yield* disabled.expect(trigger).toHaveAttribute("aria-expanded", "false");
      yield* disabled.expect(root).toHaveAttribute("data-closed", "");
    }).pipe(Effect.provide(TestHost.layer())),
  );
});
