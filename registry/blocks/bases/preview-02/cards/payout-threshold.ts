/**
 * PayoutThreshold — shadcn/ui block `preview-02`
 * (cards/payout-threshold.tsx), bases generation, ported 1:1 to Effect
 * UI.
 *
 * Upstream: a "use client" React function rendering a Card with a
 * FieldGroup of three Fields — a currency Select (default `usd`), a
 * minimum-payout Slider (value held in `useState([2500])`, displayed
 * formatted beside its label, with min/max FieldDescriptions), and a
 * Notes Textarea — plus a ghost close Button in the header action and
 * a Save Threshold button in the footer. Here it is a Component: the
 * slider amount, the Select's open/value and the notes text live in
 * the Model and edits arrive as Messages. The close and save buttons
 * are Messages whose handlers are deliberate no-ops — upstream wires
 * neither.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream spreads no extra props; the only prop here is `class`,
 *   appended to the Card's classes.
 * - Upstream models the slider value as a one-element array
 *   (`useState([2500])`); here it is a plain number in the Model — the
 *   kit Slider accepts a single number for a single thumb, and the
 *   displayed amount is formatted from it exactly as upstream formats
 *   `amount[0]` (`$` + `toFixed(2)`, no thousands separator).
 * - Label/control pairing is the kit Field's generated-id wiring with
 *   the upstream ids passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes; the Select and Slider are
 *   kit components with their own part wiring, so they sit beside the
 *   label rather than under the Field's `control` part. The Slider's
 *   upstream `id="min-payout"` has no counterpart on the kit Slider
 *   (its thumbs take `name` / `ariaLabels`, neither set upstream).
 *   The Notes Textarea is rendered as a raw `h.textarea` wearing the
 *   textarea port's `TEXTAREA_CLASS` and `data-slot`, with the port's
 *   own controlled wiring (`.value(...)` + the `input` event): the
 *   port `Textarea` view function's element type does not accept this
 *   snapshot's void-style `h.textarea` builder, so it cannot be called
 *   inside a Component view at all. It likewise does not stack on the
 *   Field's `control` part; the Field `id` prop carries the pairing.
 * - Upstream's SelectGroup renders no label of its own, so the items
 *   are passed ungrouped (the port Select only draws a group label for
 *   items carrying a `group` key).
 * - Upstream's `IconPlaceholder` is a create-app component that swaps
 *   icon libraries; only its lucide rendering is ported — the `XIcon`
 *   glyph from the shared `@/lib/icons` builders. The tabler /
 *   hugeicons / phosphor / remixicon alternatives are not ported.
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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field.ts";
import { Select } from "@/components/ui/select.ts";
import { Slider } from "@/components/ui/slider.ts";
import { TEXTAREA_CLASS } from "@/components/ui/textarea.ts";
import { XIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export const PayoutThresholdMessage = UiSchema.TaggedEnum({
  CurrencySelectOpened: {},
  CurrencySelectClosed: {},
  CurrencyPicked: { value: Schema.NullOr(Schema.String) },
  MovedAmount: { value: Schema.Number },
  UpdatedNotes: { value: Schema.String },
  PressedClose: {},
  PressedSave: {},
});

export const PayoutThreshold = Html.component({
  name: "Preview02PayoutThreshold",
  props: Schema.Struct({ class: Schema.optional(Schema.String) }),
  model: Schema.Struct({
    amount: Schema.Number,
    currencyOpen: Schema.Boolean,
    currency: Schema.NullOr(Schema.String),
    notes: Schema.String,
  }),
  message: PayoutThresholdMessage,
}).make({
  init: () => ({ amount: 2500, currencyOpen: false, currency: "usd", notes: "" }),
  update: {
    CurrencySelectOpened: ($) => $.evolve({ currencyOpen: true }),
    CurrencySelectClosed: ($) => $.evolve({ currencyOpen: false }),
    CurrencyPicked: ($, { value }) => $.evolve({ currency: value }),
    MovedAmount: ($, { value }) => $.evolve({ amount: value }),
    UpdatedNotes: ($, { value }) => $.evolve({ notes: value }),
    // Placeholder handlers, as upstream: nothing is closed or saved.
    PressedClose: ($) => $.evolve({}),
    PressedSave: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h, { class: h.props.class }).children(
      CardHeader(h).children(
        CardTitle(h).children("Payout Threshold"),
        CardDescription(h).children(
          "Set the minimum balance required before a payout is triggered.",
        ),
        CardAction(h).children(
          Button(h, {
            variant: "ghost",
            size: "icon-sm",
            class: "bg-muted",
            onPress: PayoutThresholdMessage.PressedClose(),
          }).children(XIcon(h)),
        ),
      ),
      CardContent(h).children(
        FieldGroup(h).children(
          Field(h, {
            key: "preferred-currency",
            props: { id: "preferred-currency" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("Preferred Currency"),
                Select(h, {
                  props: {
                    open: model.currencyOpen,
                    value: model.currency,
                    items: [
                      { value: "usd", label: "USD — United States Dollar" },
                      { value: "eur", label: "EUR — Euro" },
                      { value: "gbp", label: "GBP — British Pound" },
                      { value: "jpy", label: "JPY — Japanese Yen" },
                    ],
                  },
                  triggerClass: "w-full",
                  onEmit: {
                    RequestedOpen: () => PayoutThresholdMessage.CurrencySelectOpened(),
                    RequestedClose: () => PayoutThresholdMessage.CurrencySelectClosed(),
                    Picked: ({ value }) =>
                      PayoutThresholdMessage.CurrencyPicked({
                        value: typeof value === "string" ? value : null,
                      }),
                    Settled: () => undefined,
                  },
                }),
              ),
          }),
          Field(h, {
            key: "min-payout",
            props: { id: "min-payout" },
            view: (field) =>
              field.root(h.div).children(
                h.div
                  .class("flex items-baseline justify-between")
                  .children(
                    FieldLabel(field.label(h.label)).children("Minimum Payout Amount"),
                    h.span
                      .class("text-2xl font-semibold tabular-nums")
                      .children(`$${model.amount.toFixed(2)}`),
                  ),
                Slider(h, {
                  props: { value: model.amount, min: 50, max: 10000, step: 50 },
                  onValueChange: ({ value }) =>
                    PayoutThresholdMessage.MovedAmount({ value: value as number }),
                }),
                h.div
                  .class("flex items-center justify-between")
                  .children(
                    FieldDescription(h.p).children("$50 (MIN)"),
                    FieldDescription(h.p).children("$10,000 (MAX)"),
                  ),
              ),
          }),
          Field(h, {
            key: "payout-notes",
            props: { id: "payout-notes" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("Notes"),
                h.textarea
                  .attr("data-slot", "textarea")
                  .class(cn(TEXTAREA_CLASS, "min-h-[100px]"))
                  .attr("placeholder", "Add any notes for this payout configuration...")
                  .value(model.notes)
                  .on("input", ({ value }) => PayoutThresholdMessage.UpdatedNotes({ value })),
              ),
          }),
        ),
      ),
      CardFooter(h).children(
        Button(h, { class: "w-full", onPress: PayoutThresholdMessage.PressedSave() }).children(
          "Save Threshold",
        ),
      ),
    ),
});
