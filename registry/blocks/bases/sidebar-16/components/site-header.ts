/**
 * SiteHeader (sidebar-16 block) — upstream
 * `registry/bases/radix/blocks/sidebar-16/components/site-header.tsx`
 * ported to Effect UI. A view function: the provider's parts come first
 * (the `useSidebar()` replacement — upstream destructures
 * `toggleSidebar` from it), then the caller's `h`. Class strings are
 * verbatim from the source.
 *
 * Declared divergence: upstream's toggle is a plain ghost icon `Button`
 * whose `onClick` is the context's `toggleSidebar`. Here the press IS
 * the toggle (the sidebar port's rule 7): the provider's `toggle` part
 * is stacked as the Button's `element` — the D-2 composition — so the
 * rendered button keeps upstream's Button anatomy (data-slot, variant
 * and size attributes, `h-8 w-8` class) and clicking it sends the
 * provider's `Toggled`.
 */
import type * as Html from "@effect/ui/html/Html";
import { PanelLeftIcon } from "@/lib/icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.ts";
import { Button } from "@/components/ui/button.ts";
import { Separator } from "@/components/ui/separator.ts";
import type { SidebarProviderParts } from "@/components/ui/sidebar.ts";
import { SearchForm } from "./search-form.ts";

export const SiteHeader = <Msg>(sidebar: SidebarProviderParts, h: Html.H<Msg>) =>
  h.header.class("sticky top-0 z-50 flex w-full items-center border-b bg-background").children(
    h.div.class("flex h-(--header-height) w-full items-center gap-2 px-4").children(
      Button(h, {
        element: sidebar.toggle(h.button),
        variant: "ghost",
        size: "icon",
        class: "h-8 w-8",
      }).children(PanelLeftIcon(h)),
      Separator(h, {
        orientation: "vertical",
        class: "mr-2 data-vertical:h-4 data-vertical:self-auto",
      }),
      Breadcrumb(h, { class: "hidden sm:block" }).children(
        BreadcrumbList(h).children(
          BreadcrumbItem(h).children(
            BreadcrumbLink(h).attr("href", "#").children("Build Your Application"),
          ),
          BreadcrumbSeparator(h),
          BreadcrumbItem(h).children(BreadcrumbPage(h).children("Data Fetching")),
        ),
      ),
      SearchForm(h, { props: { class: "w-full sm:ml-auto sm:w-auto" } }),
    ),
  );
