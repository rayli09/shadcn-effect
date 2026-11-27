/**
 * NavUser — shadcn/ui block `sidebar-07`
 * (`registry/new-york-v4/blocks/sidebar-07/components/nav-user.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a React component reading `isMobile` from `useSidebar()`,
 * rendering a Radix `DropdownMenu` around the user button. Here: an
 * `Html.component` — the dropdown's open state lives in the Model (the
 * kit Menu is controlled), and the component `reads` the
 * `SidebarProvider` (the port's replacement for the context hook) for
 * `isMobile`. Menu picks just close the menu; upstream's items are
 * inert links/buttons with no handlers.
 *
 * Local icon builders: `BadgeCheckIcon`, `BellIcon`, `CreditCardIcon`,
 * `LogOutIcon`, `SparklesIcon` and `ChevronsUpDownIcon` are not in
 * `@/lib/icons`; they are defined in this file from the lucide-react
 * 1.69 path data (ISC) via the lib's `icon()` helper.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import type * as View from "@effect/ui/View";
import * as Schema from "effect/Schema";
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
  SidebarProvider,
} from "@/components/ui/sidebar.ts";

/** Lucide `badge-check` (ISC). */
export const BadgeCheckIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",
        },
      ],
      ["path", { d: "m16 9-5.5 5.5L8 12" }],
    ],
    options,
  );

/** Lucide `bell` (ISC). */
export const BellIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
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

/** Lucide `credit-card` (ISC). */
export const CreditCardIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "20", height: "14", x: "2", y: "5", rx: "2" }],
      ["line", { x1: "2", x2: "22", y1: "10", y2: "10" }],
      ["path", { d: "M6 14h2" }],
    ],
    options,
  );

/** Lucide `log-out` (ISC). */
export const LogOutIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m16 17 5-5-5-5" }],
      ["path", { d: "M21 12H9" }],
      ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }],
    ],
    options,
  );

/** Lucide `sparkles` (ISC). */
export const SparklesIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
        },
      ],
      ["path", { d: "M20 2v4" }],
      ["path", { d: "M22 4h-4" }],
      ["circle", { cx: "4", cy: "20", r: "2" }],
    ],
    options,
  );

/** Lucide `chevrons-up-down` (ISC). */
export const ChevronsUpDownIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m7 15 5 5 5-5" }],
      ["path", { d: "m7 9 5-5 5 5" }],
    ],
    options,
  );

export const NavUserProps = Schema.Struct({
  user: Schema.Struct({ name: Schema.String, email: Schema.String, avatar: Schema.String }),
});

export const NavUserMessage = UiSchema.TaggedEnum({
  MenuOpened: {},
  MenuClosed: {},
});

const userAvatar = <Msg>(h: Html.H<Msg>, user: { name: string; avatar: string }) =>
  Avatar(h, {
    props: { src: user.avatar },
    class: "h-8 w-8 rounded-lg",
    fallbackClass: "rounded-lg",
    view: (avatar) =>
      avatar
        .root(h.span)
        .children(
          avatar.image(h.img)?.attr("alt", user.name),
          avatar.fallback(h.span)?.children("CN"),
        ),
  });

export const NavUser = Html.component({
  name: "NavUser",
  props: NavUserProps,
  model: Schema.Struct({ open: Schema.Boolean }),
  message: NavUserMessage,
  reads: { sidebar: SidebarProvider },
}).make({
  init: () => ({ open: false }),
  update: {
    MenuOpened: ($) => $.evolve({ open: true }),
    MenuClosed: ($) => $.evolve({ open: false }),
  },
  view: (h, model) => {
    const user = h.props.user;
    const isMobile = h.reads.sidebar.isMobile;
    return SidebarMenu(h).children(
      SidebarMenuItem(h).children(
        DropdownMenu(h, {
          props: {
            open: model.open,
            items: [
              { value: "upgrade", label: "Upgrade to Pro" },
              { value: "account", label: "Account" },
              { value: "billing", label: "Billing" },
              { value: "notifications", label: "Notifications" },
              { value: "log-out", label: "Log out" },
            ],
            side: isMobile ? "bottom" : "right",
            align: "end",
            sideOffset: 4,
          },
          onEmit: {
            RequestedOpen: () => NavUserMessage.MenuOpened(),
            RequestedClose: () => NavUserMessage.MenuClosed(),
            Picked: () => NavUserMessage.MenuClosed(),
            Highlighted: () => undefined,
            RequestedQuery: () => undefined,
            Settled: () => undefined,
          },
          view: (menu) =>
            h.div.children(
              DropdownMenuTrigger(menu, h, {
                element: SidebarMenuButton(h, {
                  size: "lg",
                  class:
                    "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                }),
              }).children(
                userAvatar(h, user),
                h.div
                  .class("grid flex-1 text-left text-sm leading-tight")
                  .children(
                    h.span.class("truncate font-medium").children(user.name),
                    h.span.class("truncate text-xs").children(user.email),
                  ),
                ChevronsUpDownIcon(h, { class: "ml-auto size-4" }),
              ),
              DropdownMenuContent(menu, h, {
                class: "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg",
              }).children(
                DropdownMenuLabel(menu, h, { class: "p-0 font-normal" }).children(
                  h.div
                    .class("flex items-center gap-2 px-1 py-1.5 text-left text-sm")
                    .children(
                      userAvatar(h, user),
                      h.div
                        .class("grid flex-1 text-left text-sm leading-tight")
                        .children(
                          h.span.class("truncate font-medium").children(user.name),
                          h.span.class("truncate text-xs").children(user.email),
                        ),
                    ),
                ),
                DropdownMenuSeparator(menu, h),
                DropdownMenuGroup(
                  menu,
                  h,
                  { group: "pro" },
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
                ] as unknown as View.Content<typeof NavUserMessage.Type>),
                DropdownMenuSeparator(menu, h),
                DropdownMenuItem(menu, h, { value: "log-out" }).children(LogOutIcon(h), "Log out"),
              ),
            ),
        }),
      ),
    );
  },
});
