/**
 * Page (sidebar-13 block) — upstream
 * `registry/bases/radix/blocks/sidebar-13/page.tsx` ported to Effect UI.
 *
 * Upstream: a default-exported React `Page` centering the block's
 * `SettingsDialog` in the viewport. Here: a named `Page` Component
 * (empty Model/message — the page owns no state; the dialog owns its
 * own) whose view places the `SettingsDialog` child component inside
 * the same layout markup, class strings byte-for-byte upstream.
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { SettingsDialog } from "./components/settings-dialog.ts";

export const PageMessage = UiSchema.TaggedEnum({});

export const Page = Html.component({
  name: "Sidebar13Page",
  model: Schema.Struct({}),
  message: PageMessage,
}).make({
  init: () => ({}),
  update: {},
  view: (h) =>
    h.div.class("flex h-svh items-center justify-center").children(SettingsDialog(h, {})),
});
