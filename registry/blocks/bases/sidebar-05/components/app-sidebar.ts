/**
 * AppSidebar — from the upstream bases block `sidebar-05`
 * (`registry/bases/radix/blocks/sidebar-05/components/app-sidebar.tsx`),
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
 * - `SidebarMenuButton asChild` around an <a> (D-2): the port's
 *   `SidebarMenuButton` always renders a <button>, so the brand row is
 *   drawn by `SidebarMenuLink` below, which stacks the menu button's
 *   variants and `data-*` stamps on an `h.a` — exactly the stamps
 *   `SidebarMenuButton` itself writes, on the anchor upstream rendered.
 * - The kit Collapsible's open state is the consumer's (it lives in a
 *   Model); this block is an example composition whose host Page owns
 *   no collapsible state, so each group is drawn at upstream's initial
 *   state (`open: index === 1`, from upstream's `defaultOpen`) and its
 *   events are no-ops. Wire `open` / `onEmit` to a Model in a real app.
 * - Upstream's `CollapsibleTrigger asChild` becomes the kit trigger
 *   part applied directly to the `SidebarMenuButton` builder — the
 *   kit's own part-stacking composition. Upstream's
 *   `SidebarMenuSubButton asChild` needs no stacking: the port's
 *   sub-button is itself an <a> and takes `href` directly.
 * - Icons: `GalleryVerticalEndIcon` and `PlusIcon` are LOCAL builders
 *   over the shared `icon()` helper, nodes copied verbatim from
 *   lucide's SVGs (ISC); `MinusIcon` is the shared builder.
 */
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
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
  SidebarRail,
  sidebarMenuButtonVariants,
  type SidebarMenuButtonSize,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { icon, MinusIcon, type IconOptions } from "@/lib/icons";
import { SearchForm } from "./search-form.ts";

// ---------------------------------------------------------------------------
// Icons — file-local builders (D-7) for glyphs `@/lib/icons` does not hoist
// yet; node data copied verbatim from lucide's SVGs (ISC).
// ---------------------------------------------------------------------------

/** Lucide `gallery-vertical-end` (ISC). */
const GalleryVerticalEndIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
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
const PlusIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M5 12h14" }],
      ["path", { d: "M12 5v14" }],
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
  ...children: ReadonlyArray<View.Content<Msg>>
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
  Sidebar(sidebar, h, {}, [
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
      SearchForm(h, {}),
    ),
    SidebarContent(h).children(
      SidebarGroup(h).children(
        SidebarMenu(h).children(
          ...data.navMain.map((item, index) =>
            Collapsible(h, {
              key: item.title,
              props: { open: index === 1 },
              onEmit: {
                Toggled: () => undefined,
                Settled: () => undefined,
              },
              view: (collapsible) =>
                collapsible
                  .root(h.div)
                  .class("group/collapsible")
                  .children(
                    SidebarMenuItem(h).children(
                      CollapsibleTrigger(collapsible, SidebarMenuButton(h)).children(
                        item.title,
                        " ",
                        PlusIcon(h, {
                          class: "ml-auto group-data-[state=open]/collapsible:hidden",
                        }),
                        MinusIcon(h, {
                          class: "ml-auto group-data-[state=closed]/collapsible:hidden",
                        }),
                      ),
                      item.items.length
                        ? CollapsibleContent(collapsible, h.div)?.children(
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
                          )
                        : undefined,
                    ),
                  ),
            }),
          ),
        ),
      ),
    ),
    SidebarRail(sidebar, h),
  ]);
