/**
 * SocialLinks — shadcn/ui block `preview-02` (cards/social-links.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card with four
 * Field/InputGroup rows (Spotify and Instagram uncontrolled with
 * `defaultValue`, SoundCloud and Website with placeholders only), each
 * addon holding an icon, and Discard / Save Changes footer buttons.
 * Here: a Component — the kit input is controlled (D-7), so the four
 * values live in the Model and edits arrive as Messages. The footer
 * buttons are Messages whose handlers are deliberate no-ops — upstream
 * wires neither.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `IconPlaceholder` (a create-app component that swaps icon
 *   libraries) is ported as its lucide rendering only: file-local
 *   builders for circle-plus / camera / cloud / globe below.
 * - Label/control pairing is the kit Field's generated-id wiring with
 *   the upstream ids passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes; the InputGroupInput
 *   stacks on the Field's control part, as in the input-group port.
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Button } from "@/components/ui/button.ts";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.ts";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field.ts";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group.ts";
import { icon, type IconOptions } from "@/lib/icons";

// ---------------------------------------------------------------------------
// Icons — file-local builders for glyphs `@/lib/icons` does not hoist;
// node data copied verbatim from lucide's SVGs (ISC).
// ---------------------------------------------------------------------------

/** Lucide `circle-plus` (ISC). */
const CirclePlusIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["path", { d: "M8 12h8" }],
      ["path", { d: "M12 8v8" }],
    ],
    options,
  );

/** Lucide `camera` (ISC). */
const CameraIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",
        },
      ],
      ["circle", { cx: "12", cy: "13", r: "3" }],
    ],
    options,
  );

/** Lucide `cloud` (ISC). */
const CloudIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(h, [["path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" }]], options);

/** Lucide `globe` (ISC). */
const GlobeIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }],
      ["path", { d: "M2 12h20" }],
    ],
    options,
  );

export const SocialLinksMessage = UiSchema.TaggedEnum({
  UpdatedSpotify: { value: Schema.String },
  UpdatedInstagram: { value: Schema.String },
  UpdatedSoundcloud: { value: Schema.String },
  UpdatedWebsite: { value: Schema.String },
  PressedDiscard: {},
  PressedSave: {},
});

export const SocialLinks = Html.component({
  name: "Preview02SocialLinks",
  model: Schema.Struct({
    spotify: Schema.String,
    instagram: Schema.String,
    soundcloud: Schema.String,
    website: Schema.String,
  }),
  message: SocialLinksMessage,
}).make({
  init: () => ({
    spotify: "spotify.com/artist/3j...2k",
    instagram: "@julianduryea_music",
    soundcloud: "",
    website: "",
  }),
  update: {
    UpdatedSpotify: ($, { value }) => $.evolve({ spotify: value }),
    UpdatedInstagram: ($, { value }) => $.evolve({ instagram: value }),
    UpdatedSoundcloud: ($, { value }) => $.evolve({ soundcloud: value }),
    UpdatedWebsite: ($, { value }) => $.evolve({ website: value }),
    // Placeholder handlers, as upstream: the buttons do nothing.
    PressedDiscard: ($) => $.evolve({}),
    PressedSave: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h).children(
      CardHeader(h).children(CardTitle(h).children("Social Links")),
      CardContent(h).children(
        FieldGroup(h).children(
          Field(h, {
            key: "spotify-url",
            props: { id: "spotify-url" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("Spotify Artist URL"),
                InputGroup(h).children(
                  InputGroupAddon(h).children(CirclePlusIcon(h)),
                  InputGroupInput(h, {
                    element: field.control(h.input),
                    props: { value: model.spotify },
                    onUpdate: ({ value }) => SocialLinksMessage.UpdatedSpotify({ value }),
                  }),
                ),
              ),
          }),
          Field(h, {
            key: "instagram-handle",
            props: { id: "instagram-handle" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("Instagram Handle"),
                InputGroup(h).children(
                  InputGroupAddon(h).children(CameraIcon(h)),
                  InputGroupInput(h, {
                    element: field.control(h.input),
                    props: { value: model.instagram },
                    onUpdate: ({ value }) => SocialLinksMessage.UpdatedInstagram({ value }),
                  }),
                ),
              ),
          }),
          Field(h, {
            key: "soundcloud-url",
            props: { id: "soundcloud-url" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("SoundCloud URL"),
                InputGroup(h).children(
                  InputGroupAddon(h).children(CloudIcon(h)),
                  InputGroupInput(h, {
                    element: field.control(h.input),
                    props: { value: model.soundcloud },
                    onUpdate: ({ value }) => SocialLinksMessage.UpdatedSoundcloud({ value }),
                  }).attr("placeholder", "soundcloud.com/username"),
                ),
              ),
          }),
          Field(h, {
            key: "website-url",
            props: { id: "website-url" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("Website"),
                InputGroup(h).children(
                  InputGroupAddon(h).children(GlobeIcon(h)),
                  InputGroupInput(h, {
                    element: field.control(h.input),
                    props: { value: model.website },
                    onUpdate: ({ value }) => SocialLinksMessage.UpdatedWebsite({ value }),
                  }).attr("placeholder", "https://yoursite.com"),
                ),
              ),
          }),
        ),
      ),
      CardFooter(h, { class: "justify-end gap-2 style-sera:justify-center" }).children(
        Button(h, {
          variant: "secondary",
          class: "style-sera:flex-1",
          onPress: SocialLinksMessage.PressedDiscard(),
        }).children("Discard"),
        Button(h, {
          class: "style-sera:flex-1",
          onPress: SocialLinksMessage.PressedSave(),
        }).children("Save Changes"),
      ),
    ),
});
