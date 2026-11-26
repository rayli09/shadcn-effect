import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Scene } from "@effect/ui/testing";
import { Popover as KitPopover } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  POPOVER_CONTENT_CLASS,
  POPOVER_DESCRIPTION_CLASS,
  POPOVER_HEADER_CLASS,
  POPOVER_TITLE_CLASS,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../registry/ui/popover.ts";

// The consumer recipe (see tests/README.md): the kit Popover is a headless
// Component, so the consumer owns `open` in its Model and stores what the
// kit's RequestedOpen / RequestedClose events ask for. A Scene never runs
// the child's update, so tests drive it with childEmit (README rule 1) and
// assert the re-render the new props produce.
//
// Untestable in a Scene (declared, not faked): positioning (the positioner's
// left/top and collision flips are written by the kit's TrackPosition mount,
// which a Scene doesn't run), focus movement into/out of the popup, the
// exit transition (in the runtime the popup stays mounted, with
// data-ending-style, until Settled — here the child's Model never leaves
// its init, so closing removes the portal at once), and hover-open timing.
const PopoverMessage = UiSchema.TaggedEnum({
  OpenChanged: { open: Schema.Boolean },
});

const DimensionsCard = Html.component({
  name: "DimensionsCard",
  model: Schema.Struct({ open: Schema.Boolean }),
  message: PopoverMessage,
}).make({
  init: () => ({ open: false }),
  update: {
    OpenChanged: ($, { open }) => $.evolve({ open }),
  },
  view: (h, model) =>
    Popover(h, {
      props: { open: model.open },
      onEmit: {
        RequestedOpen: () => PopoverMessage.OpenChanged({ open: true }),
        RequestedClose: () => PopoverMessage.OpenChanged({ open: false }),
        Settled: () => undefined,
      },
      view: (popover) =>
        h.div(
          PopoverTrigger(popover.trigger({ element: h.button })).children("Set dimensions"),
          popover
            .portal(h.dialog)
            ?.children(
              popover
                .positioner(h.div)
                .children(
                  PopoverContent(popover.popup(h.div)).children(
                    PopoverHeader(h).children(
                      PopoverTitle(h).children("Dimensions"),
                      PopoverDescription(h).children("Set the product size."),
                    ),
                  ),
                ),
            ),
        ),
    }),
});

const trigger = Locator.attr("data-slot", "popover-trigger");
const content = Locator.attr("data-slot", "popover-content");

describe("Popover (shadcn-effect port)", () => {
  it.effect("renders closed: the trigger is stamped, and the portal (and content) are absent", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(DimensionsCard, {});
      scene.expect(trigger).toExist();
      // The kit portal returns undefined while closed (no keepMounted), so
      // the content the consumer draws inside it never renders.
      scene.expect(content).toBeAbsent();
    }),
  );

  it.effect(
    "the child's RequestedOpen flips the consumer Model, and the re-render shows the content open",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(DimensionsCard, {});
        scene.childEmit(KitPopover, {
          _tag: "RequestedOpen",
          triggerId: null,
          reason: "trigger-press",
        });
        const attrs = scene.get(content).attrs;
        assert.strictEqual(attrs?.class, POPOVER_CONTENT_CLASS);
        // The kit popup carries data-open (never Radix's data-state — D-5),
        // and names the side it was placed on: bottom by default.
        assert.strictEqual(attrs?.["data-open"], "");
        assert.isUndefined(attrs?.["data-closed"]);
        assert.strictEqual(attrs?.["data-side"], "bottom");
        assert.strictEqual(attrs?.["data-align"], "center");
        // The trigger now reports the popover open for it.
        assert.strictEqual(scene.get(trigger).attrs?.["data-popup-open"], "");
        assert.strictEqual(scene.get(trigger).attrs?.["aria-expanded"], "true");
        // The pure view helpers inside the content keep their upstream classes.
        assert.strictEqual(
          scene.get(Locator.attr("data-slot", "popover-header")).attrs?.class,
          POPOVER_HEADER_CLASS,
        );
        assert.strictEqual(
          scene.get(Locator.attr("data-slot", "popover-title")).attrs?.class,
          POPOVER_TITLE_CLASS,
        );
        assert.strictEqual(
          scene.get(Locator.attr("data-slot", "popover-description")).attrs?.class,
          POPOVER_DESCRIPTION_CLASS,
        );
      }),
  );

  it.effect("the child's RequestedClose closes it again: the portal leaves the view", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(DimensionsCard, {});
      scene.childEmit(KitPopover, {
        _tag: "RequestedOpen",
        triggerId: null,
        reason: "trigger-press",
      });
      scene.expect(content).toExist();
      scene.childEmit(KitPopover, {
        _tag: "RequestedClose",
        reason: "trigger-press",
      });
      scene.expect(content).toBeAbsent();
      assert.isUndefined(scene.get(trigger).attrs?.["data-popup-open"]);
    }),
  );
});
