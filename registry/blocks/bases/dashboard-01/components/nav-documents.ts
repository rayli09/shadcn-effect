/**
 * NavDocuments — from the upstream bases block `dashboard-01`
 * (`registry/bases/radix/blocks/dashboard-01/components/nav-documents.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Pairs with the `base-*` ui items (see site-header.ts's header).
 *
 * A view function: the provider's parts come first (`isMobile` is
 * read from them — the `useSidebar()` replacement), then the
 * caller's `h`, then the data. Upstream's `icon: ReactNode` field is
 * an icon *builder* reference here, called at render as
 * `item.icon(h)`. Upstream's `IconPlaceholder` names the lucide
 * glyph; the builders below are that glyph (see the icon note).
 *
 * Declared divergences:
 *
 * - The kit Menu's open state is the consumer's (it lives in a
 *   Model); this block is an example composition whose host Page
 *   owns no menu state, so each item's menu is drawn at upstream's
 *   initial state (`open: false`) and its events are no-ops. Wire
 *   `open` / `onEmit` to a Model in a real app.
 * - Upstream's `DropdownMenuTrigger asChild` (D-2): the trigger is
 *   the port's `SidebarMenuAction` builder stacked as the Menu
 *   trigger's `element` — the documented composition in the
 *   dropdown-menu port. Content `side` / `align` are Positioning
 *   props on the kit Menu call, chosen from `isMobile` exactly as
 *   upstream's ternaries do; `sideOffset: 4` is upstream Content's
 *   own default, passed explicitly as the sibling blocks do.
 * - `SidebarMenuButton asChild` around an <a> (D-2): the rows are
 *   drawn by `SidebarMenuLink` below, stacking the menu button's
 *   variants and `data-*` stamps on an `h.a` (the sidebar-07
 *   nav-projects composition).
 * - Icons: `FolderIcon`, `ShareIcon` and `Trash2Icon` are LOCAL
 *   builders over the shared `icon()` helper, nodes copied verbatim
 *   from lucide's SVGs (ISC): folder, share, trash-2 (whose current
 *   lucide geometry is the trash glyph). Upstream's
 *   `MoreHorizontalIcon` is the shared `EllipsisIcon`.
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
      ["path", { d: "M12 2v13" }],
      ["path", { d: "m16 6-4-4-4 4" }],
      ["path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }],
    ],
    options,
  );

/** Lucide `trash-2` (ISC). */
const Trash2Icon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
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
export type NavDocumentIcon = <Msg>(h: Html.H<Msg>, options?: IconOptions) => View.Content<Msg>;

export interface NavDocument {
  readonly name: string;
  readonly url: string;
  readonly icon: NavDocumentIcon;
}

export const NavDocuments = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: { readonly items: ReadonlyArray<NavDocument> },
) =>
  SidebarGroup(h, { class: "group-data-[collapsible=icon]:hidden" }).children(
    SidebarGroupLabel(h).children("Documents"),
    SidebarMenu(h).children(
      ...options.items.map((item) =>
        SidebarMenuItem(h)
          .key(item.name)
          .children(
            SidebarMenuLink(h, { href: item.url }, item.icon(h), h.span.children(item.name)),
            DropdownMenu(h, {
              key: item.name,
              props: {
                open: false,
                items: [
                  { value: "open", label: "Open" },
                  { value: "share", label: "Share" },
                  { value: "delete", label: "Delete" },
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
                      class: "rounded-sm data-[state=open]:bg-accent",
                    }),
                  }).children(EllipsisIcon(h), h.span.class("sr-only").children("More")),
                  DropdownMenuContent(menu, h, { class: "w-24 rounded-lg" }).children(
                    DropdownMenuItem(menu, h, { value: "open" }).children(
                      FolderIcon(h),
                      h.span.children("Open"),
                    ),
                    DropdownMenuItem(menu, h, { value: "share" }).children(
                      ShareIcon(h),
                      h.span.children("Share"),
                    ),
                    DropdownMenuSeparator(menu, h),
                    DropdownMenuItem(menu, h, { value: "delete", variant: "destructive" }).children(
                      Trash2Icon(h),
                      h.span.children("Delete"),
                    ),
                  ),
                ),
            }),
          ),
      ),
      SidebarMenuItem(h).children(
        SidebarMenuButton(h, { class: "text-sidebar-foreground/70" }).children(
          EllipsisIcon(h, { class: "text-sidebar-foreground/70" }),
          h.span.children("More"),
        ),
      ),
    ),
  );
