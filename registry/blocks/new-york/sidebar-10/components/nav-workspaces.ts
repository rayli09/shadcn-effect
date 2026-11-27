/**
 * NavWorkspaces — shadcn/ui block `sidebar-10`
 * (`registry/new-york-v4/blocks/sidebar-10/components/nav-workspaces.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a stateless React component rendering one Radix
 * `Collapsible` (closed by default) per workspace. Here: a view
 * function drawing one `WorkspaceItem` component per workspace — the
 * kit Collapsible is controlled, so the open state lives in that
 * component's Model, initialised closed.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's workspace button and page buttons wrap an `<a href="#">`
 *   via `asChild`; the sidebar port's `SidebarMenuButton` is always a
 *   `<button>` (the port's D-2). `SidebarMenuSubButton` keeps
 *   upstream's real anchors.
 * - Local icon builder: `PlusIcon` is not in `@/lib/icons`; it is
 *   defined in this file from the lucide-react 1.69 path data (ISC) via
 *   the lib's `icon()` helper.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { ChevronRightIcon, EllipsisIcon, icon, type IconOptions } from "@/lib/icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.ts";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar.ts";

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

export const WorkspaceItemProps = Schema.Struct({
  name: Schema.String,
  emoji: Schema.String,
  pages: Schema.Array(Schema.Struct({ name: Schema.String, emoji: Schema.String })),
});

export const WorkspaceItemMessage = UiSchema.TaggedEnum({
  Toggled: { open: Schema.Boolean },
});

export const WorkspaceItem = Html.component({
  name: "WorkspaceItem",
  props: WorkspaceItemProps,
  model: Schema.Struct({ open: Schema.Boolean }),
  message: WorkspaceItemMessage,
}).make({
  init: () => ({ open: false }),
  update: {
    Toggled: ($, { open }) => $.evolve({ open }),
  },
  view: (h, model) =>
    Collapsible(h, {
      props: { open: model.open },
      onEmit: {
        Toggled: ({ open }) => WorkspaceItemMessage.Toggled({ open }),
        Settled: () => undefined,
      },
      view: (collapsible) =>
        collapsible.root(h.div).children(
          SidebarMenuItem(h).children(
            SidebarMenuButton(h).children(
              h.span.children(h.props.emoji),
              h.span.children(h.props.name),
            ),
            CollapsibleTrigger(
              collapsible,
              SidebarMenuAction(h, {
                class:
                  "left-2 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90",
                showOnHover: true,
              }),
            ).children(ChevronRightIcon(h)),
            SidebarMenuAction(h, { showOnHover: true }).children(PlusIcon(h)),
            CollapsibleContent(collapsible, h.div)?.children(
              SidebarMenuSub(h).children(
                h.props.pages.map((page) =>
                  SidebarMenuSubItem(h).children(
                    SidebarMenuSubButton(h, { href: "#" }).children(
                      h.span.children(page.emoji),
                      h.span.children(page.name),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
    }),
});

export const NavWorkspaces = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly workspaces: ReadonlyArray<{
      name: string;
      emoji: string;
      pages: ReadonlyArray<{ name: string; emoji: string }>;
    }>;
  },
) =>
  SidebarGroup(h).children(
    SidebarGroupLabel(h).children("Workspaces"),
    SidebarGroupContent(h).children(
      SidebarMenu(h).children(
        options.workspaces.map((workspace) =>
          WorkspaceItem(h, {
            key: workspace.name,
            props: { name: workspace.name, emoji: workspace.emoji, pages: workspace.pages },
          }),
        ),
        SidebarMenuItem(h).children(
          SidebarMenuButton(h, { class: "text-sidebar-foreground/70" }).children(
            EllipsisIcon(h),
            h.span.children("More"),
          ),
        ),
      ),
    ),
  );
