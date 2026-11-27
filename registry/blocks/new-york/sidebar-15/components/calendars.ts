/**
 * Calendars — shadcn/ui block `sidebar-15`
 * (`registry/new-york-v4/blocks/sidebar-15/components/calendars.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a stateless React component rendering one Radix
 * `Collapsible` per calendar group (only the first `defaultOpen`),
 * each group followed by a separator. Here: a view function drawing
 * one `CalendarGroup` component per group — the kit Collapsible is
 * controlled, so the open state lives in that component's Model,
 * initialised from the `defaultOpen` prop.
 *
 * Declared divergence: upstream's group trigger is a
 * `SidebarGroupLabel` (`<div>`) merged into the Radix trigger via
 * `asChild`. The kit's trigger part is button-typed, so the trigger
 * here is a `<button>` carrying the label's classes (the sidebar
 * port's `SIDEBAR_GROUP_LABEL_CLASS` + upstream's label `className`)
 * and its `data-sidebar` attribute.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
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
} from "@/components/ui/sidebar.ts";

export const CalendarGroupProps = Schema.Struct({
  name: Schema.String,
  items: Schema.Array(Schema.String),
  defaultOpen: Schema.Boolean,
});

export const CalendarGroupMessage = UiSchema.TaggedEnum({
  Toggled: { open: Schema.Boolean },
});

export const CalendarGroup = Html.component({
  name: "CalendarGroup",
  props: CalendarGroupProps,
  model: Schema.Struct({ open: Schema.Boolean }),
  message: CalendarGroupMessage,
}).make({
  init: ({ props }) => ({ open: props.defaultOpen }),
  update: {
    Toggled: ($, { open }) => $.evolve({ open }),
  },
  view: (h, model) =>
    SidebarGroup(h, { class: "py-0" }).children(
      Collapsible(h, {
        props: { open: model.open },
        onEmit: {
          Toggled: ({ open }) => CalendarGroupMessage.Toggled({ open }),
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
                  .attr("data-sidebar", "group-label")
                  .class(
                    cn(
                      SIDEBAR_GROUP_LABEL_CLASS,
                      "group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    ),
                  ),
              ).children(
                `${h.props.name} `,
                ChevronRightIcon(h, {
                  class:
                    "ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90",
                }),
              ),
              CollapsibleContent(collapsible, h.div)?.children(
                SidebarGroupContent(h).children(
                  SidebarMenu(h).children(
                    h.props.items.map((item, index) =>
                      SidebarMenuItem(h).children(
                        SidebarMenuButton(h).children(
                          h.div
                            .attr("data-active", String(index < 2))
                            .class(
                              "group/calendar-item flex aspect-square size-4 shrink-0 items-center justify-center rounded-xs border border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary",
                            )
                            .children(
                              CheckIcon(h, {
                                class: "hidden size-3 group-data-[active=true]/calendar-item:block",
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
});

export const Calendars = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly calendars: ReadonlyArray<{ name: string; items: ReadonlyArray<string> }>;
  },
) =>
  options.calendars.flatMap((calendar, index) => [
    CalendarGroup(h, {
      key: calendar.name,
      props: { name: calendar.name, items: [...calendar.items], defaultOpen: index === 0 },
    }),
    SidebarSeparator(h, { class: "mx-0" }),
  ]);
