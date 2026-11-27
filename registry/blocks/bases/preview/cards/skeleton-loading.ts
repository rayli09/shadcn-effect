/**
 * SkeletonLoading — shadcn/ui block `preview` (cards/skeleton-loading.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card whose content is
 * a skeleton placeholder layout — an avatar circle beside two text lines,
 * three full-width text lines, and two button-sized blocks — all drawn
 * with the bases `Skeleton`. Here: a named view function with the same
 * markup and class strings byte-for-byte upstream.
 *
 * Declared divergences (anything else is a bug):
 *
 * - None. No state, no handlers, no icons upstream.
 */
import type { Html } from "@effect/ui/html";
import { Card, CardContent } from "@/components/ui/card.ts";
import { Skeleton } from "@/components/ui/skeleton.ts";

export const SkeletonLoading = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  Card(h, { class: options.class }).children(
    CardContent(h, { class: "flex flex-col gap-4" }).children(
      h.div
        .class("flex items-center gap-3")
        .children(
          Skeleton(h, { class: "size-10 rounded-full" }),
          h.div
            .class("flex flex-1 flex-col gap-2")
            .children(Skeleton(h, { class: "h-4 w-3/4" }), Skeleton(h, { class: "h-3 w-1/2" })),
        ),
      h.div
        .class("flex flex-col gap-2")
        .children(
          Skeleton(h, { class: "h-3 w-full" }),
          Skeleton(h, { class: "h-3 w-full" }),
          Skeleton(h, { class: "h-3 w-4/5" }),
        ),
      h.div
        .class("flex gap-2")
        .children(Skeleton(h, { class: "h-8 w-20" }), Skeleton(h, { class: "h-8 w-20" })),
    ),
  );
