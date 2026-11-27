/**
 * SignupForm — shadcn/ui block `signup-01` (components/signup-form),
 * ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card whose content
 * is a plain `<form>` (no submit handler — a placeholder) around
 * uncontrolled inputs. Here the form is a Component: the kit `Input`
 * is controlled (D-7), so the field values live in the Model and
 * edits arrive as Messages. Submit and the Google button are
 * Messages whose handlers are deliberate no-ops — upstream wires no
 * auth either; replace them in `update` to make the example real.
 * Upstream performs no validation (the "Must be at least 8
 * characters long." copy is a static description, not a rule), so
 * none is ported — descriptions render through the kit Field's
 * `description` part exactly as static text.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream spreads `React.ComponentProps<typeof Card>` onto the
 *   Card root; the only prop here is `class` (upstream's
 *   `className`), passed to the Card port's `class` option.
 * - Upstream's `<form>` has no handler, so a browser submit reloads
 *   the page; here submit is captured (`preventDefault`) as the
 *   `Submitted` Message so the example stays put.
 * - Label/control pairing is the kit Field's generated-id wiring with
 *   the upstream ids passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes.
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Button } from "@/components/ui/button.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.ts";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field.ts";
import { Input } from "@/components/ui/input.ts";

export const SignupFormMessage = UiSchema.TaggedEnum({
  UpdatedName: { value: Schema.String },
  UpdatedEmail: { value: Schema.String },
  UpdatedPassword: { value: Schema.String },
  UpdatedConfirmPassword: { value: Schema.String },
  Submitted: {},
  PressedGoogle: {},
});

export const SignupForm = Html.component({
  name: "Signup01Form",
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
    // Placeholder handlers, as upstream: no auth call happens.
    Submitted: ($) => $.evolve({}),
    PressedGoogle: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h, { class: h.props.class }).children(
      CardHeader(h).children(
        CardTitle(h).children("Create an account"),
        CardDescription(h).children("Enter your information below to create your account"),
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
              props: { id: "email", described: true },
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
                  FieldDescription(field.description(h.p)).children(
                    "We'll use this to contact you. We will not share your email with anyone else.",
                  ),
                ),
            }),
            Field(h, {
              key: "password",
              props: { id: "password", described: true },
              view: (field) =>
                field.root(h.div).children(
                  FieldLabel(field.label(h.label)).children("Password"),
                  Input(h, {
                    element: field.control(h.input),
                    props: { value: model.password },
                    onUpdate: ({ value }) => SignupFormMessage.UpdatedPassword({ value }),
                    type: "password",
                  }).attr("required", ""),
                  FieldDescription(field.description(h.p)).children(
                    "Must be at least 8 characters long.",
                  ),
                ),
            }),
            Field(h, {
              key: "confirm-password",
              props: { id: "confirm-password", described: true },
              view: (field) =>
                field.root(h.div).children(
                  FieldLabel(field.label(h.label)).children("Confirm Password"),
                  Input(h, {
                    element: field.control(h.input),
                    props: { value: model.confirmPassword },
                    onUpdate: ({ value }) => SignupFormMessage.UpdatedConfirmPassword({ value }),
                    type: "password",
                  }).attr("required", ""),
                  FieldDescription(field.description(h.p)).children(
                    "Please confirm your password.",
                  ),
                ),
            }),
            FieldGroup(h).children(
              Field(h, {
                key: "actions",
                view: (field) =>
                  field.root(h.div).children(
                    Button(h, { props: { type: "submit" } }).children("Create Account"),
                    Button(h, {
                      variant: "outline",
                      onPress: SignupFormMessage.PressedGoogle(),
                    }).children("Sign up with Google"),
                    FieldDescription(h.p, { class: "px-6 text-center" }).children(
                      "Already have an account? ",
                      h.a.attr("href", "#").children("Sign in"),
                    ),
                  ),
              }),
            ),
          ),
        ),
      ),
    ),
});
