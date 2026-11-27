/**
 * AppSidebar (sidebar-11 block) — upstream
 * `registry/bases/radix/blocks/sidebar-11/components/app-sidebar.tsx`
 * ported to Effect UI. A view function: the provider's parts come first
 * (the block-wide replacement for upstream's context), then the caller's
 * `h`. The sample data is upstream's, verbatim, as a module constant.
 * Upstream's local `Tree` component becomes a local view helper of the
 * same name, recursing over the same `TreeItem` data.
 *
 * Declared divergences:
 * - The kit Collapsible's open state is the consumer's (it lives in a
 *   Model); this block is an example composition whose host Page owns no
 *   collapsible state, so each folder is drawn at upstream's initial
 *   state (`open: name === "components" || name === "ui"`, from
 *   upstream's `defaultOpen`) and its events are no-ops. Wire `open` /
 *   `onEmit` to a Model in a real app.
 * - Upstream spreads `React.ComponentProps<typeof Sidebar>` onto the
 *   Sidebar; the Page passes none, so the sidebar renders with its
 *   defaults.
 * - Icons: the glyphs below are LOCAL builders over the shared `icon()`
 *   helper, nodes copied verbatim from lucide's SVGs (ISC): file,
 *   folder. Upstream's `ChevronRightIcon` is the shared builder from
 *   `@/lib/icons`.
 */
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
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
  SidebarRail,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";

/** Lucide `file` (ISC). */
const FileIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }],
      ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4" }],
    ],
    options,
  );

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

type TreeItem = string | ReadonlyArray<TreeItem>;

const Tree = <Msg>(h: Html.H<Msg>, item: TreeItem): View.Content<Msg, any> => {
  const parts: ReadonlyArray<TreeItem> = Array.isArray(item) ? item : [item];
  // The head of a tree array is always its name (upstream's destructure
  // relies on the same shape).
  const name = parts[0] as string;
  const items = parts.slice(1);

  if (items.length === 0) {
    return SidebarMenuButton(h, {
      isActive: name === "button.tsx",
      class: "data-[active=true]:bg-transparent",
    }).children(FileIcon(h), name);
  }

  return SidebarMenuItem(h).children(
    Collapsible(h, {
      key: name,
      props: { open: name === "components" || name === "ui" },
      onEmit: {
        Toggled: () => undefined,
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
              SidebarMenuSub(h).children(...items.map((subItem) => Tree(h, subItem))),
            ),
          ),
    }),
  );
};

export const AppSidebar = <Msg>(sidebar: SidebarProviderParts, h: Html.H<Msg>) =>
  Sidebar(sidebar, h, {}, [
    SidebarContent(h).children(
      SidebarGroup(h).children(
        SidebarGroupLabel(h).children("Changes"),
        SidebarGroupContent(h).children(
          SidebarMenu(h).children(
            ...data.changes.map((item, index) =>
              SidebarMenuItem(h)
                .key(String(index))
                .children(
                  SidebarMenuButton(h).children(FileIcon(h), item.file),
                  SidebarMenuBadge(h).children(item.state),
                ),
            ),
          ),
        ),
      ),
      SidebarGroup(h).children(
        SidebarGroupLabel(h).children("Files"),
        SidebarGroupContent(h).children(
          SidebarMenu(h).children(...data.tree.map((item) => Tree(h, item))),
        ),
      ),
    ),
    SidebarRail(sidebar, h),
  ]);
