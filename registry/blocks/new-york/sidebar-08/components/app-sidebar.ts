/**
 * AppSidebar — shadcn/ui block `sidebar-08`
 * (`registry/new-york-v4/blocks/sidebar-08/components/app-sidebar.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source;
 * the sample data below is upstream's, verbatim except that `icon`
 * component references become lucide icon names (component references
 * cannot be Schema props; each consumer file maps the names back to
 * builders).
 *
 * Upstream: a React function rendering `<Sidebar variant="inset"
 * {...props}>` (no rail). Here: a view function taking the
 * `SidebarProvider` parts, the caller's `h`, and the same options as an
 * options object; `variant: "inset"` is the default, still overridable.
 *
 * Declared divergences (anything else is a bug):
 *
 * - `Sidebar` types its children as a single `View.Content`; the kit
 *   flattens child arrays at runtime, so the upstream sibling list is
 *   passed as one array, cast once at the call.
 * - Upstream's logo button wraps an `<a href="#">` via `asChild`; the
 *   sidebar port's `SidebarMenuButton` is always a `<button>` (the
 *   port's D-2), so its content renders directly in the button.
 *
 * Local icon builder: `CommandIcon` is not in `@/lib/icons`; it is
 * defined in this file from the lucide-react 1.69 path data (ISC) via
 * the lib's `icon()` helper.
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
import { NavMain } from "./nav-main.ts";
import { NavProjects } from "./nav-projects.ts";
import { NavSecondary } from "./nav-secondary.ts";
import { NavUser } from "./nav-user.ts";

/** Lucide `command` (ISC). */
export const CommandIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [["path", { d: "M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" }]],
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
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: "life-buoy",
    },
    {
      title: "Feedback",
      url: "#",
      icon: "send",
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
    // Upstream renders `<Sidebar variant="inset" {...props}>`: the
    // inset variant is the default, still overridable by the caller.
    { ...options, variant: options.variant ?? "inset" },
    [
      SidebarHeader(h).children(
        SidebarMenu(h).children(
          SidebarMenuItem(h).children(
            SidebarMenuButton(h, { size: "lg" }).children(
              h.div
                .class(
                  "flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground",
                )
                .children(CommandIcon(h, { class: "size-4" })),
              h.div
                .class("grid flex-1 text-left text-sm leading-tight")
                .children(
                  h.span.class("truncate font-medium").children("Acme Inc"),
                  h.span.class("truncate text-xs").children("Enterprise"),
                ),
            ),
          ),
        ),
      ),
      SidebarContent(h).children(
        NavMain(h, { props: { items: data.navMain } }),
        NavProjects(h, { props: { projects: data.projects } }),
        NavSecondary(h, { items: data.navSecondary, class: "mt-auto" }),
      ),
      SidebarFooter(h).children(NavUser(h, { props: { user: data.user } })),
    ] as unknown as View.Content<Msg, Component.Shared.Of<typeof SidebarProvider>>,
  );
