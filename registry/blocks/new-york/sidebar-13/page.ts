/**
 * Page — shadcn/ui block `sidebar-13`
 * (`registry/new-york-v4/blocks/sidebar-13/page.tsx`), ported 1:1 to
 * Effect UI. Class strings are verbatim from the source.
 *
 * Upstream's default-exported React `Page` becomes the named export
 * `Sidebar13`: an `Html.component` whose view centers the
 * `SettingsDialog` component in a full-height flex container.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { SettingsDialog } from "./components/settings-dialog.ts";

export const Sidebar13Message = UiSchema.TaggedEnum({});

export const Sidebar13 = Html.component({
  name: "Sidebar13",
  model: Schema.Struct({}),
  message: Sidebar13Message,
}).make({
  init: () => ({}),
  update: {},
  view: (h) =>
    h.div.class("flex h-svh items-center justify-center").children(SettingsDialog(h, {})),
});
