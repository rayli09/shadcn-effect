import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Scene } from "@effect/ui/testing";
import { Tooltip as KitTooltip } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  TOOLTIP_ARROW_CLASS,
  TOOLTIP_CONTENT_CLASS,
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../registry/ui/tooltip.ts";

// The consumer recipe (see tests/README.md): the kit Tooltip is a headless
// Component, so the consumer owns `open` in its Model and stores what the
// kit's RequestedOpen / RequestedClose events ask for. A Scene never runs
// the child's update, so tests drive it with childEmit (README rule 1) and
// assert the re-render the new props produce. Unlike a popover, the
// tooltip's positioner and popup stay in the view while closed — the
// top-layer popover hides them — so "closed" here is data-closed on the
// content, not absence.
//
// Untestable in a Scene (declared, not faked):
// - The `delay` prop: it is consumed by the kit's internal WaitBeforeOpening
//   timer and carried by no rendered attribute, so nothing in a Scene (or a
//   server render) can observe it. The consumer below passes `delay: 0`
//   (shadcn's effective provider default) and the tests pin everything
//   around it that does render; the timing itself is the kit's own
//   headless tests' job.
// - The provider's group behavior (a second hover opening instantly within
//   `timeout`, one tooltip replacing another): it runs on the provider's
//   collected reports and Commands, which need the runtime — a Play, not a
//   Scene. What a Scene can prove is that the tooltip renders and behaves
//   identically below the provider, which is the port's contract.
// - Positioning and the hover/focus timing that produce RequestedOpen in
//   the first place (mounts and timers a Scene doesn't run).
const TooltipMessage = UiSchema.TaggedEnum({
  OpenChanged: { open: Schema.Boolean },
});

const BoldToolbar = Html.component({
  name: "BoldToolbar",
  model: Schema.Struct({ open: Schema.Boolean }),
  message: TooltipMessage,
}).make({
  init: () => ({ open: false }),
  update: {
    OpenChanged: ($, { open }) => $.evolve({ open }),
  },
  view: (h, model) =>
    TooltipProvider(h, {
      props: { timeout: 400 },
      view: () =>
        Tooltip(h, {
          props: { open: model.open, delay: 0 },
          onEmit: {
            RequestedOpen: () => TooltipMessage.OpenChanged({ open: true }),
            RequestedClose: () => TooltipMessage.OpenChanged({ open: false }),
          },
          view: (tooltip) =>
            h.div(
              TooltipTrigger(tooltip.trigger(h.button.attr("aria-label", "Bold"))).children("B"),
              tooltip
                .positioner(h.div)
                .children(
                  TooltipContent(tooltip.popup(h.div)).children(
                    TooltipArrow(tooltip.arrow(h.div)),
                    "Bold",
                  ),
                ),
            ),
        }),
    }),
});

const trigger = Locator.attr("data-slot", "tooltip-trigger");
const content = Locator.attr("data-slot", "tooltip-content");

describe("Tooltip (shadcn-effect port)", () => {
  it.effect(
    "renders closed below the provider: trigger stamped, content present but data-closed",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(BoldToolbar, {});
        scene.expect(trigger).toExist();
        const attrs = scene.get(content).attrs;
        assert.strictEqual(attrs?.class, TOOLTIP_CONTENT_CLASS);
        // The kit popup carries data-closed (never Radix's data-state — D-5),
        // and names its default side: top.
        assert.strictEqual(attrs?.["data-closed"], "");
        assert.isUndefined(attrs?.["data-open"]);
        assert.strictEqual(attrs?.["data-side"], "top");
        assert.isUndefined(scene.get(trigger).attrs?.["data-popup-open"]);
        // The arrow keeps upstream's class string (it has no data-slot).
        assert.strictEqual(
          scene.get(Locator.attr("class", TOOLTIP_ARROW_CLASS)).attrs?.class,
          TOOLTIP_ARROW_CLASS,
        );
      }),
  );

  it.effect(
    "the child's RequestedOpen flips the consumer Model, and the re-render shows the content open",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(BoldToolbar, {});
        // The Tooltip is a grandchild here (below the TooltipProvider), and
        // childEmit still finds it by component.
        scene.childEmit(KitTooltip, { _tag: "RequestedOpen" });
        const attrs = scene.get(content).attrs;
        assert.strictEqual(attrs?.["data-open"], "");
        assert.isUndefined(attrs?.["data-closed"]);
        assert.strictEqual(attrs?.class, TOOLTIP_CONTENT_CLASS);
        assert.strictEqual(scene.get(trigger).attrs?.["data-popup-open"], "");
      }),
  );

  it.effect("the child's RequestedClose closes it again: data-closed returns", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(BoldToolbar, {});
      scene.childEmit(KitTooltip, { _tag: "RequestedOpen" });
      scene.expect(content).toHaveAttribute("data-open", "");
      scene.childEmit(KitTooltip, { _tag: "RequestedClose" });
      const attrs = scene.get(content).attrs;
      assert.strictEqual(attrs?.["data-closed"], "");
      assert.isUndefined(attrs?.["data-open"]);
      assert.isUndefined(scene.get(trigger).attrs?.["data-popup-open"]);
    }),
  );
});
