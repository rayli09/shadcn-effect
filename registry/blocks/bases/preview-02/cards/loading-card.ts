/**
 * LoadingCard — shadcn/ui block `preview-02` (cards/loading-card.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card filled with
 * Skeleton placeholders — two lines in the header, a large block, three
 * text lines and two button-shaped blocks in the content. Here: a pure
 * view function with the same anatomy and class strings byte-for-byte
 * upstream; it keeps no state, so it is not a Component.
 *
 * Declared divergences (anything else is a bug):
 *
 * - None.
 */
import type { Html } from "@effect/ui/html";
import { Card, CardContent, CardHeader } from "@/components/ui/card.ts";
import { Skeleton } from "@/components/ui/skeleton.ts";

export const LoadingCard = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  Card(h, { class: options.class }).children(
    CardHeader(h).children(Skeleton(h, { class: "h-5 w-32" }), Skeleton(h, { class: "h-4 w-48" })),
    CardContent(h, { class: "flex flex-col gap-4" }).children(
      Skeleton(h, { class: "h-32 w-full rounded-lg" }),
      h.div
        .class("flex flex-col gap-2")
        .children(
          Skeleton(h, { class: "h-4 w-full" }),
          Skeleton(h, { class: "h-4 w-3/4" }),
          Skeleton(h, { class: "h-4 w-1/2" }),
        ),
      h.div
        .class("flex gap-2")
        .children(
          Skeleton(h, { class: "h-9 flex-1 rounded-md" }),
          Skeleton(h, { class: "h-9 flex-1 rounded-md" }),
        ),
    ),
  );
