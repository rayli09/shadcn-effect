/**
 * TypographySpecimen — shadcn/ui block `preview`
 * (cards/typography-specimen.tsx), bases generation, ported 1:1 to
 * Effect UI.
 *
 * Upstream: a "use client" React function in the create-app that reads
 * the current fonts from URL search params
 * (`useDesignSystemSearchParams`) and renders a Card: a
 * "<heading label> - <body label>" eyebrow (heading label is the
 * heading font's name when set and different from the body font, else
 * "Inherit"; body label is the body font's name, else "Default"), a
 * heading and two body paragraphs, and a footer whose "Share Feedback"
 * Button opens a Dialog with a feedback form (name / email Inputs, a
 * category Select defaulted to "general", a message Textarea, Cancel
 * via DialogClose and a handler-less Submit Button). Here the card is
 * a Component: the Dialog's open state, the field values and the
 * Select's open state live in the Model (the kit Input / Select /
 * Textarea are controlled, D-7), seeded with upstream's defaults, and
 * edits arrive as Messages. Submit is a Message whose handler is a
 * deliberate no-op — upstream wires no submit either.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Create-app internals are not ported: `useDesignSystemSearchParams`
 *   and `@/app/(create)/lib/fonts` (FONTS) are not imported. The card
 *   renders with the create-app's default selection — upstream
 *   `DEFAULT_CONFIG` in `registry/config.ts`: font "inter",
 *   fontHeading "inherit" — with the FONTS name data inlined below as
 *   local constants copied from that data file. With fontHeading
 *   "inherit" there is no FONTS match, so the eyebrow is upstream's
 *   fallback rendering: "Inherit - Inter".
 * - The Dialog is the kit Dialog composition from the dialog port
 *   (D-6): this Component owns `open` in its Model, the trigger is the
 *   port's `Button` stacked under the kit's trigger part (D-2), the
 *   auto close button upstream's DialogContent renders is drawn as
 *   the composition the dialog port's header documents (ghost icon-sm
 *   Button classes + `DIALOG_CLOSE_CLASS` under the kit's close part),
 *   and upstream's `DialogClose asChild` Cancel is the kit's close
 *   part wearing the outline Button classes. Upstream's
 *   Header / Title / Description / Footer anatomy and classes are
 *   preserved.
 * - Label/control pairing is the kit Field's generated-id wiring with
 *   the upstream ids passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes (the login-form pattern);
 *   the Select trigger's upstream `id` lands the same way, via its
 *   Field.
 * - Upstream's Select anatomy (Trigger / Content / Group / Item
 *   elements) collapses into the ported Select's data-driven shape:
 *   the items are props data with the single upstream group carried
 *   as each item's `group` key; the trigger keeps upstream's `w-full`
 *   class (as `triggerClass`).
 * - The message control is drawn directly on
 *   `field.control(h.textarea)` with the textarea port's own
 *   `TEXTAREA_CLASS`, `data-slot` and controlled-value / `input`
 *   wiring: the port's `Textarea` wrapper cannot be called here
 *   because its `TextareaElement` type (`Html.Element`) does not
 *   accept `h.textarea` (a `VoidElement` builder) — a type-level
 *   mismatch in the ui port, replicated faithfully instead (the
 *   feedback-form pattern).
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Button, buttonVariants } from "@/components/ui/button.ts";
import { Card, CardContent, CardFooter } from "@/components/ui/card.ts";
import {
  DIALOG_CLOSE_CLASS,
  Dialog,
  DialogFooter,
  DialogHeader,
  XIcon,
  type DialogParts,
} from "@/components/ui/dialog.ts";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field.ts";
import { Input } from "@/components/ui/input.ts";
import { Select, type SelectItem } from "@/components/ui/select.ts";

const CATEGORY_ITEMS: ReadonlyArray<SelectItem> = [
  { value: "general", label: "General", group: "category" },
  { value: "bug", label: "Bug Report", group: "category" },
  { value: "feature", label: "Feature Request", group: "category" },
  { value: "improvement", label: "Improvement", group: "category" },
];
import { TEXTAREA_CLASS } from "@/components/ui/textarea.ts";
import { cn } from "@/lib/utils";

// Minimal font name data the card displays, copied from upstream
// `apps/v4/app/(app)/(create)/lib/fonts.ts` (FONTS, built from
// `apps/v4/lib/font-definitions.ts` titles). Only the entries the
// default selection resolves to are inlined.
const FONTS: ReadonlyArray<{ readonly name: string; readonly value: string }> = [
  { name: "Geist", value: "geist" },
  { name: "Inter", value: "inter" },
];

// Upstream `DEFAULT_CONFIG` (apps/v4/registry/config.ts): the values
// `useDesignSystemSearchParams` reports when no params are present.
const params: { readonly font: string; readonly fontHeading: string } = {
  font: "inter",
  fontHeading: "inherit",
};

const currentFont = FONTS.find((font) => font.value === params.font);
const currentFontHeading = FONTS.find((font) => font.value === params.fontHeading);
const headingLabel =
  currentFontHeading?.name && currentFontHeading.name !== currentFont?.name
    ? currentFontHeading.name
    : "Inherit";
const bodyLabel = currentFont?.name ?? "Default";

export const TypographySpecimenMessage = UiSchema.TaggedEnum({
  RequestedOpen: {},
  RequestedClose: {},
  UpdatedName: { value: Schema.String },
  UpdatedEmail: { value: Schema.String },
  UpdatedMessage: { value: Schema.String },
  PickedCategory: { value: Schema.String },
  RequestedOpenCategory: {},
  RequestedCloseCategory: {},
  Submitted: {},
});

export const TypographySpecimen = Html.component({
  name: "TypographySpecimen",
  model: Schema.Struct({
    open: Schema.Boolean,
    name: Schema.String,
    email: Schema.String,
    category: Schema.String,
    categoryOpen: Schema.Boolean,
    message: Schema.String,
  }),
  message: TypographySpecimenMessage,
}).make({
  init: () => ({
    open: false,
    name: "",
    email: "",
    category: "general",
    categoryOpen: false,
    message: "",
  }),
  update: {
    RequestedOpen: ($) => $.evolve({ open: true }),
    RequestedClose: ($) => $.evolve({ open: false }),
    UpdatedName: ($, { value }) => $.evolve({ name: value }),
    UpdatedEmail: ($, { value }) => $.evolve({ email: value }),
    UpdatedMessage: ($, { value }) => $.evolve({ message: value }),
    PickedCategory: ($, { value }) => $.evolve({ category: value }),
    RequestedOpenCategory: ($) => $.evolve({ categoryOpen: true }),
    RequestedCloseCategory: ($) => $.evolve({ categoryOpen: false }),
    // Placeholder handler, as upstream: no feedback is sent.
    Submitted: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h).children(
      CardContent(h, { class: "flex flex-col gap-2" }).children(
        h.div
          .class("text-xs font-medium text-muted-foreground uppercase")
          .children(`${headingLabel} - ${bodyLabel}`),
        h.p
          .class(
            "cn-font-heading text-2xl font-medium style-sera:text-lg style-sera:font-semibold style-sera:tracking-wider style-sera:uppercase",
          )
          .children("Designing with rhythm and hierarchy."),
        h.p
          .class("text-sm leading-relaxed text-muted-foreground")
          .children(
            "A strong body style keeps long-form content readable and balances the visual weight of headings.",
          ),
        h.p
          .class("text-sm leading-relaxed text-muted-foreground")
          .children(
            "Thoughtful spacing and cadence help paragraphs scan quickly without feeling dense.",
          ),
      ),
      CardFooter(h).children(
        Dialog(h, {
          props: { open: model.open },
          onEmit: {
            RequestedOpen: () => TypographySpecimenMessage.RequestedOpen(),
            RequestedClose: () => TypographySpecimenMessage.RequestedClose(),
            Settled: () => undefined,
          },
          view: (dialog: DialogParts) =>
            h.div(
              dialog
                .trigger(Button(h, { variant: "outline", class: "w-full" }))
                .children("Share Feedback"),
              dialog.portal(h.dialog)?.children(
                dialog.backdrop(h.div),
                dialog.viewport(h.div).children(
                  dialog.popup(h.div).children(
                    DialogHeader(h).children(
                      dialog.title(h.h2).children("Share Feedback"),
                      dialog
                        .description(h.p)
                        .children("Let us know how we can improve your experience."),
                    ),
                    FieldGroup(h).children(
                      h.div.class("grid grid-cols-2 gap-3").children(
                        Field(h, {
                          key: "name",
                          props: { id: "feedback-name" },
                          view: (field) =>
                            field.root(h.div).children(
                              FieldLabel(field.label(h.label)).children("Name"),
                              Input(h, {
                                element: field.control(h.input),
                                props: { value: model.name },
                                onUpdate: ({ value }) =>
                                  TypographySpecimenMessage.UpdatedName({ value }),
                              }).attr("placeholder", "Your name"),
                            ),
                        }),
                        Field(h, {
                          key: "email",
                          props: { id: "feedback-email" },
                          view: (field) =>
                            field.root(h.div).children(
                              FieldLabel(field.label(h.label)).children("Email"),
                              Input(h, {
                                element: field.control(h.input),
                                props: { value: model.email },
                                onUpdate: ({ value }) =>
                                  TypographySpecimenMessage.UpdatedEmail({ value }),
                                type: "email",
                              }).attr("placeholder", "you@example.com"),
                            ),
                        }),
                      ),
                      Field(h, {
                        key: "category",
                        props: { id: "feedback-category" },
                        view: (field) =>
                          field.root(h.div).children(
                            FieldLabel(field.label(h.label)).children("Category"),
                            Select(h, {
                              props: {
                                open: model.categoryOpen,
                                value: model.category,
                                items: CATEGORY_ITEMS,
                              },
                              onEmit: {
                                RequestedOpen: () =>
                                  TypographySpecimenMessage.RequestedOpenCategory(),
                                RequestedClose: () =>
                                  TypographySpecimenMessage.RequestedCloseCategory(),
                                Picked: ({ value }) =>
                                  TypographySpecimenMessage.PickedCategory({
                                    value: String(value),
                                  }),
                                Settled: () => undefined,
                              },
                              triggerClass: "w-full",
                            }),
                          ),
                      }),
                      Field(h, {
                        key: "message",
                        props: { id: "feedback-message" },
                        view: (field) =>
                          field.root(h.div).children(
                            FieldLabel(field.label(h.label)).children("Message"),
                            field
                              .control(h.textarea)
                              .attr("data-slot", "textarea")
                              .class(cn(TEXTAREA_CLASS, "min-h-24 resize-none"))
                              .value(model.message)
                              .on("input", ({ value }) =>
                                TypographySpecimenMessage.UpdatedMessage({ value }),
                              )
                              .attr("placeholder", "Tell us what's on your mind..."),
                          ),
                      }),
                    ),
                    DialogFooter(h).children(
                      dialog
                        .close(
                          h.button.class(
                            buttonVariants({ variant: "outline", class: "cn-dialog-close" }),
                          ),
                        )
                        .children("Cancel"),
                      Button(h, {
                        onPress: TypographySpecimenMessage.Submitted(),
                      }).children("Submit"),
                    ),
                    dialog
                      .close(
                        h.button.class(
                          cn(
                            buttonVariants({ variant: "ghost", size: "icon-sm" }),
                            DIALOG_CLOSE_CLASS,
                          ),
                        ),
                      )
                      .children(XIcon(h), h.span.class("sr-only").children("Close")),
                  ),
                ),
              ),
            ),
        }),
      ),
    ),
});
