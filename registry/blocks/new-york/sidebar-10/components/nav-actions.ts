/**
 * NavActions — shadcn/ui block `sidebar-10`
 * (`registry/new-york-v4/blocks/sidebar-10/components/nav-actions.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source;
 * the sample data below is upstream's, verbatim except that `icon`
 * component references become lucide icon names (this file maps the
 * names back to builders).
 *
 * Upstream: a React component whose popover starts closed and is
 * opened by a `useEffect` on mount. Here: an `Html.component` whose
 * Model initialises `open: true` — the effect's end state, without the
 * mount-time flip. The kit Popover is controlled, so open/close arrive
 * as Messages.
 *
 * Declared divergences (anything else is a bug):
 *
 * - The popover content nests a `Sidebar` with `collapsible="none"`.
 *   That branch of the sidebar port uses no provider parts (it renders
 *   a plain `div` with `SIDEBAR_NONE_CLASS`), so it is reproduced
 *   directly here — a component cannot reach the provider's parts,
 *   which only exist inside the provider's view closure.
 * - The popover trigger is upstream's ghost icon `Button`; the kit
 *   Popover's trigger part takes an element builder, so the trigger is
 *   a plain `<button>` carrying the button port's `buttonVariants`
 *   classes (the standalone Star button uses the `Button` port itself).
 * - Local icon builders: `ArrowUpIcon`, `BellIcon`, `CopyIcon`,
 *   `CornerUpLeftIcon`, `CornerUpRightIcon`, `FileTextIcon`,
 *   `GalleryVerticalEndIcon`, `LineChartIcon`, `LinkIcon`,
 *   `Settings2Icon`, `StarIcon`, `TrashIcon` and `Trash2Icon` are not
 *   in `@/lib/icons`; they are defined in this file from the
 *   lucide-react 1.69 path data (ISC) via the lib's `icon()` helper.
 *   (`arrow-down` is the lib's `ArrowDownIcon`.)
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { ArrowDownIcon, EllipsisIcon, icon, type IconOptions } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button.ts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.ts";
import {
  SIDEBAR_NONE_CLASS,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.ts";

/** Lucide `arrow-up` (ISC). */
export const ArrowUpIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m5 12 7-7 7 7" }],
      ["path", { d: "M12 19V5" }],
    ],
    options,
  );

/** Lucide `bell` (ISC). */
export const BellIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0" }],
      [
        "path",
        {
          d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
        },
      ],
    ],
    options,
  );

/** Lucide `copy` (ISC). */
export const CopyIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }],
      ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }],
    ],
    options,
  );

/** Lucide `corner-up-left` (ISC). */
export const CornerUpLeftIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M20 20v-7a4 4 0 0 0-4-4H4" }],
      ["path", { d: "M9 14 4 9l5-5" }],
    ],
    options,
  );

/** Lucide `corner-up-right` (ISC). */
export const CornerUpRightIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m15 14 5-5-5-5" }],
      ["path", { d: "M4 20v-7a4 4 0 0 1 4-4h12" }],
    ],
    options,
  );

/** Lucide `file-text` (ISC). */
export const FileTextIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
        },
      ],
      ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5" }],
      ["path", { d: "M10 9H8" }],
      ["path", { d: "M16 13H8" }],
      ["path", { d: "M16 17H8" }],
    ],
    options,
  );

/** Lucide `gallery-vertical-end` (ISC). */
export const GalleryVerticalEndIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M7 2h10" }],
      ["path", { d: "M5 6h14" }],
      ["rect", { width: "18", height: "12", x: "3", y: "10", rx: "2" }],
    ],
    options,
  );

/** Lucide `line-chart` (ISC; the package's current name for it is `chart-line`). */
export const LineChartIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16" }],
      ["path", { d: "m19 9-5 5-4-4-3 3" }],
    ],
    options,
  );

/** Lucide `link` (ISC). */
export const LinkIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }],
      ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" }],
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

/** Lucide `star` (ISC). */
export const StarIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
        },
      ],
    ],
    options,
  );

/** Lucide `trash` (ISC). */
export const TrashIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
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

const actionIcons: Readonly<Record<string, typeof StarIcon>> = {
  "settings-2": Settings2Icon,
  "file-text": FileTextIcon,
  link: LinkIcon,
  copy: CopyIcon,
  "corner-up-right": CornerUpRightIcon,
  "trash-2": Trash2Icon,
  "corner-up-left": CornerUpLeftIcon,
  "line-chart": LineChartIcon,
  "gallery-vertical-end": GalleryVerticalEndIcon,
  trash: TrashIcon,
  bell: BellIcon,
  "arrow-up": ArrowUpIcon,
  "arrow-down": ArrowDownIcon,
};

const data = [
  [
    {
      label: "Customize Page",
      icon: "settings-2",
    },
    {
      label: "Turn into wiki",
      icon: "file-text",
    },
  ],
  [
    {
      label: "Copy Link",
      icon: "link",
    },
    {
      label: "Duplicate",
      icon: "copy",
    },
    {
      label: "Move to",
      icon: "corner-up-right",
    },
    {
      label: "Move to Trash",
      icon: "trash-2",
    },
  ],
  [
    {
      label: "Undo",
      icon: "corner-up-left",
    },
    {
      label: "View analytics",
      icon: "line-chart",
    },
    {
      label: "Version History",
      icon: "gallery-vertical-end",
    },
    {
      label: "Show delete pages",
      icon: "trash",
    },
    {
      label: "Notifications",
      icon: "bell",
    },
  ],
  [
    {
      label: "Import",
      icon: "arrow-up",
    },
    {
      label: "Export",
      icon: "arrow-down",
    },
  ],
];

export const NavActionsMessage = UiSchema.TaggedEnum({
  PopoverOpened: {},
  PopoverClosed: {},
});

export const NavActions = Html.component({
  name: "NavActions",
  model: Schema.Struct({ open: Schema.Boolean }),
  message: NavActionsMessage,
}).make({
  // Upstream opens the popover from a mount effect; the Model starts
  // in the effect's end state.
  init: () => ({ open: true }),
  update: {
    PopoverOpened: ($) => $.evolve({ open: true }),
    PopoverClosed: ($) => $.evolve({ open: false }),
  },
  view: (h, model) =>
    h.div.class("flex items-center gap-2 text-sm").children(
      h.div
        .class("hidden font-medium text-muted-foreground md:inline-block")
        .children("Edit Oct 08"),
      Button(h, { variant: "ghost", size: "icon", class: "h-7 w-7" }).children(StarIcon(h)),
      Popover(h, {
        props: { open: model.open, align: "end" },
        onEmit: {
          RequestedOpen: () => NavActionsMessage.PopoverOpened(),
          RequestedClose: () => NavActionsMessage.PopoverClosed(),
          Settled: () => undefined,
        },
        view: (popover) =>
          h.div.children(
            PopoverTrigger(
              popover.trigger({
                element: h.button.class(
                  buttonVariants({
                    variant: "ghost",
                    size: "icon",
                    class: "h-7 w-7 data-[state=open]:bg-accent",
                  }),
                ),
              }),
            ).children(EllipsisIcon(h)),
            popover.portal(h.dialog)?.children(
              popover.positioner(h.div).children(
                PopoverContent(popover.popup(h.div), {
                  class: "w-56 overflow-hidden rounded-lg p-0",
                }).children(
                  // Upstream's nested `<Sidebar collapsible="none">`:
                  // the port's none branch renders exactly this div.
                  h.div
                    .attr("data-slot", "sidebar")
                    .class(cn(SIDEBAR_NONE_CLASS, "bg-transparent"))
                    .children(
                      SidebarContent(h).children(
                        data.map((group) =>
                          SidebarGroup(h, { class: "border-b last:border-none" }).children(
                            SidebarGroupContent(h, { class: "gap-0" }).children(
                              SidebarMenu(h).children(
                                group.map((item) => {
                                  const Icon = actionIcons[item.icon] ?? StarIcon;
                                  return SidebarMenuItem(h).children(
                                    SidebarMenuButton(h).children(
                                      Icon(h),
                                      h.span.children(item.label),
                                    ),
                                  );
                                }),
                              ),
                            ),
                          ),
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
