/**
 * RadioGroup (bases generation) — shadcn/ui `radio-group` ported 1:1
 * to Effect UI, with the class layer of upstream's bases/radix
 * generation instead of new-york-v4's.
 *
 * Same port as registry/ui/radio-group.ts — the @effect/ui-kit
 * `RadioGroup` headless component: the consumer's Model owns the picked
 * `value`, picks arrive as the kit's `Picked` event forwarded to
 * `onPick`, and the kit owns roving focus, arrow-key navigation and the
 * hidden form input. Only the classes differ.
 *
 * Class strings are byte-for-byte the shadcn bases/radix strings:
 * structural utilities stay inline, everything visual (root layout,
 * item size/shape/colours, the indicator dot) moves to the
 * `cn-radio-group` / `cn-radio-group-item` / `cn-radio-group-indicator`
 * / `cn-radio-group-indicator-icon` hooks, which the style presets
 * (registry/styles/style-*.css) fill in.
 *
 * Anatomy diffs vs the new-york port, declared:
 *
 * - **The indicator icon is a plain span, not an SVG.** Upstream bases
 *   replaced the Lucide CircleIcon with
 *   `<span className="cn-radio-group-indicator-icon" />` — the preset
 *   draws the dot. This port renders exactly that span (no `data-slot`,
 *   as upstream), so the new-york port's `CircleIcon` is not used here.
 * - **The root is `cn-radio-group w-full`.** The new-york `grid gap-3`
 *   layout moves into the `cn-radio-group` preset hook.
 * - **The item gains `relative` and an `after:` hit-area extension**,
 *   and loses its inline size/shape/colour tokens to the preset hook.
 *
 * Shape note (unchanged from the new-york port): upstream exports
 * `RadioGroup` and `RadioGroupItem` as two composable React components.
 * In Effect UI an item only exists inside the group's `view` closure,
 * so `RadioGroupItem` here takes the group's parts as its first
 * argument and `RadioGroup` composes the items from its `items` spec —
 * same rendered DOM, same slots. Naming a radio is the caller's job in
 * both worlds: pass `label` in the item spec and it is rendered as the
 * radio's `aria-label`.
 *
 * Declared gaps (unchanged): upstream's item class carries
 * `aria-invalid:` variants in the new-york generation; the kit puts
 * `aria-invalid` on the group root only (pass `invalid` in `props`) and
 * strips it from items. `data-state` is still written on item and
 * indicator for parity with the other ports.
 */
import {
  RadioGroup as KitRadioGroup,
  type RadioGroupItem as KitRadioGroupItem,
  type RadioGroupProps,
} from "@effect/ui-kit";
import type { Html } from "@effect/ui/html";
import { cn } from "@/lib/utils";

export const RADIO_GROUP_CLASS = "cn-radio-group w-full";

export const RADIO_GROUP_ITEM_CLASS =
  "cn-radio-group-item group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50";

export const RADIO_GROUP_INDICATOR_CLASS = "cn-radio-group-indicator";

export const RADIO_GROUP_INDICATOR_ICON_CLASS = "cn-radio-group-indicator-icon";

/** One radio in the group: the kit's item fields, plus rendering-only extras. */
export type RadioGroupItemSpec = KitRadioGroupItem & {
  /** Rendered as the radio's `aria-label`. */
  readonly label?: string | undefined;
  readonly class?: string | undefined;
  readonly indicatorClass?: string | undefined;
  readonly indicatorIconClass?: string | undefined;
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
    readonly indicatorIconClass?: string | undefined;
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
        h.span.class(
          cn(RADIO_GROUP_INDICATOR_ICON_CLASS, item.indicatorIconClass, options.indicatorIconClass),
        ),
      ),
  );
};

/**
 * A shadcn-styled radio group (bases generation). Controlled, exactly
 * like upstream: pass the picked value and the items in `props`, and
 * store what `onPick` reports:
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
    readonly indicatorIconClass?: string | undefined;
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
              indicatorIconClass: options.indicatorIconClass,
            }),
          ),
        ),
  });
};
