/**
 * NavMain — shadcn/ui block `sidebar-10`
 * (`registry/new-york-v4/blocks/sidebar-10/components/nav-main.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a stateless React component rendering a plain `SidebarMenu`
 * of anchor buttons. Here: a view function.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's buttons wrap an `<a href>` via `asChild`; the sidebar
 *   port's `SidebarMenuButton` is always a `<button>` (the port's D-2),
 *   so the icon + title render directly in the button and the sample
 *   `url`s stay in the data, unused.
 * - Upstream's item `icon` is a React component reference; component
 *   references cannot travel as data here, so the data carries the
 *   lucide icon name and this file maps names to builders (the local
 *   builders below — `sparkles`, `home` and `inbox` are not in
 *   `@/lib/icons`; they are defined from the lucide-react 1.69 path
 *   data, ISC, via the lib's `icon()` helper. `search` is the lib's
 *   `SearchIcon`.)
 */
import type * as Html from "@effect/ui/html/Html";
import { SearchIcon, icon, type IconOptions } from "@/lib/icons";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar.ts";

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

/** Lucide `home` (ISC; the package's current name for it is `house`). */
export const HomeIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }],
      [
        "path",
        {
          d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
        },
      ],
    ],
    options,
  );

/** Lucide `inbox` (ISC). */
export const InboxIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
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

const navIcons: Readonly<Record<string, typeof SearchIcon>> = {
  search: SearchIcon,
  sparkles: SparklesIcon,
  home: HomeIcon,
  inbox: InboxIcon,
};

export const NavMain = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly items: ReadonlyArray<{
      title: string;
      url: string;
      icon: string;
      isActive?: boolean | undefined;
    }>;
  },
) =>
  SidebarMenu(h).children(
    options.items.map((item) => {
      const Icon = navIcons[item.icon] ?? SearchIcon;
      return SidebarMenuItem(h).children(
        SidebarMenuButton(h, { isActive: item.isActive }).children(
          Icon(h),
          h.span.children(item.title),
        ),
      );
    }),
  );
