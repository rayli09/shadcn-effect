/**
 * FeedbackForm — shadcn/ui block `preview` (registry/bases/radix/blocks/preview/cards/feedback-form.tsx), bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a Card whose content is a plain `<form id="feedback-form">`
 * with a FieldGroup of two Fields — a NativeSelect "Topic" (an empty
 * placeholder option plus eleven topic options) and a Textarea
 * "Feedback" — and whose footer holds the submit Button bound to the
 * form by its `form` attribute. Here the form is a Component: the
 * NativeSelect and the kit Textarea are controlled, so the topic and
 * feedback values live in the Model and edits arrive as Messages.
 * Submit is a Message whose handler is a deliberate no-op — upstream
 * wires no submit handler either.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `<form>` has no handler, so a browser submit reloads
 *   the page; here submit is captured (`preventDefault`) as the
 *   `Submitted` Message so the example stays put.
 * - Label/control pairing is the kit Field's generated-id wiring with
 *   the upstream ids passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes. The NativeSelect port's
 *   composite wrapper cannot take the upstream `id="topic"` on its
 *   inner `<select>`, so that attribute is not rendered.
 * - The Textarea's upstream `id="feedback"` likewise becomes the
 *   Field `id` prop. The control is drawn directly on
 *   `field.control(h.textarea)` with the textarea port's own
 *   `TEXTAREA_CLASS`, `data-slot` and controlled-value / `input`
 *   wiring: the port's `Textarea` wrapper cannot be called here
 *   because its `TextareaElement` type (`Html.Element`) does not
 *   accept `h.textarea` (a `VoidElement` builder) — a type-level
 *   mismatch in the ui port, replicated faithfully instead.
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Button } from "@/components/ui/button.ts";
import { Card, CardContent, CardFooter } from "@/components/ui/card.ts";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field.ts";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select.ts";
import { TEXTAREA_CLASS } from "@/components/ui/textarea.ts";
import { cn } from "@/lib/utils";

export const FeedbackFormMessage = UiSchema.TaggedEnum({
  UpdatedTopic: { value: Schema.String },
  UpdatedFeedback: { value: Schema.String },
  Submitted: {},
});

const TOPIC_OPTIONS = [
  { value: "", label: "Select a topic" },
  { value: "ai", label: "AI" },
  { value: "accounts-and-access-controls", label: "Accounts and Access Controls" },
  { value: "billing", label: "Billing" },
  { value: "cdn", label: "CDN (Firewall, Caching)" },
  { value: "ci-cd", label: "CI/CD (Builds, Deployments, Environment Variables)" },
  { value: "dashboard-interface", label: "Dashboard Interface (Navigation, UI Issues)" },
  { value: "domains", label: "Domains" },
  { value: "frameworks", label: "Frameworks" },
  { value: "marketplace-and-integrations", label: "Marketplace and Integrations" },
  { value: "observability", label: "Observability (Observability, Logs, Monitoring)" },
  { value: "storage", label: "Storage" },
] as const;

export const FeedbackForm = Html.component({
  name: "PreviewFeedbackForm",
  model: Schema.Struct({ topic: Schema.String, feedback: Schema.String }),
  message: FeedbackFormMessage,
}).make({
  init: () => ({ topic: "", feedback: "" }),
  update: {
    UpdatedTopic: ($, { value }) => $.evolve({ topic: value }),
    UpdatedFeedback: ($, { value }) => $.evolve({ feedback: value }),
    // Placeholder handler, as upstream: no submission happens.
    Submitted: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h).children(
      CardContent(h).children(
        h.form
          .attr("id", "feedback-form")
          .on("submit", FeedbackFormMessage.Submitted(), { preventDefault: true })
          .children(
            FieldGroup(h).children(
              Field(h, {
                key: "topic",
                props: { id: "topic" },
                view: (field) =>
                  field.root(h.div).children(
                    FieldLabel(field.label(h.label)).children("Topic"),
                    NativeSelect(h, {
                      props: { value: model.topic },
                      onChange: ({ value }) => FeedbackFormMessage.UpdatedTopic({ value }),
                      children: TOPIC_OPTIONS.map((option) =>
                        NativeSelectOption(h, { props: { value: option.value } }).children(
                          option.label,
                        ),
                      ),
                    }),
                  ),
              }),
              Field(h, {
                key: "feedback",
                props: { id: "feedback" },
                view: (field) =>
                  field.root(h.div).children(
                    FieldLabel(field.label(h.label)).children("Feedback"),
                    field
                      .control(h.textarea)
                      .attr("data-slot", "textarea")
                      .class(cn(TEXTAREA_CLASS))
                      .value(model.feedback)
                      .on("input", ({ value }) => FeedbackFormMessage.UpdatedFeedback({ value }))
                      .attr("placeholder", "Your feedback helps us improve..."),
                  ),
              }),
            ),
          ),
      ),
      CardFooter(h).children(
        Button(h, { props: { type: "submit" }, class: "style-sera:w-full" })
          .attr("form", "feedback-form")
          .children("Submit"),
      ),
    ),
});
