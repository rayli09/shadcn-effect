/**
 * TeamSwitcher — from the upstream bases block `sidebar-07`
 * (`registry/bases/radix/blocks/sidebar-07/components/team-switcher.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream's `React.useState(teams[0])` becomes this Component's Model
 * (`activeTeamIndex`, seeded at 0 in `init`); picking a team is the
 * kit Menu's `Picked` event, mapped to the `Selected` message. The
 * menu's open state is likewise the Component's (`Opened` / `Closed`
 * from the Menu's `RequestedOpen` / `RequestedClose`), as every kit
 * Menu consumer owns it. Upstream's `useSidebar()` becomes the kit's
 * shared-state read (`reads: { sidebar: SidebarProvider }`): the
 * content's `side` is `h.reads.sidebar.isMobile ? "bottom" : "right"`,
 * exactly upstream's expression.
 *
 * Declared divergences:
 *
 * - Upstream's `DropdownMenuTrigger asChild` (D-2): the trigger is the
 *   port's `SidebarMenuButton` builder stacked as the Menu trigger's
 *   `element` — the documented composition in the dropdown-menu port.
 *   Content `align` / `sideOffset` are Positioning props on the kit
 *   Menu call, not on the content part.
 * - A team's `logo` is an icon *builder* reference in the data
 *   (upstream: a ReactNode); it crosses this Component's props as an
 *   opaque value (`Schema.Any` — a function is not schema data) and
 *   is called at render, `logo(h)`, exactly where upstream rendered
 *   the node.
 * - Upstream returns `null` when there is no active team; a Component
 *   view returns one node, so an empty `teams` list renders an empty
 *   `SidebarMenu` instead. The sample data always passes teams.
 * - Icons: `ChevronsUpDownIcon` and `PlusIcon` are LOCAL builders over
 *   the shared `icon()` helper, nodes copied verbatim from lucide's
 *   SVGs (ISC).
 */
import * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.ts";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar.ts";
import { icon, type IconOptions } from "@/lib/icons";

/** Lucide `chevrons-up-down` (ISC). */
const ChevronsUpDownIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m7 15 5 5 5-5" }],
      ["path", { d: "m7 9 5-5 5 5" }],
    ],
    options,
  );

/** Lucide `plus` (ISC). */
const PlusIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M5 12h14" }],
      ["path", { d: "M12 5v14" }],
    ],
    options,
  );

/** An icon builder reference (lucide glyph), called at render with the caller's `h`. */
export type TeamLogo = <Msg>(h: Html.H<Msg>, options?: IconOptions) => View.Content<Msg>;

export interface Team {
  readonly name: string;
  readonly logo: TeamLogo;
  readonly plan: string;
}

export const TeamSwitcherProps = Schema.Struct({
  teams: Schema.Array(
    Schema.Struct({
      name: Schema.String,
      logo: Schema.Any,
      plan: Schema.String,
    }),
  ),
});
export type TeamSwitcherProps = typeof TeamSwitcherProps.Type;

export const TeamSwitcherMessage = UiSchema.TaggedEnum({
  /** The kit Menu asked to open. */
  Opened: {},
  /** The kit Menu asked to close. */
  Closed: {},
  /** A team item was picked (upstream's item `onClick`). */
  Selected: { value: Schema.String },
});

export const TeamSwitcher = Html.component({
  name: "Sidebar07TeamSwitcher",
  props: TeamSwitcherProps,
  model: Schema.Struct({
    open: Schema.Boolean,
    activeTeamIndex: Schema.Number,
  }),
  message: TeamSwitcherMessage,
  reads: { sidebar: SidebarProvider },
}).make({
  init: () => ({ open: false, activeTeamIndex: 0 }),
  update: {
    Opened: ($) => $.evolve({ open: true }),
    Closed: ($) => $.evolve({ open: false }),
    Selected: ($, { value }) => {
      const index = $.props.teams.findIndex((team) => team.name === value);
      return index >= 0
        ? $.evolve({ activeTeamIndex: index, open: false })
        : $.evolve({ open: false });
    },
  },
  view: (h, model) => {
    const teams = h.props.teams;
    const activeTeam = teams[model.activeTeamIndex] ?? teams[0];
    if (activeTeam === undefined) {
      return SidebarMenu(h);
    }
    const activeLogo = activeTeam.logo as TeamLogo;
    const isMobile = h.reads.sidebar.isMobile;
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
            side: isMobile ? "bottom" : "right",
            sideOffset: 4,
          },
          onEmit: {
            RequestedOpen: () => TeamSwitcherMessage.Opened(),
            RequestedClose: () => TeamSwitcherMessage.Closed(),
            Picked: ({ value }) => TeamSwitcherMessage.Selected({ value }),
            Highlighted: () => undefined,
            RequestedQuery: () => undefined,
            Settled: () => undefined,
          },
          view: (menu) =>
            h.div(
              DropdownMenuTrigger(menu, h, {
                element: SidebarMenuButton(h, {
                  size: "lg",
                  class:
                    "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                }),
              }).children(
                h.div
                  .class(
                    "flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground",
                  )
                  .children(activeLogo(h)),
                h.div
                  .class("grid flex-1 text-left text-sm leading-tight")
                  .children(
                    h.span.class("truncate font-medium").children(activeTeam.name),
                    h.span.class("truncate text-xs").children(activeTeam.plan),
                  ),
                ChevronsUpDownIcon(h, { class: "ml-auto" }),
              ),
              DropdownMenuContent(menu, h, { class: "w-fit" }).children(
                DropdownMenuLabel(menu, h, {
                  class: "text-xs text-muted-foreground",
                }).children("Teams"),
                ...teams.map((team, index) => {
                  const logo = team.logo as TeamLogo;
                  return DropdownMenuItem(menu, h, {
                    value: team.name,
                    class: "gap-2 p-2",
                  }).children(
                    h.div
                      .class("flex size-6 items-center justify-center rounded-md border")
                      .children(logo(h)),
                    team.name,
                    DropdownMenuShortcut(h).children(`⌘${index + 1}`),
                  );
                }),
                DropdownMenuSeparator(menu, h),
                DropdownMenuItem(menu, h, { value: "add-team", class: "gap-2 p-2" }).children(
                  h.div
                    .class(
                      "flex size-6 items-center justify-center rounded-md border bg-transparent",
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
