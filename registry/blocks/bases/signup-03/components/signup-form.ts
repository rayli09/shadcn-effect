/**
 * SignupForm — shadcn/ui block `signup-03` (components/signup-form),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Pairs with the `base-*` ui items: the imports below say
 * `@/components/ui/<x>` because the bases items install to the same
 * paths as the new-york ones — the class layer inside them is the
 * bases `cn-*` hook layer, styled by a `style-*` preset.
 *
 * Upstream: a stateless React function rendering a Card with a plain
 * `<form>` (no submit handler — a placeholder) around uncontrolled
 * inputs, the two password inputs side by side in a nested Field.
 * Here the form is a Component: the kit `Input` is controlled (D-7),
 * so the field values live in the Model and edits arrive as
 * Messages. Submit is a Message whose handler is a deliberate no-op
 * — upstream wires no auth either; replace it in `update` (or map it
 * via Commands) to make the example real.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream spreads `React.ComponentProps<"div">` onto the root; the
 *   only prop here is `class` (upstream's `className`), appended to
 *   the root's classes exactly as upstream's `cn(...)` did.
 * - Upstream's `<form>` has no handler, so a browser submit reloads
 *   the page; here submit is captured (`preventDefault`) as the
 *   `Submitted` Message so the example stays put.
 * - Label/control pairing is the kit Field's generated-id wiring
 *   with the upstream ids passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes.
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Button } from "@/components/ui/button.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.ts";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field.ts";
import { Input } from "@/components/ui/input.ts";
import { cn } from "@/lib/utils";

export const SignupFormMessage = UiSchema.TaggedEnum({
  UpdatedName: { value: Schema.String },
  UpdatedEmail: { value: Schema.String },
  UpdatedPassword: { value: Schema.String },
  UpdatedConfirmPassword: { value: Schema.String },
  Submitted: {},
});

export const SignupForm = Html.component({
  name: "Signup03Form",
  props: Schema.Struct({ class: Schema.optional(Schema.String) }),
  model: Schema.Struct({
    name: Schema.String,
    email: Schema.String,
    password: Schema.String,
    confirmPassword: Schema.String,
  }),
  message: SignupFormMessage,
}).make({
  init: () => ({ name: "", email: "", password: "", confirmPassword: "" }),
  update: {
    UpdatedName: ($, { value }) => $.evolve({ name: value }),
    UpdatedEmail: ($, { value }) => $.evolve({ email: value }),
    UpdatedPassword: ($, { value }) => $.evolve({ password: value }),
    UpdatedConfirmPassword: ($, { value }) => $.evolve({ confirmPassword: value }),
    // Placeholder handler, as upstream: no auth call happens.
    Submitted: ($) => $.evolve({}),
  },
  view: (h, model) =>
    h.div.class(cn("flex flex-col gap-6", h.props.class)).children(
      Card(h).children(
        CardHeader(h, { class: "text-center" }).children(
          CardTitle(h, { class: "text-xl" }).children("Create your account"),
          CardDescription(h).children("Enter your email below to create your account"),
        ),
        CardContent(h).children(
          h.form.on("submit", SignupFormMessage.Submitted(), { preventDefault: true }).children(
            FieldGroup(h).children(
              Field(h, {
                key: "name",
                props: { id: "name" },
                view: (field) =>
                  field.root(h.div).children(
                    FieldLabel(field.label(h.label)).children("Full Name"),
                    Input(h, {
                      element: field.control(h.input),
                      props: { value: model.name },
                      onUpdate: ({ value }) => SignupFormMessage.UpdatedName({ value }),
                      type: "text",
                    })
                      .attr("placeholder", "John Doe")
                      .attr("required", ""),
                  ),
              }),
              Field(h, {
                key: "email",
                props: { id: "email" },
                view: (field) =>
                  field.root(h.div).children(
                    FieldLabel(field.label(h.label)).children("Email"),
                    Input(h, {
                      element: field.control(h.input),
                      props: { value: model.email },
                      onUpdate: ({ value }) => SignupFormMessage.UpdatedEmail({ value }),
                      type: "email",
                    })
                      .attr("placeholder", "m@example.com")
                      .attr("required", ""),
                  ),
              }),
              Field(h, {
                key: "passwords",
                view: (field) =>
                  field.root(h.div).children(
                    Field(h, {
                      key: "password-pair",
                      class: "grid grid-cols-2 gap-4",
                      view: (pair) =>
                        pair.root(h.div).children(
                          Field(h, {
                            key: "password",
                            props: { id: "password" },
                            view: (passwordField) =>
                              passwordField.root(h.div).children(
                                FieldLabel(passwordField.label(h.label)).children("Password"),
                                Input(h, {
                                  element: passwordField.control(h.input),
                                  props: { value: model.password },
                                  onUpdate: ({ value }) =>
                                    SignupFormMessage.UpdatedPassword({ value }),
                                  type: "password",
                                }).attr("required", ""),
                              ),
                          }),
                          Field(h, {
                            key: "confirm-password",
                            props: { id: "confirm-password" },
                            view: (confirmField) =>
                              confirmField.root(h.div).children(
                                FieldLabel(confirmField.label(h.label)).children(
                                  "Confirm Password",
                                ),
                                Input(h, {
                                  element: confirmField.control(h.input),
                                  props: { value: model.confirmPassword },
                                  onUpdate: ({ value }) =>
                                    SignupFormMessage.UpdatedConfirmPassword({ value }),
                                  type: "password",
                                }).attr("required", ""),
                              ),
                          }),
                        ),
                    }),
                    FieldDescription(h.p).children("Must be at least 8 characters long."),
                  ),
              }),
              Field(h, {
                key: "actions",
                view: (field) =>
                  field
                    .root(h.div)
                    .children(
                      Button(h, { props: { type: "submit" } }).children("Create Account"),
                      FieldDescription(h.p, { class: "text-center" }).children(
                        "Already have an account? ",
                        h.a.attr("href", "#").children("Sign in"),
                      ),
                    ),
              }),
            ),
          ),
        ),
      ),
      FieldDescription(h.p, { class: "px-6 text-center" }).children(
        "By clicking continue, you agree to our ",
        h.a.attr("href", "#").children("Terms of Service"),
        " and ",
        h.a.attr("href", "#").children("Privacy Policy"),
        ".",
      ),
    ),
});
