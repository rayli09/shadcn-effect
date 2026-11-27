/**
 * PartFile — shadcn/ui block `preview-03`
 * (registry/bases/radix/blocks/preview-03/components/part-file.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering an AI SDK
 * `FileUIPart` as a shadcn `Attachment`. Image parts
 * (`mediaType` starting `image/`) become a vertical attachment: an
 * image `AttachmentMedia` holding a plain `<img>`, a content row with
 * an Image icon tile, the filename title and an outline Badge naming
 * the image subtype, and a full-card anchor trigger. Other files
 * become a horizontal attachment: a FileText icon media, title +
 * media-type description content, an actions row, and the same anchor
 * trigger. The filename comes from the part's `filename` or is
 * derived from the URL by the `getFilename` helper, ported verbatim.
 * Here: a view function over this generation's `Attachment` / `Badge`
 * ports (`@/components/ui/attachment.ts`, `@/components/ui/badge.ts`),
 * with the part data as a local structural type mirroring the fields
 * the JSX reads (the `ai` package is banned in this registry).
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `AttachmentTrigger asChild` wraps an `<a>` (D-2: no
 *   Slot). The rendered element upstream is the anchor carrying the
 *   trigger's `data-slot` and classes, so here the anchor is rendered
 *   directly with `ATTACHMENT_TRIGGER_CLASS` (the class constant the
 *   attachment port exports for exactly this composition) plus
 *   upstream's `href` / `target` / `rel` / `aria-label`.
 * - Upstream's non-image `AttachmentAction asChild` renders a
 *   `<span aria-hidden="true">` carrying the action's button styling
 *   (D-2). Here the port's `AttachmentAction` button itself carries
 *   `aria-hidden="true"` and the icon — the element is a `<button>`,
 *   not a `<span>`, and there is no extra span wrapper.
 * - Upstream's `<IconPlaceholder lucide="ImageIcon" ... />` /
 *   `lucide="FileTextIcon"` / `lucide="ExternalLinkIcon"` name five
 *   icon sets; only the lucide glyph renders here — `ImageIcon` /
 *   `FileTextIcon` / `ExternalLinkIcon` below are file-local builders
 *   over the shared `icon()` helper in `@/lib/icons`, node data
 *   copied verbatim from lucide's SVGs (ISC).
 * - `mediaType` is optional in the local part type; a missing
 *   media type is treated as a non-image generic file (upstream's AI
 *   SDK type requires it, so this only widens the accepted input).
 * - Upstream returns `null` for a part whose `type` is not `"file"`;
 *   a view function must return one node, so a mismatched part
 *   renders an empty `span` (nothing visible). Callers dispatch on
 *   `part.type` first, as upstream's cards do.
 * - Upstream spreads `React.ComponentProps<"div">` onto the
 *   Attachment; the only prop here is `class` (upstream's
 *   `className`), appended to the Attachment's classes exactly as
 *   upstream's `cn(...)` did.
 */
import type { Html } from "@effect/ui/html";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  ATTACHMENT_TRIGGER_CLASS,
} from "@/components/ui/attachment.ts";
import { Badge } from "@/components/ui/badge.ts";
import { icon, type IconOptions } from "@/lib/icons";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Icons — file-local builders (D-7) for glyphs `@/lib/icons` does not hoist
// yet; node data copied verbatim from lucide's SVGs (ISC).
// ---------------------------------------------------------------------------

/** Lucide `image` (ISC). */
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

/** Lucide `file-text` (ISC). */
const FileTextIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
        },
      ],
      ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5" }],
      ["path", { d: "M10 9H8" }],
      ["path", { d: "M16 13H8" }],
      ["path", { d: "M16 17H8" }],
    ],
    options,
  );

/** Lucide `external-link` (ISC). */
const ExternalLinkIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M15 3h6v6" }],
      ["path", { d: "M10 14 21 3" }],
      ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }],
    ],
    options,
  );

// ---------------------------------------------------------------------------
// PartFile
// ---------------------------------------------------------------------------

/** The fields of an AI SDK file part that the upstream JSX reads. */
export type FilePart = {
  readonly type: "file";
  readonly url: string;
  readonly mediaType?: string | undefined;
  readonly filename?: string | undefined;
};

const getFilename = (part: FilePart): string => {
  if (part.filename) {
    return part.filename;
  }
  try {
    const pathname = new URL(part.url).pathname;
    const filename = pathname.split("/").filter(Boolean).pop();
    if (filename?.includes(".")) {
      return decodeURIComponent(filename);
    }
  } catch {
    const filename = part.url.split("?")[0]?.split("/").pop();
    if (filename?.includes(".")) {
      return filename;
    }
  }
  return (part.mediaType ?? "").startsWith("image/") ? "Image file" : "File";
};

export const PartFile = <Msg, R = never>(
  h: Html.H<Msg>,
  options: {
    readonly part: FilePart;
    readonly class?: string | undefined;
  },
) => {
  const { part } = options;
  if (part.type !== "file") {
    return h.span;
  }
  const mediaType = part.mediaType ?? "";
  const isImage = mediaType.startsWith("image/");
  const filename = getFilename(part);
  const trigger = h.a
    .attr("data-slot", "attachment-trigger")
    .class(ATTACHMENT_TRIGGER_CLASS)
    .attr("href", part.url)
    .attr("target", "_blank")
    .attr("rel", "noreferrer")
    .attr("aria-label", `Open ${filename}`);
  if (isImage) {
    return Attachment(h, {
      orientation: "vertical",
      class: cn("group/file w-full max-w-72", options.class),
    }).children(
      AttachmentMedia(h, { variant: "image", class: "aspect-[4/3] w-full" }).children(
        h.img.attr("src", part.url).attr("alt", filename),
      ),
      AttachmentContent(h, { class: "flex items-center gap-2" }).children(
        AttachmentMedia(h, { class: "size-7" }).children(ImageIcon(h)),
        h.span.class("min-w-0 flex-1").children(AttachmentTitle(h).children(filename)),
        Badge(h, { variant: "outline", class: "shrink-0" }).children(
          mediaType.replace("image/", "").toUpperCase(),
        ),
      ),
      trigger,
    );
  }
  return Attachment(h, { class: cn("w-full max-w-80", options.class) }).children(
    AttachmentMedia(h).children(FileTextIcon(h)),
    AttachmentContent(h).children(
      AttachmentTitle(h).children(filename),
      AttachmentDescription(h).children(mediaType),
    ),
    AttachmentActions(h).children(
      AttachmentAction(h).attr("aria-hidden", "true").children(ExternalLinkIcon(h)),
    ),
    trigger,
  );
};
