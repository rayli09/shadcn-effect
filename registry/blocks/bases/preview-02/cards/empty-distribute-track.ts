/**
 * EmptyDistributeTrack — shadcn/ui block `preview-02`
 * (registry/bases/radix/blocks/preview-02/cards/empty-distribute-track.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a Card holding an Empty state — a plus icon in an
 * icon-variant EmptyMedia, a "Distribute Track" title/description,
 * and a "Create Release" Button. Here: a view function with the same
 * anatomy. Class strings and copy are byte-for-byte upstream.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `IconPlaceholder` swaps icon libraries per create-app
 *   params; only the lucide rendering is ported (`PlusIcon` below is
 *   a file-local builder from lucide's SVG data; the shared
 *   `@/lib/icons` module doesn't export it yet).
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

/** Lucide `plus` (ISC), via the shared `icon()` helper. */
const PlusIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M5 12h14" }],
      ["path", { d: "M12 5v14" }],
    ],
    options,
  );

export const EmptyDistributeTrack = <Msg>(h: Html.H<Msg>, options = {}) =>
  Card(h).children(
    CardContent(h).children(
      Empty(h, { class: "p-4" }).children(
        EmptyMedia(h, { variant: "icon" }).children(PlusIcon(h)),
        EmptyHeader(h).children(
          EmptyTitle(h).children("Distribute Track"),
          EmptyDescription(h).children(
            "Upload your first master to start reaching listeners on Spotify, Apple Music, and more.",
          ),
        ),
        EmptyContent(h).children(Button(h).children("Create Release")),
      ),
    ),
  );
