/**
 * AppSidebar — shadcn/ui block `sidebar-02`
 * (`registry/new-york-v4/blocks/sidebar-02/components/app-sidebar.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source;
 * the sample data below is upstream's, verbatim.
 *
 * Upstream: a React function spreading `React.ComponentProps<typeof
 * Sidebar>` onto `Sidebar`, with one Radix `Collapsible` (all
 * `defaultOpen`) per nav parent. Here: a view function taking the
 * `SidebarProvider` parts, the caller's `h`, and the same options as an
 * options object; each collapsible group is the `NavCollapsibleGroup`
 * component below — the kit Collapsible is controlled, so the open
 * state lives in that component's Model (initialised open, upstream's
 * `defaultOpen`).
 *
 * Declared divergences (anything else is a bug):
 *
 * - `Sidebar` types its children as a single `View.Content`; the kit
 *   flattens child arrays at runtime, so the upstream sibling list is
 *   passed as one array, cast once at the call.
 * - Upstream's group trigger is a `SidebarGroupLabel` (`<div>`) merged
 *   into the Radix trigger via `asChild`. The kit's trigger part is
 *   button-typed, so the trigger here is a `<button>` carrying the
 *   label's classes (the sidebar port's `SIDEBAR_GROUP_LABEL_CLASS` +
 *   upstream's label `className`) and its `data-sidebar` attribute.
 * - Upstream's menu buttons wrap an `<a href>` via `asChild`; the
 *   sidebar port's `SidebarMenuButton` is always a `<button>` (the
 *   port's D-2), so titles render as the button's text and the sample
 *   `url`s stay in the data, unused.
 */
import type * as Component from "@effect/ui/Component";
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import type * as View from "@effect/ui/View";
import * as Schema from "effect/Schema";
import { ChevronRightIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.ts";
import {
  SIDEBAR_GROUP_LABEL_CLASS,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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

export const NavCollapsibleGroupProps = Schema.Struct({
  title: Schema.String,
  items: Schema.Array(
    Schema.Struct({
      title: Schema.String,
      url: Schema.String,
      isActive: Schema.optional(Schema.Boolean),
    }),
  ),
});

export const NavCollapsibleGroupMessage = UiSchema.TaggedEnum({
  Toggled: { open: Schema.Boolean },
});

export const NavCollapsibleGroup = Html.component({
  name: "NavCollapsibleGroup",
  props: NavCollapsibleGroupProps,
  model: Schema.Struct({ open: Schema.Boolean }),
  message: NavCollapsibleGroupMessage,
}).make({
  init: () => ({ open: true }),
  update: {
    Toggled: ($, { open }) => $.evolve({ open }),
  },
  view: (h, model) =>
    Collapsible(h, {
      props: { open: model.open },
      onEmit: {
        Toggled: ({ open }) => NavCollapsibleGroupMessage.Toggled({ open }),
        Settled: () => undefined,
      },
      view: (collapsible) =>
        collapsible
          .root(h.div)
          .class("group/collapsible")
          .attr("title", h.props.title)
          .children(
            SidebarGroup(h).children(
              CollapsibleTrigger(
                collapsible,
                h.button
                  .attr("data-sidebar", "group-label")
                  .class(
                    cn(
                      SIDEBAR_GROUP_LABEL_CLASS,
                      "group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    ),
                  ),
              ).children(
                `${h.props.title} `,
                ChevronRightIcon(h, {
                  class:
                    "ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90",
                }),
              ),
              CollapsibleContent(collapsible, h.div)?.children(
                SidebarGroupContent(h).children(
                  SidebarMenu(h).children(
                    h.props.items.map((item) =>
                      SidebarMenuItem(h).children(
                        SidebarMenuButton(h, { isActive: item.isActive }).children(item.title),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
    }),
});

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
    SidebarContent(h, { class: "gap-0" }).children(
      // We create a collapsible SidebarGroup for each parent.
      data.navMain.map((item) =>
        NavCollapsibleGroup(h, {
          key: item.title,
          props: { title: item.title, items: item.items },
        }),
      ),
    ),
    SidebarRail(sidebar, h),
  ] as unknown as View.Content<Msg, Component.Shared.Of<typeof SidebarProvider>>);
