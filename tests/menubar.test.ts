import { UiSchema, View } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Play, Scene, TestHost } from "@effect/ui/testing";
import { Menu as KitMenu } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  MENUBAR_CHECKBOX_ITEM_CLASS,
  MENUBAR_CLASS,
  MENUBAR_CONTENT_CLASS,
  MENUBAR_ITEM_CLASS,
  MENUBAR_LABEL_CLASS,
  MENUBAR_SEPARATOR_CLASS,
  MENUBAR_TRIGGER_CLASS,
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarTrigger,
} from "../registry/ui/menubar.ts";

// The consumer recipe (see tests/README.md), menubar edition: the kit
// Menubar is a headless Component that only owns the bar; each menu
// inside it is an ordinary kit Menu child, keyed by name. Following the
// kit's own Menubar example, the consumer keeps *which* menu is open as
// one value in its Model, and a menu's RequestedClose only clears it
// while it still names that menu (a close can be reported after another
// menu's open). Scenes drive the menus with keyed childEmit
// (README rule 1); one Play does the real press → pick flow.
//
// Both menus' parts share the port's data-slots, so locators use the
// kit's per-item `data-menu-item` values where they can, and document
// order (File before Edit) for the two triggers and contents.
//
// Checked state is items-driven: a checkbox or radio item renders
// checked when its entry in the menu's `items` prop carries
// `checked: true`, so the consumer derives File's items from its Model
// on every render, and a checkbox Picked reports the new state (the
// opposite of the entry's current `checked`). This is Effect-TS/ui
// PR #474 ("Read Menu checked state from items"), fixing issue #445 —
// filed from this repo's D-8 finding, where radio items passed as a
// plain argument rendered unchecked because the old `radioGroup` part
// recorded its value mid-evaluation. Build order is free now and the
// wrappers' children callback is gone. Text labels go through
// View.text because the wrappers' children parameters are a single
// View.Content. The port Menubar's `view` returns an array of menus
// directly (its typing was widened to View.Children at wave-3
// consolidation).
//
// Untestable in a Scene (declared, not faked): the bar's roving
// tabindex and arrow-key movement between triggers, hover-to-switch
// once a menu is open, and focus return (all live in the kit children's
// own updates/mounts — the kit's Menubar document tests own them), the
// root's data-has-submenu-open (collected shared state a Scene never
// collects — asserted absent, not present),
// placement of the popups, and the exit/`data-instant="group"`
// transition behavior when the open menu moves. The upstream
// `data-[state=open]` animation utilities stay inert under the kit
// (D-5) — class strings are asserted verbatim, their CSS effect is not.
const EditorBarMessage = UiSchema.TaggedEnum({
  Opened: { menu: Schema.String },
  Closed: { menu: Schema.String },
  Picked: {
    value: Schema.String,
    checked: Schema.optional(Schema.Boolean),
  },
});

// File's `items` prop, derived from the Model on every render:
// `checked` on an entry is the kit's only source of checked state.
const fileItemsFor = (model: { readonly wrap: boolean; readonly size: string }) => [
  { value: "new", label: "New" },
  { value: "wrap", label: "Wrap lines", checked: model.wrap },
  { value: "small", label: "Small", checked: model.size === "small" },
  { value: "large", label: "Large", checked: model.size === "large" },
];
const editItems = [
  { value: "undo", label: "Undo" },
  { value: "redo", label: "Redo" },
];

const EditorBar = Html.component({
  name: "EditorBar",
  model: Schema.Struct({
    open: Schema.NullOr(Schema.String),
    wrap: Schema.Boolean,
    size: Schema.String,
    picked: Schema.NullOr(Schema.String),
  }),
  message: EditorBarMessage,
}).make({
  init: () => ({ open: null, wrap: false, size: "small", picked: null }),
  update: {
    Opened: ($, { menu }) => $.evolve({ open: menu }),
    Closed: ($, { menu }) => ($.model.open === menu ? $.evolve({ open: null }) : $.model),
    Picked: ($, { checked, value }) =>
      value === "wrap"
        ? $.evolve({ wrap: checked === true })
        : value === "small" || value === "large"
          ? $.evolve({ size: value })
          : $.evolve({ picked: value, open: null }),
  },
  view: (h, model) =>
    h.div(
      Menubar(h, {
        view: () => [
          MenubarMenu(h, {
            key: "File",
            props: {
              open: model.open === "File",
              items: fileItemsFor(model),
              align: "start",
              alignOffset: -4,
              sideOffset: 8,
            },
            onEmit: {
              RequestedOpen: () => EditorBarMessage.Opened({ menu: "File" }),
              RequestedClose: () => EditorBarMessage.Closed({ menu: "File" }),
              Picked: ({ checked, value }) => EditorBarMessage.Picked({ value, checked }),
              Highlighted: () => undefined,
              RequestedQuery: () => undefined,
              Settled: () => undefined,
            },
            view: (menu) =>
              h.div(
                MenubarTrigger(menu, h).children("File"),
                MenubarContent(menu, h).children(
                  MenubarLabel(menu, h, {}).children("Actions"),
                  MenubarItem(menu, h, { value: "new" }).children("New"),
                  MenubarCheckboxItem(menu, h, { value: "wrap" }, View.text("Wrap lines")),
                  MenubarSeparator(menu, h),
                  // Radio items as plain children: checked state comes
                  // from the items prop data, so build order is free.
                  MenubarRadioGroup(menu, h, [
                    MenubarRadioItem(menu, h, { value: "small" }, View.text("Small")),
                    MenubarRadioItem(menu, h, { value: "large" }, View.text("Large")),
                  ]),
                ),
              ),
          }),
          MenubarMenu(h, {
            key: "Edit",
            props: {
              open: model.open === "Edit",
              items: editItems,
              align: "start",
              alignOffset: -4,
              sideOffset: 8,
            },
            onEmit: {
              RequestedOpen: () => EditorBarMessage.Opened({ menu: "Edit" }),
              RequestedClose: () => EditorBarMessage.Closed({ menu: "Edit" }),
              Picked: ({ checked, value }) => EditorBarMessage.Picked({ value, checked }),
              Highlighted: () => undefined,
              RequestedQuery: () => undefined,
              Settled: () => undefined,
            },
            view: (menu) =>
              h.div(
                MenubarTrigger(menu, h).children("Edit"),
                MenubarContent(menu, h).children(
                  editItems.map((item) =>
                    MenubarItem(menu, h, { value: item.value }).children(item.label),
                  ),
                ),
              ),
          }),
        ],
      }),
      h.span.attr("data-testid", "status").children(model.picked ?? "none"),
    ),
});

const bar = Locator.attr("data-slot", "menubar");
const triggers = Locator.attr("data-slot", "menubar-trigger");
const contents = Locator.attr("data-slot", "menubar-content");
const label = Locator.attr("data-slot", "menubar-label");
const checkboxItem = Locator.attr("data-slot", "menubar-checkbox-item");
const separator = Locator.attr("data-slot", "menubar-separator");
const itemByValue = (value: string) => Locator.attr("data-menu-item", value);
const status = Locator.attr("data-testid", "status");

const openMenu = (scene: { childEmit: (...args: Array<any>) => unknown }, menu: string) =>
  scene.childEmit(KitMenu, menu, {
    _tag: "RequestedOpen",
    reason: "trigger-press",
    triggerId: null,
  });

describe("Menubar (shadcn-effect port)", () => {
  it.effect(
    "renders closed: a menubar root with the upstream class, two menuitem triggers, and both contents data-closed",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(EditorBar, {});
        const barAttrs = scene.get(bar).attrs;
        assert.strictEqual(barAttrs?.role, "menubar");
        assert.strictEqual(barAttrs?.["data-orientation"], "horizontal");
        assert.strictEqual(barAttrs?.class, MENUBAR_CLASS);
        const triggerAttrs = scene.all(triggers).map((node) => node.attrs);
        assert.strictEqual(triggerAttrs.length, 2);
        for (const attrs of triggerAttrs) {
          // Inside a menubar the kit rewrites the trigger's role to
          // menuitem; the bar owns its place in the Tab order.
          assert.strictEqual(attrs?.role, "menuitem");
          assert.strictEqual(attrs?.["aria-haspopup"], "menu");
          assert.strictEqual(attrs?.["aria-expanded"], "false");
          assert.strictEqual(attrs?.class, MENUBAR_TRIGGER_CLASS);
        }
        const contentAttrs = scene.all(contents).map((node) => node.attrs);
        assert.strictEqual(contentAttrs.length, 2);
        for (const attrs of contentAttrs) {
          assert.strictEqual(attrs?.["data-closed"], "");
          assert.strictEqual(attrs?.class, MENUBAR_CONTENT_CLASS);
        }
        scene.expect(status).toHaveText("none");
      }),
  );

  it.effect(
    "opening File: its trigger and content report open, Edit's stay closed, and every File part is stamped",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(EditorBar, {});
        openMenu(scene, "File");
        const [fileTrigger, editTrigger] = scene.all(triggers).map((node) => node.attrs);
        assert.strictEqual(fileTrigger?.["aria-expanded"], "true");
        assert.strictEqual(fileTrigger?.["data-popup-open"], "");
        assert.strictEqual(editTrigger?.["aria-expanded"], "false");
        const [fileContent, editContent] = scene.all(contents).map((node) => node.attrs);
        assert.strictEqual(fileContent?.["data-open"], "");
        assert.strictEqual(fileContent?.role, "menu");
        // The menubar positioning defaults the port documents
        // (align "start" as a prop) show up on the popup.
        assert.strictEqual(fileContent?.["data-align"], "start");
        assert.strictEqual(editContent?.["data-closed"], "");
        // The bar's own data-has-submenu-open is *collected* state: the
        // Menubar child learns a menu opened from its readers' reports,
        // which a Scene never collects — it stays absent here even with
        // File open (the Play/runtime is where it appears).
        assert.isUndefined(scene.get(bar).attrs?.["data-has-submenu-open"]);
        const labelAttrs = scene.get(label).attrs;
        assert.strictEqual(labelAttrs?.class, MENUBAR_LABEL_CLASS);
        scene.expect(label).toHaveText("Actions");
        const itemAttrs = scene.get(itemByValue("new")).attrs;
        assert.strictEqual(itemAttrs?.role, "menuitem");
        assert.strictEqual(itemAttrs?.["data-variant"], "default");
        assert.strictEqual(itemAttrs?.class, MENUBAR_ITEM_CLASS);
        const checkboxAttrs = scene.get(checkboxItem).attrs;
        assert.strictEqual(checkboxAttrs?.role, "menuitemcheckbox");
        assert.strictEqual(checkboxAttrs?.["aria-checked"], "false");
        assert.strictEqual(checkboxAttrs?.class, MENUBAR_CHECKBOX_ITEM_CLASS);
        const separatorAttrs = scene.get(separator).attrs;
        assert.strictEqual(separatorAttrs?.role, "separator");
        assert.strictEqual(separatorAttrs?.class, MENUBAR_SEPARATOR_CLASS);
        // The radio group drew from the Model: small checked, large not.
        assert.strictEqual(scene.get(itemByValue("small")).attrs?.["aria-checked"], "true");
        assert.strictEqual(scene.get(itemByValue("large")).attrs?.["aria-checked"], "false");
      }),
  );

  it.effect(
    "the open menu moves: Edit's RequestedOpen takes over, and File's late RequestedClose can't clear it",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(EditorBar, {});
        openMenu(scene, "File");
        openMenu(scene, "Edit");
        const [fileContent, editContent] = scene.all(contents).map((node) => node.attrs);
        assert.strictEqual(fileContent?.["data-closed"], "");
        assert.strictEqual(editContent?.["data-open"], "");
        // The kit warns a closing menu can report after the next opened;
        // the consumer's guard keeps Edit open when File's close arrives.
        scene.childEmit(KitMenu, "File", {
          _tag: "RequestedClose",
          reason: "sibling-open",
        });
        assert.strictEqual(scene.all(contents)[1]?.attrs?.["data-open"], "");
        // Edit's own close does clear it.
        scene.childEmit(KitMenu, "Edit", {
          _tag: "RequestedClose",
          reason: "escape-key",
        });
        assert.strictEqual(scene.all(contents)[1]?.attrs?.["data-closed"], "");
        assert.isUndefined(scene.get(bar).attrs?.["data-has-submenu-open"]);
      }),
  );

  it.effect(
    "picks reach the consumer: the checkbox toggles in place, a radio pick moves the value, an item pick records and closes",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(EditorBar, {});
        openMenu(scene, "File");
        scene.childEmit(KitMenu, "File", {
          _tag: "Picked",
          value: "wrap",
          checked: true,
        });
        assert.strictEqual(scene.get(checkboxItem).attrs?.["aria-checked"], "true");
        assert.strictEqual(scene.get(checkboxItem).attrs?.["data-checked"], "");
        // The menu stayed open (the consumer's checkbox pick keeps it).
        assert.strictEqual(scene.all(contents)[0]?.attrs?.["data-open"], "");
        scene.childEmit(KitMenu, "File", {
          _tag: "Picked",
          value: "large",
          checked: true,
        });
        assert.strictEqual(scene.get(itemByValue("large")).attrs?.["aria-checked"], "true");
        assert.strictEqual(scene.get(itemByValue("small")).attrs?.["aria-checked"], "false");
        openMenu(scene, "Edit");
        scene.childEmit(KitMenu, "Edit", { _tag: "Picked", value: "undo" });
        scene.expect(status).toHaveText("undo");
        const contentAttrs = scene.all(contents).map((node) => node.attrs);
        for (const attrs of contentAttrs) {
          assert.strictEqual(attrs?.["data-closed"], "");
        }
      }),
  );

  // A Play mounts the component on TestHost with the runtime running,
  // so the kit Menubar and Menu updates run for real: a press on the
  // File trigger opens its menu and a click picks its item.
  it.effect(
    "a Play: a real press on the File trigger opens its menu, and a real click picks and closes",
    () =>
      Effect.gen(function* () {
        const play = yield* Play.make(EditorBar, {});
        const fileTrigger = Locator.text("File", { exact: true });
        yield* play.fire(fileTrigger, "mousedown", {
          button: 0,
          x: 0,
          y: 0,
          pointerType: "mouse",
        });
        yield* play.expect(fileTrigger).toHaveAttribute("aria-expanded", "true");
        yield* play.click(Locator.text("New", { exact: true }));
        yield* play.expect(status).toHaveText("new");
        yield* play.expect(fileTrigger).toHaveAttribute("aria-expanded", "false");
      }).pipe(Effect.provide(TestHost.layer())),
  );
});
