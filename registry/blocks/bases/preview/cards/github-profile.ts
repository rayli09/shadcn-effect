/**
 * GithubProfile — shadcn/ui block `preview` (registry/bases/radix/blocks/preview/cards/github-profile.tsx), bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a `max-w-md` Card titled "Profile" ("Manage your profile
 * information.") whose content is a plain `<form id="profile">` with
 * three Fields — a Name Input (placeholder "shadcn"), a Public Email
 * NativeSelect with two address options, and a Bio Textarea — each
 * with its FieldDescription (the email one linking to
 * `#email-settings`, the bio one wrapping "@mention" in a span), and
 * whose footer holds the "Save Profile" Button bound to the form by
 * its `form` attribute. Here the form is a Component: the kit Input,
 * NativeSelect and Textarea are controlled (D-7), so the field values
 * live in the Model and edits arrive as Messages. Save is a Message
 * whose handler is a deliberate no-op — upstream wires no submit
 * handler either.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `<form>` has no handler, so a browser submit reloads
 *   the page; here submit is captured (`preventDefault`) as the
 *   `Submitted` Message so the example stays put.
 * - Label/control pairing is the kit Field's generated-id wiring with
 *   the upstream ids passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes. The NativeSelect port's
 *   composite wrapper cannot take the upstream `id="email"` on its
 *   inner `<select>`, so that attribute is not rendered.
 * - Upstream's controls are uncontrolled placeholders; the email
 *   select's initial value here is its first option
 *   ("m@shadcn.com"), which is what the uncontrolled native select
 *   displays.
 * - The Bio control is drawn directly on `field.control(h.textarea)`
 *   with the textarea port's own `TEXTAREA_CLASS`, `data-slot` and
 *   controlled-value / `input` wiring: the port's `Textarea` wrapper
 *   cannot be called here because its `TextareaElement` type
 *   (`Html.Element`) does not accept `h.textarea` (a `VoidElement`
 *   builder) — a type-level mismatch in the ui port, replicated
 *   faithfully instead.
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Button } from "@/components/ui/button.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field.ts";
import { Input } from "@/components/ui/input.ts";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select.ts";
import { TEXTAREA_CLASS } from "@/components/ui/textarea.ts";
import { cn } from "@/lib/utils";

export const GithubProfileMessage = UiSchema.TaggedEnum({
  UpdatedName: { value: Schema.String },
  UpdatedEmail: { value: Schema.String },
  UpdatedBio: { value: Schema.String },
  Submitted: {},
});

export const GithubProfile = Html.component({
  name: "PreviewGithubProfile",
  model: Schema.Struct({ name: Schema.String, email: Schema.String, bio: Schema.String }),
  message: GithubProfileMessage,
}).make({
  init: () => ({ name: "", email: "m@shadcn.com", bio: "" }),
  update: {
    UpdatedName: ($, { value }) => $.evolve({ name: value }),
    UpdatedEmail: ($, { value }) => $.evolve({ email: value }),
    UpdatedBio: ($, { value }) => $.evolve({ bio: value }),
    // Placeholder handler, as upstream: no save happens.
    Submitted: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h, { class: "mx-auto w-full max-w-md" }).children(
      CardHeader(h).children(
        CardTitle(h).children("Profile"),
        CardDescription(h).children("Manage your profile information."),
      ),
      CardContent(h).children(
        h.form
          .attr("id", "profile")
          .on("submit", GithubProfileMessage.Submitted(), { preventDefault: true })
          .children(
            FieldGroup(h).children(
              Field(h, {
                key: "name",
                props: { id: "name" },
                view: (field) =>
                  field.root(h.div).children(
                    FieldLabel(field.label(h.label)).children("Name"),
                    Input(h, {
                      element: field.control(h.input),
                      props: { value: model.name },
                      onUpdate: ({ value }) => GithubProfileMessage.UpdatedName({ value }),
                    }).attr("placeholder", "shadcn"),
                    FieldDescription(field.description(h.p)).children(
                      "Your name may appear around GitHub where you contribute or are mentioned. You can remove it at any time.",
                    ),
                  ),
              }),
              Field(h, {
                key: "email",
                props: { id: "email" },
                view: (field) =>
                  field.root(h.div).children(
                    FieldLabel(field.label(h.label)).children("Public Email"),
                    NativeSelect(h, {
                      props: { value: model.email },
                      onChange: ({ value }) => GithubProfileMessage.UpdatedEmail({ value }),
                      children: [
                        NativeSelectOption(h, { props: { value: "m@shadcn.com" } }).children(
                          "m@shadcn.com",
                        ),
                        NativeSelectOption(h, { props: { value: "m@gmail.com" } }).children(
                          "m@gmail.com",
                        ),
                      ],
                    }),
                    FieldDescription(field.description(h.p)).children(
                      "You can manage verified email addresses in your ",
                      h.a.attr("href", "#email-settings").children("email settings"),
                      ".",
                    ),
                  ),
              }),
              Field(h, {
                key: "bio",
                props: { id: "bio" },
                view: (field) =>
                  field.root(h.div).children(
                    FieldLabel(field.label(h.label)).children("Bio"),
                    field
                      .control(h.textarea)
                      .attr("data-slot", "textarea")
                      .class(cn(TEXTAREA_CLASS))
                      .value(model.bio)
                      .on("input", ({ value }) => GithubProfileMessage.UpdatedBio({ value }))
                      .attr("placeholder", "Tell us a little bit about yourself"),
                    FieldDescription(field.description(h.p)).children(
                      "You can ",
                      h.span.children("@mention"),
                      " other users and organizations to link to them.",
                    ),
                  ),
              }),
            ),
          ),
      ),
      CardFooter(h).children(
        Button(h, { class: "style-sera:w-full" }).attr("form", "profile").children("Save Profile"),
      ),
    ),
});
