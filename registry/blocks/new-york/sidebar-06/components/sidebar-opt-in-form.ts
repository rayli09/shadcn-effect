/**
 * SidebarOptInForm — shadcn/ui block `sidebar-06`
 * (`registry/new-york-v4/blocks/sidebar-06/components/sidebar-opt-in-form.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a stateless React component rendering a `Card` with a plain
 * form around an uncontrolled `SidebarInput`. Here: an `Html.component`
 * — the kit Input is controlled (D-7), so the email value lives in the
 * Model and edits arrive as Messages. The Subscribe button has no
 * handler upstream either; it stays a plain button here.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { Button } from "@/components/ui/button.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.ts";
import { SidebarInput } from "@/components/ui/sidebar.ts";

export const SidebarOptInFormMessage = UiSchema.TaggedEnum({
  EmailChanged: { value: Schema.String },
});

export const SidebarOptInForm = Html.component({
  name: "SidebarOptInForm",
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
              size: "sm",
              class: "w-full bg-sidebar-primary text-sidebar-primary-foreground shadow-none",
            }).children("Subscribe"),
          ),
        ),
      ),
    ),
});
