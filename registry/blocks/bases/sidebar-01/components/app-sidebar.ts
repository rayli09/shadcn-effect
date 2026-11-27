/**
 * AppSidebar — from the upstream bases block `sidebar-01`
 * (`registry/bases/radix/blocks/sidebar-01/components/app-sidebar.tsx`),
 * ported 1:1 to Effect UI. Class strings and the sample data are
 * verbatim from the source.
 *
 * This repo's Sidebar is not context-based: the function takes the
 * `SidebarProvider`'s parts as its first argument (upstream read them
 * from context), then the caller's `h`. Upstream's
 * `React.ComponentProps<typeof Sidebar>` spread is not reproduced
 * (the sidebar port's rule 6) — the sidebar renders with its defaults.
 *
 * Declared divergence — `SidebarMenuButton asChild` around an <a>
 * (D-2): the port's `SidebarMenuButton` always renders a <button>, so
 * the anchor rows are drawn by `SidebarMenuLink` below, which stacks
 * the menu button's variants and `data-*` stamps on an `h.a` — exactly
 * the stamps `SidebarMenuButton` itself writes, on the anchor upstream
 * rendered.
 * - The Sidebar's children (header / content / rail) are passed as one
 *   array: the runtime flattens builder children, but the sidebar
 *   port's `children: View.Content` signature is narrower than that,
 *   so `bun run check` reports the array argument — a known
 *   port-signature limitation, shared by every bases sidebar block.
 */
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
  SidebarMenuItem,
  SidebarRail,
  sidebarMenuButtonVariants,
  type SidebarMenuButtonSize,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { SearchForm } from "./search-form.ts";
import { VersionSwitcher } from "./version-switcher.ts";

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
  ...children: View.Children<Msg>
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

// This is sample data.
const data: {
  readonly versions: ReadonlyArray<string>;
  readonly navMain: ReadonlyArray<{
    readonly title: string;
    readonly url: string;
    readonly items: ReadonlyArray<{
      readonly title: string;
      readonly url: string;
      readonly isActive?: boolean;
    }>;
  }>;
} = {
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

export const AppSidebar = <Msg>(sidebar: SidebarProviderParts, h: Html.H<Msg>) =>
  Sidebar(sidebar, h, {}, [
    SidebarHeader(h).children(
      VersionSwitcher(h, {
        props: { versions: data.versions, defaultVersion: data.versions[0]! },
      }),
      SearchForm(h, {}),
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
                  SidebarMenuLink(h, { href: item.url, isActive: item.isActive }, item.title),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
    SidebarRail(sidebar, h),
  ]);
