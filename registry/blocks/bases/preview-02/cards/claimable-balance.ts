/**
 * ClaimableBalance — shadcn/ui block `preview-02`
 * (registry/bases/radix/blocks/preview-02/cards/claimable-balance.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a presentational Card — a "Claimable Balance" header with
 * a large $0.00 title and a "Pending Setup" outline Badge, a muted
 * Item breaking down net royalties / processing fee / total, and a
 * footer note. Here: a view function with the same anatomy. Class
 * strings and copy are byte-for-byte upstream.
 *
 * Declared divergences (anything else is a bug):
 *
 * - None.
 */
import type { Html } from "@effect/ui/html";
import { Badge } from "@/components/ui/badge.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { Item, ItemContent } from "@/components/ui/item.ts";
import { Separator } from "@/components/ui/separator.ts";

export const ClaimableBalance = <Msg>(h: Html.H<Msg>, options = {}) =>
  Card(h).children(
    CardHeader(h).children(
      CardDescription(h).children("Claimable Balance"),
      CardTitle(h, { class: "text-5xl tabular-nums" }).children("$0.00"),
      Badge(h, { variant: "outline" }).children(
        h.span.class("size-2 rounded-full bg-yellow-500"),
        "Pending Setup",
      ),
    ),
    CardContent(h, { class: "flex flex-1 flex-col justify-end" }).children(
      Item(h, { variant: "muted", class: "flex-col items-stretch" }).children(
        ItemContent(h, { class: "gap-3" }).children(
          h.div
            .class("flex items-center justify-between")
            .children(
              h.span.class("text-sm text-muted-foreground").children("Net Royalties"),
              h.span.class("text-sm font-medium tabular-nums").children("$0.00"),
            ),
          h.div
            .class("flex items-center justify-between")
            .children(
              h.span.class("text-sm text-muted-foreground").children("Processing Fee"),
              h.span.class("text-sm font-medium tabular-nums").children("-$0.00"),
            ),
          Separator(h),
          h.div
            .class("flex items-center justify-between")
            .children(
              h.span.class("text-sm text-muted-foreground").children("Total Ready to Claim"),
              h.span.class("text-sm font-semibold tabular-nums").children("$0.00 USD"),
            ),
        ),
      ),
    ),
    CardFooter(h).children(
      CardDescription(h).children(
        "Once your bank is connected, balances over $10.00 are automatically eligible for monthly distribution on the 15th of each month.",
      ),
    ),
  );
