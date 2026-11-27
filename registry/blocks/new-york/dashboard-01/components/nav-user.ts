/**
 * NavUser — shadcn/ui block `dashboard-01`
 * (`registry/new-york-v4/blocks/dashboard-01/components/nav-user.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a React component reading `isMobile` from `useSidebar()`,
 * rendering a Radix `DropdownMenu` around the user button. Here: an
 * `Html.component` — the dropdown's open state lives in the Model (the
 * kit Menu is controlled), and the component `reads` the
 * `SidebarProvider` (the port's replacement for the context hook) for
 * `isMobile`. Menu picks just close the menu; upstream's items are
 * inert. Icons are Tabler (`@tabler/icons-react`); the builders below
 * carry the Tabler path data (MIT) via this repo's `icon()` helper.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
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

/** Tabler `dots-vertical` (MIT). */
export const DotsVerticalIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }],
      ["path", { d: "M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }],
      ["path", { d: "M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }],
    ],
    options,
  );

/** Tabler `user-circle` (MIT). */
export const UserCircleIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" }],
      ["path", { d: "M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" }],
      ["path", { d: "M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" }],
    ],
    options,
  );

/** Tabler `credit-card` (MIT). */
export const CreditCardIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z",
        },
      ],
      ["path", { d: "M3 10l18 0" }],
      ["path", { d: "M7 15l.01 0" }],
      ["path", { d: "M11 15l2 0" }],
    ],
    options,
  );

/** Tabler `notification` (MIT). */
export const NotificationIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10 6h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" }],
      ["path", { d: "M17 7m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" }],
    ],
    options,
  );

/** Tabler `logout` (MIT). */
export const LogoutIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" }],
      ["path", { d: "M9 12h12l-3 -3" }],
      ["path", { d: "M18 15l3 -3" }],
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

const userAvatar = <Msg>(
  h: Html.H<Msg>,
  user: { name: string; avatar: string },
  options: { readonly class?: string | undefined } = {},
) =>
  Avatar(h, {
    props: { src: user.avatar },
    class: options.class ?? "h-8 w-8 rounded-lg",
    fallbackClass: "rounded-lg",
    view: (avatar) =>
      avatar
        .root(h.span)
        .children(
          avatar.image(h.img)?.attr("alt", user.name),
          avatar.fallback(h.span)?.children("CN"),
        ),
  });

const userLines = <Msg>(h: Html.H<Msg>, user: { name: string; email: string }) =>
  h.div
    .class("grid flex-1 text-left text-sm leading-tight")
    .children(
      h.span.class("truncate font-medium").children(user.name),
      h.span.class("truncate text-xs text-muted-foreground").children(user.email),
    );

export const NavUser = Html.component({
  name: "Dashboard01NavUser",
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
                userAvatar(h, user, { class: "h-8 w-8 rounded-lg grayscale" }),
                userLines(h, user),
                DotsVerticalIcon(h, { class: "ml-auto size-4" }),
              ),
              DropdownMenuContent(menu, h, {
                class: "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg",
              }).children(
                DropdownMenuLabel(menu, h, { class: "p-0 font-normal" }).children(
                  h.div
                    .class("flex items-center gap-2 px-1 py-1.5 text-left text-sm")
                    .children(userAvatar(h, user), userLines(h, user)),
                ),
                DropdownMenuSeparator(menu, h),
                DropdownMenuGroup(menu, h, { group: "account" }, [
                  DropdownMenuItem(menu, h, { value: "account" }).children(
                    UserCircleIcon(h),
                    "Account",
                  ),
                  DropdownMenuItem(menu, h, { value: "billing" }).children(
                    CreditCardIcon(h),
                    "Billing",
                  ),
                  DropdownMenuItem(menu, h, { value: "notifications" }).children(
                    NotificationIcon(h),
                    "Notifications",
                  ),
                ]),
                DropdownMenuSeparator(menu, h),
                DropdownMenuItem(menu, h, { value: "log-out" }).children(
                  LogoutIcon(h),
                  "Log out",
                ),
              ),
            ),
        }),
      ),
    );
  },
});
