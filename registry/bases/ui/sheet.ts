/**
 * Sheet (bases generation) — shadcn/ui `sheet` ported 1:1 to Effect UI.
 *
 * Same Effect port as `registry/ui/sheet.ts` (the @effect/ui-kit
 * `Dialog` headless component, exactly as upstream sits on Radix's
 * Dialog); only the class layer changes: class strings are
 * byte-for-byte the shadcn bases/radix strings — structural inline
 * classes plus `cn-*` hook classes whose utilities are supplied by the
 * style presets. The parity checker asserts every token in
 * `parity/bases-tokens.json["sheet"]`.
 *
 * Anatomy diff vs the new-york generation: no new parts, but the
 * content's shape changed. In new-york the popup's class string carried
 * a per-side block (insets, border, width) selected by the `side`
 * prop; in bases the popup carries ONE class string (the
 * `cn-sheet-content` hook plus the slide/fade animation utilities) and
 * a `data-side` attribute — the per-side positioning lives in the
 * presets' `.cn-sheet-content` rules keyed on `[data-side=…]`. This
 * port stamps `data-side` from the same `side` option (default
 * `"right"`, as upstream), so the presets can match. Note the bases
 * animation utilities key on `data-open` / `data-closed` — the kit's
 * own attributes — so unlike the new-york strings they are live under
 * the kit, not inert parity tokens.
 *
 * The auto close button upstream renders inside SheetContent follows
 * the bases dialog pattern: the shadcn Button (`variant="ghost"`,
 * `size="icon-sm"`) carrying the `cn-sheet-close` hook, stamped
 * `data-slot="sheet-close"`. Here it stays a composition:
 *
 *   parts.close(
 *     h.button
 *       .class(cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), SHEET_CLOSE_CLASS))
 *       .attr("data-slot", "sheet-close")
 *   ).children(XIcon(h), h.span.class("sr-only").children("Close"))
 *
 * (`buttonVariants` from ./button.ts.) Nothing in bases sheet is
 * unported.
 */
import type * as Component from "@effect/ui/Component";
import type * as View from "@effect/ui/View";
import type { Html } from "@effect/ui/html";
import { Dialog as KitDialog, type DialogEvents, type DialogProps } from "@effect/ui-kit";
import { cn } from "@/lib/utils";
import { XIcon } from "./dialog.ts";

/** What a `Sheet`'s `view` gets: the kit Dialog's parts and plain values. */
export type SheetParts = Component.Headless.Parts<typeof KitDialog>;

export type SheetSide = "top" | "right" | "bottom" | "left";

export const SHEET_OVERLAY_CLASS =
  "cn-sheet-overlay fixed inset-0 z-50 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0";

export const SHEET_CONTENT_CLASS =
  "cn-sheet-content data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=right]:data-closed:slide-out-to-right-10 data-[side=top]:data-closed:slide-out-to-top-10";

/** The hook class on the auto close button (a ghost icon-sm Button — see header). */
export const SHEET_CLOSE_CLASS = "cn-sheet-close";

export const SHEET_HEADER_CLASS = "cn-sheet-header flex flex-col";

export const SHEET_FOOTER_CLASS = "cn-sheet-footer mt-auto flex flex-col";

export const SHEET_TITLE_CLASS = "cn-sheet-title cn-font-heading";

export const SHEET_DESCRIPTION_CLASS = "cn-sheet-description";

/** Re-exported so a sheet's close button needs no second import. */
export { XIcon };

/**
 * A shadcn-styled Sheet. Call it like the kit's `Dialog`, with `side`
 * (default `"right"`, as upstream) stamped as the popup's `data-side`
 * for the presets' per-side rules:
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
              .attr("data-side", options.side ?? "right")
              .class(cn(SHEET_CONTENT_CLASS, options.contentClass)),
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
