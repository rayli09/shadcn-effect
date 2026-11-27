/**
 * SignupForm — shadcn/ui block `signup-02` (components/signup-form),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Pairs with the `base-*` ui items: the imports below say
 * `@/components/ui/<x>` because the bases items install to the same
 * paths as the new-york ones — the class layer inside them is the
 * bases `cn-*` hook layer, styled by a `style-*` preset.
 *
 * Upstream: a stateless React function rendering the `<form>` itself
 * (no submit handler — a placeholder) around uncontrolled inputs.
 * Here the form is a Component: the kit `Input` is controlled (D-7),
 * so the field values live in the Model and edits arrive as
 * Messages. Submit and the GitHub button are Messages whose handlers
 * are deliberate no-ops — upstream wires no auth either; replace
 * them in `update` (or map them via Commands) to make the example
 * real.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream spreads `React.ComponentProps<"form">` onto the form;
 *   the only prop here is `class` (upstream's `className`), appended
 *   to the form's classes exactly as upstream's `cn(...)` did.
 * - Upstream's `<form>` has no handler, so a browser submit reloads
 *   the page; here submit is captured (`preventDefault`) as the
 *   `Submitted` Message so the example stays put.
 * - Label/control pairing is the kit Field's generated-id wiring
 *   with the upstream ids passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes. Descriptions that
 *   belong to a control are drawn through the Field's `description`
 *   part (`described: true`), so the control's `aria-describedby`
 *   points at them, as upstream's hand-written ids did.
 * - The GitHub mark is upstream's inline brand `<svg>`, kept
 *   verbatim as a file-local builder (it is not a lucide glyph).
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

/** GitHub mark — upstream inlines this brand `<svg>`; same here, verbatim. */
const GitHubIcon = <Msg>(h: Html.H<Msg>) =>
  h
    .el("svg")
    .attrs({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" })
    .children(
      h.el("path").attrs({
        d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
        fill: "currentColor",
      }),
    );

export const SignupFormMessage = UiSchema.TaggedEnum({
  UpdatedName: { value: Schema.String },
  UpdatedEmail: { value: Schema.String },
  UpdatedPassword: { value: Schema.String },
  UpdatedConfirmPassword: { value: Schema.String },
  Submitted: {},
  PressedGitHub: {},
});

export const SignupForm = Html.component({
  name: "Signup02Form",
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
    PressedGitHub: ($) => $.evolve({}),
  },
  view: (h, model) =>
    h.form
      .class(cn("flex flex-col gap-6", h.props.class))
      .on("submit", SignupFormMessage.Submitted(), { preventDefault: true })
      .children(
        FieldGroup(h).children(
          h.div
            .class("flex flex-col items-center gap-1 text-center")
            .children(
              h.h1.class("text-2xl font-bold").children("Create your account"),
              h.p
                .class("text-sm text-balance text-muted-foreground")
                .children("Fill in the form below to create your account"),
            ),
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
                  class: "bg-background",
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
                  class: "bg-background",
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
                  class: "bg-background",
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
                  class: "bg-background",
                }).attr("required", ""),
                FieldDescription(field.description(h.p)).children("Please confirm your password."),
              ),
          }),
          Field(h, {
            key: "actions",
            view: (field) =>
              field
                .root(h.div)
                .children(Button(h, { props: { type: "submit" } }).children("Create Account")),
          }),
          FieldSeparator(h, { children: ["Or continue with"] }),
          Field(h, {
            key: "github",
            view: (field) =>
              field.root(h.div).children(
                Button(h, {
                  variant: "outline",
                  onPress: SignupFormMessage.PressedGitHub(),
                }).children(GitHubIcon(h), "Sign up with GitHub"),
                FieldDescription(h.p, { class: "px-6 text-center" }).children(
                  "Already have an account? ",
                  h.a.attr("href", "#").children("Sign in"),
                ),
              ),
          }),
        ),
      ),
});
