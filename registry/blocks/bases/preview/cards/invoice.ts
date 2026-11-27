/**
 * Invoice — shadcn/ui block `preview` (registry/bases/radix/blocks/preview/cards/invoice.tsx), bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless Card titled "Invoice #INV-2847" ("Due March
 * 30, 2026") with a "Pending" secondary Badge in the header action,
 * a Table of the three `INVOICE_ITEMS` rows (item / qty / rate /
 * amount, amounts formatted as USD via `Intl.NumberFormat`) plus
 * Subtotal / Tax / Total Due rows computed from the items, and a
 * footer with "Download PDF" (outline, sm) and "Pay Now" (sm,
 * `ml-auto`) Buttons. Here: a plain view function — the data table,
 * the currency formatter and the computed totals are upstream's,
 * verbatim.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream puts the Subtotal / Tax / Total Due rows in the
 *   TableBody after the item rows (its TableFooter import is unused
 *   there); the rows stay in the body here, as upstream renders them.
 * - Upstream's spanning cells use `colSpan={3}`; the same attribute
 *   is stamped on the ported cells.
 * - The footer Buttons have no upstream handlers; here they are
 *   drawn without `onPress` messages, as upstream.
 */
import type { Html } from "@effect/ui/html";
import { Badge } from "@/components/ui/badge.ts";
import { Button } from "@/components/ui/button.ts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.ts";

const INVOICE_ITEMS = [
  { item: "Design System License", qty: 1, unitPrice: 499 },
  { item: "Priority Support", qty: 12, unitPrice: 99 },
  { item: "Custom Components", qty: 3, unitPrice: 250 },
] as const;

const subtotal = INVOICE_ITEMS.reduce((sum, row) => sum + row.qty * row.unitPrice, 0);
const tax = 0;
const totalDue = subtotal + tax;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export const Invoice = <Msg>(h: Html.H<Msg>) =>
  Card(h).children(
    CardHeader(h).children(
      CardTitle(h).children("Invoice #INV-2847"),
      CardDescription(h).children("Due March 30, 2026"),
      CardAction(h).children(Badge(h, { variant: "secondary" }).children("Pending")),
    ),
    CardContent(h).children(
      Table(h, {
        children: [
          TableHeader(h).children(
            TableRow(h).children(
              TableHead(h).children("Item"),
              TableHead(h, { class: "text-right" }).children("Qty"),
              TableHead(h, { class: "text-right" }).children("Rate"),
              TableHead(h, { class: "text-right" }).children("Amount"),
            ),
          ),
          TableBody(h).children(
            INVOICE_ITEMS.map((row) =>
              TableRow(h)
                .key(row.item)
                .children(
                  TableCell(h).children(row.item),
                  TableCell(h, { class: "text-right tabular-nums" }).children(String(row.qty)),
                  TableCell(h, { class: "text-right tabular-nums" }).children(
                    formatCurrency(row.unitPrice),
                  ),
                  TableCell(h, { class: "text-right tabular-nums" }).children(
                    formatCurrency(row.qty * row.unitPrice),
                  ),
                ),
            ),
            TableRow(h).children(
              TableCell(h, { class: "text-right" }).attr("colspan", "3").children("Subtotal"),
              TableCell(h, { class: "text-right tabular-nums" }).children(formatCurrency(subtotal)),
            ),
            TableRow(h).children(
              TableCell(h, { class: "text-right" }).attr("colspan", "3").children("Tax"),
              TableCell(h, { class: "text-right tabular-nums" }).children("$0.00"),
            ),
            TableRow(h).children(
              TableCell(h, { class: "text-right" }).attr("colspan", "3").children("Total Due"),
              TableCell(h, { class: "text-right tabular-nums" }).children(formatCurrency(totalDue)),
            ),
          ),
        ],
      }),
    ),
    CardFooter(h).children(
      Button(h, { variant: "outline", size: "sm" }).children("Download PDF"),
      Button(h, { size: "sm", class: "ml-auto" }).children("Pay Now"),
    ),
  );
