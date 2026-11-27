/**
 * TeamSwitcher — shadcn/ui block `sidebar-10`
 * (`registry/new-york-v4/blocks/sidebar-10/components/team-switcher.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a React component holding `activeTeam` in `useState`. Here:
 * an `Html.component` — the active team and the dropdown's open state
 * live in the Model (the kit Menu is controlled).
 *
 * Upstream's team `logo` is a React component reference; component
 * references cannot be Schema props here, so the data carries the
 * lucide icon name and this file maps names to builders (the local
 * builders below — none of them are in `@/lib/icons`; they are defined
 * from the lucide-react 1.69 path data, ISC, via the lib's `icon()`
 * helper).
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as View from "@effect/ui/View";
import * as Schema from "effect/Schema";
import { ChevronDownIcon, icon, type IconOptions } from "@/lib/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.ts";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar.ts";

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

/** Lucide `audio-waveform` (ISC). */
export const AudioWaveformIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2",
        },
      ],
    ],
    options,
  );

/** Lucide `command` (ISC). */
export const CommandIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [["path", { d: "M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" }]],
    options,
  );

/** Lucide `plus` (ISC). */
export const PlusIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M5 12h14" }],
      ["path", { d: "M12 5v14" }],
    ],
    options,
  );

const teamLogos: Readonly<Record<string, typeof GalleryVerticalEndIcon>> = {
  "gallery-vertical-end": GalleryVerticalEndIcon,
  "audio-waveform": AudioWaveformIcon,
  command: CommandIcon,
};

export const TeamSwitcherProps = Schema.Struct({
  teams: Schema.Array(
    Schema.Struct({ name: Schema.String, logo: Schema.String, plan: Schema.String }),
  ),
});

export const TeamSwitcherMessage = UiSchema.TaggedEnum({
  MenuOpened: {},
  MenuClosed: {},
  TeamSelected: { name: Schema.String },
});

export const TeamSwitcher = Html.component({
  name: "TeamSwitcher",
  props: TeamSwitcherProps,
  model: Schema.Struct({ open: Schema.Boolean, activeTeam: Schema.String }),
  message: TeamSwitcherMessage,
}).make({
  init: ({ props }) => ({ open: false, activeTeam: props.teams[0]?.name ?? "" }),
  update: {
    MenuOpened: ($) => $.evolve({ open: true }),
    MenuClosed: ($) => $.evolve({ open: false }),
    TeamSelected: ($, { name }) => $.evolve({ activeTeam: name, open: false }),
  },
  view: (h, model) => {
    const teams = h.props.teams;
    const activeTeam = teams.find((team) => team.name === model.activeTeam) ?? teams[0];
    if (activeTeam === undefined) {
      // Upstream returns null when there is no active team.
      return View.text("");
    }
    const ActiveLogo = teamLogos[activeTeam.logo] ?? GalleryVerticalEndIcon;
    return SidebarMenu(h).children(
      SidebarMenuItem(h).children(
        DropdownMenu(h, {
          props: {
            open: model.open,
            items: [
              ...teams.map((team) => ({ value: team.name, label: team.name })),
              { value: "add-team", label: "Add team" },
            ],
            align: "start",
            side: "bottom",
            sideOffset: 4,
          },
          onEmit: {
            RequestedOpen: () => TeamSwitcherMessage.MenuOpened(),
            RequestedClose: () => TeamSwitcherMessage.MenuClosed(),
            Picked: ({ value }) =>
              value === "add-team"
                ? TeamSwitcherMessage.MenuClosed()
                : TeamSwitcherMessage.TeamSelected({ name: value }),
            Highlighted: () => undefined,
            RequestedQuery: () => undefined,
            Settled: () => undefined,
          },
          view: (menu) =>
            h.div.children(
              DropdownMenuTrigger(menu, h, {
                element: SidebarMenuButton(h, { class: "w-fit px-1.5" }),
              }).children(
                h.div
                  .class(
                    "flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground",
                  )
                  .children(ActiveLogo(h, { class: "size-3" })),
                h.span.class("truncate font-medium").children(activeTeam.name),
                ChevronDownIcon(h, { class: "opacity-50" }),
              ),
              DropdownMenuContent(menu, h, { class: "w-64 rounded-lg" }).children(
                DropdownMenuLabel(menu, h, { class: "text-xs text-muted-foreground" }).children(
                  "Teams",
                ),
                teams.map((team, index) => {
                  const Logo = teamLogos[team.logo] ?? GalleryVerticalEndIcon;
                  return DropdownMenuItem(menu, h, {
                    value: team.name,
                    class: "gap-2 p-2",
                  }).children(
                    h.div
                      .class("flex size-6 items-center justify-center rounded-xs border")
                      .children(Logo(h, { class: "size-4 shrink-0" })),
                    team.name,
                    DropdownMenuShortcut(h).children(`⌘${index + 1}`),
                  );
                }),
                DropdownMenuSeparator(menu, h),
                DropdownMenuItem(menu, h, { value: "add-team", class: "gap-2 p-2" }).children(
                  h.div
                    .class(
                      "flex size-6 items-center justify-center rounded-md border bg-background",
                    )
                    .children(PlusIcon(h, { class: "size-4" })),
                  h.div.class("font-medium text-muted-foreground").children("Add team"),
                ),
              ),
            ),
        }),
      ),
    );
  },
});
