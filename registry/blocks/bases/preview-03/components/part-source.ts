/**
 * PartSource — shadcn/ui block `preview-03`
 * (registry/bases/radix/blocks/preview-03/components/part-source.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering an AI SDK source
 * part. A `source-url` part becomes an external anchor card
 * (`data-slot="part-source"`, `data-type`) with an ExternalLink icon
 * tile, the title (or URL) over the URL's hostname, and an outline
 * `URL` Badge; a `source-document` part becomes a static card of the
 * same shape with a FileSearch icon tile, the title (or filename, or
 * "Document source") over `filename / mediaType`, a `Source ID:` line,
 * and an outline `Document` Badge. The `getHostname` helper is ported
 * verbatim. Here: a view function over this generation's `Badge` port
 * (`@/components/ui/badge.ts`), with the part data as a local
 * structural union mirroring the fields the JSX reads (the `ai`
 * package is banned in this registry).
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `<IconPlaceholder lucide="ExternalLinkIcon" ... />` /
 *   `lucide="FileSearchIcon"` name five icon sets; only the lucide
 *   glyph renders here — `ExternalLinkIcon` / `FileSearchIcon` below
 *   are file-local builders over the shared `icon()` helper in
 *   `@/lib/icons`, node data copied verbatim from lucide's SVGs
 *   (ISC).
 * - Upstream returns `null` for any other part type; a view function
 *   must return one node, so a mismatched part renders an empty
 *   `span` (nothing visible). Callers dispatch on `part.type` first,
 *   as upstream's cards do.
 * - Upstream spreads `React.ComponentProps<"div">` onto the root; the
 *   only prop here is `class` (upstream's `className`), appended to
 *   the root's classes exactly as upstream's `cn(...)` did.
 */
import type { Html } from "@effect/ui/html";
import { Badge } from "@/components/ui/badge.ts";
import { icon, type IconOptions } from "@/lib/icons";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Icons — file-local builders (D-7) for glyphs `@/lib/icons` does not hoist
// yet; node data copied verbatim from lucide's SVGs (ISC).
// ---------------------------------------------------------------------------

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

/** Lucide `file-search` (ISC). */
const FileSearchIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
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
      ["circle", { cx: "11.5", cy: "14.5", r: "2.5" }],
      ["path", { d: "M13.3 16.3 15 18" }],
    ],
    options,
  );

// ---------------------------------------------------------------------------
// PartSource
// ---------------------------------------------------------------------------

/** The fields of an AI SDK `source-url` part that the upstream JSX reads. */
export type SourceUrlPart = {
  readonly type: "source-url";
  readonly sourceId: string;
  readonly url: string;
  readonly title?: string | undefined;
};

/** The fields of an AI SDK `source-document` part that the upstream JSX reads. */
export type SourceDocumentPart = {
  readonly type: "source-document";
  readonly sourceId: string;
  readonly mediaType: string;
  readonly title?: string | undefined;
  readonly filename?: string | undefined;
};

export type SourcePart = SourceUrlPart | SourceDocumentPart;

const getHostname = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export const PartSource = <Msg, R = never>(
  h: Html.H<Msg>,
  options: {
    readonly part: SourcePart;
    readonly class?: string | undefined;
  },
) => {
  const { part } = options;
  if (part.type === "source-url") {
    return h.a
      .attr("data-slot", "part-source")
      .attr("data-type", part.type)
      .attr("href", part.url)
      .attr("target", "_blank")
      .attr("rel", "noreferrer")
      .class(
        cn(
          "flex w-full max-w-full min-w-0 items-center gap-2 rounded-lg border bg-muted/40 p-3 text-sm transition-colors hover:bg-muted",
          options.class,
        ),
      )
      .children(
        h.span
          .class(
            "flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground",
          )
          .children(ExternalLinkIcon(h, { class: "size-4" })),
        h.span
          .class("min-w-0 flex-1")
          .children(
            h.span.class("block truncate font-medium").children(part.title ?? part.url),
            h.span
              .class("block truncate text-xs text-muted-foreground")
              .children(getHostname(part.url)),
          ),
        Badge(h, { variant: "outline", class: "shrink-0" }).children("URL"),
      );
  }
  if (part.type === "source-document") {
    return h.div
      .attr("data-slot", "part-source")
      .attr("data-type", part.type)
      .class(
        cn(
          "flex w-full max-w-full min-w-0 items-start gap-2 rounded-lg border bg-muted/40 p-3 text-sm",
          options.class,
        ),
      )
      .children(
        h.span
          .class(
            "flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground",
          )
          .children(FileSearchIcon(h, { class: "size-4" })),
        h.span
          .class("min-w-0 flex-1")
          .children(
            h.span
              .class("block truncate font-medium")
              .children(part.title ?? part.filename ?? "Document source"),
            h.span
              .class("mt-0.5 block truncate text-xs text-muted-foreground")
              .children([part.filename, part.mediaType].filter(Boolean).join(" / ")),
            h.span
              .class("mt-2 block text-xs text-muted-foreground")
              .children(`Source ID: ${part.sourceId}`),
          ),
        Badge(h, { variant: "outline", class: "shrink-0" }).children("Document"),
      );
  }
  return h.span;
};
