/**
 * Slider (bases generation) — shadcn/ui `slider` ported 1:1 to Effect
 * UI, with the class layer of upstream's bases/radix generation instead
 * of new-york-v4's.
 *
 * Same port as registry/ui/slider.ts — the @effect/ui-kit `Slider`
 * headless component: the consumer's Model owns the value (one number,
 * or an array for a range slider), the kit handles pointer drag,
 * keyboard, ARIA and the hidden native range input inside each thumb,
 * and emits `Moved` / `Committed`, surfaced here under upstream's names
 * `onValueChange` / `onValueCommit`. Only the classes differ.
 *
 * Class strings are byte-for-byte the shadcn bases/radix strings:
 * structural utilities stay inline, everything visual (track height
 * and colour, range colour, thumb size/shape) moves to the
 * `cn-slider` / `cn-slider-track` / `cn-slider-range` / `cn-slider-thumb`
 * hooks, which the style presets (registry/styles/style-*.css) fill in.
 *
 * Anatomy diffs vs the new-york port, declared:
 *
 * - **Orientation/disabled variants change form.** Bases keys off
 *   `data-vertical:` / `data-horizontal:` / `data-disabled:` where
 *   new-york used `data-[orientation=…]:` / `data-[disabled]:`. The
 *   strings are upstream's, verbatim; the kit writes `data-orientation`
 *   and `data-disabled` on every part.
 * - **The track loses `rounded-full bg-muted` and its orientation size
 *   utilities, the range loses `bg-primary`, the thumb loses
 *   `size-4 rounded-full border … ring` styling** — all of it lives in
 *   the preset hooks now.
 *
 * Declared translations (mechanical, no silent drops — unchanged from
 * the new-york port):
 *
 * - **No separate control element.** The kit splits upstream's root into
 *   a `root` part (role="group") and a `control` part (the pointer area).
 *   This port stacks `control` onto the same element as `root` — part
 *   stacking is the kit's own composition idiom — so the DOM keeps
 *   upstream's single root element carrying `data-slot="slider"`.
 * - **Positioning via the kit's CSS variables.** Radix inline-styles
 *   each thumb and the range; the kit publishes
 *   `--slider-thumb-position` on each thumb and
 *   `--slider-indicator-start` / `--slider-indicator-size` on the
 *   indicator. The port appends arbitrary-property classes that consume
 *   exactly those variables (see `THUMB_POSITION` / `RANGE_POSITION`),
 *   so the rendered geometry matches upstream while every upstream
 *   class string stays verbatim.
 * - **Thumb `disabled:` variants.** Upstream's thumb string keys
 *   `disabled:pointer-events-none disabled:opacity-50` off the native
 *   disabled state. In the kit the hidden input carries `disabled` and
 *   the thumb element carries `data-disabled`, so the port appends the
 *   `data-disabled:` equivalents alongside.
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
import { Slider as KitSlider, type SliderProps } from "@effect/ui-kit";
import type { Html } from "@effect/ui/html";
import { cn } from "@/lib/utils";

export type { SliderProps };

/** One number for one thumb, or one number per thumb for a range slider. */
export type SliderValue = number | ReadonlyArray<number>;

export const SLIDER_CLASS =
  "cn-slider relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col";

export const SLIDER_TRACK_CLASS =
  "cn-slider-track relative grow overflow-hidden data-horizontal:w-full data-vertical:h-full";

export const SLIDER_RANGE_CLASS =
  "cn-slider-range absolute select-none data-horizontal:h-full data-vertical:w-full";

export const SLIDER_THUMB_CLASS =
  "cn-slider-thumb block shrink-0 select-none disabled:pointer-events-none disabled:opacity-50";

/**
 * Where the kit's `--slider-thumb-position` places the thumb: a
 * percentage from the left (horizontal) or from the bottom (vertical),
 * centred on that point — Radix's inline-style geometry, as classes.
 */
const THUMB_POSITION: Record<"horizontal" | "vertical", string> = {
  horizontal:
    "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 [left:var(--slider-thumb-position)]",
  vertical:
    "absolute left-1/2 -translate-x-1/2 translate-y-1/2 [bottom:var(--slider-thumb-position)]",
};

/** The kit's `--slider-indicator-start` / `--slider-indicator-size`, as classes. */
const RANGE_POSITION: Record<"horizontal" | "vertical", string> = {
  horizontal: "[left:var(--slider-indicator-start)] [width:var(--slider-indicator-size)]",
  vertical: "[bottom:var(--slider-indicator-start)] [height:var(--slider-indicator-size)]",
};

/** Kit-attribute equivalents of the thumb's upstream `disabled:` variants. */
const THUMB_DISABLED = "data-disabled:pointer-events-none data-disabled:opacity-50";

/**
 * A shadcn-styled slider (bases generation). Controlled: pass the
 * current value in `props.value` (plus `min` / `max` / `step` /
 * `orientation` / `disabled` — the kit's `SliderProps`) and store what
 * the handlers report:
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
    readonly props: SliderProps;
    /** Upstream's `onValueChange`: each value the user moves to. */
    readonly onValueChange?:
      ((event: { readonly value: SliderValue }) => Msg | undefined) | undefined;
    /** Upstream's `onValueCommit`: the value once a drag or key press ends. */
    readonly onValueCommit?:
      ((event: { readonly value: SliderValue }) => Msg | undefined) | undefined;
    readonly class?: string | undefined;
    readonly trackClass?: string | undefined;
    readonly rangeClass?: string | undefined;
    readonly thumbClass?: string | undefined;
    /** The form name given to every thumb's hidden range input. */
    readonly name?: string | undefined;
    /** One `aria-label` per thumb, by index. */
    readonly ariaLabels?: ReadonlyArray<string> | undefined;
  },
) =>
  KitSlider(h, {
    props: options.props,
    // The kit's onEmit map wants a handler per event; an unhandled
    // event gets a no-op rather than an absent key.
    onEmit: {
      Moved: options.onValueChange ?? (() => undefined),
      Committed: options.onValueCommit ?? (() => undefined),
    },
    view: (slider) => {
      const orientation = slider.orientation;
      return slider
        .root(slider.control(h.div))
        .attr("data-slot", "slider")
        .class(cn(SLIDER_CLASS, options.class))
        .children(
          slider
            .track(h.div)
            .attr("data-slot", "slider-track")
            .class(cn(SLIDER_TRACK_CLASS, options.trackClass))
            .children(
              slider
                .indicator(h.div)
                .attr("data-slot", "slider-range")
                .class(cn(SLIDER_RANGE_CLASS, RANGE_POSITION[orientation], options.rangeClass)),
            ),
          ...slider.values.map((_, index) => {
            let input = h.input;
            if (options.name !== undefined) {
              input = input.attr("name", options.name);
            }
            const ariaLabel = options.ariaLabels?.[index];
            if (ariaLabel !== undefined) {
              input = input.attr("aria-label", ariaLabel);
            }
            return slider
              .thumb({ element: h.div, input, index })
              .attr("data-slot", "slider-thumb")
              .class(
                cn(
                  SLIDER_THUMB_CLASS,
                  THUMB_POSITION[orientation],
                  THUMB_DISABLED,
                  options.thumbClass,
                ),
              );
          }),
        );
    },
  });
