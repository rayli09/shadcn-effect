/**
 * NavMain — shadcn/ui block `sidebar-08`
 * (`registry/new-york-v4/blocks/sidebar-08/components/nav-main.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a React component rendering one Radix `Collapsible`
 * (`defaultOpen={item.isActive}`) per nav item, the collapsible root
 * merged into the `SidebarMenuItem` via `asChild`; the toggle is a
 * separate `SidebarMenuAction` chevron. Here: a view function drawing
 * one `NavMainItem` component per item — the kit Collapsible is
 * controlled, so the open state lives in that component's Model,
 * initialised from the item's `isActive`.
 *
 * Declared divergences (anything else is a bug):
 *
 * - `SidebarMenuButton`'s `tooltip` prop is NOT reproduced — the
 *   sidebar port does not implement it (its own declared gap).
 * - Upstream's item button wraps an `<a href>` via `asChild`; the
 *   sidebar port's `SidebarMenuButton` is always a `<button>` (the
 *   port's D-2). `SidebarMenuSubButton` keeps upstream's real anchors.
 * - Upstream's item `icon` is a React component reference; component
 *   references cannot be Schema props here, so the data carries the
 *   lucide icon name and this file maps names to builders (the local
 *   builders below — none of them are in `@/lib/icons`; they are
 *   defined from the lucide-react 1.69 path data, ISC, via the lib's
 *   `icon()` helper).
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { ChevronRightIcon, icon, type IconOptions } from "@/lib/icons";
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
} from "@/components/ui/sidebar.ts";

/** Lucide `square-terminal` (ISC). */
export const SquareTerminalIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m7 11 2-2-2-2" }],
      ["path", { d: "M11 13h4" }],
      ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }],
    ],
    options,
  );

/** Lucide `bot` (ISC). */
export const BotIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 8V4H8" }],
      ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2" }],
      ["path", { d: "M2 14h2" }],
      ["path", { d: "M20 14h2" }],
      ["path", { d: "M15 13v2" }],
      ["path", { d: "M9 13v2" }],
    ],
    options,
  );

/** Lucide `book-open` (ISC). */
export const BookOpenIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 5v16" }],
      [
        "path",
        {
          d: "M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z",
        },
      ],
    ],
    options,
  );

/** Lucide `settings-2` (ISC). */
export const Settings2Icon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M14 17H5" }],
      ["path", { d: "M19 7h-9" }],
      ["circle", { cx: "17", cy: "17", r: "3" }],
      ["circle", { cx: "7", cy: "7", r: "3" }],
    ],
    options,
  );

const navIcons: Readonly<Record<string, typeof SquareTerminalIcon>> = {
  "square-terminal": SquareTerminalIcon,
  bot: BotIcon,
  "book-open": BookOpenIcon,
  "settings-2": Settings2Icon,
};

export const NavMainItemProps = Schema.Struct({
  title: Schema.String,
  icon: Schema.String,
  isActive: Schema.optional(Schema.Boolean),
  items: Schema.optional(Schema.Array(Schema.Struct({ title: Schema.String, url: Schema.String }))),
});

export const NavMainItemMessage = UiSchema.TaggedEnum({
  Toggled: { open: Schema.Boolean },
});

export const NavMainItem = Html.component({
  name: "NavMainItem",
  props: NavMainItemProps,
  model: Schema.Struct({ open: Schema.Boolean }),
  message: NavMainItemMessage,
}).make({
  init: ({ props }) => ({ open: props.isActive ?? false }),
  update: {
    Toggled: ($, { open }) => $.evolve({ open }),
  },
  view: (h, model) => {
    const Icon = navIcons[h.props.icon] ?? SquareTerminalIcon;
    const subItems = h.props.items ?? [];
    return Collapsible(h, {
      props: { open: model.open },
      onEmit: {
        Toggled: ({ open }) => NavMainItemMessage.Toggled({ open }),
        Settled: () => undefined,
      },
      view: (collapsible) =>
        collapsible
          .root(SidebarMenuItem(h))
          .children(
            SidebarMenuButton(h).children(Icon(h), h.span.children(h.props.title)),
            subItems.length > 0
              ? CollapsibleTrigger(
                  collapsible,
                  SidebarMenuAction(h, { class: "data-[state=open]:rotate-90" }),
                ).children(ChevronRightIcon(h), h.span.class("sr-only").children("Toggle"))
              : undefined,
            subItems.length > 0
              ? CollapsibleContent(collapsible, h.div)?.children(
                  SidebarMenuSub(h).children(
                    subItems.map((subItem) =>
                      SidebarMenuSubItem(h).children(
                        SidebarMenuSubButton(h, { href: subItem.url }).children(
                          h.span.children(subItem.title),
                        ),
                      ),
                    ),
                  ),
                )
              : undefined,
          ),
    });
  },
});

export const NavMainProps = Schema.Struct({
  items: Schema.Array(
    Schema.Struct({
      title: Schema.String,
      url: Schema.String,
      icon: Schema.String,
      isActive: Schema.optional(Schema.Boolean),
      items: Schema.optional(
        Schema.Array(Schema.Struct({ title: Schema.String, url: Schema.String })),
      ),
    }),
  ),
});

export const NavMain = <Msg>(h: Html.H<Msg>, options: { props: typeof NavMainProps.Type }) =>
  SidebarGroup(h).children(
    SidebarGroupLabel(h).children("Platform"),
    SidebarMenu(h).children(
      options.props.items.map((item) =>
        NavMainItem(h, {
          key: item.title,
          props: {
            title: item.title,
            icon: item.icon,
            isActive: item.isActive,
            items: item.items,
          },
        }),
      ),
    ),
  );
