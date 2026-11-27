/**
 * AlertDialog (bases generation) — shadcn/ui `alert-dialog` ported 1:1
 * to Effect UI.
 *
 * Same Effect port as `registry/ui/alert-dialog.ts` (the @effect/ui-kit
 * `AlertDialog` headless component and the same twelve part helpers);
 * only the class layer changes: class strings are byte-for-byte the
 * shadcn bases/radix strings — structural inline classes plus `cn-*`
 * hook classes whose utilities are supplied by the style presets. The
 * parity checker asserts every token in
 * `parity/bases-tokens.json["alert-dialog"]`.
 *
 * Anatomy diff vs the new-york generation: none in the part list — all
 * twelve upstream exports exist here, including `AlertDialogMedia`
 * (`data-slot="alert-dialog-media"`, hook `cn-alert-dialog-media`),
 * which this repo's new-york port already had. What changed is where
 * the styling lives: the content's sizing, the header's grid, the
 * media's box and the overlay's animation utilities moved out of the
 * class strings into the presets' `.cn-alert-dialog-*` rules (keyed on
 * the same `data-slot` / `data-size` attributes stamped here). Nothing
 * in bases alert-dialog is unported.
 *
 * The divergences declared in `registry/ui/alert-dialog.ts` carry over
 * unchanged: the kit portal IS the <dialog> (so
 * `data-slot="alert-dialog-portal"` lands on it), the overlay helper
 * can return `undefined` in a nested dialog without
 * `forceRenderBackdrop`, and the kit drives transitions with
 * `data-open` / `data-closed` / `data-starting-style` /
 * `data-ending-style` rather than Radix's `data-state`.
 */
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import { AlertDialog as KitAlertDialog, type AlertDialogParts } from "@effect/ui-kit";
import { cn } from "@/lib/utils";
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
    .class(cn("cn-alert-dialog-overlay fixed inset-0 z-50", options.class));

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
        "cn-alert-dialog-content group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 outline-none",
        options.class,
      ),
    );

export const AlertDialogHeader = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.div.attr("data-slot", "alert-dialog-header").class(cn("cn-alert-dialog-header", options.class));

export const AlertDialogFooter = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.div
    .attr("data-slot", "alert-dialog-footer")
    .class(
      cn(
        "cn-alert-dialog-footer flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
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
    .class(cn("cn-alert-dialog-title cn-font-heading", options.class));

export const AlertDialogDescription = <B extends View.PartTarget<"p">>(
  parts: AlertDialogParts,
  element: B,
  options: { readonly class?: string | undefined } = {},
) =>
  parts
    .description(element)
    .attr("data-slot", "alert-dialog-description")
    .class(cn("cn-alert-dialog-description", options.class));

export const AlertDialogMedia = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.div.attr("data-slot", "alert-dialog-media").class(cn("cn-alert-dialog-media", options.class));

/**
 * The confirm button: the kit's `close` part wearing the bases Button
 * classes (upstream renders it through the shadcn Button with `asChild`),
 * with the `cn-alert-dialog-action` hook appended. Pressing it asks the
 * dialog to close via `RequestedClose` (`close-press`) — the consumer's
 * update performs the actual action.
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
        class: cn("cn-alert-dialog-action", options.class),
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
        class: cn("cn-alert-dialog-cancel", options.class),
      }),
    );
