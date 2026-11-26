/**
 * Field — shadcn/ui `field` ported 1:1 to Effect UI.
 *
 * Upstream: a passive anatomy kit — `Field` is a `<div role="group">` with
 * orientation variants (cva), and FieldSet / FieldLegend / FieldGroup /
 * FieldContent / FieldLabel / FieldTitle / FieldDescription /
 * FieldSeparator / FieldError are plain styled elements composed around a
 * control by hand. Here:
 *
 * - `Field` is the @effect/ui-kit `Field` headless component, whose `root`
 *   part carries upstream's Field div exactly (role="group",
 *   `data-slot="field"`, `data-orientation`, the `fieldVariants` classes).
 *   The kit component is what makes the anatomy *work* without React
 *   context: its parts generate the ids and wire the label's `for`, the
 *   control's `aria-invalid` / `aria-describedby`, and the description /
 *   error ids. The remaining parts (`label`, `control`, `legend`, `group`,
 *   `focusWithin`, `member`, `description`, `error`) pass through raw —
 *   style them with the appliers below or chain classes yourself.
 * - The rest of the anatomy is view functions / part appliers in the
 *   badge / popover style, class strings byte-for-byte upstream.
 *
 * Declared divergences (anything else is a bug):
 *
 * - **`data-invalid` bridge**: upstream's Field classes key off
 *   `data-[invalid=true]:`, but the kit writes `data-invalid` as an
 *   empty-valued flag. The styled root therefore also writes
 *   `data-invalid="true"` (after the part, so it wins) whenever the field
 *   is invalid, keeping the upstream variant live.
 * - **`FieldSet` is passive anatomy** (a styled native `<fieldset>`),
 *   exactly as upstream. The kit's behavioral `Fieldset` component —
 *   legend id wiring, disabling every field inside — is a different
 *   thing; combine them by passing its root part as `element`:
 *   `FieldSet(h, { element: fieldset.root(h.fieldset) })`.
 * - **`FieldLegend`** renders a native `<legend>` (upstream's element).
 *   The kit Fieldset's `legend` part is an id-wired element of any tag —
 *   a different mechanism; don't confuse the two.
 * - **`FieldTitle`** keeps upstream's `data-slot="field-label"` — that is
 *   what upstream renders (its Title and Label share the slot), kept
 *   byte-for-byte, quirk included.
 * - **`FieldError`** returns `undefined` where upstream renders `null`
 *   (no children and no usable error messages), and when the kit `error`
 *   part it is applied to is itself `undefined`.
 */
import { Field as KitField, type FieldProps } from "@effect/ui-kit"
import type * as Component from "@effect/ui/Component"
import type * as View from "@effect/ui/View"
import type * as Html from "@effect/ui/html/Html"
import { cn } from "../lib/utils.ts"
import { LABEL_CLASS } from "./label.ts"
import { Separator } from "./separator.ts"

export type { FieldProps }

/** What a `Field`'s `view` gets: the kit Field's parts and plain state values. */
export type FieldParts = Component.Headless.Parts<typeof KitField>

export type FieldOrientation = "vertical" | "horizontal" | "responsive"

const FIELD_BASE =
  "group/field flex w-full gap-3 data-[invalid=true]:text-destructive"

const FIELD_ORIENTATIONS: Record<FieldOrientation, string> = {
  vertical: "flex-col [&>*]:w-full [&>.sr-only]:w-auto",
  horizontal:
    "flex-row items-center [&>[data-slot=field-label]]:flex-auto has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
  responsive:
    "flex-col @md/field-group:flex-row @md/field-group:items-center [&>*]:w-full @md/field-group:[&>*]:w-auto [&>.sr-only]:w-auto @md/field-group:[&>[data-slot=field-label]]:flex-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px"
}

/** Upstream's cva `fieldVariants`, as a pure function (no cva in this registry). */
export const fieldVariants = (options: {
  readonly orientation?: FieldOrientation | undefined
  readonly class?: string | undefined
} = {}): string =>
  cn(
    FIELD_BASE,
    FIELD_ORIENTATIONS[options.orientation ?? "vertical"],
    options.class
  )

/**
 * A shadcn-styled field: the kit `Field` with its root pre-styled as
 * upstream's orientation container. Validate in your `update` (effect
 * Schema, or `Validation` from `@effect/ui` — spread `fieldValidationProps`
 * from `@effect/ui-kit` into `props`) and pass the outcome as
 * `props.invalid` plus the error's text:
 *
 *   Field(h, {
 *     props: { invalid: model.name === "", described: true },
 *     orientation: "horizontal",
 *     view: (field) =>
 *       field.root(h.div).children(
 *         FieldLabel(field.label(h.label)).children("Name"),
 *         Input(h, { element: field.control(h.input), props: { value: model.name }, onUpdate: ... }),
 *         FieldDescription(field.description(h.p)).children("Visible on your profile"),
 *         FieldError(h, { element: field.error(h.div), errors: [{ message: "Enter your name" }] })
 *       )
 *   })
 *
 * Draw `description` only with `described: true` in props (the kit part
 * fails the render otherwise), and draw `error` in every field that can
 * be invalid — while invalid, the control points at the error's id.
 */
export const Field = <Msg, RV = never, RF = never>(
  h: Html.H<Msg>,
  options: {
    readonly key?: string | undefined
    /** The field's reported state — the kit Field's props (id, disabled, invalid, described, dirty, filled). */
    readonly props?: FieldProps | undefined
    /** Upstream's orientation variant; written as `data-orientation` and the variant classes on the root. Default `"vertical"`. */
    readonly orientation?: FieldOrientation | undefined
    /** Extra classes for the root, appended like upstream's `className`. */
    readonly class?: string | undefined
    /** The field's whole view, from its parts. */
    readonly view: (parts: FieldParts) => View.Content<NoInfer<Msg>, RV>
  }
) =>
  KitField(h, {
    key: options.key,
    props: options.props,
    view: (field) =>
      options.view({
        ...field,
        root: (element) => {
          const styled = field.root(element)
            .attr("data-slot", "field")
            .attr("role", "group")
            .attr(
              "data-orientation",
              options.orientation ?? "vertical"
            )
            .class(
              fieldVariants({
                orientation: options.orientation,
                class: options.class
              })
            )
          // Bridge: the kit's flag is empty-valued; upstream's variant
          // wants data-invalid="true" (see header).
          return field.invalid
            ? styled.attr("data-invalid", "true")
            : styled
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

type FieldsetElement<Msg, R = never> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"fieldset">,
  HTMLFieldSetElement,
  "fieldset"
>

type LegendElement<Msg, R = never> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"legend">,
  HTMLLegendElement,
  "legend"
>

export const FIELD_SET_CLASS = cn(
  "flex flex-col gap-6",
  "has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3"
)

/**
 * Upstream `FieldSet`: a passive styled `<fieldset>`. For the kit
 * Fieldset's behavior (legend wiring, disabling the fields inside), pass
 * its root part as `element`.
 */
export const FieldSet = <Msg, R = never>(
  h: { readonly fieldset: FieldsetElement<Msg> },
  options: {
    /** The caller's `h.fieldset`, to stack a part on it (e.g. a kit Fieldset's `root`). `h.fieldset` when left out. */
    readonly element?: FieldsetElement<Msg, R> | undefined
    readonly class?: string | undefined
  } = {}
) => {
  const element: FieldsetElement<Msg, R> = options.element ?? h.fieldset
  return element
    .attr("data-slot", "field-set")
    .class(cn(FIELD_SET_CLASS, options.class))
}

export type FieldLegendVariant = "legend" | "label"

export const FIELD_LEGEND_CLASS = cn(
  "mb-3 font-medium",
  "data-[variant=legend]:text-base",
  "data-[variant=label]:text-sm"
)

/** Upstream `FieldLegend`: a native `<legend>` with a `legend` | `label` size variant. */
export const FieldLegend = <Msg, R = never>(
  h: { readonly legend: LegendElement<Msg> },
  options: {
    readonly element?: LegendElement<Msg, R> | undefined
    readonly variant?: FieldLegendVariant | undefined
    readonly class?: string | undefined
  } = {}
) => {
  const element: LegendElement<Msg, R> = options.element ?? h.legend
  return element
    .attr("data-slot", "field-legend")
    .attr("data-variant", options.variant ?? "legend")
    .class(cn(FIELD_LEGEND_CLASS, options.class))
}

export const FIELD_GROUP_CLASS =
  "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4"

/** Upstream `FieldGroup`: the vertical stack fields are laid out in. */
export const FieldGroup = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {}
) =>
  h.div
    .attr("data-slot", "field-group")
    .class(cn(FIELD_GROUP_CLASS, options.class))

export const FIELD_CONTENT_CLASS =
  "group/field-content flex flex-1 flex-col gap-1.5 leading-snug"

/** Upstream `FieldContent`: the title/description column beside a control in a horizontal field. */
export const FieldContent = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {}
) =>
  h.div
    .attr("data-slot", "field-content")
    .class(cn(FIELD_CONTENT_CLASS, options.class))

export const FIELD_LABEL_CLASS = cn(
  "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
  "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4",
  "has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 dark:has-data-[state=checked]:bg-primary/10"
)

/**
 * Upstream `FieldLabel`: the ported `Label` (its base classes included,
 * as upstream renders the Label component) with the field-label classes
 * and `data-slot="field-label"`. A part applier — pass a kit Field's
 * label part, `FieldLabel(field.label(h.label))`, or a plain `h.label`
 * outside a Field:
 *
 *   FieldLabel(field.label(h.label)).children("Email")
 */
export const FieldLabel = <Msg, R, E, N, T extends string>(
  label: Html.Element<Msg, R, E, N, T>,
  options: { readonly class?: string | undefined } = {}
) =>
  label
    .attr("data-slot", "field-label")
    .class(cn(LABEL_CLASS, FIELD_LABEL_CLASS, options.class))

export const FIELD_TITLE_CLASS =
  "flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50"

/**
 * Upstream `FieldTitle`: a non-label title for a control, used inside
 * `FieldContent`. Upstream renders it with `data-slot="field-label"` —
 * kept as-is (see header).
 */
export const FieldTitle = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {}
) =>
  h.div
    .attr("data-slot", "field-label")
    .class(cn(FIELD_TITLE_CLASS, options.class))

export const FIELD_DESCRIPTION_CLASS = cn(
  "text-sm leading-normal font-normal text-muted-foreground group-has-[[data-orientation=horizontal]]/field:text-balance",
  "last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5",
  "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary"
)

/**
 * Upstream `FieldDescription`. A part applier — pass a kit Field's
 * description part, `FieldDescription(field.description(h.p))` (which
 * requires `described: true` in the Field's props), or a plain `h.p`
 * outside a Field.
 */
export const FieldDescription = <Msg, R, E, N, T extends string>(
  description: Html.Element<Msg, R, E, N, T>,
  options: { readonly class?: string | undefined } = {}
) =>
  description
    .attr("data-slot", "field-description")
    .class(cn(FIELD_DESCRIPTION_CLASS, options.class))

export const FIELD_SEPARATOR_CLASS =
  "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2"

export const FIELD_SEPARATOR_CONTENT_CLASS =
  "relative mx-auto block w-fit bg-background px-2 text-muted-foreground"

/**
 * Upstream `FieldSeparator`: a rule with optional centered content,
 * rendered through this repo's `Separator` port exactly as upstream
 * renders its Separator. Content goes in the `children` option (it is
 * wrapped in the `field-separator-content` span); `data-content` reports
 * whether any was given, as upstream.
 *
 *   FieldSeparator(h, { children: ["Or continue with"] })
 */
export const FieldSeparator = <Msg, C extends View.Children<Msg>>(
  h: Html.H<Msg>,
  options: {
    readonly class?: string | undefined
    readonly children?: C | undefined
  } = {}
) => {
  const separator = Separator(h, { class: "absolute inset-0 top-1/2" })
  const base = h.div
    .attr("data-slot", "field-separator")
    .attr("data-content", options.children !== undefined ? "true" : "false")
    .class(cn(FIELD_SEPARATOR_CLASS, options.class))
  return options.children !== undefined
    ? base.children(
      separator,
      h.span
        .attr("data-slot", "field-separator-content")
        .class(FIELD_SEPARATOR_CONTENT_CLASS)
        .children(options.children)
    )
    : base.children(separator)
}

export const FIELD_ERROR_CLASS = "text-sm font-normal text-destructive"

export const FIELD_ERROR_LIST_CLASS = "ml-4 flex list-disc flex-col gap-1"

/** One validation failure, upstream's `{ message?: string }` shape. */
export type FieldErrorItem = { readonly message?: string | undefined }

/**
 * Upstream `FieldError`: the field's error text, as a `role="alert"`
 * div. Content resolution matches upstream exactly: `children` win;
 * otherwise the `errors` are deduped by message — one renders as its
 * message, several as a list. With nothing to show it returns
 * `undefined` (upstream renders `null`).
 *
 * Pass a kit Field's error part as `element` to get its generated id
 * (and its alert role — upstream's div carries `role="alert"` too):
 *
 *   FieldError(h, { element: field.error(h.div), errors: [{ message: "Enter your name" }] })
 *
 * The kit part is `undefined` unless the field is invalid and enabled,
 * and then so is this. Without `element`, a plain `h.div` is styled.
 */
export const FieldError = <Msg, C extends View.Children<Msg>>(
  h: Html.H<Msg>,
  options: {
    /** A kit Field `error` part's result; may itself be `undefined`. Left out, a plain `h.div` is used. */
    readonly element?: Div<Msg, any> | undefined
    /** Validation failures to render when no `children` are given. */
    readonly errors?:
      | ReadonlyArray<FieldErrorItem | undefined>
      | undefined
    readonly class?: string | undefined
    /** Explicit content; wins over `errors`, as upstream. */
    readonly children?: C | undefined
  } = {}
) => {
  let content: View.Children<Msg> | undefined
  if (options.children !== undefined) {
    content = options.children
  } else if (options.errors !== undefined && options.errors.length > 0) {
    const unique = [
      ...new Map(
        options.errors.map((error) => [error?.message, error] as const)
      ).values()
    ]
    if (unique.length === 1) {
      const message = unique[0]?.message
      content = message !== undefined ? [message] : undefined
    } else {
      const items = unique.filter(
        (error): error is { readonly message: string } =>
          error?.message !== undefined
      )
      content = [
        h.ul
          .class(FIELD_ERROR_LIST_CLASS)
          .children(items.map((error) => h.li.children(error.message)))
      ]
    }
  }
  if (content === undefined) return undefined
  const element: Div<Msg, any> | undefined = "element" in options
    ? options.element
    : h.div
  if (element === undefined) return undefined
  return element
    .attr("role", "alert")
    .attr("data-slot", "field-error")
    .class(cn(FIELD_ERROR_CLASS, options.class))
    .children(content)
}
