/**
 * NavSecondary — shadcn/ui block `dashboard-01`
 * (`registry/new-york-v4/blocks/dashboard-01/components/nav-secondary.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a React component spreading its props onto a `SidebarGroup`
 * and rendering one `SidebarMenuButton asChild` (an `<a href>`) per
 * item. Here: a view function; the spread props reduce to the one the
 * block passes, `class` (AppSidebar passes `mt-auto`). Icons are Tabler
 * (`@tabler/icons-react`); the builders below carry the Tabler path data
 * (MIT) via this repo's `icon()` helper.
 *
 * Declared divergences (anything else is a bug):
 *
 * - The `asChild` anchor is NOT reproduced: the sidebar port's
 *   `SidebarMenuButton` is always a `<button>` (D-2), so the item `url`
 *   is carried in the data but draws no link — the same stance as the
 *   other sidebar blocks.
 * - Upstream's item `icon` is a Tabler component reference; the data
 *   carries the Tabler icon name and this file maps names to builders.
 */
import type * as Html from "@effect/ui/html/Html";
import * as Schema from "effect/Schema";
import { icon, type IconOptions } from "@/lib/icons";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.ts";

/** Tabler `settings` (MIT). */
export const SettingsIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z",
        },
      ],
      ["path", { d: "M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" }],
    ],
    options,
  );

/** Tabler `help` (MIT). */
export const HelpIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" }],
      ["path", { d: "M12 17l0 .01" }],
      ["path", { d: "M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4" }],
    ],
    options,
  );

/** Tabler `search` (MIT). */
export const SearchIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" }],
      ["path", { d: "M21 21l-6 -6" }],
    ],
    options,
  );

const navIcons: Readonly<Record<string, typeof SettingsIcon>> = {
  settings: SettingsIcon,
  help: HelpIcon,
  search: SearchIcon,
};

export const NavSecondaryProps = Schema.Struct({
  items: Schema.Array(
    Schema.Struct({
      title: Schema.String,
      url: Schema.String,
      icon: Schema.String,
    }),
  ),
});

export const NavSecondary = <Msg>(
  h: Html.H<Msg>,
  options: {
    props: typeof NavSecondaryProps.Type;
    readonly class?: string | undefined;
  },
) =>
  SidebarGroup(h, { class: options.class }).children(
    SidebarGroupContent(h).children(
      SidebarMenu(h).children(
        options.props.items.map((item) => {
          const Icon = navIcons[item.icon];
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
