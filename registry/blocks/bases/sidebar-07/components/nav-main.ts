/**
 * NavMain — from the upstream bases block `sidebar-07`
 * (`registry/bases/radix/blocks/sidebar-07/components/nav-main.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * A view function: the provider's parts come first (the block-wide
 * convention; this piece reads nothing from them), then the caller's
 * `h`, then the data. Upstream's
 * `icon?: ReactNode` field is an icon *builder* reference here,
 * called at render as `item.icon(h)`.
 *
 * Declared divergences:
 *
 * - The kit Collapsible's open state is the consumer's (it lives in a
 *   Model); this block is an example composition whose host Page owns
 *   no collapsible state, so each item is drawn at upstream's initial
 *   state (`open: item.isActive`, from upstream's `defaultOpen`) and
 *   its events are no-ops. Wire `open` / `onEmit` to a Model in a
 *   real app.
 * - Upstream's `Collapsible asChild` stacks the collapsible onto the
 *   `SidebarMenuItem`; the kit root renders its own element, so the
 *   root is a <div> wearing upstream's `group/collapsible` class
 *   around the item (the sidebar-15 calendars composition).
 * - Upstream's `CollapsibleTrigger asChild` becomes the kit trigger
 *   part applied directly to the `SidebarMenuButton` builder — the
 *   kit's own part-stacking composition.
 * - `SidebarMenuButton`'s `tooltip` prop is NOT reproduced (the
 *   sidebar port's header, item 4): the kit Tooltip is a controlled
 *   Component with no drop-in equivalent.
 * - Upstream's `SidebarMenuSubButton asChild` needs no stacking: the
 *   port's sub-button is itself an <a> and takes `href` directly.
 * - Upstream's `ChevronRightIcon` is the shared `ChevronRightIcon`.
 */
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.ts";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { ChevronRightIcon, type IconOptions } from "@/lib/icons";

/** An icon builder reference (lucide glyph), called at render with the caller's `h`. */
export type NavMainIcon = <Msg>(h: Html.H<Msg>, options?: IconOptions) => View.Content<Msg>;

export interface NavMainItem {
  readonly title: string;
  readonly url: string;
  readonly icon?: NavMainIcon | undefined;
  readonly isActive?: boolean | undefined;
  readonly items?: ReadonlyArray<{ readonly title: string; readonly url: string }> | undefined;
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
            collapsible
              .root(h.div)
              .class("group/collapsible")
              .children(
                SidebarMenuItem(h).children(
                  CollapsibleTrigger(collapsible, SidebarMenuButton(h)).children(
                    item.icon?.(h),
                    h.span.children(item.title),
                    ChevronRightIcon(h, {
                      class:
                        "ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90",
                    }),
                  ),
                  CollapsibleContent(collapsible, h.div)?.children(
                    SidebarMenuSub(h).children(
                      ...(item.items ?? []).map((subItem) =>
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
                ),
              ),
        }),
      ),
    ),
  );
