/**
 * InputGroup — shadcn/ui `input-group`, bases generation, ported 1:1 to
 * Effect UI.
 *
 * Generation: `bases/radix` (the `cn-*` hook generation). Upstream: React
 * + cva, a pure composition — a `role="group"` div, plus addon / button /
 * text segments and borderless input/textarea controls. The visual
 * styling (borders, padding choreography, addon spacing) lives in the
 * style presets under the `cn-input-group*` hooks; what stays inline
 * here is the structural layer, byte-for-byte from the bases source.
 * There is no kit part for the group itself because there is no
 * behaviour to own. The controls are this generation's `Input` /
 * `Textarea` ports (the same reuse upstream makes), restyled with
 * `data-slot="input-group-control"`; the button is this generation's
 * `Button` wearing `inputGroupButtonVariants` — variants are pure
 * functions here, no cva.
 *
 * Composing with the kit Combobox (whose input styling upstream comes
 * from this item): stack the combobox's `input` part as the `element` —
 *
 *   InputGroup(h).children(
 *     InputGroupInput(h, {
 *       element: combobox.input(h.input),
 *       props: { value: model.inputValue }
 *     }),
 *     …
 *   )
 *
 * drawn inside the `InputGroup` div (or the combobox's own inputGroup
 * part). Leave `onUpdate` off in that composition: the combobox owns the
 * input event and reports edits as its `RequestedInputValue` event, and
 * the kit `Input` refuses an `onUpdate` on an element that already
 * handles `input`. A kit `Field` stacks the same way:
 * `element: field.control(h.input)`.
 *
 * Declared divergences (in-file, on top of docs/PORTING-RULES.md):
 * - The addon's click-to-focus-the-input handler is NOT reproduced.
 *   Upstream's `onClick` inspects the DOM event target (`closest("button")`)
 *   and queries the parent for its `input`; an Effect UI click payload
 *   carries no target, and hand-rolled DOM queries are not a view
 *   function's job (PORTING-RULES rule 5). Chain `.on("click", …)` on the
 *   addon builder and focus the control from your `update` with a Command
 *   if you need it.
 * - D-1 (no tailwind-merge): upstream's `cn` merges the group controls'
 *   extra classes into `Input`'s / `Textarea`'s, dropping the utilities
 *   they override. Here both class strings are emitted, Input's first,
 *   the group's after — the conflicting utilities coexist and CSS order
 *   decides. Same for `InputGroupButton`: `buttonVariants`' classes are
 *   emitted alongside `inputGroupButtonVariants`' size classes.
 * - `InputGroupButton`'s `data-size` is the input-group size
 *   (`xs | sm | icon-xs | icon-sm`), written over the `Button` port's own
 *   `data-size` after it returns — the same override chaining
 *   `ButtonGroupSeparator` uses for `data-slot`.
 */
import type * as Html from "@effect/ui/html/Html";
import type { ButtonElement, ButtonProps } from "@effect/ui-kit";
import { cn } from "@/lib/utils";
import { Button, type ButtonVariant } from "./button.ts";
import { Input, type InputElement, type InputProps } from "./input.ts";
import { Textarea, type TextareaElement, type TextareaProps } from "./textarea.ts";

type DivElement<Msg, R = never> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

type SpanElement<Msg, R = never> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"span">,
  HTMLSpanElement,
  "span"
>;

// ---------------------------------------------------------------------------
// InputGroup
// ---------------------------------------------------------------------------

export const INPUT_GROUP_CLASS =
  "group/input-group cn-input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto";

/**
 * The group frame. Chain `.children(...)` with an `InputGroupInput` /
 * `InputGroupTextarea` control and `InputGroupAddon` / `InputGroupText` /
 * `InputGroupButton` segments, in DOM order — the addons' `data-align`
 * and the presets' `cn-input-group` rules do the rest.
 */
export const InputGroup = <Msg, R = never>(
  h: { readonly div: DivElement<Msg, R> },
  options: {
    readonly class?: string | undefined;
  } = {},
) =>
  h.div
    .attr("data-slot", "input-group")
    .attr("role", "group")
    .class(cn(INPUT_GROUP_CLASS, options.class));

// ---------------------------------------------------------------------------
// InputGroupAddon
// ---------------------------------------------------------------------------

export type InputGroupAddonAlign = "inline-start" | "inline-end" | "block-start" | "block-end";

const ADDON_BASE = "cn-input-group-addon flex cursor-text items-center justify-center select-none";

const ADDON_ALIGNS: Record<InputGroupAddonAlign, string> = {
  "inline-start": "cn-input-group-addon-align-inline-start order-first",
  "inline-end": "cn-input-group-addon-align-inline-end order-last",
  "block-start": "cn-input-group-addon-align-block-start order-first w-full justify-start",
  "block-end": "cn-input-group-addon-align-block-end order-last w-full justify-start",
};

/** Upstream name kept: `inputGroupAddonVariants({ align })` in shadcn; here a pure function, not cva. */
export const inputGroupAddonVariants = (
  options: {
    readonly align?: InputGroupAddonAlign | undefined;
    readonly class?: string | undefined;
  } = {},
): string => cn(ADDON_BASE, ADDON_ALIGNS[options.align ?? "inline-start"], options.class);

/**
 * A segment of the group that isn't the control: an icon, a label, a
 * button. `align` (default `"inline-start"`) is written as `data-align`
 * and selects the addon's align hook class. Upstream's click-to-focus
 * handler is not reproduced — see the file header.
 */
export const InputGroupAddon = <Msg, R = never>(
  h: { readonly div: DivElement<Msg, R> },
  options: {
    readonly align?: InputGroupAddonAlign | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  h.div
    .attr("role", "group")
    .attr("data-slot", "input-group-addon")
    .attr("data-align", options.align ?? "inline-start")
    .class(inputGroupAddonVariants(options));

// ---------------------------------------------------------------------------
// InputGroupButton
// ---------------------------------------------------------------------------

export type InputGroupButtonSize = "xs" | "sm" | "icon-xs" | "icon-sm";

const BUTTON_BASE = "cn-input-group-button flex items-center shadow-none";

const BUTTON_SIZES: Record<InputGroupButtonSize, string> = {
  xs: "cn-input-group-button-size-xs",
  sm: "cn-input-group-button-size-sm",
  "icon-xs": "cn-input-group-button-size-icon-xs",
  "icon-sm": "cn-input-group-button-size-icon-sm",
};

/** Upstream name kept: `inputGroupButtonVariants({ size })` in shadcn; here a pure function, not cva. */
export const inputGroupButtonVariants = (
  options: {
    readonly size?: InputGroupButtonSize | undefined;
    readonly class?: string | undefined;
  } = {},
): string => cn(BUTTON_BASE, BUTTON_SIZES[options.size ?? "xs"], options.class);

/**
 * A button sized to sit inside the group: this generation's `Button`
 * (default variant `"ghost"`, `type` `"button"` as upstream) wearing
 * `inputGroupButtonVariants`. Its `data-size` is the input-group size,
 * not a `Button` size — see the file header.
 */
export const InputGroupButton = <Msg, R = never>(
  h: { readonly button: ButtonElement<Msg> },
  options: {
    readonly element?: ButtonElement<Msg, R> | undefined;
    readonly props?: ButtonProps | undefined;
    readonly onPress?: Msg | undefined;
    readonly variant?: ButtonVariant | undefined;
    readonly size?: InputGroupButtonSize | undefined;
    /** The native `type` attribute. `"button"` when left out, as upstream. */
    readonly type?: string | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  Button(h, {
    element: options.element,
    props: options.props,
    onPress: options.onPress,
    variant: options.variant ?? "ghost",
    class: cn(inputGroupButtonVariants({ size: options.size }), options.class),
  })
    .attr("data-size", options.size ?? "xs")
    .attr("type", options.type ?? "button");

// ---------------------------------------------------------------------------
// InputGroupText
// ---------------------------------------------------------------------------

export const INPUT_GROUP_TEXT_CLASS =
  "cn-input-group-text flex items-center [&_svg]:pointer-events-none";

/** A static text segment of the group (a unit, a domain suffix, …). Upstream renders a plain `<span>` with no `data-slot`; so does this. */
export const InputGroupText = <Msg, R = never>(
  h: { readonly span: SpanElement<Msg, R> },
  options: {
    readonly class?: string | undefined;
  } = {},
) => h.span.class(cn(INPUT_GROUP_TEXT_CLASS, options.class));

// ---------------------------------------------------------------------------
// InputGroupInput / InputGroupTextarea — the group's controls
// ---------------------------------------------------------------------------

export const INPUT_GROUP_INPUT_CLASS = "cn-input-group-input flex-1";

/**
 * The group's text control: this generation's `Input` with
 * `data-slot="input-group-control"` and the group's input hook classes.
 * Pass `element` to stack another part on the same `<input>` — a kit
 * `Field`'s `field.control(h.input)`, or a kit Combobox's
 * `combobox.input(h.input)` (leave `onUpdate` off there; the combobox
 * owns the edit — see the file header).
 */
export const InputGroupInput = <Msg, R = never>(
  h: { readonly input: InputElement<Msg> },
  options: {
    /** The caller's `h.input`, to stack a part on it. `h.input` when left out. */
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
) =>
  Input(h, {
    element: options.element,
    props: options.props,
    onUpdate: options.onUpdate,
    type: options.type,
    class: cn(INPUT_GROUP_INPUT_CLASS, options.class),
  }).attr("data-slot", "input-group-control");

export const INPUT_GROUP_TEXTAREA_CLASS = "cn-input-group-textarea flex-1 resize-none";

/**
 * The group's textarea control: this generation's `Textarea` with
 * `data-slot="input-group-control"` and the group's textarea hook
 * classes. The group root's `has-[>textarea]:h-auto` takes care of the
 * height.
 */
export const InputGroupTextarea = <Msg, R = never>(
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
) =>
  Textarea(h, {
    element: options.element,
    props: options.props,
    onUpdate: options.onUpdate,
    class: cn(INPUT_GROUP_TEXTAREA_CLASS, options.class),
  }).attr("data-slot", "input-group-control");
