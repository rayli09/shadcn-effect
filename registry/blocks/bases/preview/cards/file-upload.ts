/**
 * FileUpload — shadcn/ui block `preview` (registry/bases/radix/blocks/preview/cards/file-upload.tsx), bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless Card titled "File Upload" ("Drag and drop or
 * browse") whose content is a bordered Empty state — an icon-variant
 * EmptyMedia holding an upload-cloud glyph, "Upload files" title,
 * "PNG, JPG, PDF up to 10MB" description and a "Browse Files" Button.
 * Here: a plain view function with the same anatomy and class strings.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Icons: upstream's `IconPlaceholder` is a create-app component that
 *   swaps icon libraries; only the lucide rendering is ported. The
 *   `UploadCloudIcon` placeholder becomes the local `CloudUploadIcon`
 *   builder below, built with the shared `icon()` helper from
 *   lucide's `cloud-upload` path data (ISC), copied verbatim.
 * - The "Browse Files" Button has no upstream handler; here it is
 *   drawn without an `onPress` message, as upstream.
 */
import type { Html } from "@effect/ui/html";
import { Button } from "@/components/ui/button.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.ts";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.ts";
import { icon, type IconOptions } from "@/lib/icons";

/** Lucide `cloud-upload` (ISC): upstream's `UploadCloudIcon` placeholder. */
const CloudUploadIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 13v8" }],
      ["path", { d: "M5 16.75A7 7 0 1115.71 9h1.79a4.5 4.5 0 011.5 8.742" }],
      ["path", { d: "m9 16 3-3 3 3" }],
    ],
    options,
  );

export const FileUpload = <Msg>(h: Html.H<Msg>) =>
  Card(h).children(
    CardHeader(h).children(
      CardTitle(h).children("File Upload"),
      CardDescription(h).children("Drag and drop or browse"),
    ),
    CardContent(h).children(
      Empty(h, { class: "border" }).children(
        EmptyHeader(h).children(
          EmptyMedia(h, { variant: "icon" }).children(CloudUploadIcon(h)),
          EmptyTitle(h).children("Upload files"),
          EmptyDescription(h).children("PNG, JPG, PDF up to 10MB"),
        ),
        EmptyContent(h).children(Button(h).children("Browse Files")),
      ),
    ),
  );
