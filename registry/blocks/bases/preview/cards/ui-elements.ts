/**
 * UIElements — shadcn/ui block `preview` (cards/ui-elements.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a "use client" React function rendering a Card that
 * showcases the bases controls in one column: four Button variants; an
 * outline Item ("Two-factor authentication") with an Enable button; a
 * Slider (value [500] in useState, min 0, max 1000, step 10); an
 * InputGroup with a "Name" input and a search-icon addon; a "Message"
 * Textarea; a row of three Badges beside a RadioGroup (defaultValue
 * "apple", items apple / banana) and two Checkboxes (first
 * defaultChecked); and a final row with an AlertDialog ("Allow
 * accessory to connect?"), a ButtonGroup whose second button is a
 * DropdownMenu trigger (ChevronUp icon; Quick Actions / Conversation
 * groups and a destructive Delete Conversation item), and a
 * default-checked Switch. Here the card is a Component: one Model
 * field per control, seeded with upstream's defaults — slider [500],
 * name "", message "", plan "apple", first checkbox checked, second
 * unchecked, switch checked, alert-dialog closed, menu closed — and
 * every interaction arrives as a `<Name>Message` entry. Upstream's
 * handler-less controls (the showcase Buttons, Enable, the Badges, the
 * AlertDialog's Allow action) are Messages or plain draws with
 * deliberate no-op handlers, exactly as upstream wires nothing.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Icons: upstream's `IconPlaceholder` swaps icon libraries; only the
 *   lucide rendering is ported — `SearchIcon` for the input-group
 *   addon and `ChevronUpIcon` for the menu trigger, both shared
 *   builders from `@/lib/icons`. Upstream gives the placeholders no
 *   class, so none is applied.
 * - The AlertDialog is the kit AlertDialog composition (D-6): this
 *   Component owns `alertOpen` in its Model, the trigger is the port's
 *   outline Button stacked under the kit's trigger part (D-2), and
 *   upstream's Cancel ("Don't allow") / Action ("Allow") are the
 *   port's AlertDialogCancel / AlertDialogAction parts with
 *   upstream's `size="sm"` content option. Both close via the kit's
 *   RequestedClose; upstream's Action has no further handler either.
 * - The DropdownMenu is the kit Menu composition (D-6): this
 *   Component owns `menuOpen` in its Model, the items are props data
 *   and the two upstream groups are drawn in the view with the kit's
 *   group / groupLabel parts under the same keys, the trigger is the
 *   port's outline icon Button stacked under the kit's trigger part
 *   (D-2), and picking an item sends the no-op `PickedMenuItem`
 *   Message — upstream's items have no handlers. Upstream's content
 *   options (align "end", side "top") map to the Menu props of the
 *   same names, and its `w-fit` content class is kept.
 * - Upstream's RadioGroup / Checkbox / Switch are uncontrolled
 *   (`defaultValue` / `defaultChecked`); the kit parts are controlled
 *   (D-7), so the Model holds their values, seeded with upstream's
 *   defaults.
 * - The kit Field requires a `view` per field; the two upstream Fields
 *   here carry no labels, so each Field's root wraps its control
 *   directly, with the upstream Field classes kept (`flex-1` on the
 *   Textarea's Field).
 * - The message control is drawn directly on
 *   `field.control(h.textarea)` with the textarea port's own
 *   `TEXTAREA_CLASS`, `data-slot` and controlled-value / `input`
 *   wiring: the port's `Textarea` wrapper cannot be called here
 *   because its `TextareaElement` type (`Html.Element`) does not
 *   accept `h.textarea` (a `VoidElement` builder) — a type-level
 *   mismatch in the ui port, replicated faithfully instead (the
 *   feedback-form pattern).
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.ts";
import { Badge } from "@/components/ui/badge.ts";
import { Button } from "@/components/ui/button.ts";
import { ButtonGroup } from "@/components/ui/button-group.ts";
import { Card, CardContent } from "@/components/ui/card.ts";
import { Checkbox } from "@/components/ui/checkbox.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.ts";
import { Field, FieldGroup } from "@/components/ui/field.ts";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group.ts";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item.ts";
import { RadioGroup } from "@/components/ui/radio-group.ts";
import { Slider } from "@/components/ui/slider.ts";
import { Switch } from "@/components/ui/switch.ts";
import { TEXTAREA_CLASS } from "@/components/ui/textarea.ts";
import { cn } from "@/lib/utils";
import { ChevronUpIcon, SearchIcon } from "@/lib/icons";

export const UIElementsMessage = UiSchema.TaggedEnum({
  MovedSlider: { value: Schema.Union([Schema.Number, Schema.Array(Schema.Number)]) },
  UpdatedName: { value: Schema.String },
  UpdatedMessageText: { value: Schema.String },
  PickedPlan: { value: Schema.String },
  ToggledFirstCheckbox: { checked: Schema.Boolean },
  ToggledSecondCheckbox: { checked: Schema.Boolean },
  ToggledSwitch: { checked: Schema.Boolean },
  RequestedOpenAlert: {},
  RequestedCloseAlert: {},
  RequestedOpenMenu: {},
  RequestedCloseMenu: {},
  PickedMenuItem: { value: Schema.String },
});

export const UIElements = Html.component({
  name: "UIElements",
  model: Schema.Struct({
    sliderValue: Schema.Array(Schema.Number),
    name: Schema.String,
    messageText: Schema.String,
    plan: Schema.String,
    firstChecked: Schema.Boolean,
    secondChecked: Schema.Boolean,
    switchChecked: Schema.Boolean,
    alertOpen: Schema.Boolean,
    menuOpen: Schema.Boolean,
  }),
  message: UIElementsMessage,
}).make({
  init: () => ({
    sliderValue: [500],
    name: "",
    messageText: "",
    plan: "apple",
    firstChecked: true,
    secondChecked: false,
    switchChecked: true,
    alertOpen: false,
    menuOpen: false,
  }),
  update: {
    // Upstream's handleSliderValueChange: normalize to an array.
    MovedSlider: ($, { value }) =>
      $.evolve({ sliderValue: typeof value === "number" ? [value] : [...value] }),
    UpdatedName: ($, { value }) => $.evolve({ name: value }),
    UpdatedMessageText: ($, { value }) => $.evolve({ messageText: value }),
    PickedPlan: ($, { value }) => $.evolve({ plan: value }),
    ToggledFirstCheckbox: ($, { checked }) => $.evolve({ firstChecked: checked }),
    ToggledSecondCheckbox: ($, { checked }) => $.evolve({ secondChecked: checked }),
    ToggledSwitch: ($, { checked }) => $.evolve({ switchChecked: checked }),
    RequestedOpenAlert: ($) => $.evolve({ alertOpen: true }),
    RequestedCloseAlert: ($) => $.evolve({ alertOpen: false }),
    RequestedOpenMenu: ($) => $.evolve({ menuOpen: true }),
    RequestedCloseMenu: ($) => $.evolve({ menuOpen: false }),
    // Placeholder handler, as upstream: menu items wire no actions.
    PickedMenuItem: ($) => $.evolve({}),
  },
  view: (h, model) =>
    Card(h, { class: "w-full" }).children(
      CardContent(h, { class: "flex flex-col gap-6" }).children(
        h.div
          .class("flex flex-col gap-4")
          .children(
            h.div
              .class("flex flex-wrap gap-2")
              .children(
                Button(h).children("Button"),
                Button(h, { variant: "secondary" }).children("Secondary"),
                Button(h, { variant: "outline" }).children("Outline"),
                Button(h, { variant: "ghost" }).children("Ghost"),
              ),
            Item(h, { variant: "outline" }).children(
              ItemContent(h).children(
                ItemTitle(h).children("Two-factor authentication"),
                ItemDescription(h, { class: "text-pretty xl:hidden 2xl:block" }).children(
                  "Verify via email or phone number.",
                ),
              ),
              ItemActions(h, { class: "hidden md:flex" }).children(
                Button(h, { size: "sm", variant: "secondary" }).children("Enable"),
              ),
            ),
          ),
        Slider(h, {
          props: { value: model.sliderValue, max: 1000, min: 0, step: 10 },
          onValueChange: ({ value }) => UIElementsMessage.MovedSlider({ value }),
          class: "flex-1",
          ariaLabels: ["Slider"],
        }),
        FieldGroup(h).children(
          Field(h, {
            key: "name",
            view: (field) =>
              field.root(h.div).children(
                InputGroup(h).children(
                  InputGroupInput(h, {
                    element: field.control(h.input),
                    props: { value: model.name },
                    onUpdate: ({ value }) => UIElementsMessage.UpdatedName({ value }),
                  }).attr("placeholder", "Name"),
                  InputGroupAddon(h, { align: "inline-end" }).children(
                    InputGroupText(h).children(SearchIcon(h)),
                  ),
                ),
              ),
          }),
          Field(h, {
            key: "message",
            class: "flex-1",
            view: (field) =>
              field.root(h.div).children(
                field
                  .control(h.textarea)
                  .attr("data-slot", "textarea")
                  .class(cn(TEXTAREA_CLASS, "resize-none"))
                  .value(model.messageText)
                  .on("input", ({ value }) => UIElementsMessage.UpdatedMessageText({ value }))
                  .attr("placeholder", "Message"),
              ),
          }),
        ),
        h.div.class("flex items-center gap-2").children(
          h.div
            .class("flex gap-2")
            .children(
              Badge(h).children("Badge"),
              Badge(h, { variant: "secondary" }).children("Secondary"),
              Badge(h, { variant: "outline" }).children("Outline"),
            ),
          RadioGroup(h, {
            props: {
              value: model.plan,
              items: [{ value: "apple" }, { value: "banana" }],
            },
            onPick: ({ value }) => UIElementsMessage.PickedPlan({ value }),
            class: "ml-auto flex w-fit gap-3",
          }),
          h.div.class("flex gap-3").children(
            Checkbox(h, {
              props: { checked: model.firstChecked },
              onToggle: ({ checked }) => UIElementsMessage.ToggledFirstCheckbox({ checked }),
            }),
            Checkbox(h, {
              props: { checked: model.secondChecked },
              onToggle: ({ checked }) => UIElementsMessage.ToggledSecondCheckbox({ checked }),
            }),
          ),
        ),
        h.div.class("flex items-center gap-4").children(
          AlertDialog(h, {
            props: { open: model.alertOpen },
            onEmit: {
              RequestedOpen: () => UIElementsMessage.RequestedOpenAlert(),
              RequestedClose: () => UIElementsMessage.RequestedCloseAlert(),
              Settled: () => undefined,
            },
            view: (ad) =>
              h.div(
                AlertDialogTrigger(ad, Button(h, { variant: "outline" })).children(
                  h.span.class("hidden md:flex style-sera:md:hidden").children("Alert Dialog"),
                  h.span.class("flex md:hidden style-sera:md:flex").children("Dialog"),
                ),
                ad
                  .portal(h.dialog)
                  ?.children(
                    ad.backdrop(h.div),
                    AlertDialogContent(ad, h.div, { size: "sm" }).children(
                      AlertDialogHeader(h).children(
                        AlertDialogTitle(ad, h.h2).children("Allow accessory to connect?"),
                        AlertDialogDescription(ad, h.p).children(
                          "Do you want to allow the USB accessory to connect to this device and your data?",
                        ),
                      ),
                      AlertDialogFooter(h).children(
                        AlertDialogCancel(ad, h.button).children("Don't allow"),
                        AlertDialogAction(ad, h.button).children("Allow"),
                      ),
                    ),
                  ),
              ),
          }),
          ButtonGroup(h).children(
            Button(h, { variant: "outline" }).children(
              h.span.class("style-sera:hidden").children("Button Group"),
              h.span.class("hidden style-sera:block").children("Group"),
            ),
            DropdownMenu(h, {
              props: {
                open: model.menuOpen,
                items: [
                  { value: "mute", label: "Mute Conversation" },
                  { value: "mark-as-read", label: "Mark as Read" },
                  { value: "block", label: "Block User" },
                  { value: "share", label: "Share Conversation" },
                  { value: "copy", label: "Copy Conversation" },
                  { value: "report", label: "Report Conversation" },
                  { value: "delete", label: "Delete Conversation" },
                ],
                align: "end",
                side: "top",
              },
              onEmit: {
                RequestedOpen: () => UIElementsMessage.RequestedOpenMenu(),
                RequestedClose: () => UIElementsMessage.RequestedCloseMenu(),
                Picked: ({ value }) => UIElementsMessage.PickedMenuItem({ value: String(value) }),
                Highlighted: () => undefined,
                RequestedQuery: () => undefined,
                Settled: () => undefined,
              },
              view: (menu) =>
                h.div(
                  DropdownMenuTrigger(menu, h, {
                    element: Button(h, { variant: "outline", size: "icon" }),
                  }).children(ChevronUpIcon(h)),
                  DropdownMenuContent(menu, h, { class: "w-fit" }).children(
                    DropdownMenuGroup(menu, h, { group: "quick-actions" }, [
                      DropdownMenuLabel(menu, h, { group: "quick-actions" }).children(
                        "Quick Actions",
                      ),
                      DropdownMenuItem(menu, h, { value: "mute" }).children("Mute Conversation"),
                      DropdownMenuItem(menu, h, { value: "mark-as-read" }).children("Mark as Read"),
                      DropdownMenuItem(menu, h, { value: "block" }).children("Block User"),
                    ]),
                    DropdownMenuSeparator(menu, h),
                    DropdownMenuGroup(menu, h, { group: "conversation" }, [
                      DropdownMenuLabel(menu, h, { group: "conversation" }).children(
                        "Conversation",
                      ),
                      DropdownMenuItem(menu, h, { value: "share" }).children("Share Conversation"),
                      DropdownMenuItem(menu, h, { value: "copy" }).children("Copy Conversation"),
                      DropdownMenuItem(menu, h, { value: "report" }).children(
                        "Report Conversation",
                      ),
                    ]),
                    DropdownMenuSeparator(menu, h),
                    DropdownMenuGroup(menu, h, { group: "delete" }, [
                      DropdownMenuItem(menu, h, {
                        value: "delete",
                        variant: "destructive",
                      }).children("Delete Conversation"),
                    ]),
                  ),
                ),
            }),
          ),
          Switch(h, {
            props: { checked: model.switchChecked },
            onToggle: ({ checked }) => UIElementsMessage.ToggledSwitch({ checked }),
            class: "ml-auto",
          }),
        ),
      ),
    ),
});
