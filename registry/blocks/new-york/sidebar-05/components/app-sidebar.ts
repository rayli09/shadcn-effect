/**
 * AppSidebar — shadcn/ui block `sidebar-05`
 * (`registry/new-york-v4/blocks/sidebar-05/components/app-sidebar.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source;
 * the sample data below is upstream's, verbatim.
 *
 * Upstream: a React function spreading `React.ComponentProps<typeof
 * Sidebar>` onto `Sidebar`, with one Radix `Collapsible` per nav parent
 * (`defaultOpen` only for the second). Here: a view function taking the
 * `SidebarProvider` parts, the caller's `h`, and the same options as an
 * options object; each collapsible item is the `NavCollapsibleItem`
 * component below — the kit Collapsible is controlled, so the open
 * state lives in that component's Model, initialised from the
 * `defaultOpen` prop.
 *
 * Declared divergences (anything else is a bug):
 *
 * - `Sidebar` types its children as a single `View.Content`; the kit
 *   flattens child arrays at runtime, so the upstream sibling list is
 *   passed as one array, cast once at the call.
 * - Upstream's logo / menu buttons wrap an `<a href>` via `asChild`;
 *   the sidebar port's `SidebarMenuButton` is always a `<button>` (the
 *   port's D-2). `SidebarMenuSubButton` keeps upstream's real anchors.
 * - The Plus/Minus swap is keyed on `data-[state=open]` /
 *   `data-[state=closed]` classes, kept verbatim (D-5): the kit writes
 *   `data-open` / `data-closed`, so the swap is inert here, exactly as
 *   the sidebar port documents for its own class strings.
 *
 * Local icon builders: `GalleryVerticalEndIcon` and `PlusIcon` are not
 * in `@/lib/icons`; they are defined in this file from the lucide-react
 * 1.69 path data (ISC) via the lib's `icon()` helper. (`MinusIcon` is
 * in the lib.)
 */
import type * as Component from "@effect/ui/Component";
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import type * as View from "@effect/ui/View";
import * as Schema from "effect/Schema";
import { MinusIcon, icon, type IconOptions } from "@/lib/icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.ts";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
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
import { SearchForm } from "./search-form.ts";

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

/** Lucide `plus` (ISC). */
export const PlusIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M5 12h14" }],
      ["path", { d: "M12 5v14" }],
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

export const NavCollapsibleItemProps = Schema.Struct({
  title: Schema.String,
  defaultOpen: Schema.Boolean,
  items: Schema.Array(
    Schema.Struct({
      title: Schema.String,
      url: Schema.String,
      isActive: Schema.optional(Schema.Boolean),
    }),
  ),
});

export const NavCollapsibleItemMessage = UiSchema.TaggedEnum({
  Toggled: { open: Schema.Boolean },
});

export const NavCollapsibleItem = Html.component({
  name: "NavCollapsibleItem",
  props: NavCollapsibleItemProps,
  model: Schema.Struct({ open: Schema.Boolean }),
  message: NavCollapsibleItemMessage,
}).make({
  init: ({ props }) => ({ open: props.defaultOpen }),
  update: {
    Toggled: ($, { open }) => $.evolve({ open }),
  },
  view: (h, model) =>
    Collapsible(h, {
      props: { open: model.open },
      onEmit: {
        Toggled: ({ open }) => NavCollapsibleItemMessage.Toggled({ open }),
        Settled: () => undefined,
      },
      view: (collapsible) =>
        collapsible
          .root(h.div)
          .class("group/collapsible")
          .children(
            SidebarMenuItem(h).children(
              CollapsibleTrigger(collapsible, SidebarMenuButton(h)).children(
                `${h.props.title} `,
                PlusIcon(h, { class: "ml-auto group-data-[state=open]/collapsible:hidden" }),
                MinusIcon(h, { class: "ml-auto group-data-[state=closed]/collapsible:hidden" }),
              ),
              h.props.items.length > 0
                ? CollapsibleContent(collapsible, h.div)?.children(
                    SidebarMenuSub(h).children(
                      h.props.items.map((item) =>
                        SidebarMenuSubItem(h).children(
                          SidebarMenuSubButton(h, {
                            href: item.url,
                            isActive: item.isActive,
                          }).children(item.title),
                        ),
                      ),
                    ),
                  )
                : undefined,
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
      SearchForm(h, { props: {} }),
    ),
    SidebarContent(h).children(
      SidebarGroup(h).children(
        SidebarMenu(h).children(
          data.navMain.map((item, index) =>
            NavCollapsibleItem(h, {
              key: item.title,
              props: { title: item.title, defaultOpen: index === 1, items: item.items },
            }),
          ),
        ),
      ),
    ),
    SidebarRail(sidebar, h),
  ] as unknown as View.Content<Msg, Component.Shared.Of<typeof SidebarProvider>>);
