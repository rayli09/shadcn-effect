/**
 * NativeSelect — shadcn/ui `native-select`, bases generation, ported 1:1
 * to Effect UI.
 *
 * Generation: `bases/radix` (the `cn-*` hook generation). Upstream: a
 * React composition — a wrapper <div>, a native <select>, and a
 * ChevronDown icon (via the create app's IconPlaceholder; lucide is the
 * default icon set) absolutely positioned over it; plus
 * NativeSelectOption / NativeSelectOptGroup as styled <option> /
 * <optgroup>. There is no @effect/ui-kit part for a native select (the
 * kit `Select` is a popup listbox, a different component), so these are
 * view functions on `h.div` / `h.select` / `h.option` / `h.optgroup`
 * with the exact upstream class strings and `data-slot` attributes.
 *
 * Anatomy diffs vs the new-york generation (both from the bases source):
 * - the caller's `className` lands on the WRAPPER (new-york put it on
 *   the <select>); here `class` follows the wrapper.
 * - `data-size` is written on the wrapper as well as on the <select>.
 *
 * The icon is lucide's ChevronDown drawn as an inline SVG: the typed
 * HTML vocabulary has no `svg` tag, so it is built with `h.el` —
 * @effect/ui's documented escape hatch for any host element by name —
 * with the same attributes lucide-react writes (24×24, stroke
 * currentColor, stroke-width 2, round caps/joins) and the path data
 * `m6 9 6 6 6-6`. It stays file-local (not the shared
 * `@/lib/icons` builder) because this port's exported `NativeSelectH`
 * type is deliberately narrower than the `Html.H` the shared builders
 * require — the same declared exception as the new-york port.
 *
 * Wiring: pass the options as `children` (built with NativeSelectOption /
 * NativeSelectOptGroup). `props.value` makes the select controlled, kit
 * style; a change sends the caller's `onChange` message with the chosen
 * value (the `change` event's `ValuePayload` — upstream's React
 * `onChange` on a <select> is the same DOM event).
 */
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import { cn } from "@/lib/utils";

export type NativeSelectSize = "sm" | "default";

export const NATIVE_SELECT_WRAPPER_CLASS =
  "cn-native-select-wrapper group/native-select relative w-fit has-[select:disabled]:opacity-50";

export const NATIVE_SELECT_CLASS =
  "cn-native-select outline-none disabled:pointer-events-none disabled:cursor-not-allowed";

export const NATIVE_SELECT_ICON_CLASS =
  "cn-native-select-icon pointer-events-none absolute select-none";

export const NATIVE_SELECT_OPTION_CLASS = "bg-[Canvas] text-[CanvasText]";

/** A `<div>` builder for the wrapper. */
export type NativeSelectWrapperElement<Msg, R = never> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"div">,
  HTMLDivElement,
  "div"
>;

/** A `<select>` builder for the select itself. */
export type NativeSelectElement<Msg, R = never> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"select">,
  HTMLSelectElement,
  "select"
>;

/** An `<option>` builder. */
export type NativeSelectOptionElement<Msg, R = never> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"option">,
  HTMLOptionElement,
  "option"
>;

/** An `<optgroup>` builder. */
export type NativeSelectOptGroupElement<Msg, R = never> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"optgroup">,
  HTMLOptGroupElement,
  "optgroup"
>;

/** The slice of `h` NativeSelect draws with: the wrapper, the select, and `el` for the SVG icon. */
export interface NativeSelectH<Msg, R = never> {
  readonly div: NativeSelectWrapperElement<Msg>;
  readonly select: NativeSelectElement<Msg>;
  readonly el: (tag: string) => View.ContainerBuilder<Msg>;
}

/**
 * Lucide ChevronDown as an inline SVG builder, with upstream's
 * `data-slot="native-select-icon"` and icon class string.
 */
const ChevronDownIcon = <Msg>(h: { readonly el: (tag: string) => View.ContainerBuilder<Msg> }) =>
  h
    .el("svg")
    .attrs({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    })
    .attr("data-slot", "native-select-icon")
    // `h.el` returns View's ContainerBuilder, which has no `.class()`
    // helper (that lives on the Html element builders) — class goes
    // through the plain `class` attribute.
    .attr("class", NATIVE_SELECT_ICON_CLASS)
    .children(h.el("path").attr("d", "m6 9 6 6 6-6"));

/**
 * A shadcn-styled native select: wrapper, select and chevron icon.
 *
 *   NativeSelect(h, {
 *     props: { value: model.fruit },
 *     onChange: ({ value }) => Msg.ChoseFruit({ value }),
 *     children: [
 *       NativeSelectOption(h, { props: { value: "apple" } }).children("Apple")
 *     ]
 *   })
 */
export const NativeSelect = <Msg, R = never, C extends View.Children<Msg> = View.Children<Msg>>(
  h: NativeSelectH<Msg, R>,
  options: {
    /** The controlled value and disabled state. With no `value` the select is uncontrolled. */
    readonly props?:
      | {
          readonly value?: string | undefined;
          readonly disabled?: boolean | undefined;
        }
      | undefined;
    /** The message a change sends, from the value the user chose. Not wired while disabled. */
    readonly onChange?:
      ((event: { readonly value: string }) => NoInfer<Msg> | undefined) | undefined;
    readonly size?: NativeSelectSize | undefined;
    /** Extra classes for the wrapper <div> (in the bases generation upstream's `className` lands on the wrapper, not the select). */
    readonly class?: string | undefined;
    /** The options: NativeSelectOption / NativeSelectOptGroup builders. */
    readonly children?: C | undefined;
  } = {},
) => {
  const props = options.props ?? {};
  const onChange = options.onChange;
  const size = options.size ?? "default";
  const select = h.select
    .attr("data-slot", "native-select")
    .attr("data-size", size)
    .class(NATIVE_SELECT_CLASS)
    .disabled(props.disabled === true);
  const valued = props.value !== undefined ? select.value(props.value) : select;
  const wired =
    onChange !== undefined && props.disabled !== true
      ? valued.on("change", ({ value }) => onChange({ value }))
      : valued;
  return h.div
    .attr("data-slot", "native-select-wrapper")
    .attr("data-size", size)
    .class(cn(NATIVE_SELECT_WRAPPER_CLASS, options.class))
    .children(
      options.children !== undefined ? wired.children(options.children) : wired,
      ChevronDownIcon(h),
    );
};

/**
 * A shadcn-styled <option>. Chain `.children(...)` for its label text;
 * `props.value` writes the native `value` attribute, `props.selected`
 * the controlled selected state.
 */
export const NativeSelectOption = <Msg, R = never>(
  h: { readonly option: NativeSelectOptionElement<Msg> },
  options: {
    readonly element?: NativeSelectOptionElement<Msg, R> | undefined;
    readonly props?:
      | {
          readonly value?: string | undefined;
          readonly selected?: boolean | undefined;
          readonly disabled?: boolean | undefined;
        }
      | undefined;
    readonly class?: string | undefined;
  } = {},
) => {
  const props = options.props ?? {};
  const element: NativeSelectOptionElement<Msg, R> = options.element ?? h.option;
  const styled = element
    .attr("data-slot", "native-select-option")
    .class(cn(NATIVE_SELECT_OPTION_CLASS, options.class))
    .disabled(props.disabled === true);
  const valued = props.value !== undefined ? styled.attr("value", props.value) : styled;
  return props.selected !== undefined ? valued.selected(props.selected) : valued;
};

/**
 * A shadcn-styled <optgroup>. Chain `.children(...)` for its options;
 * `props.label` writes the native `label` attribute.
 */
export const NativeSelectOptGroup = <Msg, R = never>(
  h: { readonly optgroup: NativeSelectOptGroupElement<Msg> },
  options: {
    readonly element?: NativeSelectOptGroupElement<Msg, R> | undefined;
    readonly props?:
      | {
          readonly label?: string | undefined;
          readonly disabled?: boolean | undefined;
        }
      | undefined;
    readonly class?: string | undefined;
  } = {},
) => {
  const props = options.props ?? {};
  const element: NativeSelectOptGroupElement<Msg, R> = options.element ?? h.optgroup;
  const styled = element
    .attr("data-slot", "native-select-optgroup")
    .class(cn(NATIVE_SELECT_OPTION_CLASS, options.class))
    .disabled(props.disabled === true);
  return props.label !== undefined ? styled.attr("label", props.label) : styled;
};
