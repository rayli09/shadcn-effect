/**
 * SectionCards — from the upstream bases block `dashboard-01`
 * (`registry/bases/radix/blocks/dashboard-01/components/section-cards.tsx`),
 * ported 1:1 to Effect UI. Class strings and the card contents are
 * verbatim from the source.
 *
 * Pairs with the `base-*` ui items (see site-header.ts's header).
 *
 * A view function (upstream is a stateless React function): the
 * caller's `h` only — this piece sits outside the sidebar, so no
 * provider parts. Upstream's `IconPlaceholder` names the lucide
 * glyph; the builders below are that glyph.
 *
 * Declared divergences:
 *
 * - Icons: `TrendingUpIcon` and `TrendingDownIcon` are LOCAL
 *   builders over the shared `icon()` helper, nodes copied verbatim
 *   from lucide's SVGs (ISC): trending-up, trending-down.
 */
import type * as Html from "@effect/ui/html/Html";
import { Badge } from "@/components/ui/badge.ts";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { icon, type IconOptions } from "@/lib/icons";

/** Lucide `trending-up` (ISC). */
const TrendingUpIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M16 7h6v6" }],
      ["path", { d: "m22 7-8.5 8.5-5-5L2 17" }],
    ],
    options,
  );

/** Lucide `trending-down` (ISC). */
const TrendingDownIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M16 17h6v-6" }],
      ["path", { d: "m22 17-8.5-8.5-5 5L2 7" }],
    ],
    options,
  );

export const SectionCards = <Msg>(h: Html.H<Msg>) =>
  h.div
    .class(
      "grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card",
    )
    .children(
      Card(h, { class: "@container/card" }).children(
        CardHeader(h).children(
          CardDescription(h).children("Total Revenue"),
          CardTitle(h, {
            class: "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
          }).children("$1,250.00"),
          CardAction(h).children(
            Badge(h, { variant: "outline" }).children(TrendingUpIcon(h), "+12.5%"),
          ),
        ),
        CardFooter(h, { class: "flex-col items-start gap-1.5 text-sm" }).children(
          h.div
            .class("line-clamp-1 flex gap-2 font-medium")
            .children("Trending up this month ", TrendingUpIcon(h, { class: "size-4" })),
          h.div.class("text-muted-foreground").children("Visitors for the last 6 months"),
        ),
      ),
      Card(h, { class: "@container/card" }).children(
        CardHeader(h).children(
          CardDescription(h).children("New Customers"),
          CardTitle(h, {
            class: "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
          }).children("1,234"),
          CardAction(h).children(
            Badge(h, { variant: "outline" }).children(TrendingDownIcon(h), "-20%"),
          ),
        ),
        CardFooter(h, { class: "flex-col items-start gap-1.5 text-sm" }).children(
          h.div
            .class("line-clamp-1 flex gap-2 font-medium")
            .children("Down 20% this period ", TrendingDownIcon(h, { class: "size-4" })),
          h.div.class("text-muted-foreground").children("Acquisition needs attention"),
        ),
      ),
      Card(h, { class: "@container/card" }).children(
        CardHeader(h).children(
          CardDescription(h).children("Active Accounts"),
          CardTitle(h, {
            class: "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
          }).children("45,678"),
          CardAction(h).children(
            Badge(h, { variant: "outline" }).children(TrendingUpIcon(h), "+12.5%"),
          ),
        ),
        CardFooter(h, { class: "flex-col items-start gap-1.5 text-sm" }).children(
          h.div
            .class("line-clamp-1 flex gap-2 font-medium")
            .children("Strong user retention ", TrendingUpIcon(h, { class: "size-4" })),
          h.div.class("text-muted-foreground").children("Engagement exceed targets"),
        ),
      ),
      Card(h, { class: "@container/card" }).children(
        CardHeader(h).children(
          CardDescription(h).children("Growth Rate"),
          CardTitle(h, {
            class: "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
          }).children("4.5%"),
          CardAction(h).children(
            Badge(h, { variant: "outline" }).children(TrendingUpIcon(h), "+4.5%"),
          ),
        ),
        CardFooter(h, { class: "flex-col items-start gap-1.5 text-sm" }).children(
          h.div
            .class("line-clamp-1 flex gap-2 font-medium")
            .children("Steady performance increase ", TrendingUpIcon(h, { class: "size-4" })),
          h.div.class("text-muted-foreground").children("Meets growth projections"),
        ),
      ),
    );
