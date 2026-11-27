/**
 * AppSidebar — shadcn/ui block `sidebar-12`
 * (`registry/new-york-v4/blocks/sidebar-12/components/app-sidebar.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source;
 * the sample data below is upstream's, verbatim.
 *
 * Upstream: a React function spreading `React.ComponentProps<typeof
 * Sidebar>` onto `Sidebar`. Here: a view function taking the
 * `SidebarProvider` parts, the caller's `h`, and the same options as an
 * options object.
 *
 * Declared divergence: `Sidebar` types its children as a single
 * `View.Content`; the kit flattens child arrays at runtime, so the
 * upstream sibling list is passed as one array, cast once at the call.
 *
 * Local icon builder: `PlusIcon` is not in `@/lib/icons`; it is defined
 * in this file from the lucide-react 1.69 path data (ISC) via the lib's
 * `icon()` helper.
 */
import type * as Component from "@effect/ui/Component";
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import { icon, type IconOptions } from "@/lib/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { Calendars } from "./calendars.ts";
import { DatePicker } from "./date-picker.ts";
import { NavUser } from "./nav-user.ts";

/** Lucide `plus` (ISC). */
export const PlusIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
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

export const AppSidebar = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: {
    readonly side?: "left" | "right" | undefined;
    readonly variant?: "sidebar" | "floating" | "inset" | undefined;
    readonly collapsible?: "offcanvas" | "icon" | "none" | undefined;
    readonly class?: string | undefined;
  } = {},
): View.Content<Msg, Component.Shared.Of<typeof SidebarProvider>> =>
  Sidebar(sidebar, h, options, [
    SidebarHeader(h, { class: "h-16 border-b border-sidebar-border" }).children(
      NavUser(h, { props: { user: data.user } }),
    ),
    SidebarContent(h).children(
      DatePicker(h, {}),
      SidebarSeparator(h, { class: "mx-0" }),
      Calendars(h, { calendars: data.calendars }),
    ),
    SidebarFooter(h).children(
      SidebarMenu(h).children(
        SidebarMenuItem(h).children(
          SidebarMenuButton(h).children(PlusIcon(h), h.span.children("New Calendar")),
        ),
      ),
    ),
    SidebarRail(sidebar, h),
  ] as unknown as View.Content<Msg, Component.Shared.Of<typeof SidebarProvider>>);
