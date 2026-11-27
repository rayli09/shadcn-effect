/**
 * TeamSwitcher (sidebar-15 block) — upstream
 * `registry/bases/radix/blocks/sidebar-15/components/team-switcher.tsx`
 * ported to Effect UI. A view function: the provider's parts come first,
 * then the caller's `h`, then the data — upstream's props, with `logo`
 * holding an icon *builder* reference instead of ReactNode JSX (called
 * at render: `team.logo(h)`).
 *
 * Declared divergences:
 * - Upstream holds the active team in `useState` (initial: `teams[0]`)
 *   and the kit Menu's open state is likewise the consumer's; this block
 *   is an example composition whose host Page owns neither, so the
 *   switcher is drawn at upstream's initial state (first team active,
 *   menu closed) and menu picks are no-ops. Wire them to a Model in a
 *   real app.
 * - Upstream renders nothing when there is no active team; here the
 *   function returns `undefined` for an empty `teams` array, the same
 *   empty render.
 * - Icons: `PlusIcon` below is a LOCAL builder over the shared `icon()`
 *   helper, nodes copied verbatim from lucide's `plus` SVG (ISC).
 */
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";

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

export const TeamSwitcher = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: { readonly teams: ReadonlyArray<Team> },
) => {
  const activeTeam = options.teams[0];
  if (activeTeam === undefined) {
    return undefined;
  }
  return SidebarMenu(h).children(
    SidebarMenuItem(h).children(
      DropdownMenu(h, {
        props: {
          open: false,
          items: [
            ...options.teams.map((team) => ({ value: team.name, label: team.name })),
            { value: "add-team", label: "Add team" },
          ],
          align: "start",
          side: "bottom",
          sideOffset: 4,
        },
        onEmit: {
          RequestedOpen: () => undefined,
          RequestedClose: () => undefined,
          Picked: () => undefined,
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
                .children(activeTeam.logo(h)),
              h.span.class("truncate font-medium").children(activeTeam.name),
              ChevronDownIcon(h, { class: "opacity-50" }),
            ),
            DropdownMenuContent(menu, h, { class: "w-64 rounded-lg" }).children(
              DropdownMenuLabel(menu, h, {
                class: "text-xs text-muted-foreground",
              }).children("Teams"),
              ...options.teams.map((team, index) =>
                DropdownMenuItem(menu, h, { value: team.name, class: "gap-2 p-2" }).children(
                  h.div
                    .class("flex size-6 items-center justify-center rounded-xs border")
                    .children(team.logo(h)),
                  team.name,
                  DropdownMenuShortcut(h).children(`⌘${index + 1}`),
                ),
              ),
              DropdownMenuSeparator(menu, h),
              DropdownMenuItem(menu, h, { value: "add-team", class: "gap-2 p-2" }).children(
                h.div
                  .class("flex size-6 items-center justify-center rounded-md border bg-background")
                  .children(PlusIcon(h, { class: "size-4" })),
                h.div.class("font-medium text-muted-foreground").children("Add team"),
              ),
            ),
          ),
      }),
    ),
  );
};
