/**
 * Checkbox — shadcn/ui `checkbox` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix Checkbox.Root / Checkbox.Indicator + a Lucide
 * CheckIcon. Here: the @effect/ui-kit `Checkbox` headless component — the
 * consumer's Model owns `checked`, a toggle arrives as the kit's `Toggled`
 * event and is forwarded to the caller's `onToggle` Message. The check is
 * the shared `CheckIcon` builder from registry/lib/icons.ts (Lucide `check`
 * path data, ISC).
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings.
 *
 * One mechanical translation, declared: upstream styles key off Radix's
 * `data-state="checked" | "unchecked" | "indeterminate"`, while the kit
 * writes `data-checked` / `data-unchecked` / `data-indeterminate`. The
 * upstream classes use `data-[state=checked]:` variants, so this port also
 * writes `data-state` (derived from the controlled props the caller already
 * owns) on the root and the indicator, keeping every upstream class live.
 * No `asChild`: composition is stacking a part on the same builder, per D-2.
 */
import { Checkbox as KitCheckbox, type CheckboxProps } from "@effect/ui-kit";
import type { Html } from "@effect/ui/html";
import { CheckIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export const CHECKBOX_CLASS =
  "peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary";

export const CHECKBOX_INDICATOR_CLASS = "grid place-content-center text-current transition-none";

/**
 * A shadcn-styled checkbox. Controlled, exactly like upstream: pass the
 * current value in `props.checked` (plus `name` / `value` / `disabled` /
 * `indeterminate` / … — the kit's `CheckboxProps` are Radix's props, renamed
 * only where Effect already had the word), and store what `onToggle`
 * reports:
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
