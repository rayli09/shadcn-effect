/**
 * NavMain — from the upstream bases block `sidebar-08`
 * (`registry/bases/radix/blocks/sidebar-08/components/nav-main.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * A view function: the provider's parts come first (the block-wide
 * convention; this piece reads nothing from them), then the caller's
 * `h`, then the data. Upstream's `icon: ReactNode` field is an icon
 * *builder* reference here, called at render as `item.icon(h)`.
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
 *   root is a plain <div> around the item.
 * - Upstream's `CollapsibleTrigger asChild` becomes the kit trigger
 *   part applied directly to the `SidebarMenuAction` builder — the
 *   kit's own part-stacking composition.
 * - `SidebarMenuButton asChild` around an <a> (D-2): the port's
 *   `SidebarMenuButton` always renders a <button>, so the rows are
 *   drawn by `SidebarMenuLink` below, which stacks the menu button's
 *   variants and `data-*` stamps on an `h.a` — exactly the stamps
 *   `SidebarMenuButton` itself writes, on the anchor upstream
 *   rendered. Its `tooltip` prop is NOT reproduced (the sidebar
 *   port's header, item 4).
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
  SidebarMenuAction,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  sidebarMenuButtonVariants,
  type SidebarMenuButtonSize,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { ChevronRightIcon, type IconOptions } from "@/lib/icons";

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
export type NavMainIcon = <Msg>(h: Html.H<Msg>, options?: IconOptions) => View.Content<Msg>;

export interface NavMainItem {
  readonly title: string;
  readonly url: string;
  readonly icon: NavMainIcon;
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
            collapsible.root(h.div).children(
              SidebarMenuItem(h).children(
                SidebarMenuLink(h, { href: item.url }, item.icon(h), h.span.children(item.title)),
                item.items?.length
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
            ),
        }),
      ),
    ),
  );
