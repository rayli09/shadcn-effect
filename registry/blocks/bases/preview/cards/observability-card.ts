/**
 * ObservabilityCard — shadcn/ui block `preview` (registry/bases/radix/blocks/preview/cards/observability-card.tsx), bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless Card (`relative w-full max-w-md overflow-hidden
 * pt-0`) topped by a photo: an absolutely positioned primary-colored
 * overlay div (`mix-blend-color`) over an Unsplash `<img>` (aspect-video,
 * grayscale, brightness-60), then a header — "Observability Plus is
 * replacing Monitoring" with its migration description — and a footer
 * with a "Create Query" Button (plus glyph at inline-end) and a
 * secondary "Warning" Badge pushed right with `ml-auto`. Here: a plain
 * view function; the `<img>` becomes `h.img` with the same src / alt /
 * title / class.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Icons: upstream's `IconPlaceholder` is a create-app component that
 *   swaps icon libraries; only the lucide rendering is ported. The
 *   `PlusIcon` placeholder becomes the local `PlusIcon` builder below,
 *   built with the shared `icon()` helper from lucide's `plus` path
 *   data (ISC), copied verbatim; the placeholder's `data-icon`
 *   attribute is kept.
 * - The "Create Query" Button has no upstream handler; here it is
 *   drawn without an `onPress` message, as upstream.
 */
import type { Html } from "@effect/ui/html";
import { Badge } from "@/components/ui/badge.ts";
import { Button } from "@/components/ui/button.ts";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.ts";
import { icon, type IconOptions } from "@/lib/icons";

/** Lucide `plus` (ISC): upstream's `PlusIcon` placeholder. */
const PlusIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M5 12h14" }],
      ["path", { d: "M12 5v14" }],
    ],
    options,
  );

export const ObservabilityCard = <Msg>(h: Html.H<Msg>) =>
  Card(h, { class: "relative w-full max-w-md overflow-hidden pt-0" }).children(
    h.div.class("absolute inset-0 z-30 aspect-video bg-primary opacity-50 mix-blend-color"),
    h.img
      .attr(
        "src",
        "https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      )
      .attr("alt", "Photo by mymind on Unsplash")
      .attr("title", "Photo by mymind on Unsplash")
      .class("relative z-20 aspect-video w-full object-cover brightness-60 grayscale"),
    CardHeader(h).children(
      CardTitle(h).children("Observability Plus is replacing Monitoring"),
      CardDescription(h).children(
        "Switch to the improved way to explore your data, with natural language. Monitoring will no longer be available on the Pro plan in November, 2025",
      ),
    ),
    CardFooter(h).children(
      Button(h).children("Create Query ", PlusIcon(h).attr("data-icon", "inline-end")),
      Badge(h, { variant: "secondary", class: "ml-auto" }).children("Warning"),
    ),
  );
