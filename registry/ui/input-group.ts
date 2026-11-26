/**
 * InputGroup — shadcn/ui `input-group` ported 1:1 to Effect UI.
 *
 * Upstream: React + cva, a pure composition — a `role="group"` div whose
 * `has-[…]` selectors pad and restyle the control based on where its
 * addons sit, plus addon / button / text segments and borderless
 * input/textarea controls. There is no kit part for the group itself
 * because there is no behaviour to own: the `has-` selectors are pure CSS
 * over the `data-align` / `data-slot` attributes these view functions
 * write, so they work exactly as upstream. The controls are this repo's
 * `Input` / `Textarea` ports (the same reuse upstream makes), restyled
 * with `data-slot="input-group-control"`; the button is this repo's
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
 *   they override (`rounded-md`, `border`, `shadow-xs`, …). Here both
 *   class strings are emitted, Input's first, the group's after — the
 *   conflicting utilities coexist and CSS order decides. Same for
 *   `InputGroupButton`: `buttonVariants`' default-size classes are
 *   emitted alongside `inputGroupButtonVariants`' size classes.
 * - `InputGroupButton`'s `data-size` is the input-group size
 *   (`xs | sm | icon-xs | icon-sm`), written over the `Button` port's own
 *   `data-size` after it returns — the same override chaining
 *   `ButtonGroupSeparator` uses for `data-slot`.
 */
import type * as Html from "@effect/ui/html/Html"
import type { ButtonElement, ButtonProps } from "@effect/ui-kit"
import { cn } from "../lib/utils.ts"
import { Button, type ButtonVariant } from "./button.ts"
import { Input, type InputElement, type InputProps } from "./input.ts"
import {
  Textarea,
  type TextareaElement,
  type TextareaProps
} from "./textarea.ts"

type DivElement<Msg, R = never> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"div">,
  HTMLDivElement,
  "div"
>

type SpanElement<Msg, R = never> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"span">,
  HTMLSpanElement,
  "span"
>

// ---------------------------------------------------------------------------
// InputGroup
// ---------------------------------------------------------------------------

export const INPUT_GROUP_CLASS = cn(
  "group/input-group relative flex w-full items-center rounded-md border border-input shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30",
  "h-9 min-w-0 has-[>textarea]:h-auto",
  // Variants based on alignment.
  "has-[>[data-align=inline-start]]:[&>input]:pl-2",
  "has-[>[data-align=inline-end]]:[&>input]:pr-2",
  "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
  "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",
  // Focus state.
  "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50",
  // Error state.
  "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40"
)

/**
 * The group frame. Chain `.children(...)` with an `InputGroupInput` /
 * `InputGroupTextarea` control and `InputGroupAddon` / `InputGroupText` /
 * `InputGroupButton` segments, in DOM order — the addons' `data-align`
 * and the group's `has-[…]` selectors do the rest.
 */
export const InputGroup = <Msg, R = never>(
  h: { readonly div: DivElement<Msg, R> },
  options: {
    readonly class?: string | undefined
  } = {}
) =>
  h.div
    .attr("data-slot", "input-group")
    .attr("role", "group")
    .class(cn(INPUT_GROUP_CLASS, options.class))

// ---------------------------------------------------------------------------
// InputGroupAddon
// ---------------------------------------------------------------------------

export type InputGroupAddonAlign =
  | "inline-start"
  | "inline-end"
  | "block-start"
  | "block-end"

const ADDON_BASE =
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4"

const ADDON_ALIGNS: Record<InputGroupAddonAlign, string> = {
  "inline-start":
    "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
  "inline-end":
    "order-last pr-3 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]",
  "block-start":
    "order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5 [.border-b]:pb-3",
  "block-end":
    "order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5 [.border-t]:pt-3"
}

/** Upstream name kept: `inputGroupAddonVariants({ align })` in shadcn; here a pure function, not cva. */
export const inputGroupAddonVariants = (options: {
  readonly align?: InputGroupAddonAlign | undefined
  readonly class?: string | undefined
} = {}): string =>
  cn(ADDON_BASE, ADDON_ALIGNS[options.align ?? "inline-start"], options.class)

/**
 * A segment of the group that isn't the control: an icon, a label, a
 * button. `align` (default `"inline-start"`) is written as `data-align`
 * and selects both the addon's own classes and the group's padding
 * selectors. Upstream's click-to-focus handler is not reproduced — see
 * the file header.
 */
export const InputGroupAddon = <Msg, R = never>(
  h: { readonly div: DivElement<Msg, R> },
  options: {
    readonly align?: InputGroupAddonAlign | undefined
    readonly class?: string | undefined
  } = {}
) =>
  h.div
    .attr("role", "group")
    .attr("data-slot", "input-group-addon")
    .attr("data-align", options.align ?? "inline-start")
    .class(inputGroupAddonVariants(options))

// ---------------------------------------------------------------------------
// InputGroupButton
// ---------------------------------------------------------------------------

export type InputGroupButtonSize = "xs" | "sm" | "icon-xs" | "icon-sm"

const BUTTON_BASE = "flex items-center gap-2 text-sm shadow-none"

const BUTTON_SIZES: Record<InputGroupButtonSize, string> = {
  xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
  sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
  "icon-xs": "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
  "icon-sm": "size-8 p-0 has-[>svg]:p-0"
}

/** Upstream name kept: `inputGroupButtonVariants({ size })` in shadcn; here a pure function, not cva. */
export const inputGroupButtonVariants = (options: {
  readonly size?: InputGroupButtonSize | undefined
  readonly class?: string | undefined
} = {}): string =>
  cn(BUTTON_BASE, BUTTON_SIZES[options.size ?? "xs"], options.class)

/**
 * A button sized to sit inside the group: this repo's `Button` (default
 * variant `"ghost"`, `type` `"button"` as upstream) wearing
 * `inputGroupButtonVariants`. Its `data-size` is the input-group size,
 * not a `Button` size — see the file header.
 */
export const InputGroupButton = <Msg, R = never>(
  h: { readonly button: ButtonElement<Msg> },
  options: {
    readonly element?: ButtonElement<Msg, R> | undefined
    readonly props?: ButtonProps | undefined
    readonly onPress?: Msg | undefined
    readonly variant?: ButtonVariant | undefined
    readonly size?: InputGroupButtonSize | undefined
    /** The native `type` attribute. `"button"` when left out, as upstream. */
    readonly type?: string | undefined
    readonly class?: string | undefined
  } = {}
) =>
  Button(h, {
    element: options.element,
    props: options.props,
    onPress: options.onPress,
    variant: options.variant ?? "ghost",
    class: cn(
      inputGroupButtonVariants({ size: options.size }),
      options.class
    )
  })
    .attr("data-size", options.size ?? "xs")
    .attr("type", options.type ?? "button")

// ---------------------------------------------------------------------------
// InputGroupText
// ---------------------------------------------------------------------------

export const INPUT_GROUP_TEXT_CLASS =
  "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"

/** A static text segment of the group (a unit, a domain suffix, …). Upstream renders a plain `<span>` with no `data-slot`; so does this. */
export const InputGroupText = <Msg, R = never>(
  h: { readonly span: SpanElement<Msg, R> },
  options: {
    readonly class?: string | undefined
  } = {}
) => h.span.class(cn(INPUT_GROUP_TEXT_CLASS, options.class))

// ---------------------------------------------------------------------------
// InputGroupInput / InputGroupTextarea — the group's controls
// ---------------------------------------------------------------------------

export const INPUT_GROUP_INPUT_CLASS =
  "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"

/**
 * The group's text control: this repo's `Input` with
 * `data-slot="input-group-control"` and the borderless group classes.
 * Pass `element` to stack another part on the same `<input>` — a kit
 * `Field`'s `field.control(h.input)`, or a kit Combobox's
 * `combobox.input(h.input)` (leave `onUpdate` off there; the combobox
 * owns the edit — see the file header).
 */
export const InputGroupInput = <Msg, R = never>(
  h: { readonly input: InputElement<Msg> },
  options: {
    /** The caller's `h.input`, to stack a part on it. `h.input` when left out. */
    readonly element?: InputElement<Msg, R> | undefined
    /** The controlled value (and disabled state) — the kit Input's props. */
    readonly props: InputProps
    /** The message an edit sends, from the value the user left in the field. */
    readonly onUpdate?:
      | ((event: { readonly value: string }) => NoInfer<Msg> | undefined)
      | undefined
    /** The native `type` attribute (`"email"`, `"password"`, …). Left out, no attribute is written. */
    readonly type?: string | undefined
    readonly class?: string | undefined
  }
) =>
  Input(h, {
    element: options.element,
    props: options.props,
    onUpdate: options.onUpdate,
    type: options.type,
    class: cn(INPUT_GROUP_INPUT_CLASS, options.class)
  }).attr("data-slot", "input-group-control")

export const INPUT_GROUP_TEXTAREA_CLASS =
  "flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent"

/**
 * The group's textarea control: this repo's `Textarea` with
 * `data-slot="input-group-control"` and the borderless group classes.
 * The group root's `has-[>textarea]:h-auto` takes care of the height.
 */
export const InputGroupTextarea = <Msg, R = never>(
  h: { readonly textarea: TextareaElement<Msg> },
  options: {
    /** The caller's `h.textarea`, to stack a part on it (e.g. `field.control(h.textarea)`). `h.textarea` when left out. */
    readonly element?: TextareaElement<Msg, R> | undefined
    readonly props?: TextareaProps | undefined
    /** The message an edit sends, from the value the user left in the field. Not wired while disabled. */
    readonly onUpdate?:
      | ((event: { readonly value: string }) => NoInfer<Msg> | undefined)
      | undefined
    readonly class?: string | undefined
  } = {}
) =>
  Textarea(h, {
    element: options.element,
    props: options.props,
    onUpdate: options.onUpdate,
    class: cn(INPUT_GROUP_TEXTAREA_CLASS, options.class)
  }).attr("data-slot", "input-group-control")
