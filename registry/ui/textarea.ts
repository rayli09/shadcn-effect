/**
 * Textarea — shadcn/ui `textarea` ported 1:1 to Effect UI.
 *
 * Upstream: a plain React <textarea> spreading native props. There is no
 * @effect/ui-kit part for textarea, so this is a view function on
 * `h.textarea` with the exact upstream class string and the same
 * controlled-value wiring the kit's `Input` uses: when `props.value` is
 * given the element always shows it, and an edit sends the caller's
 * `onUpdate` message with the value the user left in the field (the
 * `input` event's `ValuePayload`). Native attributes upstream spreads
 * (`name`, `id`, `rows`, `placeholder`, …) stay the caller's to chain.
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";

export const TEXTAREA_CLASS =
  "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40";

/**
 * A `<textarea>` builder: what `Textarea` accepts as `element`, from the
 * caller's `h.textarea`, and what it returns.
 */
export type TextareaElement<Msg, R = never> = Html.VoidElement<
  Msg,
  R,
  Html.EventsOf<"textarea">,
  HTMLTextAreaElement,
  "textarea"
>;

/**
 * The controlled value and disabled state for `Textarea`. Both are
 * optional: with no `value` the textarea is uncontrolled (the browser
 * owns the text, seeded by any children), mirroring upstream's plain
 * prop spread; with a `value` it is controlled, kit-Input style.
 */
export interface TextareaProps {
  readonly value?: string | undefined;
  readonly disabled?: boolean | undefined;
}

/**
 * A shadcn-styled textarea. Chain classes and native attributes on the
 * result:
 *
 *   Textarea(h, {
 *     props: { value: model.bio },
 *     onUpdate: ({ value }) => Msg.UpdatedBio({ value })
 *   }).attr("name", "bio").attr("rows", "4")
 */
export const Textarea = <Msg, R = never>(
  h: { readonly textarea: TextareaElement<Msg> },
  options: {
    /** The caller's `h.textarea`, to stack a part on it (e.g. `field.control(h.textarea)`). `h.textarea` when left out. */
    readonly element?: TextareaElement<Msg, R> | undefined;
    readonly props?: TextareaProps | undefined;
    /** The message an edit sends, from the value the user left in the field. Not wired while disabled. */
    readonly onUpdate?:
      ((event: { readonly value: string }) => NoInfer<Msg> | undefined) | undefined;
    readonly class?: string | undefined;
  } = {},
) => {
  const props = options.props ?? {};
  const onUpdate = options.onUpdate;
  const element: TextareaElement<Msg, R> = options.element ?? h.textarea;
  const styled = element
    .attr("data-slot", "textarea")
    .class(cn(TEXTAREA_CLASS, options.class))
    .disabled(props.disabled === true);
  const valued = props.value !== undefined ? styled.value(props.value) : styled;
  return onUpdate !== undefined && props.disabled !== true
    ? valued.on("input", ({ value }) => onUpdate({ value }))
    : valued;
};
