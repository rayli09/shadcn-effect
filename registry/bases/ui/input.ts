/**
 * Input — shadcn/ui `input`, bases generation, ported 1:1 to Effect UI.
 *
 * Generation: `bases/radix` (the `cn-*` hook generation). Upstream: a
 * plain React <input> spreading native props, classed with the structural
 * utilities inline and the `cn-input` hook whose visual styling lives in
 * the style presets (registry/styles/style-*.css). Here: the
 * @effect/ui-kit `Input` view function (native <input>, controlled value
 * in the caller's Model, edits send the caller's `onUpdate` message).
 * Class string is byte-for-byte the bases/radix string.
 *
 * Effect-native differences, honestly: the kit Input is controlled by
 * design — `props.value` is required and there is no uncontrolled /
 * `defaultValue` mode, because the value lives in the Model. Native
 * attributes upstream spreads (`name`, `id`, `placeholder`, `required`, …)
 * stay the caller's to chain: `.attr("name", "email")`. `type` is an option
 * here and is written as the `type` attribute when given; left out, the
 * browser default ("text") applies, exactly as upstream leaving it unset.
 */
import { Input as KitInput, type InputElement, type InputProps } from "@effect/ui-kit";
import { cn } from "@/lib/utils";

export const INPUT_CLASS =
  "cn-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

export type { InputElement, InputProps };

/**
 * A shadcn-styled text input. Chain classes and native attributes on the
 * result, exactly like the kit Input:
 *
 *   Input(h, {
 *     props: { value: model.email },
 *     onUpdate: ({ value }) => Msg.UpdatedEmail({ value }),
 *     type: "email"
 *   }).attr("name", "email")
 */
export const Input = <Msg, R = never>(
  h: { readonly input: InputElement<Msg> },
  options: {
    /** The caller's `h.input`, to stack a part on it (e.g. `field.control(h.input)`). `h.input` when left out. */
    readonly element?: InputElement<Msg, R> | undefined;
    /** The controlled value (and disabled state) — the kit Input's props. */
    readonly props: InputProps;
    /** The message an edit sends, from the value the user left in the field. */
    readonly onUpdate?:
      ((event: { readonly value: string }) => NoInfer<Msg> | undefined) | undefined;
    /** The native `type` attribute (`"email"`, `"password"`, …). Left out, no attribute is written. */
    readonly type?: string | undefined;
    readonly class?: string | undefined;
  },
) => {
  const input = KitInput(h, {
    element: options.element,
    props: options.props,
    onUpdate: options.onUpdate,
  })
    .attr("data-slot", "input")
    .class(cn(INPUT_CLASS, options.class));
  return options.type !== undefined ? input.attr("type", options.type) : input;
};
