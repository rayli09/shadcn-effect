/**
 * CatalogToolbar — shadcn/ui block `preview-02`
 * (registry/bases/radix/blocks/preview-02/cards/catalog-toolbar.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a toolbar row — a search InputGroup (uncontrolled input
 * with a search-icon addon), an "Upload New Release" Button, and a
 * single-select outline ToggleGroup defaulting to "releases". Here
 * the toolbar is a Component: the kit `Input` and `ToggleGroup` are
 * controlled (D-7), so the query and the pressed view live in the
 * Model (the view seeded from upstream's `defaultValue="releases"`)
 * and edits arrive as Messages. "Upload New Release" is a Message
 * whose handler is a deliberate no-op — upstream wires no upload
 * either.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `IconPlaceholder` swaps icon libraries per create-app
 *   params; only the lucide rendering is ported — `SearchIcon` from
 *   `@/lib/icons`, and `PlusIcon` below is a file-local builder from
 *   lucide's SVG data (the shared module doesn't export it yet).
 * - Upstream's ToggleGroup `type="single"` is the kit group's
 *   default (non-`multiple`) mode; the pressed values are the
 *   Model's array, as the kit's controlled shape requires.
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Button } from "@/components/ui/button.ts";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group.ts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.ts";
import { icon, SearchIcon, type IconOptions } from "@/lib/icons";

/** Lucide `plus` (ISC), via the shared `icon()` helper. */
const PlusIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M5 12h14" }],
      ["path", { d: "M12 5v14" }],
    ],
    options,
  );

export const CatalogToolbarMessage = UiSchema.TaggedEnum({
  UpdatedQuery: { value: Schema.String },
  ToggledView: { value: Schema.Array(Schema.String) },
  PressedUpload: {},
});

export const CatalogToolbar = Html.component({
  name: "Preview02CatalogToolbar",
  model: Schema.Struct({
    query: Schema.String,
    view: Schema.Array(Schema.String),
  }),
  message: CatalogToolbarMessage,
}).make({
  init: () => ({ query: "", view: ["releases"] }),
  update: {
    UpdatedQuery: ($, { value }) => $.evolve({ query: value }),
    ToggledView: ($, { value }) => $.evolve({ view: value }),
    // Placeholder handler, as upstream: no upload happens.
    PressedUpload: ($) => $.evolve({}),
  },
  view: (h, model) =>
    h.div.class("flex items-center gap-3").children(
      InputGroup(h, { class: "flex-1" }).children(
        InputGroupAddon(h).children(SearchIcon(h)),
        InputGroupInput(h, {
          props: { value: model.query },
          onUpdate: ({ value }) => CatalogToolbarMessage.UpdatedQuery({ value }),
        }).attr("placeholder", "Search releases or catalog..."),
      ),
      Button(h, { onPress: CatalogToolbarMessage.PressedUpload() }).children(
        PlusIcon(h),
        "Upload New Release",
      ),
      ToggleGroup(h, {
        key: "view",
        props: {
          value: model.view,
          items: [{ value: "all-tracks" }, { value: "releases" }, { value: "top-earners" }],
        },
        variant: "outline",
        onToggled: (value) => CatalogToolbarMessage.ToggledView({ value }),
        view: (group) =>
          group.root(h.div).children(
            ToggleGroupItem(group, { element: h.button, value: "all-tracks" }).children(
              "All Tracks",
            ),
            ToggleGroupItem(group, { element: h.button, value: "releases" }).children("Releases"),
            ToggleGroupItem(group, {
              element: h.button,
              value: "top-earners",
            }).children("Top Earners"),
          ),
      }),
    ),
});
