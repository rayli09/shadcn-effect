/**
 * AppSidebar — from the upstream bases block `dashboard-01`
 * (`registry/bases/radix/blocks/dashboard-01/components/app-sidebar.tsx`),
 * ported 1:1 to Effect UI. Class strings and the sample data are
 * verbatim from the source.
 *
 * Pairs with the `base-*` ui items (see site-header.ts's header).
 *
 * This repo's Sidebar is not context-based: the function takes the
 * `SidebarProvider`'s parts as its first argument (upstream read
 * them from context), then the caller's `h`. Upstream's
 * `React.ComponentProps<typeof Sidebar>` spread is not reproduced
 * (the sidebar port's rule) — the page's one real prop, `variant`,
 * is the options argument here, and the sidebar renders with
 * upstream's own `collapsible="offcanvas"`.
 *
 * Upstream data holding an icon as JSX (an `IconPlaceholder`
 * naming the lucide glyph) becomes data holding the icon *builder*
 * reference, called at render (`item.icon(h)`). The source's
 * `navClouds` data is kept verbatim even though this block's
 * `AppSidebar` never renders it — upstream doesn't either.
 *
 * Declared divergences:
 *
 * - `SidebarMenuButton asChild` around the header's <a> (D-2): the
 *   row is drawn by `SidebarMenuLink` below, stacking the menu
 *   button's variants and `data-*` stamps on an `h.a` (the
 *   sidebar-07 nav-projects composition).
 * - Icons: every glyph in the sample data is a LOCAL builder over
 *   the shared `icon()` helper, nodes copied verbatim from lucide's
 *   SVGs (ISC): layout-dashboard, list, chart-bar, folder, users,
 *   camera, file-text, settings-2, circle-help, database,
 *   file-chart-column, file, command. Upstream's `SearchIcon` is
 *   the shared `SearchIcon` in `@/lib/icons`.
 */
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  sidebarMenuButtonVariants,
  type SidebarMenuButtonSize,
  type SidebarProviderParts,
  type SidebarVariant,
} from "@/components/ui/sidebar.ts";
import { icon, SearchIcon, type IconOptions } from "@/lib/icons";
import { NavDocuments } from "./nav-documents.ts";
import { NavMain, type NavMainItem } from "./nav-main.ts";
import { NavSecondary, type NavSecondaryItem } from "./nav-secondary.ts";
import { NavUser } from "./nav-user.ts";

// ---------------------------------------------------------------------------
// Icons — file-local builders (D-7) for glyphs `@/lib/icons` does not hoist
// yet; node data copied verbatim from lucide's SVGs (ISC).
// ---------------------------------------------------------------------------

/** Lucide `layout-dashboard` (ISC). */
const LayoutDashboardIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1" }],
      ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1" }],
      ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1" }],
      ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1" }],
    ],
    options,
  );

/** Lucide `list` (ISC). */
const ListIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M3 5h.01" }],
      ["path", { d: "M3 12h.01" }],
      ["path", { d: "M3 19h.01" }],
      ["path", { d: "M8 5h13" }],
      ["path", { d: "M8 12h13" }],
      ["path", { d: "M8 19h13" }],
    ],
    options,
  );

/** Lucide `chart-bar` (ISC). */
const ChartBarIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16" }],
      ["path", { d: "M7 16h8" }],
      ["path", { d: "M7 11h12" }],
      ["path", { d: "M7 6h3" }],
    ],
    options,
  );

/** Lucide `folder` (ISC). */
const FolderIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
        },
      ],
    ],
    options,
  );

/** Lucide `users` (ISC). */
const UsersIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
      ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744" }],
      ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }],
      ["circle", { cx: "9", cy: "7", r: "4" }],
    ],
    options,
  );

/** Lucide `camera` (ISC). */
const CameraIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",
        },
      ],
      ["circle", { cx: "12", cy: "13", r: "3" }],
    ],
    options,
  );

/** Lucide `file-text` (ISC). */
const FileTextIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
        },
      ],
      ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5" }],
      ["path", { d: "M10 9H8" }],
      ["path", { d: "M16 13H8" }],
      ["path", { d: "M16 17H8" }],
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

/** Lucide `circle-help` (ISC). */
const CircleHelpIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }],
      ["path", { d: "M12 17h.01" }],
    ],
    options,
  );

/** Lucide `database` (ISC). */
const DatabaseIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3" }],
      ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5" }],
      ["path", { d: "M3 12A9 3 0 0 0 21 12" }],
    ],
    options,
  );

/** Lucide `file-chart-column` (ISC). */
const FileChartColumnIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
        },
      ],
      ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5" }],
      ["path", { d: "M8 18v-1" }],
      ["path", { d: "M12 18v-6" }],
      ["path", { d: "M16 18v-3" }],
    ],
    options,
  );

/** Lucide `file` (ISC). */
const FileIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
        },
      ],
      ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5" }],
    ],
    options,
  );

/** Lucide `command` (ISC). */
const CommandIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [["path", { d: "M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" }]],
    options,
  );

/**
 * Upstream's `SidebarMenuButton asChild` row: an <a> wearing the menu
 * button's variants and stamps (see the header). `size` defaults to
 * `"default"`, as upstream's button does.
 */
const SidebarMenuLink = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly href: string;
    readonly isActive?: boolean | undefined;
    readonly size?: SidebarMenuButtonSize | undefined;
    readonly class?: string | undefined;
  },
  ...children: ReadonlyArray<View.Content<Msg>>
) =>
  h.a
    .attr("href", options.href)
    .attrs({
      "data-slot": "sidebar-menu-button",
      "data-sidebar": "menu-button",
      "data-size": options.size ?? "default",
      "data-active": String(options.isActive ?? false),
    })
    .class(sidebarMenuButtonVariants({ size: options.size, class: options.class }))
    .children(...children);

/** An icon builder reference (lucide glyph), called at render with the caller's `h`. */
type AppSidebarIcon = <Msg>(h: Html.H<Msg>, options?: IconOptions) => View.Content<Msg>;

interface NavCloudItem {
  readonly title: string;
  readonly icon: AppSidebarIcon;
  readonly isActive?: boolean | undefined;
  readonly url: string;
  readonly items: ReadonlyArray<{ readonly title: string; readonly url: string }>;
}

// This is sample data (verbatim from the source, `navClouds` included).
const data: {
  readonly user: { readonly name: string; readonly email: string; readonly avatar: string };
  readonly navMain: ReadonlyArray<NavMainItem>;
  readonly navClouds: ReadonlyArray<NavCloudItem>;
  readonly navSecondary: ReadonlyArray<NavSecondaryItem>;
  readonly documents: ReadonlyArray<{
    readonly name: string;
    readonly url: string;
    readonly icon: AppSidebarIcon;
  }>;
} = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Lifecycle",
      url: "#",
      icon: ListIcon,
    },
    {
      title: "Analytics",
      url: "#",
      icon: ChartBarIcon,
    },
    {
      title: "Projects",
      url: "#",
      icon: FolderIcon,
    },
    {
      title: "Team",
      url: "#",
      icon: UsersIcon,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: CameraIcon,
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
      icon: FileTextIcon,
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
      icon: FileTextIcon,
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
      icon: Settings2Icon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: CircleHelpIcon,
    },
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: DatabaseIcon,
    },
    {
      name: "Reports",
      url: "#",
      icon: FileChartColumnIcon,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: FileIcon,
    },
  ],
};

export const AppSidebar = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: { readonly variant?: SidebarVariant | undefined } = {},
) =>
  Sidebar(sidebar, h, { collapsible: "offcanvas", variant: options.variant }, [
    SidebarHeader(h).children(
      SidebarMenu(h).children(
        SidebarMenuItem(h).children(
          SidebarMenuLink(
            h,
            { href: "#", class: "data-[slot=sidebar-menu-button]:p-1.5!" },
            CommandIcon(h, { class: "size-5!" }),
            h.span.class("text-base font-semibold").children("Acme Inc."),
          ),
        ),
      ),
    ),
    SidebarContent(h).children(
      NavMain(sidebar, h, { items: data.navMain }),
      NavDocuments(sidebar, h, { items: data.documents }),
      NavSecondary(sidebar, h, { items: data.navSecondary, class: "mt-auto" }),
    ),
    SidebarFooter(h).children(NavUser(sidebar, h, { user: data.user })),
  ]);
