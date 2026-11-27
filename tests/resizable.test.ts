import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Play, Scene, TestHost } from "@effect/ui/testing";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  RESIZABLE_HANDLE_CLASS,
  RESIZABLE_HANDLE_GRIP_CLASS,
  RESIZABLE_PANEL_GROUP_CLASS,
  ResizableDragMount,
  ResizableHandleGrip,
  ResizablePanelGroup,
  type ResizablePanelGroupParts,
  type ResizablePanelGroupProps,
} from "../registry/ui/resizable.ts";
import {
  RESIZABLE_HANDLE_CLASS as BASE_HANDLE_CLASS,
  RESIZABLE_PANEL_GROUP_CLASS as BASE_GROUP_CLASS,
  ResizablePanelGroup as BasePanelGroup,
  type ResizablePanelGroupParts as BasePanelGroupParts,
} from "../registry/bases/ui/resizable.ts";

// Resizable is the repo's first hand-built engine (no kit part): the
// Component is Scene'd directly with a stand-in view, the way the kit's
// own headless tests do. The Scene runs the root's update, so drag and
// keyboard sequences run the real constraint math. Every emitted event
// is acknowledged in order with `.emitted(...)` — the harness requires
// it, and it doubles as the events contract's assertion.
//
// The drag itself arrives through a Mount, which never runs in a Scene:
// `scene.mounted(ResizableDragMount, event)` is the harness's seam — it
// sends the message the view's Mount.map makes of the event, exactly as
// a browser pointer would. Each Scene acknowledges the mount once via a
// no-op `ended` event (no drag is active, so update ignores it).
//
// NOT covered here (declared):
// - The mount body itself (window pointermove listeners, the group's
//   bounding-rect conversion): it runs only in a browser host; TestHost
//   has no layout, so no Play attempts a pointer drag. The Play below
//   covers the cross-component wiring through the keyboard instead.
// - Computed flex layout: a Scene renders the view tree, so the
//   `flex-basis` style attribute is the assertion surface.

const group = Locator.attr("data-slot", "resizable-panel-group");
const panel = Locator.attr("data-slot", "resizable-panel");
const handle = Locator.attr("data-slot", "resizable-handle");
const settledOut = Locator.attr("data-slot", "settled");

// Draws as many panels (and the handles between them) as the layout
// has, reading the count from the parts' `sizes` value.
const drawGroup = (g: ResizablePanelGroupParts, h: Html.H<never>) =>
  g
    .group(h.div)
    .children(
      ...g.sizes.flatMap((_, i) =>
        i === 0
          ? [g.panel(h.div, 0).children("P0")]
          : [g.handle(h.div, i - 1), g.panel(h.div, i).children(`P${i}`)],
      ),
    );

const standIn = {
  elements: Html,
  view: (g: ResizablePanelGroupParts, h: Html.H<never>) => drawGroup(g, h),
};

const baseStandIn = {
  elements: Html,
  view: (g: BasePanelGroupParts, h: Html.H<never>) => drawGroup(g, h),
};

const shown = (props: ResizablePanelGroupProps) =>
  Scene.make(ResizablePanelGroup, props, standIn).pipe(
    Effect.tap((scene) =>
      Effect.sync(() => {
        scene.mounted(ResizableDragMount, { phase: "ended", handle: 0, percent: 0 });
      }),
    ),
  );

const basis = (scene: { readonly all: (l: Locator.Locator) => ReadonlyArray<Locator.Node> }) =>
  scene.all(panel).map((n) => n.attrs?.["style"]);

describe("Resizable (new-york)", () => {
  it.effect("initial render: basis from defaultSize, group + handle ARIA surface", () =>
    Effect.gen(function* () {
      const scene = yield* shown({
        panels: [{ defaultSize: 30, minSize: 15, maxSize: 60 }, { defaultSize: 70 }],
      });
      const groupAttrs = scene.get(group).attrs;
      assert.strictEqual(groupAttrs?.["class"], RESIZABLE_PANEL_GROUP_CLASS);
      assert.strictEqual(groupAttrs?.["aria-orientation"], "horizontal");
      assert.deepStrictEqual(basis(scene), ["flex-basis: 30%", "flex-basis: 70%"]);
      const handleAttrs = scene.get(handle).attrs;
      assert.strictEqual(handleAttrs?.["class"], RESIZABLE_HANDLE_CLASS);
      assert.strictEqual(handleAttrs?.["role"], "separator");
      assert.strictEqual(handleAttrs?.["tabindex"], "0");
      // The separator's own orientation: perpendicular to the group's.
      assert.strictEqual(handleAttrs?.["aria-orientation"], "vertical");
      assert.strictEqual(handleAttrs?.["aria-valuenow"], "30");
      assert.strictEqual(handleAttrs?.["aria-valuemin"], "15");
      assert.strictEqual(handleAttrs?.["aria-valuemax"], "60");
    }),
  );

  it.effect("unspecified panels split the remainder evenly", () =>
    Effect.gen(function* () {
      const scene = yield* shown({ panels: [{ defaultSize: 40 }, {}, {}] });
      assert.deepStrictEqual(basis(scene), [
        "flex-basis: 40%",
        "flex-basis: 30%",
        "flex-basis: 30%",
      ]);
    }),
  );

  it.effect(
    "a drag: started, moved (sizes + LayoutChange), clamped at the neighbour's min, ended",
    () =>
      Effect.gen(function* () {
        const scene = yield* shown({
          panels: [
            { defaultSize: 50, minSize: 20 },
            { defaultSize: 50, minSize: 20 },
          ],
        });
        scene.mounted(ResizableDragMount, { phase: "started", handle: 0, percent: 50 });
        assert.deepStrictEqual(basis(scene), ["flex-basis: 50%", "flex-basis: 50%"]);
        assert.strictEqual(scene.get(group).attrs?.["data-dragging"], "");
        scene
          .mounted(ResizableDragMount, { phase: "moved", handle: 0, percent: 65 })
          .emitted({ _tag: "LayoutChange", sizes: [65, 35] });
        assert.deepStrictEqual(basis(scene), ["flex-basis: 65%", "flex-basis: 35%"]);
        assert.strictEqual(scene.get(handle).attrs?.["aria-valuenow"], "65");
        // Past the neighbour's minSize (20): the pair clamps at 80/20.
        scene
          .mounted(ResizableDragMount, { phase: "moved", handle: 0, percent: 95 })
          .emitted({ _tag: "LayoutChange", sizes: [80, 20] });
        assert.deepStrictEqual(basis(scene), ["flex-basis: 80%", "flex-basis: 20%"]);
        scene
          .mounted(ResizableDragMount, { phase: "ended", handle: 0, percent: 95 })
          .emitted({ _tag: "LayoutChanged", sizes: [80, 20] });
        assert.isUndefined(scene.get(group).attrs?.["data-dragging"]);
        assert.isUndefined(scene.get(handle).attrs?.["data-dragging"]);
      }),
  );

  it.effect(
    "keyboard: arrows resize, shift is ×10, Enter toggles collapse, Home goes to the floor",
    () =>
      Effect.gen(function* () {
        const scene = yield* shown({
          panels: [
            { defaultSize: 40, minSize: 30, collapsible: true, collapsedSize: 5 },
            { defaultSize: 60 },
          ],
        });
        const key = (k: string, shift: boolean, sizes: [number, number]) =>
          scene
            .fire(handle, "keydown", { key: k, shift })
            .emitted({ _tag: "LayoutChange", sizes })
            .emitted({ _tag: "LayoutChanged", sizes });
        key("ArrowLeft", false, [39, 61]);
        assert.deepStrictEqual(basis(scene), ["flex-basis: 39%", "flex-basis: 61%"]);
        key("ArrowRight", true, [49, 51]);
        assert.deepStrictEqual(basis(scene), ["flex-basis: 49%", "flex-basis: 51%"]);
        // Shift = ×10: 49 − 10 = 39, still above minSize, so no snap.
        key("ArrowLeft", true, [39, 61]);
        assert.deepStrictEqual(basis(scene), ["flex-basis: 39%", "flex-basis: 61%"]);
        // Enter collapses to collapsedSize; the neighbour absorbs the rest.
        key("Enter", false, [5, 95]);
        assert.deepStrictEqual(basis(scene), ["flex-basis: 5%", "flex-basis: 95%"]);
        assert.strictEqual(scene.get(handle).attrs?.["aria-valuenow"], "5");
        assert.strictEqual(scene.get(handle).attrs?.["aria-valuemin"], "5");
        // Enter again expands back — to the panel's defaultSize (40),
        // the deterministic restore of declared divergence 7 (upstream
        // remembers the pre-collapse size; the engine does not).
        key("Enter", false, [40, 60]);
        assert.deepStrictEqual(basis(scene), ["flex-basis: 40%", "flex-basis: 60%"]);
        // Home proposes the floor, which for a collapsible panel is its
        // collapsedSize.
        key("Home", false, [5, 95]);
        assert.deepStrictEqual(basis(scene), ["flex-basis: 5%", "flex-basis: 95%"]);
      }),
  );

  it.effect("vertical group: flipped ARIA orientations, drag collapses past the midpoint", () =>
    Effect.gen(function* () {
      const scene = yield* shown({
        direction: "vertical",
        panels: [
          { defaultSize: 50, minSize: 25, collapsible: true, collapsedSize: 0 },
          { defaultSize: 50 },
        ],
      });
      assert.strictEqual(scene.get(group).attrs?.["aria-orientation"], "vertical");
      assert.strictEqual(scene.get(handle).attrs?.["aria-orientation"], "horizontal");
      scene.mounted(ResizableDragMount, { phase: "started", handle: 0, percent: 50 });
      // Proposes 10: below the collapse midpoint (0 + 25/2 = 12.5), so
      // the panel snaps shut and the neighbour takes everything.
      scene
        .mounted(ResizableDragMount, { phase: "moved", handle: 0, percent: 10 })
        .emitted({ _tag: "LayoutChange", sizes: [0, 100] });
      assert.deepStrictEqual(basis(scene), ["flex-basis: 0%", "flex-basis: 100%"]);
      scene
        .mounted(ResizableDragMount, { phase: "ended", handle: 0, percent: 10 })
        .emitted({ _tag: "LayoutChanged", sizes: [0, 100] });
    }),
  );

  it.effect(
    "the grip is a composition: ResizableHandleGrip carries the upstream grip classes",
    () =>
      Effect.gen(function* () {
        const GripDemo = Html.component({
          name: "GripDemo",
          model: Schema.Struct({}),
          message: UiSchema.TaggedEnum({ Unused: {} }),
        }).make({
          init: () => ({}),
          update: {},
          view: (h) => ResizableHandleGrip(h),
        });
        const scene = yield* Scene.make(GripDemo, {});
        const grip = scene.get(Locator.tag("div"));
        assert.strictEqual(grip.attrs?.["class"], RESIZABLE_HANDLE_GRIP_CLASS);
      }),
  );
});

describe("Resizable (bases)", () => {
  it.effect("hook classes land on group + handle; keyboard resizing works the same", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(
        BasePanelGroup,
        { panels: [{ defaultSize: 25 }, { defaultSize: 75 }] },
        baseStandIn,
      );
      scene.mounted(ResizableDragMount, { phase: "ended", handle: 0, percent: 0 });
      assert.strictEqual(scene.get(group).attrs?.["class"], BASE_GROUP_CLASS);
      assert.strictEqual(scene.get(handle).attrs?.["class"], BASE_HANDLE_CLASS);
      assert.deepStrictEqual(basis(scene), ["flex-basis: 25%", "flex-basis: 75%"]);
      scene
        .fire(handle, "keydown", { key: "ArrowRight", shift: false })
        .emitted({ _tag: "LayoutChange", sizes: [26, 74] })
        .emitted({ _tag: "LayoutChanged", sizes: [26, 74] });
      assert.deepStrictEqual(basis(scene), ["flex-basis: 26%", "flex-basis: 74%"]);
    }),
  );
});

// ---------------------------------------------------------------------------
// Play — the wiring across the component boundary, end to end
// ---------------------------------------------------------------------------

const ShellMessage = UiSchema.TaggedEnum({
  LayoutSettled: { sizes: Schema.Array(Schema.Number) },
});

const Shell = Html.component({
  name: "ResizableShell",
  model: Schema.Struct({ settled: Schema.String }),
  message: ShellMessage,
}).make({
  init: () => ({ settled: "" }),
  update: {
    LayoutSettled: ($, { sizes }) => $.evolve({ settled: sizes.join(",") }),
  },
  view: (h, model) =>
    h.div.children(
      ResizablePanelGroup(h, {
        props: { panels: [{ defaultSize: 50 }, { defaultSize: 50 }] },
        onEmit: {
          LayoutChange: () => undefined,
          LayoutChanged: ({ sizes }) => ShellMessage.LayoutSettled({ sizes }),
        },
        view: (g) =>
          g
            .group(h.div)
            .children(
              g.panel(h.div, 0).children("Left"),
              g.handle(h.div, 0),
              g.panel(h.div, 1).children("Right"),
            ),
      }),
      h.span.attr("data-slot", "settled").children(model.settled),
    ),
});

describe("Resizable (Play)", () => {
  it.effect(
    "a real keydown on the handle resizes the child and the consumer hears LayoutChanged",
    () =>
      Effect.gen(function* () {
        const play = yield* Play.make(Shell, {});
        yield* play.expect(panel).toHaveCount(2);
        yield* play.fire(handle, "keydown", { key: "ArrowRight" });
        yield* play.expect(settledOut).toHaveText("51,49");
        yield* play.expect(handle).toHaveAttribute("aria-valuenow", "51");
      }).pipe(Effect.provide(TestHost.layer())),
  );
});
