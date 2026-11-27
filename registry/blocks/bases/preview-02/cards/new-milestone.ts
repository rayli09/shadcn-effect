/**
 * NewMilestone — shadcn/ui block `preview-02`
 * (cards/new-milestone.tsx), bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a "use client" React function rendering a Card with a
 * FieldGroup of three uncontrolled inputs (goal name, target amount,
 * target date — the latter two seeded with `defaultValue`) and Create
 * Goal / Cancel buttons in the footer. Here the form is a Component:
 * the kit `Input` is controlled (D-7), so the field values live in the
 * Model (seeded with upstream's defaultValues) and edits arrive as
 * Messages. Create Goal and Cancel are Messages whose handlers are
 * deliberate no-ops — upstream wires no submit either; replace them in
 * `update` to make the example real.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream spreads no extra props; the only prop here is `class`
 *   (upstream's would-be `className` on the Card), appended to the
 *   Card's classes.
 * - Label/control pairing is the kit Field's generated-id wiring with
 *   the upstream ids passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes.
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

export const NewMilestoneMessage = UiSchema.TaggedEnum({
  UpdatedGoalName: { value: Schema.String },
  UpdatedTargetAmount: { value: Schema.String },
  UpdatedTargetDate: { value: Schema.String },
  PressedCreateGoal: {},
  PressedCancel: {},
});

export const NewMilestone = Html.component({
  name: "Preview02NewMilestone",
  props: Schema.Struct({ class: Schema.optional(Schema.String) }),
  model: Schema.Struct({
    goalName: Schema.String,
    targetAmount: Schema.String,
    targetDate: Schema.String,
  }),
  message: NewMilestoneMessage,
}).make({
  init: () => ({ goalName: "", targetAmount: "$15,000", targetDate: "Dec 2025" }),
  update: {
    UpdatedGoalName: ($, { value }) => $.evolve({ goalName: value }),
    UpdatedTargetAmount: ($, { value }) => $.evolve({ targetAmount: value }),
    UpdatedTargetDate: ($, { value }) => $.evolve({ targetDate: value }),
    // Placeholder handlers, as upstream: no goal is created.
    PressedCreateGoal: ($) => $.evolve({}),
    PressedCancel: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h, { class: h.props.class }).children(
      CardHeader(h).children(
        CardTitle(h).children("Set a new milestone"),
        CardDescription(h).children(
          "Define your financial target and we'll help you pace your savings.",
        ),
      ),
      CardContent(h).children(
        FieldGroup(h).children(
          Field(h, {
            key: "goal-name",
            props: { id: "goal-name" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("Goal Name"),
                Input(h, {
                  element: field.control(h.input),
                  props: { value: model.goalName },
                  onUpdate: ({ value }) => NewMilestoneMessage.UpdatedGoalName({ value }),
                }).attr("placeholder", "e.g. New Car, Home Downpayment"),
              ),
          }),
          h.div.class("grid grid-cols-2 gap-3").children(
            Field(h, {
              key: "target-amount",
              props: { id: "target-amount" },
              view: (field) =>
                field.root(h.div).children(
                  FieldLabel(field.label(h.label)).children("Target Amount"),
                  Input(h, {
                    element: field.control(h.input),
                    props: { value: model.targetAmount },
                    onUpdate: ({ value }) => NewMilestoneMessage.UpdatedTargetAmount({ value }),
                  }),
                ),
            }),
            Field(h, {
              key: "target-date",
              props: { id: "target-date" },
              view: (field) =>
                field.root(h.div).children(
                  FieldLabel(field.label(h.label)).children("Target Date"),
                  Input(h, {
                    element: field.control(h.input),
                    props: { value: model.targetDate },
                    onUpdate: ({ value }) => NewMilestoneMessage.UpdatedTargetDate({ value }),
                  }),
                ),
            }),
          ),
        ),
      ),
      CardFooter(h, { class: "flex-col gap-2" }).children(
        Button(h, { class: "w-full", onPress: NewMilestoneMessage.PressedCreateGoal() }).children(
          "Create Goal",
        ),
        Button(h, {
          variant: "outline",
          class: "w-full",
          onPress: NewMilestoneMessage.PressedCancel(),
        }).children("Cancel"),
      ),
    ),
});
