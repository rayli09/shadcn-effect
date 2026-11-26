import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Scene } from "@effect/ui/testing";
import { Form as KitForm } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  FORM_DESCRIPTION_CLASS,
  FORM_ITEM_CLASS,
  FORM_LABEL_CLASS,
  FORM_MESSAGE_CLASS,
  Form,
  FormField,
} from "../registry/ui/form.ts";
import {
  FIELD_ERROR_CLASS,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  fieldVariants,
} from "../registry/ui/field.ts";
import { Input } from "../registry/ui/input.ts";
import { LABEL_CLASS } from "../registry/ui/label.ts";
import { cn } from "../registry/lib/utils.ts";

// The consumer recipe (see tests/README.md), D-3 edition: there is no
// react-hook-form here — values live in the consumer's Model, the kit
// Form reports a submit as `Submitted` with the form's named controls,
// and validation runs in the consumer's update, its outcome fed back as
// FormField's `props.invalid`. Both kit Form and kit Field are headless
// children, so a Scene never runs their updates: the submit is driven
// with scene.childEmit(KitForm, …) (README rule 1), standing in for what
// the child emits after a real submit press, and the re-render — new
// props into the Field child — is what shows the error.
//
// NOT covered here (declared gaps):
// - A real submit press and the kit Form's focus-first-invalid Command
//   after it: the press crosses into the child and the focus move is a
//   host effect — a Play/host concern, and the kit's own Form tests
//   prove the machinery. This file proves the port's anatomy and the
//   consumer-side validation mapping form.ts documents.
// - Typing into the control (the kit Input is a view function, so a
//   Scene fire would work) is orthogonal to the form mapping and is the
//   input port's own test concern; the value arrives via Submitted's
//   fields here, as it does in an app.
// - The standalone FormItem / FormLabel / … appliers in form.ts: same
//   styling code as FormField's pre-styled parts, asserted here in
//   their composed form.
//
// CHECKED WHILE TESTING (looked like a cross-port bug; it is upstream
// semantics, verified at wave-3 consolidation): FormField's control
// part stamps `data-slot="form-control"`, and the documented
// composition — this repo's Input port over the control part — renders
// `data-slot="input"` instead, because the Input port chains its own
// stamp after consuming the element. That is exactly what upstream
// does: FormControl is a Radix Slot, and Radix's mergeProps lets the
// CHILD's props win over the Slot's (mergeProps in
// @radix-ui/react-slot: overrideProps = { ...childProps }), so a real
// shadcn <Input> inside <FormControl> also renders data-slot="input".
// `form-control` lands only on control elements that don't stamp
// their own slot. The first test pins data-slot="input" as CORRECT;
// the control is located by tag so the test doesn't depend on which
// slot a future control element carries.

const SignupMessage = UiSchema.TaggedEnum({
  UpdatedEmail: { value: Schema.String },
  SubmittedForm: {
    fields: Schema.Record(Schema.String, Schema.String),
    entries: Schema.Array(Schema.Tuple([Schema.String, Schema.String])),
  },
});

const SignupForm = Html.component({
  name: "SignupForm",
  model: Schema.Struct({
    email: Schema.String,
    invalid: Schema.Boolean,
  }),
  message: SignupMessage,
}).make({
  init: () => ({ email: "", invalid: false }),
  update: {
    UpdatedEmail: ($, { value }) => $.evolve({ email: value }),
    // The documented D-3 mapping: validation in update, outcome stored
    // in the Model, fed back to the field as props.invalid.
    SubmittedForm: ($, { fields }) => $.evolve({ invalid: !(fields.email ?? "").includes("@") }),
  },
  view: (h, model) =>
    Form(h, {
      onSubmitted: ({ fields, entries }) => SignupMessage.SubmittedForm({ fields, entries }),
      view: (form) =>
        form.root(h.form).children(
          FormField(h, {
            props: { invalid: model.invalid, described: true },
            view: (field) =>
              field.root(h.div).children(
                field.label(h.label).children("Email"),
                Input(h, {
                  element: field.control(h.input),
                  props: { value: model.email },
                  onUpdate: ({ value }) => SignupMessage.UpdatedEmail({ value }),
                }).attr("name", "email"),
                field.description(h.p).children("We never share it."),
                field.message(h.p)?.children("Enter a valid email"),
              ),
          }),
          h.button.attr("type", "submit").attr("data-slot", "submit").children("Sign up"),
        ),
    }),
});

const formItem = Locator.attr("data-slot", "form-item");
const formLabel = Locator.attr("data-slot", "form-label");
// Located by tag, not by data-slot: which slot the control carries
// depends on the control element (see the header's checked note).
const formControl = Locator.tag("input");
const formDescription = Locator.attr("data-slot", "form-description");
const formMessage = Locator.attr("data-slot", "form-message");

const submit = (email: string) =>
  ({
    _tag: "Submitted",
    fields: { email },
    entries: [["email", email] as [string, string]],
  }) as const;

describe("Form / FormField (shadcn-effect port)", () => {
  it.effect(
    "renders the anatomy: item, label wired to the control, description wired by aria-describedby, no message",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(SignupForm, {});
        assert.strictEqual(scene.get(formItem).attrs?.class, FORM_ITEM_CLASS);
        const labelAttrs = scene.get(formLabel).attrs;
        assert.strictEqual(labelAttrs?.class, cn(LABEL_CLASS, FORM_LABEL_CLASS));
        // The kit label part writes `for` = the control's generated id.
        const controlAttrs = scene.get(formControl).attrs;
        // Upstream semantics, pinned (see header): the control element's
        // own data-slot wins over FormControl's Slot stamp, exactly as
        // Radix mergeProps resolves it — "input", not "form-control".
        assert.strictEqual(controlAttrs?.["data-slot"], "input");
        assert.strictEqual(labelAttrs?.for, controlAttrs?.id);
        assert.strictEqual(labelAttrs?.["data-error"], "false");
        // The control points at the description; not invalid, so no
        // aria-invalid and no error id in aria-describedby.
        const descriptionAttrs = scene.get(formDescription).attrs;
        assert.strictEqual(descriptionAttrs?.class, FORM_DESCRIPTION_CLASS);
        scene.expect(formDescription).toHaveText("We never share it.");
        assert.strictEqual(controlAttrs?.["aria-describedby"], descriptionAttrs?.id);
        assert.isUndefined(controlAttrs?.["aria-invalid"]);
        assert.strictEqual(controlAttrs?.name, "email");
        // No error yet: the kit error part is absent, so no FormMessage.
        assert.isUndefined(scene.query(formMessage));
      }),
  );

  it.effect(
    "a failed submit (childEmit Submitted) shows the FormMessage and flips the label + control error state",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(SignupForm, {});
        scene.childEmit(KitForm, submit("not-an-email"));
        const messageAttrs = scene.get(formMessage).attrs;
        assert.strictEqual(messageAttrs?.class, FORM_MESSAGE_CLASS);
        scene.expect(formMessage).toHaveText("Enter a valid email");
        // Upstream's FormMessage is a plain <p>: the port removes the kit
        // error part's role="alert".
        assert.isUndefined(messageAttrs?.role);
        // Label bridges data-error from the field's invalid.
        assert.strictEqual(scene.get(formLabel).attrs?.["data-error"], "true");
        // Control: aria-invalid set, and aria-describedby now names the
        // description and the error, in that order.
        const controlAttrs = scene.get(formControl).attrs;
        assert.strictEqual(controlAttrs?.["aria-invalid"], "true");
        assert.strictEqual(
          controlAttrs?.["aria-describedby"],
          `${scene.get(formDescription).attrs?.id} ${messageAttrs?.id}`,
        );
      }),
  );

  it.effect("a valid submit clears the error state again", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(SignupForm, {});
      scene.childEmit(KitForm, submit("not-an-email"));
      assert.isDefined(scene.query(formMessage));
      scene.childEmit(KitForm, submit("ray@example.com"));
      assert.isUndefined(scene.query(formMessage));
      assert.strictEqual(scene.get(formLabel).attrs?.["data-error"], "false");
      assert.isUndefined(scene.get(formControl).attrs?.["aria-invalid"]);
    }),
  );
});

// ---------------------------------------------------------------------------
// The field.ts port: the same kit Field, styled as upstream's field
// anatomy (FieldLabel / FieldDescription / FieldError appliers).
// ---------------------------------------------------------------------------

const ProfileMessage = UiSchema.TaggedEnum({
  UpdatedName: { value: Schema.String },
});

const ProfileForm = Html.component({
  name: "ProfileForm",
  props: Schema.Struct({ invalid: Schema.optional(Schema.Boolean) }),
  model: Schema.Struct({ name: Schema.String }),
  message: ProfileMessage,
}).make({
  init: () => ({ name: "" }),
  update: {
    UpdatedName: ($, { value }) => $.evolve({ name: value }),
  },
  view: (h, model) =>
    Field(h, {
      props: { invalid: h.props.invalid, described: true },
      view: (field) =>
        field.root(h.div).children(
          FieldLabel(field.label(h.label)).children("Name"),
          Input(h, {
            element: field.control(h.input),
            props: { value: model.name },
            onUpdate: ({ value }) => ProfileMessage.UpdatedName({ value }),
          }),
          FieldDescription(field.description(h.p)).children("Visible on your profile."),
          FieldError(h, {
            element: field.error(h.div),
            errors: [{ message: "Enter your name" }],
          }),
        ),
    }),
});

const fieldRoot = Locator.attr("data-slot", "field");
const fieldLabel = Locator.attr("data-slot", "field-label");
const fieldDescription = Locator.attr("data-slot", "field-description");
const fieldError = Locator.attr("data-slot", "field-error");
const fieldControl = Locator.tag("input");

describe("Field (shadcn-effect port, field.ts anatomy)", () => {
  it.effect(
    "renders the field anatomy: group root with orientation, label, description, and no error while valid",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(ProfileForm, {});
        const rootAttrs = scene.get(fieldRoot).attrs;
        assert.strictEqual(rootAttrs?.role, "group");
        assert.strictEqual(rootAttrs?.["data-orientation"], "vertical");
        assert.strictEqual(rootAttrs?.class, fieldVariants({}));
        assert.isDefined(scene.query(fieldLabel));
        scene.expect(fieldDescription).toHaveText("Visible on your profile.");
        // The kit error part is absent while the field is not invalid, so
        // FieldError returns undefined and nothing renders.
        assert.isUndefined(scene.query(fieldError));
        assert.isUndefined(scene.get(fieldControl).attrs?.["aria-invalid"]);
      }),
  );

  it.effect(
    'invalid: the root bridges data-invalid="true", the control is aria-invalid, and FieldError shows the message',
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(ProfileForm, { invalid: true });
        // D-5 bridge: the port overwrites the kit's empty data-invalid
        // flag with upstream's "true" value form.
        assert.strictEqual(scene.get(fieldRoot).attrs?.["data-invalid"], "true");
        assert.strictEqual(scene.get(fieldControl).attrs?.["aria-invalid"], "true");
        const errorAttrs = scene.get(fieldError).attrs;
        assert.strictEqual(errorAttrs?.class, FIELD_ERROR_CLASS);
        // FieldError keeps the kit error part's role="alert", as upstream's
        // FieldError div carries it too.
        assert.strictEqual(errorAttrs?.role, "alert");
        scene.expect(fieldError).toHaveText("Enter your name");
        // The control's aria-describedby ends at the error's id.
        assert.include(
          scene.get(fieldControl).attrs?.["aria-describedby"] ?? "",
          errorAttrs?.id ?? "missing",
        );
      }),
  );
});
