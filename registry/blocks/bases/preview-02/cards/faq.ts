/**
 * Faq — shadcn/ui block `preview-02` (cards/faq.tsx), bases generation,
 * ported 1:1 to Effect UI.
 *
 * Upstream: a "use client" React function rendering a Card whose
 * content is a Tabs set (General / Billing / Goals, default `general`)
 * where each panel is a QuestionList — a single, collapsible Accordion
 * (default open `item-0`) over that topic's questions (the three data
 * tables below, verbatim) — and whose footer holds Contact Support and
 * Learn More buttons. Here it is a Component: Radix owns the tab and
 * accordion state upstream, but the kit Tabs / Accordion are
 * controlled, so the active tab and each list's open values live in
 * this Component's Model (seeded with upstream's defaults) and
 * selections arrive as Messages. The footer buttons are Messages whose
 * handlers are deliberate no-ops — upstream wires neither.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream spreads no extra props; the only prop here is `class`,
 *   appended to the Card's classes.
 * - Upstream's Accordion `type="single" collapsible` is the kit
 *   Accordion's default single-open behavior (its props carry no
 *   `multiple`), and `defaultValue="item-0"` is the Model seed, per
 *   list.
 * - The AccordionContent's children wear the port's
 *   `ACCORDION_CONTENT_INNER_CLASS` wrapper div, as the accordion port
 *   prescribes (upstream wraps the content's children the same way
 *   inside its own Content).
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import {
  ACCORDION_CONTENT_INNER_CLASS,
  Accordion,
  AccordionChevron,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.ts";
import { Button } from "@/components/ui/button.ts";
import { Card, CardContent, CardFooter } from "@/components/ui/card.ts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.ts";

const GENERAL_QUESTIONS = [
  {
    q: "How secure is my financial data with Ledger?",
    a: "We use bank-level AES-256 encryption, SOC 2 Type II certified infrastructure, and never store your credentials. All connections use read-only access tokens. We are a SEC registered investment advisor.",
  },
  {
    q: "How do I connect my bank or investment accounts?",
    a: "Go to Settings > Linked Accounts and search for your institution. We support over 12,000 banks and brokerages via Plaid and MX.",
  },
  {
    q: "Can I export my data for tax purposes?",
    a: "Yes. Navigate to Reports > Tax Export to download a CSV or PDF summary of your transactions, dividends, and capital gains for any tax year.",
  },
];

const BILLING_QUESTIONS = [
  {
    q: "What is the difference between Basic and Pro pricing tiers?",
    a: "Basic includes budgeting, goal tracking, and up to 3 linked accounts. Pro adds unlimited accounts, dividend tracking, portfolio analysis, and priority support.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Go to Settings > Billing > Manage Plan and click Cancel. Your access continues until the end of your current billing period.",
  },
  {
    q: "Do you offer a free trial?",
    a: "Yes. All new accounts start with a 14-day Pro trial. No credit card required.",
  },
];

const GOALS_QUESTIONS = [
  {
    q: "How do I set up a custom financial goal?",
    a: "Click New Goal from the Savings Targets card. Choose a category, set a target amount and date, and we'll calculate the monthly contribution needed.",
  },
  {
    q: "Can I track multiple goals at once?",
    a: "Yes. Pro accounts can track unlimited goals. Basic accounts support up to 3 active goals.",
  },
  {
    q: "How are monthly contributions calculated?",
    a: "We divide the remaining amount by the number of months until your target date, adjusted for your current savings rate and any auto-transfer schedules.",
  },
];

export const FaqMessage = UiSchema.TaggedEnum({
  SelectedTab: { value: Schema.String },
  ToggledGeneral: { open: Schema.Array(Schema.String) },
  ToggledBilling: { open: Schema.Array(Schema.String) },
  ToggledGoals: { open: Schema.Array(Schema.String) },
  PressedContactSupport: {},
  PressedLearnMore: {},
});

export const Faq = Html.component({
  name: "Preview02Faq",
  props: Schema.Struct({ class: Schema.optional(Schema.String) }),
  model: Schema.Struct({
    tab: Schema.String,
    openGeneral: Schema.Array(Schema.String),
    openBilling: Schema.Array(Schema.String),
    openGoals: Schema.Array(Schema.String),
  }),
  message: FaqMessage,
}).make({
  init: () => ({
    tab: "general",
    openGeneral: ["item-0"],
    openBilling: ["item-0"],
    openGoals: ["item-0"],
  }),
  update: {
    SelectedTab: ($, { value }) => $.evolve({ tab: value }),
    ToggledGeneral: ($, { open }) => $.evolve({ openGeneral: open }),
    ToggledBilling: ($, { open }) => $.evolve({ openBilling: open }),
    ToggledGoals: ($, { open }) => $.evolve({ openGoals: open }),
    // Placeholder handlers, as upstream: no navigation happens.
    PressedContactSupport: ($) => $.evolve({}),
    PressedLearnMore: ($) => $.evolve({}),
  },
  view: (h, model) => {
    const questionList = (
      key: string,
      questions: ReadonlyArray<{ readonly q: string; readonly a: string }>,
      open: ReadonlyArray<string>,
      toggled: (open: ReadonlyArray<string>) => typeof FaqMessage.Type,
    ) =>
      Accordion(h, {
        key,
        props: { value: open },
        onEmit: {
          Toggled: ({ value }) => toggled(value),
        },
        view: (accordion) =>
          accordion.root(h.div).children(
            ...questions.map((item, index) =>
              AccordionItem(h, {
                key: `item-${index}`,
                props: { value: `item-${index}`, index },
                view: (itemParts) =>
                  itemParts
                    .root(h.div)
                    .children(
                      itemParts
                        .header(h.h3)
                        .children(
                          AccordionTrigger(itemParts, h.button).children(
                            item.q,
                            AccordionChevron(h),
                          ),
                        ),
                      AccordionContent(itemParts, h.div)?.children(
                        h.div.class(ACCORDION_CONTENT_INNER_CLASS).children(item.a),
                      ),
                    ),
              }),
            ),
          ),
      });
    return Card(h, { class: h.props.class }).children(
      CardContent(h).children(
        Tabs(h, {
          props: {
            value: model.tab,
            tabs: [{ value: "general" }, { value: "billing" }, { value: "goals" }],
          },
          onSelected: ({ value }) => FaqMessage.SelectedTab({ value }),
          view: (tabs) =>
            tabs
              .root(h.div)
              .children(
                TabsList(tabs, h.div, { class: "w-full" }).children(
                  TabsTrigger(tabs, {
                    element: h.button,
                    value: "general",
                    class: "flex-1",
                  }).children("General"),
                  TabsTrigger(tabs, {
                    element: h.button,
                    value: "billing",
                    class: "flex-1",
                  }).children("Billing"),
                  TabsTrigger(tabs, {
                    element: h.button,
                    value: "goals",
                    class: "flex-1",
                  }).children("Goals"),
                ),
                TabsContent(tabs, { element: h.div, value: "general" })?.children(
                  questionList("general", GENERAL_QUESTIONS, model.openGeneral, (open) =>
                    FaqMessage.ToggledGeneral({ open }),
                  ),
                ),
                TabsContent(tabs, { element: h.div, value: "billing" })?.children(
                  questionList("billing", BILLING_QUESTIONS, model.openBilling, (open) =>
                    FaqMessage.ToggledBilling({ open }),
                  ),
                ),
                TabsContent(tabs, { element: h.div, value: "goals" })?.children(
                  questionList("goals", GOALS_QUESTIONS, model.openGoals, (open) =>
                    FaqMessage.ToggledGoals({ open }),
                  ),
                ),
              ),
        }),
      ),
      CardFooter(h).children(
        Button(h, {
          variant: "outline",
          class: "w-full",
          onPress: FaqMessage.PressedContactSupport(),
        }).children("Contact Support"),
        Button(h, {
          variant: "link",
          class: "w-full",
          onPress: FaqMessage.PressedLearnMore(),
        }).children("Learn More"),
      ),
    );
  },
});
