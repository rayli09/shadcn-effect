/**
 * Direction — shadcn/ui `direction` ported 1:1 to Effect UI.
 *
 * Upstream: a thin re-export of Radix's `DirectionProvider` (with a
 * `direction` alias for its `dir` prop) and its `useDirection` hook. Here:
 * the @effect/ui-kit `DirectionProvider` headless Component, which shares
 * `{ direction }` with the Components in its `view` closure. It draws no
 * element, keeps no state and emits nothing — exactly like the Radix one,
 * which only sets a context value.
 *
 * The alias is preserved: pass `direction` or `dir` at the top level of the
 * call (upstream: `direction ?? dir`) and it fills `props.direction`;
 * an explicit `props.direction` loses to both, as upstream's spread order
 * implies the alias props are the component's own props.
 *
 * Declared divergences (not hidden):
 *
 * - **`useDirection` does not exist.** Effect UI has no hooks. The value a
 *   Radix consumer reads with the hook is the `direction` the kit hands to
 *   this provider's `view` closure (`directionProvider.direction`), and a
 *   Component that needs it for its own behavior declares
 *   `provider: { owner: DirectionProvider, optional: true }` in its
 *   definition — which is how the kit's own Menu / OTPField / Slider read
 *   it. With no provider above, kit Components fall back to their element's
 *   CSS `direction`, where Radix's hook returns `"ltr"`.
 * - **No `dir` attribute is written.** Neither provider renders an element:
 *   Radix's consumer is expected to put `dir` on their own markup, and the
 *   kit's doc example does the same (`h.main.attr("dir", directionProvider.direction)`).
 */
import {
  DirectionProvider as KitDirectionProvider,
  type DirectionProviderDirection,
  type DirectionProviderProps,
} from "@effect/ui-kit";
import type * as Component from "@effect/ui/Component";
import type * as View from "@effect/ui/View";
import type * as AsyncResult from "effect/reactivity/AsyncResult";

/** The reading direction of text: `"ltr"` or `"rtl"` (the kit's `DirectionProviderDirection`). */
export type Direction = DirectionProviderDirection;

export type { DirectionProviderProps };

/** The options a `DirectionProvider` call takes: the kit `DirectionProvider` Component's call options, verbatim. */
export type DirectionProviderOptions<Msg, RV = never, RF = never> = View.Child.Options<
  DirectionProviderProps,
  never,
  NoInfer<Msg>
> & {
  readonly fallback?:
    ((result: AsyncResult.Failure<never, unknown>) => View.Content<NoInfer<Msg>, RF>) | undefined;
  readonly view: (
    parts: Component.Headless.Parts<typeof KitDirectionProvider>,
  ) => View.Content<NoInfer<Msg>, RV>;
  readonly slots?: never;
};

/**
 * The kit `DirectionProvider` Component, with upstream's `dir` / `direction`
 * alias props accepted at the top level. Call it exactly like the kit's:
 *
 *   DirectionProvider(h, {
 *     direction: "rtl",
 *     view: (directionProvider) =>
 *       h.main.attr("dir", directionProvider.direction).children(...)
 *   })
 */
export const DirectionProvider = <Msg, RV = never, RF = never>(
  h: View.HelperBase<Msg, unknown>,
  options: DirectionProviderOptions<Msg, RV, RF> & {
    /** Upstream alias: Radix's prop name. `direction` wins when both are given. */
    readonly dir?: Direction | undefined;
    /** Upstream alias: shadcn's preferred prop name. Wins over `dir`. */
    readonly direction?: Direction | undefined;
  },
) => {
  const { dir, direction, ...rest } = options;
  const resolved = direction ?? dir ?? rest.props?.direction;
  return KitDirectionProvider(h, {
    ...rest,
    props: {
      ...rest.props,
      ...(resolved !== undefined ? { direction: resolved } : {}),
    },
  });
};
