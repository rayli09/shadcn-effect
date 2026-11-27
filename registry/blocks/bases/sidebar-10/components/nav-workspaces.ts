/**
 * NavWorkspaces (sidebar-10 block) — upstream
 * `registry/bases/radix/blocks/sidebar-10/components/nav-workspaces.tsx`
 * ported to Effect UI. A view function: the provider's parts come first,
 * then the caller's `h`, then the data. Upstream's `emoji: ReactNode`
 * fields are plain strings in this data (the only values upstream's data
 * passes).
 *
 * Declared divergences:
 * - The kit Collapsible's open state is the consumer's (it lives in a
 *   Model); this block is an example composition whose host Page owns no
 *   collapsible state, so each workspace is drawn at upstream's initial
 *   state (`open: false` — upstream passes no `defaultOpen`) and its
 *   events are no-ops. Wire `open` / `onEmit` to a Model in a real app.
 * - D-2: upstream's `SidebarMenuButton asChild` and
 *   `CollapsibleTrigger asChild` (stacking the trigger part on
 *   `SidebarMenuAction`) become, respectively, the button itself (the
 *   <a href="#"> collapses onto it; `href` is not rendered) and the
 *   trigger part applied directly to the `SidebarMenuAction` builder —
 *   the kit's own part-stacking composition.
 * - Icons: `PlusIcon` below is a LOCAL builder over the shared `icon()`
 *   helper, nodes copied verbatim from lucide's `plus` SVG (ISC).
 *   Upstream's `MoreHorizontalIcon` is the shared `EllipsisIcon`.
 */
import type * as Html from "@effect/ui/html/Html";
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
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";

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

export interface NavWorkspace {
  readonly name: string;
  readonly emoji: string;
  readonly pages: ReadonlyArray<{
    readonly name: string;
    readonly emoji: string;
  }>;
}

export const NavWorkspaces = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: { readonly workspaces: ReadonlyArray<NavWorkspace> },
) =>
  SidebarGroup(h).children(
    SidebarGroupLabel(h).children("Workspaces"),
    SidebarGroupContent(h).children(
      SidebarMenu(h).children(
        ...options.workspaces.map((workspace) =>
          Collapsible(h, {
            key: workspace.name,
            props: { open: false },
            onEmit: {
              Toggled: () => undefined,
              Settled: () => undefined,
            },
            view: (collapsible) =>
              collapsible.root(h.div).children(
                SidebarMenuItem(h).children(
                  SidebarMenuButton(h).children(
                    h.span.children(workspace.emoji),
                    h.span.children(workspace.name),
                  ),
                  CollapsibleTrigger(
                    collapsible,
                    SidebarMenuAction(h, {
                      showOnHover: true,
                      class:
                        "left-2 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90",
                    }),
                  ).children(ChevronRightIcon(h)),
                  SidebarMenuAction(h, { showOnHover: true }).children(PlusIcon(h)),
                  CollapsibleContent(collapsible, h.div)?.children(
                    SidebarMenuSub(h).children(
                      ...workspace.pages.map((page) =>
                        SidebarMenuSubItem(h)
                          .key(page.name)
                          .children(
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
