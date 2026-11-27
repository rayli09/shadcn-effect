/**
 * CoverArt — shadcn/ui block `preview-02`
 * (registry/bases/radix/blocks/preview-02/cards/cover-art.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a Card with a "Cover Art" Label, a square outline Item
 * whose inner <label> (clicking it opens the file picker) centers a
 * large image icon, a visually-hidden file <input>, and a footer
 * whose secondary Button is rendered `asChild` on a <label> for the
 * same input, above a size/format note. Here: a view function with
 * the same anatomy; the file input is a plain `h.input` with
 * upstream's id/type/accept/class verbatim. Class strings and copy
 * are byte-for-byte upstream.
 *
 * Declared divergences (anything else is a bug):
 *
 * - `Button asChild` (D-2): the port's `Button` always renders a
 *   <button>, so the footer control is drawn by the local
 *   `UploadLabel` below, which stacks the button's variants and
 *   `data-*` stamps on an `h.label` — exactly the stamps `Button`
 *   itself writes, on the label upstream rendered (the same pattern
 *   as the sidebar blocks' menu links). Upstream's label class
 *   (`cursor-pointer`) is appended to the button's classes, as the
 *   Slot merge did.
 * - The standalone `Label` keeps its `htmlFor` (the port's Label
 *   writes the native `for`), pairing it with the file input's `id`
 *   exactly as upstream; the kit Field wiring isn't involved — there
 *   is no Field here upstream either.
 * - Upstream's `IconPlaceholder` swaps icon libraries per create-app
 *   params; only the lucide rendering is ported (`ImageIcon` below
 *   is a file-local builder from lucide's SVG data; the shared
 *   `@/lib/icons` module doesn't export it yet).
 */
import type { Html } from "@effect/ui/html";
import type * as View from "@effect/ui/View";
import { buttonVariants } from "@/components/ui/button.ts";
import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card.ts";
import { Item } from "@/components/ui/item.ts";
import { Label } from "@/components/ui/label.ts";
import { icon, type IconOptions } from "@/lib/icons";
import { cn } from "@/lib/utils";

/** Lucide `image` (ISC), via the shared `icon()` helper. */
const ImageIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }],
      ["circle", { cx: "9", cy: "9", r: "2" }],
      ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }],
    ],
    options,
  );

/**
 * Upstream's `Button asChild` footer control: a <label> wearing the
 * button's variants and stamps (see the header). Variant is
 * upstream's `secondary`, size its default.
 */
const UploadLabel = <Msg>(
  h: Html.H<Msg>,
  options: { readonly htmlFor: string },
  ...children: View.Children<Msg>
) =>
  h.label
    .attr("for", options.htmlFor)
    .attrs({
      "data-slot": "button",
      "data-variant": "secondary",
      "data-size": "default",
    })
    .class(buttonVariants({ variant: "secondary", class: cn("w-full", "cursor-pointer") }))
    .children(...children);

export const CoverArt = <Msg>(h: Html.H<Msg>, options = {}) =>
  Card(h).children(
    CardContent(h, { class: "flex flex-col gap-3" }).children(
      Label(h, {
        htmlFor: "cover-art",
        class: "text-center text-xs font-normal tracking-wider text-muted-foreground uppercase",
      }).children("Cover Art"),
      Item(h, { variant: "outline", class: "aspect-square" }).children(
        h.label
          .attr("for", "cover-art")
          .class("flex size-full cursor-pointer items-center justify-center")
          .children(ImageIcon(h, { class: "size-10 text-muted-foreground/50" })),
      ),
      h.input
        .attr("id", "cover-art")
        .attr("type", "file")
        .attr("accept", "image/jpeg,image/png")
        .class("sr-only"),
    ),
    CardFooter(h, { class: "flex-col gap-2" }).children(
      UploadLabel(h, { htmlFor: "cover-art" }, "Upload Artwork"),
      CardDescription(h, { class: "text-center text-xs" }).children(
        "Minimum 3000 × 3000px",
        h.br,
        "JPEG or PNG only",
      ),
    ),
  );
