/**
 * ContributionsActivity — shadcn/ui block `preview`
 * (registry/bases/radix/blocks/preview/cards/contributions-activity.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a React function rendering a Card with a plain `<form
 * id="contributions-activity">` holding a FieldSet — a screen-reader
 * legend, and one horizontal Field pairing a Checkbox with a
 * FieldContent label/description — plus a footer submit Button bound
 * to the form by its `form` attribute. Here: a Component — the kit
 * Checkbox is controlled, so the checked state lives in the Model
 * and toggles arrive as the `ToggledPrivateProfile` Message. The
 * Save button is upstream's placeholder (the form has no handler),
 * sent as the no-op `PressedSave` Message.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `<form>` has no handler, so a browser submit reloads
 *   the page; here submit is captured (`preventDefault`) as the
 *   `PressedSave` Message so the example stays put, and the footer
 *   button (which upstream binds via `form="contributions-activity"`,
 *   kept as an attribute) sends the same Message.
 * - Label/control pairing is the kit Field's generated-id wiring with
 *   the upstream id passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes.
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Button } from "@/components/ui/button.ts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card.ts";
import { Checkbox } from "@/components/ui/checkbox.ts";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field.ts";

export const ContributionsActivityMessage = UiSchema.TaggedEnum({
  ToggledPrivateProfile: { checked: Schema.Boolean },
  PressedSave: {},
});

export const ContributionsActivity = Html.component({
  name: "PreviewContributionsActivity",
  model: Schema.Struct({ privateProfile: Schema.Boolean }),
  message: ContributionsActivityMessage,
}).make({
  init: () => ({ privateProfile: false }),
  update: {
    ToggledPrivateProfile: ($, { checked }) => $.evolve({ privateProfile: checked }),
    // Placeholder handler, as upstream: no save happens.
    PressedSave: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h).children(
      CardHeader(h).children(
        CardTitle(h).children("Contributions & Activity"),
        CardDescription(h).children("Manage your contributions and activity visibility."),
      ),
      CardContent(h).children(
        h.form
          .attr("id", "contributions-activity")
          .on("submit", ContributionsActivityMessage.PressedSave(), { preventDefault: true })
          .children(
            FieldGroup(h).children(
              FieldSet(h).children(
                FieldLegend(h, { class: "sr-only" }).children("Contributions & activity"),
                FieldGroup(h).children(
                  Field(h, {
                    key: "activity-private-profile",
                    props: { id: "activity-private-profile" },
                    orientation: "horizontal",
                    view: (field) =>
                      field.root(h.div).children(
                        Checkbox(h, {
                          props: { checked: model.privateProfile },
                          onToggle: ({ checked }) =>
                            ContributionsActivityMessage.ToggledPrivateProfile({ checked }),
                        }),
                        FieldContent(h).children(
                          FieldLabel(field.label(h.label)).children(
                            "Make profile private and hide activity",
                          ),
                          FieldDescription(field.description(h.p)).children(
                            "Enabling this will hide your contributions and activity from your GitHub profile and from social features like followers, stars, feeds, leaderboards and releases.",
                          ),
                        ),
                      ),
                  }),
                ),
              ),
            ),
          ),
      ),
      CardFooter(h).children(
        Button(h, {
          class: "style-sera:w-full",
          onPress: ContributionsActivityMessage.PressedSave(),
        })
          .attr("form", "contributions-activity")
          .children("Save Changes"),
      ),
    ),
});
