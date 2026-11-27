/**
 * ToggleGroup (bases generation) — shadcn/ui `toggle-group` ported 1:1
 * to Effect UI, with the class layer of upstream's bases/radix
 * generation instead of new-york-v4's.
 *
 * Same port as registry/ui/toggle-group.ts — the @effect/ui-kit
 * `ToggleGroup` headless component: the consumer owns `value` (the
 * pressed items' values), the kit keeps the roving tab stop and
 * arrow-key focus, and emits `Toggled`, surfaced here as `onToggled`.
 * There is no context in Effect UI: the group's `variant` / `size` /
 * `spacing` are options of this wrapper, and the styled `item` part
 * resolves them exactly like upstream's context did — the group's value
 * wins over the item's own, which wins over the default. Only the
 * classes (and one default, below) differ.
 *
 * A headless component's parts only exist inside its `view` closure, so
 * `ToggleGroupItem` is the styled `item` part handed to `view`, also
 * exported below as a function that takes that parts object first:
 *
 *   ToggleGroup(h, {
 *     props: { value: model.align, items: alignments.map((value) => ({ value })) },
 *     onToggled: (value) => EditorMessage.ToggledAlign({ value }),
 *     variant: "outline",
 *     view: (group) =>
 *       group.root(h.div).children(
 *         alignments.map((value) =>
 *           ToggleGroupItem(group, { element: h.button, value }).children(value)
 *         )
 *       )
 *   })
 *
 * Class strings are byte-for-byte the shadcn bases/radix strings: the
 * root and item carry the `cn-toggle-group` / `cn-toggle-group-item`
 * hooks (filled by the style presets in registry/styles/style-*.css)
 * plus structural utilities, and the item's variant/size still come
 * from this repo's bases `toggleVariants` (./toggle.ts), mirroring
 * upstream's import of `toggleVariants` from `toggle`.
 *
 * Anatomy diffs vs the new-york port, declared:
 *
 * - **`spacing` defaults to 2, not 0.** Upstream bases changed the
 *   ToggleGroup default (`spacing = 2`, and its context default agrees);
 *   new-york-v4 defaults to 0. This port follows bases.
 * - **The root also writes `data-orientation`** (upstream bases writes
 *   it; new-york-v4 does not), and the item's spacing-0 stitching
 *   classes move from the new-york port's separate
 *   `data-[spacing=0]:…` constant into the item string itself, keyed on
 *   the group's `data-orientation` via `group-data-…/toggle-group:`
 *   selectors — upstream's own shape. The new-york root's
 *   `data-[spacing=default]:data-[variant=outline]:shadow-xs` and the
 *   item's `w-auto min-w-0 px-3` are gone: the preset hooks own them.
 *
 * Adaptations the kit forces, honestly (unchanged):
 *
 * - Radix writes `data-state="on" | "off"` on items. The kit writes
 *   `data-pressed` instead, so the styled item also writes `data-state`
 *   from the group's `value`.
 * - Upstream's single/multiple distinction is the kit's `multiple` prop
 *   (default single, like Radix's `type="single"` behaviour shadcn uses).
 * - The kit item also handles roving focus; don't stack `Toggle` on it
 *   (the kit's own rule — an item writes Toggle's attributes itself).
 */
import type * as View from "@effect/ui/View";
import {
  ToggleGroup as KitToggleGroup,
  type ToggleGroupOrientation,
  type ToggleGroupProps,
} from "@effect/ui-kit";
import { cn } from "@/lib/utils";
import { toggleVariants, type ToggleSize, type ToggleVariant } from "./toggle.ts";

export type { ToggleGroupOrientation, ToggleGroupProps };

/** The kit's keyed builder shape: a part target that can take a `key`. */
type Keyed<Tag extends string> = View.PartTarget<Tag> & {
  readonly key: (key: string) => View.PartTarget<Tag>;
};

export const TOGGLE_GROUP_ROOT_CLASS =
  "cn-toggle-group group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-vertical:flex-col data-vertical:items-stretch";

export const TOGGLE_GROUP_ITEM_CLASS =
  "cn-toggle-group-item shrink-0 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t";

/**
 * The styled parts handed to `ToggleGroup`'s `view` closure. `item` is
 * shadcn's ToggleGroupItem, pre-styled and pre-resolved against the
 * group's variant / size / spacing.
 */
export interface ToggleGroupParts {
  readonly value: ReadonlyArray<string>;
  readonly disabled: boolean;
  readonly multiple: boolean;
  readonly orientation: ToggleGroupOrientation;
  readonly root: <B extends View.PartTarget<"div">>(
    element: B,
    options?: { readonly class?: string | undefined },
  ) => ReturnType<B["attr"]>;
  readonly item: <B extends Keyed<"button">>(args: {
    readonly element: B;
    readonly value: string;
    readonly variant?: ToggleVariant | undefined;
    readonly size?: ToggleSize | undefined;
    readonly class?: string | undefined;
  }) => ReturnType<B["attr"]>;
}

/** shadcn's `ToggleGroupItem`, as a function of the parts from `ToggleGroup`'s view closure. */
export const ToggleGroupItem = <B extends Keyed<"button">>(
  group: ToggleGroupParts,
  args: {
    readonly element: B;
    readonly value: string;
    readonly variant?: ToggleVariant | undefined;
    readonly size?: ToggleSize | undefined;
    readonly class?: string | undefined;
  },
): ReturnType<B["attr"]> => group.item(args);

/**
 * shadcn-styled toggle group (bases generation). The consumer owns the
 * pressed values: pass them as `props.value`, store what `onToggled`
 * reports.
 */
export const ToggleGroup = <Msg, RV = never>(
  h: View.HelperBase<Msg, unknown>,
  options: {
    readonly key?: string | undefined;
    readonly props: ToggleGroupProps;
    readonly onToggled?: ((value: ReadonlyArray<string>) => NoInfer<Msg> | undefined) | undefined;
    readonly variant?: ToggleVariant | undefined;
    readonly size?: ToggleSize | undefined;
    readonly spacing?: number | undefined;
    readonly class?: string | undefined;
    readonly view: (group: ToggleGroupParts) => View.Content<NoInfer<Msg>, RV>;
  },
) => {
  const spacing = options.spacing ?? 2;
  const styled = (group: {
    readonly value: ReadonlyArray<string>;
    readonly disabled: boolean;
    readonly multiple: boolean;
    readonly orientation: ToggleGroupOrientation;
    readonly root: View.Part<"div", [], never>;
    readonly item: <B extends Keyed<"button">>(args: {
      readonly element: B;
      readonly value: string;
    }) => ReturnType<B["attr"]>;
  }): ToggleGroupParts => ({
    value: group.value,
    disabled: group.disabled,
    multiple: group.multiple,
    orientation: group.orientation,
    root: (element, partOptions) =>
      group
        .root(element)
        .attr("data-slot", "toggle-group")
        .attr("data-variant", options.variant)
        .attr("data-size", options.size)
        .attr("data-spacing", String(spacing))
        .attr("data-orientation", group.orientation)
        .style({ "--gap": spacing })
        .class(cn(TOGGLE_GROUP_ROOT_CLASS, options.class, partOptions?.class)),
    item: (args) => {
      const variant = options.variant ?? args.variant;
      const size = options.size ?? args.size;
      return group
        .item({ element: args.element, value: args.value })
        .attr("data-slot", "toggle-group-item")
        .attr("data-variant", variant ?? "default")
        .attr("data-size", size ?? "default")
        .attr("data-spacing", String(spacing))
        .attr("data-state", options.props.value.includes(args.value) ? "on" : "off")
        .class(cn(TOGGLE_GROUP_ITEM_CLASS, toggleVariants({ variant, size }), args.class));
    },
  });
  return KitToggleGroup(h, {
    ...(options.key === undefined ? {} : { key: options.key }),
    props: options.props,
    ...(options.onToggled === undefined
      ? {}
      : {
          onEmit: (event: { readonly value: ReadonlyArray<string> }) =>
            options.onToggled!(event.value),
        }),
    view: (group) => options.view(styled(group)),
  });
};
