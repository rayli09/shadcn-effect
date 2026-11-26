import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Scene } from "@effect/ui/testing";
import { PreviewCard as KitPreviewCard } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  HOVER_CARD_CONTENT_CLASS,
  HoverCard,
  HoverCardContent,
  HoverCardPortal,
  HoverCardTrigger,
} from "../registry/ui/hover-card.ts";

// The consumer recipe (see tests/README.md): the kit PreviewCard is a
// headless Component, so the consumer owns `open` in its Model and stores
// what the kit's RequestedOpen / RequestedClose events ask for. A Scene
// never runs the child's update, so tests drive it with childEmit (README
// rule 1) and assert the re-render the new props produce.
//
// Untestable in a Scene (declared, not faked): the hover/focus timing that
// produces RequestedOpen (the trigger's delay — 600 ms kit default, set per
// trigger part — runs on a Command timer), positioning (written by the
// kit's TrackPreviewCard mount), and the exit transition (in the runtime
// the portal stays mounted, with data-ending-style, until Settled — here
// the child's Model never leaves its init, so closing removes the portal
// at once). Focus never moves into the popup; that, too, is runtime
// behavior the kit's own tests own.
const HoverCardMessage = UiSchema.TaggedEnum({
  Opened: { triggerId: Schema.NullOr(Schema.String) },
  Closed: {},
});

const ProfileLink = Html.component({
  name: "ProfileLink",
  model: Schema.Struct({
    open: Schema.Boolean,
    triggerId: Schema.NullOr(Schema.String),
  }),
  message: HoverCardMessage,
}).make({
  init: () => ({ open: false, triggerId: null }),
  update: {
    // The kit's documented pattern: store the triggerId RequestedOpen
    // reports and pass it back as a prop — it is what lets the trigger
    // part know the card is open for *it* (data-popup-open).
    Opened: ($, { triggerId }) => $.evolve({ open: true, triggerId }),
    Closed: ($) => $.evolve({ open: false }),
  },
  view: (h, model) =>
    HoverCard(h, {
      props: { open: model.open, triggerId: model.triggerId },
      onEmit: {
        RequestedOpen: ({ triggerId }) => HoverCardMessage.Opened({ triggerId }),
        RequestedClose: () => HoverCardMessage.Closed(),
        Settled: () => undefined,
      },
      view: (previewCard) =>
        h.div(
          HoverCardTrigger(
            previewCard.trigger({
              element: h.a.attr("id", "profile-trigger").attr("href", "https://github.com/vercel"),
            }),
          ).children("@vercel"),
          HoverCardPortal(previewCard.portal(h.div))?.children(
            previewCard
              .positioner(h.div)
              .children(
                HoverCardContent(previewCard.popup(h.div)).children("Vercel — the Frontend Cloud."),
              ),
          ),
        ),
    }),
});

const trigger = Locator.attr("data-slot", "hover-card-trigger");
const portal = Locator.attr("data-slot", "hover-card-portal");
const content = Locator.attr("data-slot", "hover-card-content");

describe("HoverCard (shadcn-effect port)", () => {
  it.effect(
    "renders closed: the trigger link is stamped, and the portal (and content) are absent",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(ProfileLink, {});
        scene.expect(trigger).toExist();
        assert.strictEqual(scene.get(trigger).attrs?.href, "https://github.com/vercel");
        // The kit portal returns undefined while closed (no keepMounted), so
        // neither the portal nor the content inside it renders.
        scene.expect(portal).toBeAbsent();
        scene.expect(content).toBeAbsent();
      }),
  );

  it.effect(
    "the child's RequestedOpen flips the consumer Model, and the re-render shows the card open",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(ProfileLink, {});
        scene.childEmit(KitPreviewCard, {
          _tag: "RequestedOpen",
          triggerId: "profile-trigger",
          reason: "trigger-hover",
        });
        scene.expect(portal).toExist();
        const attrs = scene.get(content).attrs;
        assert.strictEqual(attrs?.class, HOVER_CARD_CONTENT_CLASS);
        // The kit popup carries data-open (never Radix's data-state — D-5),
        // and names the side it was placed on: bottom by default.
        assert.strictEqual(attrs?.["data-open"], "");
        assert.isUndefined(attrs?.["data-closed"]);
        assert.strictEqual(attrs?.["data-side"], "bottom");
        assert.strictEqual(attrs?.["data-align"], "center");
        // The trigger now reports the card open for it.
        assert.strictEqual(scene.get(trigger).attrs?.["data-popup-open"], "");
      }),
  );

  it.effect("the child's RequestedClose closes it again: the portal leaves the view", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(ProfileLink, {});
      scene.childEmit(KitPreviewCard, {
        _tag: "RequestedOpen",
        triggerId: "profile-trigger",
        reason: "trigger-hover",
      });
      scene.expect(content).toExist();
      scene.childEmit(KitPreviewCard, {
        _tag: "RequestedClose",
        reason: "escape-key",
      });
      scene.expect(portal).toBeAbsent();
      scene.expect(content).toBeAbsent();
      assert.isUndefined(scene.get(trigger).attrs?.["data-popup-open"]);
    }),
  );
});
