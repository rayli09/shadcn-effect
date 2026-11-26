import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Play, Scene, TestHost } from "@effect/ui/testing";
import { Combobox as KitCombobox } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  COMBOBOX_CONTENT_CLASS,
  COMBOBOX_ITEM_CLASS,
  COMBOBOX_LABEL_CLASS,
  COMBOBOX_LIST_CLASS,
  COMBOBOX_TRIGGER_BUTTON_CLASS,
  COMBOBOX_TRIGGER_CLASS,
  COMBOBOX_TRIGGER_ICON_CLASS,
  Combobox,
  type ComboboxItem,
} from "../registry/ui/combobox.ts";

// The consumer recipe (see tests/README.md): the port is a view function
// over the kit's headless Combobox, so the test defines the smallest
// consumer Component that owns `open`, `value` and `inputValue` in its
// Model, maps the kit's emitted events to its own Messages, and draws the
// port. A Scene never runs the child's update, so interactions go through
// `childEmit` (rule 1) — but the kit's *filtering* is not update state: the
// parts' `groups` are derived from the props on every render, so storing a
// new `inputValue` in the Model and re-rendering is enough to watch the
// list filter, groups and all.
//
// Kit behaviour the Play relies on (read in the kit source): the trigger
// toggles on `mousedown`, an item picks on the mousedown → mouseup →
// click sequence, and ArrowDown in the input opens the popup. The Play
// opens by keyboard on purpose: the trigger's mousedown also runs the
// kit's focus Command for the input, after which this snapshot's Play
// cursor queries an empty tree on TestHost (the consumer Model still
// updates — the Scene tests prove the same event end to end). Typing
// itself is not driven in the Play: TestHost has no text-entry step, so
// text arrives via `childEmit` of RequestedInputValue, exactly what the
// kit emits for real typing.
const frameworks: ReadonlyArray<ComboboxItem> = [
  { value: "next", label: "Next.js", group: "meta" },
  { value: "remix", label: "Remix", group: "meta" },
  { value: "sveltekit", label: "SvelteKit", group: "ssr" },
  { value: "nuxt", label: "Nuxt", group: "ssr" },
  { value: "astro", label: "Astro" },
];

const ComboMessage = UiSchema.TaggedEnum({
  ComboOpened: {},
  ComboClosed: {},
  ComboPicked: { value: Schema.NullOr(Schema.String) },
  ComboInput: { text: Schema.String },
});

const FrameworkCombobox = Html.component({
  name: "FrameworkCombobox",
  model: Schema.Struct({
    open: Schema.Boolean,
    value: Schema.NullOr(Schema.String),
    inputValue: Schema.String,
  }),
  message: ComboMessage,
}).make({
  init: () => ({
    open: false,
    value: null as string | null,
    inputValue: "",
  }),
  update: {
    ComboOpened: ($) => $.evolve({ open: true }),
    ComboClosed: ($) => $.evolve({ open: false }),
    ComboPicked: ($, { value }) => $.evolve({ value }),
    ComboInput: ($, { text }) => $.evolve({ inputValue: text }),
  },
  view: (h, model) =>
    Combobox(h, {
      props: {
        open: model.open,
        value: model.value,
        inputValue: model.inputValue,
        items: frameworks,
      },
      groupLabels: { meta: "Meta", ssr: "SSR" },
      onEmit: {
        RequestedOpen: () => ComboMessage.ComboOpened(),
        RequestedClose: () => ComboMessage.ComboClosed(),
        Picked: ({ value }) =>
          ComboMessage.ComboPicked({
            value: typeof value === "string" ? value : null,
          }),
        RequestedInputValue: ({ inputValue }) => ComboMessage.ComboInput({ text: inputValue }),
        Highlighted: () => undefined,
        Settled: () => undefined,
      },
    }),
});

const input = Locator.attr("role", "combobox");
const trigger = Locator.attr("data-slot", "combobox-trigger");
const content = Locator.attr("data-slot", "combobox-content");
const list = Locator.attr("data-slot", "combobox-list");
const item = Locator.attr("data-slot", "combobox-item");
const group = Locator.attr("data-slot", "combobox-group");
const groupLabel = Locator.attr("data-slot", "combobox-label");
const separator = Locator.attr("data-slot", "combobox-separator");
const empty = Locator.attr("data-slot", "combobox-empty");
const selectedItem = Locator.attr("aria-selected", "true");

describe("Combobox (shadcn-effect port)", () => {
  it.effect(
    "renders closed: a combobox input, the trigger with the upstream classes, and every item grouped",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(FrameworkCombobox, {});
        const inputAttrs = scene.get(input).attrs;
        assert.strictEqual(inputAttrs?.["aria-expanded"], "false");
        assert.strictEqual(inputAttrs?.["aria-haspopup"], "listbox");
        assert.strictEqual(inputAttrs?.["aria-autocomplete"], "list");
        assert.strictEqual(inputAttrs?.value, "");
        const triggerAttrs = scene.get(trigger).attrs;
        assert.strictEqual(
          triggerAttrs?.class,
          `${COMBOBOX_TRIGGER_CLASS} ${COMBOBOX_TRIGGER_BUTTON_CLASS}`,
        );
        const icon = scene.get(Locator.attr("data-slot", "combobox-trigger-icon"));
        assert.strictEqual(icon.attrs?.class, COMBOBOX_TRIGGER_ICON_CLASS);
        const contentAttrs = scene.get(content).attrs;
        assert.strictEqual(contentAttrs?.["data-closed"], "");
        assert.isUndefined(contentAttrs?.["data-open"]);
        assert.strictEqual(contentAttrs?.["data-chips"], "false");
        assert.strictEqual(contentAttrs?.class, COMBOBOX_CONTENT_CLASS);
        assert.strictEqual(scene.get(list).attrs?.class, COMBOBOX_LIST_CLASS);
        // All five items render, split into the two labelled groups plus the
        // ungrouped Astro, with a separator between runs.
        scene.expect(item).toHaveCount(5);
        assert.deepStrictEqual(
          scene.all(item).map((node) => Locator.textOf(node)),
          ["Next.js", "Remix", "SvelteKit", "Nuxt", "Astro"],
        );
        for (const node of scene.all(item)) {
          assert.strictEqual(node.attrs?.class, COMBOBOX_ITEM_CLASS);
          assert.strictEqual(node.attrs?.role, "option");
        }
        scene.expect(group).toHaveCount(2);
        assert.deepStrictEqual(
          scene.all(groupLabel).map((node) => Locator.textOf(node)),
          ["Meta", "SSR"],
        );
        for (const node of scene.all(groupLabel)) {
          assert.strictEqual(node.attrs?.class, COMBOBOX_LABEL_CLASS);
        }
        scene.expect(separator).toHaveCount(2);
        // Nothing is selected and the empty part drops its text while the
        // list has items.
        scene.expect(selectedItem).toHaveCount(0);
        assert.strictEqual(Locator.textOf(scene.get(empty)), "");
      }),
  );

  it.effect(
    "the child's RequestedOpen flips the consumer Model, and the re-render shows the popup open",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(FrameworkCombobox, {});
        scene.childEmit(KitCombobox, {
          _tag: "RequestedOpen",
          reason: "input-press",
        });
        assert.strictEqual(scene.get(input).attrs?.["aria-expanded"], "true");
        assert.strictEqual(scene.get(input).attrs?.["data-popup-open"], "");
        const contentAttrs = scene.get(content).attrs;
        assert.strictEqual(contentAttrs?.["data-open"], "");
        assert.isUndefined(contentAttrs?.["data-closed"]);
      }),
  );

  it.effect(
    "storing a typed inputValue filters the list: only matches stay, with their group",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(FrameworkCombobox, {});
        // What the kit emits as the user types: the consumer stores it, the
        // re-render hands it back as the inputValue prop, and the parts'
        // derived groups drop everything the default "contains" filter
        // rejects — the meta group disappears entirely.
        scene.childEmit(KitCombobox, {
          _tag: "RequestedInputValue",
          inputValue: "svelte",
          reason: "input-change",
        });
        assert.strictEqual(scene.get(input).attrs?.value, "svelte");
        const items = scene.all(item);
        assert.strictEqual(items.length, 1);
        assert.strictEqual(Locator.textOf(items[0]!), "SvelteKit");
        scene.expect(group).toHaveCount(1);
        assert.strictEqual(Locator.textOf(scene.get(groupLabel)), "SSR");
        scene.expect(separator).toHaveCount(0);
      }),
  );

  it.effect("a text nothing matches empties the list and the empty part shows its text", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(FrameworkCombobox, {});
      scene.childEmit(KitCombobox, {
        _tag: "RequestedInputValue",
        inputValue: "zzz",
        reason: "input-change",
      });
      scene.expect(item).toHaveCount(0);
      scene.expect(empty).toHaveText("No results found.");
      assert.strictEqual(scene.get(content).attrs?.["data-empty"], "");
      assert.strictEqual(scene.get(list).attrs?.["data-empty"], "");
      assert.strictEqual(scene.get(input).attrs?.["data-list-empty"], "");
    }),
  );

  it.effect(
    "a Picked event stores the value, asks for the picked label as the text, and closes",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(FrameworkCombobox, {});
        scene.childEmit(KitCombobox, {
          _tag: "RequestedOpen",
          reason: "input-press",
        });
        // A real item press makes the kit emit Picked, then a
        // RequestedInputValue carrying the picked label, then
        // RequestedClose.
        scene.childEmit(KitCombobox, {
          _tag: "Picked",
          value: "nuxt",
          reason: "item-press",
        });
        scene.childEmit(KitCombobox, {
          _tag: "RequestedInputValue",
          inputValue: "Nuxt",
          reason: "item-press",
        });
        scene.childEmit(KitCombobox, {
          _tag: "RequestedClose",
          reason: "item-press",
        });
        assert.strictEqual(scene.get(input).attrs?.value, "Nuxt");
        assert.strictEqual(scene.get(input).attrs?.["aria-expanded"], "false");
        const selected = scene.all(selectedItem);
        assert.strictEqual(selected.length, 1);
        assert.strictEqual(Locator.textOf(selected[0]!), "Nuxt");
        assert.strictEqual(selected[0]?.attrs?.["data-selected"], "");
        // The selected item's indicator draws the check icon; the others
        // render no indicator at all.
        const svgs = Locator.elements(selected[0]!).filter((node) => node.tag === "svg");
        assert.strictEqual(svgs.length, 1);
      }),
  );

  // A Play mounts on TestHost with the runtime running, so the kit child's
  // own update runs — the Scene above can only stand in for its events.
  // Opened by keyboard (see the header note on the trigger's mousedown),
  // then the item is pressed with the full pointer sequence.
  it.effect("a Play: ArrowDown opens, pressing an item picks it, fills the input and closes", () =>
    Effect.gen(function* () {
      const mouse = { button: 0, x: 0, y: 0, pointerType: "mouse" };
      const play = yield* Play.make(FrameworkCombobox, {});
      yield* play.fire(input, "keydown", {
        key: "ArrowDown",
        alt: false,
        composing: false,
        ctrl: false,
        meta: false,
        selectionStart: 0,
        shift: false,
      });
      yield* play.expect(input).toHaveAttribute("aria-expanded", "true");
      yield* play.expect(content).toHaveAttribute("data-open", "");
      const nuxt = Locator.text("Nuxt", { exact: true });
      yield* play.fire(nuxt, "mousedown", mouse);
      yield* play.fire(nuxt, "mouseup", mouse);
      yield* play.fire(nuxt, "click", mouse);
      yield* play.expect(input).toHaveAttribute("aria-expanded", "false");
      yield* play.expect(input).toHaveAttribute("value", "Nuxt");
      yield* play.expect(selectedItem).toHaveCount(1);
    }).pipe(Effect.provide(TestHost.layer())),
  );
});
