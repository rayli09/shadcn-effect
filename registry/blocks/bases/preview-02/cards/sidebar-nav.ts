/**
 * SidebarNav — shadcn/ui block `preview-02` (cards/sidebar-nav.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a two-column grid of
 * Cards, each holding a `SidebarProvider` + a non-collapsible `Sidebar`
 * with two labelled menu groups divided by a `SidebarSeparator`
 * (Overview/Planning on the left, Account/Support on the right; one
 * `isActive` item per card). Here: a named view function that draws the
 * port's `SidebarProvider` headless Component inside each Card — the
 * sidebar port's replacement for upstream's context provider — and maps
 * the groups from the verbatim data tables below (same DOM).
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `IconPlaceholder` (a create-app component that swaps icon
 *   libraries) is ported as its lucide rendering only: file-local
 *   builders below, node data copied verbatim from lucide's SVGs.
 *   Upstream's `FileBarChartIcon` is lucide's `file-chart-column` glyph
 *   under its current name, and `PieChartIcon` is `chart-pie`,
 *   `CircleHelpIcon` is `circle-help`.
 * - Upstream's `className="min-h-0"` on `SidebarProvider` lands on the
 *   provider's wrapper part here.
 * - The sidebar menu buttons take no press handler — upstream's are
 *   plain buttons with no behavior either.
 */
import type { Html } from "@effect/ui/html";
import { Card } from "@/components/ui/card.ts";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar.ts";
import { icon, type IconOptions } from "@/lib/icons";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Icons — file-local builders for glyphs `@/lib/icons` does not hoist;
// node data copied verbatim from lucide's SVGs (ISC).
// ---------------------------------------------------------------------------

/** Lucide `layout-dashboard` (ISC). */
const LayoutDashboardIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1" }],
      ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1" }],
      ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1" }],
      ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1" }],
    ],
    options,
  );

/** Lucide `arrow-left-right` (ISC). */
const ArrowLeftRightIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M8 3 4 7l4 4" }],
      ["path", { d: "M4 7h16" }],
      ["path", { d: "m16 21 4-4-4-4" }],
      ["path", { d: "M20 17H4" }],
    ],
    options,
  );

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

/** Lucide `building-2` (ISC). */
const Building2Icon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10 12h4" }],
      ["path", { d: "M10 8h4" }],
      ["path", { d: "M14 21v-3a2 2 0 0 0-4 0v3" }],
      ["path", { d: "M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" }],
      ["path", { d: "M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" }],
    ],
    options,
  );

/** Lucide `chart-pie` (ISC). */
const ChartPieIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z",
        },
      ],
      ["path", { d: "M21.21 15.89A10 10 0 1 1 8 2.83" }],
    ],
    options,
  );

/** Lucide `target` (ISC). */
const TargetIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["circle", { cx: "12", cy: "12", r: "6" }],
      ["circle", { cx: "12", cy: "12", r: "2" }],
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

/** Lucide `file-chart-column` (ISC; upstream's FileBarChartIcon). */
const FileBarChartIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
        },
      ],
      ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5" }],
      ["path", { d: "M8 18v-1" }],
      ["path", { d: "M12 18v-6" }],
      ["path", { d: "M16 18v-3" }],
    ],
    options,
  );

/** Lucide `file-text` (ISC). */
const FileTextIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
        },
      ],
      ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5" }],
      ["path", { d: "M10 9H8" }],
      ["path", { d: "M16 13H8" }],
      ["path", { d: "M16 17H8" }],
    ],
    options,
  );

/** Lucide `user` (ISC). */
const UserIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }],
      ["circle", { cx: "12", cy: "7", r: "4" }],
    ],
    options,
  );

/** Lucide `credit-card` (ISC). */
const CreditCardIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "20", height: "14", x: "2", y: "5", rx: "2" }],
      ["line", { x1: "2", x2: "22", y1: "10", y2: "10" }],
      ["path", { d: "M6 14h2" }],
    ],
    options,
  );

/** Lucide `bell` (ISC). */
const BellIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0" }],
      [
        "path",
        {
          d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
        },
      ],
    ],
    options,
  );

/** Lucide `shield` (ISC). */
const ShieldIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
        },
      ],
    ],
    options,
  );

/** Lucide `paintbrush` (ISC). */
const PaintbrushIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m14.622 17.897-10.68-2.913" }],
      [
        "path",
        {
          d: "M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z",
        },
      ],
      [
        "path",
        {
          d: "M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15",
        },
      ],
    ],
    options,
  );

/** Lucide `circle-help` (ISC). */
const CircleHelpIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["path", { d: "M9 9.5a3 2.5 0 016 0c0 2-2 2-3 3.5" }],
      ["path", { d: "M12 17h.01" }],
    ],
    options,
  );

/** Lucide `message-square` (ISC). */
const MessageSquareIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
        },
      ],
    ],
    options,
  );

/** Lucide `book-open` (ISC). */
const BookOpenIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 5v16" }],
      [
        "path",
        {
          d: "M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z",
        },
      ],
    ],
    options,
  );

/** Lucide `activity` (ISC). */
const ActivityIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
        },
      ],
    ],
    options,
  );

// ---------------------------------------------------------------------------
// Data — verbatim from upstream's literal groups.
// ---------------------------------------------------------------------------

type NavIcon = <Msg>(h: Html.H<Msg>, options?: IconOptions) => unknown;

interface NavItem {
  readonly icon: NavIcon;
  readonly label: string;
  readonly active?: boolean;
}

interface NavGroup {
  readonly label: string;
  readonly groupClass: string;
  readonly items: ReadonlyArray<NavItem>;
}

const LEFT_GROUPS: ReadonlyArray<NavGroup> = [
  {
    label: "Overview",
    groupClass: "pb-1",
    items: [
      { icon: LayoutDashboardIcon, label: "Dashboard", active: true },
      { icon: ArrowLeftRightIcon, label: "Transactions" },
      { icon: TrendingUpIcon, label: "Investments" },
      { icon: Building2Icon, label: "Accounts" },
      { icon: ChartPieIcon, label: "Spending" },
    ],
  },
  {
    label: "Planning",
    groupClass: "pt-1",
    items: [
      { icon: TargetIcon, label: "Goals" },
      { icon: WalletIcon, label: "Budget" },
      { icon: FileBarChartIcon, label: "Reports" },
      { icon: FileTextIcon, label: "Documents" },
    ],
  },
];

const RIGHT_GROUPS: ReadonlyArray<NavGroup> = [
  {
    label: "Account",
    groupClass: "pb-1",
    items: [
      { icon: UserIcon, label: "Profile" },
      { icon: CreditCardIcon, label: "Billing", active: true },
      { icon: BellIcon, label: "Notifications" },
      { icon: ShieldIcon, label: "Security" },
      { icon: PaintbrushIcon, label: "Appearance" },
    ],
  },
  {
    label: "Support",
    groupClass: "pt-1",
    items: [
      { icon: CircleHelpIcon, label: "Help Center" },
      { icon: MessageSquareIcon, label: "Contact Us" },
      { icon: BookOpenIcon, label: "Documentation" },
      { icon: ActivityIcon, label: "Status" },
    ],
  },
];

const navCard = <Msg>(h: Html.H<Msg>, groups: ReadonlyArray<NavGroup>) =>
  Card(h, { class: "overflow-hidden py-0" }).children(
    SidebarProvider(h, {
      props: {},
      view: (sidebar) =>
        sidebar
          .wrapper(h.div)
          .class("min-h-0")
          .children(
            Sidebar(sidebar, h, { collapsible: "none", class: "w-full bg-transparent" }, [
              SidebarContent(h, { class: "gap-0" }).children(
                groups.flatMap((group, groupIndex) => [
                  ...(groupIndex > 0 ? [SidebarSeparator(h, { class: "w-auto!" })] : []),
                  SidebarGroup(h, { class: group.groupClass }).children(
                    SidebarGroupLabel(h).children(group.label),
                    SidebarGroupContent(h).children(
                      SidebarMenu(h).children(
                        group.items.map((item) =>
                          SidebarMenuItem(h).children(
                            SidebarMenuButton(h, {
                              isActive: item.active ?? false,
                            }).children(item.icon(h) as never, item.label),
                          ),
                        ),
                      ),
                    ),
                  ),
                ]),
              ),
            ]),
          ),
    }),
  );

export const SidebarNav = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  h.div
    .class(cn("grid grid-cols-2 items-start gap-6", options.class))
    .children(navCard(h, LEFT_GROUPS), navCard(h, RIGHT_GROUPS));
