/**
 * LoginForm — shadcn/ui block `login-01` (components/login-form),
 * ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card with a plain
 * `<form>` (no submit handler — a placeholder) around uncontrolled
 * inputs. Here the form is a Component: the kit `Input` is controlled
 * (D-7), so the field values live in the Model and edits arrive as
 * Messages. Submit and the Google button are Messages whose handlers
 * are deliberate no-ops — upstream wires no auth either; replace them
 * in `update` (or map them via Commands) to make the example real.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream spreads `React.ComponentProps<"div">` onto the root; the
 *   only prop here is `class` (upstream's `className`), appended to the
 *   root's classes exactly as upstream's `cn(...)` did.
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
import { cn } from "@/lib/utils";

export const LoginFormMessage = UiSchema.TaggedEnum({
  UpdatedEmail: { value: Schema.String },
  UpdatedPassword: { value: Schema.String },
  Submitted: {},
  PressedGoogle: {},
});

export const LoginForm = Html.component({
  name: "Login01Form",
  props: Schema.Struct({ class: Schema.optional(Schema.String) }),
  model: Schema.Struct({ email: Schema.String, password: Schema.String }),
  message: LoginFormMessage,
}).make({
  init: () => ({ email: "", password: "" }),
  update: {
    UpdatedEmail: ($, { value }) => $.evolve({ email: value }),
    UpdatedPassword: ($, { value }) => $.evolve({ password: value }),
    // Placeholder handlers, as upstream: no auth call happens.
    Submitted: ($) => $.evolve({}),
    PressedGoogle: ($) => $.evolve({}),
  },
  view: (h, model) =>
    h.div.class(cn("flex flex-col gap-6", h.props.class)).children(
      Card(h).children(
        CardHeader(h).children(
          CardTitle(h).children("Login to your account"),
          CardDescription(h).children("Enter your email below to login to your account"),
        ),
        CardContent(h).children(
          h.form.on("submit", LoginFormMessage.Submitted(), { preventDefault: true }).children(
            FieldGroup(h).children(
              Field(h, {
                key: "email",
                props: { id: "email" },
                view: (field) =>
                  field.root(h.div).children(
                    FieldLabel(field.label(h.label)).children("Email"),
                    Input(h, {
                      element: field.control(h.input),
                      props: { value: model.email },
                      onUpdate: ({ value }) => LoginFormMessage.UpdatedEmail({ value }),
                      type: "email",
                    })
                      .attr("placeholder", "m@example.com")
                      .attr("required", ""),
                  ),
              }),
              Field(h, {
                key: "password",
                props: { id: "password" },
                view: (field) =>
                  field.root(h.div).children(
                    h.div
                      .class("flex items-center")
                      .children(
                        FieldLabel(field.label(h.label)).children("Password"),
                        h.a
                          .attr("href", "#")
                          .class("ml-auto inline-block text-sm underline-offset-4 hover:underline")
                          .children("Forgot your password?"),
                      ),
                    Input(h, {
                      element: field.control(h.input),
                      props: { value: model.password },
                      onUpdate: ({ value }) => LoginFormMessage.UpdatedPassword({ value }),
                      type: "password",
                    }).attr("required", ""),
                  ),
              }),
              Field(h, {
                key: "actions",
                view: (field) =>
                  field.root(h.div).children(
                    Button(h, { props: { type: "submit" } }).children("Login"),
                    Button(h, {
                      variant: "outline",
                      onPress: LoginFormMessage.PressedGoogle(),
                    }).children("Login with Google"),
                    FieldDescription(h.p, { class: "text-center" }).children(
                      "Don't have an account? ",
                      h.a.attr("href", "#").children("Sign up"),
                    ),
                  ),
              }),
            ),
          ),
        ),
      ),
    ),
});
