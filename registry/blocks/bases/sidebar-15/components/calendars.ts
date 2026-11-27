/**
 * Calendars (sidebar-15 block) — upstream
 * `registry/bases/radix/blocks/sidebar-15/components/calendars.tsx`
 * ported to Effect UI. A view function: the provider's parts come first,
 * then the caller's `h`, then the data. Upstream returns a fragment of
 * (group, separator) pairs; here the function returns the flattened
 * array, which the caller's `.children(...)` accepts as one input.
 *
 * Declared divergences:
 * - The kit Collapsible's open state is the consumer's (it lives in a
 *   Model); this block is an example composition whose host Page owns no
 *   collapsible state, so each group is drawn at upstream's initial
 *   state (`open: index === 0`, from upstream's `defaultOpen`) and its
 *   events are no-ops. Wire `open` / `onEmit` to a Model in a real app.
 * - D-2: upstream's `SidebarGroupLabel asChild` stacks the label onto
 *   the CollapsibleTrigger's <button>. The kit trigger part only takes a
 *   <button> builder (the sidebar port's own group label always renders
 *   a <div>), so the trigger button is stamped with the label's
 *   `data-slot` / `data-sidebar` and wears `SIDEBAR_GROUP_LABEL_CLASS`
 *   plus upstream's label classes verbatim — the same bridge the
 *   sidebar-02 block uses for its group labels.
 */
import type * as Html from "@effect/ui/html/Html";
import { CheckIcon, ChevronRightIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.ts";
import {
  SIDEBAR_GROUP_LABEL_CLASS,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";

export interface CalendarsGroup {
  readonly name: string;
  readonly items: ReadonlyArray<string>;
}

export const Calendars = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: { readonly calendars: ReadonlyArray<CalendarsGroup> },
) =>
  options.calendars.flatMap((calendar, index) => [
    SidebarGroup(h).children(
      Collapsible(h, {
        key: calendar.name,
        props: { open: index === 0 },
        onEmit: {
          Toggled: () => undefined,
          Settled: () => undefined,
        },
        view: (collapsible) =>
          collapsible
            .root(h.div)
            .class("group/collapsible")
            .children(
              CollapsibleTrigger(
                collapsible,
                h.button
                  .attrs({
                    "data-slot": "sidebar-group-label",
                    "data-sidebar": "group-label",
                  })
                  .class(
                    cn(
                      SIDEBAR_GROUP_LABEL_CLASS,
                      "group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    ),
                  ),
              ).children(
                calendar.name,
                " ",
                ChevronRightIcon(h, {
                  class:
                    "ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90",
                }),
              ),
              CollapsibleContent(collapsible, h.div)?.children(
                SidebarGroupContent(h).children(
                  SidebarMenu(h).children(
                    ...calendar.items.map((item, itemIndex) =>
                      SidebarMenuItem(h)
                        .key(item)
                        .children(
                          SidebarMenuButton(h).children(
                            h.div
                              .attr("data-active", String(itemIndex < 2))
                              .class(
                                "group/calendar-item flex aspect-square size-4 shrink-0 items-center justify-center rounded-xs border border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary",
                              )
                              .children(
                                CheckIcon(h, {
                                  class:
                                    "hidden size-3 group-data-[active=true]/calendar-item:block",
                                }),
                              ),
                            item,
                          ),
                        ),
                    ),
                  ),
                ),
              ),
            ),
      }),
    ),
    SidebarSeparator(h, { class: "mx-0" }),
  ]);
