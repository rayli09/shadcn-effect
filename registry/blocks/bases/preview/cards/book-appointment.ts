/**
 * BookAppointment — shadcn/ui block `preview`
 * (registry/bases/radix/blocks/preview/cards/book-appointment.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a React function rendering a Card for booking with
 * Dr. Sarah Chen: a Field whose label names the date and whose
 * control is a multiple ToggleGroup of four time slots (the first
 * preselected via `defaultValue`), an Alert for new patients, and a
 * full-width footer button. Here: a Component — the kit ToggleGroup
 * is controlled, so the pressed slots live in the Model (initialised
 * to upstream's `defaultValue`) and changes arrive as the
 * `ToggledSlots` Message. The footer button is upstream's placeholder
 * (no handler), sent as the no-op `PressedBook` Message.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream imports `IconPlaceholder` but never renders it — nothing
 *   to port.
 * - Label/control pairing is the kit Field's generated-id wiring
 *   instead of hand-written `htmlFor` / `id` attributes (as in the
 *   login-01 port).
 * - Upstream's footer button has no handler, so a click does nothing;
 *   here it is captured as the `PressedBook` Message whose handler is
 *   a deliberate no-op — replace it in `update` to make the example
 *   real.
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.ts";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.ts";

const times: ReadonlyArray<string> = ["9:00 AM", "10:30 AM", "11:00 AM", "1:30 PM"];

export const BookAppointmentMessage = UiSchema.TaggedEnum({
  ToggledSlots: { value: Schema.Array(Schema.String) },
  PressedBook: {},
});

export const BookAppointment = Html.component({
  name: "PreviewBookAppointment",
  model: Schema.Struct({ slots: Schema.Array(Schema.String) }),
  message: BookAppointmentMessage,
}).make({
  init: () => ({ slots: ["slot-0"] }),
  update: {
    ToggledSlots: ($, { value }) => $.evolve({ slots: [...value] }),
    // Placeholder handler, as upstream: no booking happens.
    PressedBook: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h).children(
      CardHeader(h).children(
        CardTitle(h).children("Book Appointment"),
        CardDescription(h).children("Dr. Sarah Chen · Cardiology"),
      ),
      CardContent(h, { class: "flex flex-col gap-4" }).children(
        FieldGroup(h).children(
          Field(h, {
            key: "slots",
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("Available on March 18, 2026"),
                ToggleGroup(h, {
                  props: {
                    value: model.slots,
                    items: times.map((_, index) => ({ value: `slot-${index}` })),
                    multiple: true,
                  },
                  spacing: 2,
                  onToggled: (value) => BookAppointmentMessage.ToggledSlots({ value }),
                  view: (group) =>
                    group.root(h.div).children(
                      times.map((time, index) =>
                        ToggleGroupItem(group, {
                          element: h.button.key(time),
                          value: `slot-${index}`,
                        }).children(time),
                      ),
                    ),
                }),
              ),
          }),
        ),
        Alert(h).children(
          AlertTitle(h).children("New patient?"),
          AlertDescription(h).children("Please arrive 15 minutes early."),
        ),
      ),
      CardFooter(h).children(
        Button(h, { class: "w-full", onPress: BookAppointmentMessage.PressedBook() }).children(
          "Book Appointment",
        ),
      ),
    ),
});
