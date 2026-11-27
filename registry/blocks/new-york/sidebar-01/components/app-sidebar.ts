/**
 * AppSidebar — shadcn/ui block `sidebar-01`
 * (`registry/new-york-v4/blocks/sidebar-01/components/app-sidebar.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source;
 * the sample data below is upstream's, verbatim.
 *
 * Upstream: a React function spreading `React.ComponentProps<typeof
 * Sidebar>` onto `Sidebar`. Here: a view function taking the
 * `SidebarProvider` parts, the caller's `h`, and the same options
 * (`side` / `variant` / `collapsible` / `class`) as an options object.
 *
 * Declared divergences (anything else is a bug):
 *
 * - `Sidebar` types its children as a single `View.Content`; the kit
 *   flattens child arrays at runtime (see the `@effect/ui` View docs),
 *   so the upstream sibling list (header / content / rail) is passed as
 *   one array, cast once at the call.
 * - Upstream's menu buttons wrap an `<a href>` via `asChild`; the
 *   sidebar port's `SidebarMenuButton` is always a `<button>` (the
 *   port's D-2), so the item titles render as the button's text and the
 *   sample `url`s stay in the data, unused — as they are for every
 *   `"#"` link in the example.
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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { SearchForm } from "./search-form.ts";
import { VersionSwitcher } from "./version-switcher.ts";

// This is sample data.
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
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
    SidebarHeader(h).children(
      VersionSwitcher(h, {
        props: { versions: data.versions, defaultVersion: data.versions[0]! },
      }),
      SearchForm(h, { props: {} }),
    ),
    SidebarContent(h).children(
      // We create a SidebarGroup for each parent.
      data.navMain.map((item) =>
        SidebarGroup(h).children(
          SidebarGroupLabel(h).children(item.title),
          SidebarGroupContent(h).children(
            SidebarMenu(h).children(
              item.items.map((item) =>
                SidebarMenuItem(h).children(
                  SidebarMenuButton(h, { isActive: item.isActive }).children(item.title),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
    SidebarRail(sidebar, h),
  ] as unknown as View.Content<Msg, Component.Shared.Of<typeof SidebarProvider>>);
