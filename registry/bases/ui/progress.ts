/**
 * Progress (bases generation) — shadcn/ui `progress` ported 1:1 to
 * Effect UI.
 *
 * Same Effect port as `registry/ui/progress.ts` (the @effect/ui-kit
 * `Progress` headless component — the consumer's Model owns the value,
 * the kit writes the ARIA and state attributes); only the class layer
 * changes: class strings are byte-for-byte the shadcn bases/radix strings
 * — structural inline classes plus the `cn-progress` /
 * `cn-progress-indicator` hook classes whose utilities are supplied by
 * the style presets. The parity checker asserts every token in
 * `parity/bases-tokens.json["progress"]`.
 *
 * Anatomy diffs vs the new-york generation (upstream's, preserved): the
 * root is now a flex row (`flex items-center overflow-x-hidden`) instead
 * of a fixed-height rounded track — height, rounding and track/indicator
 * colors moved into the presets' `cn-progress` rules.
 *
 * Declared translations (mechanical, no silent drops — same as the
 * new-york port):
 *
 * - **Fill mechanism.** Upstream's indicator is `size-full` and is
 *   shifted with an inline `transform: translateX(-${100 - (value || 0)}%)`
 *   inside the overflow-hidden root. The kit instead sets the indicator's
 *   inline `width: <percentage>%`. The rendered fill is identical (the
 *   first `value`% of the bar), so the upstream transform is NOT
 *   reproduced — combined with the kit's width it would double-apply and
 *   under-fill.
 * - **No track element.** The kit has a `track` part; upstream's DOM is
 *   Root > Indicator with no track, so this port draws the indicator
 *   directly in the root and leaves the track part unused.
 * - **`data-state` bridged (D-5).** Radix writes
 *   `data-state="loading" | "complete" | "indeterminate"`; the kit writes
 *   `data-progressing` / `data-complete` / `data-indeterminate`. No
 *   upstream class keys off `data-state`, but the port still writes it
 *   (from the kit's `status`) on root and indicator so the DOM matches
 *   upstream for any consumer CSS that does.
 * - **Naming.** The kit root's `aria-labelledby` always points at its
 *   label part's id; this port draws no label, so name the bar with the
 *   `ariaLabel` option (the kit's documented route for a label-less bar).
 */
import { Progress as KitProgress, type ProgressProps, type ProgressStatus } from "@effect/ui-kit";
import type { Html } from "@effect/ui/html";
import { cn } from "@/lib/utils";

export type { ProgressProps, ProgressStatus };

export const PROGRESS_CLASS = "cn-progress relative flex w-full items-center overflow-x-hidden";

export const PROGRESS_INDICATOR_CLASS = "cn-progress-indicator size-full flex-1 transition-all";

/** The kit's status in Radix's `data-state` vocabulary. */
const dataState = (status: ProgressStatus): string =>
  status === "complete" ? "complete" : status === "indeterminate" ? "indeterminate" : "loading";

/**
 * A shadcn-styled progress bar (bases generation). Controlled, exactly
 * like upstream: pass the current value in `props.value` (`null`, or a
 * non-finite number, while the progress is unknown), plus optional `min` /
 * `max` / `valueText` — the kit's `ProgressProps`.
 *
 *   Progress(h, { props: { value: model.sent }, ariaLabel: "Uploading" })
 */
export const Progress = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly props: ProgressProps;
    readonly class?: string | undefined;
    readonly indicatorClass?: string | undefined;
    /** Names the bar when no visible label is drawn (see header). */
    readonly ariaLabel?: string | undefined;
  },
) =>
  KitProgress(h, {
    props: options.props,
    view: (progress) => {
      const state = dataState(progress.status);
      let root = progress
        .root(h.div)
        .attr("data-slot", "progress")
        .attr("data-state", state)
        .class(cn(PROGRESS_CLASS, options.class));
      if (options.ariaLabel !== undefined) {
        root = root.attr("aria-label", options.ariaLabel);
      }
      return root.children(
        progress
          .indicator(h.div)
          .attr("data-slot", "progress-indicator")
          .attr("data-state", state)
          .class(cn(PROGRESS_INDICATOR_CLASS, options.indicatorClass)),
      );
    },
  });
