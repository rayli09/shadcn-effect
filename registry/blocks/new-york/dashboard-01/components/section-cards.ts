/**
 * SectionCards — shadcn/ui block `dashboard-01`
 * (`registry/new-york-v4/blocks/dashboard-01/components/section-cards.tsx`),
 * ported 1:1 to Effect UI. Class strings and card content are verbatim
 * from the source.
 *
 * Upstream: a stateless React function rendering four stat `Card`s in a
 * container-query grid. Here: a view function. The trending icons are
 * Tabler (`@tabler/icons-react`); the builders below carry the Tabler
 * path data (MIT) via this repo's `icon()` helper.
 */
import type * as Html from "@effect/ui/html/Html";
import { icon, type IconOptions } from "@/lib/icons";
import { Badge } from "@/components/ui/badge.ts";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";

/** Tabler `trending-up` (MIT). */
export const TrendingUpIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M3 17l6 -6l4 4l8 -8" }],
      ["path", { d: "M14 7l7 0l0 7" }],
    ],
    options,
  );

/** Tabler `trending-down` (MIT). */
export const TrendingDownIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M3 7l6 6l4 -4l8 8" }],
      ["path", { d: "M21 10l0 7l-7 0" }],
    ],
    options,
  );

const titleClass = "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl";

export const SectionCards = <Msg>(h: Html.H<Msg>) =>
  h.div
    .class(
      "grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card",
    )
    .children(
      Card(h, { class: "@container/card" }).children(
        CardHeader(h).children(
          CardDescription(h).children("Total Revenue"),
          CardTitle(h, { class: titleClass }).children("$1,250.00"),
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
          CardTitle(h, { class: titleClass }).children("1,234"),
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
          CardTitle(h, { class: titleClass }).children("45,678"),
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
          CardTitle(h, { class: titleClass }).children("4.5%"),
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
