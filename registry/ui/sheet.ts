/**
 * Sheet — shadcn/ui `sheet` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix Dialog, styled as a panel sliding from a side.
 * Here: the @effect/ui-kit `Dialog` headless component, exactly as
 * upstream sits on Radix's Dialog — the styled parts are Dialog parts,
 * and the `side` selects the popup's class block. The consumer owns
 * `open` in their Model, as for `Dialog`.
 *
 * Upstream export → this port:
 * - `Sheet`             → `Sheet` (below; styled kit Dialog)
 * - `SheetTrigger`      → `parts.trigger`
 * - `SheetClose`        → `parts.close`
 * - `SheetPortal`       → `parts.portal`
 * - `SheetOverlay`      → `parts.backdrop`
 * - `SheetContent`      → `parts.popup` (inside `parts.portal`)
 * - `SheetHeader`       → `SheetHeader` (plain view function, below)
 * - `SheetFooter`       → `SheetFooter` (plain view function, below)
 * - `SheetTitle`        → `parts.title`
 * - `SheetDescription`  → `parts.description`
 *
 * The auto close button upstream renders inside SheetContent is a
 * composition here, with the exact upstream classes (`SHEET_CLOSE_CLASS`):
 *
 *   parts.close(h.button.class(SHEET_CLOSE_CLASS).attr("data-slot", "sheet-close"))
 *     .children(XIcon(h, { class: "size-4" }), h.span.class("sr-only").children("Close"))
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings. As with
 * Dialog, the kit's parts carry `data-open` / `data-closed` /
 * `data-starting-style` / `data-ending-style`, not Radix's `data-state`,
 * so the upstream `data-[state=…]:animate-*` / `slide-*` tokens are kept
 * verbatim for parity but do not run under the kit — style the
 * starting/ending states via the kit's attributes instead.
 */
import type * as Component from "@effect/ui/Component";
import type * as View from "@effect/ui/View";
import type { Html } from "@effect/ui/html";
import { Dialog as KitDialog, type DialogEvents, type DialogProps } from "@effect/ui-kit";
import { cn } from "../lib/utils.ts";
import { XIcon } from "./dialog.ts";

/** What a `Sheet`'s `view` gets: the kit Dialog's parts and plain values. */
export type SheetParts = Component.Headless.Parts<typeof KitDialog>;

export type SheetSide = "top" | "right" | "bottom" | "left";

export const SHEET_OVERLAY_CLASS =
  "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0";

export const SHEET_CONTENT_BASE_CLASS =
  "fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500";

export const SHEET_CONTENT_SIDE_CLASSES: Record<SheetSide, string> = {
  right:
    "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
  left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
  top: "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
  bottom:
    "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
};

export const SHEET_CLOSE_CLASS =
  "absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary";

export const SHEET_HEADER_CLASS = "flex flex-col gap-1.5 p-4";

export const SHEET_FOOTER_CLASS = "mt-auto flex flex-col gap-2 p-4";

export const SHEET_TITLE_CLASS = "font-semibold text-foreground";

export const SHEET_DESCRIPTION_CLASS = "text-sm text-muted-foreground";

/** Re-exported so a sheet's close button needs no second import. */
export { XIcon };

/**
 * A shadcn-styled Sheet. Call it like the kit's `Dialog`, with `side`
 * (default `"right"`, as upstream) selecting the popup's position classes:
 *
 *   Sheet(h, {
 *     props: { open: model.open },
 *     side: "left",
 *     onEmit: {
 *       RequestedOpen: () => Msg.RequestedOpen(),
 *       RequestedClose: () => Msg.RequestedClose(),
 *       Settled: () => undefined
 *     },
 *     view: (sheet) =>
 *       h.div(
 *         sheet.trigger(h.button).children("Open"),
 *         sheet.portal(h.dialog)?.children(
 *           sheet.backdrop(h.div),
 *           sheet.popup(h.div).children(
 *             sheet.title(h.h2).children("Title"),
 *             sheet.description(h.p).children("Description")
 *           )
 *         )
 *       )
 *   })
 */
export const Sheet = <Msg, RV = never, RF = never>(
  h: View.Helper<Msg, unknown>,
  options: View.Child.Options<DialogProps, DialogEvents, NoInfer<Msg>> & {
    /** The sheet's whole view, from its styled parts. */
    readonly view: (parts: SheetParts) => View.Content<NoInfer<Msg>, RV>;
    readonly side?: SheetSide | undefined;
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
    view: (sheet) =>
      options.view({
        ...sheet,
        trigger: (element) => sheet.trigger(element.attr("data-slot", "sheet-trigger")),
        portal: (element) => sheet.portal(element.attr("data-slot", "sheet-portal")),
        backdrop: (element) =>
          sheet.backdrop(
            element
              .attr("data-slot", "sheet-overlay")
              .class(cn(SHEET_OVERLAY_CLASS, options.overlayClass)),
          ),
        popup: (element) =>
          sheet.popup(
            element
              .attr("data-slot", "sheet-content")
              .class(
                cn(
                  SHEET_CONTENT_BASE_CLASS,
                  SHEET_CONTENT_SIDE_CLASSES[options.side ?? "right"],
                  options.contentClass,
                ),
              ),
          ),
        title: (element) =>
          sheet.title(
            element
              .attr("data-slot", "sheet-title")
              .class(cn(SHEET_TITLE_CLASS, options.titleClass)),
          ),
        description: (element) =>
          sheet.description(
            element
              .attr("data-slot", "sheet-description")
              .class(cn(SHEET_DESCRIPTION_CLASS, options.descriptionClass)),
          ),
        close: (element) => sheet.close(element.attr("data-slot", "sheet-close")),
      }),
  });

/** Upstream `SheetHeader`: a plain flex div, no kit part owns it. */
export const SheetHeader = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "sheet-header").class(cn(SHEET_HEADER_CLASS, options.class));

/** Upstream `SheetFooter`: a plain flex div, no kit part owns it. */
export const SheetFooter = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "sheet-footer").class(cn(SHEET_FOOTER_CLASS, options.class));
