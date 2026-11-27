/**
 * ReceivingMethod — shadcn/ui block `preview-02`
 * (cards/receiving-method.tsx), bases generation, ported 1:1 to
 * Effect UI.
 *
 * Upstream: a stateless React function rendering a Card with an
 * uncontrolled account-holder Input (`defaultValue`), a RadioGroup
 * (`defaultValue="bank"`) whose two options are Field-styled labels with
 * titles and descriptions, an IBAN Input, and a disabled Save button.
 * Here: a Component — the kit Input and RadioGroup are controlled
 * (D-7), so the field values and the picked method live in the Model
 * and edits arrive as Messages. The header close button is a Message
 * whose handler is a deliberate no-op, as upstream wires nothing.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `IconPlaceholder` is ported as its lucide rendering only:
 *   the shared `XIcon` builder from `@/lib/icons`.
 * - The RadioGroup port composes its items from a spec (D-6) and cannot
 *   nest a Field inside each item, so upstream's per-option
 *   FieldLabel/Field/FieldTitle/FieldDescription anatomy is drawn as
 *   two static FieldContent rows in the same grid below the group, and
 *   each radio carries its title as the item spec's `label`
 *   (aria-label). The option copy is verbatim; the label-click-to-select
 *   wiring of upstream's wrapping FieldLabel is not reproduced.
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
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field.ts";
import { Input } from "@/components/ui/input.ts";
import { RadioGroup } from "@/components/ui/radio-group.ts";
import { XIcon } from "@/lib/icons";

export const ReceivingMethodMessage = UiSchema.TaggedEnum({
  UpdatedAccountHolder: { value: Schema.String },
  PickedMethod: { value: Schema.String },
  UpdatedIban: { value: Schema.String },
  PressedClose: {},
});

export const ReceivingMethod = Html.component({
  name: "Preview02ReceivingMethod",
  model: Schema.Struct({
    accountHolder: Schema.String,
    method: Schema.String,
    iban: Schema.String,
  }),
  message: ReceivingMethodMessage,
}).make({
  init: () => ({
    accountHolder: "Synthetic Horizons Music LLC",
    method: "bank",
    iban: "",
  }),
  update: {
    UpdatedAccountHolder: ($, { value }) => $.evolve({ accountHolder: value }),
    PickedMethod: ($, { value }) => $.evolve({ method: value }),
    UpdatedIban: ($, { value }) => $.evolve({ iban: value }),
    // Placeholder handler, as upstream: the close button does nothing.
    PressedClose: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h).children(
      CardHeader(h).children(
        CardDescription(h).children("Payout Preferences"),
        CardTitle(h).children("Receiving Method"),
        CardAction(h).children(
          Button(h, {
            variant: "ghost",
            size: "icon-sm",
            class: "bg-muted",
            onPress: ReceivingMethodMessage.PressedClose(),
          }).children(XIcon(h)),
        ),
      ),
      CardContent(h).children(
        FieldGroup(h).children(
          Field(h, {
            key: "account-holder",
            props: { id: "account-holder" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("Account Holder Name"),
                Input(h, {
                  element: field.control(h.input),
                  props: { value: model.accountHolder },
                  onUpdate: ({ value }) => ReceivingMethodMessage.UpdatedAccountHolder({ value }),
                }),
              ),
          }),
          FieldSet(h).children(
            FieldLegend(h, { variant: "label" }).children("Receiving Method"),
            RadioGroup(h, {
              props: {
                value: model.method,
                name: "method",
                items: [
                  { value: "bank", label: "Bank Transfer" },
                  { value: "paypal", label: "PayPal" },
                ],
              },
              onPick: ({ value }) => ReceivingMethodMessage.PickedMethod({ value }),
              class: "grid grid-cols-1 items-start gap-3 md:grid-cols-2 style-sera:grid-cols-1",
            }),
            h.div
              .class("grid grid-cols-1 items-start gap-3 md:grid-cols-2 style-sera:grid-cols-1")
              .children(
                FieldContent(h).children(
                  FieldTitle(h).children("Bank Transfer"),
                  FieldDescription(h.p).children("SWIFT / IBAN"),
                ),
                FieldContent(h).children(
                  FieldTitle(h).children("PayPal"),
                  FieldDescription(h.p, { class: "line-clamp-1" }).children("Instant Payout"),
                ),
              ),
          ),
          Field(h, {
            key: "iban",
            props: { id: "iban" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("IBAN / Account Number"),
                Input(h, {
                  element: field.control(h.input),
                  props: { value: model.iban },
                  onUpdate: ({ value }) => ReceivingMethodMessage.UpdatedIban({ value }),
                }).attr("placeholder", "DE89 3704 0044 ...."),
              ),
          }),
        ),
      ),
      CardFooter(h).children(
        Button(h, { class: "w-full", props: { disabled: true } }).children("Save Payout Settings"),
      ),
    ),
});
