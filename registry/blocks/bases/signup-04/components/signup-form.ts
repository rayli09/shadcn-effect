/**
 * SignupForm — shadcn/ui block `signup-04` (components/signup-form),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Pairs with the `base-*` ui items: the imports below say
 * `@/components/ui/<x>` because the bases items install to the same
 * paths as the new-york ones — the class layer inside them is the
 * bases `cn-*` hook layer, styled by a `style-*` preset.
 *
 * Upstream: a stateless React function rendering a split Card — the
 * `<form>` (no submit handler — a placeholder) around uncontrolled
 * inputs in the left cell, an image panel in the right. Here the
 * form is a Component: the kit `Input` is controlled (D-7), so the
 * field values live in the Model and edits arrive as Messages.
 * Submit and the Apple / Google / Meta buttons are Messages whose
 * handlers are deliberate no-ops — upstream wires no auth either;
 * replace them in `update` (or map them via Commands) to make the
 * example real.
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
 *   hand-written `htmlFor` / `id` attributes. The email description
 *   belongs to its control, so it is drawn through the Field's
 *   `description` part (`described: true`) and the control's
 *   `aria-describedby` points at it, as upstream's ids did.
 * - The Apple / Google / Meta marks are upstream's inline brand
 *   `<svg>`s, kept verbatim as file-local builders (not lucide
 *   glyphs).
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Button } from "@/components/ui/button.ts";
import { Card, CardContent } from "@/components/ui/card.ts";
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

/** Meta mark — upstream inlines this brand `<svg>`; same here, verbatim. */
const MetaIcon = <Msg>(h: Html.H<Msg>) =>
  h
    .el("svg")
    .attrs({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" })
    .children(
      h.el("path").attrs({
        d: "M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z",
        fill: "currentColor",
      }),
    );

export const SignupFormMessage = UiSchema.TaggedEnum({
  UpdatedEmail: { value: Schema.String },
  UpdatedPassword: { value: Schema.String },
  UpdatedConfirmPassword: { value: Schema.String },
  Submitted: {},
  PressedApple: {},
  PressedGoogle: {},
  PressedMeta: {},
});

export const SignupForm = Html.component({
  name: "Signup04Form",
  props: Schema.Struct({ class: Schema.optional(Schema.String) }),
  model: Schema.Struct({
    email: Schema.String,
    password: Schema.String,
    confirmPassword: Schema.String,
  }),
  message: SignupFormMessage,
}).make({
  init: () => ({ email: "", password: "", confirmPassword: "" }),
  update: {
    UpdatedEmail: ($, { value }) => $.evolve({ email: value }),
    UpdatedPassword: ($, { value }) => $.evolve({ password: value }),
    UpdatedConfirmPassword: ($, { value }) => $.evolve({ confirmPassword: value }),
    // Placeholder handlers, as upstream: no auth call happens.
    Submitted: ($) => $.evolve({}),
    PressedApple: ($) => $.evolve({}),
    PressedGoogle: ($) => $.evolve({}),
    PressedMeta: ($) => $.evolve({}),
  },
  view: (h, model) =>
    h.div.class(cn("flex flex-col gap-6", h.props.class)).children(
      Card(h, { class: "overflow-hidden p-0" }).children(
        CardContent(h, { class: "grid p-0 md:grid-cols-2" }).children(
          h.form
            .class("p-6 md:p-8")
            .on("submit", SignupFormMessage.Submitted(), { preventDefault: true })
            .children(
              FieldGroup(h).children(
                h.div
                  .class("flex flex-col items-center gap-2 text-center")
                  .children(
                    h.h1.class("text-2xl font-bold").children("Create your account"),
                    h.p
                      .class("text-sm text-balance text-muted-foreground")
                      .children("Enter your email below to create your account"),
                  ),
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
                      ),
                }),
                FieldSeparator(h, {
                  class: "*:data-[slot=field-separator-content]:bg-card",
                  children: ["Or continue with"],
                }),
                Field(h, {
                  key: "social",
                  class: "grid grid-cols-3 gap-4",
                  view: (field) =>
                    field.root(h.div).children(
                      Button(h, {
                        variant: "outline",
                        onPress: SignupFormMessage.PressedApple(),
                      }).children(
                        AppleIcon(h),
                        h.span.class("sr-only").children("Sign up with Apple"),
                      ),
                      Button(h, {
                        variant: "outline",
                        onPress: SignupFormMessage.PressedGoogle(),
                      }).children(
                        GoogleIcon(h),
                        h.span.class("sr-only").children("Sign up with Google"),
                      ),
                      Button(h, {
                        variant: "outline",
                        onPress: SignupFormMessage.PressedMeta(),
                      }).children(
                        MetaIcon(h),
                        h.span.class("sr-only").children("Sign up with Meta"),
                      ),
                    ),
                }),
                FieldDescription(h.p, { class: "text-center" }).children(
                  "Already have an account? ",
                  h.a.attr("href", "#").children("Sign in"),
                ),
              ),
            ),
          h.div
            .class("relative hidden bg-muted md:block")
            .children(
              h.img
                .attr("src", "/placeholder.svg")
                .attr("alt", "Image")
                .class(
                  "absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale",
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
