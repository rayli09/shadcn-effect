/**
 * ScrollArea (bases generation) — shadcn/ui `scroll-area` ported 1:1
 * to Effect UI, with the class layer of upstream's bases/radix
 * generation instead of new-york-v4's.
 *
 * Same port as registry/ui/scroll-area.ts — the @effect/ui-kit
 * `ScrollArea` headless component: it measures the viewport and
 * content, keeps hover / scrolling / overflow state, and handles
 * scrollbar wheel, track press and thumb dragging. Your content goes
 * in the viewport, as upstream. Upstream renders one vertical
 * `ScrollBar` and a corner; so does the composed `ScrollArea` below.
 *
 * Class strings are byte-for-byte the shadcn bases/radix strings:
 * structural utilities stay inline, everything visual moves to the
 * `cn-scroll-area*` hooks, which the style presets
 * (registry/styles/style-*.css) fill in.
 *
 * Anatomy diffs vs the new-york port, declared:
 *
 * - **Orientation is an attribute, not classes.** The bases scrollbar
 *   carries `data-orientation` (stamped here from the `orientation`
 *   option) and the hook sizes the track off it; the new-york port's
 *   per-orientation class constants (`SCROLL_BAR_VERTICAL_CLASS` /
 *   `SCROLL_BAR_HORIZONTAL_CLASS`, with their border utilities) are
 *   gone, and with them the thumb's `rounded-full` — both live in the
 *   `cn-scroll-area-scrollbar` / `cn-scroll-area-thumb` hooks now.
 *
 * Declared translations carried over from the new-york port
 * (mechanical, no silent drops):
 *
 * - **Content wrapper (D-6 shape).** The kit draws a `content` part
 *   (`min-width: fit-content`, `role="presentation"`) inside the
 *   viewport and measures it; upstream puts children directly in the
 *   viewport. One extra `<div>` in the DOM, nothing else changes.
 * - **Scrollbar presence.** The kit's `scrollbar` part returns
 *   `undefined` while its axis does not overflow; upstream's bar is in
 *   the DOM whenever Radix mounts it (default `type="hover"`). The
 *   composed `ScrollArea` below passes `keepMounted`, so the bar is
 *   present like upstream's; the standalone `ScrollBar` applier leaves
 *   `keepMounted` to the caller. Radix's `type` prop
 *   (`hover` / `scroll` / `always` / `auto`) has no kit equivalent —
 *   visibility is overflow-driven, with `data-scrolling` /
 *   `data-hovering` exposed for styling.
 * - **Positioning is the kit's.** The kit positions scrollbar and
 *   corner itself (inline styles: absolute, corner-size variables,
 *   thumb size via `--scroll-area-thumb-height` / `-width` and a
 *   transform), just as Radix positioned its own parts. Upstream's
 *   class strings are kept verbatim alongside.
 * - **Corner** renders only while both axes overflow (the kit decides,
 *   like Radix); it carries no `data-slot` or class upstream, and none
 *   here.
 */
import type * as Component from "@effect/ui/Component";
import type * as View from "@effect/ui/View";
import {
  ScrollArea as KitScrollArea,
  type ScrollAreaOrientation,
  type ScrollAreaProps,
} from "@effect/ui-kit";
import type { Html } from "@effect/ui/html";
import { cn } from "@/lib/utils";

export type { ScrollAreaOrientation, ScrollAreaProps };

/** The kit ScrollArea's parts, as handed to a `view` closure. */
export type ScrollAreaParts = Component.Headless.Parts<typeof KitScrollArea>;

export const SCROLL_AREA_CLASS = "cn-scroll-area relative";

export const SCROLL_AREA_VIEWPORT_CLASS =
  "cn-scroll-area-viewport size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1";

export const SCROLL_BAR_CLASS =
  "cn-scroll-area-scrollbar flex touch-none p-px transition-colors select-none";

export const SCROLL_BAR_THUMB_CLASS = "cn-scroll-area-thumb relative flex-1 bg-border";

/**
 * shadcn's `ScrollBar`, as a styled applier over the kit ScrollArea
 * parts from a `view` closure (headless parts have no standalone
 * components in Effect UI, D-6). Returns `undefined` while the axis
 * does not overflow, unless `keepMounted` is set — chain with `?.`
 * or pass it straight to `.children(...)`, which skips `undefined`.
 * The track is stamped with upstream's `data-orientation`.
 *
 *   ScrollBar(area, { element: h.div, thumb: h.div, keepMounted: true })
 */
export const ScrollBar = <B extends View.PartTarget<"div">, T extends View.PartTarget<"div">>(
  parts: ScrollAreaParts,
  options: {
    readonly element: B;
    readonly thumb: T;
    readonly orientation?: ScrollAreaOrientation | undefined;
    readonly keepMounted?: boolean | undefined;
    readonly class?: string | undefined;
    readonly thumbClass?: string | undefined;
  },
  // The part's own return type, spelled out: left inferred, the
  // generic `WithRequirements` collapses to `unknown` for callers.
): View.WithRequirements<B, View.Requirements<T>> | undefined => {
  const orientation = options.orientation ?? "vertical";
  // The kit's `scrollbar` part returns the track with the thumb's
  // requirements joined (`WithRequirements`), which cannot be chained
  // on while `B` is generic — style the track before handing it to
  // the part instead, the same shape the thumb below (and the kit's
  // own example) uses. The part sets neither `data-slot` nor `class`,
  // so the rendered track is unchanged. The styled builders are bound
  // to `B` / `T` locals first: passed inline, the part's generic
  // inference loses the element's type and the result degrades to
  // `unknown`.
  const element: B = options.element
    .attr("data-slot", "scroll-area-scrollbar")
    .attr("data-orientation", orientation)
    .class(cn(SCROLL_BAR_CLASS, options.class));
  const thumb: T = options.thumb
    .attr("data-slot", "scroll-area-thumb")
    .class(cn(SCROLL_BAR_THUMB_CLASS, options.thumbClass));
  return parts.scrollbar({
    element,
    thumb,
    orientation,
    keepMounted: options.keepMounted,
  });
};

/**
 * A shadcn-styled scroll area: a viewport holding your `children`, one
 * scrollbar (vertical by default, exactly the `ScrollBar` upstream
 * renders; pass `orientation: "horizontal"` for the other axis) and a
 * corner. `props` is the kit's `ScrollAreaProps` (just an optional
 * `overflowEdgeThreshold`).
 *
 *   ScrollArea(h, { children: h.div.children(...) })
 */
export const ScrollArea = <Msg, R = never>(
  h: Html.H<Msg>,
  options: {
    readonly props?: ScrollAreaProps | undefined;
    readonly class?: string | undefined;
    readonly viewportClass?: string | undefined;
    readonly scrollbarClass?: string | undefined;
    readonly thumbClass?: string | undefined;
    readonly orientation?: ScrollAreaOrientation | undefined;
    readonly children: View.Content<Msg, R>;
  },
) =>
  KitScrollArea(h, {
    props: options.props,
    view: (area) =>
      area
        .root(h.div)
        .attr("data-slot", "scroll-area")
        .class(cn(SCROLL_AREA_CLASS, options.class))
        .children(
          area
            .viewport(h.div)
            .attr("data-slot", "scroll-area-viewport")
            .class(cn(SCROLL_AREA_VIEWPORT_CLASS, options.viewportClass))
            .children(area.content(h.div).children(options.children)),
          ScrollBar(area, {
            element: h.div,
            thumb: h.div,
            orientation: options.orientation ?? "vertical",
            keepMounted: true,
            class: options.scrollbarClass,
            thumbClass: options.thumbClass,
          }),
          area.corner(h.div),
        ),
  });
