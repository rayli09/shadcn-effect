/**
 * AppSidebar — shadcn/ui block `sidebar-10`
 * (`registry/new-york-v4/blocks/sidebar-10/components/app-sidebar.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source;
 * the sample data below is upstream's, verbatim except that `logo` /
 * `icon` component references become lucide icon names (component
 * references cannot be Schema props; each consumer file maps the names
 * back to builders).
 *
 * Upstream: a React function rendering `<Sidebar className="border-r-0"
 * {...props}>`. Here: a view function taking the `SidebarProvider`
 * parts, the caller's `h`, and the same options as an options object;
 * the `border-r-0` class is the default, still overridable.
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
  SidebarHeader,
  SidebarProvider,
  SidebarRail,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { NavFavorites } from "./nav-favorites.ts";
import { NavMain } from "./nav-main.ts";
import { NavSecondary } from "./nav-secondary.ts";
import { NavWorkspaces } from "./nav-workspaces.ts";
import { TeamSwitcher } from "./team-switcher.ts";

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: "command",
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
      title: "Search",
      url: "#",
      icon: "search",
    },
    {
      title: "Ask AI",
      url: "#",
      icon: "sparkles",
    },
    {
      title: "Home",
      url: "#",
      icon: "home",
      isActive: true,
    },
    {
      title: "Inbox",
      url: "#",
      icon: "inbox",
      badge: "10",
    },
  ],
  navSecondary: [
    {
      title: "Calendar",
      url: "#",
      icon: "calendar",
    },
    {
      title: "Settings",
      url: "#",
      icon: "settings-2",
    },
    {
      title: "Templates",
      url: "#",
      icon: "blocks",
    },
    {
      title: "Trash",
      url: "#",
      icon: "trash-2",
    },
    {
      title: "Help",
      url: "#",
      icon: "message-circle-question",
    },
  ],
  favorites: [
    {
      name: "Project Management & Task Tracking",
      url: "#",
      emoji: "📊",
    },
    {
      name: "Family Recipe Collection & Meal Planning",
      url: "#",
      emoji: "🍳",
    },
    {
      name: "Fitness Tracker & Workout Routines",
      url: "#",
      emoji: "💪",
    },
    {
      name: "Book Notes & Reading List",
      url: "#",
      emoji: "📚",
    },
    {
      name: "Sustainable Gardening Tips & Plant Care",
      url: "#",
      emoji: "🌱",
    },
    {
      name: "Language Learning Progress & Resources",
      url: "#",
      emoji: "🗣️",
    },
    {
      name: "Home Renovation Ideas & Budget Tracker",
      url: "#",
      emoji: "🏠",
    },
    {
      name: "Personal Finance & Investment Portfolio",
      url: "#",
      emoji: "💰",
    },
    {
      name: "Movie & TV Show Watchlist with Reviews",
      url: "#",
      emoji: "🎬",
    },
    {
      name: "Daily Habit Tracker & Goal Setting",
      url: "#",
      emoji: "✅",
    },
  ],
  workspaces: [
    {
      name: "Personal Life Management",
      emoji: "🏠",
      pages: [
        {
          name: "Daily Journal & Reflection",
          url: "#",
          emoji: "📔",
        },
        {
          name: "Health & Wellness Tracker",
          url: "#",
          emoji: "🍏",
        },
        {
          name: "Personal Growth & Learning Goals",
          url: "#",
          emoji: "🌟",
        },
      ],
    },
    {
      name: "Professional Development",
      emoji: "💼",
      pages: [
        {
          name: "Career Objectives & Milestones",
          url: "#",
          emoji: "🎯",
        },
        {
          name: "Skill Acquisition & Training Log",
          url: "#",
          emoji: "🧠",
        },
        {
          name: "Networking Contacts & Events",
          url: "#",
          emoji: "🤝",
        },
      ],
    },
    {
      name: "Creative Projects",
      emoji: "🎨",
      pages: [
        {
          name: "Writing Ideas & Story Outlines",
          url: "#",
          emoji: "✍️",
        },
        {
          name: "Art & Design Portfolio",
          url: "#",
          emoji: "🖼️",
        },
        {
          name: "Music Composition & Practice Log",
          url: "#",
          emoji: "🎵",
        },
      ],
    },
    {
      name: "Home Management",
      emoji: "🏡",
      pages: [
        {
          name: "Household Budget & Expense Tracking",
          url: "#",
          emoji: "💰",
        },
        {
          name: "Home Maintenance Schedule & Tasks",
          url: "#",
          emoji: "🔧",
        },
        {
          name: "Family Calendar & Event Planning",
          url: "#",
          emoji: "📅",
        },
      ],
    },
    {
      name: "Travel & Adventure",
      emoji: "🧳",
      pages: [
        {
          name: "Trip Planning & Itineraries",
          url: "#",
          emoji: "🗺️",
        },
        {
          name: "Travel Bucket List & Inspiration",
          url: "#",
          emoji: "🌎",
        },
        {
          name: "Travel Journal & Photo Gallery",
          url: "#",
          emoji: "📸",
        },
      ],
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
    // Upstream renders `<Sidebar className="border-r-0" {...props}>`:
    // the class is the default, still overridable by the caller.
    { ...options, class: options.class ?? "border-r-0" },
    [
      SidebarHeader(h).children(
        TeamSwitcher(h, { props: { teams: data.teams } }),
        NavMain(h, { items: data.navMain }),
      ),
      SidebarContent(h).children(
        NavFavorites(h, { props: { favorites: data.favorites } }),
        NavWorkspaces(h, { workspaces: data.workspaces }),
        NavSecondary(h, { items: data.navSecondary, class: "mt-auto" }),
      ),
      SidebarRail(sidebar, h),
    ] as unknown as View.Content<Msg, Component.Shared.Of<typeof SidebarProvider>>,
  );
