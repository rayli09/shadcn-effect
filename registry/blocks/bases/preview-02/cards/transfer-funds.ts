/**
 * TransferFunds — shadcn/ui block `preview-02`
 * (cards/transfer-funds.tsx), bases generation, ported 1:1 to Effect
 * UI.
 *
 * Upstream: a stateless React function rendering a Card with a
 * FieldGroup — an amount InputGroup (a `$` addon before an uncontrolled
 * input seeded `1,200.00`), From / To account Selects (uncontrolled,
 * defaults `checking` / `savings`), and a muted Item summarizing
 * arrival, fee and total — plus a ghost close Button in the header
 * action and a Confirm Transfer button in the footer. Here the form is
 * a Component: the kit inputs are controlled (D-7), so the amount and
 * both Selects' open/value state live in the Model (seeded with
 * upstream's defaults) and edits arrive as Messages. The summary Item
 * is static, exactly as upstream hard-codes it — it does not react to
 * the amount. Close and Confirm are Messages whose handlers are
 * deliberate no-ops — upstream wires neither.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream spreads no extra props; the only prop here is `class`,
 *   appended to the Card's classes.
 * - Label/control pairing is the kit Field's generated-id wiring with
 *   the upstream ids passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes; the Selects are kit
 *   components with their own part wiring, so they sit beside the
 *   label rather than under the Field's `control` part (the amount
 *   input does stack on the Field's control part, as in login-01).
 * - Upstream's SelectGroups render no labels of their own, so the
 *   items are passed ungrouped (the port Select only draws a group
 *   label for items carrying a `group` key).
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field.ts";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group.ts";
import { Item, ItemContent } from "@/components/ui/item.ts";
import { Select } from "@/components/ui/select.ts";
import { Separator } from "@/components/ui/separator.ts";
import { XIcon } from "@/lib/icons";

export const TransferFundsMessage = UiSchema.TaggedEnum({
  UpdatedAmount: { value: Schema.String },
  FromSelectOpened: {},
  FromSelectClosed: {},
  FromPicked: { value: Schema.NullOr(Schema.String) },
  ToSelectOpened: {},
  ToSelectClosed: {},
  ToPicked: { value: Schema.NullOr(Schema.String) },
  PressedClose: {},
  PressedConfirm: {},
});

export const TransferFunds = Html.component({
  name: "Preview02TransferFunds",
  props: Schema.Struct({ class: Schema.optional(Schema.String) }),
  model: Schema.Struct({
    amount: Schema.String,
    fromOpen: Schema.Boolean,
    fromAccount: Schema.NullOr(Schema.String),
    toOpen: Schema.Boolean,
    toAccount: Schema.NullOr(Schema.String),
  }),
  message: TransferFundsMessage,
}).make({
  init: () => ({
    amount: "1,200.00",
    fromOpen: false,
    fromAccount: "checking",
    toOpen: false,
    toAccount: "savings",
  }),
  update: {
    UpdatedAmount: ($, { value }) => $.evolve({ amount: value }),
    FromSelectOpened: ($) => $.evolve({ fromOpen: true }),
    FromSelectClosed: ($) => $.evolve({ fromOpen: false }),
    FromPicked: ($, { value }) => $.evolve({ fromAccount: value }),
    ToSelectOpened: ($) => $.evolve({ toOpen: true }),
    ToSelectClosed: ($) => $.evolve({ toOpen: false }),
    ToPicked: ($, { value }) => $.evolve({ toAccount: value }),
    // Placeholder handlers, as upstream: nothing is closed or sent.
    PressedClose: ($) => $.evolve({}),
    PressedConfirm: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h, { class: h.props.class }).children(
      CardHeader(h).children(
        CardTitle(h).children("Transfer Funds"),
        CardDescription(h).children("Move money between your connected accounts."),
        CardAction(h).children(
          Button(h, {
            variant: "ghost",
            size: "icon-sm",
            class: "bg-muted",
            onPress: TransferFundsMessage.PressedClose(),
          }).children(XIcon(h)),
        ),
      ),
      CardContent(h).children(
        FieldGroup(h).children(
          Field(h, {
            key: "transfer-amount",
            props: { id: "transfer-amount" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("Amount to Transfer"),
                InputGroup(h).children(
                  InputGroupAddon(h).children(InputGroupText(h).children("$")),
                  InputGroupInput(h, {
                    element: field.control(h.input),
                    props: { value: model.amount },
                    onUpdate: ({ value }) => TransferFundsMessage.UpdatedAmount({ value }),
                  }),
                ),
              ),
          }),
          Field(h, {
            key: "from-account",
            props: { id: "from-account" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("From Account"),
                Select(h, {
                  props: {
                    open: model.fromOpen,
                    value: model.fromAccount,
                    items: [
                      { value: "checking", label: "Main Checking (··8402) — $12,450.00" },
                      { value: "business", label: "Business (··7731) — $8,920.00" },
                    ],
                  },
                  triggerClass: "w-full",
                  onEmit: {
                    RequestedOpen: () => TransferFundsMessage.FromSelectOpened(),
                    RequestedClose: () => TransferFundsMessage.FromSelectClosed(),
                    Picked: ({ value }) =>
                      TransferFundsMessage.FromPicked({
                        value: typeof value === "string" ? value : null,
                      }),
                    Settled: () => undefined,
                  },
                }),
              ),
          }),
          Field(h, {
            key: "to-account",
            props: { id: "to-account" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("To Account"),
                Select(h, {
                  props: {
                    open: model.toOpen,
                    value: model.toAccount,
                    items: [
                      { value: "savings", label: "High Yield Savings (··1192) — $42,100.00" },
                      { value: "investment", label: "Investment (··3349) — $18,200.00" },
                    ],
                  },
                  triggerClass: "w-full",
                  onEmit: {
                    RequestedOpen: () => TransferFundsMessage.ToSelectOpened(),
                    RequestedClose: () => TransferFundsMessage.ToSelectClosed(),
                    Picked: ({ value }) =>
                      TransferFundsMessage.ToPicked({
                        value: typeof value === "string" ? value : null,
                      }),
                    Settled: () => undefined,
                  },
                }),
              ),
          }),
          Item(h, { variant: "muted", class: "flex-col items-stretch" }).children(
            ItemContent(h, { class: "gap-3" }).children(
              h.div
                .class("flex items-center justify-between")
                .children(
                  h.span.class("text-sm text-muted-foreground").children("Estimated arrival"),
                  h.span.class("text-sm font-medium").children("Today, Apr 14"),
                ),
              Separator(h),
              h.div
                .class("flex items-center justify-between")
                .children(
                  h.span.class("text-sm text-muted-foreground").children("Transaction fee"),
                  h.span.class("text-sm font-medium tabular-nums").children("$0.00"),
                ),
              Separator(h),
              h.div
                .class("flex items-center justify-between")
                .children(
                  h.span.class("text-sm font-medium").children("Total amount"),
                  h.span.class("text-sm font-semibold tabular-nums").children("$1,200.00"),
                ),
            ),
          ),
        ),
      ),
      CardFooter(h).children(
        Button(h, { class: "w-full", onPress: TransferFundsMessage.PressedConfirm() }).children(
          "Confirm Transfer",
        ),
      ),
    ),
});
