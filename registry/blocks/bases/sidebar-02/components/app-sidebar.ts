/**
 * AppSidebar — from the upstream bases block `sidebar-02`
 * (`registry/bases/radix/blocks/sidebar-02/components/app-sidebar.tsx`),
 * ported 1:1 to Effect UI. Class strings and the sample data are
 * verbatim from the source.
 *
 * This repo's Sidebar is not context-based: the function takes the
 * `SidebarProvider`'s parts as its first argument (upstream read them
 * from context), then the caller's `h`. Upstream's
 * `React.ComponentProps<typeof Sidebar>` spread is not reproduced
 * (the sidebar port's rule 6) — the sidebar renders with its defaults.
 *
 * Declared divergences:
 *
 * - Each upstream `Collapsible` group owns its open state internally
 *   (`defaultOpen`); the kit Collapsible's state is the consumer's, so
 *   each group is drawn by the unexported `NavGroup` Component below,
 *   whose Model seeds `open: true` (upstream's `defaultOpen`) and
 *   stores the Collapsible's `Toggled` events. Upstream's `title`
 *   attribute on the Collapsible root is chained onto the root part's
 *   element.
 * - `SidebarGroupLabel asChild` around `CollapsibleTrigger` (D-2):
 *   upstream renders ONE <button> carrying the label's classes and
 *   `data-slot="sidebar-group-label"` (the child's slot wins the Slot
 *   merge). Here the trigger part is applied to a <button> stamped
 *   with the label's slot, `data-sidebar` and classes — the label's
 *   base class comes from the sidebar port's exported
 *   `SIDEBAR_GROUP_LABEL_CLASS`, upstream's extra label classes are
 *   appended verbatim.
 * - `SidebarMenuButton asChild` around an <a> (D-2): the port's
 *   `SidebarMenuButton` always renders a <button>, so the anchor rows
 *   are drawn by `SidebarMenuLink` below, which stacks the menu
 *   button's variants and `data-*` stamps on an `h.a` — exactly the
 *   stamps `SidebarMenuButton` itself writes, on the anchor upstream
 *   rendered.
 * - Upstream keys its rotation utility on Radix's `data-state`
 *   (`group-data-[state=open]/collapsible:rotate-90`); the class is
 *   kept verbatim — the kit Collapsible writes `data-open` /
 *   `data-closed` instead (D-5), so the utility is inert as written.
 * - The Sidebar's children (header / content / rail) are passed as one
 *   array: the runtime flattens builder children, but the sidebar
 *   port's `children: View.Content` signature is narrower than that,
 *   so `bun run check` reports the array argument — a known
 *   port-signature limitation, shared by every bases sidebar block.
 */
import * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
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
  SidebarMenuItem,
  SidebarRail,
  sidebarMenuButtonVariants,
  type SidebarMenuButtonSize,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { ChevronRightIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
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

// ---------------------------------------------------------------------------
// NavGroup — one collapsible parent group (see the header). Not an
// upstream export: upstream inlines the Collapsible in AppSidebar's map.
// ---------------------------------------------------------------------------

const NavGroupProps = Schema.Struct({
  title: Schema.String,
  items: Schema.Array(
    Schema.Struct({
      title: Schema.String,
      url: Schema.String,
      isActive: Schema.optional(Schema.Boolean),
    }),
  ),
});

const NavGroupMessage = UiSchema.TaggedEnum({
  /** The kit Collapsible asked for its next open value. */
  Toggled: { open: Schema.Boolean },
});

const NavGroup = Html.component({
  name: "Sidebar02NavGroup",
  props: NavGroupProps,
  model: Schema.Struct({ open: Schema.Boolean }),
  message: NavGroupMessage,
}).make({
  init: () => ({ open: true }),
  update: {
    Toggled: ($, { open }) => $.evolve({ open }),
  },
  view: (h, model) =>
    Collapsible(h, {
      props: { open: model.open },
      onEmit: {
        Toggled: ({ open }) => NavGroupMessage.Toggled({ open }),
        Settled: () => undefined,
      },
      view: (collapsible) =>
        collapsible.root(h.div.attr("title", h.props.title).class("group/collapsible")).children(
          SidebarGroup(h).children(
            CollapsibleTrigger(
              collapsible,
              h.button
                .attrs({
                  "data-slot": "sidebar-group-label",
                  "data-sidebar": "group-label",
                })
                .class(
                  cn(
                    SIDEBAR_GROUP_LABEL_CLASS,
                    "group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  ),
                ),
            ).children(
              h.props.title,
              " ",
              ChevronRightIcon(h, {
                class: "ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90",
              }),
            ),
            CollapsibleContent(collapsible, h.div)?.children(
              SidebarGroupContent(h).children(
                SidebarMenu(h).children(
                  h.props.items.map((item) =>
                    SidebarMenuItem(h).children(
                      SidebarMenuLink(h, { href: item.url, isActive: item.isActive }, item.title),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
    }),
});

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
  Sidebar(sidebar, h, {}, [
    SidebarHeader(h).children(
      VersionSwitcher(h, {
        props: { versions: data.versions, defaultVersion: data.versions[0]! },
      }),
      SearchForm(h, {}),
    ),
    SidebarContent(h, { class: "gap-0" }).children(
      // We create a collapsible SidebarGroup for each parent.
      data.navMain.map((item) => NavGroup(h, { props: { title: item.title, items: item.items } })),
    ),
    SidebarRail(sidebar, h),
  ]);
