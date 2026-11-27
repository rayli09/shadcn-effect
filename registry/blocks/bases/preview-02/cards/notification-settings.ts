/**
 * NotificationSettings — shadcn/ui block `preview-02`
 * (cards/notification-settings.tsx), bases generation, ported 1:1 to
 * Effect UI.
 *
 * Upstream: a "use client" React function rendering a Card with a
 * FieldGroup of horizontal Fields — a "Select all" Checkbox (checked,
 * unchecked or indeterminate, derived from the rows) above one
 * Checkbox row per entry of the NOTIFICATIONS data below (verbatim) —
 * and a Save Preferences button in the footer. Here it is a Component:
 * the checked map lives in the Model, seeded from each row's
 * `defaultChecked`, toggles arrive as Messages, and the select-all
 * row's state is derived in the view exactly as upstream derives it.
 * Save Preferences is a Message whose handler is a deliberate no-op —
 * upstream wires no save either.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream spreads no extra props; the only prop here is `class`,
 *   appended to the Card's classes.
 * - Label/control pairing is the kit Field's generated-id wiring with
 *   the upstream ids passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes; the Checkbox itself is
 *   the kit Checkbox (a button), not the Field's labelable control, so
 *   it sits beside the FieldContent rather than under the Field's
 *   `control` part.
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
import { Checkbox } from "@/components/ui/checkbox.ts";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field.ts";

const NOTIFICATIONS = [
  {
    id: "transactions",
    label: "Transaction alerts",
    description: "Deposits, withdrawals, and transfers.",
    defaultChecked: true,
  },
  {
    id: "security",
    label: "Security alerts",
    description: "Login attempts and account changes.",
    defaultChecked: true,
  },
  {
    id: "goals",
    label: "Goal milestones",
    description: "Updates at 25%, 50%, 75%, and 100%.",
    defaultChecked: false,
  },
  {
    id: "market",
    label: "Market updates",
    description: "Daily portfolio summary and price alerts.",
    defaultChecked: false,
  },
];

export const NotificationSettingsMessage = UiSchema.TaggedEnum({
  ToggledAll: { checked: Schema.Boolean },
  Toggled: { id: Schema.String, checked: Schema.Boolean },
  PressedSave: {},
});

export const NotificationSettings = Html.component({
  name: "Preview02NotificationSettings",
  props: Schema.Struct({ class: Schema.optional(Schema.String) }),
  model: Schema.Struct({ checked: Schema.Record(Schema.String, Schema.Boolean) }),
  message: NotificationSettingsMessage,
}).make({
  init: () => ({
    checked: Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, n.defaultChecked])),
  }),
  update: {
    ToggledAll: ($, { checked }) =>
      $.evolve({
        checked: Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, checked])),
      }),
    Toggled: ($, { id, checked }) => $.evolve({ checked: { ...$.model.checked, [id]: checked } }),
    // Placeholder handler, as upstream: nothing is saved.
    PressedSave: ($) => $.evolve({}),
  },
  view: (h, model) => {
    const allChecked = NOTIFICATIONS.every((n) => model.checked[n.id]);
    const someChecked = NOTIFICATIONS.some((n) => model.checked[n.id]) && !allChecked;
    return Card(h, { class: h.props.class }).children(
      CardHeader(h).children(
        CardTitle(h).children("Notifications"),
        CardDescription(h).children("Choose what you want to be notified about."),
      ),
      CardContent(h).children(
        FieldGroup(h).children(
          Field(h, {
            key: "notify-all",
            props: { id: "notify-all" },
            orientation: "horizontal",
            view: (field) =>
              field.root(h.div).children(
                Checkbox(h, {
                  props: { checked: allChecked, indeterminate: someChecked },
                  onToggle: ({ checked }) => NotificationSettingsMessage.ToggledAll({ checked }),
                }),
                FieldContent(h).children(FieldLabel(field.label(h.label)).children("Select all")),
              ),
          }),
          ...NOTIFICATIONS.map((n) =>
            Field(h, {
              key: n.id,
              props: { id: `notify-${n.id}`, described: true },
              orientation: "horizontal",
              view: (field) =>
                field.root(h.div).children(
                  Checkbox(h, {
                    props: { checked: model.checked[n.id] ?? false },
                    onToggle: ({ checked }) =>
                      NotificationSettingsMessage.Toggled({ id: n.id, checked }),
                  }),
                  FieldContent(h).children(
                    FieldLabel(field.label(h.label)).children(n.label),
                    FieldDescription(field.description(h.p)).children(n.description),
                  ),
                ),
            }),
          ),
        ),
      ),
      CardFooter(h).children(
        Button(h, {
          class: "w-full",
          onPress: NotificationSettingsMessage.PressedSave(),
        }).children("Save Preferences"),
      ),
    );
  },
});
