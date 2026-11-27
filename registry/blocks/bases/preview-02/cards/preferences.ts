/**
 * Preferences — shadcn/ui block `preview-02` (cards/preferences.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card with a currency
 * Select (`defaultValue="usd"`), two horizontal switch Fields
 * (`defaultChecked`), and Reset / Save buttons. Here: a Component — the
 * kit Select and Switch are controlled (D-7), so the currency, the
 * select's open state, and both switch values live in the Model and
 * changes arrive as Messages. Reset / Save / the header close button are
 * Messages whose handlers are deliberate no-ops — upstream wires no
 * behavior either.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `IconPlaceholder` (a create-app component that swaps icon
 *   libraries) is ported as its lucide rendering only: the shared `XIcon`
 *   builder from `@/lib/icons`.
 * - Label/control pairing is the kit Field's generated-id wiring with
 *   the upstream ids passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes (the login-01 convention).
 *   For the two switch rows the Switch is a sibling of the label inside
 *   the Field, not the Field's control part — the kit Switch is a
 *   button, not a form control the Field can adopt.
 * - The Select's `w-full` trigger class goes through the port's
 *   `triggerClass` option; the upstream `id` on the trigger is subsumed
 *   by the Field `id` above.
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
  FieldSeparator,
} from "@/components/ui/field.ts";
import { Select } from "@/components/ui/select.ts";
import { Switch } from "@/components/ui/switch.ts";
import { XIcon } from "@/lib/icons";

const CURRENCIES = [
  { value: "usd", label: "USD — United States Dollar" },
  { value: "eur", label: "EUR — Euro" },
  { value: "gbp", label: "GBP — British Pound" },
  { value: "jpy", label: "JPY — Japanese Yen" },
] as const;

export const PreferencesMessage = UiSchema.TaggedEnum({
  SelectOpened: {},
  SelectClosed: {},
  SelectPicked: { value: Schema.NullOr(Schema.String) },
  ToggledPublicStatistics: { checked: Schema.Boolean },
  ToggledEmailNotifications: { checked: Schema.Boolean },
  PressedClose: {},
  PressedReset: {},
  PressedSave: {},
});

export const Preferences = Html.component({
  name: "Preview02Preferences",
  model: Schema.Struct({
    currency: Schema.NullOr(Schema.String),
    selectOpen: Schema.Boolean,
    publicStatistics: Schema.Boolean,
    emailNotifications: Schema.Boolean,
  }),
  message: PreferencesMessage,
}).make({
  init: () => ({
    currency: "usd",
    selectOpen: false,
    publicStatistics: true,
    emailNotifications: true,
  }),
  update: {
    SelectOpened: ($) => $.evolve({ selectOpen: true }),
    SelectClosed: ($) => $.evolve({ selectOpen: false }),
    SelectPicked: ($, { value }) => $.evolve({ currency: value }),
    ToggledPublicStatistics: ($, { checked }) => $.evolve({ publicStatistics: checked }),
    ToggledEmailNotifications: ($, { checked }) => $.evolve({ emailNotifications: checked }),
    // Placeholder handlers, as upstream: no settings are persisted.
    PressedClose: ($) => $.evolve({}),
    PressedReset: ($) => $.evolve({}),
    PressedSave: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h).children(
      CardHeader(h).children(
        CardTitle(h).children("Preferences"),
        CardDescription(h).children("Manage your account settings and notifications."),
        CardAction(h).children(
          Button(h, {
            variant: "ghost",
            size: "icon-sm",
            class: "bg-muted",
            onPress: PreferencesMessage.PressedClose(),
          }).children(XIcon(h)),
        ),
      ),
      CardContent(h).children(
        FieldGroup(h).children(
          Field(h, {
            key: "default-currency",
            props: { id: "default-currency" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("Default Currency"),
                Select(h, {
                  props: {
                    open: model.selectOpen,
                    value: model.currency,
                    items: CURRENCIES.map((item) => ({ ...item })),
                  },
                  onEmit: {
                    RequestedOpen: () => PreferencesMessage.SelectOpened(),
                    RequestedClose: () => PreferencesMessage.SelectClosed(),
                    Picked: ({ value }) =>
                      PreferencesMessage.SelectPicked({
                        value: typeof value === "string" ? value : null,
                      }),
                    Settled: () => undefined,
                  },
                  triggerClass: "w-full",
                }),
              ),
          }),
          FieldSeparator(h, { class: "-my-4 style-sera:hidden" }),
          Field(h, {
            key: "public-statistics",
            orientation: "horizontal",
            props: { id: "public-statistics", described: true },
            view: (field) =>
              field.root(h.div).children(
                FieldContent(h).children(
                  FieldLabel(field.label(h.label)).children("Public Statistics"),
                  FieldDescription(field.description(h.p)).children(
                    "Allow others to see your total stream count and listening activity",
                  ),
                ),
                Switch(h, {
                  props: { checked: model.publicStatistics, name: "public-statistics" },
                  onToggle: ({ checked }) =>
                    PreferencesMessage.ToggledPublicStatistics({ checked }),
                }),
              ),
          }),
          FieldSeparator(h, { class: "-my-4 style-sera:hidden" }),
          Field(h, {
            key: "email-notifications",
            orientation: "horizontal",
            props: { id: "email-notifications", described: true },
            view: (field) =>
              field.root(h.div).children(
                FieldContent(h).children(
                  FieldLabel(field.label(h.label)).children("Email Notifications"),
                  FieldDescription(field.description(h.p)).children(
                    "Monthly royalty reports and distribution updates",
                  ),
                ),
                Switch(h, {
                  props: { checked: model.emailNotifications, name: "email-notifications" },
                  onToggle: ({ checked }) =>
                    PreferencesMessage.ToggledEmailNotifications({ checked }),
                }),
              ),
          }),
        ),
      ),
      CardFooter(h).children(
        Button(h, { variant: "outline", onPress: PreferencesMessage.PressedReset() }).children(
          "Reset",
        ),
        Button(h, { class: "ml-auto", onPress: PreferencesMessage.PressedSave() }).children(
          "Save Preferences",
        ),
      ),
    ),
});
