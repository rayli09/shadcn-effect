import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { HtmlScene } from "@effect/ui/html/testing";
import { Locator, Play, Scene, TestHost } from "@effect/ui/testing";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { cn } from "../registry/lib/utils.ts";
import {
  CAROUSEL_NEXT_BASE as BASES_NEXT_BASE,
  CAROUSEL_PREVIOUS_BASE as BASES_PREVIOUS_BASE,
  Carousel as BasesCarousel,
  CarouselContent as BasesCarouselContent,
  CarouselItem as BasesCarouselItem,
  CarouselNext as BasesCarouselNext,
  CarouselPrevious as BasesCarouselPrevious,
  carouselTrackClass as basesTrackClass,
} from "../registry/bases/ui/carousel.ts";
import { buttonVariants as basesButtonVariants } from "../registry/bases/ui/button.ts";
import { buttonVariants } from "../registry/ui/button.ts";
import {
  CAROUSEL_CONTENT_CLASS,
  CAROUSEL_NEXT_CLASS,
  CAROUSEL_PREVIOUS_CLASS,
  CAROUSEL_ROOT_CLASS,
  Carousel,
  CarouselContent,
  CarouselEvents,
  CarouselItem,
  CarouselMessage,
  CarouselNext,
  CarouselPrevious,
  CarouselTrack,
  carouselItemClass,
  carouselTrackClass,
  type CarouselParts,
} from "../registry/ui/carousel.ts";

// Carousel (wave 7, D-4 lifted) — see tests/README.md for the recipe.
//
// The port is a native headless Component (no kit carousel exists), so
// it is tested two ways:
// - Root Scenes via HtmlScene.make(Carousel, props, { view }) — the
//   kit's own idiom for headless components — where the Carousel IS the
//   scene's component: its update runs, part clicks fire, and the track
//   Mount is acknowledged by name (`scene.mounted` delivers a mount
//   result as a message; `scene.expectMount` acknowledges it as
//   running).
// - A consumer Play for the hosted walk (children update for real) and
//   the `Selected` event reaching the consumer's Model.
//
// Declared gaps:
// - The track Mount's DOM work (counting children, scroll sync,
//   scrollTo) cannot run here: TestHost nodes are not real elements and
//   the mount body feature-checks out. Registration is therefore
//   exercised as the message it produces (mounted(RegisterItems)) and
//   via the `count` prop seed; scroll-driven `Scrolled` is the same
//   goTo path as Next/Previous/GoTo and is not separately driven.
// - At a loop=false edge the disabled button is asserted by attribute
//   only: the part's click handler stays registered (a browser's
//   native disabled button would not fire it), so firing it in a Scene
//   would test the harness, not the port.

const key = (key: string) => ({
  key,
  shift: false,
  ctrl: false,
  alt: false,
  meta: false,
  composing: false,
  selectionStart: null,
  selectionEnd: null,
});

const root = Locator.attr("data-slot", "carousel");
const content = Locator.attr("data-slot", "carousel-content");
const item = Locator.attr("data-slot", "carousel-item");
const previous = Locator.attr("data-slot", "carousel-previous");
const next = Locator.attr("data-slot", "carousel-next");
const position = Locator.attr("data-slot", "position");
const slide1 = Locator.text("Slide 1", { exact: true });
const track = (orientation: "horizontal" | "vertical") =>
  Locator.attr("class", carouselTrackClass(orientation));

const slides = <Msg>(c: CarouselParts, h: Html.H<Msg>) => [
  CarouselItem(c, h).children("Slide 1"),
  CarouselItem(c, h).children("Slide 2"),
  CarouselItem(c, h).children("Slide 3"),
];

const standInView = (c: CarouselParts, h: Html.H<never>) =>
  c
    .root(h.div)
    .children(
      CarouselContent(c, h, {}, slides(c, h)),
      CarouselPrevious(c, h),
      CarouselNext(c, h),
      h.output.attr("data-slot", "position").children(`${c.index} of ${c.count}`),
    );

const previousClass = (orientation: "horizontal" | "vertical") =>
  cn(
    buttonVariants({ variant: "outline", size: "icon" }),
    "absolute size-8 rounded-full",
    CAROUSEL_PREVIOUS_CLASS[orientation],
  );

const nextClass = (orientation: "horizontal" | "vertical") =>
  cn(
    buttonVariants({ variant: "outline", size: "icon" }),
    "absolute size-8 rounded-full",
    CAROUSEL_NEXT_CLASS[orientation],
  );

describe("Carousel (new-york generation)", () => {
  it.effect("registers items through the track mount, enabling Next", () =>
    Effect.gen(function* () {
      const scene = yield* HtmlScene.make(Carousel, {}, { elements: Html, view: standInView });
      // Before registration the Model has no slides: both buttons are
      // disabled, exactly like upstream's initial canScroll* = false.
      scene.expect(position).toHaveText("0 of 0");
      assert.isDefined(scene.get(previous).attrs?.disabled);
      assert.isDefined(scene.get(next).attrs?.disabled);
      // The mount's registration result arrives as its message.
      scene.mounted(CarouselTrack, CarouselMessage.RegisterItems({ count: 3 }));
      scene.expect(position).toHaveText("0 of 3");
      assert.isDefined(scene.get(previous).attrs?.disabled);
      assert.isUndefined(scene.get(next).attrs?.disabled);
    }),
  );

  it.effect("initial render: anatomy, classes, ARIA — count seeded by prop", () =>
    Effect.gen(function* () {
      const scene = yield* HtmlScene.make(
        Carousel,
        { count: 3 },
        { elements: Html, view: standInView },
      );
      scene.expectMount(CarouselTrack({ index: 0, orientation: "horizontal" }));
      const rootAttrs = scene.get(root).attrs;
      assert.strictEqual(rootAttrs?.class, CAROUSEL_ROOT_CLASS);
      assert.strictEqual(rootAttrs?.role, "region");
      assert.strictEqual(rootAttrs?.["aria-roledescription"], "carousel");
      assert.strictEqual(scene.get(content).attrs?.class, CAROUSEL_CONTENT_CLASS);
      scene.expect(item).toHaveCount(3);
      const itemAttrs = scene.get(slide1).attrs;
      assert.strictEqual(itemAttrs?.class, carouselItemClass("horizontal"));
      assert.strictEqual(itemAttrs?.role, "group");
      assert.strictEqual(itemAttrs?.["aria-roledescription"], "slide");
      assert.strictEqual(scene.get(previous).attrs?.class, previousClass("horizontal"));
      assert.strictEqual(scene.get(next).attrs?.class, nextClass("horizontal"));
      assert.strictEqual(scene.get(previous).attrs?.["data-variant"], "outline");
      assert.strictEqual(scene.get(previous).attrs?.["data-size"], "icon");
      scene.expect(position).toHaveText("0 of 3");
    }),
  );

  it.effect("next/previous walk, loop=false edges, arrow keys", () =>
    Effect.gen(function* () {
      const scene = yield* HtmlScene.make(
        Carousel,
        { count: 3 },
        { elements: Html, view: standInView },
      );
      scene.expectMount(CarouselTrack({ index: 0, orientation: "horizontal" }));
      scene.fire(next, "click").emitted(CarouselEvents.Selected({ index: 1 }));
      scene.expect(position).toHaveText("1 of 3");
      assert.isUndefined(scene.get(previous).attrs?.disabled);
      scene
        .fire(root, "keydown", key("ArrowRight"))
        .emitted(CarouselEvents.Selected({ index: 2 }))
        .expectDefaultPrevented();
      scene.expect(position).toHaveText("2 of 3");
      // Last slide, loop=false: Next disables (asserted, not fired —
      // see the header note on disabled parts).
      assert.isDefined(scene.get(next).attrs?.disabled);
      scene.fire(root, "keydown", key("ArrowLeft")).emitted(CarouselEvents.Selected({ index: 1 }));
      scene.expect(position).toHaveText("1 of 3");
      scene.fire(previous, "click").emitted(CarouselEvents.Selected({ index: 0 }));
      scene.expect(position).toHaveText("0 of 3");
      assert.isDefined(scene.get(previous).attrs?.disabled);
      // A non-arrow key produces no message.
      scene.fire(root, "keydown", key("a")).expectIgnored();
    }),
  );

  it.effect("loop=true wraps at both ends", () =>
    Effect.gen(function* () {
      const scene = yield* HtmlScene.make(
        Carousel,
        { count: 3, loop: true },
        { elements: Html, view: standInView },
      );
      scene.expectMount(CarouselTrack({ index: 0, orientation: "horizontal" }));
      // Under loop both buttons are live from the first slide.
      assert.isUndefined(scene.get(previous).attrs?.disabled);
      assert.isUndefined(scene.get(next).attrs?.disabled);
      scene.fire(previous, "click").emitted(CarouselEvents.Selected({ index: 2 }));
      scene.expect(position).toHaveText("2 of 3");
      scene.fire(next, "click").emitted(CarouselEvents.Selected({ index: 0 }));
      scene.expect(position).toHaveText("0 of 3");
    }),
  );

  it.effect("vertical: track/item classes and button placement follow orientation", () =>
    Effect.gen(function* () {
      const scene = yield* HtmlScene.make(
        Carousel,
        { count: 2, orientation: "vertical" as const },
        { elements: Html, view: standInView },
      );
      scene.expectMount(CarouselTrack({ index: 0, orientation: "vertical" }));
      assert.strictEqual(scene.get(track("vertical")).attrs?.class, carouselTrackClass("vertical"));
      assert.strictEqual(scene.get(slide1).attrs?.class, carouselItemClass("vertical"));
      assert.strictEqual(scene.get(previous).attrs?.class, previousClass("vertical"));
      assert.strictEqual(scene.get(next).attrs?.class, nextClass("vertical"));
      scene.expect(position).toHaveText("0 of 2");
    }),
  );
});

// ---------------------------------------------------------------------------
// Consumer level: the Gallery hosts the Carousel and records Selected.
// ---------------------------------------------------------------------------

const GalleryMessage = UiSchema.TaggedEnum({
  Selected: { index: Schema.Number },
});

const Gallery = Html.component({
  name: "Gallery",
  props: Schema.Struct({
    loop: Schema.optional(Schema.Boolean),
    orientation: Schema.optional(Schema.Literals(["horizontal", "vertical"])),
  }),
  model: Schema.Struct({ selected: Schema.String }),
  message: GalleryMessage,
}).make({
  init: () => ({ selected: "none" }),
  update: {
    Selected: ($, { index }) => $.evolve({ selected: String(index) }),
  },
  view: (h, model) =>
    h.div.children(
      Carousel(h, {
        props: { count: 3, loop: h.props.loop, orientation: h.props.orientation },
        onEmit: {
          Selected: ({ index }) => GalleryMessage.Selected({ index }),
        },
        view: (c) =>
          c
            .root(h.div)
            .children(
              CarouselContent(c, h, {}, slides(c, h)),
              CarouselPrevious(c, h),
              CarouselNext(c, h),
              h.output.attr("data-slot", "position").children(`${c.index} of ${c.count}`),
            ),
      }),
      h.output.attr("data-slot", "selected").children(model.selected),
    ),
});

const selectedOut = Locator.attr("data-slot", "selected");

describe("Carousel hosted by a consumer", () => {
  it.effect(
    "a Play: clicks advance and stop at the last slide; Selected reaches the consumer",
    () =>
      Effect.gen(function* () {
        const play = yield* Play.make(Gallery, {});
        yield* play.expect(position).toHaveText("0 of 3");
        yield* play.click(next);
        yield* play.expect(position).toHaveText("1 of 3");
        yield* play.expect(selectedOut).toHaveText("1");
        yield* play.click(next);
        yield* play.expect(position).toHaveText("2 of 3");
        yield* play.expect(selectedOut).toHaveText("2");
        yield* play.expect(next).toHaveAttribute("disabled", "");
        yield* play.click(previous);
        yield* play.expect(position).toHaveText("1 of 3");
        yield* play.expect(selectedOut).toHaveText("1");
      }).pipe(Effect.provide(TestHost.layer())),
  );

  it.effect("a Play with loop: Previous on the first slide wraps to the last", () =>
    Effect.gen(function* () {
      const play = yield* Play.make(Gallery, { loop: true });
      yield* play.expect(position).toHaveText("0 of 3");
      yield* play.click(previous);
      yield* play.expect(position).toHaveText("2 of 3");
      yield* play.expect(selectedOut).toHaveText("2");
    }).pipe(Effect.provide(TestHost.layer())),
  );
});

// ---------------------------------------------------------------------------
// Bases generation: same engine, cn-* hook class layer (spot check).
// ---------------------------------------------------------------------------

const BasesGallery = Html.component({
  name: "BasesGallery",
  model: Schema.Struct({ selected: Schema.String }),
  message: GalleryMessage,
}).make({
  init: () => ({ selected: "none" }),
  update: {
    Selected: ($, { index }) => $.evolve({ selected: String(index) }),
  },
  view: (h, model) =>
    h.div.children(
      BasesCarousel(h, {
        props: { count: 3 },
        onEmit: {
          Selected: ({ index }) => GalleryMessage.Selected({ index }),
        },
        view: (c) =>
          c
            .root(h.div)
            .children(
              BasesCarouselContent(c, h, {}, [
                BasesCarouselItem(c, h).children("Slide 1"),
                BasesCarouselItem(c, h).children("Slide 2"),
                BasesCarouselItem(c, h).children("Slide 3"),
              ]),
              BasesCarouselPrevious(c, h),
              BasesCarouselNext(c, h),
              h.output.attr("data-slot", "position").children(`${c.index} of ${c.count}`),
            ),
      }),
      h.output.attr("data-slot", "selected").children(model.selected),
    ),
});

describe("Carousel (bases generation)", () => {
  it.effect("renders the cn-* hook classes with icon-sm buttons", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(BasesGallery, {});
      assert.strictEqual(
        scene.get(previous).attrs?.class,
        cn(
          basesButtonVariants({ variant: "outline", size: "icon-sm" }),
          BASES_PREVIOUS_BASE,
          "inset-y-0 -left-12 my-auto",
        ),
      );
      assert.strictEqual(scene.get(previous).attrs?.["data-size"], "icon-sm");
      assert.strictEqual(
        scene.get(next).attrs?.class,
        cn(
          basesButtonVariants({ variant: "outline", size: "icon-sm" }),
          BASES_NEXT_BASE,
          "inset-y-0 -right-12 my-auto",
        ),
      );
      // The track is the same scroll-snap layer as the new-york file's.
      assert.strictEqual(
        scene.get(track("horizontal")).attrs?.class,
        basesTrackClass("horizontal"),
      );
      scene.expect(position).toHaveText("0 of 3");
    }),
  );
});
