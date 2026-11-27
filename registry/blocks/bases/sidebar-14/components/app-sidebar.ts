/**
 * AppSidebar (sidebar-14 block) — upstream
 * `registry/bases/radix/blocks/sidebar-14/components/app-sidebar.tsx`
 * ported to Effect UI.
 *
 * Pairs with the `base-*` ui items: the imports below say
 * `@/components/ui/<x>` because the bases items install to the same
 * paths as the new-york ones — the class layer inside them is the
 * bases `cn-*` hook layer, styled by a `style-*` preset.
 *
 * A view function: the provider's parts come first (the block-wide
 * replacement for upstream's context), then the caller's `h`, then
 * upstream's `React.ComponentProps<typeof Sidebar>` spread, narrowed
 * to the sidebar port's own options (`side` / `variant` /
 * `collapsible` / `class`).
 *
 * Declared divergences (anything else is a bug):
 *
 * - D-2 `asChild`: upstream's `SidebarMenuButton asChild` renders an
 *   <a href={item.url} className="font-medium">; there is no Slot here
 *   and `SidebarMenuButton` always renders its <button>, so the link
 *   collapses onto the button — the anchor's `font-medium` class
 *   moves to the button and `url` is carried in the data but not
 *   rendered as an href (the same collapse the sidebar port declares
 *   for its own asChild pieces). `SidebarMenuSubButton` needs no
 *   collapse: the port renders an <a> itself, so `href` and
 *   `isActive` map straight across.
 * - `SidebarRail` placement: upstream renders it as a sibling of
 *   `SidebarContent` inside the sidebar. The port's `Sidebar` takes a
 *   single `View.Content` child (no fragment exists), so the rail is
 *   nested as `SidebarContent`'s last child instead of its sibling.
 *   The rail is absolutely positioned against the sidebar container
 *   (the content div is not positioned) and its `group-data-[…]`
 *   selectors key on ancestors either way, so the rendered geometry
 *   is upstream's; only the DOM nesting differs.
 */
import type * as Html from "@effect/ui/html/Html";
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
  SidebarRail,
  type SidebarCollapsible,
  type SidebarProviderParts,
  type SidebarSide,
  type SidebarVariant,
} from "@/components/ui/sidebar.ts";

// This is sample data.
interface NavSubItem {
  readonly title: string;
  readonly url: string;
  readonly isActive?: boolean | undefined;
}

interface NavMainItem {
  readonly title: string;
  readonly url: string;
  readonly items?: ReadonlyArray<NavSubItem> | undefined;
}

const data: { readonly navMain: ReadonlyArray<NavMainItem> } = {
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
    readonly side?: SidebarSide | undefined;
    readonly variant?: SidebarVariant | undefined;
    readonly collapsible?: SidebarCollapsible | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  Sidebar(
    sidebar,
    h,
    options,
    SidebarContent(h).children(
      SidebarGroup(h).children(
        SidebarGroupLabel(h).children("Table of Contents"),
        SidebarGroupContent(h).children(
          SidebarMenu(h).children(
            ...data.navMain.map((item) =>
              SidebarMenuItem(h)
                .key(item.title)
                .children(
                  SidebarMenuButton(h, { class: "font-medium" }).children(item.title),
                  ...(item.items?.length
                    ? [
                        SidebarMenuSub(h).children(
                          ...item.items.map((subItem) =>
                            SidebarMenuSubItem(h)
                              .key(subItem.title)
                              .children(
                                SidebarMenuSubButton(h, {
                                  isActive: subItem.isActive,
                                  href: subItem.url,
                                }).children(subItem.title),
                              ),
                          ),
                        ),
                      ]
                    : []),
                ),
            ),
          ),
        ),
      ),
      // See the header: nested inside SidebarContent (upstream: a
      // sibling of it) because `Sidebar` takes a single child.
      SidebarRail(sidebar, h),
    ),
  );
