/**
 * SiteHeader — shadcn/ui block `dashboard-01`
 * (`registry/new-york-v4/blocks/dashboard-01/components/site-header.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a stateless React function rendering the page header (the
 * sidebar trigger, a separator, the "Documents" title, and a GitHub
 * button). Here: a view function taking the `SidebarProvider` parts —
 * the trigger needs them — and the caller's `h`.
 *
 * Declared divergence: the GitHub `Button` is `asChild` upstream, i.e.
 * an `<a>` wearing the button's classes plus its own
 * `dark:text-foreground`. There is no Slot here (D-2), so the anchor is
 * drawn directly with `buttonVariants({ variant: "ghost", size: "sm" })`,
 * the upstream `className` ("hidden sm:flex"), the anchor's own class,
 * and the button's data attributes.
 */
import type * as Component from "@effect/ui/Component";
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import { buttonVariants } from "@/components/ui/button.ts";
import { Separator } from "@/components/ui/separator.ts";
import { SidebarProvider, SidebarTrigger, type SidebarProviderParts } from "@/components/ui/sidebar.ts";
import { cn } from "@/lib/utils";

export const SiteHeader = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
): View.Content<Msg, Component.Shared.Of<typeof SidebarProvider>> =>
  h.header
    .class(
      "flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
    )
    .children(
      h.div
        .class("flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6")
        .children(
          SidebarTrigger(sidebar, h, { class: "-ml-1" }),
          Separator(h, {
            orientation: "vertical",
            class: "mx-2 data-[orientation=vertical]:h-4",
          }),
          h.h1.class("text-base font-medium").children("Documents"),
          h.div
            .class("ml-auto flex items-center gap-2")
            .children(
              h.a
                .attrs({
                  "data-slot": "button",
                  "data-variant": "ghost",
                  "data-size": "sm",
                  href: "https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard",
                  rel: "noopener noreferrer",
                  target: "_blank",
                })
                .class(
                  cn(
                    buttonVariants({ variant: "ghost", size: "sm", class: "hidden sm:flex" }),
                    "dark:text-foreground",
                  ),
                )
                .children("GitHub"),
            ),
        ),
    );
