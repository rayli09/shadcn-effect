/**
 * Form — shadcn/ui `form` ported to Effect UI.
 *
 * Upstream: the react-hook-form binding layer. `Form` is RHF's
 * FormProvider (React context, renders nothing), `FormField` is RHF's
 * Controller plus a context carrying the field name, and
 * FormItem / FormLabel / FormControl / FormDescription / FormMessage
 * read that context (via the `useFormField` hook) to stamp generated
 * ids, `aria-describedby`, `aria-invalid` and error text onto plain
 * elements and a Radix Slot.
 *
 * Here (declared divergence D-3 — the API differs by design; class
 * strings, field anatomy and error presentation stay 1:1):
 *
 * - `Form` is the @effect/ui-kit `Form` headless component: it renders
 *   the actual `<form>` (with `novalidate`), emits `Submitted` with the
 *   form's named controls, and moves focus to the first invalid control
 *   after a submit. Map `Submitted` to your Message with `onSubmitted`.
 * - `FormField` is the @effect/ui-kit `Field` headless component with
 *   its parts pre-styled as the upstream Form* anatomy: `root` is the
 *   FormItem, `label` the FormLabel, `control` the FormControl,
 *   `description` the FormDescription, `error` the FormMessage. The kit
 *   Field is what stamps the ids and ARIA wiring — the job RHF context
 *   and the Slot did upstream — so there is no `useFormField` hook and
 *   no field-name context: the view closure receives the parts and the
 *   field's state values (`invalid`, `touched`, `dirty`, `filled`,
 *   `focused`, `disabled`) directly.
 * - There is no `name` / field-path binding and no Controller: values
 *   live in the consumer's Model, controls report edits as Messages,
 *   and validation runs in `update` — with effect Schema, or with
 *   `Validation` from `@effect/ui`, whose per-field outcome maps onto
 *   `FormField`'s props via `fieldValidationProps` from `@effect/ui-kit`:
 *   `props: { ...fieldValidationProps(state.fields.email), described: true }`.
 *   A control's `name` attribute (what `Submitted` reports) is the
 *   consumer's to chain on the control builder.
 * - `FormControl` is not a Slot (D-2): the kit `control` part applies
 *   the id / `aria-invalid` / `aria-describedby` to the control's own
 *   builder, which is also where `data-slot="form-control"` lands.
 * - `FormLabel`'s `htmlFor` is written by the kit `label` part (the
 *   control's generated id); its `data-error` is bridged from the
 *   field's `invalid`, which the kit reports as an empty-valued
 *   `data-invalid` flag instead.
 * - `FormMessage` is the kit `error` part styled: it exists only while
 *   the field is invalid and enabled, which is exactly when upstream
 *   shows the error text. The kit part's `role="alert"` is removed —
 *   upstream's FormMessage is a plain `<p>`. Upstream could also render
 *   children with no error present; the error part cannot, so for that
 *   use a plain `h.p` with `FORM_MESSAGE_CLASS`.
 * - The standalone `FormItem` / `FormLabel` / `FormControl` /
 *   `FormDescription` / `FormMessage` exports below are for consumers
 *   driving a kit `Field` (or this repo's `Field` port) directly: the
 *   same styling as `FormField`'s parts, as appliers / view functions.
 *
 * Ids: upstream's `${id}-form-item` / `-form-item-description` /
 * `-form-item-message` scheme is not reproduced — the kit generates
 * its own ids and no consumer code ever reads them, because the parts
 * do the wiring.
 */
import {
  Field as KitField,
  Form as KitForm,
  type FieldProps,
  type FormEvents
} from "@effect/ui-kit"
import type * as Component from "@effect/ui/Component"
import type * as View from "@effect/ui/View"
import type * as Html from "@effect/ui/html/Html"
import { cn } from "../lib/utils.ts"
import { LABEL_CLASS } from "./label.ts"

export type { FieldProps }

/** What a `Form`'s `view` gets: the kit Form's parts. */
export type FormParts = Component.Headless.Parts<typeof KitForm>

/** The kit Form's `Submitted` event: the form's named controls, in document order. */
export type FormSubmission = Extract<
  FormEvents,
  { readonly _tag: "Submitted" }
>

/**
 * A form: the kit `Form` (native `<form novalidate>`, `Submitted`
 * event, focus-first-invalid after submit). Validate in the
 * `onSubmitted` Message's `update` — the errors recorded there are the
 * ones the form reads when it moves focus.
 *
 *   Form(h, {
 *     onSubmitted: () => Msg.SubmittedForm(),
 *     view: (form) =>
 *       form.root(h.form).children(
 *         FormField(h, { props: { invalid: model.submitted, described: true }, view: ... }),
 *         h.button.attr("type", "submit").children("Sign up")
 *       )
 *   })
 */
export const Form = <Msg, RV = never, RF = never>(
  h: Html.H<Msg>,
  options: {
    readonly key?: string | undefined
    /** Classes for the `<form>` element (upstream puts `className` on its own form element). */
    readonly class?: string | undefined
    /** The Message a submit sends, with the form's named controls. */
    readonly onSubmitted?:
      | ((submission: FormSubmission) => NoInfer<Msg> | undefined)
      | undefined
    /** The form's whole view, from its parts. */
    readonly view: (parts: FormParts) => View.Content<NoInfer<Msg>, RV>
  }
) =>
  KitForm(h, {
    key: options.key,
    onEmit: options.onSubmitted,
    view: (form) =>
      options.view({
        ...form,
        root: (element) => {
          const root = form.root(element)
          return options.class !== undefined
            ? root.class(options.class)
            : root
        }
      })
  })

/**
 * The styled FormMessage part: a `<p>` builder in (upstream's FormMessage
 * is a `<p>`), the styled builder out — or `undefined` while the field is
 * not invalid and enabled, which is when the kit `error` part is absent.
 */
export type FormMessagePart<Msg> = (
  element: Html.Element<
    Msg,
    any,
    Html.EventsOf<"p">,
    HTMLParagraphElement,
    "p"
  >
) => Html.Element<Msg, any, Html.EventsOf<"p">, HTMLParagraphElement, "p"> | undefined

/** What a `FormField`'s `view` gets: the kit Field's parts, pre-styled as the Form* anatomy, plus the `message` part. */
export type FormFieldParts<Msg> =
  & Component.Headless.Parts<typeof KitField>
  & {
    /** Upstream's FormMessage: the kit `error` part, styled as a plain `<p>` (see `FormField`). */
    readonly message: FormMessagePart<Msg>
  }

export const FORM_ITEM_CLASS = "grid gap-2"

export const FORM_LABEL_CLASS = "data-[error=true]:text-destructive"

export const FORM_DESCRIPTION_CLASS = "text-sm text-muted-foreground"

export const FORM_MESSAGE_CLASS = "text-sm text-destructive"

/**
 * One bound field: the kit `Field` with its parts pre-styled as
 * upstream's FormItem / FormLabel / FormControl / FormDescription /
 * FormMessage. Pass the validation outcome as `props.invalid` (see the
 * header for `fieldValidationProps`), and `described: true` whenever
 * the view draws `description` — the kit part fails the render without
 * it, because the control must not point at an id nothing has. Draw
 * `message` in every field that can be invalid, for the same reason.
 *
 *   FormField(h, {
 *     props: { invalid: model.emailInvalid, described: true },
 *     view: (field) =>
 *       field.root(h.div).children(
 *         field.label(h.label).children("Email"),
 *         Input(h, { element: field.control(h.input), props: { value: model.email }, onUpdate: ... })
 *           .attr("name", "email"),
 *         field.description(h.p).children("We never share it."),
 *         field.message(h.p)?.children("Enter a valid email")
 *       )
 *   })
 *
 * Note the message part is named `message` here, not the kit's
 * `error`: it is upstream's FormMessage, a plain `<p>` (the kit part's
 * `role="alert"` is removed; the raw part stays available as `error`).
 */
export const FormField = <Msg, RV = never, RF = never>(
  h: Html.H<Msg>,
  options: {
    readonly key?: string | undefined
    /** The field's reported state — the kit Field's props (id, disabled, invalid, described, dirty, filled). */
    readonly props?: FieldProps | undefined
    /** Extra classes for the FormItem root, appended like upstream's `className`. */
    readonly class?: string | undefined
    readonly labelClass?: string | undefined
    readonly descriptionClass?: string | undefined
    readonly messageClass?: string | undefined
    /** The field's whole view, from its styled parts. */
    readonly view: (
      parts: FormFieldParts<NoInfer<Msg>>
    ) => View.Content<NoInfer<Msg>, RV>
  }
) =>
  KitField(h, {
    key: options.key,
    props: options.props,
    view: (field) =>
      options.view({
        ...field,
        root: (element) =>
          field.root(element)
            .attr("data-slot", "form-item")
            .class(cn(FORM_ITEM_CLASS, options.class)),
        label: (element) =>
          field.label(element)
            .attr("data-slot", "form-label")
            .attr("data-error", field.invalid ? "true" : "false")
            .class(cn(LABEL_CLASS, FORM_LABEL_CLASS, options.labelClass)),
        control: (element) =>
          field.control(element).attr("data-slot", "form-control"),
        description: (element) =>
          field.description(element)
            .attr("data-slot", "form-description")
            .class(
              cn(FORM_DESCRIPTION_CLASS, options.descriptionClass)
            ),
        message: (element) => {
          const part = field.error(element)
          return part === undefined
            ? undefined
            : part
              .attr("data-slot", "form-message")
              .attr("role", undefined)
              .class(cn(FORM_MESSAGE_CLASS, options.messageClass))
        }
      })
  })

type Div<Msg, R> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"div">,
  HTMLDivElement,
  "div"
>

/**
 * Upstream `FormItem` as a standalone view function: the grid container
 * a field's label, control, description and message stack in. Inside
 * `FormField` the root part already carries this styling.
 */
export const FormItem = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {}
) =>
  h.div
    .attr("data-slot", "form-item")
    .class(cn(FORM_ITEM_CLASS, options.class))

/**
 * Upstream `FormLabel` as a standalone applier, for a kit Field's label
 * part used directly: `FormLabel(field.label(h.label), { error: field.invalid })`.
 * The label part writes `for`; `error` drives upstream's
 * `data-error` styling. Inside `FormField` the label part is already
 * styled — don't apply this twice.
 */
export const FormLabel = <Msg, R, E, N, T extends string>(
  label: Html.Element<Msg, R, E, N, T>,
  options: {
    readonly error?: boolean | undefined
    readonly class?: string | undefined
  } = {}
) =>
  label
    .attr("data-slot", "form-label")
    .attr("data-error", options.error === true ? "true" : "false")
    .class(cn(LABEL_CLASS, FORM_LABEL_CLASS, options.class))

/**
 * Upstream `FormControl` as a standalone applier: stamps
 * `data-slot="form-control"` on a kit Field `control` (or `member`)
 * part's result — the part itself has already written the id,
 * `aria-invalid` and `aria-describedby` FormControl wrote upstream.
 * Inside `FormField` the control part is already stamped.
 */
export const FormControl = <Msg, R, E, N, T extends string>(
  control: Html.Element<Msg, R, E, N, T>
) => control.attr("data-slot", "form-control")

/**
 * Upstream `FormDescription` as a standalone applier, for a kit Field's
 * description part used directly (requires `described: true` in the
 * Field's props; the part writes the id). Inside `FormField` the
 * description part is already styled.
 */
export const FormDescription = <Msg, R, E, N, T extends string>(
  description: Html.Element<Msg, R, E, N, T>,
  options: { readonly class?: string | undefined } = {}
) =>
  description
    .attr("data-slot", "form-description")
    .class(cn(FORM_DESCRIPTION_CLASS, options.class))

/**
 * Upstream `FormMessage` as a standalone applier, for a kit Field's
 * `error` part used directly:
 *
 *   FormMessage(field.error(h.p), { error: model.emailError })
 *
 * The part is `undefined` unless the field is invalid and enabled, and
 * then so is this (upstream renders nothing without a body). Pass the
 * error text as `error` — it becomes the body, as upstream's
 * `error.message` did — or chain `.children(...)` on the result
 * instead. The part's `role="alert"` is removed: upstream's message is
 * a plain `<p>`. Inside `FormField`, use its `message` part instead.
 */
export const FormMessage = <Msg, R, E, N, T extends string>(
  message: Html.Element<Msg, R, E, N, T> | undefined,
  options: {
    readonly error?: string | undefined
    readonly class?: string | undefined
  } = {}
) => {
  if (message === undefined) return undefined
  const styled = message
    .attr("data-slot", "form-message")
    .attr("role", undefined)
    .class(cn(FORM_MESSAGE_CLASS, options.class))
  return options.error !== undefined
    ? styled.children(options.error)
    : styled
}
