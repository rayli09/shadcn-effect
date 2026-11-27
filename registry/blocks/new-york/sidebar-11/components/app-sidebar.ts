/**
 * AppSidebar — shadcn/ui block `sidebar-11`
 * (`registry/new-york-v4/blocks/sidebar-11/components/app-sidebar.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source;
 * the sample data below is upstream's, verbatim.
 *
 * Upstream: a React function spreading `React.ComponentProps<typeof
 * Sidebar>` onto `Sidebar`, plus a recursive `Tree` component holding
 * each folder's open state in `useState`. Here: a view function taking
 * the `SidebarProvider` parts, the caller's `h`, and the same options
 * as an options object; the tree is the `FilesTree` component below —
 * one component holding every folder's open state by path (the kit
 * Collapsible is controlled), initialised from upstream's
 * `defaultOpen` rule (`components` / `ui` start open), with a recursive
 * view function rendering the items.
 *
 * Declared divergence: `Sidebar` types its children as a single
 * `View.Content`; the kit flattens child arrays at runtime, so the
 * upstream sibling list is passed as one array, cast once at the call.
 *
 * Local icon builders: `FileIcon` and `FolderIcon` are not in
 * `@/lib/icons`; they are defined in this file from the lucide-react
 * 1.69 path data (ISC) via the lib's `icon()` helper.
 */
import type * as Component from "@effect/ui/Component";
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import type * as View from "@effect/ui/View";
import * as Schema from "effect/Schema";
import { ChevronRightIcon, icon, type IconOptions } from "@/lib/icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.ts";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
  SidebarRail,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";

/** Lucide `file` (ISC). */
export const FileIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
        },
      ],
      ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5" }],
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

// This is sample data.
const data = {
  changes: [
    {
      file: "README.md",
      state: "M",
    },
    {
      file: "api/hello/route.ts",
      state: "U",
    },
    {
      file: "app/layout.tsx",
      state: "M",
    },
  ],
  tree: [
    ["app", ["api", ["hello", ["route.ts"]], "page.tsx", "layout.tsx", ["blog", ["page.tsx"]]]],
    ["components", ["ui", "button.tsx", "card.tsx"], "header.tsx", "footer.tsx"],
    ["lib", ["util.ts"]],
    ["public", "favicon.ico", "vercel.svg"],
    ".eslintrc.json",
    ".gitignore",
    "next.config.js",
    "tailwind.config.js",
    "package.json",
    "README.md",
  ],
};

export type TreeItem = string | ReadonlyArray<TreeItem>;

export const FilesTreeMessage = UiSchema.TaggedEnum({
  Toggled: { path: Schema.String, open: Schema.Boolean },
});

const renderTreeItem = (
  h: Html.H<typeof FilesTreeMessage.Type>,
  item: TreeItem,
  path: string,
  open: ReadonlyArray<string>,
): View.Content<typeof FilesTreeMessage.Type, any> => {
  const name = (Array.isArray(item) ? item[0] : item) as string;
  const items: ReadonlyArray<TreeItem> = Array.isArray(item) ? item.slice(1) : [];
  if (items.length === 0) {
    return SidebarMenuButton(h, {
      isActive: name === "button.tsx",
      class: "data-[active=true]:bg-transparent",
    }).children(FileIcon(h), name);
  }
  const itemPath = path === "" ? name : `${path}/${name}`;
  return SidebarMenuItem(h).children(
    Collapsible(h, {
      props: { open: open.includes(itemPath) },
      onEmit: {
        Toggled: ({ open }) => FilesTreeMessage.Toggled({ path: itemPath, open }),
        Settled: () => undefined,
      },
      view: (collapsible) =>
        collapsible
          .root(h.div)
          .class("group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90")
          .children(
            CollapsibleTrigger(collapsible, SidebarMenuButton(h)).children(
              ChevronRightIcon(h, { class: "transition-transform" }),
              FolderIcon(h),
              name,
            ),
            CollapsibleContent(collapsible, h.div)?.children(
              SidebarMenuSub(h).children(
                items.map((subItem) => renderTreeItem(h, subItem, itemPath, open)),
              ),
            ),
          ),
    }),
  );
};

export const FilesTree = Html.component({
  name: "FilesTree",
  model: Schema.Struct({ open: Schema.Array(Schema.String) }),
  message: FilesTreeMessage,
}).make({
  // Upstream's `defaultOpen` rule: the `components` and `ui` folders
  // start open (identified here by path).
  init: () => ({ open: ["components", "components/ui"] }),
  update: {
    Toggled: ($, { path, open }) =>
      $.evolve({
        open: open
          ? [...$.model.open, path]
          : $.model.open.filter((candidate) => candidate !== path),
      }),
  },
  view: (h, model) =>
    SidebarMenu(h).children(
      data.tree.map((item) => renderTreeItem(h, item as TreeItem, "", model.open)),
    ),
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
    SidebarContent(h).children(
      SidebarGroup(h).children(
        SidebarGroupLabel(h).children("Changes"),
        SidebarGroupContent(h).children(
          SidebarMenu(h).children(
            data.changes.map((item) =>
              SidebarMenuItem(h).children(
                SidebarMenuButton(h).children(FileIcon(h), item.file),
                SidebarMenuBadge(h).children(item.state),
              ),
            ),
          ),
        ),
      ),
      SidebarGroup(h).children(
        SidebarGroupLabel(h).children("Files"),
        SidebarGroupContent(h).children(FilesTree(h, {})),
      ),
    ),
    SidebarRail(sidebar, h),
  ] as unknown as View.Content<Msg, Component.Shared.Of<typeof SidebarProvider>>);
