import { UiSchema, View } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Play, Scene, TestHost } from "@effect/ui/testing";
import { Menu as KitMenu } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  DROPDOWN_MENU_CHECKBOX_ITEM_CLASS,
  DROPDOWN_MENU_CONTENT_CLASS,
  DROPDOWN_MENU_ITEM_CLASS,
  DROPDOWN_MENU_LABEL_CLASS,
  DROPDOWN_MENU_RADIO_ITEM_CLASS,
  DROPDOWN_MENU_SEPARATOR_CLASS,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../registry/ui/dropdown-menu.ts";

// The consumer recipe (see tests/README.md): the kit Menu is a headless
// Component, so the consumer owns `open` (and the checkbox/radio state) in
// its Model and stores what the kit's RequestedOpen / RequestedClose /
// Picked events ask for. A Scene never runs the child's update, so tests
// drive it with childEmit (README rule 1) and assert the re-render the new
// props produce; one Play at the end does the real press → pick flow.
//
// Two Scene-rendering facts about the kit Menu, pinned by these tests:
// unlike Popover's portal, the Menu always draws its popup in the view —
// closed is an attribute state (`data-closed` on the content, no
// `data-popup-open` on the trigger), not an absence. And the kit's
// radioItem part reads the value the radioGroup part recorded *earlier in
// the same view evaluation*. The menu RadioGroup wrappers therefore take
// their items as a children CALLBACK (D-8, fixed at wave-3 consolidation):
// plain-argument children would be evaluated before the group part ran
// and every radio item would render unchecked — in a browser too, not
// just here. (The other wrappers' `children` parameters are typed as a
// single View.Content, so text labels below go through View.text.)
//
// Untestable in a Scene (declared, not faked): placement and collision
// (the positioner's geometry is written by the kit's TrackMenu mount,
// which a Scene doesn't run), keyboard navigation / typeahead / roving
// focus and submenu opening (the kit child's own update and parts — the
// kit's headless tests own those), hover-open timing, and the exit
// transition (Settled / data-ending-style; here the child's Model never
// leaves its init, so closing flips straight to data-closed). The
// upstream `data-[state=open]` animation utilities stay inert under the
// kit (D-5) — the class strings are asserted verbatim, their CSS effect
// is not.
const FileMenuMessage = UiSchema.TaggedEnum({
  Opened: {},
  Closed: {},
  Picked: {
    value: Schema.String,
    checked: Schema.optional(Schema.Boolean),
  },
});

const items = [
  { value: "new", label: "New" },
  { value: "wrap", label: "Wrap lines" },
  { value: "small", label: "Small" },
  { value: "large", label: "Large" },
];

const FileMenu = Html.component({
  name: "FileMenu",
  model: Schema.Struct({
    open: Schema.Boolean,
    wrap: Schema.Boolean,
    size: Schema.String,
    picked: Schema.NullOr(Schema.String),
  }),
  message: FileMenuMessage,
}).make({
  init: () => ({ open: false, wrap: false, size: "small", picked: null }),
  update: {
    Opened: ($) => $.evolve({ open: true }),
    Closed: ($) => $.evolve({ open: false }),
    Picked: ($, { checked, value }) =>
      value === "wrap"
        ? $.evolve({ wrap: checked === true })
        : value === "small" || value === "large"
          ? $.evolve({ size: value })
          : $.evolve({ picked: value, open: false }),
  },
  view: (h, model) =>
    h.div(
      DropdownMenu(h, {
        props: { open: model.open, items, sideOffset: 4 },
        onEmit: {
          RequestedOpen: () => FileMenuMessage.Opened(),
          RequestedClose: () => FileMenuMessage.Closed(),
          Picked: ({ checked, value }) => FileMenuMessage.Picked({ value, checked }),
          Highlighted: () => undefined,
          RequestedQuery: () => undefined,
          Settled: () => undefined,
        },
        view: (menu) =>
          h.div(
            DropdownMenuTrigger(menu, h).children("File"),
            DropdownMenuContent(menu, h).children(
              DropdownMenuLabel(menu, h, {}).children("Actions"),
              DropdownMenuItem(menu, h, { value: "new" }).children("New"),
              DropdownMenuCheckboxItem(
                menu,
                h,
                { value: "wrap", checked: model.wrap },
                View.text("Wrap lines"),
              ),
              DropdownMenuSeparator(menu, h),
              // Items inside the group's children callback (D-8) — see
              // the header note on the kit's evaluation order.
              DropdownMenuRadioGroup(menu, h, { value: model.size }, () => [
                DropdownMenuRadioItem(menu, h, { value: "small" }, View.text("Small")),
                DropdownMenuRadioItem(menu, h, { value: "large" }, View.text("Large")),
              ]),
            ),
          ),
      }),
      h.span.attr("data-testid", "status").children(model.picked ?? "none"),
    ),
});

const trigger = Locator.attr("data-slot", "dropdown-menu-trigger");
const content = Locator.attr("data-slot", "dropdown-menu-content");
const label = Locator.attr("data-slot", "dropdown-menu-label");
const item = Locator.attr("data-slot", "dropdown-menu-item");
const checkboxItem = Locator.attr("data-slot", "dropdown-menu-checkbox-item");
const separator = Locator.attr("data-slot", "dropdown-menu-separator");
const radioGroup = Locator.attr("data-slot", "dropdown-menu-radio-group");
const radioItem = (value: string) => Locator.attr("data-menu-item", value);
const status = Locator.attr("data-testid", "status");
const icons = Locator.tag("svg");

const openMenu = (scene: { childEmit: (...args: Array<any>) => unknown }) =>
  scene.childEmit(KitMenu, {
    _tag: "RequestedOpen",
    reason: "trigger-press",
    triggerId: null,
  });

describe("DropdownMenu (shadcn-effect port)", () => {
  it.effect(
    "renders closed: the trigger is collapsed, the content carries data-closed, and the controlled items show the Model",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(FileMenu, {});
        const triggerAttrs = scene.get(trigger).attrs;
        assert.strictEqual(triggerAttrs?.type, "button");
        assert.strictEqual(triggerAttrs?.["aria-haspopup"], "menu");
        assert.strictEqual(triggerAttrs?.["aria-expanded"], "false");
        assert.isUndefined(triggerAttrs?.["data-popup-open"]);
        assert.isUndefined(triggerAttrs?.["aria-controls"]);
        // The kit draws the popup in the view even while closed; the
        // top layer hides it in a browser. Closed = data-closed.
        const contentAttrs = scene.get(content).attrs;
        assert.strictEqual(contentAttrs?.["data-closed"], "");
        assert.isUndefined(contentAttrs?.["data-open"]);
        assert.strictEqual(contentAttrs?.role, "menu");
        assert.strictEqual(contentAttrs?.class, DROPDOWN_MENU_CONTENT_CLASS);
        // Controlled state is already drawn from the Model: wrap off,
        // size "small" — so exactly one icon renders, the radio Circle.
        assert.strictEqual(scene.get(checkboxItem).attrs?.["aria-checked"], "false");
        assert.strictEqual(scene.get(radioItem("small")).attrs?.["aria-checked"], "true");
        assert.strictEqual(scene.get(radioItem("small")).attrs?.["data-checked"], "");
        assert.strictEqual(scene.get(radioItem("large")).attrs?.["aria-checked"], "false");
        scene.expect(icons).toHaveCount(1);
        scene.expect(status).toHaveText("none");
      }),
  );

  it.effect(
    "the child's RequestedOpen flips the consumer Model, and the re-render shows the popup and every part open",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(FileMenu, {});
        openMenu(scene);
        const contentAttrs = scene.get(content).attrs;
        assert.strictEqual(contentAttrs?.["data-open"], "");
        assert.isUndefined(contentAttrs?.["data-closed"]);
        assert.strictEqual(contentAttrs?.["data-side"], "bottom");
        const triggerAttrs = scene.get(trigger).attrs;
        assert.strictEqual(triggerAttrs?.["aria-expanded"], "true");
        assert.strictEqual(triggerAttrs?.["data-popup-open"], "");
        assert.strictEqual(triggerAttrs?.["aria-controls"], contentAttrs?.id);
        const labelAttrs = scene.get(label).attrs;
        assert.strictEqual(labelAttrs?.class, DROPDOWN_MENU_LABEL_CLASS);
        scene.expect(label).toHaveText("Actions");
        const itemAttrs = scene.get(item).attrs;
        assert.strictEqual(itemAttrs?.role, "menuitem");
        assert.strictEqual(itemAttrs?.["data-variant"], "default");
        assert.strictEqual(itemAttrs?.class, DROPDOWN_MENU_ITEM_CLASS);
        const checkboxAttrs = scene.get(checkboxItem).attrs;
        assert.strictEqual(checkboxAttrs?.role, "menuitemcheckbox");
        assert.strictEqual(checkboxAttrs?.class, DROPDOWN_MENU_CHECKBOX_ITEM_CLASS);
        const separatorAttrs = scene.get(separator).attrs;
        assert.strictEqual(separatorAttrs?.role, "separator");
        assert.strictEqual(separatorAttrs?.class, DROPDOWN_MENU_SEPARATOR_CLASS);
        assert.strictEqual(scene.get(radioGroup).attrs?.role, "group");
        assert.strictEqual(
          scene.get(radioItem("small")).attrs?.class,
          DROPDOWN_MENU_RADIO_ITEM_CLASS,
        );
      }),
  );

  it.effect(
    "picking a plain item reaches the consumer: the Model records it and the menu closes",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(FileMenu, {});
        openMenu(scene);
        scene.childEmit(KitMenu, { _tag: "Picked", value: "new" });
        scene.expect(status).toHaveText("new");
        // The consumer closed the menu in its Picked handler, as an app
        // does when the kit's RequestedClose follows a pick.
        assert.strictEqual(scene.get(trigger).attrs?.["aria-expanded"], "false");
        assert.strictEqual(scene.get(content).attrs?.["data-closed"], "");
      }),
  );

  it.effect(
    "a checkbox item's Picked carries the new checked state into the Model, and the indicator follows",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(FileMenu, {});
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
        // The Check icon joins the radio Circle inside the indicators.
        scene.expect(icons).toHaveCount(2);
        // A checkbox pick doesn't close the menu (the consumer kept it
        // open), and the next Picked asks for false again.
        assert.strictEqual(scene.get(content).attrs?.["data-open"], "");
        scene.childEmit(KitMenu, {
          _tag: "Picked",
          value: "wrap",
          checked: false,
        });
        assert.strictEqual(scene.get(checkboxItem).attrs?.["aria-checked"], "false");
        scene.expect(icons).toHaveCount(1);
      }),
  );

  it.effect("a radio item's Picked moves the group's value in the Model", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(FileMenu, {});
      openMenu(scene);
      scene.childEmit(KitMenu, {
        _tag: "Picked",
        value: "large",
        checked: true,
      });
      assert.strictEqual(scene.get(radioItem("large")).attrs?.["aria-checked"], "true");
      assert.strictEqual(scene.get(radioItem("large")).attrs?.["data-checked"], "");
      assert.strictEqual(scene.get(radioItem("small")).attrs?.["aria-checked"], "false");
      assert.strictEqual(scene.get(radioItem("small")).attrs?.["data-unchecked"], "");
    }),
  );

  it.effect("the child's RequestedClose closes it again", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(FileMenu, {});
      openMenu(scene);
      scene.expect(content).toHaveAttribute("data-open", "");
      scene.childEmit(KitMenu, {
        _tag: "RequestedClose",
        reason: "escape-key",
      });
      assert.strictEqual(scene.get(content).attrs?.["data-closed"], "");
      assert.strictEqual(scene.get(trigger).attrs?.["aria-expanded"], "false");
      assert.isUndefined(scene.get(trigger).attrs?.["data-popup-open"]);
    }),
  );

  // A Play mounts the component on TestHost with the runtime running, so
  // the kit Menu's own update runs: a real press on the trigger opens
  // the menu and a real click on the item picks it — the flow a Scene
  // can only stand in for with childEmit.
  it.effect(
    "a Play: a real press opens the menu, and a real click picks the item and closes it",
    () =>
      Effect.gen(function* () {
        const play = yield* Play.make(FileMenu, {});
        // The kit Menu opens on mousedown, not on the click that follows.
        yield* play.fire(trigger, "mousedown", {
          button: 0,
          x: 0,
          y: 0,
          pointerType: "mouse",
        });
        yield* play.expect(trigger).toHaveAttribute("aria-expanded", "true");
        yield* play.expect(content).toHaveAttribute("data-open", "");
        yield* play.click(Locator.text("New", { exact: true }));
        yield* play.expect(status).toHaveText("new");
        yield* play.expect(trigger).toHaveAttribute("aria-expanded", "false");
      }).pipe(Effect.provide(TestHost.layer())),
  );
});
