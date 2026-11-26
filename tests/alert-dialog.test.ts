import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Play, Scene, TestHost } from "@effect/ui/testing";
import { Dialog as KitDialog } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../registry/ui/alert-dialog.ts";
import { buttonVariants } from "../registry/ui/button.ts";

// The consumer recipe (see tests/README.md): the port re-exports the kit
// AlertDialog headless component, so the consumer owns `open` in its Model
// and stores what the kit's RequestedOpen / RequestedClose events ask for.
//
// API note: the kit AlertDialog declares a `Dialog` instance (it fixes
// role="alertdialog", modal, no pointer dismissal on top of Dialog), so in
// a Scene the child is named Dialog — childEmit targets KitDialog, exactly
// as the kit's own Drawer test emits to its inner Dialog. A Scene never
// runs that child's update, so childEmit stands in for its events; one
// Play does the real clicks end to end.
//
// Not covered here, deliberately:
// - That an outside press asks nothing (the alert dialog's defining
//   dismissal rule): producing an outside press is mount-internal kit
//   behavior — the kit proves it in its own BrowserHost AlertDialog test;
//   at this level only the RequestedClose mapping is ours to prove, and
//   "close-press" stands in for every reason.
// - Transition flags and focus (initialFocus landing on Cancel): produced
//   by the child's mount/runtime; the kit's Dialog tests own them.
const EditorMessage = UiSchema.TaggedEnum({
  RequestedOpenConfirm: {},
  RequestedCloseConfirm: {},
});

const Editor = Html.component({
  name: "Editor",
  model: Schema.Struct({ confirming: Schema.Boolean }),
  message: EditorMessage,
}).make({
  init: () => ({ confirming: false }),
  update: {
    RequestedOpenConfirm: ($) => $.evolve({ confirming: true }),
    RequestedCloseConfirm: ($) => $.evolve({ confirming: false }),
  },
  view: (h, model) =>
    AlertDialog(h, {
      props: { open: model.confirming },
      onEmit: {
        RequestedOpen: () => EditorMessage.RequestedOpenConfirm(),
        RequestedClose: () => EditorMessage.RequestedCloseConfirm(),
        Settled: () => undefined,
      },
      view: (ad) =>
        h.div(
          AlertDialogTrigger(ad, h.button).children("Discard draft"),
          AlertDialogPortal(ad, h.dialog)?.children(
            AlertDialogOverlay(ad, h.div),
            AlertDialogContent(ad, h.div).children(
              AlertDialogHeader(h).children(
                AlertDialogTitle(ad, h.h2).children("Discard draft?"),
                AlertDialogDescription(ad, h.p).children("You can't undo this."),
              ),
              AlertDialogFooter(h).children(
                ad.initialFocus(AlertDialogCancel(ad, h.button)).children("Cancel"),
                AlertDialogAction(ad, h.button, {
                  variant: "destructive",
                }).children("Discard"),
              ),
            ),
          ),
        ),
    }),
});

const trigger = Locator.attr("data-slot", "alert-dialog-trigger");
const portal = Locator.attr("data-slot", "alert-dialog-portal");
const popup = Locator.attr("data-slot", "alert-dialog-content");
const title = Locator.attr("data-slot", "alert-dialog-title");
const description = Locator.attr("data-slot", "alert-dialog-description");
const action = Locator.attr("data-slot", "alert-dialog-action");
const cancel = Locator.attr("data-slot", "alert-dialog-cancel");

describe("AlertDialog (shadcn-effect port)", () => {
  it.effect("renders closed: the trigger is drawn, the portal and popup are absent", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(Editor, {});
      const attrs = scene.get(trigger).attrs;
      assert.strictEqual(attrs?.["aria-haspopup"], "dialog");
      assert.strictEqual(attrs?.["aria-expanded"], "false");
      assert.isUndefined(scene.query(portal));
      assert.isUndefined(scene.query(popup));
    }),
  );

  it.effect(
    "the child's RequestedOpen flips the consumer Model, and the re-render is an alertdialog with the styled parts",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(Editor, {});
        scene.childEmit(KitDialog, { _tag: "RequestedOpen", triggerId: null });
        assert.strictEqual(scene.get(trigger).attrs?.["aria-expanded"], "true");
        // The kit fixes the portal's role to alertdialog, over anything the
        // consumer chained — the defining trait of the alert variant.
        const portalAttrs = scene.get(portal).attrs;
        assert.strictEqual(portalAttrs?.role, "alertdialog");
        assert.strictEqual(portalAttrs?.["aria-labelledby"], scene.get(title).attrs?.id);
        assert.strictEqual(portalAttrs?.["aria-describedby"], scene.get(description).attrs?.id);
        // Content: slot, default size, and the upstream class tokens (the
        // port exports no content class constant, so the distinctive tokens
        // are pinned rather than the whole string).
        const popupAttrs = scene.get(popup).attrs;
        assert.strictEqual(popupAttrs?.["data-size"], "default");
        assert.isTrue(popupAttrs?.class?.includes("group/alert-dialog-content") ?? false);
        assert.isTrue(popupAttrs?.class?.includes("data-[size=default]:sm:max-w-lg") ?? false);
        scene.expect(title).toHaveText("Discard draft?");
        scene.expect(description).toHaveText("You can't undo this.");
        // Action and Cancel are the kit's close part wearing the shadcn
        // Button classes via buttonVariants — byte-for-byte, no cva.
        const actionAttrs = scene.get(action).attrs;
        assert.strictEqual(actionAttrs?.["data-variant"], "destructive");
        assert.strictEqual(actionAttrs?.["data-size"], "default");
        assert.strictEqual(actionAttrs?.class, buttonVariants({ variant: "destructive" }));
        const cancelAttrs = scene.get(cancel).attrs;
        assert.strictEqual(cancelAttrs?.["data-variant"], "outline");
        assert.strictEqual(cancelAttrs?.["data-size"], "default");
        assert.strictEqual(cancelAttrs?.class, buttonVariants({ variant: "outline" }));
      }),
  );

  it.effect("the child's RequestedClose (close-press) closes it again", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(Editor, {});
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
  // real press on Cancel (the close part) emits RequestedClose.
  it.effect(
    "a Play: a real click on the trigger opens the alertdialog, and a real click on Cancel closes it",
    () =>
      Effect.gen(function* () {
        const play = yield* Play.make(Editor, {});
        yield* play.click(trigger);
        yield* play.expect(trigger).toHaveAttribute("aria-expanded", "true");
        yield* play.expect(portal).toHaveAttribute("role", "alertdialog");
        yield* play.expect(popup).toHaveAttribute("data-slot", "alert-dialog-content");
        yield* play.expect(title).toHaveText("Discard draft?");
        yield* play.click(cancel);
        yield* play.expect(trigger).toHaveAttribute("aria-expanded", "false");
      }).pipe(Effect.provide(TestHost.layer())),
  );
});
