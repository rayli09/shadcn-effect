/**
 * ReportBug — shadcn/ui block `preview` (registry/bases/radix/blocks/preview/cards/report-bug.tsx), bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a Card titled "Report Bug" ("Help us fix issues
 * faster.") whose content is a FieldGroup — a Title Input, a
 * two-column grid holding a Severity Select (Critical / High /
 * Medium / Low, default "medium") and a Component Select (Dashboard
 * / Auth / API / Billing, default "dashboard"), and a "Steps to
 * reproduce" Textarea with a multi-line placeholder — and whose
 * footer is a horizontal Field with "Attach File" (outline) and
 * "Submit Bug" Buttons. Here the card is a Component: the kit Input
 * and Textarea are controlled (D-7) and the kit Selects are
 * controlled, so the title, steps and both selections (plus the
 * open select) live in the Model and edits / picks arrive as
 * Messages. Both footer Buttons are Messages whose handlers are
 * deliberate no-ops — upstream wires no handlers either.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's Select anatomy (SelectTrigger / SelectContent /
 *   SelectGroup / SelectItem / SelectValue) collapses into the
 *   select port's single `Select` component, exactly as that port
 *   declares; each trigger's `w-full` becomes its `triggerClass`,
 *   and the triggers' upstream `id`s (`bug-severity`,
 *   `bug-component`) become the kit selects' `id` props.
 * - Label/control pairing for the Title and Steps fields is the kit
 *   Field's generated-id wiring with the upstream ids passed as the
 *   Field `id` prop, instead of hand-written `htmlFor` / `id`
 *   attributes; the Select fields draw their Select inside the
 *   field root without `field.control` stacking (the select is
 *   composite).
 * - The selects' open state is Model state — at most one select is
 *   open at a time.
 * - The Textarea's multi-line placeholder keeps upstream's literal
 *   newline characters (`1. Go to\n2. Click on\n3. Observe...`).
 * - The Steps control is drawn directly on
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field.ts";
import { Input } from "@/components/ui/input.ts";
import { Select } from "@/components/ui/select.ts";
import { TEXTAREA_CLASS } from "@/components/ui/textarea.ts";
import { cn } from "@/lib/utils";

export const ReportBugMessage = UiSchema.TaggedEnum({
  UpdatedTitle: { value: Schema.String },
  UpdatedSteps: { value: Schema.String },
  SeveritySelectOpened: {},
  ComponentSelectOpened: {},
  SelectClosed: {},
  SeverityPicked: { value: Schema.String },
  ComponentPicked: { value: Schema.String },
  PressedAttachFile: {},
  PressedSubmitBug: {},
});

const SEVERITY_ITEMS = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;

const COMPONENT_ITEMS = [
  { value: "dashboard", label: "Dashboard" },
  { value: "auth", label: "Auth" },
  { value: "api", label: "API" },
  { value: "billing", label: "Billing" },
] as const;

export const ReportBug = Html.component({
  name: "PreviewReportBug",
  model: Schema.Struct({
    title: Schema.String,
    steps: Schema.String,
    severity: Schema.String,
    component: Schema.String,
    openSelect: Schema.NullOr(Schema.String),
  }),
  message: ReportBugMessage,
}).make({
  init: () => ({
    title: "",
    steps: "",
    severity: "medium",
    component: "dashboard",
    openSelect: null,
  }),
  update: {
    UpdatedTitle: ($, { value }) => $.evolve({ title: value }),
    UpdatedSteps: ($, { value }) => $.evolve({ steps: value }),
    SeveritySelectOpened: ($) => $.evolve({ openSelect: "severity" }),
    ComponentSelectOpened: ($) => $.evolve({ openSelect: "component" }),
    SelectClosed: ($) => $.evolve({ openSelect: null }),
    SeverityPicked: ($, { value }) => $.evolve({ severity: value, openSelect: null }),
    ComponentPicked: ($, { value }) => $.evolve({ component: value, openSelect: null }),
    // Placeholder handlers, as upstream: no file is attached and no bug is submitted.
    PressedAttachFile: ($) => $.evolve({}),
    PressedSubmitBug: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h).children(
      CardHeader(h).children(
        CardTitle(h).children("Report Bug"),
        CardDescription(h).children("Help us fix issues faster."),
      ),
      CardContent(h).children(
        FieldGroup(h).children(
          Field(h, {
            key: "bug-title",
            props: { id: "bug-title" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("Title"),
                Input(h, {
                  element: field.control(h.input),
                  props: { value: model.title },
                  onUpdate: ({ value }) => ReportBugMessage.UpdatedTitle({ value }),
                }).attr("placeholder", "Brief description of the issue"),
              ),
          }),
          h.div.class("grid grid-cols-2 gap-3").children(
            Field(h, {
              key: "bug-severity",
              props: { id: "bug-severity" },
              view: (field) =>
                field.root(h.div).children(
                  FieldLabel(field.label(h.label)).children("Severity"),
                  Select(h, {
                    props: {
                      open: model.openSelect === "severity",
                      value: model.severity,
                      id: "bug-severity",
                      items: [...SEVERITY_ITEMS],
                    },
                    onEmit: {
                      RequestedOpen: () => ReportBugMessage.SeveritySelectOpened(),
                      RequestedClose: () => ReportBugMessage.SelectClosed(),
                      Picked: ({ value }) =>
                        typeof value === "string"
                          ? ReportBugMessage.SeverityPicked({ value })
                          : undefined,
                      Settled: () => undefined,
                    },
                    triggerClass: "w-full",
                  }),
                ),
            }),
            Field(h, {
              key: "bug-component",
              props: { id: "bug-component" },
              view: (field) =>
                field.root(h.div).children(
                  FieldLabel(field.label(h.label)).children("Component"),
                  Select(h, {
                    props: {
                      open: model.openSelect === "component",
                      value: model.component,
                      id: "bug-component",
                      items: [...COMPONENT_ITEMS],
                    },
                    onEmit: {
                      RequestedOpen: () => ReportBugMessage.ComponentSelectOpened(),
                      RequestedClose: () => ReportBugMessage.SelectClosed(),
                      Picked: ({ value }) =>
                        typeof value === "string"
                          ? ReportBugMessage.ComponentPicked({ value })
                          : undefined,
                      Settled: () => undefined,
                    },
                    triggerClass: "w-full",
                  }),
                ),
            }),
          ),
          Field(h, {
            key: "bug-steps",
            props: { id: "bug-steps" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("Steps to reproduce"),
                field
                  .control(h.textarea)
                  .attr("data-slot", "textarea")
                  .class(cn(TEXTAREA_CLASS, "min-h-24 resize-none"))
                  .value(model.steps)
                  .on("input", ({ value }) => ReportBugMessage.UpdatedSteps({ value }))
                  .attr("placeholder", "1. Go to\n2. Click on\n3. Observe..."),
              ),
          }),
        ),
      ),
      CardFooter(h).children(
        Field(h, {
          key: "actions",
          orientation: "horizontal",
          class: "justify-end style-sera:justify-center",
          view: (field) =>
            field.root(h.div).children(
              Button(h, {
                variant: "outline",
                class: "style-sera:flex-1",
                onPress: ReportBugMessage.PressedAttachFile(),
              }).children("Attach File"),
              Button(h, {
                class: "style-sera:flex-1",
                onPress: ReportBugMessage.PressedSubmitBug(),
              }).children("Submit Bug"),
            ),
        }),
      ),
    ),
});
