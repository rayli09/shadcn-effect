/**
 * Checkbox (bases generation) — shadcn/ui `checkbox` ported 1:1 to
 * Effect UI, with the class layer of upstream's bases/radix generation
 * instead of new-york-v4's.
 *
 * Same port as registry/ui/checkbox.ts — the @effect/ui-kit `Checkbox`
 * headless component, the consumer's Model owns `checked`, a toggle
 * arrives as the kit's `Toggled` event forwarded to the caller's
 * `onToggle` Message, and the check is the shared `CheckIcon` builder
 * from registry/lib/icons.ts (upstream bases renders its icon
 * placeholder with lucide="CheckIcon"). Only the classes differ.
 *
 * Class strings are byte-for-byte the shadcn bases/radix strings:
 * structural utilities stay inline, everything visual (size, border,
 * checked colours) moves to the `cn-checkbox` / `cn-checkbox-indicator`
 * hooks, which the style presets (registry/styles/style-*.css) fill in.
 *
 * Anatomy diff vs the new-york port, declared: the root gains
 * `relative` and an `after:` hit-area extension (upstream bases adds
 * both); the visual tokens the new-york string carried inline
 * (`size-4`, `border-input`, `data-[state=checked]:bg-primary`, …) are
 * gone from the class layer by design — the preset owns them now.
 *
 * Data-attribute bridging is kept exactly as the new-york port does it:
 * upstream styles key off Radix's `data-state="checked" | "unchecked" |
 * "indeterminate"`, while the kit writes `data-checked` /
 * `data-unchecked` / `data-indeterminate`, so this port also writes
 * `data-state` (derived from the controlled props) on the root and the
 * indicator. No `asChild`: composition is stacking a part on the same
 * builder, per D-2.
 */
import { Checkbox as KitCheckbox, type CheckboxProps } from "@effect/ui-kit";
import type { Html } from "@effect/ui/html";
import { CheckIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export const CHECKBOX_CLASS =
  "cn-checkbox peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50";

export const CHECKBOX_INDICATOR_CLASS =
  "cn-checkbox-indicator grid place-content-center text-current transition-none";

/**
 * A shadcn-styled checkbox (bases generation). Controlled, exactly like
 * upstream: pass the current value in `props.checked` (plus `name` /
 * `value` / `disabled` / `indeterminate` / … — the kit's `CheckboxProps`
 * are Radix's props, renamed only where Effect already had the word),
 * and store what `onToggle` reports:
 *
 *   Checkbox(h, {
 *     props: { checked: model.terms, name: "terms" },
 *     onToggle: ({ checked }) => Msg.ToggledTerms({ checked })
 *   })
 */
export const Checkbox = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly props?: CheckboxProps | undefined;
    /** The Message a toggle sends, with the value the user asked for. */
    readonly onToggle?: ((event: { readonly checked: boolean }) => Msg | undefined) | undefined;
    readonly class?: string | undefined;
    readonly indicatorClass?: string | undefined;
  } = {},
) => {
  const props = options.props ?? {};
  const state =
    props.indeterminate === true
      ? "indeterminate"
      : props.checked === true
        ? "checked"
        : "unchecked";
  return KitCheckbox(h, {
    props,
    onEmit: options.onToggle === undefined ? undefined : { Toggled: options.onToggle },
    view: (checkbox) =>
      checkbox
        .root(h.button)
        .attr("data-slot", "checkbox")
        .attr("data-state", state)
        .class(cn(CHECKBOX_CLASS, options.class))
        .children(
          checkbox
            .indicator(h.span)
            .attr("data-slot", "checkbox-indicator")
            .attr("data-state", state)
            .class(cn(CHECKBOX_INDICATOR_CLASS, options.indicatorClass))
            .children(CheckIcon(h, { class: "size-3.5" })),
        ),
  });
};
