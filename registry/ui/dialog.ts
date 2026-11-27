/**
 * Dialog — shadcn/ui `dialog` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix Dialog primitives. Here: the @effect/ui-kit
 * `Dialog` headless component (native <dialog> in the top layer, focus,
 * dismissal, nesting, transitions). The consumer owns `open` in their
 * Model and stores what `RequestedOpen` / `RequestedClose` ask for —
 * there is no Root/context/Portal component tree to nest.
 *
 * Upstream export → this port:
 * - `Dialog`          → `Dialog` (below; styled kit Dialog)
 * - `DialogTrigger`   → `parts.trigger`, or the standalone `DialogTrigger`
 *                       for a trigger drawn in another Component
 * - `DialogPortal`    → `parts.portal`
 * - `DialogClose`     → `parts.close`
 * - `DialogOverlay`   → `parts.backdrop`
 * - `DialogContent`   → `parts.popup` (inside `parts.portal`; draw
 *                       `parts.backdrop` and `parts.viewport` around it)
 * - `DialogHeader`    → `DialogHeader` (plain view function, below)
 * - `DialogFooter`    → `DialogFooter` (plain view function, below)
 * - `DialogTitle`     → `parts.title`
 * - `DialogDescription` → `parts.description`
 *
 * The auto close button upstream renders inside DialogContent is a
 * composition here, with the exact upstream classes (`DIALOG_CLOSE_CLASS`):
 *
 *   parts.close(h.button.class(DIALOG_CLOSE_CLASS).attr("data-slot", "dialog-close"))
 *     .children(XIcon(h), h.span.class("sr-only").children("Close"))
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings. Note the
 * kit's parts carry `data-open` / `data-closed` / `data-starting-style` /
 * `data-ending-style`, not Radix's `data-state`, so the upstream
 * `data-[state=…]:animate-*` tokens are kept verbatim for parity but the
 * enter/exit animation they named does not run under the kit — style the
 * starting/ending states via the kit's attributes instead.
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

export const DIALOG_OVERLAY_CLASS =
  "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0";

export const DIALOG_CONTENT_CLASS =
  "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg";

export const DIALOG_CLOSE_CLASS =
  "absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

export const DIALOG_HEADER_CLASS = "flex flex-col gap-2 text-center sm:text-left";

export const DIALOG_FOOTER_CLASS = "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end";

export const DIALOG_TITLE_CLASS = "text-lg leading-none font-semibold";

export const DIALOG_DESCRIPTION_CLASS = "text-sm text-muted-foreground";

/**
 * The Lucide `x` icon (ISC), from the shared `../lib/icons.ts` builder.
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
