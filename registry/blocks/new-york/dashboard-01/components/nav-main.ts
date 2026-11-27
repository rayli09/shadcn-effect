/**
 * NavMain — shadcn/ui block `dashboard-01`
 * (`registry/new-york-v4/blocks/dashboard-01/components/nav-main.tsx`),
 * ported 1:1 to Effect UI. Class strings and the item shape are verbatim
 * from the source.
 *
 * Upstream: a React component rendering the "Quick Create" row (a
 * primary `SidebarMenuButton` + an outline inbox `Button`) above one
 * `SidebarMenuButton` per item. Here: a view function. Dashboard-01's
 * icons are Tabler icons (`@tabler/icons-react`), not lucide; the
 * builders below carry the Tabler path data (MIT) in the same
 * `[tag, attrs]` node shape this repo's `icon()` helper consumes, with
 * Tabler's outline base attributes (fill none, stroke currentColor,
 * stroke-width 2, round caps/joins — identical to the helper's).
 *
 * Declared divergences (anything else is a bug):
 *
 * - `SidebarMenuButton`'s `tooltip` prop ("Quick Create", and one per
 *   item title) is NOT reproduced — the sidebar port does not implement
 *   it (its own declared gap, noted in every sidebar block).
 * - Upstream's item `icon` is a Tabler component reference; component
 *   references cannot be Schema props here, so the data carries the
 *   Tabler icon name and this file maps names to builders.
 * - `IconCirclePlusFilled` is a Tabler *filled* icon: it renders with
 *   `fill: currentColor; stroke: none` (Tabler's filled defaults), so
 *   it is built by the local `filledIcon` helper, not `icon()`.
 */
import type * as Html from "@effect/ui/html/Html";
import * as Schema from "effect/Schema";
import { icon, type IconOptions } from "@/lib/icons";
import { Button } from "@/components/ui/button.ts";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.ts";

type IconNode = readonly [tag: string, attrs: Readonly<Record<string, string>>];

/** A Tabler *filled* glyph: Tabler's filled base attrs around `nodes`. */
const filledIcon = <Msg>(h: Html.H<Msg>, nodes: ReadonlyArray<IconNode>, options: IconOptions = {}) =>
  h
    .el("svg")
    .attrs({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      stroke: "none",
      "aria-hidden": "true",
      ...(options.class !== undefined ? { class: options.class } : {}),
    })
    .children(nodes.map(([tag, attrs], index) => h.el(tag).key(String(index)).attrs(attrs)));

/** Tabler `dashboard` (MIT). */
export const DashboardIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 13m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" }],
      ["path", { d: "M13.45 11.55l2.05 -2.05" }],
      ["path", { d: "M6.4 20a9 9 0 1 1 11.2 0z" }],
    ],
    options,
  );

/** Tabler `list-details` (MIT). */
export const ListDetailsIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M13 5h8" }],
      ["path", { d: "M13 9h5" }],
      ["path", { d: "M13 15h8" }],
      ["path", { d: "M13 19h5" }],
      [
        "path",
        {
          d: "M3 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z",
        },
      ],
      [
        "path",
        {
          d: "M3 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z",
        },
      ],
    ],
    options,
  );

/** Tabler `chart-bar` (MIT). */
export const ChartBarIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" }],
      ["path", { d: "M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" }],
      ["path", { d: "M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" }],
      ["path", { d: "M4 20h14" }],
    ],
    options,
  );

/** Tabler `folder` (MIT). */
export const FolderIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2",
        },
      ],
    ],
    options,
  );

/** Tabler `users` (MIT). */
export const UsersIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" }],
      ["path", { d: "M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" }],
      ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75" }],
      ["path", { d: "M21 21v-2a4 4 0 0 0 -3 -3.85" }],
    ],
    options,
  );

/** Tabler `circle-plus-filled` (MIT, filled). */
export const CirclePlusFilledIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  filledIcon(
    h,
    [
      [
        "path",
        {
          d: "M4.929 4.929a10 10 0 1 1 14.141 14.141a10 10 0 0 1 -14.14 -14.14zm8.071 4.071a1 1 0 1 0 -2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0 -2h-2v-2z",
        },
      ],
    ],
    options,
  );

/** Tabler `mail` (MIT). */
export const MailIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" }],
      ["path", { d: "M3 7l9 6l9 -6" }],
    ],
    options,
  );

const navIcons: Readonly<Record<string, typeof DashboardIcon>> = {
  dashboard: DashboardIcon,
  "list-details": ListDetailsIcon,
  "chart-bar": ChartBarIcon,
  folder: FolderIcon,
  users: UsersIcon,
};

export const NavMainProps = Schema.Struct({
  items: Schema.Array(
    Schema.Struct({
      title: Schema.String,
      url: Schema.String,
      icon: Schema.optional(Schema.String),
    }),
  ),
});

export const NavMain = <Msg>(h: Html.H<Msg>, options: { props: typeof NavMainProps.Type }) =>
  SidebarGroup(h).children(
    SidebarGroupContent(h, { class: "flex flex-col gap-2" }).children(
      SidebarMenu(h).children(
        SidebarMenuItem(h, { class: "flex items-center gap-2" }).children(
          SidebarMenuButton(h, {
            class:
              "min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground",
          }).children(CirclePlusFilledIcon(h), h.span.children("Quick Create")),
          Button(h, {
            size: "icon",
            variant: "outline",
            class: "size-8 group-data-[collapsible=icon]:opacity-0",
          }).children(MailIcon(h), h.span.class("sr-only").children("Inbox")),
        ),
      ),
      SidebarMenu(h).children(
        options.props.items.map((item) => {
          const Icon = item.icon === undefined ? undefined : navIcons[item.icon];
          return SidebarMenuItem(h).children(
            SidebarMenuButton(h).children(
              Icon === undefined ? undefined : Icon(h),
              h.span.children(item.title),
            ),
          );
        }),
      ),
    ),
  );
