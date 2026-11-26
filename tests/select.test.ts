import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Play, Scene, TestHost } from "@effect/ui/testing";
import { Select as KitSelect } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  SELECT_CONTENT_CLASS,
  SELECT_ITEM_CLASS,
  SELECT_LABEL_CLASS,
  SELECT_TRIGGER_CLASS,
  SELECT_VIEWPORT_CLASS,
  Select,
  type SelectItem,
} from "../registry/ui/select.ts";

// The consumer recipe (see tests/README.md): the port is a view function
// over the kit's headless Select, so the test defines the smallest consumer
// Component that owns `open` and `value` in its Model, maps the kit's
// emitted events to its own Messages, and draws the port. The Scene then
// drives the rendered view; the child's own update never runs in a Scene,
// so interactions go through `childEmit` (rule 1) — a Play below does the
// one real pointer sequence.
//
// Kit behaviour the Play relies on (read in the kit source, not guessed):
// the trigger toggles on `mousedown` (PressedTrigger) for mouse/pen — its
// `click` handler only answers keyboard ("") and touch pointer types —
// and an item picks on the mousedown → mouseup → click sequence
// (PressedItem arms it, ClickedItem picks). Play.click sends click only,
// which this component deliberately ignores for a mouse, so the Play fires
// the full sequence.
// Ungrouped items first, then a group: the port draws a separator before
// a group that follows other content (its SelectSeparator placement).
const frameworks: ReadonlyArray<SelectItem> = [
  { value: "svelte", label: "Svelte" },
  { value: "vue", label: "Vue" },
  { value: "next", label: "Next.js", group: "meta" },
  { value: "remix", label: "Remix", group: "meta" },
];

const SelectMessage = UiSchema.TaggedEnum({
  SelectOpened: {},
  SelectClosed: {},
  SelectPicked: { value: Schema.NullOr(Schema.String) },
});

const FrameworkSelect = Html.component({
  name: "FrameworkSelect",
  props: Schema.Struct({
    empty: Schema.optional(Schema.Boolean),
    size: Schema.optional(Schema.Literals(["sm", "default"])),
  }),
  model: Schema.Struct({
    open: Schema.Boolean,
    value: Schema.NullOr(Schema.String),
  }),
  message: SelectMessage,
}).make({
  // init receives a context, not the props: the props live on `$.props`
  // (the kit's own tests seed Models exactly this way).
  init: ($) => ({
    open: false,
    value: $.props.empty === true ? null : "svelte",
  }),
  update: {
    SelectOpened: ($) => $.evolve({ open: true }),
    SelectClosed: ($) => $.evolve({ open: false }),
    SelectPicked: ($, { value }) => $.evolve({ value }),
  },
  view: (h, model) =>
    Select(h, {
      props: {
        open: model.open,
        value: model.value,
        items: frameworks,
        placeholder: "Pick a framework",
      },
      size: h.props.size,
      groupLabels: { meta: "Meta frameworks" },
      onEmit: {
        RequestedOpen: () => SelectMessage.SelectOpened(),
        RequestedClose: () => SelectMessage.SelectClosed(),
        Picked: ({ value }) =>
          SelectMessage.SelectPicked({
            value: typeof value === "string" ? value : null,
          }),
        Settled: () => undefined,
      },
    }),
});

const root = Locator.attr("data-slot", "select");
const trigger = Locator.attr("data-slot", "select-trigger");
const value = Locator.attr("data-slot", "select-value");
const content = Locator.attr("data-slot", "select-content");
const list = Locator.attr("role", "listbox");
const item = Locator.attr("data-slot", "select-item");
const selectedItem = Locator.attr("aria-selected", "true");

describe("Select (shadcn-effect port)", () => {
  it.effect(
    "renders closed: the trigger is a combobox showing the selected label, with the upstream classes",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(FrameworkSelect, {});
        scene.expect(root).toExist();
        const attrs = scene.get(trigger).attrs;
        assert.strictEqual(attrs?.role, "combobox");
        assert.strictEqual(attrs?.["aria-haspopup"], "listbox");
        assert.strictEqual(attrs?.["aria-expanded"], "false");
        assert.strictEqual(attrs?.["data-size"], "default");
        assert.isUndefined(attrs?.["data-popup-open"]);
        // cn() with no extra class returns the upstream string verbatim.
        assert.strictEqual(attrs?.class, SELECT_TRIGGER_CLASS);
        // The kit's value part draws the selected item's label.
        scene.expect(value).toHaveText("Svelte");
        const contentAttrs = scene.get(content).attrs;
        assert.strictEqual(contentAttrs?.["data-closed"], "");
        assert.isUndefined(contentAttrs?.["data-open"]);
        assert.strictEqual(contentAttrs?.class, SELECT_CONTENT_CLASS);
        assert.strictEqual(scene.get(list).attrs?.class, SELECT_VIEWPORT_CLASS);
      }),
  );

  it.effect(
    "renders the items in order, grouped under their label, with the selected item checked",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(FrameworkSelect, {});
        scene.expect(item).toHaveCount(4);
        const items = scene.all(item);
        assert.deepStrictEqual(
          items.map((node) => Locator.textOf(node)),
          ["Svelte", "Vue", "Next.js", "Remix"],
        );
        for (const node of items) {
          assert.strictEqual(node.attrs?.class, SELECT_ITEM_CLASS);
          assert.strictEqual(node.attrs?.role, "option");
        }
        // The group run is labelled from groupLabels, with upstream styling,
        // and one separator divides it from the ungrouped items.
        const label = scene.get(Locator.attr("data-slot", "select-label"));
        assert.strictEqual(Locator.textOf(label), "Meta frameworks");
        assert.strictEqual(label.attrs?.class, SELECT_LABEL_CLASS);
        scene.expect(Locator.attr("data-slot", "select-separator")).toHaveCount(1);
        // Exactly one selected item: Svelte, carrying the kit's flags and a
        // drawn check indicator (unselected indicators render empty).
        const selected = scene.all(selectedItem);
        assert.strictEqual(selected.length, 1);
        assert.strictEqual(Locator.textOf(selected[0]!), "Svelte");
        assert.strictEqual(selected[0]?.attrs?.["data-selected"], "");
        const indicator = selected[0]?.children?.[0];
        assert.isTrue((indicator?.children?.length ?? 0) > 0);
      }),
  );

  it.effect(
    "the child's RequestedOpen flips the consumer Model, and the re-render shows the popup open",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(FrameworkSelect, {});
        scene.childEmit(KitSelect, {
          _tag: "RequestedOpen",
          reason: "trigger-press",
        });
        const attrs = scene.get(trigger).attrs;
        assert.strictEqual(attrs?.["aria-expanded"], "true");
        assert.strictEqual(attrs?.["data-popup-open"], "");
        const contentAttrs = scene.get(content).attrs;
        assert.strictEqual(contentAttrs?.["data-open"], "");
        assert.isUndefined(contentAttrs?.["data-closed"]);
      }),
  );

  it.effect(
    "a Picked event stores the new value and the following RequestedClose closes the popup",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(FrameworkSelect, {});
        scene.childEmit(KitSelect, {
          _tag: "RequestedOpen",
          reason: "trigger-press",
        });
        // A real item press makes the kit emit Picked, then RequestedClose.
        scene.childEmit(KitSelect, {
          _tag: "Picked",
          value: "vue",
          reason: "item-press",
        });
        scene.childEmit(KitSelect, {
          _tag: "RequestedClose",
          reason: "item-press",
        });
        scene.expect(value).toHaveText("Vue");
        assert.strictEqual(scene.get(trigger).attrs?.["aria-expanded"], "false");
        const selected = scene.all(selectedItem);
        assert.strictEqual(selected.length, 1);
        assert.strictEqual(Locator.textOf(selected[0]!), "Vue");
      }),
  );

  it.effect("with no value the trigger shows the placeholder and carries data-placeholder", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(FrameworkSelect, { empty: true });
      assert.strictEqual(scene.get(trigger).attrs?.["data-placeholder"], "");
      assert.strictEqual(scene.get(value).attrs?.["data-placeholder"], "");
      scene.expect(value).toHaveText("Pick a framework");
      scene.expect(selectedItem).toHaveCount(0);
    }),
  );

  it.effect("the size prop reaches the trigger as data-size", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(FrameworkSelect, { size: "sm" });
      assert.strictEqual(scene.get(trigger).attrs?.["data-size"], "sm");
    }),
  );

  // A Play mounts on TestHost with the runtime running, so the kit child's
  // own update runs and a real pointer sequence reaches it — the one thing
  // a Scene cannot do with a headless child.
  it.effect("a Play: pressing the trigger opens, pressing an item picks it and closes", () =>
    Effect.gen(function* () {
      const mouse = { button: 0, x: 0, y: 0, pointerType: "mouse" };
      const play = yield* Play.make(FrameworkSelect, {});
      yield* play.fire(trigger, "mousedown", mouse);
      yield* play.expect(trigger).toHaveAttribute("aria-expanded", "true");
      yield* play.expect(content).toHaveAttribute("data-open", "");
      const vue = Locator.text("Vue", { exact: true });
      yield* play.fire(vue, "mousedown", mouse);
      yield* play.fire(vue, "mouseup", mouse);
      yield* play.fire(vue, "click", mouse);
      yield* play.expect(trigger).toHaveAttribute("aria-expanded", "false");
      yield* play.expect(value).toHaveText("Vue");
      yield* play.expect(selectedItem).toHaveCount(1);
    }).pipe(Effect.provide(TestHost.layer())),
  );
});
