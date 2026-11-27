/**
 * Payments — shadcn/ui block `preview-02` (cards/payments.tsx), bases
 * generation, ported 1:1 to Effect UI.
 *
 * Upstream: a "use client" React function rendering a Card whose header
 * is a Breadcrumb (Home link, a DropdownMenu behind an ellipsis Button
 * with Profile / Statements / Documents items, and the current
 * "Payments" page) and whose content is an ItemGroup of four muted
 * link Items, each with an icon media, title, description and a
 * trailing chevron. Here it is a Component: Radix owns the menu's open
 * state upstream, but the kit Menu is controlled, so the open flag
 * lives in this Component's Model and the Menu's
 * RequestedOpen / RequestedClose / Picked events arrive as Messages
 * (Picked is a deliberate no-op beyond closing — upstream wires no
 * navigation either). Everything else renders exactly as upstream.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream spreads no extra props; the only prop here is `class`,
 *   appended to the Card's classes.
 * - D-2: upstream's `DropdownMenuTrigger asChild` stacks the trigger
 *   onto the ghost icon Button; here the port's `Button` builder is
 *   passed as the trigger's `element` — the documented composition in
 *   the dropdown-menu port. Upstream's content `align="start"` is a
 *   Positioning prop on the kit Menu call (`align`), not on the
 *   content part; upstream's implicit `sideOffset` default (Radix 4)
 *   is passed explicitly for the same reason.
 * - D-2: upstream's `Item asChild` renders each row as an `<a>` wearing
 *   the Item classes; here each row is an `h.a` wearing `itemVariants`
 *   with the same `data-slot` / `data-variant` / `data-size` stamps
 *   the Item view function writes.
 * - Upstream's `IconPlaceholder` is a create-app component that swaps
 *   icon libraries; only its lucide rendering is ported — the
 *   `MoreHorizontalIcon` (the shared `EllipsisIcon`), `CalendarIcon`
 *   and `ChevronRightIcon` glyphs from the shared `@/lib/icons`
 *   builders, and the `Gauge`, `Repeat` and `RefreshCw` glyphs as the
 *   file-local builders below (lucide path data, ISC, via the shared
 *   `icon()` helper), each wearing the class the JSX gave its
 *   placeholder. The tabler / hugeicons / phosphor / remixicon
 *   alternatives are not ported.
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.ts";
import { Button } from "@/components/ui/button.ts";
import { Card, CardContent, CardHeader } from "@/components/ui/card.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.ts";
import {
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  itemVariants,
} from "@/components/ui/item.ts";
import { CalendarIcon, ChevronRightIcon, EllipsisIcon, icon, type IconOptions } from "@/lib/icons";

/** Lucide `gauge` (ISC). */
const GaugeIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m12 14 4-4" }],
      ["path", { d: "M3.34 19a10 10 0 1 1 17.32 0" }],
    ],
    options,
  );

/** Lucide `repeat` (ISC). */
const RepeatIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m17 2 4 4-4 4" }],
      ["path", { d: "M3 11v-1a4 4 0 0 1 4-4h14" }],
      ["path", { d: "m7 22-4-4 4-4" }],
      ["path", { d: "M21 13v1a4 4 0 0 1-4 4H3" }],
    ],
    options,
  );

/** Lucide `refresh-cw` (ISC). */
const RefreshCwIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }],
      ["path", { d: "M21 3v5h-5" }],
      ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }],
      ["path", { d: "M8 16H3v5" }],
    ],
    options,
  );

const ROWS = [
  {
    key: "transfer-limit",
    title: "Change transfer limit",
    description: "Adjust how much you can send from your balance.",
    glyph: "gauge",
  },
  {
    key: "scheduled",
    title: "Scheduled transfers",
    description: "Set up a transfer to send at a later date.",
    glyph: "calendar",
  },
  {
    key: "direct-debits",
    title: "Direct Debits",
    description: "Set up and manage regular payments.",
    glyph: "repeat",
  },
  {
    key: "recurring",
    title: "Recurring card payments",
    description: "Manage your repeated card transactions.",
    glyph: "refresh-cw",
  },
] as const;

export const PaymentsMessage = UiSchema.TaggedEnum({
  MenuOpened: {},
  MenuClosed: {},
  MenuPicked: { value: Schema.String },
});

export const Payments = Html.component({
  name: "Preview02Payments",
  props: Schema.Struct({ class: Schema.optional(Schema.String) }),
  model: Schema.Struct({ menuOpen: Schema.Boolean }),
  message: PaymentsMessage,
}).make({
  init: () => ({ menuOpen: false }),
  update: {
    MenuOpened: ($) => $.evolve({ menuOpen: true }),
    MenuClosed: ($) => $.evolve({ menuOpen: false }),
    // Placeholder handler, as upstream: picking an item only closes.
    MenuPicked: ($) => $.evolve({ menuOpen: false }),
  },
  view: (h, model) => {
    const glyphFor = (glyph: (typeof ROWS)[number]["glyph"]) =>
      glyph === "gauge"
        ? GaugeIcon(h)
        : glyph === "calendar"
          ? CalendarIcon(h)
          : glyph === "repeat"
            ? RepeatIcon(h)
            : RefreshCwIcon(h);
    return Card(h, { class: h.props.class }).children(
      CardHeader(h, { class: "flex flex-col gap-3" }).children(
        Breadcrumb(h).children(
          BreadcrumbList(h).children(
            BreadcrumbItem(h).children(BreadcrumbLink(h).attr("href", "#").children("Home")),
            BreadcrumbSeparator(h),
            BreadcrumbItem(h).children(
              DropdownMenu(h, {
                props: {
                  open: model.menuOpen,
                  items: [
                    { value: "profile", label: "Profile" },
                    { value: "statements", label: "Statements" },
                    { value: "documents", label: "Documents" },
                  ],
                  align: "start",
                  sideOffset: 4,
                },
                onEmit: {
                  RequestedOpen: () => PaymentsMessage.MenuOpened(),
                  RequestedClose: () => PaymentsMessage.MenuClosed(),
                  Picked: ({ value }) => PaymentsMessage.MenuPicked({ value }),
                  Highlighted: () => undefined,
                  RequestedQuery: () => undefined,
                  Settled: () => undefined,
                },
                view: (menu) =>
                  h.div.children(
                    DropdownMenuTrigger(menu, h, {
                      element: Button(h, { size: "icon-sm", variant: "ghost" }),
                    }).children(
                      EllipsisIcon(h),
                      h.span.class("sr-only").children("Account options"),
                    ),
                    DropdownMenuContent(menu, h).children(
                      DropdownMenuGroup(menu, h, { group: "account" }, [
                        DropdownMenuItem(menu, h, { value: "profile" }).children("Profile"),
                        DropdownMenuItem(menu, h, { value: "statements" }).children("Statements"),
                        DropdownMenuItem(menu, h, { value: "documents" }).children("Documents"),
                      ]),
                    ),
                  ),
              }),
            ),
            BreadcrumbSeparator(h),
            BreadcrumbItem(h).children(BreadcrumbPage(h).children("Payments")),
          ),
        ),
      ),
      CardContent(h).children(
        ItemGroup(h).children(
          ...ROWS.map((row) =>
            h.a
              .attr("data-slot", "item")
              .attr("data-variant", "muted")
              .attr("data-size", "default")
              .attr("href", "#")
              .class(itemVariants({ variant: "muted" }))
              .children(
                ItemMedia(h, { variant: "icon" }).children(glyphFor(row.glyph)),
                ItemContent(h).children(
                  ItemTitle(h).children(row.title),
                  ItemDescription(h).children(row.description),
                ),
                ChevronRightIcon(h, { class: "size-4 shrink-0 text-muted-foreground" }),
              ),
          ),
        ),
      ),
    );
  },
});
