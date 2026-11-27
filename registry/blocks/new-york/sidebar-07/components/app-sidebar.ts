/**
 * AppSidebar — shadcn/ui block `sidebar-07`
 * (`registry/new-york-v4/blocks/sidebar-07/components/app-sidebar.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source;
 * the sample data below is upstream's, verbatim except that `logo` /
 * `icon` component references become lucide icon names (component
 * references cannot be Schema props; each consumer file maps the names
 * back to builders).
 *
 * Upstream: a React function rendering `<Sidebar collapsible="icon"
 * {...props}>`. Here: a view function taking the `SidebarProvider`
 * parts, the caller's `h`, and the same options as an options object;
 * `collapsible: "icon"` is the default, still overridable.
 *
 * Declared divergence: `Sidebar` types its children as a single
 * `View.Content`; the kit flattens child arrays at runtime, so the
 * upstream sibling list is passed as one array, cast once at the call.
 */
import type * as Component from "@effect/ui/Component";
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarRail,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { NavMain } from "./nav-main.ts";
import { NavProjects } from "./nav-projects.ts";
import { NavUser } from "./nav-user.ts";
import { TeamSwitcher } from "./team-switcher.ts";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: "gallery-vertical-end",
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: "audio-waveform",
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: "command",
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: "square-terminal",
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: "bot",
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: "book-open",
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: "settings-2",
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: "frame",
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: "pie-chart",
    },
    {
      name: "Travel",
      url: "#",
      icon: "map",
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
    // Upstream renders `<Sidebar collapsible="icon" {...props}>`: the
    // icon collapsible is the default, still overridable by the caller.
    { ...options, collapsible: options.collapsible ?? "icon" },
    [
      SidebarHeader(h).children(TeamSwitcher(h, { props: { teams: data.teams } })),
      SidebarContent(h).children(
        NavMain(h, { props: { items: data.navMain } }),
        NavProjects(h, { props: { projects: data.projects } }),
      ),
      SidebarFooter(h).children(NavUser(h, { props: { user: data.user } })),
      SidebarRail(sidebar, h),
    ] as unknown as View.Content<Msg, Component.Shared.Of<typeof SidebarProvider>>,
  );
