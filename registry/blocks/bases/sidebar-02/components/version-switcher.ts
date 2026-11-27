/**
 * VersionSwitcher — from the upstream bases block `sidebar-02`
 * (`registry/bases/radix/blocks/sidebar-02/components/version-switcher.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream's `React.useState(defaultVersion)` becomes this Component's
 * Model (`selectedVersion`, seeded from the `defaultVersion` prop in
 * `init`); picking a version is the kit Menu's `Picked` event, mapped to
 * the `Selected` message. The menu's open state is likewise the
 * Component's (`Opened` / `Closed` from the Menu's `RequestedOpen` /
 * `RequestedClose`), as every kit Menu consumer owns it.
 *
 * Declared divergences:
 *
 * - Upstream's `DropdownMenuTrigger asChild` (D-2): the trigger is the
 *   port's `SidebarMenuButton` builder stacked as the Menu trigger's
 *   `element` — the documented composition in the dropdown-menu port.
 * - Upstream's content `align="start"` is a Positioning prop on the kit
 *   Menu call (`align`), not on the content part; upstream's implicit
 *   `sideOffset` default (Radix 4) is passed explicitly for the same
 *   reason.
 * - The item check is drawn for the selected version from the Model, as
 *   upstream draws it from its state; the trailing space after
 *   `v{version}` is upstream's (`v{version}{" "}`).
 * - A kit Menu's `view` returns a single node, so the view draws the
 *   `SidebarMenuItem` itself around the trigger and the content (the
 *   Menu child sits inside `SidebarMenu` where upstream's item sat);
 *   the rendered DOM is upstream's.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.ts";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar.ts";
import { CheckIcon, icon } from "@/lib/icons";

// ---------------------------------------------------------------------------
// Icons — file-local builders (D-7) for glyphs `@/lib/icons` does not hoist
// yet; node data copied verbatim from lucide's SVGs (ISC).
// ---------------------------------------------------------------------------

/** Lucide `gallery-vertical-end` (ISC). */
const GalleryVerticalEndIcon = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
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
const ChevronsUpDownIcon = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  icon(
    h,
    [
      ["path", { d: "m7 15 5 5 5-5" }],
      ["path", { d: "m7 9 5-5 5 5" }],
    ],
    options,
  );

// ---------------------------------------------------------------------------
// VersionSwitcher
// ---------------------------------------------------------------------------

export const VersionSwitcherProps = Schema.Struct({
  versions: Schema.Array(Schema.String),
  defaultVersion: Schema.String,
});
export type VersionSwitcherProps = typeof VersionSwitcherProps.Type;

export const VersionSwitcherMessage = UiSchema.TaggedEnum({
  /** The kit Menu asked to open. */
  Opened: {},
  /** The kit Menu asked to close. */
  Closed: {},
  /** A version item was picked (upstream's item `onSelect`). */
  Selected: { version: Schema.String },
});

export const VersionSwitcher = Html.component({
  name: "VersionSwitcher",
  props: VersionSwitcherProps,
  model: Schema.Struct({
    open: Schema.Boolean,
    selectedVersion: Schema.String,
  }),
  message: VersionSwitcherMessage,
}).make({
  init: ({ props }) => ({ open: false, selectedVersion: props.defaultVersion }),
  update: {
    Opened: ($) => $.evolve({ open: true }),
    Closed: ($) => $.evolve({ open: false }),
    Selected: ($, { version }) => $.evolve({ selectedVersion: version, open: false }),
  },
  view: (h, model) =>
    SidebarMenu(h).children(
      DropdownMenu(h, {
        props: {
          open: model.open,
          items: h.props.versions.map((version) => ({
            value: version,
            label: `v${version}`,
          })),
          align: "start",
          sideOffset: 4,
        },
        onEmit: {
          RequestedOpen: () => VersionSwitcherMessage.Opened(),
          RequestedClose: () => VersionSwitcherMessage.Closed(),
          Picked: ({ value }) => VersionSwitcherMessage.Selected({ version: value }),
          Highlighted: () => undefined,
          RequestedQuery: () => undefined,
          Settled: () => undefined,
        },
        view: (menu) =>
          SidebarMenuItem(h).children(
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
                  ...(version === model.selectedVersion
                    ? [CheckIcon(h, { class: "ml-auto" })]
                    : []),
                ),
              ),
            ),
          ),
      }),
    ),
});
