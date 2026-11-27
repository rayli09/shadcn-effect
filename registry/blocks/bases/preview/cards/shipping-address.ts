/**
 * ShippingAddress — shadcn/ui block `preview`
 * (cards/shipping-address.tsx), bases generation, ported 1:1 to
 * Effect UI.
 *
 * Upstream: a "use client" React function rendering a Card with a
 * shipping-address form — street / apt / city / state / ZIP / country
 * fields (uncontrolled Inputs with placeholders, two Selects defaulted
 * to "CA" and "US", a default-checked "Save as default address"
 * Checkbox), and Cancel / Save Address footer Buttons with no
 * handlers. Here the card is a Component: the kit `Input` is
 * controlled (D-7) and the kit Select / Checkbox are controlled too,
 * so every field value lives in the Model, seeded with upstream's
 * defaults (empty inputs, state "CA", country "US", save-default
 * checked), and edits arrive as Messages. Cancel and Save Address are
 * Messages whose handlers are deliberate no-ops — upstream wires no
 * submit either; replace them in `update` to make the example real.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Label/control pairing is the kit Field's generated-id wiring with
 *   the upstream ids passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes (the login-form pattern).
 *   The Select triggers' upstream `id` props land the same way, via
 *   their Fields.
 * - Upstream's Select anatomy (Trigger / Content / Group / Item
 *   elements) collapses into the ported Select's data-driven shape:
 *   the items are props data with the single upstream group carried as
 *   each item's `group` key; the trigger keeps upstream's `w-full`
 *   class (as `triggerClass`) and the displayed value is the Model's.
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field.ts";
import { Input } from "@/components/ui/input.ts";
import { Select, type SelectItem } from "@/components/ui/select.ts";

const STATE_ITEMS: ReadonlyArray<SelectItem> = [
  { value: "CA", label: "California", group: "state" },
  { value: "NY", label: "New York", group: "state" },
  { value: "TX", label: "Texas", group: "state" },
];

const COUNTRY_ITEMS: ReadonlyArray<SelectItem> = [
  { value: "US", label: "United States", group: "country" },
  { value: "CA", label: "Canada", group: "country" },
  { value: "UK", label: "United Kingdom", group: "country" },
];

export const ShippingAddressMessage = UiSchema.TaggedEnum({
  UpdatedStreet: { value: Schema.String },
  UpdatedApt: { value: Schema.String },
  UpdatedCity: { value: Schema.String },
  UpdatedZip: { value: Schema.String },
  PickedState: { value: Schema.String },
  PickedCountry: { value: Schema.String },
  RequestedOpenState: {},
  RequestedCloseState: {},
  RequestedOpenCountry: {},
  RequestedCloseCountry: {},
  ToggledSaveDefault: { checked: Schema.Boolean },
  PressedCancel: {},
  PressedSave: {},
});

export const ShippingAddress = Html.component({
  name: "ShippingAddress",
  model: Schema.Struct({
    street: Schema.String,
    apt: Schema.String,
    city: Schema.String,
    state: Schema.String,
    zip: Schema.String,
    country: Schema.String,
    stateOpen: Schema.Boolean,
    countryOpen: Schema.Boolean,
    saveDefault: Schema.Boolean,
  }),
  message: ShippingAddressMessage,
}).make({
  init: () => ({
    street: "",
    apt: "",
    city: "",
    state: "CA",
    zip: "",
    country: "US",
    stateOpen: false,
    countryOpen: false,
    saveDefault: true,
  }),
  update: {
    UpdatedStreet: ($, { value }) => $.evolve({ street: value }),
    UpdatedApt: ($, { value }) => $.evolve({ apt: value }),
    UpdatedCity: ($, { value }) => $.evolve({ city: value }),
    UpdatedZip: ($, { value }) => $.evolve({ zip: value }),
    PickedState: ($, { value }) => $.evolve({ state: value }),
    PickedCountry: ($, { value }) => $.evolve({ country: value }),
    RequestedOpenState: ($) => $.evolve({ stateOpen: true }),
    RequestedCloseState: ($) => $.evolve({ stateOpen: false }),
    RequestedOpenCountry: ($) => $.evolve({ countryOpen: true }),
    RequestedCloseCountry: ($) => $.evolve({ countryOpen: false }),
    ToggledSaveDefault: ($, { checked }) => $.evolve({ saveDefault: checked }),
    // Placeholder handlers, as upstream: no submit happens.
    PressedCancel: ($) => $.evolve({}),
    PressedSave: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h).children(
      CardHeader(h).children(
        CardTitle(h).children("Shipping Address"),
        CardDescription(h).children("Where should we deliver?"),
      ),
      CardContent(h).children(
        FieldGroup(h).children(
          Field(h, {
            key: "street",
            props: { id: "shipping-street" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("Street address"),
                Input(h, {
                  element: field.control(h.input),
                  props: { value: model.street },
                  onUpdate: ({ value }) => ShippingAddressMessage.UpdatedStreet({ value }),
                }).attr("placeholder", "123 Main Street"),
              ),
          }),
          Field(h, {
            key: "apt",
            props: { id: "shipping-apt" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("Apt / Suite"),
                Input(h, {
                  element: field.control(h.input),
                  props: { value: model.apt },
                  onUpdate: ({ value }) => ShippingAddressMessage.UpdatedApt({ value }),
                }).attr("placeholder", "Apt 4B"),
              ),
          }),
          FieldGroup(h, { class: "grid grid-cols-2" }).children(
            Field(h, {
              key: "city",
              props: { id: "shipping-city" },
              view: (field) =>
                field.root(h.div).children(
                  FieldLabel(field.label(h.label)).children("City"),
                  Input(h, {
                    element: field.control(h.input),
                    props: { value: model.city },
                    onUpdate: ({ value }) => ShippingAddressMessage.UpdatedCity({ value }),
                  }).attr("placeholder", "San Francisco"),
                ),
            }),
            Field(h, {
              key: "state",
              props: { id: "shipping-state" },
              view: (field) =>
                field.root(h.div).children(
                  FieldLabel(field.label(h.label)).children("State"),
                  Select(h, {
                    props: {
                      open: model.stateOpen,
                      value: model.state,
                      items: STATE_ITEMS,
                    },
                    onEmit: {
                      RequestedOpen: () => ShippingAddressMessage.RequestedOpenState(),
                      RequestedClose: () => ShippingAddressMessage.RequestedCloseState(),
                      Picked: ({ value }) =>
                        ShippingAddressMessage.PickedState({ value: String(value) }),
                      Settled: () => undefined,
                    },
                    triggerClass: "w-full",
                  }),
                ),
            }),
          ),
          FieldGroup(h, { class: "grid grid-cols-2" }).children(
            Field(h, {
              key: "zip",
              props: { id: "shipping-zip" },
              view: (field) =>
                field.root(h.div).children(
                  FieldLabel(field.label(h.label)).children("ZIP Code"),
                  Input(h, {
                    element: field.control(h.input),
                    props: { value: model.zip },
                    onUpdate: ({ value }) => ShippingAddressMessage.UpdatedZip({ value }),
                  }).attr("placeholder", "94102"),
                ),
            }),
            Field(h, {
              key: "country",
              props: { id: "shipping-country" },
              view: (field) =>
                field.root(h.div).children(
                  FieldLabel(field.label(h.label)).children("Country"),
                  Select(h, {
                    props: {
                      open: model.countryOpen,
                      value: model.country,
                      items: COUNTRY_ITEMS,
                    },
                    onEmit: {
                      RequestedOpen: () => ShippingAddressMessage.RequestedOpenCountry(),
                      RequestedClose: () => ShippingAddressMessage.RequestedCloseCountry(),
                      Picked: ({ value }) =>
                        ShippingAddressMessage.PickedCountry({ value: String(value) }),
                      Settled: () => undefined,
                    },
                    triggerClass: "w-full",
                  }),
                ),
            }),
          ),
          Field(h, {
            key: "save",
            orientation: "horizontal",
            view: (field) =>
              field.root(h.div).children(
                Checkbox(h, {
                  props: { checked: model.saveDefault },
                  onToggle: ({ checked }) => ShippingAddressMessage.ToggledSaveDefault({ checked }),
                }),
                FieldLabel(h.label, { class: "font-normal" }).children("Save as default address"),
              ),
          }),
        ),
      ),
      CardFooter(h).children(
        Button(h, {
          variant: "outline",
          size: "sm",
          onPress: ShippingAddressMessage.PressedCancel(),
        }).children("Cancel"),
        Button(h, {
          size: "sm",
          class: "ml-auto",
          onPress: ShippingAddressMessage.PressedSave(),
        }).children("Save Address"),
      ),
    ),
});
