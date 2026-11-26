/**
 * RadioGroup — shadcn/ui `radio-group` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix RadioGroup.Root / Item / Indicator + a Lucide
 * CircleIcon. Here: the @effect/ui-kit `RadioGroup` headless component —
 * the consumer's Model owns the picked `value`, picks arrive as the kit's
 * `Picked` event forwarded to `onPick`, and the kit owns roving focus,
 * arrow-key navigation and the hidden form input. The dot is the shared
 * `CircleIcon` builder from registry/lib/icons.ts (Lucide `circle` path
 * data, ISC).
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings.
 *
 * Shape note: upstream exports `RadioGroup` and `RadioGroupItem` as two
 * composable React components. In Effect UI an item only exists inside the
 * group's `view` closure (its parts are scoped there, and the kit exports
 * no named parts type), so `RadioGroupItem` here takes the group's parts
 * as its first argument and `RadioGroup` composes the items from its
 * `items` spec — same rendered DOM, same slots. Naming a radio is the
 * caller's job in both worlds: pass `label` in the item spec and it is
 * rendered as the radio's `aria-label`.
 *
 * Declared gaps: upstream's item class carries `aria-invalid:` variants;
 * the kit puts `aria-invalid` on the group root only (pass `invalid` in
 * `props`) and strips it from items, so those variants can only fire at
 * group level. Radix's `data-state` is not used by the upstream radio
 * classes (they style the indicator by presence, and the kit mounts the
 * indicator only while its radio is checked), but `data-state` is still
 * written on item and indicator for parity with the other ports.
 */
import {
  RadioGroup as KitRadioGroup,
  type RadioGroupItem as KitRadioGroupItem,
  type RadioGroupProps,
} from "@effect/ui-kit";
import type { Html } from "@effect/ui/html";
import { CircleIcon } from "../lib/icons.ts";
import { cn } from "../lib/utils.ts";

export const RADIO_GROUP_CLASS = "grid gap-3";

export const RADIO_GROUP_ITEM_CLASS =
  "aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40";

export const RADIO_GROUP_INDICATOR_CLASS = "relative flex items-center justify-center";

/** One radio in the group: the kit's item fields, plus rendering-only extras. */
export type RadioGroupItemSpec = KitRadioGroupItem & {
  /** Rendered as the radio's `aria-label`. */
  readonly label?: string | undefined;
  readonly class?: string | undefined;
  readonly indicatorClass?: string | undefined;
};

/**
 * The group's parts, as its `view` closure receives them. The kit exports
 * no named parts type, so this is the structural minimum `RadioGroupItem`
 * needs: `radio` / `indicator` builders keyed by item `value`.
 */
export interface RadioGroupParts {
  readonly radio: (options: {
    // The kit's keyed button part target; `h.button` satisfies it.
    readonly element: any;
    readonly value: string;
  }) => any;
  readonly indicator: (options: {
    // The kit's span part target; `h.span` satisfies it.
    readonly element: any;
    readonly value: string;
  }) => any;
}

/**
 * One shadcn-styled radio, drawn inside a `RadioGroup` view closure:
 *
 *   view: (group) => group.root(h.div).children(
 *     RadioGroupItem(group, h, item, { checked: model.plan === item.value })
 *   )
 *
 * `RadioGroup` below composes exactly this for every item in its spec.
 */
export const RadioGroupItem = <Msg>(
  parts: RadioGroupParts,
  h: Html.H<Msg>,
  item: RadioGroupItemSpec,
  options: {
    readonly checked: boolean;
    readonly class?: string | undefined;
    readonly indicatorClass?: string | undefined;
  },
) => {
  const state = options.checked ? "checked" : "unchecked";
  const radio = parts
    .radio({ element: h.button, value: item.value })
    .attr("data-slot", "radio-group-item")
    .attr("data-state", state)
    .class(cn(RADIO_GROUP_ITEM_CLASS, item.class, options.class));
  const labelled = item.label === undefined ? radio : radio.attr("aria-label", item.label);
  return labelled.children(
    parts
      .indicator({ element: h.span, value: item.value })
      ?.attr("data-slot", "radio-group-indicator")
      .attr("data-state", state)
      .class(cn(RADIO_GROUP_INDICATOR_CLASS, item.indicatorClass, options.indicatorClass))
      .children(
        CircleIcon(h, {
          class: "absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-primary",
        }),
      ),
  );
};

/**
 * A shadcn-styled radio group. Controlled, exactly like upstream: pass the
 * picked value and the items in `props`, and store what `onPick` reports:
 *
 *   RadioGroup(h, {
 *     props: { value: model.plan, items: [{ value: "monthly" }, { value: "yearly" }], name: "plan" },
 *     onPick: ({ value }) => Msg.PickedPlan({ value })
 *   })
 */
export const RadioGroup = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly props: Omit<RadioGroupProps, "items"> & {
      readonly items: ReadonlyArray<RadioGroupItemSpec>;
    };
    /** The Message a pick sends, with the picked radio's value. */
    readonly onPick?: ((event: { readonly value: string }) => Msg | undefined) | undefined;
    readonly class?: string | undefined;
    readonly itemClass?: string | undefined;
    readonly indicatorClass?: string | undefined;
  },
) => {
  const { items, ...rest } = options.props;
  return KitRadioGroup(h, {
    props: {
      ...rest,
      items: items.map((item) => ({
        value: item.value,
        disabled: item.disabled,
        readOnly: item.readOnly,
      })),
    },
    onEmit: options.onPick === undefined ? undefined : { Picked: options.onPick },
    view: (group) =>
      group
        .root(h.div)
        .attr("data-slot", "radio-group")
        .class(cn(RADIO_GROUP_CLASS, options.class))
        .children(
          items.map((item) =>
            RadioGroupItem(group, h, item, {
              checked: options.props.value === item.value,
              class: options.itemClass,
              indicatorClass: options.indicatorClass,
            }),
          ),
        ),
  });
};
