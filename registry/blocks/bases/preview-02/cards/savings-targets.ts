/**
 * SavingsTargets — shadcn/ui block `preview-02`
 * (cards/savings-targets.tsx), bases generation, ported 1:1 to
 * Effect UI.
 *
 * Upstream: a stateless React function rendering a two-column grid of
 * Cards: "Savings Targets" (two muted Items with Progress bars at 65 /
 * 32 and a footer note) and "Buy Investment" (an uncontrolled amount
 * InputGroup `defaultValue="1,000.00"`, a NativeSelect
 * `defaultValue="market"`, two stat rows, and a Review Order button).
 * Here: a Component — the kit input and native select are controlled
 * (D-7), so the amount and order type live in the Model and edits
 * arrive as Messages. "New Goal" and "Review Order" are Messages whose
 * handlers are deliberate no-ops — upstream wires neither.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Label/control pairing is the kit Field's generated-id wiring with
 *   the upstream ids passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes. For the order-type field
 *   the NativeSelect is a sibling of the label inside the Field, not
 *   the Field's control part (it is a wrapper div around a native
 *   `<select>`, not a single control element).
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group.ts";
import { Item, ItemContent, ItemDescription, ItemFooter, ItemGroup } from "@/components/ui/item.ts";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select.ts";
import { Progress } from "@/components/ui/progress.ts";

const TARGETS = [
  { name: "Retirement", total: "$420,000", percent: 65, achieved: "$273,000" },
  { name: "Real Estate", total: "$85,000", percent: 32, achieved: "$27,200" },
] as const;

export const SavingsTargetsMessage = UiSchema.TaggedEnum({
  UpdatedAmount: { value: Schema.String },
  ChangedOrderType: { value: Schema.String },
  PressedNewGoal: {},
  PressedReviewOrder: {},
});

export const SavingsTargets = Html.component({
  name: "Preview02SavingsTargets",
  model: Schema.Struct({
    amount: Schema.String,
    orderType: Schema.String,
  }),
  message: SavingsTargetsMessage,
}).make({
  init: () => ({ amount: "1,000.00", orderType: "market" }),
  update: {
    UpdatedAmount: ($, { value }) => $.evolve({ amount: value }),
    ChangedOrderType: ($, { value }) => $.evolve({ orderType: value }),
    // Placeholder handlers, as upstream: the buttons do nothing.
    PressedNewGoal: ($) => $.evolve({}),
    PressedReviewOrder: ($) => $.evolve({}),
  },
  view: (h, model) =>
    h.div.class("grid grid-cols-2 gap-(--gap)").children(
      Card(h).children(
        CardHeader(h).children(
          CardTitle(h).children("Savings Targets"),
          CardDescription(h).children("Active milestones for 2024"),
          CardAction(h).children(
            Button(h, {
              variant: "outline",
              size: "sm",
              onPress: SavingsTargetsMessage.PressedNewGoal(),
            }).children("New Goal"),
          ),
        ),
        CardContent(h).children(
          ItemGroup(h, { class: "gap-3" }).children(
            TARGETS.map((target) =>
              Item(h, { variant: "muted", class: "flex-col items-stretch" }).children(
                ItemContent(h, { class: "gap-3" }).children(
                  ItemDescription(h, {
                    class:
                      "cn-font-heading text-xs font-medium tracking-wider text-muted-foreground uppercase",
                  }).children(target.name),
                  h.span.class("text-3xl font-semibold tabular-nums").children(target.total),
                  Progress(h, { props: { value: target.percent } }),
                ),
                ItemFooter(h).children(
                  h.span
                    .class("text-sm text-muted-foreground")
                    .children(`${target.percent}% achieved`),
                  h.span.class("text-sm font-medium tabular-nums").children(target.achieved),
                ),
              ),
            ),
          ),
        ),
        CardFooter(h).children(
          CardDescription(h, { class: "text-center" }).children(
            "You have not met your targets for this year.",
          ),
        ),
      ),
      Card(h).children(
        CardHeader(h).children(CardTitle(h).children("Buy Investment")),
        CardContent(h, { class: "flex flex-1 flex-col gap-3" }).children(
          FieldGroup(h, { class: "flex-1" }).children(
            Field(h, {
              key: "invest-amount",
              props: { id: "invest-amount" },
              view: (field) =>
                field.root(h.div).children(
                  FieldLabel(field.label(h.label)).children("Amount to Invest"),
                  InputGroup(h).children(
                    InputGroupAddon(h).children(InputGroupText(h).children("$")),
                    InputGroupInput(h, {
                      element: field.control(h.input),
                      props: { value: model.amount },
                      onUpdate: ({ value }) => SavingsTargetsMessage.UpdatedAmount({ value }),
                    }),
                  ),
                ),
            }),
            Field(h, {
              key: "invest-type",
              props: { id: "invest-type", described: true },
              view: (field) =>
                field.root(h.div).children(
                  FieldLabel(field.label(h.label)).children("Order Type"),
                  NativeSelect(h, {
                    props: { value: model.orderType },
                    onChange: ({ value }) => SavingsTargetsMessage.ChangedOrderType({ value }),
                    children: [
                      NativeSelectOption(h, { props: { value: "market" } }).children(
                        "Market Order",
                      ),
                      NativeSelectOption(h, { props: { value: "limit" } }).children("Limit Order"),
                      NativeSelectOption(h, { props: { value: "stop" } }).children("Stop Order"),
                    ],
                  }),
                  FieldDescription(field.description(h.p)).children(
                    "Market orders execute at the current price.",
                  ),
                ),
            }),
            h.div
              .class("flex flex-col gap-2")
              .children(
                h.div
                  .class("flex items-center justify-between")
                  .children(
                    h.span.class("text-sm text-muted-foreground").children("Estimated Shares"),
                    h.span.class("text-sm font-semibold tabular-nums").children("1.95"),
                  ),
                h.div
                  .class("flex items-center justify-between")
                  .children(
                    h.span.class("text-sm text-muted-foreground").children("Buying Power"),
                    h.span.class("text-sm font-semibold tabular-nums").children("$12,450.00"),
                  ),
              ),
          ),
        ),
        CardFooter(h, { class: "flex-col gap-3" }).children(
          Button(h, {
            class: "w-full",
            onPress: SavingsTargetsMessage.PressedReviewOrder(),
          }).children("Review Order"),
          CardDescription(h, { class: "text-center" }).children(
            "Trades are typically executed within minutes during market hours.",
          ),
        ),
      ),
    ),
});
