/**
 * InviteTeam — shadcn/ui block `preview` (registry/bases/radix/blocks/preview/cards/invite-team.tsx), bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a Card titled "Invite Team" ("Add members to your
 * workspace") listing two pending invites — an email Input beside a
 * role Select (Admin / Editor / Viewer, popper-positioned, aligned
 * end) per row — followed by an outline "Add another" Button, a
 * Separator, a Field sharing the read-only invite link through an
 * InputGroup with a copy InputGroupButton, and a full-width "Send
 * Invites" footer Button. Here the card is a Component: the kit
 * Input is controlled (D-7) and the kit Select is controlled, so the
 * emails, roles, the open select and the invite link live in the
 * Model and edits / picks arrive as Messages. "Add another", the copy
 * button and "Send Invites" are Messages whose handlers are
 * deliberate no-ops — upstream wires no handlers either.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's Select anatomy (SelectTrigger / SelectContent /
 *   SelectGroup / SelectItem / SelectValue) collapses into the
 *   select port's single `Select` component, exactly as that port
 *   declares; the trigger's `w-24` becomes its `triggerClass`, and
 *   `position="popper"` + `align="end"` map to the wrapper's
 *   `position` option and the kit's `align` prop.
 * - Upstream's invite rows are uncontrolled (`defaultValue`); here
 *   the Model is seeded with the same values (alex@example.com /
 *   Editor, sam@example.com / Viewer) and the selects' open state is
 *   Model state — at most one role select is open at a time.
 * - Icons: upstream's `IconPlaceholder` is a create-app component
 *   that swaps icon libraries; only the lucide rendering is ported.
 *   The `PlusIcon` and `CopyIcon` placeholders become the local
 *   builders below, built with the shared `icon()` helper from
 *   lucide's `plus` and `copy` path data (ISC), copied verbatim; the
 *   placeholders' `data-icon` attributes are kept.
 * - The invite-link Field's label pairing is the kit Field's
 *   generated-id wiring with the upstream id passed as the Field
 *   `id` prop; the InputGroup control is drawn inside the field root
 *   without `field.control` stacking (the group is composite), and
 *   the upstream `id="invite-link"` is stamped on the input itself.
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
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
import { Field, FieldLabel } from "@/components/ui/field.ts";
import { Input } from "@/components/ui/input.ts";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group.ts";
import { Select } from "@/components/ui/select.ts";
import { Separator } from "@/components/ui/separator.ts";
import { icon, type IconOptions } from "@/lib/icons";

/** Lucide `plus` (ISC): upstream's `PlusIcon` placeholder. */
const PlusIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M5 12h14" }],
      ["path", { d: "M12 5v14" }],
    ],
    options,
  );

/** Lucide `copy` (ISC): upstream's `CopyIcon` placeholder. */
const CopyIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }],
      ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }],
    ],
    options,
  );

export const InviteTeamMessage = UiSchema.TaggedEnum({
  UpdatedEmail: { index: Schema.Number, value: Schema.String },
  RoleSelectOpened: { index: Schema.Number },
  RoleSelectClosed: {},
  RolePicked: { index: Schema.Number, value: Schema.String },
  PressedAddAnother: {},
  PressedCopyLink: {},
  PressedSendInvites: {},
});

const ROLE_ITEMS = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
] as const;

export const InviteTeam = Html.component({
  name: "PreviewInviteTeam",
  model: Schema.Struct({
    emails: Schema.Array(Schema.String),
    roles: Schema.Array(Schema.String),
    openSelect: Schema.NullOr(Schema.Number),
    inviteLink: Schema.String,
  }),
  message: InviteTeamMessage,
}).make({
  init: () => ({
    emails: ["alex@example.com", "sam@example.com"],
    roles: ["editor", "viewer"],
    openSelect: null,
    inviteLink: "https://app.co/invite/x8f2k",
  }),
  update: {
    UpdatedEmail: ($, { index, value }) =>
      $.evolve({ emails: $.model.emails.map((email, i) => (i === index ? value : email)) }),
    RoleSelectOpened: ($, { index }) => $.evolve({ openSelect: index }),
    RoleSelectClosed: ($) => $.evolve({ openSelect: null }),
    RolePicked: ($, { index, value }) =>
      $.evolve({
        roles: $.model.roles.map((role, i) => (i === index ? value : role)),
        openSelect: null,
      }),
    // Placeholder handlers, as upstream: no invite is added, copied or sent.
    PressedAddAnother: ($) => $.evolve({}),
    PressedCopyLink: ($) => $.evolve({}),
    PressedSendInvites: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h).children(
      CardHeader(h).children(
        CardTitle(h).children("Invite Team"),
        CardDescription(h).children("Add members to your workspace"),
      ),
      CardContent(h, { class: "flex flex-col gap-4" }).children(
        h.div.class("flex flex-col gap-3").children(
          model.emails.map((email, index) =>
            h.div
              .key(email)
              .class("flex items-center gap-2")
              .children(
                Input(h, {
                  props: { value: email },
                  onUpdate: ({ value }) => InviteTeamMessage.UpdatedEmail({ index, value }),
                  class: "flex-1",
                }),
                Select(h, {
                  props: {
                    open: model.openSelect === index,
                    value: model.roles[index],
                    align: "end",
                    items: [...ROLE_ITEMS],
                  },
                  onEmit: {
                    RequestedOpen: () => InviteTeamMessage.RoleSelectOpened({ index }),
                    RequestedClose: () => InviteTeamMessage.RoleSelectClosed(),
                    Picked: ({ value }) =>
                      typeof value === "string"
                        ? InviteTeamMessage.RolePicked({ index, value })
                        : undefined,
                    Settled: () => undefined,
                  },
                  position: "popper",
                  triggerClass: "w-24",
                }),
              ),
          ),
        ),
        Button(h, { variant: "outline", onPress: InviteTeamMessage.PressedAddAnother() }).children(
          PlusIcon(h).attr("data-icon", "inline-start"),
          "Add another",
        ),
        Separator(h),
        Field(h, {
          key: "invite-link",
          props: { id: "invite-link" },
          view: (field) =>
            field.root(h.div).children(
              FieldLabel(field.label(h.label)).children("Or share invite link"),
              InputGroup(h).children(
                InputGroupInput(h, { props: { value: model.inviteLink } })
                  .attr("id", "invite-link")
                  .attr("readonly", ""),
                InputGroupAddon(h, { align: "inline-end" }).children(
                  InputGroupButton(h, {
                    size: "icon-xs",
                    onPress: InviteTeamMessage.PressedCopyLink(),
                  })
                    .attr("aria-label", "Copy link")
                    .children(CopyIcon(h)),
                ),
              ),
            ),
        }),
      ),
      CardFooter(h).children(
        Button(h, { class: "w-full", onPress: InviteTeamMessage.PressedSendInvites() }).children(
          "Send Invites",
        ),
      ),
    ),
});
