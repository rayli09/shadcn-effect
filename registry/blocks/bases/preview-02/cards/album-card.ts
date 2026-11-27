/**
 * AlbumCard — shadcn/ui block `preview-02`
 * (registry/bases/radix/blocks/preview-02/cards/album-card.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a presentational Card — cover `<img>` with a price Badge
 * overlaid, the release title/date, and a footer stats grid split by
 * a Separator. Here: a view function with the same anatomy; the
 * `<img>` is `h.img` with upstream's src/alt/class verbatim. Class
 * strings and copy are byte-for-byte upstream.
 *
 * Declared divergences (anything else is a bug):
 *
 * - None.
 */
import type { Html } from "@effect/ui/html";
import { Badge } from "@/components/ui/badge.ts";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card.ts";
import { Separator } from "@/components/ui/separator.ts";

export const AlbumCard = <Msg>(h: Html.H<Msg>, options = {}) =>
  Card(h).children(
    CardContent(h, { class: "flex flex-col gap-4" }).children(
      h.div
        .class("relative overflow-hidden rounded-lg")
        .children(
          h.img
            .attr(
              "src",
              "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&h=800&fit=crop",
            )
            .attr("alt", "Synthetic Horizons EP cover art")
            .class("aspect-square w-full object-cover"),
          Badge(h, { class: "absolute top-3 right-3" }).children("$26,033.79"),
        ),
      h.div
        .class("flex flex-col gap-1")
        .children(
          CardTitle(h).children("Synthetic Horizons EP"),
          CardDescription(h, { class: "text-xs tracking-wider uppercase" }).children(
            "Released Aug 14, 2023",
          ),
        ),
    ),
    CardFooter(h, { class: "flex-col gap-4" }).children(
      Separator(h),
      h.div
        .class("grid w-full grid-cols-2 gap-4")
        .children(
          h.div
            .class("flex flex-col gap-0.5")
            .children(
              h.span
                .class("text-xs tracking-wider text-muted-foreground uppercase")
                .children("Tracks"),
              h.span.class("text-lg font-medium tabular-nums").children("6 Tracks"),
            ),
          h.div
            .class("flex flex-col gap-0.5")
            .children(
              h.span
                .class("line-clamp-1 text-xs tracking-wider text-muted-foreground uppercase")
                .children("Cumulative Streams"),
              h.span.class("text-lg font-medium tabular-nums").children("6,198,524"),
            ),
        ),
    ),
  );
