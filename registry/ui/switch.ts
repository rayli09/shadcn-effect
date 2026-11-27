/**
 * Switch — shadcn/ui `switch` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix Switch.Root / Switch.Thumb, with a `size` prop
 * ("sm" | "default") rendered as `data-size`. Here: the @effect/ui-kit
 * `Switch` view function — it keeps no state, the consumer's Model owns
 * `checked` (required in the kit's `SwitchProps`, as in Radix controlled
 * usage), and a toggle arrives through `onToggle` as a Message.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings.
 *
 * One mechanical translation, declared: upstream styles key off Radix's
 * `data-state="checked" | "unchecked"` on both root and thumb, while the kit
 * writes `data-checked` / `data-unchecked`. The upstream classes use
 * `data-[state=checked]:` variants, so this port also writes `data-state`
 * (derived from the controlled `checked` prop) on both parts, keeping every
 * upstream class live.
 */
import { Switch as KitSwitch, type SwitchProps } from "@effect/ui-kit";
import type { Html } from "@effect/ui/html";
import { cn } from "@/lib/utils";

export type SwitchSize = "sm" | "default";

export const SWITCH_CLASS =
  "peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80";

export const SWITCH_THUMB_CLASS =
  "pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground";

/**
 * A shadcn-styled switch. Controlled, exactly like upstream:
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
