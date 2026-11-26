/**
 * AlertDialog — shadcn/ui `alert-dialog` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix AlertDialog, twelve composable components sharing
 * state through context. Here: the @effect/ui-kit `AlertDialog` headless
 * component — a `Dialog` fixed to role="alertdialog", always modal, never
 * dismissed by an outside press — whose `view` receives its parts. The
 * upstream component names are kept as helpers that take those parts (or
 * `h`, for the pure-markup pieces) and apply the shadcn classes and
 * `data-slot`s:
 *
 * | upstream               | here                                                   |
 * | ---------------------- | ------------------------------------------------------ |
 * | AlertDialog (Root)     | `AlertDialog` — the kit component itself (below)       |
 * | AlertDialogTrigger     | `AlertDialogTrigger(parts, el)` — parts.trigger        |
 * | AlertDialogPortal      | `AlertDialogPortal(parts, el)` — parts.portal          |
 * | AlertDialogOverlay     | `AlertDialogOverlay(parts, el)` — parts.backdrop       |
 * | AlertDialogContent     | `AlertDialogContent(parts, el, { size })` — parts.popup |
 * | AlertDialogHeader      | `AlertDialogHeader(h)` — pure <div> view function      |
 * | AlertDialogFooter      | `AlertDialogFooter(h)` — pure <div> view function      |
 * | AlertDialogTitle       | `AlertDialogTitle(parts, el)` — parts.title            |
 * | AlertDialogDescription | `AlertDialogDescription(parts, el)` — parts.description |
 * | AlertDialogMedia       | `AlertDialogMedia(h)` — pure <div> view function       |
 * | AlertDialogAction      | `AlertDialogAction(parts, el)` — parts.close + Button classes |
 * | AlertDialogCancel      | `AlertDialogCancel(parts, el)` — parts.close + Button classes |
 *
 * The consumer owns `open` in their Model and stores what the
 * `RequestedOpen` / `RequestedClose` events ask for — there is no Root
 * context. Action and Cancel are both the kit's `close` part (in Radix both
 * close the dialog); style them with `buttonVariants` from ./button.ts,
 * exactly as upstream wraps them in the shadcn Button. To run an actual
 * destructive command, follow the kit's own pattern: a plain shadcn `Button`
 * with an `onPress` Message inside the popup, whose update closes the dialog.
 * Wrap Cancel in `parts.initialFocus(...)` to focus it on open, as the kit
 * recommends for the least destructive answer.
 *
 * ```ts
 * AlertDialog(h, {
 *   props: { open: model.confirming },
 *   onEmit: {
 *     RequestedOpen: () => Msg.RequestedOpenConfirm(),
 *     RequestedClose: () => Msg.RequestedCloseConfirm(),
 *     Settled: () => undefined
 *   },
 *   view: (ad) =>
 *     h.div(
 *       AlertDialogTrigger(ad, h.button).children("Discard draft"),
 *       AlertDialogPortal(ad, h.dialog)?.children(
 *         AlertDialogOverlay(ad, h.div),
 *         AlertDialogContent(ad, h.div).children(
 *           AlertDialogHeader(h).children(
 *             AlertDialogTitle(ad, h.h2).children("Discard draft?"),
 *             AlertDialogDescription(ad, h.p).children("You can't undo this.")
 *           ),
 *           AlertDialogFooter(h).children(
 *             ad.initialFocus(AlertDialogCancel(ad, h.button)).children("Cancel"),
 *             AlertDialogAction(ad, h.button, { variant: "destructive" }).children("Discard")
 *           )
 *         )
 *       )
 *     )
 * })
 * ```
 *
 * Declared divergences from upstream (see also the file header notes):
 * - Portal: Radix Portal is a mount point with no element of its own; the
 *   kit portal IS the <dialog> in the top layer, so
 *   `data-slot="alert-dialog-portal"` lands on that <dialog>.
 * - Overlay: the kit `backdrop` part returns `undefined` inside a nested
 *   dialog unless the dialog's props set `forceRenderBackdrop`, so
 *   `AlertDialogOverlay` can return `undefined` too.
 * - Animation: the Content class string keeps upstream's
 *   `data-[state=open]:animate-in` / `data-[state=closed]:animate-out`
 *   tokens byte-for-byte, but the kit drives transitions with
 *   `data-open` / `data-closed` / `data-starting-style` /
 *   `data-ending-style` — there is no `data-state` attribute, so those
 *   animate-in/out utilities do not fire. Motion parity is the kit's
 *   transition model, not Radix's.
 * - The kit also offers a `viewport` part (positioning layer between
 *   backdrop and popup); upstream has no counterpart, so no styled helper
 *   is exported for it — `parts.viewport(el)` remains available raw.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings; the parity
 * checker (scripts/verify.mjs) fails if any upstream token disappears.
 */
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import { AlertDialog as KitAlertDialog, type AlertDialogParts } from "@effect/ui-kit";
import { cn } from "../lib/utils.ts";
import { buttonVariants, type ButtonSize, type ButtonVariant } from "./button.ts";

export type { AlertDialogProps } from "@effect/ui-kit";

export type AlertDialogSize = "default" | "sm";

/**
 * The kit headless alert dialog, unchanged: `props: { open }` is required
 * and consumer-owned, `onEmit` maps its `RequestedOpen` / `RequestedClose` /
 * `Settled` events to the consumer's Messages, and `view` draws the parts
 * with the helpers below.
 */
export const AlertDialog = KitAlertDialog;

type Div<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

export const AlertDialogTrigger = <B extends View.PartTarget<"button">>(
  parts: AlertDialogParts,
  element: B,
) => parts.trigger(element).attr("data-slot", "alert-dialog-trigger");

export const AlertDialogPortal = <B extends View.PartTarget<"dialog">>(
  parts: AlertDialogParts,
  element: B,
) => parts.portal(element)?.attr("data-slot", "alert-dialog-portal");

export const AlertDialogOverlay = <B extends View.PartTarget<"div">>(
  parts: AlertDialogParts,
  element: B,
  options: { readonly class?: string | undefined } = {},
) =>
  parts
    .backdrop(element)
    ?.attr("data-slot", "alert-dialog-overlay")
    .class(
      cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        options.class,
      ),
    );

export const AlertDialogContent = <B extends View.PartTarget<"div">>(
  parts: AlertDialogParts,
  element: B,
  options: {
    readonly size?: AlertDialogSize | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  parts
    .popup(element)
    .attr("data-slot", "alert-dialog-content")
    .attr("data-size", options.size ?? "default")
    .class(
      cn(
        "group/alert-dialog-content fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[size=sm]:max-w-xs data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[size=default]:sm:max-w-lg",
        options.class,
      ),
    );

export const AlertDialogHeader = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.div
    .attr("data-slot", "alert-dialog-header")
    .class(
      cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        options.class,
      ),
    );

export const AlertDialogFooter = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.div
    .attr("data-slot", "alert-dialog-footer")
    .class(
      cn(
        "flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        options.class,
      ),
    );

export const AlertDialogTitle = <
  B extends View.PartTarget<"h1" | "h2" | "h3" | "h4" | "h5" | "h6">,
>(
  parts: AlertDialogParts,
  element: B,
  options: { readonly class?: string | undefined } = {},
) =>
  parts
    .title(element)
    .attr("data-slot", "alert-dialog-title")
    .class(
      cn(
        "text-lg font-semibold sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        options.class,
      ),
    );

export const AlertDialogDescription = <B extends View.PartTarget<"p">>(
  parts: AlertDialogParts,
  element: B,
  options: { readonly class?: string | undefined } = {},
) =>
  parts
    .description(element)
    .attr("data-slot", "alert-dialog-description")
    .class(cn("text-sm text-muted-foreground", options.class));

export const AlertDialogMedia = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.div
    .attr("data-slot", "alert-dialog-media")
    .class(
      cn(
        "mb-2 inline-flex size-16 items-center justify-center rounded-md bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-8",
        options.class,
      ),
    );

/**
 * The confirm button: the kit's `close` part wearing the shadcn Button
 * classes (upstream renders it through the shadcn Button with `asChild`).
 * Pressing it asks the dialog to close via `RequestedClose`
 * (`close-press`) — the consumer's update performs the actual action.
 */
export const AlertDialogAction = <B extends View.PartTarget<"button">>(
  parts: AlertDialogParts,
  element: B,
  options: {
    readonly variant?: ButtonVariant | undefined;
    readonly size?: ButtonSize | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  parts
    .close(element)
    .attr("data-slot", "alert-dialog-action")
    .attr("data-variant", options.variant ?? "default")
    .attr("data-size", options.size ?? "default")
    .class(
      buttonVariants({
        variant: options.variant,
        size: options.size,
        class: options.class,
      }),
    );

/** The cancel button: same as Action, with the `outline` Button variant by default. */
export const AlertDialogCancel = <B extends View.PartTarget<"button">>(
  parts: AlertDialogParts,
  element: B,
  options: {
    readonly variant?: ButtonVariant | undefined;
    readonly size?: ButtonSize | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  parts
    .close(element)
    .attr("data-slot", "alert-dialog-cancel")
    .attr("data-variant", options.variant ?? "outline")
    .attr("data-size", options.size ?? "default")
    .class(
      buttonVariants({
        variant: options.variant ?? "outline",
        size: options.size,
        class: options.class,
      }),
    );
