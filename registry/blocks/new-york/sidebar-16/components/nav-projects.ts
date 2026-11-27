/**
 * NavProjects — shadcn/ui block `sidebar-16`
 * (`registry/new-york-v4/blocks/sidebar-16/components/nav-projects.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a React component reading `isMobile` from `useSidebar()`,
 * rendering one Radix `DropdownMenu` per project behind a hover
 * `SidebarMenuAction`. Here: an `Html.component` — the open menu's
 * project name lives in the Model (the kit Menu is controlled), and the
 * component `reads` the `SidebarProvider` (the port's replacement for
 * the context hook) for `isMobile`. Menu picks just close the menu.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's project button wraps an `<a href>` via `asChild`; the
 *   sidebar port's `SidebarMenuButton` is always a `<button>` (the
 *   port's D-2), so the icon + name render directly in the button and
 *   the sample `url`s stay in the data, unused.
 * - Upstream's project `icon` is a React component reference; component
 *   references cannot be Schema props here, so the data carries the
 *   lucide icon name and this file maps names to builders (the local
 *   builders below — none of them are in `@/lib/icons`; they are
 *   defined from the lucide-react 1.69 path data, ISC, via the lib's
 *   `icon()` helper).
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
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
  SidebarProvider,
} from "@/components/ui/sidebar.ts";

/** Lucide `frame` (ISC). */
export const FrameIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["line", { x1: "22", x2: "2", y1: "6", y2: "6" }],
      ["line", { x1: "22", x2: "2", y1: "18", y2: "18" }],
      ["line", { x1: "6", x2: "6", y1: "2", y2: "22" }],
      ["line", { x1: "18", x2: "18", y1: "2", y2: "22" }],
    ],
    options,
  );

/** Lucide `pie-chart` (ISC). */
export const PieChartIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z",
        },
      ],
      ["path", { d: "M21.21 15.89A10 10 0 1 1 8 2.83" }],
    ],
    options,
  );

/** Lucide `map` (ISC). */
export const MapIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",
        },
      ],
      ["path", { d: "M15 5.764v15" }],
      ["path", { d: "M9 3.236v15" }],
    ],
    options,
  );

/** Lucide `folder` (ISC). */
export const FolderIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
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
export const ShareIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 2v13" }],
      ["path", { d: "m16 6-4-4-4 4" }],
      ["path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }],
    ],
    options,
  );

/** Lucide `trash-2` (ISC). */
export const Trash2Icon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10 11v6" }],
      ["path", { d: "M14 11v6" }],
      ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }],
      ["path", { d: "M3 6h18" }],
      ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }],
    ],
    options,
  );

const projectIcons: Readonly<Record<string, typeof FrameIcon>> = {
  frame: FrameIcon,
  "pie-chart": PieChartIcon,
  map: MapIcon,
};

export const NavProjectsProps = Schema.Struct({
  projects: Schema.Array(
    Schema.Struct({ name: Schema.String, url: Schema.String, icon: Schema.String }),
  ),
});

export const NavProjectsMessage = UiSchema.TaggedEnum({
  MenuOpened: { name: Schema.String },
  MenuClosed: {},
});

export const NavProjects = Html.component({
  name: "NavProjects",
  props: NavProjectsProps,
  model: Schema.Struct({ openMenu: Schema.NullOr(Schema.String) }),
  message: NavProjectsMessage,
  reads: { sidebar: SidebarProvider },
}).make({
  init: () => ({ openMenu: null }),
  update: {
    MenuOpened: ($, { name }) => $.evolve({ openMenu: name }),
    MenuClosed: ($) => $.evolve({ openMenu: null }),
  },
  view: (h, model) => {
    const isMobile = h.reads.sidebar.isMobile;
    const projectItem = (item: { name: string; url: string; icon: string }) => {
      const Icon = projectIcons[item.icon] ?? FrameIcon;
      const menu = DropdownMenu(h, {
        props: {
          open: model.openMenu === item.name,
          items: [
            { value: "view", label: "View Project" },
            { value: "share", label: "Share Project" },
            { value: "delete", label: "Delete Project" },
          ],
          side: isMobile ? "bottom" : "right",
          align: isMobile ? "end" : "start",
        },
        onEmit: {
          RequestedOpen: () => NavProjectsMessage.MenuOpened({ name: item.name }),
          RequestedClose: () => NavProjectsMessage.MenuClosed(),
          Picked: () => NavProjectsMessage.MenuClosed(),
          Highlighted: () => undefined,
          RequestedQuery: () => undefined,
          Settled: () => undefined,
        },
        view: (menu) =>
          h.div.children(
            DropdownMenuTrigger(menu, h, {
              element: SidebarMenuAction(h, { showOnHover: true }),
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
      });
      return SidebarMenuItem(h).children(
        SidebarMenuButton(h).children(Icon(h), h.span.children(item.name)),
        menu,
      );
    };
    return SidebarGroup(h, { class: "group-data-[collapsible=icon]:hidden" }).children(
      SidebarGroupLabel(h).children("Projects"),
      SidebarMenu(h).children(
        h.props.projects.map(projectItem),
        SidebarMenuItem(h).children(
          SidebarMenuButton(h).children(EllipsisIcon(h), h.span.children("More")),
        ),
      ),
    );
  },
});
