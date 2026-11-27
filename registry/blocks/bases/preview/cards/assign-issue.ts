/**
 * AssignIssue — shadcn/ui block `preview`
 * (registry/bases/radix/blocks/preview/cards/assign-issue.tsx), bases
 * generation, ported 1:1 to Effect UI.
 *
 * Upstream: a React function rendering a small Card titled "Assign
 * Issue": a header action holding a Tooltip-wrapped outline icon
 * button ("Add user"), and a multiple Combobox in chips mode listing
 * seven GitHub users — the first preselected via `defaultValue` —
 * where each chip and item shows the user's GitHub Avatar beside the
 * username. This card is not part of the preview page grid upstream;
 * it is ported standalone, as assigned. Here: a Component — the kit
 * Combobox is controlled, so `open`, the selected users and the
 * input text live in the Model (initialised to upstream's
 * `defaultValue`) and the kit's events arrive as Messages; the
 * Tooltip's open state lives in the Model too.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `<IconPlaceholder lucide="PlusIcon" … />` is a
 *   create-app component that swaps icon libraries; only the lucide
 *   rendering is ported — the `plus` glyph via the file-local builder
 *   below. The other libraries are create-tool switching chrome, not
 *   ported.
 * - The Combobox port's chips/item anatomy renders the item label
 *   text only, so the Avatars upstream draws inside each chip and
 *   item are not reproduced; chips and items show the username, as
 *   the wrapper's anatomy dictates (see the combobox port's header).
 * - `useComboboxAnchor` is a React ref hook — the kit anchors the
 *   popup to the chips input group itself, so there is nothing to
 *   port (the combobox port declares the same).
 * - The Tooltip trigger is the kit Tooltip's `trigger` part stacked
 *   on a `buttonVariants`-styled button (the D-2 composition this
 *   repo uses for part triggers), carrying the Button's
 *   `data-variant` / `data-size` stamps.
 * - Upstream's `size="sm"` on the Card uses the bases generation's
 *   small card size; the in-repo `Card` wrapper's options predate it,
 *   so the size is stamped as a `data-size="sm"` attribute bridge
 *   (D-9) — the bases preset keys the small-card spacing off it,
 *   exactly as upstream's variant does.
 * - The chips input's placeholder follows upstream's rule (shown
 *   only while nothing is selected: "Select a item..." — upstream's
 *   copy, kept verbatim); it is passed as the kit's `placeholder`
 *   prop, recomputed from the Model on every render.
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { buttonVariants } from "@/components/ui/button.ts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { Combobox } from "@/components/ui/combobox.ts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.ts";
import { icon, type IconOptions } from "@/lib/icons";

/** Lucide `plus` (ISC). */
const PlusIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M5 12h14" }],
      ["path", { d: "M12 5v14" }],
    ],
    options,
  );

// Users available for assignment.
const users: ReadonlyArray<string> = [
  "shadcn",
  "maxleiter",
  "evilrabbit",
  "pranathip",
  "jorgezreik",
  "shuding",
  "rauchg",
];

export const AssignIssueMessage = UiSchema.TaggedEnum({
  ComboOpened: {},
  ComboClosed: {},
  ComboPicked: { value: Schema.Array(Schema.String) },
  ComboInput: { text: Schema.String },
  TooltipOpened: {},
  TooltipClosed: {},
});

export const AssignIssue = Html.component({
  name: "PreviewAssignIssue",
  model: Schema.Struct({
    open: Schema.Boolean,
    value: Schema.Array(Schema.String),
    inputValue: Schema.String,
    tooltipOpen: Schema.Boolean,
  }),
  message: AssignIssueMessage,
}).make({
  init: () => ({ open: false, value: ["shadcn"], inputValue: "", tooltipOpen: false }),
  update: {
    ComboOpened: ($) => $.evolve({ open: true }),
    ComboClosed: ($) => $.evolve({ open: false }),
    ComboPicked: ($, { value }) => $.evolve({ value: [...value] }),
    ComboInput: ($, { text }) => $.evolve({ inputValue: text }),
    TooltipOpened: ($) => $.evolve({ tooltipOpen: true }),
    TooltipClosed: ($) => $.evolve({ tooltipOpen: false }),
  },
  view: (h, model) =>
    Card(h, { class: "w-full max-w-sm" })
      .attr("data-size", "sm")
      .children(
        CardHeader(h, { class: "border-b" }).children(
          CardTitle(h, { class: "text-sm" }).children("Assign Issue"),
          CardDescription(h, { class: "text-sm" }).children(
            "Select users to assign to this issue.",
          ),
          CardAction(h).children(
            Tooltip(h, {
              props: { open: model.tooltipOpen },
              onEmit: {
                RequestedOpen: () => AssignIssueMessage.TooltipOpened(),
                RequestedClose: () => AssignIssueMessage.TooltipClosed(),
              },
              view: (tooltip) =>
                h.div(
                  TooltipTrigger(
                    tooltip
                      .trigger(
                        h.button.class(buttonVariants({ variant: "outline", size: "icon-xs" })),
                      )
                      .attr("data-variant", "outline")
                      .attr("data-size", "icon-xs"),
                  ).children(PlusIcon(h)),
                  tooltip
                    .positioner(h.div)
                    .children(TooltipContent(tooltip.popup(h.div)).children("Add user")),
                ),
            }),
          ),
        ),
        CardContent(h).children(
          Combobox(h, {
            props: {
              open: model.open,
              value: model.value,
              inputValue: model.inputValue,
              items: users.map((username) => ({ value: username, label: username })),
              multiple: true,
              autoHighlight: true,
              placeholder: model.value.length > 0 ? undefined : "Select a item...",
            },
            chips: true,
            emptyText: "No users found.",
            onEmit: {
              RequestedOpen: () => AssignIssueMessage.ComboOpened(),
              RequestedClose: () => AssignIssueMessage.ComboClosed(),
              Picked: ({ value }) =>
                AssignIssueMessage.ComboPicked({
                  value:
                    value === null || value === undefined
                      ? []
                      : typeof value === "string"
                        ? [value]
                        : [...value],
                }),
              RequestedInputValue: ({ inputValue }) =>
                AssignIssueMessage.ComboInput({ text: inputValue }),
              Highlighted: () => undefined,
              Settled: () => undefined,
            },
          }),
        ),
      ),
});
