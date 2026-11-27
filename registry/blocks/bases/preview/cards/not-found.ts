/**
 * NotFound — shadcn/ui block `preview` (registry/bases/radix/blocks/preview/cards/not-found.tsx), bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a Card whose content is an `h-72` Empty state titled
 * "404 - Not Found" ("The page you're looking for doesn't exist. Try
 * searching for what you need below.") with an InputGroup search box
 * (a search glyph addon, a "Try searching for pages..." input and a
 * `/` Kbd in the inline-end addon) and a link-variant "Go to
 * homepage" Button. Here the card is a Component: the kit
 * InputGroupInput is a controlled Input (D-7), so the search text
 * lives in the Model and edits arrive as Messages. The homepage
 * Button is a Message whose handler is a deliberate no-op — upstream
 * wires no handler either.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Icons: upstream's `IconPlaceholder` is a create-app component
 *   that swaps icon libraries; only the lucide rendering is ported.
 *   The `SearchIcon` placeholder becomes the shared `SearchIcon`
 *   builder from `@/lib/icons`.
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Button } from "@/components/ui/button.ts";
import { Card, CardContent } from "@/components/ui/card.ts";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty.ts";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group.ts";
import { Kbd } from "@/components/ui/kbd.ts";
import { SearchIcon } from "@/lib/icons";

export const NotFoundMessage = UiSchema.TaggedEnum({
  UpdatedQuery: { value: Schema.String },
  PressedHomepage: {},
});

export const NotFound = Html.component({
  name: "PreviewNotFound",
  model: Schema.Struct({ query: Schema.String }),
  message: NotFoundMessage,
}).make({
  init: () => ({ query: "" }),
  update: {
    UpdatedQuery: ($, { value }) => $.evolve({ query: value }),
    // Placeholder handler, as upstream: no navigation happens.
    PressedHomepage: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h).children(
      CardContent(h).children(
        Empty(h, { class: "h-72" }).children(
          EmptyHeader(h).children(
            EmptyTitle(h).children("404 - Not Found"),
            EmptyDescription(h).children(
              "The page you're looking for doesn't exist. Try searching for what you need below.",
            ),
          ),
          EmptyContent(h).children(
            InputGroup(h, { class: "w-3/4" }).children(
              InputGroupInput(h, {
                props: { value: model.query },
                onUpdate: ({ value }) => NotFoundMessage.UpdatedQuery({ value }),
              }).attr("placeholder", "Try searching for pages..."),
              InputGroupAddon(h).children(SearchIcon(h)),
              InputGroupAddon(h, { align: "inline-end" }).children(Kbd(h).children("/")),
            ),
            Button(h, { variant: "link", onPress: NotFoundMessage.PressedHomepage() }).children(
              "Go to homepage",
            ),
          ),
        ),
      ),
    ),
});
