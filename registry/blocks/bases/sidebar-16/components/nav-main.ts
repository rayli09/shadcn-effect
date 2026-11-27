/**
 * NavMain (sidebar-16 block) — upstream
 * `registry/bases/radix/blocks/sidebar-16/components/nav-main.tsx`
 * ported to Effect UI. A view function: the provider's parts come first,
 * then the caller's `h`, then the data — upstream's props, with `icon`
 * holding an icon *builder* reference instead of ReactNode JSX (called
 * at render: `item.icon(h)`).
 *
 * Declared divergences:
 * - The kit Collapsible's open state is the consumer's (it lives in a
 *   Model); this block is an example composition whose host Page owns no
 *   collapsible state, so each item is drawn at upstream's initial state
 *   (`open: item.isActive ?? false`, from upstream's `defaultOpen`) and
 *   its events are no-ops. Wire `open` / `onEmit` to a Model in a real
 *   app.
 * - D-2: upstream's `Collapsible asChild` stacks the root onto the
 *   `SidebarMenuItem` <li>; here the root part is applied directly to
 *   the `SidebarMenuItem` builder — the kit's own part-stacking
 *   composition. Upstream's `SidebarMenuButton asChild` /
 *   `SidebarMenuSubButton asChild` links collapse onto the buttons
 *   themselves; `url`s are carried in the data but not rendered as
 *   hrefs (the sub-button IS an anchor in this port, so its `href` is
 *   rendered).
 * - `SidebarMenuButton`'s upstream `tooltip={item.title}` prop is NOT
 *   reproduced — the sidebar port does not reproduce `tooltip` (see its
 *   header, item 4).
 */
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import { ChevronRightIcon, type IconOptions } from "@/lib/icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.ts";
import {
  SidebarGroup,
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

/** An icon builder reference (lucide glyph), called at render with the caller's `h`. */
export type NavMainIcon = <Msg>(h: Html.H<Msg>, options?: IconOptions) => View.Content<Msg>;

export interface NavMainItem {
  readonly title: string;
  readonly url: string;
  readonly icon: NavMainIcon;
  readonly isActive?: boolean | undefined;
  readonly items?:
    | ReadonlyArray<{
        readonly title: string;
        readonly url: string;
      }>
    | undefined;
}

export const NavMain = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: { readonly items: ReadonlyArray<NavMainItem> },
) =>
  SidebarGroup(h).children(
    SidebarGroupLabel(h).children("Platform"),
    SidebarMenu(h).children(
      ...options.items.map((item) =>
        Collapsible(h, {
          key: item.title,
          props: { open: item.isActive ?? false },
          onEmit: {
            Toggled: () => undefined,
            Settled: () => undefined,
          },
          view: (collapsible) =>
            collapsible.root(SidebarMenuItem(h)).children(
              SidebarMenuButton(h).children(item.icon(h), h.span.children(item.title)),
              item.items !== undefined && item.items.length > 0
                ? [
                    CollapsibleTrigger(
                      collapsible,
                      SidebarMenuAction(h, { class: "data-[state=open]:rotate-90" }),
                    ).children(ChevronRightIcon(h), h.span.class("sr-only").children("Toggle")),
                    CollapsibleContent(collapsible, h.div)?.children(
                      SidebarMenuSub(h).children(
                        ...item.items.map((subItem) =>
                          SidebarMenuSubItem(h)
                            .key(subItem.title)
                            .children(
                              SidebarMenuSubButton(h, { href: subItem.url }).children(
                                h.span.children(subItem.title),
                              ),
                            ),
                        ),
                      ),
                    ),
                  ]
                : undefined,
            ),
        }),
      ),
    ),
  );
