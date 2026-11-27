/**
 * SidebarOptInForm — from the upstream bases block `sidebar-06`
 * (`registry/bases/radix/blocks/sidebar-06/components/sidebar-opt-in-form.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Declared divergence: upstream's email input is uncontrolled; this
 * repo's `SidebarInput` is controlled-only (D-7, `props.value`
 * required), so the form is a Component owning the email string in
 * its Model and feeding it back as the input's `value` — the
 * Effect-native replacement for the uncontrolled DOM value.
 * Upstream's <form> has no submit handler, and neither does this
 * port's.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { Button } from "@/components/ui/button.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.ts";
import { SidebarInput } from "@/components/ui/sidebar.ts";

export const SidebarOptInFormMessage = UiSchema.TaggedEnum({
  /** The email input's value changed (the controlled input's `onUpdate`). */
  EmailChanged: { value: Schema.String },
});

export const SidebarOptInForm = Html.component({
  name: "Sidebar06OptInForm",
  model: Schema.Struct({ email: Schema.String }),
  message: SidebarOptInFormMessage,
}).make({
  init: () => ({ email: "" }),
  update: {
    EmailChanged: ($, { value }) => $.evolve({ email: value }),
  },
  view: (h, model) =>
    Card(h, { class: "gap-2 py-4 shadow-none" }).children(
      CardHeader(h, { class: "px-4" }).children(
        CardTitle(h, { class: "text-sm" }).children("Subscribe to our newsletter"),
        CardDescription(h).children("Opt-in to receive updates and news about the sidebar."),
      ),
      CardContent(h, { class: "px-4" }).children(
        h.form.children(
          h.div.class("grid gap-2.5").children(
            SidebarInput(h, {
              props: { value: model.email },
              onUpdate: ({ value }) => SidebarOptInFormMessage.EmailChanged({ value }),
              type: "email",
            }).attr("placeholder", "Email"),
            Button(h, {
              class: "w-full bg-sidebar-primary text-sidebar-primary-foreground shadow-none",
            }).children("Subscribe"),
          ),
        ),
      ),
    ),
});
