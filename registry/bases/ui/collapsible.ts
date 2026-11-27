/**
 * Collapsible (bases generation) — shadcn/ui `collapsible` ported 1:1
 * to Effect UI, with the class layer of upstream's bases/radix
 * generation instead of new-york-v4's.
 *
 * Same port as registry/ui/collapsible.ts — and here the two
 * generations are identical: upstream's collapsible file, in both
 * generations, only forwards props and writes `data-slot` attributes;
 * there are no class strings and no `cn-*` hooks to swap in. Here: the
 * @effect/ui-kit `Collapsible` headless Component, which takes a `view`
 * closure and hands back parts (`root`, `trigger`, `panel`). The
 * exported names are upstream's: `Collapsible`, `CollapsibleTrigger`,
 * `CollapsibleContent`. The latter two are part appliers — call them
 * inside the view closure, exactly where upstream rendered the Radix
 * parts:
 *
 *   Collapsible(h, {
 *     props: { open: model.details },
 *     onEmit: { Toggled: ({ open }) => Msg.ToggledDetails({ open }) },
 *     view: (collapsible) =>
 *       collapsible.root(h.div).children(
 *         CollapsibleTrigger(collapsible, h.button).children("Shipping details"),
 *         CollapsibleContent(collapsible, h.div)?.children("3 to 5 days.")
 *       )
 *   })
 *
 * State is the consumer's, as in the kit: `open` lives in the consumer's
 * Model, is passed as a prop, and the `Toggled` event reports the next
 * value to store. No React state, no context.
 *
 * One attribute difference from Radix, inherited from the kit: state is
 * written as `data-open` / `data-closed` (and `data-panel-open` on the
 * trigger), not Radix's `data-state="open" | "closed"`. The `data-slot`
 * attributes are upstream's, verbatim.
 */
import { type Component, type View } from "@effect/ui";
import {
  Collapsible as KitCollapsible,
  type CollapsibleEvents,
  type CollapsibleProps,
} from "@effect/ui-kit";
import type { AsyncResult } from "effect/reactivity";

export type { CollapsibleProps };

type CollapsibleParts = Component.Headless.Parts<typeof KitCollapsible>;

/** The options a headless kit Component call takes, with its parts typed. */
type HeadlessOptions<Props, Events, Parts, Msg, RV, RF> = View.Child.Options<Props, Events, Msg> & {
  readonly fallback?:
    ((result: AsyncResult.Failure<never, unknown>) => View.Content<Msg, RF>) | undefined;
  readonly view: (parts: Parts) => View.Content<Msg, RV>;
};

/**
 * The collapsible root. Same call shape as the kit's `Collapsible`; the
 * root part additionally writes upstream's `data-slot="collapsible"`.
 */
export const Collapsible = <Msg, RV = never, RF = never>(
  h: View.HelperBase<Msg, unknown>,
  options: HeadlessOptions<CollapsibleProps, CollapsibleEvents, CollapsibleParts, Msg, RV, RF>,
) =>
  KitCollapsible(h, {
    key: options.key,
    props: options.props,
    onEmit: options.onEmit,
    onFailure: options.onFailure,
    fallback: options.fallback,
    view: (collapsible) =>
      options.view({
        ...collapsible,
        root: (element) => collapsible.root(element.attr("data-slot", "collapsible")),
      }),
  });

/**
 * Applies the `trigger` part with upstream's `data-slot="collapsible-trigger"`.
 * Upstream's trigger carries no class string; `class` is an optional extra.
 * Chain `.children(...)` on the result.
 */
export const CollapsibleTrigger = (
  collapsible: CollapsibleParts,
  element: Parameters<CollapsibleParts["trigger"]>[0],
  options: { readonly class?: string | undefined } = {},
) => {
  const styled = element.attr("data-slot", "collapsible-trigger");
  return collapsible.trigger(options.class === undefined ? styled : styled.class(options.class));
};

/**
 * Applies the `panel` part with upstream's `data-slot="collapsible-content"`.
 * Upstream's content carries no class string; `class` is an optional extra.
 * Like the kit panel, the result is `undefined` once the panel has closed
 * (unless `keepMounted` / `hiddenUntilFound` is set), so consume it with
 * `?.children(...)`.
 */
export const CollapsibleContent = (
  collapsible: CollapsibleParts,
  element: Parameters<CollapsibleParts["panel"]>[0],
  options: { readonly class?: string | undefined } = {},
) => {
  const styled = element.attr("data-slot", "collapsible-content");
  return collapsible.panel(options.class === undefined ? styled : styled.class(options.class));
};
