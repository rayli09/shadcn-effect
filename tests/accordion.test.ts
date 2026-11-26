import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Play, Scene, TestHost } from "@effect/ui/testing";
import { Accordion as KitAccordion } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  ACCORDION_CONTENT_CLASS,
  ACCORDION_CONTENT_INNER_CLASS,
  ACCORDION_CONTENT_STATE_CLASS,
  ACCORDION_ITEM_CLASS,
  ACCORDION_TRIGGER_CLASS,
  ACCORDION_TRIGGER_OPEN_CLASS,
  Accordion,
  AccordionChevron,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../registry/ui/accordion.ts";

// The consumer recipe (see tests/README.md): our port is view functions
// over the kit Accordion + AccordionItem headless Components, so the test
// defines the smallest consumer Component that owns the open values in
// its Model, maps the kit's `Toggled` event to its own Message, and
// stores the value it reports.
//
// Declared gaps (see the port's header): the kit writes `data-open` /
// `data-closed` / `data-panel-open`, never Radix's `data-state`, so the
// upstream `data-[state=…]` tokens in the class strings stay inert; the
// port adds kit-state equivalents alongside (ACCORDION_*_STATE / _OPEN
// classes), and these tests pin both halves of that arrangement. The
// single-open behavior (opening one item closes the others) is computed
// by the kit Accordion's own update from ToggledItem messages — a Scene
// never runs a child's update, so here it is exercised only as the
// controlled re-render of the value the child emits; the end-to-end
// click through the item chain is the Play test below.
const FaqMessage = UiSchema.TaggedEnum({
  ToggledQuestions: { open: Schema.Array(Schema.String) },
});

const Faq = Html.component({
  name: "Faq",
  props: Schema.Struct({
    disabled: Schema.optional(Schema.Boolean),
    startOpen: Schema.optional(Schema.Boolean),
  }),
  model: Schema.Struct({ open: Schema.Array(Schema.String) }),
  message: FaqMessage,
}).make({
  init: ($) => ({ open: $.props.startOpen === true ? ["shipping"] : [] }),
  update: {
    ToggledQuestions: ($, { open }) => $.evolve({ open }),
  },
  view: (h, model) =>
    Accordion(h, {
      props: { value: model.open, disabled: h.props.disabled },
      onEmit: {
        Toggled: ({ value }) => FaqMessage.ToggledQuestions({ open: value }),
      },
      view: (accordion) =>
        accordion.root(h.div).children(
          AccordionItem(h, {
            key: "shipping",
            props: { value: "shipping", index: 0 },
            view: (item) =>
              item
                .root(h.div)
                .children(
                  item
                    .header(h.h3)
                    .children(
                      AccordionTrigger(item, h.button).children(
                        "How long does shipping take?",
                        AccordionChevron(h),
                      ),
                    ),
                  AccordionContent(item, h.div)?.children(
                    h.div.class(ACCORDION_CONTENT_INNER_CLASS).children("3 to 5 days."),
                  ),
                ),
          }),
        ),
    }),
});

const root = Locator.attr("data-slot", "accordion");
const itemRoot = Locator.attr("data-slot", "accordion-item");
const trigger = Locator.attr("data-slot", "accordion-trigger");
const content = Locator.attr("data-slot", "accordion-content");
const inner = Locator.attr("class", ACCORDION_CONTENT_INNER_CLASS);

describe("Accordion (shadcn-effect port)", () => {
  it.effect(
    "renders closed: data-slots, upstream classes, aria-expanded false, and no panel in the page",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(Faq, {});
        const rootAttrs = scene.get(root).attrs;
        assert.strictEqual(rootAttrs?.["data-orientation"], "vertical");
        assert.isUndefined(rootAttrs?.["data-disabled"]);
        const itemAttrs = scene.get(itemRoot).attrs;
        assert.strictEqual(itemAttrs?.["data-closed"], "");
        assert.isUndefined(itemAttrs?.["data-open"]);
        // cn() with no extra class returns the upstream string verbatim.
        assert.strictEqual(itemAttrs?.class, ACCORDION_ITEM_CLASS);
        const triggerAttrs = scene.get(trigger).attrs;
        assert.strictEqual(triggerAttrs?.["aria-expanded"], "false");
        assert.isUndefined(triggerAttrs?.["data-panel-open"]);
        // The trigger class is the upstream string plus the port's declared
        // kit-state chevron bridge, joined by cn().
        assert.strictEqual(
          triggerAttrs?.class,
          `${ACCORDION_TRIGGER_CLASS} ${ACCORDION_TRIGGER_OPEN_CLASS}`,
        );
        // The closed panel is not rendered at all (no keepMounted).
        assert.isUndefined(scene.query(content));
      }),
  );

  it.effect(
    "the child's Toggled event flips the consumer Model, and the re-render shows the open item",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(Faq, {});
        // A Scene never runs a child's update, so a click on the trigger —
        // whose handlers live in the kit AccordionItem's inner Collapsible —
        // is refused. The Scene idiom is childEmit: stand in for what the
        // Accordion child emits (its update computes this value from the
        // item's ToggledItem), and the consumer's onEmit mapping + update
        // run for real. (A real click is the Play test below.)
        scene.childEmit(KitAccordion, {
          _tag: "Toggled",
          value: ["shipping"],
          reason: "trigger-press",
        });
        const itemAttrs = scene.get(itemRoot).attrs;
        assert.strictEqual(itemAttrs?.["data-open"], "");
        assert.isUndefined(itemAttrs?.["data-closed"]);
        const triggerAttrs = scene.get(trigger).attrs;
        assert.strictEqual(triggerAttrs?.["aria-expanded"], "true");
        assert.strictEqual(triggerAttrs?.["data-panel-open"], "");
        const contentAttrs = scene.get(content).attrs;
        assert.strictEqual(contentAttrs?.role, "region");
        assert.strictEqual(contentAttrs?.["data-open"], "");
        // Upstream content classes plus the port's kit-state animation
        // equivalents, joined by cn().
        assert.strictEqual(
          contentAttrs?.class,
          `${ACCORDION_CONTENT_CLASS} ${ACCORDION_CONTENT_STATE_CLASS}`,
        );
        // The trigger's aria-controls points at the panel's id.
        assert.strictEqual(triggerAttrs?.["aria-controls"], contentAttrs?.id);
        scene.expect(inner).toHaveText("3 to 5 days.");
        // And back again: the port is controlled, so the next Toggled asks
        // for the empty value and the consumer stores it; the panel leaves
        // the page.
        scene.childEmit(KitAccordion, {
          _tag: "Toggled",
          value: [],
          reason: "trigger-press",
        });
        assert.strictEqual(scene.get(itemRoot).attrs?.["data-closed"], "");
        assert.strictEqual(scene.get(trigger).attrs?.["aria-expanded"], "false");
        assert.isUndefined(scene.query(content));
      }),
  );

  it.effect(
    "renders open from the start when the consumer's Model starts with the item's value",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(Faq, { startOpen: true });
        assert.strictEqual(scene.get(itemRoot).attrs?.["data-open"], "");
        assert.strictEqual(scene.get(trigger).attrs?.["aria-expanded"], "true");
        assert.strictEqual(scene.get(content).attrs?.["data-open"], "");
      }),
  );

  it.effect("a disabled accordion renders disabled on the root, the item, and the trigger", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(Faq, { disabled: true });
      assert.strictEqual(scene.get(root).attrs?.["data-disabled"], "");
      assert.strictEqual(scene.get(itemRoot).attrs?.["data-disabled"], "");
      const triggerAttrs = scene.get(trigger).attrs;
      assert.strictEqual(triggerAttrs?.disabled, "");
      assert.strictEqual(triggerAttrs?.["data-disabled"], "");
      assert.strictEqual(triggerAttrs?.["aria-expanded"], "false");
      assert.isUndefined(scene.query(content));
    }),
  );

  // A Play mounts the component on TestHost with the runtime running, so
  // the whole child chain updates for real — Collapsible → AccordionItem
  // → Accordion → consumer — and a real click reaches it: the one thing a
  // Scene cannot do with headless children.
  it.effect(
    "a Play: a real click toggles the item, and a disabled accordion ignores the click",
    () =>
      Effect.gen(function* () {
        const play = yield* Play.make(Faq, {});
        yield* play.click(trigger);
        yield* play.expect(trigger).toHaveAttribute("aria-expanded", "true");
        yield* play.expect(itemRoot).toHaveAttribute("data-open", "");
        yield* play.expect(content).toExist();
        yield* play.click(trigger);
        yield* play.expect(trigger).toHaveAttribute("aria-expanded", "false");
        yield* play.expect(itemRoot).toHaveAttribute("data-closed", "");

        const disabled = yield* Play.make(Faq, { disabled: true });
        yield* disabled.click(trigger);
        // No expectIgnored: the click does produce the inner Collapsible's
        // internal message — the chain swallows it (disabled), no Toggled
        // reaches the consumer, and the Model never moves. In a browser the
        // native disabled attribute stops the click from arriving at all.
        yield* disabled.expect(trigger).toHaveAttribute("aria-expanded", "false");
        yield* disabled.expect(itemRoot).toHaveAttribute("data-closed", "");
      }).pipe(Effect.provide(TestHost.layer())),
  );
});
