/**
 * SidebarLeft (sidebar-15 block) — upstream
 * `registry/bases/radix/blocks/sidebar-15/components/sidebar-left.tsx`
 * ported to Effect UI. A view function: the provider's parts come first
 * (both of this block's sidebars take the same parts — upstream renders
 * them inside one provider), then the caller's `h`. The sample data is
 * upstream's, verbatim, as a module constant; data fields that held
 * icon JSX hold icon *builder* references instead (called at render).
 *
 * Declared divergences:
 * - Upstream spreads `React.ComponentProps<typeof Sidebar>` onto the
 *   Sidebar; the Page passes none, and here only the rendered options
 *   are taken (the Sidebar call's own defaults: side left, variant
 *   sidebar, collapsible offcanvas) plus upstream's literal
 *   `className="border-r-0"`.
 * - Icons lucide-react does not ship here: the glyphs below are LOCAL
 *   builders over the shared `icon()` helper, nodes copied verbatim
 *   from lucide's SVGs (ISC): terminal, audio-lines, sparkles, house
 *   (upstream's `HomeIcon` — lucide renamed the glyph Home → House),
 *   inbox, settings-2, blocks, trash-2, message-circle-question.
 */
import type * as Html from "@effect/ui/html/Html";
import { CalendarIcon, SearchIcon, icon, type IconOptions } from "@/lib/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { NavFavorites } from "./nav-favorites.ts";
import { NavMain } from "./nav-main.ts";
import { NavSecondary } from "./nav-secondary.ts";
import { NavWorkspaces } from "./nav-workspaces.ts";
import { TeamSwitcher } from "./team-switcher.ts";

/** Lucide `terminal` (ISC). */
const TerminalIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["polyline", { points: "4 17 10 11 4 5" }],
      ["line", { x1: "12", x2: "20", y1: "19", y2: "19" }],
    ],
    options,
  );

/** Lucide `audio-lines` (ISC). */
const AudioLinesIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M2 10v3" }],
      ["path", { d: "M6 6v11" }],
      ["path", { d: "M10 3v18" }],
      ["path", { d: "M14 8v7" }],
      ["path", { d: "M18 5v13" }],
      ["path", { d: "M22 10v3" }],
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

/** Lucide `house` (ISC) — upstream's `HomeIcon` (lucide renamed Home → House). */
const HomeIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }],
      [
        "path",
        {
          d: "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
        },
      ],
    ],
    options,
  );

/** Lucide `inbox` (ISC). */
const InboxIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12" }],
      [
        "path",
        {
          d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
        },
      ],
    ],
    options,
  );

/** Lucide `settings-2` (ISC). */
const Settings2Icon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M20 7h-9" }],
      ["path", { d: "M14 17H5" }],
      ["circle", { cx: "17", cy: "17", r: "3" }],
      ["circle", { cx: "7", cy: "7", r: "3" }],
    ],
    options,
  );

/** Lucide `blocks` (ISC). */
const BlocksIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1" }],
      [
        "path",
        {
          d: "M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3",
        },
      ],
    ],
    options,
  );

/** Lucide `trash-2` (ISC). */
const Trash2Icon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M3 6h18" }],
      ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }],
      ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }],
      ["line", { x1: "10", x2: "10", y1: "11", y2: "17" }],
      ["line", { x1: "14", x2: "14", y1: "11", y2: "17" }],
    ],
    options,
  );

/** Lucide `message-circle-question` (ISC). */
const MessageCircleQuestionIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z" }],
      ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }],
      ["path", { d: "M12 17h.01" }],
    ],
    options,
  );

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: TerminalIcon,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioLinesIcon,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: TerminalIcon,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
    {
      title: "Ask AI",
      url: "#",
      icon: SparklesIcon,
    },
    {
      title: "Home",
      url: "#",
      icon: HomeIcon,
      isActive: true,
    },
    {
      title: "Inbox",
      url: "#",
      icon: InboxIcon,
      badge: "10",
    },
  ],
  navSecondary: [
    {
      title: "Calendar",
      url: "#",
      icon: CalendarIcon,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2Icon,
    },
    {
      title: "Templates",
      url: "#",
      icon: BlocksIcon,
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash2Icon,
    },
    {
      title: "Help",
      url: "#",
      icon: MessageCircleQuestionIcon,
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

export const SidebarLeft = <Msg>(sidebar: SidebarProviderParts, h: Html.H<Msg>) =>
  Sidebar(sidebar, h, { class: "border-r-0" }, [
    SidebarHeader(h).children(
      TeamSwitcher(sidebar, h, { teams: data.teams }),
      NavMain(sidebar, h, { items: data.navMain }),
    ),
    SidebarContent(h).children(
      NavFavorites(sidebar, h, { favorites: data.favorites }),
      NavWorkspaces(sidebar, h, { workspaces: data.workspaces }),
      NavSecondary(sidebar, h, { items: data.navSecondary, class: "mt-auto" }),
    ),
    SidebarRail(sidebar, h),
  ]);
