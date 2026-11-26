import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Scene } from "@effect/ui/testing";
import { Tabs as KitTabs } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  Tabs,
  TabsContent,
  TabsList,
  tabsListVariants,
  TabsTrigger,
  TABS_ROOT_CLASS,
  TABS_TRIGGER_CLASS,
} from "../registry/ui/tabs.ts";

// The consumer recipe (see tests/README.md): the kit Tabs is a headless
// component, so the consumer Component owns the active tab in its Model,
// maps the port's onSelected to its own Message, and draws the styled
// parts inside the port's view closure.
const SettingsMessage = UiSchema.TaggedEnum({
  SelectedTab: { value: Schema.String },
});

const Settings = Html.component({
  name: "Settings",
  props: Schema.Struct({
    disablePassword: Schema.optional(Schema.Boolean),
  }),
  model: Schema.Struct({ tab: Schema.String }),
  message: SettingsMessage,
}).make({
  init: () => ({ tab: "account" }),
  update: {
    SelectedTab: ($, { value }) => $.evolve({ tab: value }),
  },
  view: (h, model) =>
    Tabs(h, {
      props: {
        value: model.tab,
        tabs: [{ value: "account" }, { value: "password", disabled: h.props.disablePassword }],
      },
      onSelected: ({ value }) => SettingsMessage.SelectedTab({ value }),
      view: (tabs) =>
        tabs
          .root(h.div)
          .children(
            TabsList(tabs, h.div).children(
              TabsTrigger(tabs, { element: h.button, value: "account" }).children("Account"),
              TabsTrigger(tabs, { element: h.button, value: "password" }).children("Password"),
            ),
            TabsContent(tabs, { element: h.div, value: "account" })?.children("Account panel"),
            TabsContent(tabs, { element: h.div, value: "password" })?.children("Password panel"),
          ),
    }),
});

const root = Locator.attr("data-slot", "tabs");
const list = Locator.attr("data-slot", "tabs-list");
const content = Locator.attr("data-slot", "tabs-content");
const trigger = (label: string) => Locator.text(label, { exact: true });

describe("Tabs (shadcn-effect port)", () => {
  it.effect(
    "renders the active tab: roles, aria-selected, the data-state bridge, and the upstream list class",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(Settings, {});
        assert.strictEqual(scene.get(root).attrs?.["data-orientation"], "horizontal");
        assert.strictEqual(scene.get(root).attrs?.class, TABS_ROOT_CLASS);
        const listAttrs = scene.get(list).attrs;
        assert.strictEqual(listAttrs?.role, "tablist");
        assert.strictEqual(listAttrs?.["data-variant"], "default");
        assert.strictEqual(listAttrs?.class, tabsListVariants({}));
        const account = scene.get(trigger("Account")).attrs;
        assert.strictEqual(account?.role, "tab");
        assert.strictEqual(account?.class, TABS_TRIGGER_CLASS);
        assert.strictEqual(account?.["aria-selected"], "true");
        // The port writes Radix's data-state from the controlled value (D-5),
        // alongside the kit's own data-active flag.
        assert.strictEqual(account?.["data-state"], "active");
        assert.strictEqual(account?.["data-active"], "");
        const password = scene.get(trigger("Password")).attrs;
        assert.strictEqual(password?.["aria-selected"], "false");
        assert.strictEqual(password?.["data-state"], "inactive");
        assert.isUndefined(password?.["data-active"]);
        // Only the active panel is drawn; the hidden one returns undefined.
        scene.expect(content).toHaveCount(1);
        scene.expect(content).toHaveText("Account panel");
        assert.strictEqual(scene.get(content).attrs?.role, "tabpanel");
      }),
  );

  it.effect(
    "the child's Selected event flips the consumer Model, and the re-render moves active state and panel",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(Settings, {});
        // A Scene never runs a child's update, so the Scene idiom is
        // childEmit: stand in for what the kit Tabs emits, and the
        // consumer's onEmit mapping + update run for real.
        scene.childEmit(KitTabs, {
          _tag: "Selected",
          value: "password",
          activationDirection: "right",
        });
        const password = scene.get(trigger("Password")).attrs;
        assert.strictEqual(password?.["aria-selected"], "true");
        assert.strictEqual(password?.["data-state"], "active");
        assert.strictEqual(password?.["data-active"], "");
        const account = scene.get(trigger("Account")).attrs;
        assert.strictEqual(account?.["aria-selected"], "false");
        assert.strictEqual(account?.["data-state"], "inactive");
        assert.isUndefined(account?.["data-active"]);
        scene.expect(content).toHaveCount(1);
        scene.expect(content).toHaveText("Password panel");
      }),
  );

  it.effect("a disabled tab renders disabled and stays inactive", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(Settings, { disablePassword: true });
      const password = scene.get(trigger("Password")).attrs;
      assert.strictEqual(password?.["aria-disabled"], "true");
      assert.strictEqual(password?.["data-disabled"], "");
      assert.strictEqual(password?.["aria-selected"], "false");
      assert.strictEqual(password?.["data-state"], "inactive");
    }),
  );
});
