/**
 * FrontDoor — shadcn/ui block `preview-02` (cards/front-door.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card for a smart
 * lock — title, model description, a "Locked" status with a lock icon
 * in the header action, and a striped muted preview area carrying a
 * destructive "Live" Badge. Here: a pure view function with the same
 * anatomy and class strings byte-for-byte upstream; it keeps no state,
 * so it is not a Component.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `IconPlaceholder` is a create-app component that swaps
 *   icon libraries; only its lucide rendering is ported — the
 *   `LockIcon` glyph, as the file-local `LockIcon` builder below
 *   (lucide `lock` path data, ISC, via the shared `icon()` helper),
 *   wearing the class the JSX gave the placeholder (`size-4`). The
 *   tabler / hugeicons / phosphor / remixicon alternatives are not
 *   ported.
 */
import type { Html } from "@effect/ui/html";
import { Badge } from "@/components/ui/badge.ts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { icon, type IconOptions } from "@/lib/icons";

/** Lucide `lock` (ISC): a padlock body and shackle. */
const LockIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }],
      ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4" }],
    ],
    options,
  );

export const FrontDoor = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  Card(h, { class: options.class }).children(
    CardHeader(h).children(
      CardTitle(h).children("Front Door"),
      CardDescription(h).children("Smart Lock Pro"),
      CardAction(h).children(
        h.div
          .class("flex items-center gap-1.5 text-sm text-muted-foreground")
          .children("Locked", LockIcon(h, { class: "size-4" })),
      ),
    ),
    CardContent(h).children(
      h.div
        .class(
          "relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-muted bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,var(--border)_10px,var(--border)_11px)]",
        )
        .children(
          Badge(h, { variant: "destructive", class: "absolute top-2 right-2" }).children("Live"),
        ),
    ),
  );
