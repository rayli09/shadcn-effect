/**
 * NavSecondary — shadcn/ui block `sidebar-16`
 * (`registry/new-york-v4/blocks/sidebar-16/components/nav-secondary.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a stateless React component spreading the `SidebarGroup`
 * props (in practice `className`) onto the group. Here: a view function
 * taking the items and the group's `class` as an options object.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's buttons wrap an `<a href>` via `asChild`; the sidebar
 *   port's `SidebarMenuButton` is always a `<button>` (the port's D-2),
 *   so the icon + title render directly in the button and the sample
 *   `url`s stay in the data, unused.
 * - Upstream's item `icon` is a React component reference; component
 *   references cannot travel as data here, so the data carries the
 *   lucide icon name and this file maps names to builders (the local
 *   builders below — neither is in `@/lib/icons`; they are defined from
 *   the lucide-react 1.69 path data, ISC, via the lib's `icon()`
 *   helper).
 */
import type * as Html from "@effect/ui/html/Html";
import { icon, type IconOptions } from "@/lib/icons";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.ts";

/** Lucide `life-buoy` (ISC). */
export const LifeBuoyIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["path", { d: "m4.93 4.93 4.24 4.24" }],
      ["path", { d: "m14.83 9.17 4.24-4.24" }],
      ["path", { d: "m14.83 14.83 4.24 4.24" }],
      ["path", { d: "m9.17 14.83-4.24 4.24" }],
      ["circle", { cx: "12", cy: "12", r: "4" }],
    ],
    options,
  );

/** Lucide `send` (ISC). */
export const SendIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
        },
      ],
      ["path", { d: "m21.854 2.147-10.94 10.939" }],
    ],
    options,
  );

const navIcons: Readonly<Record<string, typeof LifeBuoyIcon>> = {
  "life-buoy": LifeBuoyIcon,
  send: SendIcon,
};

export const NavSecondary = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly items: ReadonlyArray<{ title: string; url: string; icon: string }>;
    readonly class?: string | undefined;
  },
) =>
  SidebarGroup(h, { class: options.class }).children(
    SidebarGroupContent(h).children(
      SidebarMenu(h).children(
        options.items.map((item) => {
          const Icon = navIcons[item.icon] ?? LifeBuoyIcon;
          return SidebarMenuItem(h).children(
            SidebarMenuButton(h, { size: "sm" }).children(Icon(h), h.span.children(item.title)),
          );
        }),
      ),
    ),
  );
