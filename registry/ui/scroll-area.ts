/**
 * ScrollArea — shadcn/ui `scroll-area` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix ScrollArea (Root / Viewport / Scrollbar /
 * Thumb / Corner), with `ScrollArea` rendering one vertical `ScrollBar`
 * and a corner. Here: the @effect/ui-kit `ScrollArea` headless
 * component — it measures the viewport and content, keeps hover /
 * scrolling / overflow state, and handles scrollbar wheel, track press
 * and thumb dragging. Your content goes in the viewport, as upstream.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings.
 *
 * Declared translations (mechanical, no silent drops):
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
import type * as Component from "@effect/ui/Component"
import type * as View from "@effect/ui/View"
import {
  ScrollArea as KitScrollArea,
  type ScrollAreaOrientation,
  type ScrollAreaProps
} from "@effect/ui-kit"
import type { Html } from "@effect/ui/html"
import { cn } from "../lib/utils.ts"

export type { ScrollAreaOrientation, ScrollAreaProps }

/** The kit ScrollArea's parts, as handed to a `view` closure. */
export type ScrollAreaParts = Component.Headless.Parts<typeof KitScrollArea>

export const SCROLL_AREA_CLASS = "relative"

export const SCROLL_AREA_VIEWPORT_CLASS =
  "size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"

export const SCROLL_BAR_CLASS =
  "flex touch-none p-px transition-colors select-none"

export const SCROLL_BAR_VERTICAL_CLASS =
  "h-full w-2.5 border-l border-l-transparent"

export const SCROLL_BAR_HORIZONTAL_CLASS =
  "h-2.5 flex-col border-t border-t-transparent"

export const SCROLL_BAR_THUMB_CLASS = "relative flex-1 rounded-full bg-border"

/**
 * shadcn's `ScrollBar`, as a styled applier over the kit ScrollArea
 * parts from a `view` closure (headless parts have no standalone
 * components in Effect UI, D-6). Returns `undefined` while the axis
 * does not overflow, unless `keepMounted` is set — chain with `?.`
 * or pass it straight to `.children(...)`, which skips `undefined`.
 *
 *   ScrollBar(area, { element: h.div, thumb: h.div, keepMounted: true })
 */
export const ScrollBar = <
  B extends View.PartTarget<"div">,
  T extends View.PartTarget<"div">
>(
  parts: ScrollAreaParts,
  options: {
    readonly element: B
    readonly thumb: T
    readonly orientation?: ScrollAreaOrientation | undefined
    readonly keepMounted?: boolean | undefined
    readonly class?: string | undefined
    readonly thumbClass?: string | undefined
  }
) => {
  const orientation = options.orientation ?? "vertical"
  const built = parts.scrollbar({
    element: options.element,
    thumb: options.thumb
      .attr("data-slot", "scroll-area-thumb")
      .class(cn(SCROLL_BAR_THUMB_CLASS, options.thumbClass)),
    orientation,
    keepMounted: options.keepMounted
  })
  return built
    ?.attr("data-slot", "scroll-area-scrollbar")
    .class(cn(
      SCROLL_BAR_CLASS,
      orientation === "vertical"
        ? SCROLL_BAR_VERTICAL_CLASS
        : SCROLL_BAR_HORIZONTAL_CLASS,
      options.class
    ))
}

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
    readonly props?: ScrollAreaProps | undefined
    readonly class?: string | undefined
    readonly viewportClass?: string | undefined
    readonly scrollbarClass?: string | undefined
    readonly thumbClass?: string | undefined
    readonly orientation?: ScrollAreaOrientation | undefined
    readonly children: View.Content<Msg, R>
  }
) =>
  KitScrollArea(h, {
    props: options.props,
    view: (area) =>
      area.root(h.div)
        .attr("data-slot", "scroll-area")
        .class(cn(SCROLL_AREA_CLASS, options.class))
        .children(
          area.viewport(h.div)
            .attr("data-slot", "scroll-area-viewport")
            .class(cn(SCROLL_AREA_VIEWPORT_CLASS, options.viewportClass))
            .children(area.content(h.div).children(options.children)),
          ScrollBar(area, {
            element: h.div,
            thumb: h.div,
            orientation: options.orientation ?? "vertical",
            keepMounted: true,
            class: options.scrollbarClass,
            thumbClass: options.thumbClass
          }),
          area.corner(h.div)
        )
  })
