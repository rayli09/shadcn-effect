/**
 * LoginForm — shadcn/ui block `login-03` (components/login-form),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Pairs with the `base-*` ui items: the imports below say
 * `@/components/ui/<x>` because the bases items install to the same
 * paths as the new-york ones — the class layer inside them is the
 * bases `cn-*` hook layer, styled by a `style-*` preset.
 *
 * Upstream: a stateless React function rendering a Card with a plain
 * `<form>` (no submit handler — a placeholder) around uncontrolled
 * inputs, social buttons first. Here the form is a Component: the
 * kit `Input` is controlled (D-7), so the field values live in the
 * Model and edits arrive as Messages. Submit and the Apple / Google
 * buttons are Messages whose handlers are deliberate no-ops —
 * upstream wires no auth either; replace them in `update` (or map
 * them via Commands) to make the example real.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream spreads `React.ComponentProps<"div">` onto the root; the
 *   only prop here is `class` (upstream's `className`), appended to
 *   the root's classes exactly as upstream's `cn(...)` did.
 * - Upstream's `<form>` has no handler, so a browser submit reloads
 *   the page; here submit is captured (`preventDefault`) as the
 *   `Submitted` Message so the example stays put.
 * - Label/control pairing is the kit Field's generated-id wiring with
 *   the upstream ids passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes.
 * - The Apple / Google marks are upstream's inline brand `<svg>`s,
 *   kept verbatim as file-local builders (not lucide glyphs).
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Button } from "@/components/ui/button.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.ts";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field.ts";
import { Input } from "@/components/ui/input.ts";
import { cn } from "@/lib/utils";

/** Apple mark — upstream inlines this brand `<svg>`; same here, verbatim. */
const AppleIcon = <Msg>(h: Html.H<Msg>) =>
  h
    .el("svg")
    .attrs({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" })
    .children(
      h.el("path").attrs({
        d: "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701",
        fill: "currentColor",
      }),
    );

/** Google mark — upstream inlines this brand `<svg>`; same here, verbatim. */
const GoogleIcon = <Msg>(h: Html.H<Msg>) =>
  h
    .el("svg")
    .attrs({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" })
    .children(
      h.el("path").attrs({
        d: "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z",
        fill: "currentColor",
      }),
    );

export const LoginFormMessage = UiSchema.TaggedEnum({
  UpdatedEmail: { value: Schema.String },
  UpdatedPassword: { value: Schema.String },
  Submitted: {},
  PressedApple: {},
  PressedGoogle: {},
});

export const LoginForm = Html.component({
  name: "Login03Form",
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
    PressedApple: ($) => $.evolve({}),
    PressedGoogle: ($) => $.evolve({}),
  },
  view: (h, model) =>
    h.div.class(cn("flex flex-col gap-6", h.props.class)).children(
      Card(h).children(
        CardHeader(h, { class: "text-center" }).children(
          CardTitle(h, { class: "text-xl" }).children("Welcome back"),
          CardDescription(h).children("Login with your Apple or Google account"),
        ),
        CardContent(h).children(
          h.form.on("submit", LoginFormMessage.Submitted(), { preventDefault: true }).children(
            FieldGroup(h).children(
              Field(h, {
                key: "social",
                view: (field) =>
                  field.root(h.div).children(
                    Button(h, {
                      variant: "outline",
                      onPress: LoginFormMessage.PressedApple(),
                    }).children(AppleIcon(h), "Login with Apple"),
                    Button(h, {
                      variant: "outline",
                      onPress: LoginFormMessage.PressedGoogle(),
                    }).children(GoogleIcon(h), "Login with Google"),
                  ),
              }),
              FieldSeparator(h, {
                class: "*:data-[slot=field-separator-content]:bg-card",
                children: ["Or continue with"],
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
                          .class("ml-auto text-sm underline-offset-4 hover:underline")
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
                  field
                    .root(h.div)
                    .children(
                      Button(h, { props: { type: "submit" } }).children("Login"),
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
      FieldDescription(h.p, { class: "px-6 text-center" }).children(
        "By clicking continue, you agree to our ",
        h.a.attr("href", "#").children("Terms of Service"),
        " and ",
        h.a.attr("href", "#").children("Privacy Policy"),
        ".",
      ),
    ),
});
