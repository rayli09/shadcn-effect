import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Play, Scene, TestHost } from "@effect/ui/testing";
import { Checkbox as KitCheckbox } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { Badge, badgeVariants } from "../registry/bases/ui/badge.ts";
import { Button, buttonVariants } from "../registry/bases/ui/button.ts";
import {
  CHECKBOX_CLASS,
  CHECKBOX_INDICATOR_CLASS,
  Checkbox,
} from "../registry/bases/ui/checkbox.ts";
import {
  QUESTIONNAIRE_ITEM_CLASS,
  QUESTIONNAIRE_ROOT_CLASS,
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "../registry/bases/ui/questionnaire.ts";

// Wave 6, bases generation (see tests/README.md for the recipe): the same
// ports as registry/ui/*, but the class layer is upstream bases/radix —
// structural classes inline plus `cn-*` hook classes whose utilities the
// style presets (registry/styles/style-*.css) supply. These tests pin the
// hook layer on the rendered elements and prove behavior is unchanged.
//
// Declared gaps:
// - The presets themselves (the `.style-*` CSS that fills the hooks) are
//   not exercised here: a Scene/Play renders the view tree, not computed
//   styles, so a hook class present in the tree is the strongest claim a
//   test in this harness can make. Preset coverage is the parity
//   checker's job (parity/bases-tokens.json), not a Scene's.
// - Questionnaire keyboard shortcuts (letters/Enter on the root form):
//   the root's keydown handler lives in the Questionnaire child's own
//   view layer, so a Scene cannot fire it (README rule 1) and the flow
//   below drives the same Messages through real Play clicks on the
//   choice inputs and navigation buttons instead.

// ---------------------------------------------------------------------------
// Base Button — a view function; variant/size select hook classes.
// ---------------------------------------------------------------------------

const ButtonMessage = UiSchema.TaggedEnum({
  Clicked: {},
});

const ButtonDemo = Html.component({
  name: "ButtonDemo",
  props: Schema.Struct({
    variant: Schema.optional(
      Schema.Literals(["default", "destructive", "outline", "secondary", "ghost", "link"]),
    ),
    size: Schema.optional(
      Schema.Literals(["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"]),
    ),
  }),
  model: Schema.Struct({ clicks: Schema.Number }),
  message: ButtonMessage,
}).make({
  init: () => ({ clicks: 0 }),
  update: {
    Clicked: ($) => $.evolve({ clicks: $.model.clicks + 1 }),
  },
  view: (h, model) =>
    Button(h, {
      onPress: ButtonMessage.Clicked(),
      variant: h.props.variant,
      size: h.props.size,
    }).children(`Clicked ${model.clicks}`),
});

const buttonRoot = Locator.attr("data-slot", "button");

// The bases button's structural base string, verbatim from
// registry/bases/ui/button.ts — the hook classes are appended to it.
const BUTTON_BASE =
  "cn-button group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

describe("Button (bases generation)", () => {
  it.effect("default variant/size render the cn-button hooks and the default stamps", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(ButtonDemo, {});
      const attrs = scene.get(buttonRoot).attrs;
      assert.strictEqual(attrs?.["data-variant"], "default");
      assert.strictEqual(attrs?.["data-size"], "default");
      // cn() with no extra class returns the composed string verbatim:
      // structural base + variant hook + size hook.
      assert.strictEqual(
        attrs?.class,
        `${BUTTON_BASE} cn-button-variant-default cn-button-size-default`,
      );
      assert.strictEqual(attrs?.class, buttonVariants({}));
    }),
  );

  it.effect("destructive + lg swap in the matching variant/size hook classes", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(ButtonDemo, { variant: "destructive", size: "lg" });
      const attrs = scene.get(buttonRoot).attrs;
      assert.strictEqual(attrs?.["data-variant"], "destructive");
      assert.strictEqual(attrs?.["data-size"], "lg");
      assert.strictEqual(
        attrs?.class,
        `${BUTTON_BASE} cn-button-variant-destructive cn-button-size-lg`,
      );
      assert.strictEqual(attrs?.class, buttonVariants({ variant: "destructive", size: "lg" }));
    }),
  );

  it.effect("a click reaches onPress and the consumer Model re-renders", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(ButtonDemo, {});
      // View-function port: the press handler lives in the consumer's own
      // view layer, so scene.fire drives the whole flow for real.
      scene.fire(buttonRoot, "click");
      scene.expect(buttonRoot).toHaveText("Clicked 1");
    }),
  );
});

// ---------------------------------------------------------------------------
// Base Checkbox — headless kit child; the consumer owns `checked`.
// ---------------------------------------------------------------------------

const TermsMessage = UiSchema.TaggedEnum({
  ToggledTerms: { checked: Schema.Boolean },
});

const TermsForm = Html.component({
  name: "BasesTermsForm",
  props: Schema.Struct({ disabled: Schema.optional(Schema.Boolean) }),
  model: Schema.Struct({ terms: Schema.Boolean }),
  message: TermsMessage,
}).make({
  init: () => ({ terms: false }),
  update: {
    ToggledTerms: ($, { checked }) => $.evolve({ terms: checked }),
  },
  view: (h, model) =>
    Checkbox(h, {
      props: {
        checked: model.terms,
        disabled: h.props.disabled,
        name: "terms",
      },
      onToggle: ({ checked }) => TermsMessage.ToggledTerms({ checked }),
    }),
});

const checkboxRoot = Locator.attr("data-slot", "checkbox");
const checkboxIndicator = Locator.attr("data-slot", "checkbox-indicator");

describe("Checkbox (bases generation)", () => {
  it.effect(
    "renders unchecked: the cn-checkbox hook class, the kit flag, and the data-state bridge",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(TermsForm, {});
        const attrs = scene.get(checkboxRoot).attrs;
        assert.strictEqual(attrs?.role, "checkbox");
        assert.strictEqual(attrs?.["aria-checked"], "false");
        // The port writes Radix's data-state from the controlled prop
        // (D-5), alongside the kit's own data-unchecked flag.
        assert.strictEqual(attrs?.["data-state"], "unchecked");
        assert.strictEqual(attrs?.["data-unchecked"], "");
        // The bases class layer, verbatim — led by the cn-checkbox hook.
        assert.strictEqual(attrs?.class, CHECKBOX_CLASS);
        assert.isTrue(CHECKBOX_CLASS.startsWith("cn-checkbox "));
        const indicatorAttrs = scene.get(checkboxIndicator).attrs;
        assert.strictEqual(indicatorAttrs?.["data-state"], "unchecked");
        assert.strictEqual(indicatorAttrs?.class, CHECKBOX_INDICATOR_CLASS);
        assert.isTrue(CHECKBOX_INDICATOR_CLASS.startsWith("cn-checkbox-indicator "));
      }),
  );

  it.effect(
    "the child's Toggled event flips the Model; the re-render shows data-checked + data-state=checked",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(TermsForm, {});
        // A Scene never runs a child's update (README rule 1): childEmit
        // stands in for what the kit Checkbox emits, and the consumer's
        // onEmit mapping + update run for real.
        scene.childEmit(KitCheckbox, { _tag: "Toggled", checked: true });
        const attrs = scene.get(checkboxRoot).attrs;
        assert.strictEqual(attrs?.["aria-checked"], "true");
        assert.strictEqual(attrs?.["data-state"], "checked");
        assert.strictEqual(attrs?.["data-checked"], "");
        assert.isUndefined(attrs?.["data-unchecked"]);
        assert.strictEqual(scene.get(checkboxIndicator).attrs?.["data-state"], "checked");
        scene.childEmit(KitCheckbox, { _tag: "Toggled", checked: false });
        assert.strictEqual(scene.get(checkboxRoot).attrs?.["data-state"], "unchecked");
      }),
  );
});

// ---------------------------------------------------------------------------
// Base Badge — a pure view function; variant selects the hook class.
// ---------------------------------------------------------------------------

const BadgeDemo = Html.component({
  name: "BadgeDemo",
  props: Schema.Struct({
    variant: Schema.optional(
      Schema.Literals(["default", "secondary", "destructive", "outline", "ghost", "link"]),
    ),
  }),
  model: Schema.Struct({}),
  message: UiSchema.TaggedEnum({}),
}).make({
  init: () => ({}),
  update: {},
  view: (h) => Badge(h, { variant: h.props.variant }).children("New"),
});

const badgeRoot = Locator.attr("data-slot", "badge");

// The bases badge's structural base string, verbatim from
// registry/bases/ui/badge.ts.
const BADGE_BASE =
  "cn-badge group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none";

describe("Badge (bases generation)", () => {
  it.effect("default and secondary variants compose base + cn-badge-variant-* strictly", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(BadgeDemo, {});
      const attrs = scene.get(badgeRoot).attrs;
      assert.strictEqual(attrs?.["data-variant"], "default");
      assert.strictEqual(attrs?.class, `${BADGE_BASE} cn-badge-variant-default`);
      assert.strictEqual(attrs?.class, badgeVariants({}));
      scene.expect(badgeRoot).toHaveText("New");

      const secondary = yield* Scene.make(BadgeDemo, { variant: "secondary" });
      const secondaryAttrs = secondary.get(badgeRoot).attrs;
      assert.strictEqual(secondaryAttrs?.["data-variant"], "secondary");
      assert.strictEqual(secondaryAttrs?.class, `${BADGE_BASE} cn-badge-variant-secondary`);
      assert.strictEqual(secondaryAttrs?.class, badgeVariants({ variant: "secondary" }));
    }),
  );
});

// ---------------------------------------------------------------------------
// Base Questionnaire — a native headless Component with step navigation.
// The consumer hosts it, records its Submitted / ItemChanged events, and
// draws the current item through the parts, per questionnaire.ts's header.
// (The header example names a `QuestionnaireChoiceLabel` helper that the
// file does not export; the choice's label argument is a View.Content —
// an element builder, not a bare string — so the labels below are built
// from the parts' own choiceLabel applier, which is what that helper
// would wrap.)
// ---------------------------------------------------------------------------

const SurveyMessage = UiSchema.TaggedEnum({
  GotSubmission: {
    answers: Schema.Record(Schema.String, Schema.Array(Schema.String)),
    texts: Schema.Record(Schema.String, Schema.String),
  },
  ItemChanged: { name: Schema.String },
});

const Survey = Html.component({
  name: "Survey",
  model: Schema.Struct({ submitted: Schema.String, currentItem: Schema.String }),
  message: SurveyMessage,
}).make({
  init: () => ({ submitted: "", currentItem: "plan" }),
  update: {
    GotSubmission: ($, { answers }) => $.evolve({ submitted: JSON.stringify(answers) }),
    ItemChanged: ($, { name }) => $.evolve({ currentItem: name }),
  },
  view: (h, model) =>
    Questionnaire(h, {
      props: {
        items: [
          {
            name: "plan",
            required: true,
            choices: [{ value: "free" }, { value: "pro" }],
          },
          {
            name: "team",
            required: true,
            choices: [{ value: "solo" }, { value: "crew" }],
          },
        ],
      },
      onEmit: {
        Submitted: ({ answers, texts }) => SurveyMessage.GotSubmission({ answers, texts }),
        ItemChanged: ({ name }) => SurveyMessage.ItemChanged({ name }),
      },
      view: (q) =>
        q.root(h.form).children(
          QuestionnaireProgress(q, h).children(`${q.current} of ${q.total}`),
          QuestionnaireItem(q, h).children(
            QuestionnaireTitle(q, h).children(q.itemName === "plan" ? "Pick a plan" : "Pick a team"),
            q.itemName === "plan"
              ? QuestionnaireChoices(q, h).children(
                  QuestionnaireChoice(q, h, "free", q.choiceLabel(h.span).children("Free")),
                  QuestionnaireChoice(q, h, "pro", q.choiceLabel(h.span).children("Pro")),
                )
              : QuestionnaireChoices(q, h).children(
                  QuestionnaireChoice(q, h, "solo", q.choiceLabel(h.span).children("Solo")),
                  QuestionnaireChoice(q, h, "crew", q.choiceLabel(h.span).children("Crew")),
                ),
          ),
          QuestionnaireActions(h).children(
            QuestionnairePrevious(q, h),
            QuestionnaireSkip(q, h),
            QuestionnaireNext(q, h),
            QuestionnaireSubmit(q, h),
          ),
          h.output.attr("data-slot", "submitted").children(model.submitted),
          h.output.attr("data-slot", "current-item").children(model.currentItem),
        ),
    }),
});

const questionnaireRoot = Locator.attr("data-slot", "questionnaire");
const questionnaireProgress = Locator.attr("data-slot", "questionnaire-progress");
const questionnaireItem = Locator.attr("data-slot", "questionnaire-item");
const questionnaireNext = Locator.attr("data-slot", "questionnaire-next");
const questionnaireSubmit = Locator.attr("data-slot", "questionnaire-submit");
const questionnairePrevious = Locator.attr("data-slot", "questionnaire-previous");
const choicePro = Locator.attr("value", "pro");
const choiceCrew = Locator.attr("value", "crew");
const submittedOut = Locator.attr("data-slot", "submitted");
const currentItemOut = Locator.attr("data-slot", "current-item");

describe("Questionnaire (bases generation)", () => {
  it.effect(
    "renders step 1: cn-questionnaire root/item classes, progress, unanswered status, nav visibility",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(Survey, {});
        // A Scene renders the headless child with its init Model (README
        // rule 1), so this pins the initial render; the walk itself is
        // the Play below.
        assert.strictEqual(scene.get(questionnaireRoot).attrs?.class, QUESTIONNAIRE_ROOT_CLASS);
        assert.isTrue(QUESTIONNAIRE_ROOT_CLASS.startsWith("cn-questionnaire "));
        assert.strictEqual(scene.get(questionnaireItem).attrs?.class, QUESTIONNAIRE_ITEM_CLASS);
        assert.strictEqual(scene.get(questionnaireItem).attrs?.["data-status"], "unanswered");
        scene.expect(questionnaireProgress).toHaveText("1 of 2");
        // Previous hides on the first item, Submit shows only on the
        // last — both are absent from the tree, not merely disabled.
        scene.expect(questionnairePrevious).toHaveCount(0);
        scene.expect(questionnaireSubmit).toHaveCount(0);
        scene.expect(questionnaireNext).toExist();
      }),
  );

  it.effect(
    "a Play: answer step 1, advance, answer step 2, submit — Submitted carries the answers",
    () =>
      Effect.gen(function* () {
        const play = yield* Play.make(Survey, {});
        yield* play.expect(questionnaireProgress).toHaveText("1 of 2");

        // Answer step 1: the choice input handles `change`, not `click`
        // (a Play click on it is refused — nothing handles "click"), so
        // fire the `change` a browser's radio click would deliver. The
        // handler reads the child's own state, not the event payload.
        // The child's ChoicePicked update runs, and the fieldset's
        // status flips to answered.
        yield* play.fire(choicePro, "change");
        yield* play.expect(questionnaireItem).toHaveAttribute("data-status", "answered");

        // Advance: Next emits ItemChanged (recorded by the consumer)
        // and the child moves to the last item.
        yield* play.click(questionnaireNext);
        yield* play.expect(questionnaireProgress).toHaveText("2 of 2");
        yield* play.expect(currentItemOut).toHaveText("team");
        yield* play.expect(questionnaireItem).toHaveAttribute("data-status", "unanswered");
        // On the last item Next hides and Submit appears.
        yield* play.expect(questionnaireNext).toHaveCount(0);
        yield* play.expect(questionnaireSubmit).toExist();

        // Answer step 2 and submit: the Submitted event's payload —
        // both steps' answers, as data — reaches the consumer's Model.
        yield* play.fire(choiceCrew, "change");
        yield* play.expect(questionnaireItem).toHaveAttribute("data-status", "answered");
        yield* play.click(questionnaireSubmit);
        yield* play.expect(submittedOut).toHaveText('{"plan":["pro"],"team":["crew"]}');
      }).pipe(Effect.provide(TestHost.layer())),
  );
});
