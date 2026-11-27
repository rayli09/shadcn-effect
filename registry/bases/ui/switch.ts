/**
 * Switch (bases generation) — shadcn/ui `switch` ported 1:1 to Effect
 * UI, with the class layer of upstream's bases/radix generation instead
 * of new-york-v4's.
 *
 * Same port as registry/ui/switch.ts — the @effect/ui-kit `Switch` view
 * function: it keeps no state, the consumer's Model owns `checked`
 * (required in the kit's `SwitchProps`, as in Radix controlled usage),
 * and a toggle arrives through `onToggle` as a Message. Only the
 * classes differ.
 *
 * Class strings are byte-for-byte the shadcn bases/radix strings:
 * structural utilities stay inline, everything visual (track size,
 * colours, thumb size and travel) moves to the `cn-switch` /
 * `cn-switch-thumb` hooks, which the style presets
 * (registry/styles/style-*.css) fill in. The root's disabled styling
 * uses the `data-disabled:` variant form — the kit writes
 * `data-disabled` natively, so no bridge is needed there.
 *
 * Anatomy diff vs the new-york port, declared: the root gains
 * `relative` and an `after:` hit-area extension (upstream bases adds
 * both), and the `data-[size=…]` / `data-[state=…]` sizing and colour
 * utilities leave the class layer for the preset hooks.
 *
 * Data-attribute bridging is kept exactly as the new-york port does it:
 * this port also writes `data-state` (derived from the controlled
 * `checked` prop) on root and thumb, alongside the kit's native
 * `data-checked` / `data-unchecked`.
 */
import { Switch as KitSwitch, type SwitchProps } from "@effect/ui-kit";
import type { Html } from "@effect/ui/html";
import { cn } from "@/lib/utils";

export type SwitchSize = "sm" | "default";

export const SWITCH_CLASS =
  "cn-switch peer group/switch relative inline-flex items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50";

export const SWITCH_THUMB_CLASS =
  "cn-switch-thumb pointer-events-none block ring-0 transition-transform";

/**
 * A shadcn-styled switch (bases generation). Controlled, exactly like
 * upstream:
 *
 *   Switch(h, {
 *     props: { checked: model.notify, name: "notify" },
 *     onToggle: ({ checked }) => Msg.ToggledNotify({ checked }),
 *     size: "sm"
 *   })
 */
export const Switch = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly props: SwitchProps;
    /** The Message a toggle sends, with the value the user asked for. */
    readonly onToggle?: ((event: { readonly checked: boolean }) => Msg | undefined) | undefined;
    readonly size?: SwitchSize | undefined;
    readonly class?: string | undefined;
    readonly thumbClass?: string | undefined;
  },
) => {
  const size = options.size ?? "default";
  const state = options.props.checked ? "checked" : "unchecked";
  return KitSwitch(h, {
    props: options.props,
    onToggle: options.onToggle,
    view: (parts) =>
      parts
        .root(h.button)
        .attr("data-slot", "switch")
        .attr("data-size", size)
        .attr("data-state", state)
        .class(cn(SWITCH_CLASS, options.class))
        .children(
          parts
            .thumb(h.span)
            .attr("data-slot", "switch-thumb")
            .attr("data-state", state)
            .class(cn(SWITCH_THUMB_CLASS, options.thumbClass)),
        ),
  });
};
