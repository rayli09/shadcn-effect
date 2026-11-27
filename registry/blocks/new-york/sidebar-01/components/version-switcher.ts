/**
 * VersionSwitcher — shadcn/ui block `sidebar-01`
 * (`registry/new-york-v4/blocks/sidebar-01/components/version-switcher.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a React component holding `selectedVersion` in `useState`,
 * rendered inside a `SidebarMenu`. Here: an `Html.component` — the
 * selected version and the dropdown's open state live in the Model (the
 * kit Menu is controlled), and picks arrive as Messages. The versions
 * list arrives as props, as upstream's props did.
 *
 * Local icon builders: `GalleryVerticalEndIcon` and `ChevronsUpDownIcon`
 * are not in `@/lib/icons`; they are defined in this file from the
 * lucide-react 1.69 path data (ISC) via the lib's `icon()` helper.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { CheckIcon, icon, type IconOptions } from "@/lib/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

/** Lucide `chevrons-up-down` (ISC). */
export const ChevronsUpDownIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m7 15 5 5 5-5" }],
      ["path", { d: "m7 9 5-5 5 5" }],
    ],
    options,
  );

export const VersionSwitcherProps = Schema.Struct({
  versions: Schema.Array(Schema.String),
  defaultVersion: Schema.String,
});

export const VersionSwitcherMessage = UiSchema.TaggedEnum({
  MenuOpened: {},
  MenuClosed: {},
  VersionSelected: { version: Schema.String },
});

export const VersionSwitcher = Html.component({
  name: "VersionSwitcher",
  props: VersionSwitcherProps,
  model: Schema.Struct({ open: Schema.Boolean, selectedVersion: Schema.String }),
  message: VersionSwitcherMessage,
}).make({
  init: ({ props }) => ({ open: false, selectedVersion: props.defaultVersion }),
  update: {
    MenuOpened: ($) => $.evolve({ open: true }),
    MenuClosed: ($) => $.evolve({ open: false }),
    VersionSelected: ($, { version }) => $.evolve({ selectedVersion: version, open: false }),
  },
  view: (h, model) =>
    SidebarMenu(h).children(
      SidebarMenuItem(h).children(
        DropdownMenu(h, {
          props: {
            open: model.open,
            items: h.props.versions.map((version) => ({ value: version, label: `v${version}` })),
            align: "start",
            sideOffset: 4,
          },
          onEmit: {
            RequestedOpen: () => VersionSwitcherMessage.MenuOpened(),
            RequestedClose: () => VersionSwitcherMessage.MenuClosed(),
            Picked: ({ value }) => VersionSwitcherMessage.VersionSelected({ version: value }),
            Highlighted: () => undefined,
            RequestedQuery: () => undefined,
            Settled: () => undefined,
          },
          view: (menu) =>
            h.div.children(
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
                  .children(GalleryVerticalEndIcon(h, { class: "size-4" })),
                h.div
                  .class("flex flex-col gap-0.5 leading-none")
                  .children(
                    h.span.class("font-medium").children("Documentation"),
                    h.span.children(`v${model.selectedVersion}`),
                  ),
                ChevronsUpDownIcon(h, { class: "ml-auto" }),
              ),
              DropdownMenuContent(menu, h, {
                class: "w-(--radix-dropdown-menu-trigger-width)",
              }).children(
                h.props.versions.map((version) =>
                  DropdownMenuItem(menu, h, { value: version }).children(
                    `v${version} `,
                    version === model.selectedVersion
                      ? CheckIcon(h, { class: "ml-auto" })
                      : undefined,
                  ),
                ),
              ),
            ),
        }),
      ),
    ),
});
