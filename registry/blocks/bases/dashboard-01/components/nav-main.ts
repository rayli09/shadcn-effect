/**
 * NavMain — from the upstream bases block `dashboard-01`
 * (`registry/bases/radix/blocks/dashboard-01/components/nav-main.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Pairs with the `base-*` ui items (see site-header.ts's header).
 *
 * A view function: the provider's parts come first (the block-wide
 * convention; this piece reads nothing from them), then the caller's
 * `h`, then the data. Upstream's `icon?: ReactNode` field is an icon
 * *builder* reference here, called at render as `item.icon(h)`.
 * Upstream's `IconPlaceholder` names the lucide glyph; the builders
 * below are that glyph (see the icon note).
 *
 * Declared divergences:
 *
 * - `SidebarMenuButton`'s `tooltip` prop is NOT reproduced (the
 *   sidebar port's rule): the kit Tooltip is a controlled Component
 *   with no drop-in equivalent. Upstream sets `tooltip="Quick Create"`
 *   on the first button and `tooltip={item.title}` on the item
 *   buttons; neither is drawn.
 * - Upstream's item buttons are plain buttons (no `asChild`), and
 *   their `url` field goes unused in the source; both are kept as-is.
 * - Icons: `CirclePlusIcon` and `MailIcon` are LOCAL builders over
 *   the shared `icon()` helper, nodes copied verbatim from lucide's
 *   SVGs (ISC): circle-plus, mail.
 */
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import { Button } from "@/components/ui/button.ts";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { icon, type IconOptions } from "@/lib/icons";

/** Lucide `circle-plus` (ISC). */
const CirclePlusIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["path", { d: "M8 12h8" }],
      ["path", { d: "M12 8v8" }],
    ],
    options,
  );

/** Lucide `mail` (ISC). */
const MailIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" }],
      ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2" }],
    ],
    options,
  );

/** An icon builder reference (lucide glyph), called at render with the caller's `h`. */
export type NavMainIcon = <Msg>(h: Html.H<Msg>, options?: IconOptions) => View.Content<Msg>;

export interface NavMainItem {
  readonly title: string;
  readonly url: string;
  readonly icon?: NavMainIcon | undefined;
}

export const NavMain = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: { readonly items: ReadonlyArray<NavMainItem> },
) =>
  SidebarGroup(h).children(
    SidebarGroupContent(h, { class: "flex flex-col gap-2" }).children(
      SidebarMenu(h).children(
        SidebarMenuItem(h, { class: "flex items-center gap-2" }).children(
          SidebarMenuButton(h, {
            class:
              "min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground",
          }).children(CirclePlusIcon(h), h.span.children("Quick Create")),
          Button(h, {
            size: "icon",
            variant: "outline",
            class: "size-8 group-data-[collapsible=icon]:opacity-0",
          }).children(MailIcon(h), h.span.class("sr-only").children("Inbox")),
        ),
      ),
      SidebarMenu(h).children(
        ...options.items.map((item) =>
          SidebarMenuItem(h)
            .key(item.title)
            .children(SidebarMenuButton(h).children(item.icon?.(h), h.span.children(item.title))),
        ),
      ),
    ),
  );
