/**
 * AppSidebar — shadcn/ui block `sidebar-14`
 * (`registry/new-york-v4/blocks/sidebar-14/components/app-sidebar.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source;
 * the sample data below is upstream's, verbatim.
 *
 * Upstream: a React function spreading `React.ComponentProps<typeof
 * Sidebar>` onto `Sidebar`. Here: a view function taking the
 * `SidebarProvider` parts, the caller's `h`, and the same options as an
 * options object.
 *
 * Declared divergences (anything else is a bug):
 * - D-2: upstream's top-level items are `SidebarMenuButton asChild`
 *   anchors; the port's button is always a `<button>`, so the `url`
 *   stays in the data only and the anchor's `font-medium` class moves
 *   onto the button. The sub items keep real anchors:
 *   `SidebarMenuSubButton` renders an `<a>` and takes the `href`.
 * - `Sidebar` types its children as a single `View.Content`; the kit
 *   flattens child arrays at runtime, so the upstream sibling list is
 *   passed as one array, cast once at the call.
 */
import type * as Component from "@effect/ui/Component";
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Installation",
          url: "#",
        },
        {
          title: "Project Structure",
          url: "#",
        },
      ],
    },
    {
      title: "Build Your Application",
      url: "#",
      items: [
        {
          title: "Routing",
          url: "#",
        },
        {
          title: "Data Fetching",
          url: "#",
          isActive: true,
        },
        {
          title: "Rendering",
          url: "#",
        },
        {
          title: "Caching",
          url: "#",
        },
        {
          title: "Styling",
          url: "#",
        },
        {
          title: "Optimizing",
          url: "#",
        },
        {
          title: "Configuring",
          url: "#",
        },
        {
          title: "Testing",
          url: "#",
        },
        {
          title: "Authentication",
          url: "#",
        },
        {
          title: "Deploying",
          url: "#",
        },
        {
          title: "Upgrading",
          url: "#",
        },
        {
          title: "Examples",
          url: "#",
        },
      ],
    },
    {
      title: "API Reference",
      url: "#",
      items: [
        {
          title: "Components",
          url: "#",
        },
        {
          title: "File Conventions",
          url: "#",
        },
        {
          title: "Functions",
          url: "#",
        },
        {
          title: "next.config.js Options",
          url: "#",
        },
        {
          title: "CLI",
          url: "#",
        },
        {
          title: "Edge Runtime",
          url: "#",
        },
      ],
    },
    {
      title: "Architecture",
      url: "#",
      items: [
        {
          title: "Accessibility",
          url: "#",
        },
        {
          title: "Fast Refresh",
          url: "#",
        },
        {
          title: "Next.js Compiler",
          url: "#",
        },
        {
          title: "Supported Browsers",
          url: "#",
        },
        {
          title: "Turbopack",
          url: "#",
        },
      ],
    },
    {
      title: "Community",
      url: "#",
      items: [
        {
          title: "Contribution Guide",
          url: "#",
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
  Sidebar(sidebar, h, options, [
    SidebarContent(h).children(
      SidebarGroup(h).children(
        SidebarGroupLabel(h).children("Table of Contents"),
        SidebarGroupContent(h).children(
          SidebarMenu(h).children(
            data.navMain.map((item) =>
              SidebarMenuItem(h).children(
                SidebarMenuButton(h, { class: "font-medium" }).children(item.title),
                item.items?.length
                  ? SidebarMenuSub(h).children(
                      item.items.map((subItem) =>
                        SidebarMenuSubItem(h).children(
                          SidebarMenuSubButton(h, {
                            isActive: "isActive" in subItem && subItem.isActive === true,
                            href: subItem.url,
                          }).children(subItem.title),
                        ),
                      ),
                    )
                  : null,
              ),
            ),
          ),
        ),
      ),
    ),
    SidebarRail(sidebar, h),
  ] as unknown as View.Content<Msg, Component.Shared.Of<typeof SidebarProvider>>);
