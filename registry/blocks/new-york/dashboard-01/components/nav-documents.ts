/**
 * NavDocuments — shadcn/ui block `dashboard-01`
 * (`registry/new-york-v4/blocks/dashboard-01/components/nav-documents.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a React component reading `isMobile` from `useSidebar()`,
 * rendering one row per document — a `SidebarMenuButton asChild` link
 * plus a per-row Radix `DropdownMenu` behind a hover `SidebarMenuAction`
 * — and a trailing "More" row. Here: `NavDocuments` is a view function;
 * each row is a `NavDocumentsItem` component (the row menu's open state
 * lives in its Model; it `reads` the `SidebarProvider` for `isMobile`,
 * the port's replacement for the context hook). Menu picks just close
 * the menu; upstream's items are inert. Icons are Tabler
 * (`@tabler/icons-react`); the builders below carry the Tabler path
 * data (MIT) via this repo's `icon()` helper.
 *
 * Declared divergences (anything else is a bug):
 *
 * - The `asChild` anchor is NOT reproduced: the sidebar port's
 *   `SidebarMenuButton` is always a `<button>` (D-2), so the item `url`
 *   is carried in the data but draws no link — the same stance as the
 *   other sidebar blocks.
 * - Upstream's item `icon` is a Tabler component reference; the data
 *   carries the Tabler icon name and this file maps names to builders.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { icon, type IconOptions } from "@/lib/icons";
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

/** Tabler `database` (MIT). */
export const DatabaseIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 6m-8 0a8 3 0 1 0 16 0a8 3 0 1 0 -16 0" }],
      ["path", { d: "M4 6v6a8 3 0 0 0 16 0v-6" }],
      ["path", { d: "M4 12v6a8 3 0 0 0 16 0v-6" }],
    ],
    options,
  );

/** Tabler `report` (MIT). */
export const ReportIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M8 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h5.697" }],
      ["path", { d: "M18 14v4h4" }],
      ["path", { d: "M18 11v-4a2 2 0 0 0 -2 -2h-2" }],
      [
        "path",
        {
          d: "M8 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z",
        },
      ],
      ["path", { d: "M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" }],
      ["path", { d: "M8 11h4" }],
      ["path", { d: "M8 15h3" }],
    ],
    options,
  );

/** Tabler `file-word` (MIT). */
export const FileWordIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M14 3v4a1 1 0 0 0 1 1h4" }],
      ["path", { d: "M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" }],
      ["path", { d: "M9 12l1.333 5l1.667 -4l1.667 4l1.333 -5" }],
    ],
    options,
  );

/** Tabler `folder` (MIT). */
export const FolderIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2",
        },
      ],
    ],
    options,
  );

/** Tabler `share-3` (MIT). */
export const Share3Icon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [["path", { d: "M13 4v4c-6.575 1.028 -9.02 6.788 -10 12c-.037 .206 5.384 -5.962 10 -6v4l8 -7l-8 -7z" }]],
    options,
  );

/** Tabler `trash` (MIT). */
export const TrashIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M4 7l16 0" }],
      ["path", { d: "M10 11l0 6" }],
      ["path", { d: "M14 11l0 6" }],
      ["path", { d: "M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" }],
      ["path", { d: "M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" }],
    ],
    options,
  );

/** Tabler `dots` (MIT). */
export const DotsIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }],
      ["path", { d: "M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }],
      ["path", { d: "M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }],
    ],
    options,
  );

const documentIcons: Readonly<Record<string, typeof DatabaseIcon>> = {
  database: DatabaseIcon,
  report: ReportIcon,
  "file-word": FileWordIcon,
};

export const NavDocumentsItemProps = Schema.Struct({
  name: Schema.String,
  url: Schema.String,
  icon: Schema.String,
});

export const NavDocumentsItemMessage = UiSchema.TaggedEnum({
  MenuOpened: {},
  MenuClosed: {},
});

export const NavDocumentsItem = Html.component({
  name: "Dashboard01NavDocumentsItem",
  props: NavDocumentsItemProps,
  model: Schema.Struct({ open: Schema.Boolean }),
  message: NavDocumentsItemMessage,
  reads: { sidebar: SidebarProvider },
}).make({
  init: () => ({ open: false }),
  update: {
    MenuOpened: ($) => $.evolve({ open: true }),
    MenuClosed: ($) => $.evolve({ open: false }),
  },
  view: (h, model) => {
    const Icon = documentIcons[h.props.icon];
    const isMobile = h.reads.sidebar.isMobile;
    return SidebarMenuItem(h).children(
      SidebarMenuButton(h).children(
        Icon === undefined ? undefined : Icon(h),
        h.span.children(h.props.name),
      ),
      DropdownMenu(h, {
        props: {
          open: model.open,
          items: [
            { value: "open", label: "Open" },
            { value: "share", label: "Share" },
            { value: "delete", label: "Delete" },
          ],
          side: isMobile ? "bottom" : "right",
          align: isMobile ? "end" : "start",
        },
        onEmit: {
          RequestedOpen: () => NavDocumentsItemMessage.MenuOpened(),
          RequestedClose: () => NavDocumentsItemMessage.MenuClosed(),
          Picked: () => NavDocumentsItemMessage.MenuClosed(),
          Highlighted: () => undefined,
          RequestedQuery: () => undefined,
          Settled: () => undefined,
        },
        view: (menu) =>
          h.div.children(
            DropdownMenuTrigger(menu, h, {
              element: SidebarMenuAction(h, {
                showOnHover: true,
                class: "rounded-sm data-[state=open]:bg-accent",
              }),
            }).children(DotsIcon(h), h.span.class("sr-only").children("More")),
            DropdownMenuContent(menu, h, { class: "w-24 rounded-lg" }).children(
              DropdownMenuItem(menu, h, { value: "open" }).children(
                FolderIcon(h),
                h.span.children("Open"),
              ),
              DropdownMenuItem(menu, h, { value: "share" }).children(
                Share3Icon(h),
                h.span.children("Share"),
              ),
              DropdownMenuSeparator(menu, h),
              DropdownMenuItem(menu, h, { value: "delete", variant: "destructive" }).children(
                TrashIcon(h),
                h.span.children("Delete"),
              ),
            ),
          ),
      }),
    );
  },
});

export const NavDocumentsProps = Schema.Struct({
  items: Schema.Array(
    Schema.Struct({
      name: Schema.String,
      url: Schema.String,
      icon: Schema.String,
    }),
  ),
});

export const NavDocuments = <Msg>(h: Html.H<Msg>, options: { props: typeof NavDocumentsProps.Type }) =>
  SidebarGroup(h, { class: "group-data-[collapsible=icon]:hidden" }).children(
    SidebarGroupLabel(h).children("Documents"),
    SidebarMenu(h).children(
      options.props.items.map((item) =>
        NavDocumentsItem(h, {
          key: item.name,
          props: { name: item.name, url: item.url, icon: item.icon },
        }),
      ),
      SidebarMenuItem(h).children(
        SidebarMenuButton(h, { class: "text-sidebar-foreground/70" }).children(
          DotsIcon(h, { class: "text-sidebar-foreground/70" }),
          h.span.children("More"),
        ),
      ),
    ),
  );
