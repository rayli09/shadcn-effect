/**
 * SidebarRight (sidebar-15 block) — upstream
 * `registry/bases/radix/blocks/sidebar-15/components/sidebar-right.tsx`
 * ported to Effect UI. A view function: the provider's parts come first
 * (both of this block's sidebars take the same parts — upstream renders
 * them inside one provider; this one is drawn with `side: "right"`),
 * then the caller's `h`. The sample data is upstream's, verbatim, as a
 * module constant.
 *
 * Declared divergences:
 * - Upstream spreads `React.ComponentProps<typeof Sidebar>` onto the
 *   Sidebar; the Page passes none, and here only upstream's literal
 *   options are taken (`collapsible="none"` plus its class string).
 * - Icons: `PlusIcon` below is a LOCAL builder over the shared `icon()`
 *   helper, nodes copied verbatim from lucide's `plus` SVG (ISC).
 */
import type * as Html from "@effect/ui/html/Html";
import { icon, type IconOptions } from "@/lib/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { Calendars } from "./calendars.ts";
import { DatePicker } from "./date-picker.ts";
import { NavUser } from "./nav-user.ts";

/** Lucide `plus` (ISC). */
const PlusIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M5 12h14" }],
      ["path", { d: "M12 5v14" }],
    ],
    options,
  );

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  calendars: [
    {
      name: "My Calendars",
      items: ["Personal", "Work", "Family"],
    },
    {
      name: "Favorites",
      items: ["Holidays", "Birthdays"],
    },
    {
      name: "Other",
      items: ["Travel", "Reminders", "Deadlines"],
    },
  ],
};

export const SidebarRight = <Msg>(sidebar: SidebarProviderParts, h: Html.H<Msg>) =>
  Sidebar(
    sidebar,
    h,
    {
      side: "right",
      collapsible: "none",
      class: "sticky top-0 hidden h-svh border-l lg:flex",
    },
    [
      SidebarHeader(h, { class: "h-16 border-b border-sidebar-border" }).children(
        NavUser(sidebar, h, { user: data.user }),
      ),
      SidebarContent(h).children(
        DatePicker(sidebar, h),
        SidebarSeparator(h, { class: "mx-0" }),
        Calendars(sidebar, h, { calendars: data.calendars }),
      ),
      SidebarFooter(h).children(
        SidebarMenu(h).children(
          SidebarMenuItem(h).children(
            SidebarMenuButton(h).children(PlusIcon(h), h.span.children("New Calendar")),
          ),
        ),
      ),
    ],
  );
