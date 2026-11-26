import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Play, Scene, TestHost } from "@effect/ui/testing";
import { Dialog as KitDialog } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  DIALOG_CLOSE_CLASS,
  DIALOG_CONTENT_CLASS,
  DIALOG_DESCRIPTION_CLASS,
  DIALOG_HEADER_CLASS,
  DIALOG_OVERLAY_CLASS,
  DIALOG_TITLE_CLASS,
  Dialog,
  DialogHeader,
  XIcon,
} from "../registry/ui/dialog.ts";

// The consumer recipe (see tests/README.md): the port wraps the kit Dialog
// headless component, so the consumer owns `open` in its Model and stores
// what the kit's RequestedOpen / RequestedClose events ask for. A Scene
// never runs the kit child's update, so the open/close transitions are
// driven with scene.childEmit(KitDialog, …) — standing in for what the
// child emits — and one Play does the real clicks end to end.
//
// Not covered here, deliberately:
// - Transition flags in a Scene (data-starting-style / data-ending-style,
//   Settled timing): they are produced by the child's mount, which a Scene
//   never runs; the Play pins data-open, and the rest is the kit's own
//   Dialog scene tests' job (upstream packages/ui-kit/test/Dialog.test.ts).
// - Dismissal paths other than the close part (Escape, outside press,
//   focus-out): they reach the consumer as the same RequestedClose event
//   with a different `reason`, so the mapping proven for "close-press"
//   covers them; producing those reasons is mount-internal kit behavior.
// - Focus management (initialFocus / finalFocus / trap): the port adds no
//   focus handling of its own; the kit's tests own it.
const PageMessage = UiSchema.TaggedEnum({
  RequestedOpenSettings: {},
  RequestedCloseSettings: {},
});

const SettingsPage = Html.component({
  name: "SettingsPage",
  model: Schema.Struct({ open: Schema.Boolean }),
  message: PageMessage,
}).make({
  init: () => ({ open: false }),
  update: {
    RequestedOpenSettings: ($) => $.evolve({ open: true }),
    RequestedCloseSettings: ($) => $.evolve({ open: false }),
  },
  view: (h, model) =>
    Dialog(h, {
      props: { open: model.open },
      onEmit: {
        RequestedOpen: () => PageMessage.RequestedOpenSettings(),
        RequestedClose: () => PageMessage.RequestedCloseSettings(),
        Settled: () => undefined,
      },
      view: (dialog) =>
        h.div(
          dialog.trigger(h.button).children("Settings"),
          dialog.portal(h.dialog)?.children(
            dialog.backdrop(h.div),
            dialog.viewport(h.div).children(
              dialog.popup(h.div).children(
                DialogHeader(h).children(
                  dialog.title(h.h2).children("Settings"),
                  dialog.description(h.p).children("For this workspace."),
                ),
                // The auto close button upstream renders inside the
                // content, as the composition the port's header documents.
                dialog
                  .close(h.button.class(DIALOG_CLOSE_CLASS))
                  .children(XIcon(h), h.span.class("sr-only").children("Close")),
              ),
            ),
          ),
        ),
    }),
});

const trigger = Locator.attr("data-slot", "dialog-trigger");
const portal = Locator.attr("data-slot", "dialog-portal");
const backdrop = Locator.attr("data-slot", "dialog-overlay");
const popup = Locator.attr("data-slot", "dialog-content");
const title = Locator.attr("data-slot", "dialog-title");
const description = Locator.attr("data-slot", "dialog-description");
const header = Locator.attr("data-slot", "dialog-header");
const close = Locator.attr("data-slot", "dialog-close");

describe("Dialog (shadcn-effect port)", () => {
  it.effect("renders closed: the trigger is drawn, the portal and popup are absent", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(SettingsPage, {});
      const attrs = scene.get(trigger).attrs;
      assert.strictEqual(attrs?.["aria-haspopup"], "dialog");
      assert.strictEqual(attrs?.["aria-expanded"], "false");
      assert.isUndefined(attrs?.["data-popup-open"]);
      // The kit portal returns undefined while closed (no keepMounted), so
      // nothing of the dialog itself is in the tree.
      assert.isUndefined(scene.query(portal));
      assert.isUndefined(scene.query(popup));
      assert.isUndefined(scene.query(backdrop));
    }),
  );

  it.effect(
    "the child's RequestedOpen flips the consumer Model, and the re-render draws the styled parts",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(SettingsPage, {});
        scene.childEmit(KitDialog, { _tag: "RequestedOpen", triggerId: null });
        // The trigger now reports the popup open.
        const triggerAttrs = scene.get(trigger).attrs;
        assert.strictEqual(triggerAttrs?.["aria-expanded"], "true");
        assert.strictEqual(triggerAttrs?.["data-popup-open"], "");
        // The portal is labelled by the drawn title and described by the
        // description, as the kit wires them.
        const portalAttrs = scene.get(portal).attrs;
        assert.strictEqual(portalAttrs?.["aria-labelledby"], scene.get(title).attrs?.id);
        assert.strictEqual(portalAttrs?.["aria-describedby"], scene.get(description).attrs?.id);
        // Popup: the port's slot and the upstream class string verbatim.
        // (A Scene doesn't run the child's mount, so the kit's transition
        // flags are not asserted here — see "Not covered" above. What the
        // port itself stamps is asserted here.)
        const popupAttrs = scene.get(popup).attrs;
        assert.strictEqual(popupAttrs?.class, DIALOG_CONTENT_CLASS);
        assert.strictEqual(scene.get(backdrop).attrs?.class, DIALOG_OVERLAY_CLASS);
        assert.strictEqual(scene.get(header).attrs?.class, DIALOG_HEADER_CLASS);
        const titleAttrs = scene.get(title).attrs;
        assert.strictEqual(titleAttrs?.class, DIALOG_TITLE_CLASS);
        scene.expect(title).toHaveText("Settings");
        const descriptionAttrs = scene.get(description).attrs;
        assert.strictEqual(descriptionAttrs?.class, DIALOG_DESCRIPTION_CLASS);
        scene.expect(description).toHaveText("For this workspace.");
        // The close composition wears the upstream close classes.
        assert.strictEqual(scene.get(close).attrs?.class, DIALOG_CLOSE_CLASS);
      }),
  );

  it.effect("the child's RequestedClose (close-press) closes it again", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(SettingsPage, {});
      scene.childEmit(KitDialog, { _tag: "RequestedOpen", triggerId: null });
      assert.isDefined(scene.query(popup));
      scene.childEmit(KitDialog, {
        _tag: "RequestedClose",
        reason: "close-press",
      });
      assert.isUndefined(scene.query(popup));
      assert.isUndefined(scene.query(portal));
      assert.strictEqual(scene.get(trigger).attrs?.["aria-expanded"], "false");
    }),
  );

  // A Play mounts on TestHost with the runtime running, so the kit child's
  // own update runs: a real press on the trigger emits RequestedOpen, and a
  // real press on the close button emits RequestedClose — the end-to-end
  // path a Scene can only stand in for.
  it.effect(
    "a Play: a real click on the trigger opens it, and a real click on the close button closes it",
    () =>
      Effect.gen(function* () {
        const play = yield* Play.make(SettingsPage, {});
        yield* play.click(trigger);
        yield* play.expect(trigger).toHaveAttribute("aria-expanded", "true");
        yield* play.expect(popup).toHaveAttribute("data-slot", "dialog-content");
        yield* play.expect(popup).toHaveAttribute("class", DIALOG_CONTENT_CLASS);
        // With the mount running, the kit's own open flag lands on the popup
        // (the port writes no data-state here — D-5: upstream's
        // data-[state=…] tokens stay verbatim but inert under the kit).
        yield* play.expect(popup).toHaveAttribute("data-open", "");
        yield* play.expect(title).toHaveText("Settings");
        yield* play.click(close);
        yield* play.expect(trigger).toHaveAttribute("aria-expanded", "false");
      }).pipe(Effect.provide(TestHost.layer())),
  );
});
