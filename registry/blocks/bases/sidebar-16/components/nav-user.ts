/**
 * NavUser (sidebar-16 block) — upstream
 * `registry/bases/radix/blocks/sidebar-16/components/nav-user.tsx` ported
 * to Effect UI. A view function: the provider's parts come first (the
 * `useSidebar()` replacement — `isMobile` is read from them), then the
 * caller's `h`, then the data.
 *
 * Declared divergences:
 * - The kit Menu's open state is the consumer's (it lives in a Model);
 *   this block is an example composition whose host Page owns no menu
 *   state, so the menu is drawn at upstream's initial state (`open:
 *   false`) and its events are no-ops. Wire `open` / `onEmit` to a Model
 *   in a real app.
 * - Upstream's `AvatarImage` / `AvatarFallback` are the kit Avatar's
 *   `image` / `fallback` parts inside its view closure (see the avatar
 *   port's header).
 * - Icons lucide-react does not ship here: the glyphs below are LOCAL
 *   builders over the shared `icon()` helper, nodes copied verbatim from
 *   lucide's SVGs (ISC): chevrons-up-down, sparkles, badge-check,
 *   credit-card, bell, log-out.
 */
import type * as Html from "@effect/ui/html/Html";
import { icon, type IconOptions } from "@/lib/icons";
import { Avatar } from "@/components/ui/avatar.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.ts";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";

/** Lucide `chevrons-up-down` (ISC). */
const ChevronsUpDownIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m7 15 5 5 5-5" }],
      ["path", { d: "m7 9 5-5 5 5" }],
    ],
    options,
  );

/** Lucide `sparkles` (ISC). */
const SparklesIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
        },
      ],
      ["path", { d: "M20 3v4" }],
      ["path", { d: "M22 5h-4" }],
      ["path", { d: "M4 17v2" }],
      ["path", { d: "M5 18H3" }],
    ],
    options,
  );

/** Lucide `badge-check` (ISC). */
const BadgeCheckIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",
        },
      ],
      ["path", { d: "m9 12 2 2 4-4" }],
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

/** Lucide `log-out` (ISC). */
const LogOutIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }],
      ["polyline", { points: "16 17 21 12 16 7" }],
      ["line", { x1: "21", x2: "9", y1: "12", y2: "12" }],
    ],
    options,
  );

export interface NavUserData {
  readonly name: string;
  readonly email: string;
  readonly avatar: string;
}

const userChip = <Msg>(h: Html.H<Msg>, user: NavUserData) => [
  Avatar(h, {
    props: { src: user.avatar },
    class: "h-8 w-8 rounded-lg",
    fallbackClass: "rounded-lg",
    view: (avatar) =>
      avatar
        .root(h.span)
        .children(
          avatar.image(h.img.attr("alt", user.name)),
          avatar.fallback(h.span)?.children("CN"),
        ),
  }),
  h.div
    .class("grid flex-1 text-left text-sm leading-tight")
    .children(
      h.span.class("truncate font-medium").children(user.name),
      h.span.class("truncate text-xs").children(user.email),
    ),
];

export const NavUser = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: { readonly user: NavUserData },
) => {
  const { user } = options;
  return SidebarMenu(h).children(
    SidebarMenuItem(h).children(
      DropdownMenu(h, {
        props: {
          open: false,
          items: [
            { value: "upgrade", label: "Upgrade to Pro" },
            { value: "account", label: "Account" },
            { value: "billing", label: "Billing" },
            { value: "notifications", label: "Notifications" },
            { value: "log-out", label: "Log out" },
          ],
          side: sidebar.isMobile ? "bottom" : "right",
          align: "end",
          sideOffset: 4,
        },
        onEmit: {
          RequestedOpen: () => undefined,
          RequestedClose: () => undefined,
          Picked: () => undefined,
          Highlighted: () => undefined,
          RequestedQuery: () => undefined,
          Settled: () => undefined,
        },
        view: (menu) =>
          h.div(
            DropdownMenuTrigger(menu, h, {
              element: SidebarMenuButton(h, {
                size: "lg",
                class:
                  "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
              }),
            }).children(...userChip(h, user), ChevronsUpDownIcon(h, { class: "ml-auto size-4" })),
            DropdownMenuContent(menu, h, {
              class: "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg",
            }).children(
              DropdownMenuLabel(menu, h, { class: "p-0 font-normal" }).children(
                h.div
                  .class("flex items-center gap-2 px-1 py-1.5 text-left text-sm")
                  .children(...userChip(h, user)),
              ),
              DropdownMenuSeparator(menu, h),
              DropdownMenuGroup(
                menu,
                h,
                { group: "upgrade" },
                DropdownMenuItem(menu, h, { value: "upgrade" }).children(
                  SparklesIcon(h),
                  "Upgrade to Pro",
                ),
              ),
              DropdownMenuSeparator(menu, h),
              DropdownMenuGroup(menu, h, { group: "account" }, [
                DropdownMenuItem(menu, h, { value: "account" }).children(
                  BadgeCheckIcon(h),
                  "Account",
                ),
                DropdownMenuItem(menu, h, { value: "billing" }).children(
                  CreditCardIcon(h),
                  "Billing",
                ),
                DropdownMenuItem(menu, h, { value: "notifications" }).children(
                  BellIcon(h),
                  "Notifications",
                ),
              ]),
              DropdownMenuSeparator(menu, h),
              DropdownMenuItem(menu, h, { value: "log-out" }).children(LogOutIcon(h), "Log out"),
            ),
          ),
      }),
    ),
  );
};
