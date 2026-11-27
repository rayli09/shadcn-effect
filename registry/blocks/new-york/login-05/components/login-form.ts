/**
 * LoginForm — shadcn/ui block `login-05` (components/login-form),
 * ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a plain `<form>`
 * (no submit handler — a placeholder) around an uncontrolled email
 * input, with Apple / Google continue buttons below. Here the form
 * is a Component: the kit `Input` is controlled (D-7), so the email
 * value lives in the Model and edits arrive as Messages. Submit and
 * the provider buttons are Messages whose handlers are deliberate
 * no-ops — upstream wires no auth either; replace them in `update`
 * to make the example real.
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
 *   kept as a file-local builder with the path data verbatim (they
 *   are not lucide glyphs, so they do not live in `@/lib/icons`).
 * - The lucide `gallery-vertical-end` glyph is not in `@/lib/icons`
 *   yet, so it is built file-locally from lucide's path data (ISC)
 *   through the shared `icon` helper.
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
import { icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

const APPLE_PATH =
  "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701";

const GOOGLE_PATH =
  "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z";

/** Upstream's inline brand svg: no class (the Button's `[&_svg]` rules size it). */
const BrandIcon = <Msg>(h: Html.H<Msg>, d: string) =>
  h
    .el("svg")
    .attrs({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" })
    .children(h.el("path").attrs({ d, fill: "currentColor" }));

/** Lucide `gallery-vertical-end` (ISC), file-local until `@/lib/icons` hoists it. */
const GalleryVerticalEndIcon = <Msg>(h: Html.H<Msg>, options: { readonly class?: string } = {}) =>
  icon(
    h,
    [
      ["path", { d: "M7 2h10" }],
      ["path", { d: "M5 6h14" }],
      ["rect", { width: "18", height: "12", x: "3", y: "10", rx: "2" }],
    ],
    options,
  );

export const LoginFormMessage = UiSchema.TaggedEnum({
  UpdatedEmail: { value: Schema.String },
  Submitted: {},
  PressedApple: {},
  PressedGoogle: {},
});

export const LoginForm = Html.component({
  name: "Login05Form",
  props: Schema.Struct({ class: Schema.optional(Schema.String) }),
  model: Schema.Struct({ email: Schema.String }),
  message: LoginFormMessage,
}).make({
  init: () => ({ email: "" }),
  update: {
    UpdatedEmail: ($, { value }) => $.evolve({ email: value }),
    // Placeholder handlers, as upstream: no auth call happens.
    Submitted: ($) => $.evolve({}),
    PressedApple: ($) => $.evolve({}),
    PressedGoogle: ($) => $.evolve({}),
  },
  view: (h, model) =>
    h.div.class(cn("flex flex-col gap-6", h.props.class)).children(
      h.form.on("submit", LoginFormMessage.Submitted(), { preventDefault: true }).children(
        FieldGroup(h).children(
          h.div.class("flex flex-col items-center gap-2 text-center").children(
            h.a
              .attr("href", "#")
              .class("flex flex-col items-center gap-2 font-medium")
              .children(
                h.div
                  .class("flex size-8 items-center justify-center rounded-md")
                  .children(GalleryVerticalEndIcon(h, { class: "size-6" })),
                h.span.class("sr-only").children("Acme Inc."),
              ),
            h.h1.class("text-xl font-bold").children("Welcome to Acme Inc."),
            FieldDescription(h.p).children(
              "Don't have an account? ",
              h.a.attr("href", "#").children("Sign up"),
            ),
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
            key: "submit",
            view: (field) =>
              field
                .root(h.div)
                .children(Button(h, { props: { type: "submit" } }).children("Login")),
          }),
          FieldSeparator(h, { children: ["Or"] }),
          Field(h, {
            key: "social",
            class: "grid gap-4 sm:grid-cols-2",
            view: (field) =>
              field.root(h.div).children(
                Button(h, {
                  variant: "outline",
                  onPress: LoginFormMessage.PressedApple(),
                }).children(BrandIcon(h, APPLE_PATH), "Continue with Apple"),
                Button(h, {
                  variant: "outline",
                  onPress: LoginFormMessage.PressedGoogle(),
                }).children(BrandIcon(h, GOOGLE_PATH), "Continue with Google"),
              ),
          }),
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
