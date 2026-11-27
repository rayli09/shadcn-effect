/**
 * NavProjects — from the upstream bases block `sidebar-08`
 * (`registry/bases/radix/blocks/sidebar-08/components/nav-projects.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * A view function: the provider's parts come first (the `useSidebar()`
 * replacement — `isMobile` is read from them), then the caller's `h`,
 * then the data. Upstream's `icon: ReactNode` field is an icon
 * *builder* reference here, called at render as `item.icon(h)`.
 *
 * Declared divergences:
 *
 * - The kit Menu's open state is the consumer's (it lives in a Model);
 *   this block is an example composition whose host Page owns no menu
 *   state, so each menu is drawn at upstream's initial state
 *   (`open: false`) and its events are no-ops. Wire `open` / `onEmit`
 *   to a Model in a real app.
 * - Upstream's `DropdownMenuTrigger asChild` becomes the kit trigger
 *   part applied directly to the `SidebarMenuAction` builder — the
 *   kit's own part-stacking composition. Content `side` / `align` are
 *   Positioning props on the kit Menu call, not on the content part;
 *   upstream's implicit `sideOffset` default (Radix 4) is passed
 *   explicitly for the same reason.
 * - `SidebarMenuButton asChild` around an <a> (D-2): the port's
 *   `SidebarMenuButton` always renders a <button>, so the project
 *   rows are drawn by `SidebarMenuLink` below, which stacks the menu
 *   button's variants and `data-*` stamps on an `h.a` — exactly the
 *   stamps `SidebarMenuButton` itself writes, on the anchor upstream
 *   rendered.
 * - Icons: `FolderIcon`, `ShareIcon` and `Trash2Icon` are LOCAL
 *   builders over the shared `icon()` helper, nodes copied verbatim
 *   from lucide's SVGs (ISC); upstream's `MoreHorizontalIcon` is the
 *   shared `EllipsisIcon`.
 */
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.ts";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  sidebarMenuButtonVariants,
  type SidebarMenuButtonSize,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { EllipsisIcon, icon, type IconOptions } from "@/lib/icons";

/** Lucide `folder` (ISC). */
const FolderIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
        },
      ],
    ],
    options,
  );

/** Lucide `share` (ISC). */
const ShareIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }],
      ["polyline", { points: "16 6 12 2 8 6" }],
      ["line", { x1: "12", x2: "12", y1: "2", y2: "15" }],
    ],
    options,
  );

/** Lucide `trash-2` (ISC). */
const Trash2Icon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M3 6h18" }],
      ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }],
      ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }],
      ["line", { x1: "10", x2: "10", y1: "11", y2: "17" }],
      ["line", { x1: "14", x2: "14", y1: "11", y2: "17" }],
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

/** An icon builder reference (lucide glyph), called at render with the caller's `h`. */
export type NavProjectIcon = <Msg>(h: Html.H<Msg>, options?: IconOptions) => View.Content<Msg>;

export interface NavProject {
  readonly name: string;
  readonly url: string;
  readonly icon: NavProjectIcon;
}

export const NavProjects = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: { readonly projects: ReadonlyArray<NavProject> },
) =>
  SidebarGroup(h, { class: "group-data-[collapsible=icon]:hidden" }).children(
    SidebarGroupLabel(h).children("Projects"),
    SidebarMenu(h).children(
      ...options.projects.map((item) =>
        SidebarMenuItem(h)
          .key(item.name)
          .children(
            SidebarMenuLink(h, { href: item.url }, item.icon(h), h.span.children(item.name)),
            DropdownMenu(h, {
              key: item.name,
              props: {
                open: false,
                items: [
                  { value: "view", label: "View Project" },
                  { value: "share", label: "Share Project" },
                  { value: "delete", label: "Delete Project" },
                ],
                side: sidebar.isMobile ? "bottom" : "right",
                align: sidebar.isMobile ? "end" : "start",
                sideOffset: 4,
              },
              onEmit: {
                RequestedOpen: () => undefined,
                RequestedClose: () => undefined,
                Picked: () => undefined,
                Highlighted: () => undefined,
                RequestedQuery: () => undefined,
                Settled: () => undefined,
              },
              view: (menu) =>
                h.div(
                  DropdownMenuTrigger(menu, h, {
                    element: SidebarMenuAction(h, {
                      showOnHover: true,
                      class: "aria-expanded:bg-muted",
                    }),
                  }).children(EllipsisIcon(h), h.span.class("sr-only").children("More")),
                  DropdownMenuContent(menu, h, { class: "w-48" }).children(
                    DropdownMenuItem(menu, h, { value: "view" }).children(
                      FolderIcon(h, { class: "text-muted-foreground" }),
                      h.span.children("View Project"),
                    ),
                    DropdownMenuItem(menu, h, { value: "share" }).children(
                      ShareIcon(h, { class: "text-muted-foreground" }),
                      h.span.children("Share Project"),
                    ),
                    DropdownMenuSeparator(menu, h),
                    DropdownMenuItem(menu, h, { value: "delete" }).children(
                      Trash2Icon(h, { class: "text-muted-foreground" }),
                      h.span.children("Delete Project"),
                    ),
                  ),
                ),
            }),
          ),
      ),
      SidebarMenuItem(h).children(
        SidebarMenuButton(h).children(EllipsisIcon(h), h.span.children("More")),
      ),
    ),
  );
