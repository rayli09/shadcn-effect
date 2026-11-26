/**
 * Slider — shadcn/ui `slider` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix Slider (Root / Track / Range / Thumb). Here:
 * the @effect/ui-kit `Slider` headless component — the consumer's Model
 * owns the value (one number, or an array for a range slider), the kit
 * handles pointer drag, keyboard, ARIA and the hidden native range input
 * inside each thumb, and emits `Moved` / `Committed`, surfaced here
 * under upstream's names `onValueChange` / `onValueCommit`.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings.
 *
 * Declared translations (mechanical, no silent drops):
 *
 * - **No separate control element.** The kit splits upstream's root into
 *   a `root` part (role="group") and a `control` part (the pointer area).
 *   This port stacks `control` onto the same element as `root` — part
 *   stacking is the kit's own composition idiom (its docs stack a
 *   Field's `group` part onto the slider root the same way) — so the DOM
 *   keeps upstream's single root element carrying `data-slot="slider"`.
 * - **Positioning via the kit's CSS variables.** Radix inline-styles
 *   each thumb (`position:absolute`, a percentage along the track,
 *   `translate(-50%,-50%)`) and the range (start/size percentages). The
 *   kit sets no layout; it publishes `--slider-thumb-position` on each
 *   thumb and `--slider-indicator-start` / `--slider-indicator-size` on
 *   the indicator. The port appends arbitrary-property classes that
 *   consume exactly those variables (see `THUMB_POSITION` /
 *   `RANGE_POSITION`), so the rendered geometry matches upstream while
 *   every upstream class string stays verbatim.
 * - **Thumb `disabled:` variants.** Upstream's thumb string keys
 *   `disabled:pointer-events-none disabled:opacity-50` off the native
 *   disabled state. In the kit the hidden input carries `disabled` and
 *   the thumb element carries `data-disabled`, so the port appends the
 *   `data-disabled:` equivalents alongside (same pattern as accordion's
 *   kit-attribute animation classes). The root's `data-[disabled]:`
 *   and every `data-[orientation=…]:` variant need no bridge: the kit
 *   writes `data-disabled` and `data-orientation` on every part.
 * - **Controlled only (D-7 family).** Upstream accepts `defaultValue`;
 *   the kit Slider has no uncontrolled mode. The consumer owns `value`
 *   and stores what `onValueChange` reports.
 * - **Thumb naming.** Naming each thumb's input is the consumer's job
 *   in the kit; since this port draws the thumbs, it exposes `name`
 *   (the form name for every thumb's input) and `ariaLabels` (one
 *   `aria-label` per thumb, by index — e.g. "Minimum" / "Maximum").
 * - The kit's `value` part (an `<output>`) has no upstream counterpart
 *   and is not drawn.
 */
import { Slider as KitSlider, type SliderProps } from "@effect/ui-kit"
import type { Html } from "@effect/ui/html"
import { cn } from "../lib/utils.ts"

export type { SliderProps }

/** One number for one thumb, or one number per thumb for a range slider. */
export type SliderValue = number | ReadonlyArray<number>

export const SLIDER_CLASS =
  "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col"

export const SLIDER_TRACK_CLASS =
  "relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"

export const SLIDER_RANGE_CLASS =
  "absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"

export const SLIDER_THUMB_CLASS =
  "block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"

/**
 * Where the kit's `--slider-thumb-position` places the thumb: a
 * percentage from the left (horizontal) or from the bottom (vertical),
 * centred on that point — Radix's inline-style geometry, as classes.
 */
const THUMB_POSITION: Record<"horizontal" | "vertical", string> = {
  horizontal:
    "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 [left:var(--slider-thumb-position)]",
  vertical:
    "absolute left-1/2 -translate-x-1/2 translate-y-1/2 [bottom:var(--slider-thumb-position)]"
}

/** The kit's `--slider-indicator-start` / `--slider-indicator-size`, as classes. */
const RANGE_POSITION: Record<"horizontal" | "vertical", string> = {
  horizontal:
    "[left:var(--slider-indicator-start)] [width:var(--slider-indicator-size)]",
  vertical:
    "[bottom:var(--slider-indicator-start)] [height:var(--slider-indicator-size)]"
}

/** Kit-attribute equivalents of the thumb's upstream `disabled:` variants. */
const THUMB_DISABLED =
  "data-disabled:pointer-events-none data-disabled:opacity-50"

/**
 * A shadcn-styled slider. Controlled: pass the current value in
 * `props.value` (plus `min` / `max` / `step` / `orientation` / `disabled`
 * — the kit's `SliderProps`) and store what the handlers report:
 *
 *   Slider(h, {
 *     props: { value: model.volume },
 *     onValueChange: ({ value }) => Msg.MovedVolume({ value }),
 *     name: "volume",
 *     ariaLabels: ["Volume"]
 *   })
 */
export const Slider = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly props: SliderProps
    /** Upstream's `onValueChange`: each value the user moves to. */
    readonly onValueChange?:
      | ((event: { readonly value: SliderValue }) => Msg | undefined)
      | undefined
    /** Upstream's `onValueCommit`: the value once a drag or key press ends. */
    readonly onValueCommit?:
      | ((event: { readonly value: SliderValue }) => Msg | undefined)
      | undefined
    readonly class?: string | undefined
    readonly trackClass?: string | undefined
    readonly rangeClass?: string | undefined
    readonly thumbClass?: string | undefined
    /** The form name given to every thumb's hidden range input. */
    readonly name?: string | undefined
    /** One `aria-label` per thumb, by index. */
    readonly ariaLabels?: ReadonlyArray<string> | undefined
  }
) =>
  KitSlider(h, {
    props: options.props,
    // The kit's onEmit map wants a handler per event; an unhandled
    // event gets a no-op rather than an absent key.
    onEmit: {
      Moved: options.onValueChange ?? (() => undefined),
      Committed: options.onValueCommit ?? (() => undefined)
    },
    view: (slider) => {
      const orientation = slider.orientation
      return slider.root(slider.control(h.div))
        .attr("data-slot", "slider")
        .class(cn(SLIDER_CLASS, options.class))
        .children(
          slider.track(h.div)
            .attr("data-slot", "slider-track")
            .class(cn(SLIDER_TRACK_CLASS, options.trackClass))
            .children(
              slider.indicator(h.div)
                .attr("data-slot", "slider-range")
                .class(cn(
                  SLIDER_RANGE_CLASS,
                  RANGE_POSITION[orientation],
                  options.rangeClass
                ))
            ),
          ...slider.values.map((_, index) => {
            let input = h.input
            if (options.name !== undefined) {
              input = input.attr("name", options.name)
            }
            const ariaLabel = options.ariaLabels?.[index]
            if (ariaLabel !== undefined) {
              input = input.attr("aria-label", ariaLabel)
            }
            return slider.thumb({ element: h.div, input, index })
              .attr("data-slot", "slider-thumb")
              .class(cn(
                SLIDER_THUMB_CLASS,
                THUMB_POSITION[orientation],
                THUMB_DISABLED,
                options.thumbClass
              ))
          })
        )
    }
  })
