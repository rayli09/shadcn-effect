/**
 * Carousel — shadcn/ui `carousel` ported 1:1 to Effect UI (D-4 lifted).
 *
 * Upstream wraps `embla-carousel-react`: a React context holding the
 * embla api, a viewport div (overflow hidden) whose flex track embla
 * translates, slides, and Previous/Next Buttons whose `disabled` state
 * follows `api.canScrollPrev()` / `api.canScrollNext()`. Embla is a
 * React-only engine, so the engine here is Effect-native:
 *
 * - `Carousel` is a headless Component. Its Model owns the settled
 *   state — `{ index, count, canPrev, canNext }` — and its Messages are
 *   the api calls: `Next` / `Previous` (upstream's `scrollNext` /
 *   `scrollPrev`), `GoTo` (`api.scrollTo`), `RegisterItems` (the slide
 *   count, upstream's implicit DOM knowledge) and `Scrolled` (the
 *   track's own scroll settling on a snap). The `Selected` Event is
 *   upstream's `api.on("select")` + `selectedScrollSnap()`: it fires
 *   whenever the settled index changes. Upstream's `setApi` prop maps
 *   to the controlled `index` prop plus `Selected` — when `index` is
 *   set, the consumer owns it and navigation only emits `Selected`
 *   (the questionnaire's controlled-`item` pattern).
 * - Positioning is REAL, and it is the browser's: the track is a
 *   scroll-snap container (`overflow-*-auto snap-*-mandatory`, items
 *   `snap-start`), so touch drag, wheel and trackpad scrolling are
 *   native scrolls with native physics — no transform drag code. The
 *   `CarouselTrack` Mount (the kit's DOM bridge — the same
 *   `Mount.makeStream` pattern as the kit Collapsible's TrackPanel and
 *   the popover TrackViewport) is attached to the track: it reports
 *   the committed child count as `RegisterItems`, reports the settled
 *   snap index as `Scrolled` when the track scrolls (debounced, plus
 *   `scrollend` where available), and follows its `index` arg —
 *   `scrollTo` with smooth behavior when Next/Previous/GoTo move the
 *   Model somewhere the scroll position isn't. In hosts without real
 *   DOM elements (the test host) the mount body feature-checks and
 *   ends without reporting; seed `props.count` there.
 * - Keyboard: the root part's keydown maps ArrowLeft / ArrowRight to
 *   Previous / Next, upstream's `handleKeyDown` (which is
 *   orientation-independent upstream; it listens on the root, here in
 *   the bubble phase rather than upstream's capture phase).
 *
 * Upstream export → this port:
 * - `Carousel`         → `Carousel` (the headless Component)
 * - `CarouselContent`  → `CarouselContent` (styled: the `content` part
 *                        wrapping the `track` part)
 * - `CarouselItem`     → `CarouselItem` (styled `item` part)
 * - `CarouselPrevious` → `CarouselPrevious` (styled `previous` part)
 * - `CarouselNext`     → `CarouselNext` (styled `next` part)
 * - `CarouselApi`      → `CarouselApi` (type: the consumer surface —
 *                        controlled `index` prop in, `Selected` out)
 * - `useCarousel`      → the parts object in the view closure, which
 *                        carries the state as data (`index`, `count`,
 *                        `canPrev`, `canNext`, `orientation`)
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings on
 * the elements upstream puts them on; the parity checker asserts every
 * token in `parity/upstream-tokens.json["carousel"]`. The functional
 * additions are confined to the track and the items, and declared:
 * the track gains the scroll/snap utilities that make it the scroll
 * container (`overflow-x-auto snap-x snap-mandatory` or the y forms,
 * plus scrollbar hiding), and each item gains `snap-start`. The
 * viewport keeps upstream's `overflow-hidden` verbatim — it clips the
 * track, whose own scrollbar is hidden by those utilities.
 *
 * Declared divergences (everything not listed is a bug):
 *
 * 1. No embla physics or plugins. Upstream's `plugins` prop and the
 *    embla option bag (`opts`: align, dragFree, containScroll, …) are
 *    not reproduced — the port's props are `orientation`, `loop`,
 *    `startIndex` (as `defaultIndex`), the controlled `index`, and an
 *    optional declared `count`. Scroll physics are the browser's
 *    scroll-snap behavior, not embla's attraction/friction.
 * 2. `loop` wraps by jumping, not by embla's cloned-track seamless
 *    wrap: Next on the last slide settles on slide 0 (the track
 *    smooth-scrolls back), Previous on the first settles on the last.
 *    `canPrev` / `canNext` are both `count > 1` under loop, as
 *    embla's are.
 * 3. The slide count is registered, not implicit: the track Mount
 *    reports the committed child count once it mounts (and the
 *    buttons start disabled until then, exactly like upstream's
 *    initial `canScroll* = false` before embla initializes), or the
 *    consumer declares it with the `count` prop. Dynamically adding
 *    or removing slides after mount does not re-register.
 * 4. Vertical carousels need a height bound from the consumer (a
 *    height / max-height on the content or root), as any CSS scroll
 *    container does; embla measures its viewport instead.
 * 5. DOM prop spreading (`{...props}`) is not reproduced: pieces take
 *    `class` plus their documented options; chain further attributes
 *    on the returned builder.
 */
import * as Html from "@effect/ui/html/Html";
import type * as Component from "@effect/ui/Component";
import * as Mount from "@effect/ui/Mount";
import type * as View from "@effect/ui/View";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Effect from "effect/Effect";
import * as Queue from "effect/Queue";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import { icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonSize, type ButtonVariant } from "./button.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CarouselOrientation = "horizontal" | "vertical";

// ---------------------------------------------------------------------------
// Props / Model / Messages / Events
// ---------------------------------------------------------------------------

export const CarouselProps = Schema.Struct({
  /** Upstream `orientation` (default `"horizontal"`); also picks the axis. */
  orientation: Schema.optional(Schema.Literals(["horizontal", "vertical"])),
  /** Upstream `opts.loop` (default `false`): wrap at both ends. */
  loop: Schema.optional(Schema.Boolean),
  /** Upstream `setApi` + controlled state: when set, the consumer owns the index. */
  index: Schema.optional(Schema.Number),
  /** Upstream `opts.startIndex` (default `0`): the initial slide. */
  defaultIndex: Schema.optional(Schema.Number),
  /**
   * The declared slide count. Upstream derives it from the embla DOM;
   * here the track Mount registers it on mount in a DOM host — declare
   * it to seed the Model before that (and in non-DOM hosts).
   */
  count: Schema.optional(Schema.Number),
});
export type CarouselProps = typeof CarouselProps.Type;

export const CarouselModel = Schema.Struct({
  index: Schema.Number,
  count: Schema.Number,
  canPrev: Schema.Boolean,
  canNext: Schema.Boolean,
});
export type CarouselModel = typeof CarouselModel.Type;

export const CarouselMessage = UiSchema.TaggedEnum({
  /** Upstream `api.scrollPrev()`. */
  Previous: {},
  /** Upstream `api.scrollNext()`. */
  Next: {},
  /** Upstream `api.scrollTo(index)`. */
  GoTo: { index: Schema.Number },
  /** The slide count became known (track Mount, or a re-measure). */
  RegisterItems: { count: Schema.Number },
  /** The track's own scroll settled on a snap (drag / wheel / swipe). */
  Scrolled: { index: Schema.Number },
});
export type CarouselMessage = typeof CarouselMessage.Type;

export const CarouselEvents = UiSchema.TaggedEnum({
  /** Upstream `api.on("select")`: the settled index changed. */
  Selected: { index: Schema.Number },
});
export type CarouselEvents = typeof CarouselEvents.Type;

/**
 * Upstream's `CarouselApi` type — the embla api object. The Effect
 * surface has no object: control flows in through the props (the
 * controlled `index`) and state flows out through this event type.
 */
export type CarouselApi = CarouselEvents;

// ---------------------------------------------------------------------------
// Derived state (one settle helper owns clamping / wrapping / can*)
// ---------------------------------------------------------------------------

const orientationOf = (props: CarouselProps): CarouselOrientation =>
  props.orientation ?? "horizontal";

const canOf = (
  props: CarouselProps,
  index: number,
  count: number,
): { readonly canPrev: boolean; readonly canNext: boolean } =>
  props.loop === true
    ? { canPrev: count > 1, canNext: count > 1 }
    : { canPrev: index > 0, canNext: index < count - 1 };

/** Settle a target index against the count: wrap under loop, else clamp. */
const settledIndex = (props: CarouselProps, target: number, count: number): number => {
  if (count <= 0) return 0;
  if (props.loop === true) return ((target % count) + count) % count;
  return Math.min(Math.max(target, 0), count - 1);
};

const modelOf = (props: CarouselProps, index: number, count: number): CarouselModel => {
  const settled = settledIndex(props, index, count);
  return { index: settled, count, ...canOf(props, settled, count) };
};

/** The index the parts and the track work from: the prop wins when controlled. */
const effectiveIndex = (props: CarouselProps, model: CarouselModel): number =>
  props.index ?? model.index;

// ---------------------------------------------------------------------------
// Class strings (byte-for-byte upstream new-york-v4)
// ---------------------------------------------------------------------------

export const CAROUSEL_ROOT_CLASS = "relative";

export const CAROUSEL_CONTENT_CLASS = "overflow-hidden";

/**
 * The track's functional layer (declared in the header): upstream's
 * flex track is translated by embla; here it is the scroll container,
 * so it gains the scroll/snap utilities and scrollbar hiding.
 */
export const CAROUSEL_TRACK_SCROLL_CLASS = {
  horizontal:
    "overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  vertical:
    "overflow-y-auto snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
} as const;

export const CAROUSEL_TRACK_CLASS = {
  horizontal: "-ml-4",
  vertical: "-mt-4 flex-col",
} as const;

export const carouselTrackClass = (orientation: CarouselOrientation): string =>
  cn("flex", CAROUSEL_TRACK_CLASS[orientation], CAROUSEL_TRACK_SCROLL_CLASS[orientation]);

export const CAROUSEL_ITEM_CLASS = {
  horizontal: "pl-4",
  vertical: "pt-4",
} as const;

/** Upstream item base + orientation padding + the declared `snap-start`. */
export const carouselItemClass = (orientation: CarouselOrientation): string =>
  cn("min-w-0 shrink-0 grow-0 basis-full snap-start", CAROUSEL_ITEM_CLASS[orientation]);

export const CAROUSEL_PREVIOUS_CLASS = {
  horizontal: "top-1/2 -left-12 -translate-y-1/2",
  vertical: "-top-12 left-1/2 -translate-x-1/2 rotate-90",
} as const;

export const CAROUSEL_NEXT_CLASS = {
  horizontal: "top-1/2 -right-12 -translate-y-1/2",
  vertical: "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
} as const;

// ---------------------------------------------------------------------------
// Icons (lucide, ISC — file-local until lib/icons hoists arrow-left/right)
// ---------------------------------------------------------------------------

/** Lucide `arrow-left`: <path d="m12 19-7-7 7-7" /> + <path d="M19 12H5" /> */
const ArrowLeftIcon = <Msg>(h: Html.H<Msg>) =>
  icon(h, [
    ["path", { d: "m12 19-7-7 7-7" }],
    ["path", { d: "M19 12H5" }],
  ]);

/** Lucide `arrow-right`: <path d="M5 12h14" /> + <path d="m12 5 7 7-7 7" /> */
const ArrowRightIcon = <Msg>(h: Html.H<Msg>) =>
  icon(h, [
    ["path", { d: "M5 12h14" }],
    ["path", { d: "m12 5 7 7-7 7" }],
  ]);

// ---------------------------------------------------------------------------
// The track Mount — the DOM bridge (see the header for the contract)
// ---------------------------------------------------------------------------

/**
 * Attached to the track element. In a DOM host it registers the slide
 * count from the committed children, reports the settled snap index
 * when the track scrolls, and smooth-scrolls the track when the
 * Model's index moves somewhere the scroll position isn't. In hosts
 * whose nodes are not real elements it ends without reporting.
 */
export const CarouselTrack = Mount.makeStream(
  "CarouselTrack",
  { args: { index: Schema.Number, orientation: Schema.String } },
  (node, args, changes) =>
    Stream.callback<CarouselMessage>((queue) => {
      const el = node as HTMLElement;
      if (el === null || typeof el.addEventListener !== "function") return Effect.void;
      let current = args;
      let lastSent = args.index;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const vertical = (): boolean => current.orientation === "vertical";
      const size = (): number => (vertical() ? el.clientHeight : el.clientWidth);
      const indexAt = (): number => {
        const s = size();
        if (!(s > 0)) return 0;
        return Math.round((vertical() ? el.scrollTop : el.scrollLeft) / s);
      };
      const send = (index: number): void => {
        if (index === lastSent) return;
        lastSent = index;
        Queue.offerUnsafe(queue, CarouselMessage.Scrolled({ index }));
      };
      const settle = (): void => {
        timer = undefined;
        send(indexAt());
      };
      const onScroll = (): void => {
        if (timer !== undefined) clearTimeout(timer);
        timer = setTimeout(settle, 80);
      };
      const onScrollEnd = (): void => {
        if (timer !== undefined) clearTimeout(timer);
        timer = undefined;
        send(indexAt());
      };
      el.addEventListener("scroll", onScroll, { passive: true });
      el.addEventListener("scrollend", onScrollEnd);
      if (typeof el.childElementCount === "number") {
        Queue.offerUnsafe(queue, CarouselMessage.RegisterItems({ count: el.childElementCount }));
      }
      return Effect.acquireRelease(
        Effect.sync(() => {
          lastSent = args.index;
        }).pipe(
          Effect.tap(() =>
            Effect.forkScoped(
              Stream.runForEach(changes, (next) =>
                Effect.sync(() => {
                  current = next;
                  if (next.index === lastSent || typeof el.scrollTo !== "function") return;
                  const s = size();
                  if (!(s > 0) || indexAt() === next.index) return;
                  lastSent = next.index;
                  el.scrollTo(
                    vertical()
                      ? { top: next.index * s, behavior: "smooth" }
                      : { left: next.index * s, behavior: "smooth" },
                  );
                }),
              ),
            ),
          ),
        ),
        () =>
          Effect.sync(() => {
            el.removeEventListener("scroll", onScroll);
            el.removeEventListener("scrollend", onScrollEnd);
            if (timer !== undefined) clearTimeout(timer);
          }),
      );
    }),
);

// ---------------------------------------------------------------------------
// The Component
// ---------------------------------------------------------------------------

/**
 * The carousel's state owner (see the file header for the full
 * contract). The `view` closure receives the parts: the state as data
 * (`index`, `count`, `canPrev`, `canNext`, `orientation`, `first`,
 * `last`) and the part appliers — `root`, `content`, `track`, `item`,
 * `previous`, `next`. Draw the styled pieces (`CarouselContent`,
 * `CarouselItem`, `CarouselPrevious`, `CarouselNext`) over them.
 */
export const Carousel = Html.component({
  name: "Carousel",
  props: CarouselProps,
  model: CarouselModel,
  message: CarouselMessage,
  events: CarouselEvents,
}).make({
  init: ({ props }) => modelOf(props, props.index ?? props.defaultIndex ?? 0, props.count ?? 0),
  update: {
    Previous: ($) => {
      const index = effectiveIndex($.props, $.model);
      return goTo($, index - 1);
    },
    Next: ($) => {
      const index = effectiveIndex($.props, $.model);
      return goTo($, index + 1);
    },
    GoTo: ($, { index }) => goTo($, index),
    Scrolled: ($, { index }) => goTo($, index),
    RegisterItems: ($, { count }) => {
      const next = modelOf($.props, effectiveIndex($.props, $.model), count);
      if ($.props.index !== undefined)
        return $.evolve({ count, ...canOf($.props, $.props.index, count) });
      // Registration alone is not a selection: `Selected` fires only
      // when settling on a different index (a clamp from a shrink).
      return next.index === $.model.index
        ? $.evolve(next)
        : $.evolve(next).emit(CarouselEvents.Selected({ index: next.index }));
    },
  },
  parts: (p, model) => {
    const props = p.props;
    const orientation = orientationOf(props);
    const index = effectiveIndex(props, model);
    const { canPrev, canNext } = canOf(props, index, model.count);
    return {
      // -- state as data -------------------------------------------------
      index,
      count: model.count,
      canPrev,
      canNext,
      orientation,
      first: index <= 0,
      last: model.count > 0 && index >= model.count - 1,

      // -- parts ----------------------------------------------------------
      root: p.part("div", (b) =>
        b
          .attrs({
            role: "region",
            "aria-roledescription": "carousel",
            "data-slot": "carousel",
          })
          .class(CAROUSEL_ROOT_CLASS)
          .on(
            "keydown",
            ({ key }) => {
              if (key === "ArrowLeft") return CarouselMessage.Previous();
              if (key === "ArrowRight") return CarouselMessage.Next();
              return undefined;
            },
            { preventDefault: true },
          ),
      ),
      content: p.part("div", (b) =>
        b.attr("data-slot", "carousel-content").class(CAROUSEL_CONTENT_CLASS),
      ),
      track: p.part("div", (b) =>
        b.class(carouselTrackClass(orientation)).onMount(CarouselTrack({ index, orientation })),
      ),
      item: p.part("div", (b) =>
        b
          .attrs({
            role: "group",
            "aria-roledescription": "slide",
            "data-slot": "carousel-item",
          })
          .class(carouselItemClass(orientation)),
      ),
      previous: p.part("button", (b) =>
        b
          .attr("data-slot", "carousel-previous")
          .disabled(!canPrev)
          .on("click", CarouselMessage.Previous()),
      ),
      next: p.part("button", (b) =>
        b.attr("data-slot", "carousel-next").disabled(!canNext).on("click", CarouselMessage.Next()),
      ),
    };
  },
});

/**
 * One navigation step, shared by Previous / Next / GoTo / Scrolled:
 * settle the target against the count; uncontrolled, evolve and emit
 * `Selected` on a change; controlled, only emit `Selected` and let the
 * consumer feed the prop back.
 */
const goTo = (
  $: Component.Update<CarouselModel, CarouselMessage, CarouselEvents, CarouselProps>,
  target: number,
): Component.Step<CarouselModel, CarouselMessage, CarouselEvents, never> => {
  const next = modelOf($.props, target, $.model.count);
  if ($.props.index !== undefined) {
    return next.index === $.props.index
      ? $.evolve({})
      : $.emit(CarouselEvents.Selected({ index: next.index }));
  }
  return next.index === $.model.index
    ? $.evolve({})
    : $.evolve(next).emit(CarouselEvents.Selected({ index: next.index }));
};

/** What a `Carousel`'s `view` gets: the state as data plus the styled parts. */
export type CarouselParts = Component.Headless.Parts<typeof Carousel>;

// ---------------------------------------------------------------------------
// Styled pieces (upstream's exports, as view functions over the parts)
// ---------------------------------------------------------------------------

type Children = View.Content<any, any> | ReadonlyArray<View.Content<any, any>>;

const spread = (children: Children): ReadonlyArray<View.Content<any, any>> =>
  Array.isArray(children) ? children : [children as View.Content<any, any>];

/**
 * Upstream `CarouselContent`: the overflow-hidden viewport wrapping
 * the flex track. Its `class` lands on the TRACK (upstream spreads
 * CarouselContent's props onto the inner div); the children are the
 * slides, drawn inside the track.
 */
export const CarouselContent = <Msg, R = never>(
  c: CarouselParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
  children?: Children,
) => {
  const track = c.track(h.div);
  const styled = options.class === undefined ? track : track.class(options.class);
  return c
    .content(h.div)
    .children(children === undefined ? styled : styled.children(...spread(children)));
};

/** Upstream `CarouselItem`: one slide. Chain `.children(...)` for its content. */
export const CarouselItem = <Msg>(
  c: CarouselParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => {
  const item = c.item(h.div);
  return options.class === undefined ? item : item.class(options.class);
};

type NavOptions = {
  readonly variant?: ButtonVariant | undefined;
  readonly size?: ButtonSize | undefined;
  readonly class?: string | undefined;
};

/** Upstream `CarouselPrevious`: the outline/icon Button at the start edge. */
export const CarouselPrevious = <Msg, R = never>(
  c: CarouselParts,
  h: Html.H<Msg>,
  options: NavOptions = {},
  children?: View.Content<Msg, R>,
) =>
  c
    .previous(h.button)
    .attrs({
      "data-variant": options.variant ?? "outline",
      "data-size": options.size ?? "icon",
    })
    .class(
      cn(
        buttonVariants({ variant: options.variant ?? "outline", size: options.size ?? "icon" }),
        "absolute size-8 rounded-full",
        CAROUSEL_PREVIOUS_CLASS[c.orientation],
        options.class,
      ),
    )
    .children(children ?? [ArrowLeftIcon(h), h.span.class("sr-only").children("Previous slide")]);

/** Upstream `CarouselNext`: the outline/icon Button at the end edge. */
export const CarouselNext = <Msg, R = never>(
  c: CarouselParts,
  h: Html.H<Msg>,
  options: NavOptions = {},
  children?: View.Content<Msg, R>,
) =>
  c
    .next(h.button)
    .attrs({
      "data-variant": options.variant ?? "outline",
      "data-size": options.size ?? "icon",
    })
    .class(
      cn(
        buttonVariants({ variant: options.variant ?? "outline", size: options.size ?? "icon" }),
        "absolute size-8 rounded-full",
        CAROUSEL_NEXT_CLASS[c.orientation],
        options.class,
      ),
    )
    .children(children ?? [ArrowRightIcon(h), h.span.class("sr-only").children("Next slide")]);
