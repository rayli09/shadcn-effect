/**
 * AppSidebar — shadcn/ui block `sidebar-06`
 * (`registry/new-york-v4/blocks/sidebar-06/components/app-sidebar.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source;
 * the sample data below is upstream's, verbatim.
 *
 * Upstream: a React function spreading `React.ComponentProps<typeof
 * Sidebar>` onto `Sidebar`. Here: a view function taking the
 * `SidebarProvider` parts, the caller's `h`, and the same options as an
 * options object.
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
 * Local icon builder: `GalleryVerticalEndIcon` is not in `@/lib/icons`;
 * it is defined in this file from the lucide-react 1.69 path data (ISC)
 * via the lib's `icon()` helper.
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
  SidebarRail,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { NavMain } from "./nav-main.ts";
import { SidebarOptInForm } from "./sidebar-opt-in-form.ts";

/** Lucide `gallery-vertical-end` (ISC). */
export const GalleryVerticalEndIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M7 2h10" }],
      ["path", { d: "M5 6h14" }],
      ["rect", { width: "18", height: "12", x: "3", y: "10", rx: "2" }],
    ],
    options,
  );

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
      SidebarMenu(h).children(
        SidebarMenuItem(h).children(
          SidebarMenuButton(h, { size: "lg" }).children(
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
    SidebarContent(h).children(NavMain(h, { props: { items: data.navMain } })),
    SidebarFooter(h).children(h.div.class("p-1").children(SidebarOptInForm(h, {}))),
    SidebarRail(sidebar, h),
  ] as unknown as View.Content<Msg, Component.Shared.Of<typeof SidebarProvider>>);
