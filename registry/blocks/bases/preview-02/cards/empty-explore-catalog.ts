/**
 * EmptyExploreCatalog — shadcn/ui block `preview-02`
 * (cards/empty-explore-catalog.tsx), bases generation, ported 1:1 to
 * Effect UI.
 *
 * Upstream: a stateless React function rendering a Card whose content
 * is an Empty state (icon media, title, description) with a single
 * "View Catalog" Button. Here: a pure view function with the same
 * anatomy and class strings byte-for-byte upstream; it keeps no state,
 * so it is not a Component.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `IconPlaceholder` is a create-app component that swaps
 *   icon libraries; only its lucide rendering is ported — the
 *   `AudioLinesIcon` glyph, as the file-local `AudioLinesIcon` builder
 *   below (lucide `audio-lines` path data, ISC, via the shared `icon()`
 *   helper). The tabler / hugeicons / phosphor / remixicon alternatives
 *   are not ported.
 */
import type { Html } from "@effect/ui/html";
import { Button } from "@/components/ui/button.ts";
import { Card, CardContent } from "@/components/ui/card.ts";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.ts";
import { icon, type IconOptions } from "@/lib/icons";

/** Lucide `audio-lines` (ISC): six vertical bars of varying heights. */
const AudioLinesIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M2 10v3" }],
      ["path", { d: "M6 6v11" }],
      ["path", { d: "M10 3v18" }],
      ["path", { d: "M14 8v7" }],
      ["path", { d: "M18 5v13" }],
      ["path", { d: "M22 10v3" }],
    ],
    options,
  );

export const EmptyExploreCatalog = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  Card(h, { class: options.class }).children(
    CardContent(h).children(
      Empty(h, { class: "p-4" }).children(
        EmptyMedia(h, { variant: "icon" }).children(AudioLinesIcon(h)),
        EmptyHeader(h).children(
          EmptyTitle(h).children("Explore Catalog"),
          EmptyDescription(h).children(
            "Check your ISRC codes, metadata, and visual assets before going live.",
          ),
        ),
        EmptyContent(h).children(Button(h).children("View Catalog")),
      ),
    ),
  );
