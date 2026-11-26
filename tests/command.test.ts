import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Scene } from "@effect/ui/testing";
import { Autocomplete as KitAutocomplete } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  COMMAND_CLASS,
  COMMAND_INPUT_CLASS,
  COMMAND_ITEM_CLASS,
  COMMAND_ITEM_HIGHLIGHT_CLASS,
  COMMAND_LIST_CLASS,
  Command,
  type CommandItem,
} from "../registry/ui/command.ts";

// The consumer recipe (see tests/README.md): the port is a composition
// over the kit Autocomplete headless component, so a test defines the
// smallest consumer Component that owns the query text and the pick, and
// drives the kit child with childEmit.
//
// Declared untestable here: the kit Autocomplete's own part behaviour —
// filtering mechanics, highlight movement, keyboard navigation — is the
// kit's headless-scene tests' job. What IS tested is the port's wiring:
// the composition's rendered anatomy and classes, and that an `Updated`
// event with reason "item-press" reaches the consumer as a pick while
// every other `Updated` reaches it as a query change. The re-render's
// filtered list is asserted because the kit computes `groups` from the
// props the consumer feeds back — that feedback loop is the port's
// contract. Note the pick event carries the item's LABEL (that is what
// Autocomplete puts in the input), so the consumer maps label → item.

const items: ReadonlyArray<CommandItem> = [
  { value: "new-file", label: "New File", group: "file", shortcut: "Ctrl+N" },
  { value: "new-folder", label: "New Folder", group: "file" },
  { value: "open-settings", label: "Open Settings", group: "app" },
];

const PaletteMessage = UiSchema.TaggedEnum({
  QueryChanged: { value: Schema.String },
  PickedCommand: { label: Schema.String },
});

const Palette = Html.component({
  name: "Palette",
  props: Schema.Struct({ single: Schema.optional(Schema.Boolean) }),
  model: Schema.Struct({
    query: Schema.String,
    picked: Schema.NullOr(Schema.String),
  }),
  message: PaletteMessage,
}).make({
  init: () => ({ query: "", picked: null }),
  update: {
    QueryChanged: ($, { value }) => $.evolve({ query: value }),
    // Picking puts the label in the input, as the kit's Autocomplete
    // itself would ask for — the consumer stores both.
    PickedCommand: ($, { label }) => $.evolve({ picked: label, query: label }),
  },
  view: (h, model) =>
    h.div.children(
      Command(h, {
        items: h.props.single === true ? [{ value: "solo", label: "Solo Command" }] : items,
        query: model.query,
        groupLabels: { file: "File", app: "Application" },
        onQueryChange: (value) => PaletteMessage.QueryChanged({ value }),
        onPick: (label) => PaletteMessage.PickedCommand({ label }),
      }),
      h.span.attr("data-slot", "picked-status").children(model.picked ?? "none"),
      h.span.attr("data-slot", "query-status").children(model.query),
    ),
});

const root = Locator.attr("data-slot", "command");
const input = Locator.attr("data-slot", "command-input");
const list = Locator.attr("data-slot", "command-list");
const item = Locator.attr("data-slot", "command-item");
const empty = Locator.attr("data-slot", "command-empty");
const pickedStatus = Locator.attr("data-slot", "picked-status");
const queryStatus = Locator.attr("data-slot", "query-status");

describe("Command (shadcn-effect port)", () => {
  it.effect("renders the palette: root/input/list classes, grouped items, and a shortcut", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(Palette, {});
      assert.strictEqual(scene.get(root).attrs?.class, COMMAND_CLASS);
      const inputAttrs = scene.get(input).attrs;
      assert.strictEqual(inputAttrs?.class, COMMAND_INPUT_CLASS);
      assert.strictEqual(inputAttrs?.placeholder, "Type a command or search...");
      assert.strictEqual(scene.get(list).attrs?.class, COMMAND_LIST_CLASS);
      scene.expect(item).toHaveCount(3);
      scene.expect(Locator.attr("data-slot", "command-shortcut")).toHaveText("Ctrl+N");
      scene.expect(pickedStatus).toHaveText("none");
    }),
  );

  it.effect(
    "a lone item carries the upstream class string plus the port's kit-highlight variants",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(Palette, { single: true });
        // One item, so the locator is unambiguous: the item element
        // carries COMMAND_ITEM_CLASS verbatim and the appended
        // data-highlighted variants (see the port's header).
        assert.strictEqual(
          scene.get(item).attrs?.class,
          `${COMMAND_ITEM_CLASS} ${COMMAND_ITEM_HIGHLIGHT_CLASS}`,
        );
        scene.expect(item).toHaveText("Solo Command");
      }),
  );

  it.effect(
    "an Updated event with reason item-press is a pick: onPick fires, the query follows the label",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(Palette, {});
        // A Scene never runs the kit child's update, so a real item press
        // is stood in for by what the child emits: Updated with the picked
        // label and reason "item-press" (see the kit's Autocomplete docs).
        scene.childEmit(KitAutocomplete, {
          _tag: "Updated",
          value: "Open Settings",
          reason: "item-press",
        });
        scene.expect(pickedStatus).toHaveText("Open Settings");
        scene.expect(queryStatus).toHaveText("Open Settings");
      }),
  );

  it.effect("edge: a query with no matches filters the list to the empty part", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(Palette, {});
      // Any other Updated reason is a query change, not a pick.
      scene.childEmit(KitAutocomplete, {
        _tag: "Updated",
        value: "zzz",
        reason: "input-change",
      });
      scene.expect(queryStatus).toHaveText("zzz");
      scene.expect(pickedStatus).toHaveText("none");
      // The kit recomputes the groups from the new query prop: nothing
      // matches, so no items are drawn and the empty part shows its text.
      scene.expect(item).toBeAbsent();
      scene.expect(empty).toHaveText("No results found.");
    }),
  );
});
