/**
 * AppSidebar — shadcn/ui block `dashboard-01`
 * (`registry/new-york-v4/blocks/dashboard-01/components/app-sidebar.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source;
 * the sample data below is upstream's, verbatim except that Tabler
 * component references become Tabler icon names (component references
 * cannot be Schema props; each consumer file maps the names back to
 * builders). Upstream's `navClouds` data is defined but never rendered
 * by the source component — it is kept, unused, as upstream has it.
 *
 * Upstream: a React function rendering `<Sidebar collapsible="offcanvas"
 * {...props}>`. Here: a view function taking the `SidebarProvider`
 * parts, the caller's `h`, and the same options as an options object;
 * `collapsible: "offcanvas"` is the default, still overridable.
 *
 * Declared divergences (anything else is a bug):
 *
 * - The header `SidebarMenuButton` is `asChild` upstream (an `<a href="#">`
 *   wrapping the logo icon and the "Acme Inc." label). There is no Slot
 *   here (D-2) and the sidebar port's menu button is always a `<button>`,
 *   so the row draws as a button with the same classes and children.
 * - `Sidebar` types its children as a single `View.Content`; the kit
 *   flattens child arrays at runtime, so the upstream sibling list is
 *   passed as one array, cast once at the call.
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
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { NavDocuments } from "./nav-documents.ts";
import { NavMain } from "./nav-main.ts";
import { NavSecondary } from "./nav-secondary.ts";
import { NavUser } from "./nav-user.ts";

/** Tabler `inner-shadow-top` (MIT). */
export const InnerShadowTopIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M5.636 5.636a9 9 0 1 0 12.728 12.728a9 9 0 0 0 -12.728 -12.728z" }],
      ["path", { d: "M16.243 7.757a6 6 0 0 0 -8.486 0" }],
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
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: "dashboard",
    },
    {
      title: "Lifecycle",
      url: "#",
      icon: "list-details",
    },
    {
      title: "Analytics",
      url: "#",
      icon: "chart-bar",
    },
    {
      title: "Projects",
      url: "#",
      icon: "folder",
    },
    {
      title: "Team",
      url: "#",
      icon: "users",
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: "camera",
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: "file-description",
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: "file-ai",
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: "settings",
    },
    {
      title: "Get Help",
      url: "#",
      icon: "help",
    },
    {
      title: "Search",
      url: "#",
      icon: "search",
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: "database",
    },
    {
      name: "Reports",
      url: "#",
      icon: "report",
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: "file-word",
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
  Sidebar(
    sidebar,
    h,
    // Upstream renders `<Sidebar collapsible="offcanvas" {...props}>`:
    // the offcanvas collapsible is the default, still overridable.
    { ...options, collapsible: options.collapsible ?? "offcanvas" },
    [
      SidebarHeader(h).children(
        SidebarMenu(h).children(
          SidebarMenuItem(h).children(
            SidebarMenuButton(h, { class: "data-[slot=sidebar-menu-button]:p-1.5!" }).children(
              InnerShadowTopIcon(h, { class: "size-5!" }),
              h.span.class("text-base font-semibold").children("Acme Inc."),
            ),
          ),
        ),
      ),
      SidebarContent(h).children(
        NavMain(h, { props: { items: data.navMain } }),
        NavDocuments(h, { props: { items: data.documents } }),
        NavSecondary(h, { props: { items: data.navSecondary }, class: "mt-auto" }),
      ),
      SidebarFooter(h).children(NavUser(h, { props: { user: data.user } })),
    ] as unknown as View.Content<Msg, Component.Shared.Of<typeof SidebarProvider>>,
  );
