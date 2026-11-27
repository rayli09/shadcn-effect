/**
 * Command — shadcn/ui `command`, bases generation, ported 1:1 to
 * Effect UI.
 *
 * Generation: `bases/radix` (the `cn-*` hook generation). Upstream:
 * React + cmdk (a React-only command-menu engine — BANNED here). There
 * is no cmdk in Effect UI, so this is a declared composition, not a
 * wrapper:
 *
 *   Command       = @effect/ui-kit `Autocomplete` with `inline: true` and
 *                   `mode: "list"` — the kit's own docs name exactly this
 *                   shape "a command palette": the list is drawn without a
 *                   popup, always expanded, filtering / highlight /
 *                   keyboard navigation are the kit's, and picking an item
 *                   arrives as an `Updated` event with reason
 *                   "item-press". (Kit Combobox shares the same engine;
 *                   Autocomplete is the right base because a command
 *                   palette selects nothing — the text is the value.)
 *   CommandDialog = the same composition inside @effect/ui-kit `Dialog`,
 *                   with the upstream sr-only title/description header.
 *
 * The consumer owns the query text in their Model: `onQueryChange` stores
 * it, `onPick` receives the picked item's label (Autocomplete's pick
 * event carries the label it put in the input; map it back through
 * `items`). Open/close for CommandDialog is the consumer's Model too,
 * via the kit Dialog's events.
 *
 * Class strings are byte-for-byte the bases/radix strings: structural
 * utilities inline, visual styling in the presets under the
 * `cn-command*` hooks. The input area follows the bases anatomy: a
 * `command-input-wrapper` div around this generation's `InputGroup`
 * (classed `cn-command-input-group`), with the search icon inside an
 * `InputGroupAddon` after the input.
 *
 * Declared divergences (in-file, on top of docs/PORTING-RULES.md):
 * - Item highlight: cmdk marks the active item `data-[selected=true]`
 *   and upstream's visual layer paints it; the kit marks the
 *   highlighted item with `data-highlighted` instead. In this
 *   generation the highlight styling lives in the preset layer
 *   (`.cn-command-item` rules), so no adapter classes are appended —
 *   presets keyed on cmdk's attribute stay inert against the kit, the
 *   same D-5 family as the new-york port.
 * - The item's check indicator (upstream draws a Check icon in every
 *   item, revealed by `group-data-[checked=true]/command-item`) is
 *   drawn verbatim; the kit Autocomplete writes no `data-checked` on
 *   its group/item parts, so the reveal variant never matches — the
 *   icon stays at `opacity-0`. Declared, not faked.
 * - Group headings: upstream cmdk renders the heading inside the group
 *   and the preset layer styles it from the `cn-command-group` hook;
 *   the kit's `groupLabel` part is drawn unclassed inside the group,
 *   where those descendant rules can reach it. (The new-york port's
 *   `COMMAND_GROUP_HEADING_CLASS` has no bases counterpart and is not
 *   carried over.)
 * - Upstream's sub-components (CommandInput, CommandList, CommandGroup,
 *   CommandItem, CommandEmpty, CommandSeparator, CommandShortcut)
 *   collapse into this composition + the exported `COMMAND_*_CLASS`
 *   constants; items may carry a `shortcut`, drawn with
 *   COMMAND_SHORTCUT_CLASS inside the item.
 * - CommandDialog's backdrop and close button belong to the `dialog`
 *   registry item upstream; here they are drawn on the kit Dialog parts
 *   with the standard shadcn dialog backdrop class and plain
 *   positioning for the close button. Bases-generation default:
 *   `showCloseButton` is FALSE (the new-york generation defaulted it
 *   true).
 * - The Search, Check and X icons are the shared `@/lib/icons` builders
 *   (inline SVG from lucide path data, ISC), not lucide-react.
 */
import {
  Autocomplete as KitAutocomplete,
  type AutocompleteEvents,
  type AutocompleteItem,
  type AutocompleteProps as KitAutocompleteProps,
  Dialog as KitDialog,
  type DialogEvents,
  type DialogProps as KitDialogProps,
} from "@effect/ui-kit";
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
import { CheckIcon, SearchIcon, XIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { InputGroup, InputGroupAddon } from "./input-group.ts";

// ---------------------------------------------------------------------------
// Class strings — verbatim from shadcn bases/radix command.tsx
// ---------------------------------------------------------------------------

export const COMMAND_CLASS = "cn-command flex size-full flex-col overflow-hidden";

/** Upstream CommandDialog's classes on the DialogContent (the `dialog` item's popup). */
export const COMMAND_DIALOG_CLASS = "cn-command-dialog top-1/3 translate-y-0 overflow-hidden p-0";

export const COMMAND_INPUT_WRAPPER_CLASS = "cn-command-input-wrapper";

export const COMMAND_INPUT_GROUP_CLASS = "cn-command-input-group";

export const COMMAND_INPUT_ICON_CLASS = "cn-command-input-icon";

export const COMMAND_INPUT_CLASS =
  "cn-command-input outline-hidden disabled:cursor-not-allowed disabled:opacity-50";

export const COMMAND_LIST_CLASS = "cn-command-list overflow-x-hidden overflow-y-auto";

export const COMMAND_EMPTY_CLASS = "cn-command-empty";

export const COMMAND_GROUP_CLASS = "cn-command-group";

export const COMMAND_SEPARATOR_CLASS = "cn-command-separator";

export const COMMAND_ITEM_CLASS =
  "cn-command-item group/command-item data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

/** Upstream's per-item check indicator, drawn inside every item (see header for its reveal gap). */
export const COMMAND_ITEM_INDICATOR_CLASS =
  "cn-command-item-indicator ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100";

export const COMMAND_SHORTCUT_CLASS = "cn-command-shortcut";

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

/** A kit Autocomplete item, plus an optional keyboard shortcut hint. */
export type CommandItem = AutocompleteItem & {
  readonly shortcut?: string | undefined;
};

export interface CommandOptions<Msg> {
  readonly items: ReadonlyArray<CommandItem>;
  /** The query text, from the consumer's Model. */
  readonly query: string;
  readonly onQueryChange: (value: string) => Msg | undefined;
  /** Receives the picked item's label (see header). */
  readonly onPick?: ((label: string) => Msg | undefined) | undefined;
  readonly placeholder?: string | undefined;
  /** Text drawn by the empty part, upstream CommandEmpty's children. */
  readonly emptyText?: string | undefined;
  /** Group key → heading, drawn with the groupLabel part. */
  readonly groupLabels?: Readonly<Record<string, string>> | undefined;
  readonly class?: string | undefined;
  readonly listClass?: string | undefined;
  readonly inputClass?: string | undefined;
}

const commandAutocomplete = <Msg>(h: Html.H<Msg>, options: CommandOptions<Msg>) =>
  KitAutocomplete(h, {
    props: {
      open: false,
      value: options.query,
      items: options.items.map(({ value, label, disabled, group, row }) => ({
        value,
        label,
        disabled,
        group,
        row,
      })),
      inline: true,
      mode: "list",
      autoHighlight: true,
    } satisfies KitAutocompleteProps,
    onEmit: {
      RequestedOpen: () => undefined,
      RequestedClose: () => undefined,
      Updated: ({ value, reason }) =>
        reason === "item-press" && options.onPick !== undefined
          ? options.onPick(value)
          : options.onQueryChange(value),
      Highlighted: () => undefined,
      Settled: () => undefined,
    } satisfies View.Child.EmitHandlers<AutocompleteEvents, Msg>,
    view: (autocomplete) => {
      const byValue = new Map(options.items.map((item) => [item.value, item]));
      const drawItem = (entry: AutocompleteItem) => {
        const shortcut = byValue.get(entry.value)?.shortcut;
        return autocomplete
          .item({ element: h.div, value: entry.value })
          .attr("data-slot", "command-item")
          .class(COMMAND_ITEM_CLASS)
          .children(
            entry.label,
            shortcut === undefined
              ? undefined
              : h.span
                  .attr("data-slot", "command-shortcut")
                  .class(COMMAND_SHORTCUT_CLASS)
                  .children(shortcut),
            CheckIcon(h, { class: COMMAND_ITEM_INDICATOR_CLASS }),
          );
      };
      const drawn: Array<View.Input<Msg, any>> = [];
      autocomplete.groups.forEach((group, groupIndex) => {
        if (groupIndex > 0) {
          drawn.push(
            autocomplete
              .separator(h.div)
              .attr("data-slot", "command-separator")
              .class(COMMAND_SEPARATOR_CLASS),
          );
        }
        const items = group.items.map(drawItem);
        if (group.key === undefined) {
          drawn.push(...items);
        } else {
          drawn.push(
            autocomplete
              .group({ element: h.div, group: group.key })
              .attr("data-slot", "command-group")
              .class(COMMAND_GROUP_CLASS)
              .children(
                autocomplete
                  .groupLabel({
                    element: h.div,
                    group: group.key,
                  })
                  .children(options.groupLabels?.[group.key] ?? group.key),
                ...items,
              ),
          );
        }
      });

      return h.div
        .attr("data-slot", "command")
        .class(cn(COMMAND_CLASS, options.class))
        .children(
          h.div
            .attr("data-slot", "command-input-wrapper")
            .class(COMMAND_INPUT_WRAPPER_CLASS)
            .children(
              InputGroup(h, { class: COMMAND_INPUT_GROUP_CLASS }).children(
                autocomplete
                  .input(h.input)
                  .attr("data-slot", "command-input")
                  .attr("placeholder", options.placeholder ?? "Type a command or search...")
                  .class(cn(COMMAND_INPUT_CLASS, options.inputClass)),
                InputGroupAddon(h).children(SearchIcon(h, { class: COMMAND_INPUT_ICON_CLASS })),
              ),
            ),
          autocomplete
            .list(h.div)
            .attr("data-slot", "command-list")
            .class(cn(COMMAND_LIST_CLASS, options.listClass))
            .children(
              autocomplete
                .empty(h.div)
                .attr("data-slot", "command-empty")
                .class(COMMAND_EMPTY_CLASS)
                .children(options.emptyText ?? "No results found."),
              ...drawn,
            ),
        );
    },
  });

export const Command = <Msg, R = never>(h: Html.H<Msg>, options: CommandOptions<Msg>) =>
  commandAutocomplete(h, options);

// ---------------------------------------------------------------------------
// CommandDialog — the composition inside the kit Dialog
// ---------------------------------------------------------------------------

export const CommandDialog = <Msg, R = never>(
  h: Html.H<Msg>,
  options: CommandOptions<Msg> & {
    readonly open: boolean;
    readonly onEmit: View.Child.Options<KitDialogProps, DialogEvents, Msg>["onEmit"];
    /** Upstream defaults: "Command Palette". */
    readonly title?: string | undefined;
    /** Upstream default: "Search for a command to run...". */
    readonly description?: string | undefined;
    /** Upstream bases default false. */
    readonly showCloseButton?: boolean | undefined;
    readonly dialogClass?: string | undefined;
  },
) =>
  KitDialog(h, {
    props: { open: options.open },
    onEmit: options.onEmit,
    view: (dialog) =>
      h.div(
        dialog.portal(h.dialog)?.children(
          dialog.backdrop(h.div.class("fixed inset-0 z-50 bg-black/50")),
          dialog.viewport(h.div).children(
            dialog
              .popup(h.div)
              .attr("data-slot", "dialog-content")
              .class(cn(COMMAND_DIALOG_CLASS, options.dialogClass))
              .children(
                h.div
                  .class("sr-only")
                  .children(
                    dialog.title(h.h2).children(options.title ?? "Command Palette"),
                    dialog
                      .description(h.p)
                      .children(options.description ?? "Search for a command to run..."),
                  ),
                commandAutocomplete(h, options),
                (options.showCloseButton ?? false)
                  ? dialog
                      .close(h.button)
                      .attr("data-slot", "dialog-close")
                      .class("absolute top-4 right-4")
                      .children(XIcon(h, { class: "size-4" }))
                  : undefined,
              ),
          ),
        ),
      ),
  });
