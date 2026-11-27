/**
 * NavUser — from the upstream bases block `dashboard-01`
 * (`registry/bases/radix/blocks/dashboard-01/components/nav-user.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Pairs with the `base-*` ui items (see site-header.ts's header).
 *
 * A view function: the provider's parts come first (the
 * `useSidebar()` replacement — `isMobile` is read from them), then
 * the caller's `h`, then the data.
 *
 * Declared divergences:
 *
 * - The kit Menu's open state is the consumer's (it lives in a
 *   Model); this block is an example composition whose host Page
 *   owns no menu state, so the menu is drawn at upstream's initial
 *   state (`open: false`) and its events are no-ops. Wire `open` /
 *   `onEmit` to a Model in a real app.
 * - Upstream's `DropdownMenuTrigger asChild` (D-2): the trigger is
 *   the port's `SidebarMenuButton` builder stacked as the Menu
 *   trigger's `element` — the documented composition in the
 *   dropdown-menu port. Content `side` / `align` / `sideOffset` are
 *   Positioning props on the kit Menu call, not on the content part.
 * - Upstream's `AvatarImage` / `AvatarFallback` are the kit Avatar's
 *   `image` / `fallback` parts inside its view closure (see the
 *   avatar port's header). The trigger's avatar carries upstream's
 *   `grayscale`; the label's does not, as in the source.
 * - Icons: the glyphs below are LOCAL builders over the shared
 *   `icon()` helper, nodes copied verbatim from lucide's SVGs (ISC):
 *   ellipsis-vertical, circle-user-round, credit-card, bell, log-out.
 *   Upstream's `IconPlaceholder` names them; `EllipsisVerticalIcon`
 *   replaces the sidebar-07 block's chevrons-up-down because this
 *   block's source names it.
 */
import type * as Html from "@effect/ui/html/Html";
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
import { icon, type IconOptions } from "@/lib/icons";

/** Lucide `ellipsis-vertical` (ISC). */
const EllipsisVerticalIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "12", cy: "12", r: "1" }],
      ["circle", { cx: "12", cy: "5", r: "1" }],
      ["circle", { cx: "12", cy: "19", r: "1" }],
    ],
    options,
  );

/** Lucide `circle-user-round` (ISC). */
const CircleUserRoundIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M17.925 20.056a6 6 0 0 0-11.851.001" }],
      ["circle", { cx: "12", cy: "11", r: "4" }],
      ["circle", { cx: "12", cy: "12", r: "10" }],
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

const userChip = <Msg>(h: Html.H<Msg>, user: NavUserData, grayscale: boolean) => [
  Avatar(h, {
    props: { src: user.avatar },
    class: grayscale ? "h-8 w-8 rounded-lg grayscale" : "h-8 w-8 rounded-lg",
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
      h.span.class("truncate text-xs text-muted-foreground").children(user.email),
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
            }).children(
              ...userChip(h, user, true),
              EllipsisVerticalIcon(h, { class: "ml-auto size-4" }),
            ),
            DropdownMenuContent(menu, h, {
              class: "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg",
            }).children(
              DropdownMenuLabel(menu, h, { class: "p-0 font-normal" }).children(
                h.div
                  .class("flex items-center gap-2 px-1 py-1.5 text-left text-sm")
                  .children(...userChip(h, user, false)),
              ),
              DropdownMenuSeparator(menu, h),
              DropdownMenuGroup(menu, h, { group: "account" }, [
                DropdownMenuItem(menu, h, { value: "account" }).children(
                  CircleUserRoundIcon(h),
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
