/**
 * SiteHeader — shadcn/ui block `sidebar-16`
 * (`registry/new-york-v4/blocks/sidebar-16/components/site-header.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a React component reading `toggleSidebar` from the sidebar
 * context. Here: a view function taking the `SidebarProvider` parts and
 * the caller's `h`; the toggle button is the provider's `toggle` part
 * (the same wiring the port's `SidebarTrigger` uses), and lucide's
 * `Sidebar` icon is its `panel-left` alias, the lib's `PanelLeftIcon`.
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
      Separator(h, { orientation: "vertical", class: "mr-2 h-4" }),
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
