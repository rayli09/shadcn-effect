/**
 * RecentTransactions — shadcn/ui block `preview-02`
 * (cards/recent-transactions.tsx), bases generation, ported 1:1 to
 * Effect UI.
 *
 * Upstream: a stateless React function rendering a Card with a Table of
 * five transactions; each row carries an icon tile, name/category, date,
 * amount, and a DropdownMenu (View details / Add note / Categorize /
 * Dispute) behind a ghost icon button. Here: a Component — a kit Menu's
 * open state is owned by its consumer, so the Model holds which row's
 * menu is open (`openRow`, or null) and menu events arrive as Messages.
 * Picking an item is a deliberate no-op beyond closing the menu, and the
 * "View All" button is a no-op Message — upstream wires neither.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `IconPlaceholder` (a create-app component that swaps icon
 *   libraries) is ported as its lucide rendering only: file-local
 *   builders for coffee / shopping-cart / wallet / car / tv below, and
 *   the shared `EllipsisIcon` (lucide `ellipsis`, upstream's
 *   MoreHorizontalIcon glyph) from `@/lib/icons`. The class the JSX
 *   gives each placeholder is applied via the builder's options.
 * - Upstream's `DropdownMenuTrigger asChild` (D-2): the trigger is the
 *   port's `Button` builder stacked as the Menu trigger's `element`.
 * - The menu's `align="end"` is a Positioning prop on the kit Menu call
 *   (`align`), not on the content part; upstream's implicit Radix
 *   `sideOffset` default (4) is passed explicitly.
 * - Upstream repeats the five rows and five menus as literal JSX; here
 *   they are mapped from the verbatim data table below (same DOM).
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Button } from "@/components/ui/button.ts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.ts";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table.ts";
import { EllipsisIcon, icon, type IconOptions } from "@/lib/icons";

// ---------------------------------------------------------------------------
// Icons — file-local builders for glyphs `@/lib/icons` does not hoist;
// node data copied verbatim from lucide's SVGs (ISC).
// ---------------------------------------------------------------------------

/** Lucide `coffee` (ISC). */
const CoffeeIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10 2v2" }],
      ["path", { d: "M14 2v2" }],
      [
        "path",
        {
          d: "M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1",
        },
      ],
      ["path", { d: "M6 2v2" }],
    ],
    options,
  );

/** Lucide `shopping-cart` (ISC). */
const ShoppingCartIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18",
        },
      ],
      ["path", { d: "M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25" }],
      ["circle", { cx: "18", cy: "20", r: "2" }],
      ["circle", { cx: "8", cy: "20", r: "2" }],
    ],
    options,
  );

/** Lucide `wallet` (ISC). */
const WalletIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",
        },
      ],
      ["path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" }],
    ],
    options,
  );

/** Lucide `car` (ISC). */
const CarIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2",
        },
      ],
      ["circle", { cx: "7", cy: "17", r: "2" }],
      ["path", { d: "M9 17h6" }],
      ["circle", { cx: "17", cy: "17", r: "2" }],
    ],
    options,
  );

/** Lucide `tv` (ISC). */
const TvIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m17 2-5 5-5-5" }],
      ["rect", { width: "20", height: "15", x: "2", y: "7", rx: "2" }],
    ],
    options,
  );

// ---------------------------------------------------------------------------
// Data — verbatim from upstream's literal rows.
// ---------------------------------------------------------------------------

type TransactionIcon = <Msg>(h: Html.H<Msg>, options?: IconOptions) => unknown;

const TRANSACTIONS: ReadonlyArray<{
  readonly icon: TransactionIcon;
  readonly name: string;
  readonly category: string;
  readonly date: string;
  readonly amount: string;
  readonly amountClass: string;
}> = [
  {
    icon: CoffeeIcon,
    name: "Blue Bottle Coffee",
    category: "Food & Drink",
    date: "Today, 10:24 AM",
    amount: "-$6.50",
    amountClass: "text-sm font-semibold tabular-nums",
  },
  {
    icon: ShoppingCartIcon,
    name: "Whole Foods Market",
    category: "Groceries",
    date: "Yesterday",
    amount: "-$142.30",
    amountClass: "text-sm font-semibold tabular-nums",
  },
  {
    icon: WalletIcon,
    name: "Stripe Payout",
    category: "Income",
    date: "Oct 12",
    amount: "+$4,200.00",
    amountClass: "text-sm font-semibold text-emerald-500 tabular-nums",
  },
  {
    icon: CarIcon,
    name: "Uber Technologies",
    category: "Transport",
    date: "Oct 11",
    amount: "-$24.10",
    amountClass: "text-sm font-semibold tabular-nums",
  },
  {
    icon: TvIcon,
    name: "Netflix Subscription",
    category: "Entertainment",
    date: "Oct 10",
    amount: "-$19.99",
    amountClass: "text-sm font-semibold tabular-nums",
  },
];

const MENU_ITEMS = [
  { value: "view-details", label: "View details" },
  { value: "add-note", label: "Add note" },
  { value: "categorize", label: "Categorize" },
  { value: "dispute", label: "Dispute" },
] as const;

export const RecentTransactionsMessage = UiSchema.TaggedEnum({
  MenuOpened: { row: Schema.Number },
  MenuClosed: { row: Schema.Number },
  MenuPicked: { row: Schema.Number, value: Schema.String },
  PressedViewAll: {},
});

export const RecentTransactions = Html.component({
  name: "Preview02RecentTransactions",
  model: Schema.Struct({ openRow: Schema.NullOr(Schema.Number) }),
  message: RecentTransactionsMessage,
}).make({
  init: () => ({ openRow: null }),
  update: {
    MenuOpened: ($, { row }) => $.evolve({ openRow: row }),
    MenuClosed: ($) => $.evolve({ openRow: null }),
    // Placeholder handler, as upstream: picking only closes the menu.
    MenuPicked: ($) => $.evolve({ openRow: null }),
    PressedViewAll: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h).children(
      CardHeader(h).children(
        CardTitle(h).children("Recent Transactions"),
        CardDescription(h).children("Your latest account activity."),
        CardAction(h).children(
          Button(h, {
            variant: "outline",
            size: "sm",
            onPress: RecentTransactionsMessage.PressedViewAll(),
          }).children("View All"),
        ),
      ),
      CardContent(h).children(
        Table(h, {
          children: TableBody(h).children(
            TRANSACTIONS.map((transaction, row) =>
              TableRow(h).children(
                TableCell(h, { class: "w-10" }).children(
                  h.div
                    .class("flex size-10 items-center justify-center rounded-lg bg-muted")
                    .children(transaction.icon(h, { class: "size-4 shrink-0" }) as never),
                ),
                TableCell(h).children(
                  h.div
                    .class("flex flex-col")
                    .children(
                      h.span.class("font-medium").children(transaction.name),
                      h.span.class("text-sm text-muted-foreground").children(transaction.category),
                    ),
                ),
                TableCell(h, { class: "text-sm text-muted-foreground" }).children(transaction.date),
                TableCell(h, { class: "text-right" }).children(
                  h.span.class(transaction.amountClass).children(transaction.amount),
                ),
                TableCell(h, { class: "w-8" }).children(
                  DropdownMenu(h, {
                    props: {
                      open: model.openRow === row,
                      items: MENU_ITEMS.map((item) => ({ ...item })),
                      align: "end",
                      sideOffset: 4,
                    },
                    onEmit: {
                      RequestedOpen: () => RecentTransactionsMessage.MenuOpened({ row }),
                      RequestedClose: () => RecentTransactionsMessage.MenuClosed({ row }),
                      Picked: ({ value }) => RecentTransactionsMessage.MenuPicked({ row, value }),
                      Highlighted: () => undefined,
                      RequestedQuery: () => undefined,
                      Settled: () => undefined,
                    },
                    view: (menu) =>
                      h.div.children(
                        DropdownMenuTrigger(menu, h, {
                          element: Button(h, { variant: "ghost", size: "icon-sm" }),
                        }).children(EllipsisIcon(h)),
                        DropdownMenuContent(menu, h).children(
                          DropdownMenuItem(menu, h, { value: "view-details" }).children(
                            "View details",
                          ),
                          DropdownMenuItem(menu, h, { value: "add-note" }).children("Add note"),
                          DropdownMenuItem(menu, h, { value: "categorize" }).children("Categorize"),
                          DropdownMenuSeparator(menu, h),
                          DropdownMenuItem(menu, h, { value: "dispute" }).children("Dispute"),
                        ),
                      ),
                  }),
                ),
              ),
            ),
          ),
        }),
      ),
    ),
});
