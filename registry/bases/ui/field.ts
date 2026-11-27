/**
 * Field (bases generation) — shadcn/ui `field` ported 1:1 to Effect UI.
 *
 * Same Effect port as `registry/ui/field.ts`: `Field` is the
 * @effect/ui-kit `Field` headless component whose `root` part carries
 * upstream's Field div (role="group", `data-slot="field"`,
 * `data-orientation`, the `fieldVariants` classes); the remaining anatomy
 * is view functions / part appliers. Only the class layer changes: class
 * strings are byte-for-byte the shadcn bases/radix strings — structural
 * inline classes plus `cn-*` hook classes whose utilities are supplied by
 * the style presets. The parity checker asserts every token in
 * `parity/bases-tokens.json["field"]`. In the bases generation, Field is
 * the whole form surface — there is no separate `form` file upstream.
 *
 * Declared divergences (anything else is a bug):
 *
 * - **`data-invalid` bridge**: the kit writes `data-invalid` as an
 *   empty-valued flag. The styled root therefore also writes
 *   `data-invalid="true"` (after the part, so it wins) whenever the field
 *   is invalid, so attribute selectors keyed on the value stay live.
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
import { Field as KitField, type FieldProps } from "@effect/ui-kit";
import type * as Component from "@effect/ui/Component";
import type * as View from "@effect/ui/View";
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";
import { LABEL_CLASS } from "./label.ts";
import { Separator } from "./separator.ts";

export type { FieldProps };

/** What a `Field`'s `view` gets: the kit Field's parts and plain state values. */
export type FieldParts = Component.Headless.Parts<typeof KitField>;

export type FieldOrientation = "vertical" | "horizontal" | "responsive";

const FIELD_BASE = "cn-field group/field flex w-full";

const FIELD_ORIENTATIONS: Record<FieldOrientation, string> = {
  vertical: "cn-field-orientation-vertical flex-col *:w-full [&>.sr-only]:w-auto",
  horizontal:
    "cn-field-orientation-horizontal flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
  responsive:
    "cn-field-orientation-responsive flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
};

/** Upstream's cva `fieldVariants`, as a pure function (no cva in this registry). */
export const fieldVariants = (
  options: {
    readonly orientation?: FieldOrientation | undefined;
    readonly class?: string | undefined;
  } = {},
): string => cn(FIELD_BASE, FIELD_ORIENTATIONS[options.orientation ?? "vertical"], options.class);

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
    readonly key?: string | undefined;
    /** The field's reported state — the kit Field's props (id, disabled, invalid, described, dirty, filled). */
    readonly props?: FieldProps | undefined;
    /** Upstream's orientation variant; written as `data-orientation` and the variant classes on the root. Default `"vertical"`. */
    readonly orientation?: FieldOrientation | undefined;
    /** Extra classes for the root, appended like upstream's `className`. */
    readonly class?: string | undefined;
    /** The field's whole view, from its parts. */
    readonly view: (parts: FieldParts) => View.Content<NoInfer<Msg>, RV>;
  },
) =>
  KitField(h, {
    key: options.key,
    props: options.props,
    view: (field) =>
      options.view({
        ...field,
        root: (element) => {
          const styled = field
            .root(element)
            .attr("data-slot", "field")
            .attr("role", "group")
            .attr("data-orientation", options.orientation ?? "vertical")
            .class(
              fieldVariants({
                orientation: options.orientation,
                class: options.class,
              }),
            );
          // Bridge: the kit's flag is empty-valued; attribute selectors
          // may key on data-invalid="true" (see header).
          return field.invalid ? styled.attr("data-invalid", "true") : styled;
        },
      }),
  });

type Div<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

type FieldsetElement<Msg, R = never> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"fieldset">,
  HTMLFieldSetElement,
  "fieldset"
>;

type LegendElement<Msg, R = never> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"legend">,
  HTMLLegendElement,
  "legend"
>;

export const FIELD_SET_CLASS = "cn-field-set flex flex-col";

/**
 * Upstream `FieldSet`: a passive styled `<fieldset>`. For the kit
 * Fieldset's behavior (legend wiring, disabling the fields inside), pass
 * its root part as `element`.
 */
export const FieldSet = <Msg, R = never>(
  h: { readonly fieldset: FieldsetElement<Msg> },
  options: {
    /** The caller's `h.fieldset`, to stack a part on it (e.g. a kit Fieldset's `root`). `h.fieldset` when left out. */
    readonly element?: FieldsetElement<Msg, R> | undefined;
    readonly class?: string | undefined;
  } = {},
) => {
  const element: FieldsetElement<Msg, R> = options.element ?? h.fieldset;
  return element.attr("data-slot", "field-set").class(cn(FIELD_SET_CLASS, options.class));
};

export type FieldLegendVariant = "legend" | "label";

export const FIELD_LEGEND_CLASS = "cn-field-legend";

/** Upstream `FieldLegend`: a native `<legend>` with a `legend` | `label` size variant. */
export const FieldLegend = <Msg, R = never>(
  h: { readonly legend: LegendElement<Msg> },
  options: {
    readonly element?: LegendElement<Msg, R> | undefined;
    readonly variant?: FieldLegendVariant | undefined;
    readonly class?: string | undefined;
  } = {},
) => {
  const element: LegendElement<Msg, R> = options.element ?? h.legend;
  return element
    .attr("data-slot", "field-legend")
    .attr("data-variant", options.variant ?? "legend")
    .class(cn(FIELD_LEGEND_CLASS, options.class));
};

export const FIELD_GROUP_CLASS =
  "cn-field-group group/field-group @container/field-group flex w-full flex-col";

/** Upstream `FieldGroup`: the vertical stack fields are laid out in. */
export const FieldGroup = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "field-group").class(cn(FIELD_GROUP_CLASS, options.class));

export const FIELD_CONTENT_CLASS =
  "cn-field-content group/field-content flex flex-1 flex-col leading-snug";

/** Upstream `FieldContent`: the title/description column beside a control in a horizontal field. */
export const FieldContent = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "field-content").class(cn(FIELD_CONTENT_CLASS, options.class));

export const FIELD_LABEL_CLASS = cn(
  "cn-field-label group/field-label peer/field-label flex w-fit",
  "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
);

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
  options: { readonly class?: string | undefined } = {},
) =>
  label.attr("data-slot", "field-label").class(cn(LABEL_CLASS, FIELD_LABEL_CLASS, options.class));

export const FIELD_TITLE_CLASS = "cn-field-title flex w-fit items-center";

/**
 * Upstream `FieldTitle`: a non-label title for a control, used inside
 * `FieldContent`. Upstream renders it with `data-slot="field-label"` —
 * kept as-is (see header).
 */
export const FieldTitle = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "field-label").class(cn(FIELD_TITLE_CLASS, options.class));

export const FIELD_DESCRIPTION_CLASS = cn(
  "cn-field-description leading-normal font-normal group-has-data-horizontal/field:text-balance",
  "last:mt-0 nth-last-2:-mt-1",
  "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
);

/**
 * Upstream `FieldDescription`. A part applier — pass a kit Field's
 * description part, `FieldDescription(field.description(h.p))` (which
 * requires `described: true` in the Field's props), or a plain `h.p`
 * outside a Field.
 */
export const FieldDescription = <Msg, R, E, N, T extends string>(
  description: Html.Element<Msg, R, E, N, T>,
  options: { readonly class?: string | undefined } = {},
) =>
  description
    .attr("data-slot", "field-description")
    .class(cn(FIELD_DESCRIPTION_CLASS, options.class));

export const FIELD_SEPARATOR_CLASS = "cn-field-separator relative";

export const FIELD_SEPARATOR_CONTENT_CLASS =
  "cn-field-separator-content relative mx-auto block w-fit bg-background";

/**
 * Upstream `FieldSeparator`: a rule with optional centered content,
 * rendered through this generation's `Separator` port exactly as upstream
 * renders its Separator. Content goes in the `children` option (it is
 * wrapped in the `field-separator-content` span); `data-content` reports
 * whether any was given, as upstream.
 *
 *   FieldSeparator(h, { children: ["Or continue with"] })
 */
export const FieldSeparator = <Msg, C extends View.Children<Msg>>(
  h: Html.H<Msg>,
  options: {
    readonly class?: string | undefined;
    readonly children?: C | undefined;
  } = {},
) => {
  const separator = Separator(h, { class: "absolute inset-0 top-1/2" });
  const base = h.div
    .attr("data-slot", "field-separator")
    .attr("data-content", options.children !== undefined ? "true" : "false")
    .class(cn(FIELD_SEPARATOR_CLASS, options.class));
  return options.children !== undefined
    ? base.children(
        separator,
        h.span
          .attr("data-slot", "field-separator-content")
          .class(FIELD_SEPARATOR_CONTENT_CLASS)
          .children(options.children),
      )
    : base.children(separator);
};

export const FIELD_ERROR_CLASS = "cn-field-error font-normal";

export const FIELD_ERROR_LIST_CLASS = "ml-4 flex list-disc flex-col gap-1";

/** One validation failure, upstream's `{ message?: string }` shape. */
export type FieldErrorItem = { readonly message?: string | undefined };

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
    readonly element?: Div<Msg, any> | undefined;
    /** Validation failures to render when no `children` are given. */
    readonly errors?: ReadonlyArray<FieldErrorItem | undefined> | undefined;
    readonly class?: string | undefined;
    /** Explicit content; wins over `errors`, as upstream. */
    readonly children?: C | undefined;
  } = {},
) => {
  let content: View.Children<Msg> | undefined;
  if (options.children !== undefined) {
    content = options.children;
  } else if (options.errors !== undefined && options.errors.length > 0) {
    const unique = [
      ...new Map(options.errors.map((error) => [error?.message, error] as const)).values(),
    ];
    if (unique.length === 1) {
      const message = unique[0]?.message;
      content = message !== undefined ? [message] : undefined;
    } else {
      const items = unique.filter(
        (error): error is { readonly message: string } => error?.message !== undefined,
      );
      content = [
        h.ul
          .class(FIELD_ERROR_LIST_CLASS)
          .children(items.map((error) => h.li.children(error.message))),
      ];
    }
  }
  if (content === undefined) return undefined;
  const element: Div<Msg, any> | undefined = "element" in options ? options.element : h.div;
  if (element === undefined) return undefined;
  return element
    .attr("role", "alert")
    .attr("data-slot", "field-error")
    .class(cn(FIELD_ERROR_CLASS, options.class))
    .children(content);
};
