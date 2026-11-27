/**
 * TeamSwitcher (sidebar-10 block) — upstream
 * `registry/bases/radix/blocks/sidebar-10/components/team-switcher.tsx`
 * ported to Effect UI.
 *
 * Upstream's `React.useState(teams[0])` becomes this Component's Model
 * (`activeTeam`, seeded from the first team's name in `init`); picking a
 * team is the kit Menu's `Picked` event, mapped to the `Selected`
 * message. The menu's open state is likewise the Component's (`Opened` /
 * `Closed` from the Menu's `RequestedOpen` / `RequestedClose`), as every
 * kit Menu consumer owns it.
 *
 * Declared divergences:
 * - The `teams` prop travels through the Component's Schema props, so
 *   the `logo` field — an icon *builder* reference, not data — is
 *   carried as `Schema.Unknown` and read back as the `TeamLogo` builder
 *   type at render (called with the caller's `h`: `team.logo(h)`).
 * - Upstream renders nothing when there is no active team; here an
 *   empty `teams` array renders an empty `SidebarMenu` (a Component's
 *   view cannot return nothing).
 * - Upstream's `DropdownMenuTrigger asChild` (D-2): the trigger is the
 *   port's `SidebarMenuButton` builder stacked as the Menu trigger's
 *   `element` — the documented composition in the dropdown-menu port.
 * - Upstream's content `align="start"` / `side="bottom"` /
 *   `sideOffset={4}` are Positioning props on the kit Menu call, not on
 *   the content part.
 * - Icons: `PlusIcon` below is a LOCAL builder over the shared `icon()`
 *   helper, nodes copied verbatim from lucide's `plus` SVG (ISC).
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import type * as View from "@effect/ui/View";
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
      logo: Schema.Unknown,
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
  Selected: { name: Schema.String },
});

export const TeamSwitcher = Html.component({
  name: "Sidebar10TeamSwitcher",
  props: TeamSwitcherProps,
  model: Schema.Struct({
    open: Schema.Boolean,
    activeTeam: Schema.String,
  }),
  message: TeamSwitcherMessage,
}).make({
  init: ({ props }) => ({
    open: false,
    activeTeam: props.teams[0]?.name ?? "",
  }),
  update: {
    Opened: ($) => $.evolve({ open: true }),
    Closed: ($) => $.evolve({ open: false }),
    Selected: ($, { name }) =>
      $.props.teams.some((team) => team.name === name)
        ? $.evolve({ activeTeam: name, open: false })
        : $.evolve({ open: false }),
  },
  view: (h, model) => {
    const activeTeam = h.props.teams.find((team) => team.name === model.activeTeam);
    if (activeTeam === undefined) {
      return SidebarMenu(h);
    }
    const activeLogo = activeTeam.logo as TeamLogo;
    return SidebarMenu(h).children(
      SidebarMenuItem(h).children(
        DropdownMenu(h, {
          props: {
            open: model.open,
            items: [
              ...h.props.teams.map((team) => ({ value: team.name, label: team.name })),
              { value: "add-team", label: "Add team" },
            ],
            align: "start",
            side: "bottom",
            sideOffset: 4,
          },
          onEmit: {
            RequestedOpen: () => TeamSwitcherMessage.Opened(),
            RequestedClose: () => TeamSwitcherMessage.Closed(),
            Picked: ({ value }) => TeamSwitcherMessage.Selected({ name: value }),
            Highlighted: () => undefined,
            RequestedQuery: () => undefined,
            Settled: () => undefined,
          },
          view: (menu) =>
            h.div(
              DropdownMenuTrigger(menu, h, {
                element: SidebarMenuButton(h, { class: "w-fit px-1.5" }),
              }).children(
                h.div
                  .class(
                    "flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground",
                  )
                  .children(activeLogo(h)),
                h.span.class("truncate font-medium").children(activeTeam.name),
                ChevronDownIcon(h, { class: "opacity-50" }),
              ),
              DropdownMenuContent(menu, h, { class: "w-64 rounded-lg" }).children(
                DropdownMenuLabel(menu, h, {
                  class: "text-xs text-muted-foreground",
                }).children("Teams"),
                ...h.props.teams.map((team, index) =>
                  DropdownMenuItem(menu, h, { value: team.name, class: "gap-2 p-2" }).children(
                    h.div
                      .class("flex size-6 items-center justify-center rounded-xs border")
                      .children((team.logo as TeamLogo)(h)),
                    team.name,
                    DropdownMenuShortcut(h).children(`⌘${index + 1}`),
                  ),
                ),
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
