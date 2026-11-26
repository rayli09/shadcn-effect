/**
 * Command — shadcn/ui `command` ported 1:1 to Effect UI.
 *
 * Upstream: React + cmdk (a React-only command-menu engine — BANNED here).
 * There is no cmdk in Effect UI, so this is a declared composition, not a
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
 * Class strings are byte-for-byte the shadcn new-york-v4 strings.
 *
 * Declared divergences (in-file, on top of docs/PORTING-RULES.md):
 * - cmdk's `data-[selected=true]` on items never fires against the kit,
 *   which marks the highlighted item with `data-highlighted`; the
 *   upstream string stays verbatim AND the two highlighted variants are
 *   appended (marked below) so the highlight actually paints.
 * - The `[&_[cmdk-group-heading]]` selectors in the upstream group and
 *   dialog strings are inert (there is no cmdk DOM); the heading styling
 *   they carried is applied directly to the kit's `groupLabel` part via
 *   COMMAND_GROUP_HEADING_CLASS, taken from those same strings.
 * - Upstream's sub-components (CommandInput, CommandList, CommandGroup,
 *   CommandItem, CommandEmpty, CommandSeparator, CommandShortcut)
 *   collapse into this composition + the exported `COMMAND_*_CLASS`
 *   constants; items may carry a `shortcut`, drawn with
 *   COMMAND_SHORTCUT_CLASS inside the item.
 * - CommandDialog's backdrop and close button belong to the `dialog`
 *   registry item upstream; here they are drawn on the kit Dialog parts
 *   with the standard shadcn dialog backdrop class and plain positioning
 *   for the close button, until the dialog port lands.
 * - The Search icon is an inline SVG builder from lucide path data
 *   (ISC), not lucide-react.
 */
import {
  Autocomplete as KitAutocomplete,
  type AutocompleteEvents,
  type AutocompleteItem,
  type AutocompleteProps as KitAutocompleteProps,
  Dialog as KitDialog,
  type DialogEvents,
  type DialogProps as KitDialogProps
} from "@effect/ui-kit"
import type * as Html from "@effect/ui/html/Html"
import type * as View from "@effect/ui/View"
import { cn } from "../lib/utils.ts"

// ---------------------------------------------------------------------------
// Icons — inline lucide path data (ISC), drawn with h.el, as in Effect UI's
// own launch example. Local to this file until registry/lib/icons.ts lands.
// ---------------------------------------------------------------------------

type IconNode = readonly [
  tag: string,
  attrs: Readonly<Record<string, string>>
]

const icon = <Msg>(
  h: Html.H<Msg>,
  nodes: ReadonlyArray<IconNode>,
  cls: string
) =>
  h.el("svg").attrs({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
    class: cls
  }).children(
    nodes.map(([tag, attrs], index) =>
      h.el(tag).key(String(index)).attrs(attrs)
    )
  )

const SearchIcon = <Msg>(h: Html.H<Msg>, cls: string) =>
  icon(
    h,
    [
      ["circle", { cx: "11", cy: "11", r: "8" }],
      ["path", { d: "m21 21-4.3-4.3" }]
    ],
    cls
  )

const XIcon = <Msg>(h: Html.H<Msg>, cls: string) =>
  icon(
    h,
    [
      ["path", { d: "M18 6 6 18" }],
      ["path", { d: "m6 6 12 12" }]
    ],
    cls
  )

// ---------------------------------------------------------------------------
// Class strings — verbatim from shadcn new-york-v4 command.tsx
// ---------------------------------------------------------------------------

export const COMMAND_CLASS =
  "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground"

export const COMMAND_DIALOG_CLASS =
  "**:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"

export const COMMAND_INPUT_WRAPPER_CLASS =
  "flex h-9 items-center gap-2 border-b px-3"

export const COMMAND_INPUT_ICON_CLASS = "size-4 shrink-0 opacity-50"

export const COMMAND_INPUT_CLASS =
  "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"

export const COMMAND_LIST_CLASS =
  "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto"

export const COMMAND_EMPTY_CLASS = "py-6 text-center text-sm"

export const COMMAND_GROUP_CLASS =
  "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"

/** The group-heading styling from COMMAND_GROUP_CLASS's cmdk selector,
 * applied directly to the kit's groupLabel part (see header). */
export const COMMAND_GROUP_HEADING_CLASS =
  "px-2 py-1.5 text-xs font-medium text-muted-foreground"

export const COMMAND_SEPARATOR_CLASS = "-mx-1 h-px bg-border"

export const COMMAND_ITEM_CLASS =
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground"

/** Kit adaptation appended to COMMAND_ITEM_CLASS: the kit marks the
 * highlighted item with `data-highlighted`, not cmdk's data-selected. */
export const COMMAND_ITEM_HIGHLIGHT_CLASS =
  "data-highlighted:bg-accent data-highlighted:text-accent-foreground"

export const COMMAND_SHORTCUT_CLASS =
  "ml-auto text-xs tracking-widest text-muted-foreground"

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

/** A kit Autocomplete item, plus an optional keyboard shortcut hint. */
export type CommandItem = AutocompleteItem & {
  readonly shortcut?: string | undefined
}

export interface CommandOptions<Msg> {
  readonly items: ReadonlyArray<CommandItem>
  /** The query text, from the consumer's Model. */
  readonly query: string
  readonly onQueryChange: (value: string) => Msg | undefined
  /** Receives the picked item's label (see header). */
  readonly onPick?: ((label: string) => Msg | undefined) | undefined
  readonly placeholder?: string | undefined
  /** Text drawn by the empty part, upstream CommandEmpty's children. */
  readonly emptyText?: string | undefined
  /** Group key → heading, drawn with the groupLabel part styling. */
  readonly groupLabels?: Readonly<Record<string, string>> | undefined
  readonly class?: string | undefined
  readonly listClass?: string | undefined
  readonly inputClass?: string | undefined
}

const commandAutocomplete = <Msg>(
  h: Html.H<Msg>,
  options: CommandOptions<Msg>,
  dialog: boolean
) =>
  KitAutocomplete(h, {
    props: {
      open: false,
      value: options.query,
      items: options.items.map(({ value, label, disabled, group, row }) => ({
        value,
        label,
        disabled,
        group,
        row
      })),
      inline: true,
      mode: "list",
      autoHighlight: true
    } satisfies KitAutocompleteProps,
    onEmit: {
      RequestedOpen: () => undefined,
      RequestedClose: () => undefined,
      Updated: ({ value, reason }) =>
        reason === "item-press" && options.onPick !== undefined
          ? options.onPick(value)
          : options.onQueryChange(value),
      Highlighted: () => undefined,
      Settled: () => undefined
    } satisfies View.Child.EmitHandlers<AutocompleteEvents, Msg>,
    view: (autocomplete) => {
      const byValue = new Map(
        options.items.map((item) => [item.value, item])
      )
      const drawItem = (entry: AutocompleteItem) => {
        const shortcut = byValue.get(entry.value)?.shortcut
        return autocomplete.item({ element: h.div, value: entry.value })
          .attr("data-slot", "command-item")
          .class(
            cn(COMMAND_ITEM_CLASS, COMMAND_ITEM_HIGHLIGHT_CLASS)
          )
          .children(
            entry.label,
            shortcut === undefined
              ? undefined
              : h.span
                .attr("data-slot", "command-shortcut")
                .class(COMMAND_SHORTCUT_CLASS)
                .children(shortcut)
          )
      }
      const drawn: Array<View.Input<Msg, any>> = []
      autocomplete.groups.forEach((group, groupIndex) => {
        if (groupIndex > 0) {
          drawn.push(
            autocomplete.separator(h.div)
              .attr("data-slot", "command-separator")
              .class(COMMAND_SEPARATOR_CLASS)
          )
        }
        const items = group.items.map(drawItem)
        if (group.key === undefined) {
          drawn.push(...items)
        } else {
          drawn.push(
            autocomplete.group({ element: h.div, group: group.key })
              .attr("data-slot", "command-group")
              .class(COMMAND_GROUP_CLASS)
              .children(
                autocomplete.groupLabel({
                  element: h.div,
                  group: group.key
                })
                  .class(COMMAND_GROUP_HEADING_CLASS)
                  .children(
                    options.groupLabels?.[group.key] ?? group.key
                  ),
                ...items
              )
          )
        }
      })

      return h.div
        .attr("data-slot", "command")
        .class(
          cn(
            COMMAND_CLASS,
            dialog && COMMAND_DIALOG_CLASS,
            options.class
          )
        )
        .children(
          h.div
            .attr("data-slot", "command-input-wrapper")
            .class(COMMAND_INPUT_WRAPPER_CLASS)
            .children(
              SearchIcon(h, COMMAND_INPUT_ICON_CLASS),
              autocomplete.input(h.input)
                .attr("data-slot", "command-input")
                .attr(
                  "placeholder",
                  options.placeholder ?? "Type a command or search..."
                )
                .class(cn(COMMAND_INPUT_CLASS, options.inputClass))
            ),
          autocomplete.list(h.div)
            .attr("data-slot", "command-list")
            .class(cn(COMMAND_LIST_CLASS, options.listClass))
            .children(
              autocomplete.empty(h.div)
                .attr("data-slot", "command-empty")
                .class(COMMAND_EMPTY_CLASS)
                .children(options.emptyText ?? "No results found."),
              ...drawn
            )
        )
    }
  })

export const Command = <Msg, R = never>(
  h: Html.H<Msg>,
  options: CommandOptions<Msg>
) => commandAutocomplete(h, options, false)

// ---------------------------------------------------------------------------
// CommandDialog — the composition inside the kit Dialog
// ---------------------------------------------------------------------------

export const CommandDialog = <Msg, R = never>(
  h: Html.H<Msg>,
  options: CommandOptions<Msg> & {
    readonly open: boolean
    readonly onEmit: View.Child.Options<
      KitDialogProps,
      DialogEvents,
      Msg
    >["onEmit"]
    /** Upstream defaults: "Command Palette". */
    readonly title?: string | undefined
    /** Upstream default: "Search for a command to run...". */
    readonly description?: string | undefined
    /** Upstream default true. */
    readonly showCloseButton?: boolean | undefined
    readonly dialogClass?: string | undefined
  }
) =>
  KitDialog(h, {
    props: { open: options.open },
    onEmit: options.onEmit,
    view: (dialog) =>
      h.div(
        dialog.portal(h.dialog)?.children(
          dialog.backdrop(
            h.div.class("fixed inset-0 z-50 bg-black/50")
          ),
          dialog.viewport(h.div).children(
          dialog.popup(h.div)
            .attr("data-slot", "dialog-content")
            .class(cn("overflow-hidden p-0", options.dialogClass))
            .children(
              h.div.class("sr-only").children(
                dialog.title(h.h2).children(
                  options.title ?? "Command Palette"
                ),
                dialog.description(h.p).children(
                  options.description ??
                    "Search for a command to run..."
                )
              ),
              commandAutocomplete(h, options, true),
              (options.showCloseButton ?? true)
                ? dialog.close(h.button)
                  .attr("data-slot", "dialog-close")
                  .class("absolute top-4 right-4")
                  .children(XIcon(h, "size-4"))
                : undefined
            )
          )
        )
      )
  })
