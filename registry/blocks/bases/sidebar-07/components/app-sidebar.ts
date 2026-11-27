/**
 * AppSidebar — from the upstream bases block `sidebar-07`
 * (`registry/bases/radix/blocks/sidebar-07/components/app-sidebar.tsx`),
 * ported 1:1 to Effect UI. Class strings and the sample data are
 * verbatim from the source.
 *
 * This repo's Sidebar is not context-based: the function takes the
 * `SidebarProvider`'s parts as its first argument (upstream read them
 * from context), then the caller's `h`. Upstream's
 * `React.ComponentProps<typeof Sidebar>` spread is not reproduced
 * (the sidebar port's rule 6) — the sidebar renders with upstream's
 * own `collapsible="icon"`.
 *
 * Upstream data holding an icon as JSX becomes data holding the icon
 * *builder* reference (`logo: GalleryVerticalEndIcon`,
 * `icon: FrameIcon`), called at render (`item.icon(h)`).
 *
 * Icons: every glyph in the sample data is a LOCAL builder over the
 * shared `icon()` helper, nodes copied verbatim from lucide's SVGs
 * (ISC): gallery-vertical-end, audio-lines, terminal,
 * square-terminal (upstream's `TerminalSquareIcon`), bot, book-open,
 * settings-2, frame, chart-pie (upstream's `PieChartIcon`), map.
 */
import type * as Html from "@effect/ui/html/Html";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { icon, type IconOptions } from "@/lib/icons";
import { NavMain } from "./nav-main.ts";
import { NavProjects } from "./nav-projects.ts";
import { NavUser } from "./nav-user.ts";
import { TeamSwitcher } from "./team-switcher.ts";

// ---------------------------------------------------------------------------
// Icons — file-local builders (D-7) for glyphs `@/lib/icons` does not hoist
// yet; node data copied verbatim from lucide's SVGs (ISC).
// ---------------------------------------------------------------------------

/** Lucide `gallery-vertical-end` (ISC). */
const GalleryVerticalEndIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M7 2h10" }],
      ["path", { d: "M5 6h14" }],
      ["rect", { width: "18", height: "12", x: "3", y: "10", rx: "2" }],
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

/** Lucide `square-terminal` (ISC) — upstream's `TerminalSquareIcon`. */
const SquareTerminalIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m7 11 2-2-2-2" }],
      ["path", { d: "M11 13h4" }],
      ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }],
    ],
    options,
  );

/** Lucide `bot` (ISC). */
const BotIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 8V4H8" }],
      ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2" }],
      ["path", { d: "M2 14h2" }],
      ["path", { d: "M20 14h2" }],
      ["path", { d: "M15 13v2" }],
      ["path", { d: "M9 13v2" }],
    ],
    options,
  );

/** Lucide `book-open` (ISC). */
const BookOpenIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 7v14" }],
      [
        "path",
        {
          d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
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

/** Lucide `frame` (ISC). */
const FrameIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["line", { x1: "22", x2: "2", y1: "6", y2: "6" }],
      ["line", { x1: "22", x2: "2", y1: "18", y2: "18" }],
      ["line", { x1: "6", x2: "6", y1: "2", y2: "22" }],
      ["line", { x1: "18", x2: "18", y1: "2", y2: "22" }],
    ],
    options,
  );

/** Lucide `chart-pie` (ISC) — upstream's `PieChartIcon`. */
const PieChartIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z",
        },
      ],
      ["path", { d: "M21.21 15.89A10 10 0 1 1 8 2.83" }],
    ],
    options,
  );

/** Lucide `map` (ISC). */
const MapIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",
        },
      ],
      ["path", { d: "M15 5.764v15" }],
      ["path", { d: "M9 3.236v15" }],
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
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEndIcon,
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
      title: "Playground",
      url: "#",
      icon: SquareTerminalIcon,
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
      icon: BotIcon,
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
      icon: BookOpenIcon,
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
      icon: Settings2Icon,
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
      icon: FrameIcon,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChartIcon,
    },
    {
      name: "Travel",
      url: "#",
      icon: MapIcon,
    },
  ],
};

export const AppSidebar = <Msg>(sidebar: SidebarProviderParts, h: Html.H<Msg>) =>
  Sidebar(sidebar, h, { collapsible: "icon" }, [
    SidebarHeader(h).children(TeamSwitcher(h, { props: { teams: data.teams } })),
    SidebarContent(h).children(
      NavMain(sidebar, h, { items: data.navMain }),
      NavProjects(sidebar, h, { projects: data.projects }),
    ),
    SidebarFooter(h).children(NavUser(sidebar, h, { user: data.user })),
    SidebarRail(sidebar, h),
  ]);
