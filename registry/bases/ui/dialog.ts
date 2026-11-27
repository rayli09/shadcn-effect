/**
 * Dialog (bases generation) — shadcn/ui `dialog` ported 1:1 to Effect UI.
 *
 * Same Effect port as `registry/ui/dialog.ts` (the @effect/ui-kit
 * `Dialog` headless component with styled parts, consumer-owned `open`);
 * only the class layer changes: class strings are byte-for-byte the
 * shadcn bases/radix strings — structural inline classes plus `cn-*`
 * hook classes whose utilities are supplied by the style presets. The
 * parity checker asserts every token in `parity/bases-tokens.json["dialog"]`.
 *
 * Anatomy diff vs the new-york generation: no new parts. What changed
 * is the auto close button upstream renders inside DialogContent: in
 * new-york it is a bare button with its own positioning classes; in
 * bases it is the shadcn Button (`variant="ghost"`, `size="icon-sm"`)
 * carrying the `cn-dialog-close` hook, still stamped
 * `data-slot="dialog-close"`. Here it stays a composition, exactly as
 * in the new-york port:
 *
 *   parts.close(
 *     h.button
 *       .class(cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), DIALOG_CLOSE_CLASS))
 *       .attr("data-slot", "dialog-close")
 *   ).children(XIcon(h), h.span.class("sr-only").children("Close"))
 *
 * (`buttonVariants` from ./button.ts.) DialogFooter's upstream
 * `showCloseButton` variant is likewise a composition: `parts.close`
 * around the bases `Button` (variant "outline") inside the footer.
 * The overlay also gains upstream's `isolate`, which new-york lacks.
 * Nothing in bases dialog is unported.
 *
 * As in the new-york port, the kit's parts carry `data-open` /
 * `data-closed` / `data-starting-style` / `data-ending-style`, not
 * Radix's `data-state`; enter/exit motion is the presets' job, keyed
 * on the kit attributes.
 */
import type * as Component from "@effect/ui/Component";
import type * as View from "@effect/ui/View";
import type { Html } from "@effect/ui/html";
import {
  Dialog as KitDialog,
  DialogTrigger as KitDialogTrigger,
  type DialogEvents,
  type DialogProps,
  type DialogTriggerElement,
  type DialogTriggerPress,
  type DialogTriggerProps,
} from "@effect/ui-kit";
import { XIcon as SharedXIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

/** What a `Dialog`'s `view` gets: the kit Dialog's parts and plain values. */
export type DialogParts = Component.Headless.Parts<typeof KitDialog>;

export const DIALOG_OVERLAY_CLASS = "cn-dialog-overlay fixed inset-0 isolate z-50";

export const DIALOG_CONTENT_CLASS =
  "cn-dialog-content fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 outline-none";

/** The hook class on the auto close button (a ghost icon-sm Button — see header). */
export const DIALOG_CLOSE_CLASS = "cn-dialog-close";

export const DIALOG_HEADER_CLASS = "cn-dialog-header flex flex-col";

export const DIALOG_FOOTER_CLASS =
  "cn-dialog-footer flex flex-col-reverse gap-2 sm:flex-row sm:justify-end";

export const DIALOG_TITLE_CLASS = "cn-dialog-title cn-font-heading";

export const DIALOG_DESCRIPTION_CLASS = "cn-dialog-description";

/**
 * The Lucide `x` icon (ISC), from the shared `@/lib/icons` builder.
 * Kept as an export of this module — sheet.ts and consumers import
 * `XIcon` from here — and the wrapper preserves this file's original
 * rendering exactly: lucide-react's own `lucide lucide-x` classes are
 * merged ahead of the caller's class, as the file-local builder did.
 * Path data is Lucide's: `M18 6 6 18` and `m6 6 12 12`.
 */
export const XIcon = <Msg>(h: Html.H<Msg>, options: { readonly class?: string | undefined } = {}) =>
  SharedXIcon(h, { class: cn("lucide lucide-x", options.class) });

/**
 * A shadcn-styled Dialog. Call it exactly like the kit's, with a `view`
 * closure that draws the styled parts:
 *
 *   Dialog(h, {
 *     props: { open: model.open },
 *     onEmit: {
 *       RequestedOpen: () => Msg.RequestedOpen(),
 *       RequestedClose: () => Msg.RequestedClose(),
 *       Settled: () => undefined
 *     },
 *     view: (dialog) =>
 *       h.div(
 *         dialog.trigger(h.button).children("Open"),
 *         dialog.portal(h.dialog)?.children(
 *           dialog.backdrop(h.div),
 *           dialog.viewport(h.div).children(
 *             dialog.popup(h.div).children(
 *               dialog.title(h.h2).children("Title"),
 *               dialog.description(h.p).children("Description")
 *             )
 *           )
 *         )
 *       )
 *   })
 */
export const Dialog = <Msg, RV = never, RF = never>(
  h: View.Helper<Msg, unknown>,
  options: View.Child.Options<DialogProps, DialogEvents, NoInfer<Msg>> & {
    /** The dialog's whole view, from its styled parts. */
    readonly view: (parts: DialogParts) => View.Content<NoInfer<Msg>, RV>;
    /** Extra classes, appended like upstream's `className` on each part. */
    readonly overlayClass?: string | undefined;
    readonly contentClass?: string | undefined;
    readonly titleClass?: string | undefined;
    readonly descriptionClass?: string | undefined;
  },
): ReturnType<typeof KitDialog<Msg, RV, RF>> =>
  KitDialog<Msg, RV, RF>(h, {
    key: options.key,
    props: options.props,
    onEmit: options.onEmit,
    onFailure: options.onFailure,
    view: (dialog) =>
      options.view({
        ...dialog,
        trigger: (element) => dialog.trigger(element.attr("data-slot", "dialog-trigger")),
        portal: (element) => dialog.portal(element.attr("data-slot", "dialog-portal")),
        backdrop: (element) =>
          dialog.backdrop(
            element
              .attr("data-slot", "dialog-overlay")
              .class(cn(DIALOG_OVERLAY_CLASS, options.overlayClass)),
          ),
        popup: (element) =>
          dialog.popup(
            element
              .attr("data-slot", "dialog-content")
              .class(cn(DIALOG_CONTENT_CLASS, options.contentClass)),
          ),
        title: (element) =>
          dialog.title(
            element
              .attr("data-slot", "dialog-title")
              .class(cn(DIALOG_TITLE_CLASS, options.titleClass)),
          ),
        description: (element) =>
          dialog.description(
            element
              .attr("data-slot", "dialog-description")
              .class(cn(DIALOG_DESCRIPTION_CLASS, options.descriptionClass)),
          ),
        close: (element) => dialog.close(element.attr("data-slot", "dialog-close")),
      }),
  });

/**
 * A trigger drawn in another Component than the Dialog's, paired with it
 * by the Dialog's `id` prop — the kit's `DialogTrigger` with upstream's
 * `data-slot`. A press sends `onPress` (a Message, or a function of the
 * press carrying the trigger id and how it was pressed).
 */
export const DialogTrigger = <Msg, R = never>(
  h: { readonly button: DialogTriggerElement<Msg> },
  options: {
    readonly element?: DialogTriggerElement<Msg, R> | undefined;
    readonly props: DialogTriggerProps;
    readonly onPress?: NoInfer<Msg> | ((press: DialogTriggerPress) => NoInfer<Msg>) | undefined;
  },
) =>
  KitDialogTrigger(h, {
    element: options.element,
    props: options.props,
    onPress: options.onPress,
  }).attr("data-slot", "dialog-trigger");

/** Upstream `DialogHeader`: a plain flex div, no kit part owns it. */
export const DialogHeader = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "dialog-header").class(cn(DIALOG_HEADER_CLASS, options.class));

/**
 * Upstream `DialogFooter`. Upstream's `showCloseButton` variant rendered a
 * Radix Close wrapping the outline Button; here that is a composition —
 * draw `parts.close` around the shadcn-effect `Button` (variant "outline")
 * inside the footer.
 */
export const DialogFooter = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "dialog-footer").class(cn(DIALOG_FOOTER_CLASS, options.class));
