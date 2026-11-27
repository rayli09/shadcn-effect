/**
 * LoginForm — shadcn/ui block `login-02` (components/login-form),
 * ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a plain `<form>` (no
 * submit handler — a placeholder) around uncontrolled inputs. Here
 * the form is a Component: the kit `Input` is controlled (D-7), so
 * the field values live in the Model and edits arrive as Messages.
 * Submit and the GitHub button are Messages whose handlers are
 * deliberate no-ops — upstream wires no auth either; replace them in
 * `update` to make the example real.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream spreads `React.ComponentProps<"form">` onto the root
 *   `<form>`; the only prop here is `class` (upstream's `className`),
 *   appended to the root's classes exactly as upstream's `cn(...)`
 *   did.
 * - Upstream's `<form>` has no handler, so a browser submit reloads
 *   the page; here submit is captured (`preventDefault`) as the
 *   `Submitted` Message so the example stays put.
 * - Label/control pairing is the kit Field's generated-id wiring with
 *   the upstream ids passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes.
 * - The GitHub mark is upstream's inline brand `<svg>`, kept as a
 *   file-local builder with the path data verbatim (it is not a
 *   lucide glyph, so it does not live in `@/lib/icons`).
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Button } from "@/components/ui/button.ts";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field.ts";
import { Input } from "@/components/ui/input.ts";
import { cn } from "@/lib/utils";

const GITHUB_PATH =
  "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12";

/** Upstream's inline brand svg: no class (the Button's `[&_svg]` rules size it). */
const BrandIcon = <Msg>(h: Html.H<Msg>, d: string) =>
  h
    .el("svg")
    .attrs({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" })
    .children(h.el("path").attrs({ d, fill: "currentColor" }));

export const LoginFormMessage = UiSchema.TaggedEnum({
  UpdatedEmail: { value: Schema.String },
  UpdatedPassword: { value: Schema.String },
  Submitted: {},
  PressedGitHub: {},
});

export const LoginForm = Html.component({
  name: "Login02Form",
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
    PressedGitHub: ($) => $.evolve({}),
  },
  view: (h, model) =>
    h.form
      .class(cn("flex flex-col gap-6", h.props.class))
      .on("submit", LoginFormMessage.Submitted(), { preventDefault: true })
      .children(
        FieldGroup(h).children(
          h.div
            .class("flex flex-col items-center gap-1 text-center")
            .children(
              h.h1.class("text-2xl font-bold").children("Login to your account"),
              h.p
                .class("text-sm text-balance text-muted-foreground")
                .children("Enter your email below to login to your account"),
            ),
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
            key: "submit",
            view: (field) =>
              field
                .root(h.div)
                .children(Button(h, { props: { type: "submit" } }).children("Login")),
          }),
          FieldSeparator(h, { children: ["Or continue with"] }),
          Field(h, {
            key: "github",
            view: (field) =>
              field.root(h.div).children(
                Button(h, {
                  variant: "outline",
                  onPress: LoginFormMessage.PressedGitHub(),
                }).children(BrandIcon(h, GITHUB_PATH), "Login with GitHub"),
                FieldDescription(h.p, { class: "text-center" }).children(
                  "Don't have an account? ",
                  h.a.attr("href", "#").class("underline underline-offset-4").children("Sign up"),
                ),
              ),
          }),
        ),
      ),
});
