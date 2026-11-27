/**
 * NavSecondary — shadcn/ui block `sidebar-10`
 * (`registry/new-york-v4/blocks/sidebar-10/components/nav-secondary.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a stateless React component spreading the `SidebarGroup`
 * props (in practice `className`) onto the group, with an optional
 * `badge` per item rendered as a `SidebarMenuBadge`. Here: a view
 * function taking the items and the group's `class` as an options
 * object; the badge is a plain string.
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
 *   builders below — `settings-2`, `blocks`, `trash-2` and
 *   `message-circle-question` are not in `@/lib/icons`; they are
 *   defined from the lucide-react 1.69 path data, ISC, via the lib's
 *   `icon()` helper. `calendar` is the lib's `CalendarIcon`.)
 */
import type * as Html from "@effect/ui/html/Html";
import { CalendarIcon, icon, type IconOptions } from "@/lib/icons";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.ts";

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

/** Lucide `blocks` (ISC). */
export const BlocksIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2",
        },
      ],
      ["rect", { x: "14", y: "2", width: "8", height: "8", rx: "1" }],
    ],
    options,
  );

/** Lucide `trash-2` (ISC). */
export const Trash2Icon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10 11v6" }],
      ["path", { d: "M14 11v6" }],
      ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }],
      ["path", { d: "M3 6h18" }],
      ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }],
    ],
    options,
  );

/** Lucide `message-circle-question` (ISC). */
export const MessageCircleQuestionIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
        },
      ],
      ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }],
      ["path", { d: "M12 17h.01" }],
    ],
    options,
  );

const navIcons: Readonly<Record<string, typeof CalendarIcon>> = {
  calendar: CalendarIcon,
  "settings-2": Settings2Icon,
  blocks: BlocksIcon,
  "trash-2": Trash2Icon,
  "message-circle-question": MessageCircleQuestionIcon,
};

export const NavSecondary = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly items: ReadonlyArray<{
      title: string;
      url: string;
      icon: string;
      badge?: string | undefined;
    }>;
    readonly class?: string | undefined;
  },
) =>
  SidebarGroup(h, { class: options.class }).children(
    SidebarGroupContent(h).children(
      SidebarMenu(h).children(
        options.items.map((item) => {
          const Icon = navIcons[item.icon] ?? CalendarIcon;
          return SidebarMenuItem(h).children(
            SidebarMenuButton(h).children(Icon(h), h.span.children(item.title)),
            item.badge === undefined ? undefined : SidebarMenuBadge(h).children(item.badge),
          );
        }),
      ),
    ),
  );
