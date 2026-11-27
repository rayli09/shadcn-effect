/**
 * NavActions (sidebar-10 block) — upstream
 * `registry/bases/radix/blocks/sidebar-10/components/nav-actions.tsx`
 * ported to Effect UI.
 *
 * State: upstream holds the Popover's open state in `useState(false)`
 * and flips it to `true` in a mount `useEffect` — the popover opens on
 * mount. Here the open state is this Component's Model, and the mount
 * effect is the `OpenOnMount` Command issued from `init` (a Command
 * whose whole job is to report `Opened` back, the Effect-native shape
 * of a mount effect with no other work). The Popover's
 * `RequestedOpen` / `RequestedClose` map to the same two messages, as
 * every kit Popover consumer owns `open`.
 *
 * Declared divergences:
 * - The kit Popover's `view` returns a single node, so the trigger and
 *   the content are grouped in a plain <div> inside it (the composition
 *   the date-picker port uses); upstream's Radix Popover renders no
 *   wrapper.
 * - The Popover's content hosts a `Sidebar collapsible="none"`. That
 *   piece's whole render is one <div> (the sidebar port's none branch),
 *   and a Component's view cannot receive the provider's parts, so the
 *   div is drawn directly from the port's exported `SIDEBAR_NONE_CLASS`
 *   constant plus upstream's `bg-transparent` — the same DOM the port's
 *   `Sidebar` renders for `collapsible="none"`.
 * - Icons: the glyphs below are LOCAL builders over the shared `icon()`
 *   helper, nodes copied verbatim from lucide's SVGs (ISC): settings-2,
 *   file-text, link, copy, corner-up-right, trash-2, corner-up-left,
 *   chart-line, gallery-vertical-end, trash, bell, arrow-up, star.
 *   Upstream's `ArrowDownIcon` and `MoreHorizontalIcon` are the shared
 *   `ArrowDownIcon` / `EllipsisIcon`.
 */
import * as Command from "@effect/ui/Command";
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import { ArrowDownIcon, EllipsisIcon, icon, type IconOptions } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button.ts";
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

/** Lucide `settings-2` (ISC). */
const Settings2Icon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M20 7h-9" }],
      ["path", { d: "M14 17H5" }],
      ["circle", { cx: "17", cy: "17", r: "3" }],
      ["circle", { cx: "7", cy: "7", r: "3" }],
    ],
    options,
  );

/** Lucide `file-text` (ISC). */
const FileTextIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }],
      ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4" }],
      ["path", { d: "M10 9H8" }],
      ["path", { d: "M16 13H8" }],
      ["path", { d: "M16 17H8" }],
    ],
    options,
  );

/** Lucide `link` (ISC). */
const LinkIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }],
      ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" }],
    ],
    options,
  );

/** Lucide `copy` (ISC). */
const CopyIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }],
      ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }],
    ],
    options,
  );

/** Lucide `corner-up-right` (ISC). */
const CornerUpRightIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["polyline", { points: "15 14 20 9 15 4" }],
      ["path", { d: "M4 20v-7a4 4 0 0 1 4-4h12" }],
    ],
    options,
  );

/** Lucide `trash-2` (ISC). */
const Trash2Icon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M3 6h18" }],
      ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }],
      ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }],
      ["line", { x1: "10", x2: "10", y1: "11", y2: "17" }],
      ["line", { x1: "14", x2: "14", y1: "11", y2: "17" }],
    ],
    options,
  );

/** Lucide `corner-up-left` (ISC). */
const CornerUpLeftIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["polyline", { points: "9 14 4 9 9 4" }],
      ["path", { d: "M20 20v-7a4 4 0 0 0-4-4H4" }],
    ],
    options,
  );

/** Lucide `chart-line` (ISC). */
const ChartLineIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16" }],
      ["path", { d: "m19 9-5 5-4-4-3 3" }],
    ],
    options,
  );

/** Lucide `gallery-vertical-end` (ISC). */
const GalleryVerticalEndIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M7 2h10" }],
      ["path", { d: "M5 6h14" }],
      ["rect", { width: "18", height: "12", x: "3", y: "10", rx: "2" }],
    ],
    options,
  );

/** Lucide `trash` (ISC). */
const TrashIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M3 6h18" }],
      ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }],
      ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }],
    ],
    options,
  );

/** Lucide `bell` (ISC). */
const BellIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
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

/** Lucide `arrow-up` (ISC). */
const ArrowUpIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m5 12 7-7 7 7" }],
      ["path", { d: "M12 19V5" }],
    ],
    options,
  );

/** Lucide `star` (ISC). */
const StarIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
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

const data = [
  [
    {
      label: "Customize Page",
      icon: Settings2Icon,
    },
    {
      label: "Turn into wiki",
      icon: FileTextIcon,
    },
  ],
  [
    {
      label: "Copy Link",
      icon: LinkIcon,
    },
    {
      label: "Duplicate",
      icon: CopyIcon,
    },
    {
      label: "Move to",
      icon: CornerUpRightIcon,
    },
    {
      label: "Move to Trash",
      icon: Trash2Icon,
    },
  ],
  [
    {
      label: "Undo",
      icon: CornerUpLeftIcon,
    },
    {
      label: "View analytics",
      icon: ChartLineIcon,
    },
    {
      label: "Version History",
      icon: GalleryVerticalEndIcon,
    },
    {
      label: "Show delete pages",
      icon: TrashIcon,
    },
    {
      label: "Notifications",
      icon: BellIcon,
    },
  ],
  [
    {
      label: "Import",
      icon: ArrowUpIcon,
    },
    {
      label: "Export",
      icon: ArrowDownIcon,
    },
  ],
];

export const NavActionsMessage = UiSchema.TaggedEnum({
  /** The Popover asked to open (or the mount effect fired). */
  Opened: {},
  /** The Popover asked to close. */
  Closed: {},
});
type NavActionsMessage = typeof NavActionsMessage.Type;

/** Upstream's mount `useEffect(() => setIsOpen(true), [])`, as a Command issued from `init`. */
const OpenOnMount = Command.make("Sidebar10NavActions/OpenOnMount", { args: {} }, () =>
  Effect.succeed(NavActionsMessage.Opened() as NavActionsMessage),
);

export const NavActions = Html.component({
  name: "Sidebar10NavActions",
  model: Schema.Struct({ open: Schema.Boolean }),
  message: NavActionsMessage,
}).make({
  init: ($) => $.set({ open: false }).run(OpenOnMount.make()),
  update: {
    Opened: ($) => $.evolve({ open: true }),
    Closed: ($) => $.evolve({ open: false }),
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
          RequestedOpen: () => NavActionsMessage.Opened(),
          RequestedClose: () => NavActionsMessage.Closed(),
          Settled: () => undefined,
        },
        view: (popover) =>
          h.div.children(
            PopoverTrigger(
              popover.trigger({
                element: Button(h, {
                  variant: "ghost",
                  size: "icon",
                  class: "h-7 w-7 data-[state=open]:bg-accent",
                }),
              }),
            ).children(EllipsisIcon(h)),
            PopoverContent(popover.popup(h.div), {
              class: "w-56 overflow-hidden rounded-lg p-0",
            }).children(
              h.div
                .attr("data-slot", "sidebar")
                .class(cn(SIDEBAR_NONE_CLASS, "bg-transparent"))
                .children(
                  SidebarContent(h).children(
                    ...data.map((group, groupIndex) =>
                      SidebarGroup(h, { class: "border-b last:border-none" })
                        .key(String(groupIndex))
                        .children(
                          SidebarGroupContent(h, { class: "gap-0" }).children(
                            SidebarMenu(h).children(
                              ...group.map((item, itemIndex) =>
                                SidebarMenuItem(h)
                                  .key(String(itemIndex))
                                  .children(
                                    SidebarMenuButton(h).children(
                                      item.icon(h),
                                      h.span.children(item.label),
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
          ),
      }),
    ),
});
