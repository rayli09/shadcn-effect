/**
 * PromptInput — shadcn/ui block `preview-03`
 * (registry/bases/radix/blocks/preview-03/components/prompt-input.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a client React component rendering a `<form id="chat-form">`
 * around a `FieldGroup` + `InputGroup`: a controlled textarea
 * ("Ask me anything..."), and a block-end addon holding an attach
 * `DropdownMenu` (triggered by a ghost icon-sm `InputGroupButton`),
 * a submit `InputGroupButton` and a stop `InputGroupButton`. The
 * textarea value is React state seeded from `defaultValue` and
 * re-synced by an effect whenever `defaultValue` changes; submit
 * (preventDefault) calls `onSubmit(value)` only when the trimmed
 * value is non-empty. Status logic, verbatim: `isBusy` =
 * submitted | streaming (disables send, together with an empty
 * value); the stop button is `data-visible` only while streaming,
 * the send button whenever not streaming, and
 * `data-[visible=false]:hidden` hides the invisible one.
 *
 * Here: an `Html.component`. The textarea value and the menu /
 * submenu open states live in the Model; the attach menu is the kit
 * `Menu` behind this generation's `DropdownMenu` wrappers
 * (`@/components/ui/dropdown-menu.ts`), its open state owned here
 * (`MenuOpened` / `MenuClosed` / `SubMenuOpened` / `SubMenuClosed`
 * from the Menus' `RequestedOpen` / `RequestedClose`, `Picked` mapped
 * to `Picked`). Form submit is the internal `Submitted({ value })`
 * message, whose update handler re-emits it as the component's
 * `Submitted` event (`PromptInputEvents`) — upstream's `onSubmit`
 * callback as an emitted event: consumers pass
 * `onEmit: { Submitted: ({ value }) => … }` when they draw the
 * component, exactly as the chat cards do.
 *
 * Declared divergences (anything else is a bug):
 *
 * - `status` is the local `ChatStatus` string union below, replacing
 *   the `ChatStatus` type upstream takes from the `ai` package
 *   (banned in this registry). Upstream's `onSubmit` prop is the
 *   `Submitted` event (see above); there is no function prop.
 * - The `defaultValue` effect-sync is NOT reproduced: Effect UI has
 *   no props-change hook, so the Model is initialized from
 *   `defaultValue` in `init` and a changed `defaultValue` takes
 *   effect only when the consumer re-keys the component (call it as
 *   `PromptInput(h, { key: defaultValue, props: { ... } })`).
 * - Upstream's `DropdownMenuTrigger asChild` (D-2): the trigger is
 *   this generation's `InputGroupButton` builder stacked as the Menu
 *   trigger's `element` — the documented composition in the
 *   dropdown-menu port. A kit Menu's `view` returns a single node, so
 *   the view wraps the trigger and the content in a plain `h.div`
 *   (the kit's own documented idiom); upstream's `DropdownMenu` root
 *   renders no element, so this wrapper div is the one extra element.
 * - The menu items carry values (the kit Menu reads its items from
 *   data): `add-photos-and-files`, `take-a-screenshot`,
 *   `create-image`, `deep-research`, `web-search`, `more` (the
 *   submenu trigger), and in the submenu `agent-mode`, `add-sources`,
 *   `create-tasks`. Picking any item is the `Picked` message, whose
 *   handler only closes the menus — upstream wires no item actions.
 * - Upstream's `<IconPlaceholder lucide="..." ... />` calls name five
 *   icon sets; only the lucide glyph renders here. `PlusIcon`,
 *   `PaperclipIcon`, `MonitorIcon`, `ImageIcon`, `BrainIcon`,
 *   `GlobeIcon`, `BotIcon`, `BookOpenIcon`, `ArrowUpIcon` and
 *   `SquareIcon` below are file-local builders over the shared
 *   `icon()` helper in `@/lib/icons`, node data copied verbatim from
 *   lucide's SVGs (ISC); `CheckIcon` / `EllipsisIcon` are the shared
 *   builders from `@/lib/icons` (upstream's `MoreHorizontalIcon` is
 *   lucide's `ellipsis` glyph).
 * - Upstream's stop button has no click handler; here it likewise
 *   carries no `onPress` — it is a status indicator, as upstream.
 * - The textarea is drawn directly on `h.textarea`, replicating the
 *   `InputGroupTextarea` → `Textarea` wiring (the ports'
 *   `TEXTAREA_CLASS` + `INPUT_GROUP_TEXTAREA_CLASS` constants, the
 *   final `data-slot="input-group-control"`, the controlled `value`
 *   and the `input`-event message): the wrappers cannot be called
 *   from a Component's view because their `TextareaElement` type
 *   (`Html.Element`) does not accept a view's `h.textarea` (a
 *   `VoidElement` builder) — a type-level mismatch in the ui port,
 *   the same finding the preview lane's feedback-form header records.
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.ts";
import { FieldGroup } from "@/components/ui/field.ts";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  INPUT_GROUP_TEXTAREA_CLASS,
} from "@/components/ui/input-group.ts";
import { TEXTAREA_CLASS } from "@/components/ui/textarea.ts";
import { CheckIcon, EllipsisIcon, icon, type IconOptions } from "@/lib/icons";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Icons — file-local builders (D-7) for glyphs `@/lib/icons` does not hoist
// yet; node data copied verbatim from lucide's SVGs (ISC).
// ---------------------------------------------------------------------------

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

/** Lucide `paperclip` (ISC). */
const PaperclipIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",
        },
      ],
    ],
    options,
  );

/** Lucide `monitor` (ISC). */
const MonitorIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2" }],
      ["line", { x1: "8", x2: "16", y1: "21", y2: "21" }],
      ["line", { x1: "12", x2: "12", y1: "17", y2: "21" }],
    ],
    options,
  );

/** Lucide `image` (ISC). */
const ImageIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }],
      ["circle", { cx: "9", cy: "9", r: "2" }],
      ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }],
    ],
    options,
  );

/** Lucide `brain` (ISC). */
const BrainIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 18V5" }],
      ["path", { d: "M15 13a4.17 4.17 0 01-3-4 4.17 4.17 0 01-3 4" }],
      ["path", { d: "M17.707 6.294A3 3 0 1012 5a3 3 0 10-5.707 1.294" }],
      ["path", { d: "M17.996 5.125a4 4 0 012.526 5.77" }],
      ["path", { d: "M18 18a4 4 0 002-7.465" }],
      ["path", { d: "M19.967 17.482a4 4 0 11-7.967.517 4 4 0 11-7.967-.517" }],
      ["path", { d: "M6 18a4 4 0 01-2-7.465" }],
      ["path", { d: "M6.004 5.125a4 4 0 00-2.526 5.77" }],
    ],
    options,
  );

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

/** Lucide `bot` (ISC). */
const BotIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 8V4H8" }],
      ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2" }],
      ["path", { d: "M2 14h2" }],
      ["path", { d: "M20 14h2" }],
      ["path", { d: "M15 13v2" }],
      ["path", { d: "M9 13v2" }],
    ],
    options,
  );

/** Lucide `book-open` (ISC). */
const BookOpenIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 5v16" }],
      [
        "path",
        {
          d: "M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z",
        },
      ],
    ],
    options,
  );

/** Lucide `arrow-up` (ISC). */
const ArrowUpIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m5 12 7-7 7 7" }],
      ["path", { d: "M12 19V5" }],
    ],
    options,
  );

/** Lucide `square` (ISC). */
const SquareIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(h, [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }]], options);

// ---------------------------------------------------------------------------
// PromptInput
// ---------------------------------------------------------------------------

export const PromptInputProps = Schema.Struct({
  status: Schema.Literals(["ready", "submitted", "streaming", "error"]),
  defaultValue: Schema.optional(Schema.String),
  class: Schema.optional(Schema.String),
});
export type PromptInputProps = typeof PromptInputProps.Type;

/** Upstream's `ChatStatus` from the `ai` package, as a local string union. */
export type ChatStatus = PromptInputProps["status"];

/** What `PromptInput` emits up: upstream's `onSubmit` callback, as an event. */
export const PromptInputEvents = UiSchema.TaggedEnum({
  /** The form was submitted with a non-empty trimmed value; `value` is the raw textarea value. */
  Submitted: { value: Schema.String },
});
export type PromptInputEvents = typeof PromptInputEvents.Type;

export const PromptInputMessage = UiSchema.TaggedEnum({
  /** The textarea was edited (upstream's `onChange` → `setValue`). */
  UpdatedValue: { value: Schema.String },
  /** The form was submitted with a non-empty trimmed value; re-emitted as the `Submitted` event. */
  Submitted: { value: Schema.String },
  /** The attach Menu asked to open. */
  MenuOpened: {},
  /** The attach Menu asked to close. */
  MenuClosed: {},
  /** The "More" submenu asked to open. */
  SubMenuOpened: {},
  /** The "More" submenu asked to close. */
  SubMenuClosed: {},
  /** A menu item was picked; upstream wires no action, the menus close. */
  Picked: { value: Schema.String },
});

const MENU_ITEMS = [
  { value: "add-photos-and-files", label: "Add Photos and Files" },
  { value: "take-a-screenshot", label: "Take a Screenshot" },
  { value: "create-image", label: "Create Image" },
  { value: "deep-research", label: "Deep Research" },
  { value: "web-search", label: "Web Search" },
  { value: "more", label: "More" },
];

const SUB_MENU_ITEMS = [
  { value: "agent-mode", label: "Agent Mode" },
  { value: "add-sources", label: "Add Sources" },
  { value: "create-tasks", label: "Create Tasks" },
];

export const PromptInput = Html.component({
  name: "PromptInput",
  props: PromptInputProps,
  model: Schema.Struct({
    value: Schema.String,
    menuOpen: Schema.Boolean,
    subMenuOpen: Schema.Boolean,
  }),
  message: PromptInputMessage,
  events: PromptInputEvents,
}).make({
  init: ({ props }) => ({
    value: props.defaultValue ?? "",
    menuOpen: false,
    subMenuOpen: false,
  }),
  update: {
    UpdatedValue: ($, { value }) => $.evolve({ value }),
    // Re-emitted as the `Submitted` event; the consumer's card owns the effect.
    Submitted: ($, { value }) => $.emit(PromptInputEvents.Submitted({ value })),
    MenuOpened: ($) => $.evolve({ menuOpen: true }),
    MenuClosed: ($) => $.evolve({ menuOpen: false, subMenuOpen: false }),
    SubMenuOpened: ($) => $.evolve({ subMenuOpen: true }),
    SubMenuClosed: ($) => $.evolve({ subMenuOpen: false }),
    Picked: ($) => $.evolve({ menuOpen: false, subMenuOpen: false }),
  },
  view: (h, model) => {
    const status = h.props.status;
    const isBusy = status === "submitted" || status === "streaming";
    const showStopButton = status === "streaming";
    const showSendButton = status !== "streaming";
    return h.form
      .class(cn("w-full", h.props.class))
      .attr("id", "chat-form")
      .on(
        "submit",
        () =>
          model.value.trim() === ""
            ? undefined
            : PromptInputMessage.Submitted({ value: model.value }),
        { preventDefault: true },
      )
      .children(
        FieldGroup(h, { class: "gap-1" }).children(
          InputGroup(h).children(
            h.textarea
              .attr("data-slot", "input-group-control")
              .class(
                cn(
                  TEXTAREA_CLASS,
                  INPUT_GROUP_TEXTAREA_CLASS,
                  "h-10 min-h-10 overflow-y-auto transition-all",
                ),
              )
              .value(model.value)
              .on("input", ({ value }) => PromptInputMessage.UpdatedValue({ value }))
              .attr("placeholder", "Ask me anything..."),
            InputGroupAddon(h, { align: "block-end", class: "p-2" }).children(
              DropdownMenu(h, {
                props: { open: model.menuOpen, items: MENU_ITEMS, sideOffset: 4 },
                onEmit: {
                  RequestedOpen: () => PromptInputMessage.MenuOpened(),
                  RequestedClose: () => PromptInputMessage.MenuClosed(),
                  Picked: ({ value }) => PromptInputMessage.Picked({ value }),
                  Highlighted: () => undefined,
                  RequestedQuery: () => undefined,
                  Settled: () => undefined,
                },
                view: (menu) =>
                  h.div(
                    DropdownMenuTrigger(menu, h, {
                      element: InputGroupButton(h, { variant: "ghost", size: "icon-sm" }),
                    }).children(PlusIcon(h), h.span.class("sr-only").children("Add")),
                    DropdownMenuContent(menu, h, { class: "w-fit" }).children(
                      DropdownMenuGroup(menu, h, { group: "attach" }, [
                        DropdownMenuItem(menu, h, {
                          value: "add-photos-and-files",
                        }).children(PaperclipIcon(h), "Add Photos and Files"),
                        DropdownMenuItem(menu, h, {
                          value: "take-a-screenshot",
                        }).children(MonitorIcon(h), "Take a Screenshot"),
                      ]),
                      DropdownMenuSeparator(menu, h),
                      DropdownMenuGroup(menu, h, { group: "create" }, [
                        DropdownMenuItem(menu, h, { value: "create-image" }).children(
                          ImageIcon(h),
                          "Create Image",
                        ),
                        DropdownMenuItem(menu, h, { value: "deep-research" }).children(
                          BrainIcon(h),
                          "Deep Research",
                        ),
                        DropdownMenuItem(menu, h, { value: "web-search" }).children(
                          GlobeIcon(h),
                          "Web Search",
                        ),
                      ]),
                      DropdownMenuSeparator(menu, h),
                      DropdownMenuGroup(
                        menu,
                        h,
                        { group: "more" },
                        DropdownMenuSub(h, {
                          props: {
                            open: model.subMenuOpen,
                            items: SUB_MENU_ITEMS,
                            parentItem: "more",
                          },
                          onEmit: {
                            RequestedOpen: () => PromptInputMessage.SubMenuOpened(),
                            RequestedClose: () => PromptInputMessage.SubMenuClosed(),
                            Picked: ({ value }) => PromptInputMessage.Picked({ value }),
                            Highlighted: () => undefined,
                            RequestedQuery: () => undefined,
                            Settled: () => undefined,
                          },
                          view: (sub) =>
                            h.div(
                              DropdownMenuSubTrigger(menu, sub, h, { value: "more" }, [
                                EllipsisIcon(h),
                                h.text("More"),
                              ]),
                              DropdownMenuSubContent(sub, h, {}, [
                                DropdownMenuItem(sub, h, { value: "agent-mode" }).children(
                                  BotIcon(h),
                                  "Agent Mode",
                                ),
                                DropdownMenuItem(sub, h, { value: "add-sources" }).children(
                                  BookOpenIcon(h),
                                  "Add Sources",
                                ),
                                DropdownMenuItem(sub, h, { value: "create-tasks" }).children(
                                  CheckIcon(h),
                                  "Create Tasks",
                                ),
                              ]),
                            ),
                        }),
                      ),
                    ),
                  ),
              }),
              InputGroupButton(h, {
                variant: "default",
                size: "icon-sm",
                type: "submit",
                props: { disabled: isBusy || model.value.trim() === "" },
                class: "ml-auto data-[visible=false]:hidden",
              })
                .attr("data-visible", String(showSendButton))
                .children(ArrowUpIcon(h), h.span.class("sr-only").children("Send")),
              InputGroupButton(h, {
                size: "icon-sm",
                variant: "default",
                type: "button",
                class: "ml-auto data-[visible=false]:hidden",
              })
                .attr("data-visible", String(showStopButton))
                .children(
                  SquareIcon(h, { class: "fill-foreground" }),
                  h.span.class("sr-only").children("Stop"),
                ),
            ),
          ),
        ),
      );
  },
});
