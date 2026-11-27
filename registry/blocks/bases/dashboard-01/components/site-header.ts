/**
 * SiteHeader — from the upstream bases block `dashboard-01`
 * (`registry/bases/radix/blocks/dashboard-01/components/site-header.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Pairs with the `base-*` ui items: the imports below say
 * `@/components/ui/<x>` because the bases items install to the same
 * paths as the new-york ones — the class layer inside them is the
 * bases `cn-*` hook layer, styled by a `style-*` preset.
 *
 * A view function: the provider's parts come first (the block-wide
 * convention — the trigger is one of its parts), then the caller's
 * `h`. Upstream's `h-(--header-height)` reads the `--header-height`
 * variable the page stamps on the provider's wrapper (see page.ts).
 */
import type * as Html from "@effect/ui/html/Html";
import { Separator } from "@/components/ui/separator.ts";
import { SidebarTrigger, type SidebarProviderParts } from "@/components/ui/sidebar.ts";

export const SiteHeader = <Msg>(sidebar: SidebarProviderParts, h: Html.H<Msg>) =>
  h.header
    .class(
      "flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
    )
    .children(
      h.div
        .class("flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6")
        .children(
          SidebarTrigger(sidebar, h, { class: "-ml-1" }),
          Separator(h, { orientation: "vertical", class: "mx-2 data-[orientation=vertical]:h-4" }),
          h.h1.class("text-base font-medium").children("Documents"),
        ),
    );
