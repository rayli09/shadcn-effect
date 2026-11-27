/**
 * NavProjects (sidebar-16 block) — upstream
 * `registry/bases/radix/blocks/sidebar-16/components/nav-projects.tsx`
 * ported to Effect UI. A view function: the provider's parts come first
 * (the `useSidebar()` replacement — `isMobile` is read from them), then
 * the caller's `h`, then the data — upstream's props, with `icon`
 * holding an icon *builder* reference instead of ReactNode JSX (called
 * at render: `item.icon(h)`).
 *
 * Declared divergences:
 * - The kit Menu's open state is the consumer's (it lives in a Model);
 *   this block is an example composition whose host Page owns no menu
 *   state, so each menu is drawn at upstream's initial state (`open:
 *   false`) and its events are no-ops. Wire `open` / `onEmit` to a Model
 *   in a real app.
 * - D-2: upstream's `SidebarMenuButton asChild` renders an
 *   <a href={item.url}>; there is no Slot here and `SidebarMenuButton`
 *   always renders its <button>, so the link collapses onto the button
 *   and `url` is carried in the data but not rendered as an href.
 * - Icons lucide-react does not ship here: the glyphs below are LOCAL
 *   builders over the shared `icon()` helper, nodes copied verbatim from
 *   lucide's SVGs (ISC): folder, share, trash-2. Upstream's
 *   `MoreHorizontalIcon` is the shared `EllipsisIcon`.
 */
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import { EllipsisIcon, icon, type IconOptions } from "@/lib/icons";
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
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";

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
            SidebarMenuButton(h).children(item.icon(h), h.span.children(item.name)),
            DropdownMenu(h, {
              props: {
                open: false,
                items: [
                  { value: "view", label: "View Project" },
                  { value: "share", label: "Share Project" },
                  { value: "delete", label: "Delete Project" },
                ],
                side: sidebar.isMobile ? "bottom" : "right",
                align: sidebar.isMobile ? "end" : "start",
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
