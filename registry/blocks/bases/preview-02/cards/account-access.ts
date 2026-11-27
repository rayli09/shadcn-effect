/**
 * AccountAccess — shadcn/ui block `preview-02`
 * (registry/bases/radix/blocks/preview-02/cards/account-access.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a Card with a FieldGroup of two uncontrolled Inputs
 * (`defaultValue` seeds them) for email / current password, an
 * "Update Security" Button, and a muted Item rendered `asChild` on an
 * anchor (the "Danger Zone" row). Here the card is a Component: the
 * kit `Input` is controlled (D-7), so the field values live in the
 * Model, seeded from upstream's `defaultValue`s, and edits arrive as
 * Messages. "Update Security" is a Message whose handler is a
 * deliberate no-op — upstream wires no submit either.
 *
 * Declared divergences (anything else is a bug):
 *
 * - `Item asChild` (D-2): the port's `Item` always renders a <div>, so
 *   the anchor row is drawn by the local `ItemLink` below, which
 *   stacks the item's variants and `data-*` stamps on an `h.a` —
 *   exactly the stamps `Item` itself writes, on the anchor upstream
 *   rendered (the same pattern as the sidebar blocks' menu links).
 * - Label/control pairing is the kit Field's generated-id wiring with
 *   the upstream ids passed as the Field `id` prop, instead of
 *   hand-written `htmlFor` / `id` attributes.
 * - Upstream's `IconPlaceholder` swaps icon libraries per create-app
 *   params; only the lucide rendering is ported (`LockKeyholeIcon`,
 *   `CircleAlertIcon`, `ArrowRightIcon` below are file-local builders
 *   from lucide's SVG data; the shared `SearchIcon`-family builders in
 *   `@/lib/icons` don't cover these glyphs yet).
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import type * as View from "@effect/ui/View";
import { Schema } from "effect";
import { Button } from "@/components/ui/button.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field.ts";
import { Input } from "@/components/ui/input.ts";
import {
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  itemVariants,
} from "@/components/ui/item.ts";
import { icon, type IconOptions } from "@/lib/icons";

/** Lucide `lock-keyhole` (ISC), via the shared `icon()` helper. */
const LockKeyholeIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "12", cy: "16", r: "1" }],
      ["rect", { x: "3", y: "10", width: "18", height: "12", rx: "2" }],
      ["path", { d: "M7 10V7a5 5 0 0 1 10 0v3" }],
    ],
    options,
  );

/** Lucide `circle-alert` (ISC), via the shared `icon()` helper. */
const CircleAlertIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["line", { x1: "12", x2: "12", y1: "8", y2: "12" }],
      ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16" }],
    ],
    options,
  );

/** Lucide `arrow-right` (ISC), via the shared `icon()` helper. */
const ArrowRightIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M5 12h14" }],
      ["path", { d: "m12 5 7 7-7 7" }],
    ],
    options,
  );

/**
 * Upstream's `Item asChild` row: an <a> wearing the item's variants
 * and stamps (see the header). Variant is upstream's `muted`.
 */
const ItemLink = <Msg>(
  h: Html.H<Msg>,
  options: { readonly href: string },
  ...children: View.Children<Msg>
) =>
  h.a
    .attr("href", options.href)
    .attrs({
      "data-slot": "item",
      "data-variant": "muted",
      "data-size": "default",
    })
    .class(itemVariants({ variant: "muted" }))
    .children(...children);

export const AccountAccessMessage = UiSchema.TaggedEnum({
  UpdatedEmail: { value: Schema.String },
  UpdatedPassword: { value: Schema.String },
  PressedUpdateSecurity: {},
});

export const AccountAccess = Html.component({
  name: "Preview02AccountAccess",
  model: Schema.Struct({ email: Schema.String, password: Schema.String }),
  message: AccountAccessMessage,
}).make({
  init: () => ({ email: "artist@studio.inc", password: "password123" }),
  update: {
    UpdatedEmail: ($, { value }) => $.evolve({ email: value }),
    UpdatedPassword: ($, { value }) => $.evolve({ password: value }),
    // Placeholder handler, as upstream: no security update happens.
    PressedUpdateSecurity: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h).children(
      CardHeader(h).children(
        CardTitle(h).children("Account Access"),
        CardDescription(h).children("Update your credentials or re-authenticate."),
      ),
      CardContent(h).children(
        FieldGroup(h).children(
          Field(h, {
            key: "email-address",
            props: { id: "email-address" },
            view: (field) =>
              field.root(h.div).children(
                FieldLabel(field.label(h.label)).children("Email Address"),
                Input(h, {
                  element: field.control(h.input),
                  props: { value: model.email },
                  onUpdate: ({ value }) => AccountAccessMessage.UpdatedEmail({ value }),
                  type: "email",
                }),
              ),
          }),
          Field(h, {
            key: "current-password",
            props: { id: "current-password" },
            view: (field) =>
              field.root(h.div).children(
                h.div
                  .class("flex items-center justify-between")
                  .children(
                    FieldLabel(field.label(h.label)).children("Current Password"),
                    h.a
                      .attr("href", "#")
                      .class(
                        "text-xs font-medium tracking-wider text-muted-foreground uppercase hover:text-foreground",
                      )
                      .children("Forgot?"),
                  ),
                Input(h, {
                  element: field.control(h.input),
                  props: { value: model.password },
                  onUpdate: ({ value }) => AccountAccessMessage.UpdatedPassword({ value }),
                  type: "password",
                }),
              ),
          }),
        ),
      ),
      CardFooter(h, { class: "flex-col gap-4" }).children(
        Button(h, {
          class: "w-full",
          onPress: AccountAccessMessage.PressedUpdateSecurity(),
        }).children(LockKeyholeIcon(h), "Update Security"),
        ItemLink(
          h,
          { href: "#" },
          ItemMedia(h, { variant: "icon" }).children(
            CircleAlertIcon(h, { class: "text-destructive" }),
          ),
          ItemContent(h).children(
            ItemTitle(h).children("Danger Zone"),
            ItemDescription(h, { class: "line-clamp-1" }).children(
              "Archive account and remove catalog",
            ),
          ),
          ArrowRightIcon(h, { class: "size-4" }),
        ),
      ),
    ),
});
