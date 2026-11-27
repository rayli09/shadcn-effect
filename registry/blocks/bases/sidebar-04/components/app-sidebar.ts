/**
 * AppSidebar — from the upstream bases block `sidebar-04`
 * (`registry/bases/radix/blocks/sidebar-04/components/app-sidebar.tsx`),
 * ported 1:1 to Effect UI. Class strings and the sample data are
 * verbatim from the source.
 *
 * This repo's Sidebar is not context-based: the function takes the
 * `SidebarProvider`'s parts as its first argument (upstream read them
 * from context), then the caller's `h`. Upstream's
 * `React.ComponentProps<typeof Sidebar>` spread is not reproduced
 * (the sidebar port's rule 6); upstream's own `variant="floating"`
 * becomes the `variant` option. Upstream renders no `SidebarRail` in
 * this block, and neither does this port.
 *
 * Declared divergence — `SidebarMenuButton asChild` around an <a>
 * (D-2): the port's `SidebarMenuButton` always renders a <button>, so
 * the anchor rows are drawn by `SidebarMenuLink` below, which stacks
 * the menu button's variants and `data-*` stamps on an `h.a` — exactly
 * the stamps `SidebarMenuButton` itself writes, on the anchor upstream
 * rendered. (`SidebarMenuSubButton` needs no such helper: the port's
 * is already an <a> and takes `href` directly.) Upstream's
 * `item.items?.length ? … : null` conditional is the same conditional
 * here, with `undefined` for the null branch.
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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  sidebarMenuButtonVariants,
  type SidebarMenuButtonSize,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { icon } from "@/lib/icons";

/** Lucide `gallery-vertical-end` (ISC) — file-local builder (D-7); node data verbatim from lucide's SVG. */
const GalleryVerticalEndIcon = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  icon(
    h,
    [
      ["path", { d: "M7 2h10" }],
      ["path", { d: "M5 6h14" }],
      ["rect", { width: "18", height: "12", x: "3", y: "10", rx: "2" }],
    ],
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

export const AppSidebar = <Msg>(sidebar: SidebarProviderParts, h: Html.H<Msg>) =>
  Sidebar(sidebar, h, { variant: "floating" }, [
    SidebarHeader(h).children(
      SidebarMenu(h).children(
        SidebarMenuItem(h).children(
          SidebarMenuLink(
            h,
            { href: "#", size: "lg" },
            h.div
              .class(
                "flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground",
              )
              .children(GalleryVerticalEndIcon(h, { class: "size-4" })),
            h.div
              .class("flex flex-col gap-0.5 leading-none")
              .children(
                h.span.class("font-medium").children("Documentation"),
                h.span.children("v1.0.0"),
              ),
          ),
        ),
      ),
    ),
    SidebarContent(h).children(
      SidebarGroup(h).children(
        SidebarMenu(h, { class: "gap-2" }).children(
          data.navMain.map((item) =>
            SidebarMenuItem(h).children(
              SidebarMenuLink(h, { href: item.url, class: "font-medium" }, item.title),
              item.items.length
                ? SidebarMenuSub(h, { class: "ml-0 border-l-0 px-1.5" }).children(
                    item.items.map((item) =>
                      SidebarMenuSubItem(h).children(
                        SidebarMenuSubButton(h, {
                          href: item.url,
                          isActive: item.isActive,
                        }).children(item.title),
                      ),
                    ),
                  )
                : undefined,
            ),
          ),
        ),
      ),
    ),
  ]);
