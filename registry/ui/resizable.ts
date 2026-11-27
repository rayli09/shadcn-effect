/**
 * Resizable — shadcn/ui `resizable` ported 1:1 to Effect UI.
 *
 * Upstream: React + react-resizable-panels (Group / Panel / Separator).
 * There is no kit part for this one (PORTING-RULES D-4), so the panel
 * engine is authored here as a headless Component, the way this repo's
 * SidebarProvider is authored:
 *
 * - `ResizablePanelGroup` is the Component. Its Model owns the layout —
 *   `sizes`, one percentage per panel, summing to 100 — and the
 *   in-progress drag. Its props carry the group's configuration:
 *   `direction` (upstream Group's `direction` / `orientation`) and
 *   `panels`, one entry per panel with upstream Panel's own options
 *   (`defaultSize`, `minSize`, `maxSize`, `collapsible`,
 *   `collapsedSize`, `disabled`). Consumers draw the parts in order —
 *   `panel`, `handle`, `panel`, … — and put their content inside the
 *   panels:
 *
 *     ResizablePanelGroup(h, {
 *       props: {
 *         direction: "horizontal",
 *         panels: [{ defaultSize: 30, minSize: 15 }, { defaultSize: 70 }],
 *       },
 *       onEmit: {
 *         LayoutChanged: ({ sizes }) => Msg.LayoutSettled({ sizes }),
 *       },
 *       view: (g) =>
 *         g.group(h.div).children(
 *           g.panel(h.div, 0).children("…"),
 *           g.handle(h.div, 0),
 *           g.panel(h.div, 1).children("…"),
 *         ),
 *     })
 *
 * - **Layout.** The group is a flex row (column when vertical, via the
 *   upstream class), each panel renders `flex-basis: <size>%` from the
 *   Model, so a size change in `update` is the whole re-render. No
 *   measuring of panels is ever needed.
 * - **Pointer drag.** Element events in @effect/ui have no
 *   `pointermove`, so the drag is a `Mount` (`ResizableDragMount`,
 *   exported for tests): attached to the group element, it listens for
 *   `pointerdown` on a handle (found via the handle's data-slot), then
 *   tracks the pointer on `window` until `pointerup` / `pointercancel`,
 *   converting viewport coordinates to a percentage of the group's own
 *   box (read from the host node on every event) and reporting
 *   started / moved / ended as the Component's drag messages. `update`
 *   recomputes the layout from the drag's start layout plus the total
 *   delta, so moves never compound rounding.
 * - **Constraints** are enforced in `update`, purely: a drag or a key
 *   press proposes a new size for the panel before the handle; the two
 *   panels around the handle trade percentage points, each clamped to
 *   its `minSize` / `maxSize`. A `collapsible` panel dragged below the
 *   midpoint between its `collapsedSize` and `minSize` snaps to
 *   `collapsedSize`; dragged back above the midpoint it snaps to
 *   `minSize`.
 * - **Keyboard.** The handle is a focusable `role="separator"` (the
 *   WAI-APG window splitter pattern react-resizable-panels implements):
 *   `aria-orientation` is the separator's own (perpendicular to the
 *   group's direction — which is what upstream's
 *   `aria-[orientation=horizontal]:…` handle classes key on),
 *   `aria-valuenow` / `aria-valuemin` / `aria-valuemax` describe the
 *   panel before it. Arrow keys resize by 1 (Shift: 10) — Left/Right in
 *   a horizontal group, Up/Down in a vertical one — Home/End take the
 *   panel to its min/max, and Enter toggles its collapse.
 * - **Events.** `LayoutChange` fires whenever a drag or key press
 *   changes the layout (upstream's `onLayoutChange`); `LayoutChanged`
 *   fires when a drag ends or a key press lands (upstream's
 *   `onLayoutChanged`).
 *
 * Declared divergences (everything not listed is a bug):
 *
 * 1. **No imperative API / ref handle.** Upstream exposes
 *    `getLayout` / `setLayout`, panel `collapse()` / `expand()` /
 *    `resize()` / `isCollapsed()` through refs. Here the layout lives
 *    in the Component's Model; consumers observe it through the
 *    `LayoutChange` / `LayoutChanged` events and the `sizes` part
 *    value, and there is no handle to command it with.
 * 2. **No `autoSaveId` persistence.** Upstream can persist the layout
 *    to localStorage under an id. A registry Component does not touch
 *    storage behind the consumer's back (same stance as the sidebar
 *    cookie): persist the sizes from the events yourself and pass them
 *    back as `defaultSize`s.
 * 3. **Adjacent-pair resizing only.** When a panel reaches its limit,
 *    upstream's layout validation pushes the constraint through to
 *    further panels; here the two panels around the handle clamp and
 *    the drag stops there. (For two-panel groups — the common case —
 *    the behavior is identical.)
 * 4. **Panel config lives on the group.** Upstream spreads
 *    `defaultSize` / `minSize` / … over the Panel children; a headless
 *    Component's parts are drawn by index, so the configuration is the
 *    group's `panels` prop, by index — the kit Slider makes the same
 *    move with its thumbs. Panel `id` / `order` and group
 *    `defaultLayout` / `storage` props are not reproduced.
 * 5. **`withHandle` is a composition.** Upstream's Handle renders the
 *    grip itself when `withHandle` is set; here the grip is the
 *    exported `ResizableHandleGrip` view function, drawn as the
 *    handle's child: `g.handle(h.div, 0).children(ResizableHandleGrip(h))`.
 * 6. **The group stamps `aria-orientation`** with its direction (D-5
 *    bridge): upstream's group class keys `flex-col` on
 *    `aria-[orientation=vertical]`, and react-resizable-panels writes
 *    the attribute; the handle stamps the perpendicular value, as
 *    upstream's separator does.
 * 7. **Collapse restore.** Enter on a collapsed panel expands it to
 *    its `minSize` (or its `defaultSize` when larger); upstream
 *    remembers the pre-collapse size, which would need another Model
 *    field per panel for a rare path.
 */
import * as Component from "@effect/ui/Component";
import * as Html from "@effect/ui/html/Html";
import * as Mount from "@effect/ui/Mount";
import * as UiSchema from "@effect/ui/UiSchema";
import { Effect, Queue, Schema, Stream } from "effect";
import { icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Class strings (byte-for-byte shadcn new-york-v4)
// ---------------------------------------------------------------------------

export const RESIZABLE_PANEL_GROUP_CLASS =
  "flex h-full w-full aria-[orientation=vertical]:flex-col";

export const RESIZABLE_HANDLE_CLASS =
  "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90";

export const RESIZABLE_HANDLE_GRIP_CLASS =
  "z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-border";

/** Lucide `grip-vertical` (ISC), the icon inside upstream's handle grip. */
const GripVerticalIcon = <Msg>(h: Html.H<Msg>) =>
  icon(
    h,
    [
      ["circle", { cx: "9", cy: "12", r: "1" }],
      ["circle", { cx: "9", cy: "5", r: "1" }],
      ["circle", { cx: "9", cy: "19", r: "1" }],
      ["circle", { cx: "15", cy: "12", r: "1" }],
      ["circle", { cx: "15", cy: "5", r: "1" }],
      ["circle", { cx: "15", cy: "19", r: "1" }],
    ],
    { class: "size-2.5" },
  );

/**
 * Upstream's `withHandle` grip: draw it as the handle part's child.
 * The grip's `rotate-90` in a vertical group comes from the handle
 * class's `[&[aria-orientation=horizontal]>div]` variant.
 */
export const ResizableHandleGrip = <Msg>(h: Html.H<Msg>) =>
  h.div.class(RESIZABLE_HANDLE_GRIP_CLASS).children(GripVerticalIcon(h));

// ---------------------------------------------------------------------------
// Props / Model / Message / Events
// ---------------------------------------------------------------------------

export type ResizableDirection = "horizontal" | "vertical";

/** One panel's configuration — upstream `Panel`'s own props, by index. */
export const ResizablePanelConfig = Schema.Struct({
  defaultSize: Schema.optional(Schema.Number),
  minSize: Schema.optional(Schema.Number),
  maxSize: Schema.optional(Schema.Number),
  collapsible: Schema.optional(Schema.Boolean),
  collapsedSize: Schema.optional(Schema.Number),
  disabled: Schema.optional(Schema.Boolean),
});
export type ResizablePanelConfig = typeof ResizablePanelConfig.Type;

export const ResizablePanelGroupProps = Schema.Struct({
  direction: Schema.optional(Schema.Literals(["horizontal", "vertical"])),
  panels: Schema.Array(ResizablePanelConfig),
  disabled: Schema.optional(Schema.Boolean),
});
export type ResizablePanelGroupProps = typeof ResizablePanelGroupProps.Type;

const DragState = Schema.Struct({
  handle: Schema.Number,
  /** Pointer position (percent along the group's axis) at drag start. */
  startPercent: Schema.Number,
  /** The layout at drag start; every move recomputes from this. */
  startSizes: Schema.Array(Schema.Number),
});

const ResizablePanelGroupModel = Schema.Struct({
  sizes: Schema.Array(Schema.Number),
  dragging: Schema.NullOr(DragState),
});
type ResizablePanelGroupModel = typeof ResizablePanelGroupModel.Type;

export const ResizablePanelGroupMessage = UiSchema.TaggedEnum({
  DragStarted: { handle: Schema.Number, percent: Schema.Number },
  DragMoved: { handle: Schema.Number, percent: Schema.Number },
  DragEnded: { handle: Schema.Number },
  KeyResized: { handle: Schema.Number, key: Schema.String, shift: Schema.Boolean },
});
export type ResizablePanelGroupMessage = typeof ResizablePanelGroupMessage.Type;

export const ResizablePanelGroupEvents = UiSchema.TaggedEnum({
  /** Upstream's `onLayoutChange`: the layout moved. */
  LayoutChange: { sizes: Schema.Array(Schema.Number) },
  /** Upstream's `onLayoutChanged`: a drag or key press settled. */
  LayoutChanged: { sizes: Schema.Array(Schema.Number) },
});
export type ResizablePanelGroupEvents = typeof ResizablePanelGroupEvents.Type;

// ---------------------------------------------------------------------------
// The drag mount — pointer tracking the element events cannot express
// ---------------------------------------------------------------------------

/** What `ResizableDragMount` reports: a drag phase on one handle. */
export interface ResizableDragEvent {
  readonly phase: "started" | "moved" | "ended";
  readonly handle: number;
  /** Pointer position as a percentage along the group's axis (0–100). */
  readonly percent: number;
}

/**
 * The group's pointer ears. Attached to the group element by the
 * `group` part; in a Scene it never runs — tests name it with
 * `scene.mounted(ResizableDragMount, …)` and feed it drag events,
 * which is the harness's seam for exactly this.
 */
export const ResizableDragMount = Mount.makeStream(
  "ResizableDrag",
  { args: { direction: Schema.Literals(["horizontal", "vertical"]) } },
  (node: HTMLDivElement, { direction }) =>
    Stream.callback<ResizableDragEvent>((queue) =>
      Effect.acquireRelease(
        Effect.sync(() => {
          // A host without DOM listeners (a test host, the server) gets
          // no drag; keyboard resizing is unaffected.
          if (typeof node.addEventListener !== "function" || typeof window === "undefined") {
            return () => {};
          }
          let active: { readonly handle: number; readonly pointerId: number } | undefined;
          const percentOf = (clientX: number, clientY: number): number | undefined => {
            const rect = node.getBoundingClientRect();
            const size = direction === "horizontal" ? rect.width : rect.height;
            if (size <= 0) return undefined;
            const along = direction === "horizontal" ? clientX - rect.left : clientY - rect.top;
            return (along / size) * 100;
          };
          const handleOf = (target: EventTarget | null): number | undefined => {
            if (!(target instanceof Element)) return undefined;
            const el = target.closest('[data-slot="resizable-handle"]');
            if (el === null || !node.contains(el) || el.hasAttribute("data-disabled")) {
              return undefined;
            }
            const raw = el.getAttribute("data-handle-index");
            const index = raw === null ? Number.NaN : Number(raw);
            return Number.isInteger(index) && index >= 0 ? index : undefined;
          };
          const onPointerDown = (event: PointerEvent) => {
            if (event.button !== 0 || active !== undefined) return;
            const handle = handleOf(event.target);
            const percent = percentOf(event.clientX, event.clientY);
            if (handle === undefined || percent === undefined) return;
            active = { handle, pointerId: event.pointerId };
            event.preventDefault();
            Queue.offerUnsafe(queue, { phase: "started", handle, percent });
          };
          const onPointerMove = (event: PointerEvent) => {
            if (active === undefined || event.pointerId !== active.pointerId) return;
            const percent = percentOf(event.clientX, event.clientY);
            if (percent !== undefined) {
              Queue.offerUnsafe(queue, { phase: "moved", handle: active.handle, percent });
            }
          };
          const onPointerEnd = (event: PointerEvent) => {
            if (active === undefined || event.pointerId !== active.pointerId) return;
            const { handle } = active;
            active = undefined;
            Queue.offerUnsafe(queue, {
              phase: "ended",
              handle,
              percent: percentOf(event.clientX, event.clientY) ?? 0,
            });
          };
          node.addEventListener("pointerdown", onPointerDown);
          window.addEventListener("pointermove", onPointerMove);
          window.addEventListener("pointerup", onPointerEnd);
          window.addEventListener("pointercancel", onPointerEnd);
          return () => {
            node.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerEnd);
            window.removeEventListener("pointercancel", onPointerEnd);
          };
        }),
        (cleanup) => Effect.sync(cleanup),
      ),
    ),
);

// ---------------------------------------------------------------------------
// Layout math — pure; every constraint is decided here, in update
// ---------------------------------------------------------------------------

const round3 = (n: number): number => Math.round(n * 1000) / 1000;

const minOf = (panel: ResizablePanelConfig): number => panel.minSize ?? 0;
const maxOf = (panel: ResizablePanelConfig): number => panel.maxSize ?? 100;
const collapsedOf = (panel: ResizablePanelConfig): number => panel.collapsedSize ?? 0;
/** The smallest size a panel may be dragged to (collapse floor included). */
const floorOf = (panel: ResizablePanelConfig): number =>
  panel.collapsible === true ? Math.min(collapsedOf(panel), minOf(panel)) : minOf(panel);

/** Snap a collapsible panel across the collapse threshold (see header). */
const snap = (panel: ResizablePanelConfig, size: number): number => {
  if (panel.collapsible !== true) return size;
  const collapsed = collapsedOf(panel);
  const min = minOf(panel);
  if (size <= collapsed) return collapsed;
  if (size < min) return size < collapsed + (min - collapsed) / 2 ? collapsed : min;
  return size;
};

const clampSize = (panel: ResizablePanelConfig, size: number): number =>
  snap(panel, Math.min(maxOf(panel), Math.max(floorOf(panel), size)));

/**
 * Propose `target` as panel `handle`'s size; its next neighbour trades
 * the difference. Both clamp (declared divergence 3: no push-through).
 */
const resizePair = (
  sizes: ReadonlyArray<number>,
  panels: ReadonlyArray<ResizablePanelConfig>,
  handle: number,
  target: number,
): ReadonlyArray<number> => {
  const before = panels[handle];
  const after = panels[handle + 1];
  const current = sizes[handle];
  const next = sizes[handle + 1];
  if (before === undefined || after === undefined || current === undefined || next === undefined) {
    return sizes;
  }
  const total = current + next;
  let a = clampSize(before, target);
  let b = total - a;
  const clampedB = clampSize(after, b);
  if (clampedB !== b) {
    b = clampedB;
    a = clampSize(before, total - b);
  }
  if (a === current && b === next) return sizes;
  const out = [...sizes];
  out[handle] = round3(a);
  out[handle + 1] = round3(b);
  return out;
};

/** Upstream's initial layout: defaults honoured, the rest split evenly. */
const initialSizes = (panels: ReadonlyArray<ResizablePanelConfig>): ReadonlyArray<number> => {
  const specified = panels.reduce((sum, p) => sum + (p.defaultSize ?? 0), 0);
  const missing = panels.filter((p) => p.defaultSize === undefined).length;
  const rest = missing === 0 ? 0 : Math.max(0, 100 - specified) / missing;
  const raw = panels.map((p) => p.defaultSize ?? rest);
  const total = raw.reduce((a, b) => a + b, 0);
  const scaled = total > 0 && total !== 100 ? raw.map((s) => (s / total) * 100) : raw;
  return scaled.map((size, i) => {
    const panel = panels[i];
    return panel === undefined ? round3(size) : round3(clampSize(panel, size));
  });
};

const sameSizes = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);

// ---------------------------------------------------------------------------
// The Component
// ---------------------------------------------------------------------------

const handleDisabled = (
  props: ResizablePanelGroupProps,
  panels: ReadonlyArray<ResizablePanelConfig>,
  handle: number,
): boolean => props.disabled === true || panels[handle]?.disabled === true;

/**
 * A shadcn-styled resizable panel group — the Effect-native engine for
 * upstream's `ResizablePanelGroup` / `ResizablePanel` / `ResizableHandle`
 * (see the file header for the full contract and declared divergences).
 * Draw `group` around `panel` / `handle` parts in order; read the
 * current layout from the parts' `sizes` value or the
 * `LayoutChange` / `LayoutChanged` events.
 */
export const ResizablePanelGroup = Html.component({
  name: "ResizablePanelGroup",
  props: ResizablePanelGroupProps,
  model: ResizablePanelGroupModel,
  message: ResizablePanelGroupMessage,
  events: ResizablePanelGroupEvents,
}).make({
  init: ({ props }) => ({ sizes: initialSizes(props.panels), dragging: null }),
  update: {
    DragStarted: ($, { handle, percent }) => {
      if ($.model.dragging !== null || handleDisabled($.props, $.props.panels, handle)) {
        return $.model;
      }
      return $.evolve({
        dragging: { handle, startPercent: percent, startSizes: $.model.sizes },
      });
    },
    DragMoved: ($, { handle, percent }) => {
      const drag = $.model.dragging;
      if (drag === null || drag.handle !== handle) return $.model;
      const start = drag.startSizes[handle];
      if (start === undefined) return $.model;
      const sizes = resizePair(
        drag.startSizes,
        $.props.panels,
        handle,
        start + (percent - drag.startPercent),
      );
      return sameSizes(sizes, $.model.sizes)
        ? $.model
        : $.evolve({ sizes }).emit(ResizablePanelGroupEvents.LayoutChange({ sizes }));
    },
    DragEnded: ($, { handle }) => {
      if ($.model.dragging === null || $.model.dragging.handle !== handle) return $.model;
      return $.evolve({ dragging: null }).emit(
        ResizablePanelGroupEvents.LayoutChanged({ sizes: $.model.sizes }),
      );
    },
    KeyResized: ($, { handle, key, shift }) => {
      const panels = $.props.panels;
      const panel = panels[handle];
      const current = $.model.sizes[handle];
      if (panel === undefined || current === undefined) return $.model;
      if (handleDisabled($.props, panels, handle)) return $.model;
      const direction = $.props.direction ?? "horizontal";
      const grow = direction === "horizontal" ? "ArrowRight" : "ArrowDown";
      const shrink = direction === "horizontal" ? "ArrowLeft" : "ArrowUp";
      let target: number | undefined;
      if (key === grow) target = current + (shift ? 10 : 1);
      else if (key === shrink) target = current - (shift ? 10 : 1);
      else if (key === "Home") target = floorOf(panel);
      else if (key === "End") target = maxOf(panel);
      else if (key === "Enter" && panel.collapsible === true) {
        target =
          current > collapsedOf(panel)
            ? collapsedOf(panel)
            : Math.max(minOf(panel), panel.defaultSize ?? minOf(panel));
      }
      if (target === undefined) return $.model;
      const sizes = resizePair($.model.sizes, panels, handle, target);
      return sameSizes(sizes, $.model.sizes)
        ? $.model
        : $.evolve({ sizes })
            .emit(ResizablePanelGroupEvents.LayoutChange({ sizes }))
            .emit(ResizablePanelGroupEvents.LayoutChanged({ sizes }));
    },
  },
  parts: (p, model) => {
    const direction = p.props.direction ?? "horizontal";
    const panels = p.props.panels;
    return {
      /** The current layout (percentages, by panel index). */
      sizes: model.sizes,
      direction,
      group: p.part("div", (b) =>
        b
          .attr("data-slot", "resizable-panel-group")
          .attr("aria-orientation", direction)
          .attrs(model.dragging !== null ? { "data-dragging": "" } : {})
          .class(RESIZABLE_PANEL_GROUP_CLASS)
          .onMount(
            ResizableDragMount({ direction }).pipe(
              Mount.map((event) =>
                event.phase === "started"
                  ? ResizablePanelGroupMessage.DragStarted({
                      handle: event.handle,
                      percent: event.percent,
                    })
                  : event.phase === "moved"
                    ? ResizablePanelGroupMessage.DragMoved({
                        handle: event.handle,
                        percent: event.percent,
                      })
                    : ResizablePanelGroupMessage.DragEnded({ handle: event.handle }),
              ),
            ),
          ),
      ),
      panel: p.part("div", (b, index: number) =>
        b
          .attr("data-slot", "resizable-panel")
          .attr("style", `flex-basis: ${model.sizes[index] ?? 0}%`),
      ),
      handle: p.part("div", (b, index: number) => {
        const panel = panels[index] ?? {};
        const disabled = handleDisabled(p.props, panels, index);
        let el = b
          .attr("data-slot", "resizable-handle")
          .attr("data-handle-index", String(index))
          .attr("role", "separator")
          .attr("tabindex", disabled ? "-1" : "0")
          .attr("aria-orientation", direction === "horizontal" ? "vertical" : "horizontal")
          .attr("aria-valuenow", String(Math.round(model.sizes[index] ?? 0)))
          .attr("aria-valuemin", String(Math.round(floorOf(panel))))
          .attr("aria-valuemax", String(Math.round(maxOf(panel))))
          .class(RESIZABLE_HANDLE_CLASS)
          .on("keydown", ({ key, shift }) =>
            disabled
              ? undefined
              : ResizablePanelGroupMessage.KeyResized({ handle: index, key, shift }),
          );
        if (disabled) el = el.attr("data-disabled", "");
        if (model.dragging?.handle === index) el = el.attr("data-dragging", "");
        return el;
      }),
    };
  },
});

/** What a `ResizablePanelGroup`'s `view` gets: `sizes`, `direction`, and the `group` / `panel` / `handle` parts. */
export type ResizablePanelGroupParts = Component.Headless.Parts<typeof ResizablePanelGroup>;
