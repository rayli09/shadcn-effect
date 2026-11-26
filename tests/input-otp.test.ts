import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { HtmlLocator } from "@effect/ui/html/testing";
import { Locator, Scene } from "@effect/ui/testing";
import { OTPField as KitOTPField } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Redacted, Schema } from "effect";
import {
  INPUT_OTP_CONTAINER_CLASS,
  INPUT_OTP_SLOT_CLASS,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../registry/ui/input-otp.ts";

// The consumer recipe (see tests/README.md): the port wraps the kit
// OTPField headless component, so a test defines the smallest consumer
// Component that owns the code — a Redacted<string>, as the kit's value
// is — and drives the kit child with childEmit.
//
// Declared untestable here: WHEN the kit decides a code is complete is
// the kit OTPField's own update (it answers an accepted edit once the
// consumer stores it, via its settled subscription), and a Scene never
// runs a child's update — so `Completed` is stood in for with childEmit
// exactly as the kit would emit it after the storing render, and what is
// tested is the consumer-side contract: Updated fills the slots through
// the Model, and Completed reaches the consumer's handler with the
// stored code. Slot focus movement, paste and rejection *detection*
// are likewise the kit's (its own tests cover them); the Rejected test
// below pins only that the port forwards the event and the code is
// untouched by it.

const Code = Schema.Redacted(Schema.String);

const VerifyMessage = UiSchema.TaggedEnum({
  UpdatedCode: { value: Code },
  CompletedCode: { value: Code },
  RejectedEntry: {},
});

const Verify = Html.component({
  name: "Verify",
  props: Schema.Struct({ disabled: Schema.optional(Schema.Boolean) }),
  model: Schema.Struct({
    code: Code,
    completed: Schema.NullOr(Schema.String),
    rejections: Schema.Number,
  }),
  message: VerifyMessage,
}).make({
  init: () => ({ code: Redacted.make(""), completed: null, rejections: 0 }),
  update: {
    UpdatedCode: ($, { value }) => $.evolve({ code: value }),
    CompletedCode: ($, { value }) => $.evolve({ completed: Redacted.value(value) }),
    RejectedEntry: ($) => $.evolve({ rejections: (n) => n + 1 }),
  },
  view: (h, model) =>
    h.div.children(
      InputOTP(h, {
        props: {
          value: model.code,
          length: 4,
          name: "code",
          disabled: h.props.disabled,
        },
        onEmit: {
          Updated: ({ value }) => VerifyMessage.UpdatedCode({ value }),
          Completed: ({ value }) => VerifyMessage.CompletedCode({ value }),
          Rejected: () => VerifyMessage.RejectedEntry(),
        },
        view: (otp) =>
          otp
            .root(h.div)
            .children(
              InputOTPGroup(h).children(
                InputOTPSlot(otp, { element: h.input, index: 0 }),
                InputOTPSlot(otp, { element: h.input, index: 1 }),
                InputOTPSlot(otp, { element: h.input, index: 2 }),
                InputOTPSlot(otp, { element: h.input, index: 3 }),
              ),
            ),
      }),
      h.span.attr("data-slot", "completed-status").children(model.completed ?? "none"),
      h.span.attr("data-slot", "rejections-status").children(`rejected ${model.rejections}`),
    ),
});

const root = Locator.attr("data-slot", "input-otp");
const slot = Locator.attr("data-slot", "input-otp-slot");
const group = Locator.attr("data-slot", "input-otp-group");
// The root carries data-filled too, so filled slots are counted inside
// the group, where only slots live.
const filledSlot = Locator.inside(group, Locator.attr("data-filled", ""));
// The last slot is the only one with enterkeyhint="done" — a unique
// locator for one representative slot.
const lastSlot = Locator.attr("enterkeyhint", "done");
const hiddenInput = Locator.attr("name", "code");
const completedStatus = Locator.attr("data-slot", "completed-status");
const rejectionsStatus = Locator.attr("data-slot", "rejections-status");

describe("InputOTP (shadcn-effect port)", () => {
  it.effect(
    "renders empty: container class on the root, four slots with the slot class, no filled or complete flags",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(Verify, {});
        const rootAttrs = scene.get(root).attrs;
        assert.strictEqual(rootAttrs?.class, INPUT_OTP_CONTAINER_CLASS);
        assert.strictEqual(rootAttrs?.role, "group");
        assert.isUndefined(rootAttrs?.["data-filled"]);
        assert.isUndefined(rootAttrs?.["data-complete"]);
        scene.expect(slot).toHaveCount(4);
        assert.include(scene.get(lastSlot).attrs?.class ?? "", INPUT_OTP_SLOT_CLASS);
        scene.expect(filledSlot).toBeAbsent();
        // The kit's hidden whole-code input carries the form name; its
        // value is a property, not an attribute record entry.
        assert.strictEqual(HtmlLocator.value(scene.get(hiddenInput)), "");
      }),
  );

  it.effect(
    "Updated fills the slots through the Model; at full length the root is complete and Completed reaches the consumer",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(Verify, {});
        // A Scene never runs the kit child's update, so typing is stood
        // in for by what the child emits for each accepted edit.
        scene.childEmit(KitOTPField, {
          _tag: "Updated",
          value: Redacted.make("12"),
          reason: "input-change",
        });
        assert.strictEqual(scene.get(root).attrs?.["data-filled"], "");
        assert.isUndefined(scene.get(root).attrs?.["data-complete"]);
        scene.expect(filledSlot).toHaveCount(2);
        assert.strictEqual(HtmlLocator.value(scene.get(hiddenInput)), "12");

        scene.childEmit(KitOTPField, {
          _tag: "Updated",
          value: Redacted.make("1234"),
          reason: "input-change",
        });
        assert.strictEqual(scene.get(root).attrs?.["data-complete"], "");
        scene.expect(filledSlot).toHaveCount(4);
        assert.strictEqual(HtmlLocator.value(scene.get(hiddenInput)), "1234");

        // The kit emits Completed once the storing render settles (its
        // own update runs that check, not the Scene) — stand in for it.
        scene.expect(completedStatus).toHaveText("none");
        scene.childEmit(KitOTPField, {
          _tag: "Completed",
          value: Redacted.make("1234"),
          reason: "input-change",
        });
        scene.expect(completedStatus).toHaveText("1234");
      }),
  );

  it.effect("edge: a Rejected entry is forwarded and leaves the stored code untouched", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(Verify, {});
      scene.childEmit(KitOTPField, {
        _tag: "Updated",
        value: Redacted.make("12"),
        reason: "input-change",
      });
      // The user typed a letter into a numeric field: the kit drops it
      // and emits Rejected with the text as entered.
      scene.childEmit(KitOTPField, {
        _tag: "Rejected",
        value: Redacted.make("12a"),
        reason: "input-change",
      });
      scene.expect(rejectionsStatus).toHaveText("rejected 1");
      assert.strictEqual(HtmlLocator.value(scene.get(hiddenInput)), "12");
      scene.expect(filledSlot).toHaveCount(2);
    }),
  );

  it.effect("edge: a disabled field stamps data-disabled on the root and every slot", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(Verify, { disabled: true });
      assert.strictEqual(scene.get(root).attrs?.["data-disabled"], "");
      scene.expect(slot).toHaveCount(4);
      assert.strictEqual(scene.get(lastSlot).attrs?.["data-disabled"], "");
      assert.strictEqual(scene.get(lastSlot).attrs?.disabled, "");
    }),
  );
});
