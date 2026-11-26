import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Play, Scene, TestHost } from "@effect/ui/testing";
import { ToastProvider as KitToastProvider } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  TOAST_CLASS,
  TOAST_CLOSE_CLASS,
  TOAST_DESCRIPTION_CLASS,
  TOAST_TITLE_CLASS,
  TOASTER_CLASS,
  Toaster,
  toastError,
  toastSuccess,
} from "../registry/ui/sonner.ts";

// The consumer recipe (see tests/README.md), sender edition: there is no
// imperative toast() in Effect UI — a Component below the Toaster posts a
// request from its update with $.send(ToastProvider, toast…(…)), exactly
// as sonner.ts documents. The two roles are two Components, as in the
// kit's own Toast tests: `Poster` is drawn inside the Toaster's view and
// posts from its buttons' updates; `Page` hosts the Toaster and records
// the provider's Dismissed event via onDismissed. The split is forced,
// not stylistic: the hosting component's own update cannot post —
// $.send looks for a ToastProvider *above* the sender and dies with
// "no ToastProvider is above it" (learned by failing, first version of
// this file had one component doing both).
//
// A Scene renders the provider child with its init Model (an empty toast
// list) but never runs its update, so the Scene test pins the empty
// viewport; posting and dismissing cross into the child, so they are
// Plays (README rule 4).
//
// NOT covered here (declared gaps):
// - Timeout dismissal: the provider's timers run on the host clock; a
//   Play asserts the user-dismissal path (close button → Dismissed), not
//   the 5s auto-close.
// - The exit transition's completion (the kit removes the toast when the
//   transition finishes — a host-measured behavior TestHost doesn't
//   drive): after a close click we assert the Dismissed event reached
//   the consumer, not the toast's removal from the tree.
// - toastUpdate / toastClose requests and the loading → done flow: same
//   $.send mechanism as the asserted RequestedAdd, but their visible
//   effect is timer/transition state in the child; left to the kit's own
//   Toast tests.
// - Stacking / limit / swipe / F6 focus behavior: the kit provider's own
//   machinery, proven upstream.

const PosterMessage = UiSchema.TaggedEnum({
  ClickedSave: {},
  ClickedFail: {},
});

const Poster = Html.component({
  name: "Poster",
  model: Schema.Struct({}),
  message: PosterMessage,
}).make({
  init: () => ({}),
  update: {
    ClickedSave: ($) =>
      $.send(
        KitToastProvider,
        toastSuccess("Saved", {
          id: "save-1",
          description: "Your changes are saved.",
        }),
      ),
    ClickedFail: ($) => $.send(KitToastProvider, toastError("Upload failed", { id: "fail-1" })),
  },
  view: (h) =>
    h.div(
      h.button
        .attr("data-slot", "post-save")
        .on("click", PosterMessage.ClickedSave())
        .children("Save"),
      h.button
        .attr("data-slot", "post-fail")
        .on("click", PosterMessage.ClickedFail())
        .children("Fail"),
    ),
});

const PageMessage = UiSchema.TaggedEnum({
  DismissedToast: { id: Schema.String },
});

const Page = Html.component({
  name: "Page",
  model: Schema.Struct({ dismissed: Schema.String }),
  message: PageMessage,
}).make({
  init: () => ({ dismissed: "" }),
  update: {
    DismissedToast: ($, { id }) => $.evolve({ dismissed: id }),
  },
  view: (h, model) =>
    Toaster(h, {
      closeButton: true,
      onDismissed: ({ id }) => PageMessage.DismissedToast({ id }),
      view: () =>
        h.div(Poster(h, {}), h.output.attr("data-slot", "dismissed").children(model.dismissed)),
    }),
});

const viewport = Locator.attr("data-theme", "system");
const postSave = Locator.attr("data-slot", "post-save");
const postFail = Locator.attr("data-slot", "post-fail");
const successToast = Locator.attr("data-type", "success");
const errorToast = Locator.attr("data-type", "error");
const toastContent = Locator.attr("class", TOAST_CLASS);
const toastTitle = Locator.attr("class", TOAST_TITLE_CLASS);
const toastDescription = Locator.attr("class", TOAST_DESCRIPTION_CLASS);
const closeButton = Locator.attr("aria-label", "Close");
const dismissed = Locator.attr("data-slot", "dismissed");

describe("Sonner / Toaster (shadcn-effect port)", () => {
  it.effect("renders the empty viewport: upstream class, CSS vars, position and theme stamp", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(Page, {});
      const attrs = scene.get(viewport).attrs;
      // Upstream's "toaster group" leads the class list; the port appends
      // its layout classes after it.
      assert.isTrue((attrs?.class ?? "").startsWith(TOASTER_CLASS + " "));
      // Upstream's four CSS variables, then the bottom-right inset.
      assert.include(attrs?.style ?? "", "--normal-bg:var(--popover)");
      assert.include(attrs?.style ?? "", "--normal-text:var(--popover-foreground)");
      assert.include(attrs?.style ?? "", "--normal-border:var(--border)");
      assert.include(attrs?.style ?? "", "--border-radius:var(--radius)");
      assert.include(attrs?.style ?? "", "inset:auto 1rem 1rem auto");
      // No toasts yet.
      assert.isUndefined(scene.query(successToast));
      assert.isUndefined(scene.query(errorToast));
    }),
  );

  it.effect(
    "a Play: posting a success toast renders it with title, description, icon and the port's classes",
    () =>
      Effect.gen(function* () {
        const play = yield* Play.make(Page, {});
        yield* play.click(postSave);
        yield* play.expect(successToast).toExist();
        // Title and description wear the port's class constants verbatim.
        yield* play.expect(toastTitle).toHaveText("Saved");
        yield* play.expect(toastDescription).toHaveText("Your changes are saved.");
        yield* play.expect(toastContent).toHaveAttribute("class", TOAST_CLASS);
        // The success icon is an inline SVG (CircleCheck, lucide path data).
        yield* play.expect(Locator.tag("svg")).toExist();
      }).pipe(Effect.provide(TestHost.layer())),
  );

  it.effect("a Play: posting an error toast renders it with its own type", () =>
    Effect.gen(function* () {
      const play = yield* Play.make(Page, {});
      yield* play.click(postFail);
      yield* play.expect(errorToast).toExist();
      yield* play.expect(toastTitle).toHaveText("Upload failed");
      yield* play.expect(successToast).toHaveCount(0);
    }).pipe(Effect.provide(TestHost.layer())),
  );

  it.effect("a Play: the close button dismisses the toast and Dismissed reaches the consumer", () =>
    Effect.gen(function* () {
      const play = yield* Play.make(Page, {});
      yield* play.click(postSave);
      yield* play.expect(successToast).toExist();
      yield* play.expect(closeButton).toHaveAttribute("class", TOAST_CLOSE_CLASS);
      yield* play.click(closeButton);
      // The provider emitted Dismissed { id: "save-1" } and the
      // consumer's onDismissed mapping stored it — the flow a real app
      // uses to react to a dismissal. (The toast's exit-transition
      // removal is host-driven; see the header's declared gaps.)
      yield* play.expect(dismissed).toHaveText("save-1");
    }).pipe(Effect.provide(TestHost.layer())),
  );
});
