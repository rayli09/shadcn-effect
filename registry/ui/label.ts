/**
 * Label — shadcn/ui `label` ported 1:1 to Effect UI.
 *
 * Upstream: Radix `Label.Root`, whose only behavior over a native <label>
 * is suppressing text selection / re-focusing the control on double-click
 * of the label text — the browser's native label activation already covers
 * the click-to-focus part. In Effect UI the label that names a control
 * lives in @effect/ui-kit `Field`: its `label` part writes `for` (the
 * control's generated id) and the field state attributes. This port is the
 * standalone styled label: a pure view function on `h.label` with the exact
 * upstream class string. Two ways to use it:
 *
 * - Standalone: pass `htmlFor` and it writes the native `for` attribute,
 *   pointing at a control id you own.
 * - Inside a Field: pass this label as the Field label part's element —
 *   `field.label(Label(h, {}))` — and Field writes `for` itself, so leave
 *   `htmlFor` out. (Field's own attributes win over ones set before the
 *   part; `data-slot` and the class are not Field attributes, so they stay.)
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";

export const LABEL_CLASS =
  "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50";

/**
 * A `<label>` builder: what `Label` accepts as `element`, from the
 * caller's `h.label`, and what it returns.
 */
export type LabelElement<Msg, R = never> = Html.Element<
  Msg,
  R,
  Html.EventsOf<"label">,
  HTMLLabelElement,
  "label"
>;

/**
 * A shadcn-styled label. Chain `.children(...)` on the result:
 *
 *   Label(h, { htmlFor: "email" }).children("Email")
 */
export const Label = <Msg, R = never>(
  h: { readonly label: LabelElement<Msg> },
  options: {
    /** The caller's `h.label`, to stack a part on it (e.g. `field.label(...)`). `h.label` when left out. */
    readonly element?: LabelElement<Msg, R> | undefined;
    /** The native `for` attribute: the id of the control this label names. Left out, no attribute is written. */
    readonly htmlFor?: string | undefined;
    readonly class?: string | undefined;
  } = {},
) => {
  const element: LabelElement<Msg, R> = options.element ?? h.label;
  const styled = element.attr("data-slot", "label").class(cn(LABEL_CLASS, options.class));
  return options.htmlFor !== undefined ? styled.attr("for", options.htmlFor) : styled;
};
