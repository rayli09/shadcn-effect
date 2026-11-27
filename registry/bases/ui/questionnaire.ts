/**
 * Questionnaire (bases generation) — shadcn/ui `questionnaire`, which
 * exists only in upstream's bases generation (there is no new-york-v4
 * file), ported 1:1 to Effect UI with the bases class layer: structural
 * classes inline plus `cn-questionnaire-*` hooks whose utilities live in
 * the style presets.
 *
 * Upstream is a thin skin over the React package
 * `@shadcn/react/questionnaire` (NOT imported here — it is a React
 * package): a `<form>` Root holding item definitions
 * (`{ name, required?, multiple?, disabled?, choices? }`), one active
 * item at a time, per-item status (`unanswered` / `answered` /
 * `skipped`), required validation, letter/number choice shortcuts, Enter
 * to advance, and Previous / Skip / Next / Submit navigation whose
 * visibility and disabled state derive from position + status. That
 * behavior is step navigation, so it is implemented natively here:
 *
 * - `Questionnaire` is a headless Component. Its Model owns the current
 *   item name, the choice answers and free-text answers per item, the
 *   skipped set, and the validation flag. Navigation, picking and typing
 *   are its Messages; `ItemChanged` (upstream's `onItemChange`) and
 *   `Submitted` (upstream's form `onSubmit`, carrying the answers) are
 *   its Events. The controlled `item` prop mirrors upstream: when set,
 *   the consumer owns the current item and navigation only emits
 *   `ItemChanged`.
 * - The view closure draws ONE item (the current one — upstream renders
 *   only the active item) through the parts: `root` (the <form>, with
 *   the keyboard-shortcut wiring), `progress`, `item` (a <fieldset>),
 *   `title` (a <legend>), `description`, `choices`, `choice` /
 *   `choiceInput` / `choiceLabel` / `choiceShortcut` (parameterized by
 *   choice value), `input` (the free-text input), `error`, and the four
 *   navigation button parts. The exported `Questionnaire*` functions are
 *   the styled pieces, as upstream exports them:
 *
 *   Questionnaire(h, {
 *     props: { items: [{ name: "plan", required: true, choices: [{ value: "free" }, { value: "pro" }] }], shortcuts: "letters" },
 *     onEmit: { Submitted: ({ answers }) => Msg.GotAnswers({ answers }) },
 *     view: (q) =>
 *       q.root(h.form).children(
 *         QuestionnaireProgress(q, h).children(`${q.current} of ${q.total}`),
 *         QuestionnaireItem(q, h).children(
 *           QuestionnaireTitle(q, h).children("Pick a plan"),
 *           QuestionnaireChoices(q, h).children(
 *             QuestionnaireChoice(q, h, "free", "Free"),
 *             QuestionnaireChoice(q, h, "pro", "Pro")
 *           ),
 *           q.invalid ? QuestionnaireError(q, h).children("Required") : undefined
 *         ),
 *         QuestionnaireActions(h).children(
 *           QuestionnairePrevious(q, h),
 *           QuestionnaireSkip(q, h),
 *           QuestionnaireNext(q, h),
 *           QuestionnaireSubmit(q, h)
 *         )
 *       )
 *   })
 *
 * Declared divergences (everything not listed is a bug):
 *
 * 1. Answers live in the Component's Model, not in form fields.
 *    Upstream's Root is a real <form> whose submission serializes named
 *    inputs; here `Submitted` carries `{ answers, texts }` as data —
 *    the Effect-native equivalent. The choice inputs still render with
 *    the item's `name` and their `value`, as upstream's do.
 * 2. Item state attributes: upstream's primitive spreads its state as
 *    data attributes through a render-prop API. Here the fieldset part
 *    writes `data-status` (the item status) plus `data-invalid` /
 *    `data-disabled` as presence attributes when true, the choice label
 *    writes `data-type` / `data-checked` / `data-disabled` /
 *    `data-shortcut` (the attributes the preset classes key on), and the
 *    parts object exposes the full state (`status`, `invalid`, `first`,
 *    `last`, …) as data for the view.
 * 3. Navigation visibility: Previous hides on the first item, Skip
 *    hides on the last item and on required items, Next hides on the
 *    last item, Submit shows only on the last — the primitive's
 *    `visible` state, applied by the exported view functions (they
 *    return `undefined` when hidden). Clicking Next/Submit with a
 *    required item unanswered sets `invalid` instead of advancing,
 *    which is what the Error part exists for.
 * 4. Keyboard shortcuts are wired on the root <form>'s keydown (events
 *    bubble from the item's controls): Enter advances (or submits on
 *    the last item), letter/number keys pick the choice at that index
 *    when `shortcuts` is set. Keys are ignored while an IME composition
 *    is active, and choice keys are ignored while typing in the text
 *    input (the kit's `editable` payload flag). One approximation:
 *    pressing Enter while a navigation button has focus can also fire
 *    that button's own press.
 * 5. Item `disabled` is surfaced as `data-disabled` on the fieldset and
 *    disables the choice/text inputs; upstream disables the whole
 *    fieldset natively.
 * 6. DOM prop spreading (`{...props}`) is not reproduced: pieces take
 *    `class` plus their documented options; chain further attributes on
 *    the returned builder. The navigation buttons' `variant` / `size`
 *    options are upstream's (Previous/Skip default `outline`, Next/
 *    Submit default `default`; all default size `default`).
 */
import * as Html from "@effect/ui/html/Html";
import type * as Component from "@effect/ui/Component";
import type * as View from "@effect/ui/View";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { CheckIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonSize, type ButtonVariant } from "./button.ts";

// ---------------------------------------------------------------------------
// Definitions (upstream's exported definition types, same shapes)
// ---------------------------------------------------------------------------

export const QuestionnaireChoiceDefinition = Schema.Struct({
  value: Schema.String,
  disabled: Schema.optional(Schema.Boolean),
});
export type QuestionnaireChoiceDefinition = typeof QuestionnaireChoiceDefinition.Type;

export const QuestionnaireItemDefinition = Schema.Struct({
  name: Schema.String,
  required: Schema.optional(Schema.Boolean),
  multiple: Schema.optional(Schema.Boolean),
  disabled: Schema.optional(Schema.Boolean),
  choices: Schema.optional(Schema.Array(QuestionnaireChoiceDefinition)),
});
export type QuestionnaireItemDefinition = typeof QuestionnaireItemDefinition.Type;

export type QuestionnaireItemStatus = "unanswered" | "answered" | "skipped";
export type QuestionnaireShortcutMode = "letters" | "numbers";
export type QuestionnaireInputType =
  | "date"
  | "datetime-local"
  | "email"
  | "month"
  | "number"
  | "password"
  | "search"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week";

// ---------------------------------------------------------------------------
// Props / Model / Messages / Events
// ---------------------------------------------------------------------------

export const QuestionnaireProps = Schema.Struct({
  /** The item definitions, in step order. */
  items: Schema.Array(QuestionnaireItemDefinition),
  /** Upstream `item`: when set, the consumer owns the current item. */
  item: Schema.optional(Schema.String),
  /** Upstream `defaultItem`: the initial item name (default: the first). */
  defaultItem: Schema.optional(Schema.String),
  /** Upstream `shortcuts`: keyboard + badge mode for choices. */
  shortcuts: Schema.optional(Schema.Literals(["letters", "numbers"])),
});
export type QuestionnaireProps = typeof QuestionnaireProps.Type;

export const QuestionnaireModel = Schema.Struct({
  currentName: Schema.String,
  answers: Schema.Record(Schema.String, Schema.Array(Schema.String)),
  texts: Schema.Record(Schema.String, Schema.String),
  skipped: Schema.Array(Schema.String),
  invalid: Schema.Boolean,
});
export type QuestionnaireModel = typeof QuestionnaireModel.Type;

export const QuestionnaireMessage = UiSchema.TaggedEnum({
  /** A radio choice was picked (label input change or shortcut key). */
  ChoicePicked: { name: Schema.String, value: Schema.String },
  /** A checkbox choice was toggled (label input change or shortcut key). */
  ChoiceToggled: { name: Schema.String, value: Schema.String, checked: Schema.Boolean },
  /** The free-text input changed. */
  TextEntered: { name: Schema.String, value: Schema.String },
  /** Previous pressed. */
  WentPrevious: {},
  /** Next pressed. */
  WentNext: {},
  /** Skip pressed. */
  SkippedItem: {},
  /** Submit pressed. */
  SubmittedForm: {},
  /** Enter pressed: Next, or Submit on the last item. */
  Advanced: {},
});
export type QuestionnaireMessage = typeof QuestionnaireMessage.Type;

export const QuestionnaireEvents = UiSchema.TaggedEnum({
  /** Upstream `onItemChange`: the current item changed. */
  ItemChanged: { name: Schema.String },
  /** Upstream form `onSubmit`: the collected answers. */
  Submitted: {
    answers: Schema.Record(Schema.String, Schema.Array(Schema.String)),
    texts: Schema.Record(Schema.String, Schema.String),
  },
});
export type QuestionnaireEvents = typeof QuestionnaireEvents.Type;

// ---------------------------------------------------------------------------
// Derived state (pure helpers over props + model)
// ---------------------------------------------------------------------------

const currentNameOf = (props: QuestionnaireProps, model: QuestionnaireModel): string =>
  props.item ?? model.currentName;

const currentItemOf = (
  props: QuestionnaireProps,
  model: QuestionnaireModel,
): QuestionnaireItemDefinition | undefined => {
  const name = currentNameOf(props, model);
  return props.items.find((item) => item.name === name) ?? props.items[0];
};

const indexOf = (props: QuestionnaireProps, model: QuestionnaireModel): number => {
  const item = currentItemOf(props, model);
  const index = item === undefined ? -1 : props.items.indexOf(item);
  return index < 0 ? 0 : index;
};

const isAnswered = (model: QuestionnaireModel, name: string): boolean =>
  (model.answers[name]?.length ?? 0) > 0 || (model.texts[name] ?? "") !== "";

const statusOf = (
  model: QuestionnaireModel,
  item: QuestionnaireItemDefinition,
): QuestionnaireItemStatus =>
  isAnswered(model, item.name)
    ? "answered"
    : model.skipped.includes(item.name)
      ? "skipped"
      : "unanswered";

const shortcutFor = (
  props: QuestionnaireProps,
  item: QuestionnaireItemDefinition,
  value: string,
): string | undefined => {
  if (props.shortcuts === undefined || item.choices === undefined) return undefined;
  const index = item.choices.findIndex((choice) => choice.value === value);
  if (index < 0) return undefined;
  return props.shortcuts === "letters" ? String.fromCharCode(65 + index) : String(index + 1);
};

// ---------------------------------------------------------------------------
// Class strings (byte-for-byte upstream bases/radix)
// ---------------------------------------------------------------------------

export const QUESTIONNAIRE_ROOT_CLASS = "cn-questionnaire flex w-full min-w-0 flex-col";

export const QUESTIONNAIRE_PROGRESS_CLASS =
  "cn-questionnaire-progress min-h-[1lh] w-fit min-w-[14ch] font-medium text-muted-foreground tabular-nums";

export const QUESTIONNAIRE_ITEM_CLASS = "cn-questionnaire-item min-w-0 border-0 p-0 outline-none";

export const QUESTIONNAIRE_TITLE_CLASS = "cn-questionnaire-title cn-font-heading text-pretty";

export const QUESTIONNAIRE_DESCRIPTION_CLASS =
  "cn-questionnaire-description text-pretty text-muted-foreground";

export const QUESTIONNAIRE_CHOICES_CLASS =
  "cn-questionnaire-choices group/questionnaire-choices grid min-w-0";

export const QUESTIONNAIRE_CHOICE_CLASS =
  "cn-questionnaire-choice group/questionnaire-choice relative flex min-h-11 cursor-pointer items-start text-start transition-colors outline-none select-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50";

export const QUESTIONNAIRE_CHOICE_INPUT_CLASS =
  "cn-questionnaire-choice-input absolute inset-0 z-10 size-full cursor-pointer opacity-0";

export const QUESTIONNAIRE_CHOICE_INDICATOR_CLASS =
  "cn-questionnaire-choice-indicator pointer-events-none relative flex shrink-0 items-center justify-center border group-data-[type=radio]/questionnaire-choice:rounded-full";

export const QUESTIONNAIRE_CHOICE_INDICATOR_DOT_CLASS =
  "cn-questionnaire-choice-indicator-dot hidden rounded-full group-data-[type=checkbox]/questionnaire-choice:hidden group-data-checked/questionnaire-choice:block";

export const QUESTIONNAIRE_CHOICE_INDICATOR_CHECK_CLASS =
  "cn-questionnaire-choice-indicator-check hidden group-data-[type=radio]/questionnaire-choice:hidden group-data-checked/questionnaire-choice:block";

export const QUESTIONNAIRE_CHOICE_LABEL_CLASS =
  "cn-questionnaire-choice-label cn-questionnaire-choice-content flex min-w-0 flex-1 flex-col leading-snug";

export const QUESTIONNAIRE_CHOICE_SHORTCUT_CLASS =
  "cn-questionnaire-choice-shortcut cn-questionnaire-shortcut pointer-events-none ms-auto hidden shrink-0 group-data-[shortcut]/questionnaire-choice:inline-flex";

export const QUESTIONNAIRE_CHOICE_DESCRIPTION_CLASS = "cn-questionnaire-choice-description";

export const QUESTIONNAIRE_INPUT_WRAPPER_CLASS =
  "cn-questionnaire-input-wrapper group/questionnaire-input relative min-w-0";

export const QUESTIONNAIRE_INPUT_CLASS =
  "cn-questionnaire-input min-h-11 w-full min-w-0 transition-[color,box-shadow,background-color] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground";

export const QUESTIONNAIRE_ERROR_CLASS = "cn-questionnaire-error text-destructive";

export const QUESTIONNAIRE_ACTIONS_CLASS =
  "cn-questionnaire-actions grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center";

export const QUESTIONNAIRE_PREVIOUS_CLASS =
  "cn-questionnaire-previous col-start-1 row-start-1 min-h-11 justify-self-start sm:min-h-0";

export const QUESTIONNAIRE_SKIP_CLASS =
  "cn-questionnaire-skip col-start-2 row-start-1 min-h-11 justify-self-end sm:min-h-0";

export const QUESTIONNAIRE_NEXT_CLASS =
  "cn-questionnaire-next col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0";

export const QUESTIONNAIRE_SUBMIT_CLASS =
  "cn-questionnaire-submit col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0";

// ---------------------------------------------------------------------------
// The Component
// ---------------------------------------------------------------------------

/**
 * The questionnaire's state owner (see the file header for the full
 * example). The `view` closure receives the parts: the state as data
 * (`current`, `total`, `first`, `last`, `itemName`, `status`, `invalid`,
 * `selected`, `text`, plus `shortcutText(value)` / `isChecked(value)`
 * helpers) and the styled part appliers for every piece.
 */
export const Questionnaire = Html.component({
  name: "Questionnaire",
  props: QuestionnaireProps,
  model: QuestionnaireModel,
  message: QuestionnaireMessage,
  events: QuestionnaireEvents,
}).make({
  init: ({ props }) => ({
    currentName: props.item ?? props.defaultItem ?? props.items[0]?.name ?? "",
    answers: {},
    texts: {},
    skipped: [],
    invalid: false,
  }),
  update: {
    ChoicePicked: ($, { name, value }) =>
      $.evolve({
        answers: { ...$.model.answers, [name]: [value] },
        skipped: $.model.skipped.filter((skipped) => skipped !== name),
        invalid: false,
      }),
    ChoiceToggled: ($, { name, value, checked }) => {
      const selected = $.model.answers[name] ?? [];
      const next = checked
        ? selected.includes(value)
          ? selected
          : [...selected, value]
        : selected.filter((picked) => picked !== value);
      return $.evolve({
        answers: { ...$.model.answers, [name]: next },
        skipped:
          next.length > 0 ? $.model.skipped.filter((skipped) => skipped !== name) : $.model.skipped,
        invalid: next.length > 0 ? false : $.model.invalid,
      });
    },
    TextEntered: ($, { name, value }) =>
      $.evolve({
        texts: { ...$.model.texts, [name]: value },
        skipped:
          value !== "" ? $.model.skipped.filter((skipped) => skipped !== name) : $.model.skipped,
        invalid: value !== "" ? false : $.model.invalid,
      }),
    WentPrevious: ($) => {
      const index = indexOf($.props, $.model);
      if (index <= 0) return $.evolve({});
      const name = $.props.items[index - 1]!.name;
      return $.props.item === undefined
        ? $.evolve({ currentName: name, invalid: false }).emit(
            QuestionnaireEvents.ItemChanged({ name }),
          )
        : $.emit(QuestionnaireEvents.ItemChanged({ name }));
    },
    WentNext: ($) => {
      const item = currentItemOf($.props, $.model);
      const index = indexOf($.props, $.model);
      if (item === undefined || index >= $.props.items.length - 1) return $.evolve({});
      if (item.required === true && !isAnswered($.model, item.name)) {
        return $.evolve({ invalid: true });
      }
      const name = $.props.items[index + 1]!.name;
      return $.props.item === undefined
        ? $.evolve({ currentName: name, invalid: false }).emit(
            QuestionnaireEvents.ItemChanged({ name }),
          )
        : $.emit(QuestionnaireEvents.ItemChanged({ name }));
    },
    SkippedItem: ($) => {
      const item = currentItemOf($.props, $.model);
      const index = indexOf($.props, $.model);
      if (item === undefined || index >= $.props.items.length - 1 || item.required === true) {
        return $.evolve({});
      }
      const name = $.props.items[index + 1]!.name;
      const skipped =
        isAnswered($.model, item.name) || $.model.skipped.includes(item.name)
          ? $.model.skipped
          : [...$.model.skipped, item.name];
      return $.props.item === undefined
        ? $.evolve({ currentName: name, skipped, invalid: false }).emit(
            QuestionnaireEvents.ItemChanged({ name }),
          )
        : $.evolve({ skipped }).emit(QuestionnaireEvents.ItemChanged({ name }));
    },
    SubmittedForm: ($) => {
      const item = currentItemOf($.props, $.model);
      if (item !== undefined && item.required === true && !isAnswered($.model, item.name)) {
        return $.evolve({ invalid: true });
      }
      return $.evolve({ invalid: false }).emit(
        QuestionnaireEvents.Submitted({ answers: $.model.answers, texts: $.model.texts }),
      );
    },
    Advanced: ($) => {
      const index = indexOf($.props, $.model);
      const item = currentItemOf($.props, $.model);
      if (index >= $.props.items.length - 1) {
        if (item !== undefined && item.required === true && !isAnswered($.model, item.name)) {
          return $.evolve({ invalid: true });
        }
        return $.evolve({ invalid: false }).emit(
          QuestionnaireEvents.Submitted({ answers: $.model.answers, texts: $.model.texts }),
        );
      }
      if (item !== undefined && item.required === true && !isAnswered($.model, item.name)) {
        return $.evolve({ invalid: true });
      }
      const name = $.props.items[index + 1]!.name;
      return $.props.item === undefined
        ? $.evolve({ currentName: name, invalid: false }).emit(
            QuestionnaireEvents.ItemChanged({ name }),
          )
        : $.emit(QuestionnaireEvents.ItemChanged({ name }));
    },
  },
  parts: (p, model) => {
    const props = p.props;
    const item = currentItemOf(props, model);
    const index = indexOf(props, model);
    const name = item?.name ?? "";
    const type = item?.multiple === true ? "checkbox" : "radio";
    const selected: ReadonlyArray<string> = model.answers[name] ?? [];
    const isChecked = (value: string): boolean => selected.includes(value);
    const choiceOf = (value: string) => item?.choices?.find((choice) => choice.value === value);
    const status: QuestionnaireItemStatus =
      item === undefined ? "unanswered" : statusOf(model, item);

    return {
      // -- state as data -------------------------------------------------
      index,
      current: index + 1,
      total: props.items.length,
      first: index <= 0,
      last: index >= props.items.length - 1,
      itemName: name,
      definition: item,
      status,
      invalid: model.invalid,
      selected,
      text: model.texts[name] ?? "",
      isChecked,
      shortcutText: (value: string): string | undefined =>
        item === undefined ? undefined : shortcutFor(props, item, value),

      // -- parts ----------------------------------------------------------
      root: p.part("form", (b) =>
        b
          .attr("data-slot", "questionnaire")
          .class(QUESTIONNAIRE_ROOT_CLASS)
          .on(
            "keydown",
            ({ key, editable, composing }) => {
              if (composing) return undefined;
              if (key === "Enter") return QuestionnaireMessage.Advanced();
              if (editable || props.shortcuts === undefined || item === undefined) {
                return undefined;
              }
              const shortcutIndex =
                props.shortcuts === "letters"
                  ? /^[a-z]$/i.test(key)
                    ? key.toLowerCase().charCodeAt(0) - 97
                    : -1
                  : /^[1-9]$/.test(key)
                    ? Number(key) - 1
                    : -1;
              const choice = item.choices?.[shortcutIndex];
              if (choice === undefined || choice.disabled === true || item.disabled === true) {
                return undefined;
              }
              return type === "checkbox"
                ? QuestionnaireMessage.ChoiceToggled({
                    name,
                    value: choice.value,
                    checked: !isChecked(choice.value),
                  })
                : QuestionnaireMessage.ChoicePicked({ name, value: choice.value });
            },
            { preventDefault: true },
          ),
      ),
      progress: p.part("div", (b) =>
        b.attr("data-slot", "questionnaire-progress").class(QUESTIONNAIRE_PROGRESS_CLASS),
      ),
      item: p.part("fieldset", (b) =>
        b
          .attrs({
            "data-slot": "questionnaire-item",
            "data-status": status,
            "data-invalid": model.invalid ? "true" : undefined,
            "data-disabled": item?.disabled === true ? "true" : undefined,
          })
          .class(QUESTIONNAIRE_ITEM_CLASS),
      ),
      title: p.part("legend", (b) =>
        b.attr("data-slot", "questionnaire-title").class(QUESTIONNAIRE_TITLE_CLASS),
      ),
      description: p.part("p", (b) =>
        b.attr("data-slot", "questionnaire-description").class(QUESTIONNAIRE_DESCRIPTION_CLASS),
      ),
      choices: p.part("div", (b) =>
        b
          .attrs({
            "data-slot": "questionnaire-choices",
            "data-shortcuts": props.shortcuts,
          })
          .class(QUESTIONNAIRE_CHOICES_CLASS),
      ),
      choice: p.part("label", (b, value: string) => {
        const choice = choiceOf(value);
        const disabled = choice?.disabled === true || item?.disabled === true;
        return b
          .attrs({
            "data-slot": "questionnaire-choice",
            "data-type": type,
            "data-checked": isChecked(value) ? "true" : undefined,
            "data-disabled": disabled ? "true" : undefined,
            "data-shortcut":
              item !== undefined && shortcutFor(props, item, value) !== undefined
                ? "true"
                : undefined,
          })
          .class(QUESTIONNAIRE_CHOICE_CLASS);
      }),
      choiceInput: p.part("input", (b, value: string) => {
        const choice = choiceOf(value);
        const disabled = choice?.disabled === true || item?.disabled === true;
        return b
          .attrs({
            "data-slot": "questionnaire-choice-input",
            type,
            name,
            value,
          })
          .checked(isChecked(value))
          .disabled(disabled)
          .class(QUESTIONNAIRE_CHOICE_INPUT_CLASS)
          .on("change", () =>
            type === "checkbox"
              ? QuestionnaireMessage.ChoiceToggled({
                  name,
                  value,
                  checked: !isChecked(value),
                })
              : QuestionnaireMessage.ChoicePicked({ name, value }),
          );
      }),
      choiceLabel: p.part("span", (b) =>
        b.attr("data-slot", "questionnaire-choice-label").class(QUESTIONNAIRE_CHOICE_LABEL_CLASS),
      ),
      choiceShortcut: p.part("span", (b) =>
        b
          .attr("data-slot", "questionnaire-choice-shortcut")
          .class(QUESTIONNAIRE_CHOICE_SHORTCUT_CLASS),
      ),
      input: p.part("input", (b) =>
        b
          .attrs({
            "data-slot": "questionnaire-input",
            type: "text",
            name,
            value: model.texts[name] ?? "",
          })
          .value(model.texts[name] ?? "")
          .disabled(item?.disabled === true)
          .class(QUESTIONNAIRE_INPUT_CLASS)
          .on("input", ({ value }) => QuestionnaireMessage.TextEntered({ name, value })),
      ),
      error: p.part("p", (b) =>
        b.attr("data-slot", "questionnaire-error").class(QUESTIONNAIRE_ERROR_CLASS),
      ),
      previousButton: p.part("button", (b) =>
        b
          .attr("data-slot", "questionnaire-previous")
          .disabled(item?.disabled === true)
          .on("click", QuestionnaireMessage.WentPrevious()),
      ),
      skipButton: p.part("button", (b) =>
        b
          .attr("data-slot", "questionnaire-skip")
          .disabled(item?.disabled === true)
          .on("click", QuestionnaireMessage.SkippedItem()),
      ),
      nextButton: p.part("button", (b) =>
        b
          .attr("data-slot", "questionnaire-next")
          .disabled(item?.disabled === true)
          .on("click", QuestionnaireMessage.WentNext()),
      ),
      submitButton: p.part("button", (b) =>
        b
          .attr("data-slot", "questionnaire-submit")
          .disabled(item?.disabled === true)
          .on("click", QuestionnaireMessage.SubmittedForm()),
      ),
    };
  },
});

/** What a `Questionnaire`'s `view` gets: the state as data plus the styled parts. */
export type QuestionnaireParts = Component.Headless.Parts<typeof Questionnaire>;

// ---------------------------------------------------------------------------
// Styled pieces (upstream's exports, as view functions over the parts)
// ---------------------------------------------------------------------------

export const QuestionnaireProgress = <Msg>(
  q: QuestionnaireParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => {
  const progress = q.progress(h.div);
  return options.class === undefined ? progress : progress.class(options.class);
};

export const QuestionnaireItem = <Msg>(
  q: QuestionnaireParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => {
  const item = q.item(h.fieldset);
  return options.class === undefined ? item : item.class(options.class);
};

export const QuestionnaireTitle = <Msg>(
  q: QuestionnaireParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => {
  const title = q.title(h.legend);
  return options.class === undefined ? title : title.class(options.class);
};

export const QuestionnaireDescription = <Msg>(
  q: QuestionnaireParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => {
  const description = q.description(h.p);
  return options.class === undefined ? description : description.class(options.class);
};

export const QuestionnaireChoices = <Msg>(
  q: QuestionnaireParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => {
  const choices = q.choices(h.div);
  return options.class === undefined ? choices : choices.class(options.class);
};

/**
 * The indicator markup upstream renders inside every choice: the dot
 * (checkbox-checked state) and the check (radio-checked state), swapped
 * by the preset classes keyed on `data-checked` / `data-type`.
 */
export const QuestionnaireChoiceIndicator = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  h.span
    .attrs({ "aria-hidden": "true", "data-slot": "questionnaire-choice-indicator" })
    .class(cn(QUESTIONNAIRE_CHOICE_INDICATOR_CLASS, options.class))
    .children(
      h.span
        .attr("data-slot", "questionnaire-choice-indicator-dot")
        .class(QUESTIONNAIRE_CHOICE_INDICATOR_DOT_CLASS),
      CheckIcon(h, { class: QUESTIONNAIRE_CHOICE_INDICATOR_CHECK_CLASS }).attr(
        "data-slot",
        "questionnaire-choice-indicator-check",
      ),
    );

/**
 * One choice: the label part for `value`, composed exactly as upstream
 * composes it — the visually-hidden input, the indicator, the label
 * (which receives `children`), and the shortcut badge when shortcuts are
 * enabled for the item.
 */
export const QuestionnaireChoice = <Msg, R = never>(
  q: QuestionnaireParts,
  h: Html.H<Msg>,
  value: string,
  label: View.Content<Msg, R>,
  options: { readonly class?: string | undefined } = {},
): View.Content<Msg, R> => {
  const shortcut = q.shortcutText(value);
  const choice = q.choice(h.label, value);
  return (options.class === undefined ? choice : choice.class(options.class)).children(
    q.choiceInput(h.input, value),
    QuestionnaireChoiceIndicator(h),
    q.choiceLabel(h.span).children(label),
    shortcut === undefined ? undefined : q.choiceShortcut(h.span).children(shortcut),
  );
};

export const QuestionnaireChoiceDescription = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  h.span
    .attr("data-slot", "questionnaire-choice-description")
    .class(cn(QUESTIONNAIRE_CHOICE_DESCRIPTION_CLASS, options.class));

/**
 * The free-text answer: upstream's wrapper div around the primitive
 * input. `type` defaults to "text" (upstream's input types are the
 * `QuestionnaireInputType` union); `class` lands on the input, where
 * upstream's `cn(..., className)` puts it.
 */
export const QuestionnaireInput = <Msg>(
  q: QuestionnaireParts,
  h: Html.H<Msg>,
  options: {
    readonly type?: QuestionnaireInputType | undefined;
    readonly placeholder?: string | undefined;
    readonly class?: string | undefined;
    readonly wrapperClass?: string | undefined;
  } = {},
) =>
  h.div
    .attr("data-slot", "questionnaire-input-wrapper")
    .class(cn(QUESTIONNAIRE_INPUT_WRAPPER_CLASS, options.wrapperClass))
    .children(
      (() => {
        const input = q.input(h.input);
        const typed = options.type === undefined ? input : input.attr("type", options.type);
        const placed =
          options.placeholder === undefined
            ? typed
            : typed.attr("placeholder", options.placeholder);
        return options.class === undefined ? placed : placed.class(options.class);
      })(),
    );

/** Render it only while `q.invalid` — upstream shows the error for an invalid item. */
export const QuestionnaireError = <Msg>(
  q: QuestionnaireParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => {
  const error = q.error(h.p);
  return options.class === undefined ? error : error.class(options.class);
};

/** The navigation row: a plain div, as upstream. */
export const QuestionnaireActions = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  h.div
    .attr("data-slot", "questionnaire-actions")
    .class(cn(QUESTIONNAIRE_ACTIONS_CLASS, options.class));

type NavOptions = {
  readonly variant?: ButtonVariant | undefined;
  readonly size?: ButtonSize | undefined;
  readonly class?: string | undefined;
};

/** What a navigation part applier returns: the styled <button> builder. */
type NavButtonResult = ReturnType<QuestionnaireParts["previousButton"]>;

const navButton = (
  button: NavButtonResult,
  options: NavOptions,
  defaults: { readonly variant: ButtonVariant; readonly size: ButtonSize },
  hookClass: string,
  label: string,
  children: View.Content<any, any> | undefined,
) =>
  button
    .attrs({
      "data-size": options.size ?? defaults.size,
      "data-variant": options.variant ?? defaults.variant,
    })
    .class(
      cn(
        buttonVariants({
          variant: options.variant ?? defaults.variant,
          size: options.size ?? defaults.size,
        }),
        hookClass,
        options.class,
      ),
    )
    .children(children ?? label);

/** The Previous button: hidden on the first item (returns `undefined`). */
export const QuestionnairePrevious = <Msg, R = never>(
  q: QuestionnaireParts,
  h: Html.H<Msg>,
  options: NavOptions = {},
  children?: View.Content<Msg, R>,
): View.Content<Msg, R> | undefined =>
  q.first
    ? undefined
    : navButton(
        q.previousButton(h.button),
        options,
        { variant: "outline", size: "default" },
        QUESTIONNAIRE_PREVIOUS_CLASS,
        "Previous",
        children,
      );

/** The Skip button: hidden on the last item and on required items. */
export const QuestionnaireSkip = <Msg, R = never>(
  q: QuestionnaireParts,
  h: Html.H<Msg>,
  options: NavOptions = {},
  children?: View.Content<Msg, R>,
): View.Content<Msg, R> | undefined =>
  q.last || q.definition?.required === true
    ? undefined
    : navButton(
        q.skipButton(h.button),
        options,
        { variant: "outline", size: "default" },
        QUESTIONNAIRE_SKIP_CLASS,
        "Skip",
        children,
      );

/** The Next button: hidden on the last item. */
export const QuestionnaireNext = <Msg, R = never>(
  q: QuestionnaireParts,
  h: Html.H<Msg>,
  options: NavOptions = {},
  children?: View.Content<Msg, R>,
): View.Content<Msg, R> | undefined =>
  q.last
    ? undefined
    : navButton(
        q.nextButton(h.button),
        options,
        { variant: "default", size: "default" },
        QUESTIONNAIRE_NEXT_CLASS,
        "Next",
        children,
      );

/** The Submit button: shown only on the last item. */
export const QuestionnaireSubmit = <Msg, R = never>(
  q: QuestionnaireParts,
  h: Html.H<Msg>,
  options: NavOptions = {},
  children?: View.Content<Msg, R>,
): View.Content<Msg, R> | undefined =>
  q.last
    ? navButton(
        q.submitButton(h.button),
        options,
        { variant: "default", size: "default" },
        QUESTIONNAIRE_SUBMIT_CLASS,
        "Submit",
        children,
      )
    : undefined;
