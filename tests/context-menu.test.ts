import { UiSchema, View } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Play, Scene, TestHost } from "@effect/ui/testing";
import { Menu as KitMenu } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  CONTEXT_MENU_CHECKBOX_ITEM_CLASS,
  CONTEXT_MENU_CONTENT_CLASS,
  CONTEXT_MENU_ITEM_CLASS,
  CONTEXT_MENU_LABEL_CLASS,
  CONTEXT_MENU_SEPARATOR_CLASS,
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../registry/ui/context-menu.ts";

// The consumer recipe (see tests/README.md): the kit ContextMenu is a
// function over the headless Menu, so the child a Scene stands in for is
// the kit `Menu` itself ("it renders a Menu… a Scene of the consumer
// names it Menu"), and its events are the Menu's minus RequestedQuery
// (a context menu has no filter). The consumer owns `open` and the
// checkbox state in its Model; tests drive the child with childEmit
// (README rule 1), plus one Play for the real right-click flow.
// Checked state reaches the kit through the `items` prop data
// (Effect-TS/ui PR #474): the consumer derives each entry's `checked`
// from its Model, and a checkbox Picked reports the new state (the
// opposite of the entry's current `checked`).
//
// Scene-rendering facts pinned here: as with Menu, the popup is always
// drawn in the view and closed is `data-closed` on the content. The
// context trigger itself never reports the open state — no
// aria-haspopup, no data-popup-open in either state — because the menu
// opens at the pointer, not "from" the area; data-open on the content
// is the only open signal.
//
// Untestable in a Scene (declared, not faked): where the popup opens
// (placement at the pointer is the kit TrackMenu mount's job, and a
// Scene has no pointer geometry), the 500ms touch long-press timing,
// keyboard navigation/typeahead inside the popup (the kit child's own
// update — the kit's headless tests own it), the browser-menu
// suppression itself (a host behavior; the Play only proves the kit
// opens on contextmenu), and the exit transition. The upstream
// `data-[state=open]` animation utilities stay inert under the kit
// (D-5) — class strings are asserted verbatim, their CSS effect is not.
const FileRowMessage = UiSchema.TaggedEnum({
  Opened: {},
  Closed: {},
  Picked: {
    value: Schema.String,
    checked: Schema.optional(Schema.Boolean),
  },
});

// The Menu's `items` prop, derived from the Model on every render:
// `checked` on an entry is the kit's only source of checked state.
const itemsFor = (wrap: boolean) => [
  { value: "rename", label: "Rename" },
  { value: "wrap", label: "Wrap lines", checked: wrap },
];

const FileRow = Html.component({
  name: "FileRow",
  model: Schema.Struct({
    open: Schema.Boolean,
    wrap: Schema.Boolean,
    picked: Schema.NullOr(Schema.String),
  }),
  message: FileRowMessage,
}).make({
  init: () => ({ open: false, wrap: false, picked: null }),
  update: {
    Opened: ($) => $.evolve({ open: true }),
    Closed: ($) => $.evolve({ open: false }),
    Picked: ($, { checked, value }) =>
      value === "wrap"
        ? $.evolve({ wrap: checked === true })
        : $.evolve({ picked: value, open: false }),
  },
  view: (h, model) =>
    h.div(
      ContextMenu(h, {
        props: { open: model.open, items: itemsFor(model.wrap) },
        onEmit: {
          RequestedOpen: () => FileRowMessage.Opened(),
          RequestedClose: () => FileRowMessage.Closed(),
          Picked: ({ checked, value }) => FileRowMessage.Picked({ value, checked }),
          Highlighted: () => undefined,
          Settled: () => undefined,
        },
        view: (menu) =>
          h.div(
            ContextMenuTrigger(menu, h).children("report.pdf"),
            ContextMenuContent(menu, h).children(
              ContextMenuLabel(menu, h, {}).children("File actions"),
              ContextMenuItem(menu, h, { value: "rename" }).children("Rename"),
              ContextMenuCheckboxItem(menu, h, { value: "wrap" }, View.text("Wrap lines")),
              ContextMenuSeparator(menu, h),
            ),
          ),
      }),
      h.span.attr("data-testid", "status").children(model.picked ?? "none"),
    ),
});

const trigger = Locator.attr("data-slot", "context-menu-trigger");
const content = Locator.attr("data-slot", "context-menu-content");
const label = Locator.attr("data-slot", "context-menu-label");
const item = Locator.attr("data-slot", "context-menu-item");
const checkboxItem = Locator.attr("data-slot", "context-menu-checkbox-item");
const separator = Locator.attr("data-slot", "context-menu-separator");
const status = Locator.attr("data-testid", "status");
const icons = Locator.tag("svg");

const openMenu = (scene: { childEmit: (...args: Array<any>) => unknown }) =>
  scene.childEmit(KitMenu, {
    _tag: "RequestedOpen",
    reason: "trigger-press",
    triggerId: null,
  });

describe("ContextMenu (shadcn-effect port)", () => {
  it.effect(
    "renders closed: the trigger area is a plain tabbable div, and the content carries data-closed",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(FileRow, {});
        const triggerAttrs = scene.get(trigger).attrs;
        assert.strictEqual(triggerAttrs?.["data-slot"], "context-menu-trigger");
        // The kit gives the area tabindex="0" so the keyboard can reach
        // it — and no menu-button ARIA: it is not a button.
        assert.strictEqual(triggerAttrs?.tabindex, "0");
        assert.isUndefined(triggerAttrs?.["aria-haspopup"]);
        assert.isUndefined(triggerAttrs?.["data-popup-open"]);
        scene.expect(trigger).toHaveText("report.pdf");
        const contentAttrs = scene.get(content).attrs;
        assert.strictEqual(contentAttrs?.["data-closed"], "");
        assert.isUndefined(contentAttrs?.["data-open"]);
        assert.strictEqual(contentAttrs?.role, "menu");
        assert.strictEqual(contentAttrs?.class, CONTEXT_MENU_CONTENT_CLASS);
        assert.strictEqual(scene.get(checkboxItem).attrs?.["aria-checked"], "false");
        scene.expect(icons).toHaveCount(0);
        scene.expect(status).toHaveText("none");
      }),
  );

  it.effect(
    "the child's RequestedOpen flips the consumer Model, and the re-render shows the popup and every part open",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(FileRow, {});
        openMenu(scene);
        const contentAttrs = scene.get(content).attrs;
        assert.strictEqual(contentAttrs?.["data-open"], "");
        assert.isUndefined(contentAttrs?.["data-closed"]);
        // The trigger still reports nothing: the menu opened at the
        // pointer, not from the area.
        assert.isUndefined(scene.get(trigger).attrs?.["data-popup-open"]);
        const labelAttrs = scene.get(label).attrs;
        assert.strictEqual(labelAttrs?.class, CONTEXT_MENU_LABEL_CLASS);
        scene.expect(label).toHaveText("File actions");
        const itemAttrs = scene.get(item).attrs;
        assert.strictEqual(itemAttrs?.role, "menuitem");
        assert.strictEqual(itemAttrs?.["data-variant"], "default");
        assert.strictEqual(itemAttrs?.class, CONTEXT_MENU_ITEM_CLASS);
        const checkboxAttrs = scene.get(checkboxItem).attrs;
        assert.strictEqual(checkboxAttrs?.role, "menuitemcheckbox");
        assert.strictEqual(checkboxAttrs?.class, CONTEXT_MENU_CHECKBOX_ITEM_CLASS);
        const separatorAttrs = scene.get(separator).attrs;
        assert.strictEqual(separatorAttrs?.role, "separator");
        assert.strictEqual(separatorAttrs?.class, CONTEXT_MENU_SEPARATOR_CLASS);
      }),
  );

  it.effect("picking an item reaches the consumer: the Model records it and the menu closes", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(FileRow, {});
      openMenu(scene);
      scene.childEmit(KitMenu, { _tag: "Picked", value: "rename" });
      scene.expect(status).toHaveText("rename");
      assert.strictEqual(scene.get(content).attrs?.["data-closed"], "");
    }),
  );

  it.effect(
    "a checkbox item's Picked carries the new checked state into the Model, and the indicator follows",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(FileRow, {});
        openMenu(scene);
        scene.childEmit(KitMenu, {
          _tag: "Picked",
          value: "wrap",
          checked: true,
        });
        const attrs = scene.get(checkboxItem).attrs;
        assert.strictEqual(attrs?.["aria-checked"], "true");
        assert.strictEqual(attrs?.["data-checked"], "");
        assert.isUndefined(attrs?.["data-unchecked"]);
        scene.expect(icons).toHaveCount(1);
        assert.strictEqual(scene.get(content).attrs?.["data-open"], "");
        scene.childEmit(KitMenu, {
          _tag: "Picked",
          value: "wrap",
          checked: false,
        });
        assert.strictEqual(scene.get(checkboxItem).attrs?.["aria-checked"], "false");
        scene.expect(icons).toHaveCount(0);
      }),
  );

  it.effect("the child's RequestedClose closes it again", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(FileRow, {});
      openMenu(scene);
      scene.expect(content).toHaveAttribute("data-open", "");
      scene.childEmit(KitMenu, {
        _tag: "RequestedClose",
        reason: "escape-key",
      });
      assert.strictEqual(scene.get(content).attrs?.["data-closed"], "");
      assert.isUndefined(scene.get(content).attrs?.["data-open"]);
    }),
  );

  // A Play mounts the component on TestHost with the runtime running:
  // a real contextmenu event on the area opens the menu at the pointer
  // and a real click picks the item — the flow a Scene can only stand
  // in for with childEmit.
  it.effect(
    "a Play: a real right click opens the menu, and a real click picks the item and closes it",
    () =>
      Effect.gen(function* () {
        const play = yield* Play.make(FileRow, {});
        yield* play.fire(trigger, "contextmenu", {
          button: 2,
          x: 100,
          y: 50,
          pointerType: "mouse",
        });
        yield* play.expect(content).toHaveAttribute("data-open", "");
        yield* play.click(Locator.text("Rename", { exact: true }));
        yield* play.expect(status).toHaveText("rename");
        yield* play.expect(content).toHaveAttribute("data-closed", "");
      }).pipe(Effect.provide(TestHost.layer())),
  );
});
