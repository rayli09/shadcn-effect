/**
 * CodespacesCard — shadcn/ui block `preview`
 * (registry/bases/radix/blocks/preview/cards/codespaces-card.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a React function rendering a Card with a Tabs pair. The
 * "Codespaces" tab holds an Item header (a Tooltip-wrapped plus
 * button and a DropdownMenu of codespace actions), an Empty state
 * whose "Create Codespace" button flips a `useState` flag for two
 * seconds (spinner + disabled) via `setTimeout`, and a paid-by note.
 * The "Local" tab holds a hidden clone Item and a nested
 * HTTPS/SSH/GitHub CLI Tabs trio, each a read-only InputGroup URL
 * field with a copy button, then GitHub Desktop / Download ZIP ghost
 * buttons. Here: a Component — the tab selections, the menu and
 * tooltip open states, the three URL values (D-7: the kit Input is
 * controlled) and the creating flag live in the Model; upstream's
 * `setTimeout(…, 2000)` is the `FinishCreate` Command, which sleeps
 * two seconds and sends `CreateFinished`, mirroring upstream's timing
 * exactly.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `<IconPlaceholder lucide="…" … />`s are a create-app
 *   component that swaps icon libraries; only the lucide renderings
 *   are ported — Plus, Container, Zap, Server, Share, Terminal, Copy,
 *   Monitor and Download via the file-local builders below (glyph
 *   data verbatim from lucide's SVGs), MoreHorizontal via the shared
 *   EllipsisIcon and Info via the shared InfoIcon, each carrying the
 *   class / `data-icon` the JSX gives its placeholder. The other
 *   libraries are create-tool switching chrome, not ported.
 * - Tooltip triggers are the kit Tooltip's `trigger` part stacked on
 *   a `buttonVariants`-styled button (the D-2 composition this repo
 *   uses for part triggers), carrying the Button's `data-variant` /
 *   `data-size` stamps; the DropdownMenu trigger stacks the menu's
 *   trigger part on the Button port itself, as the menu port's own
 *   examples do.
 * - The menu items, the copy buttons and the Desktop / ZIP buttons
 *   are upstream's placeholders (no handlers); menu picks arrive as
 *   the kit's `Picked` event and are deliberate no-ops, and the
 *   buttons send the no-op `PressedCopy` / `PressedDesktop` /
 *   `PressedDownloadZip` Messages.
 * - Label/control pairing in the clone fields is the kit Field's
 *   generated-id wiring with the upstream ids passed as the Field
 *   `id` prop; the read-only inputs also stamp upstream's `id` and a
 *   `readonly` attribute on the rendered input.
 */
import * as Command from "@effect/ui/Command";
import { UiSchema } from "@effect/ui";
import type * as View from "@effect/ui/View";
import { Html } from "@effect/ui/html";
import { Effect, Schema } from "effect";
import { Button, buttonVariants } from "@/components/ui/button.ts";
import { Card, CardContent } from "@/components/ui/card.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.ts";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.ts";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field.ts";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group.ts";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item.ts";
import { Separator } from "@/components/ui/separator.ts";
import { Spinner } from "@/components/ui/spinner.ts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.ts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.ts";
import { EllipsisIcon, icon, InfoIcon, type IconOptions } from "@/lib/icons";

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

/** Lucide `container` (ISC). */
const ContainerIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z",
        },
      ],
      ["path", { d: "M10 21.9V14L2.1 9.1" }],
      ["path", { d: "m10 14 11.9-6.9" }],
      ["path", { d: "M14 19.8v-8.1" }],
      ["path", { d: "M18 17.5V9.4" }],
    ],
    options,
  );

/** Lucide `zap` (ISC). */
const ZapIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z",
        },
      ],
    ],
    options,
  );

/** Lucide `server` (ISC). */
const ServerIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "20", height: "8", x: "2", y: "2", rx: "2", ry: "2" }],
      ["rect", { width: "20", height: "8", x: "2", y: "14", rx: "2", ry: "2" }],
      ["line", { x1: "6", x2: "6.01", y1: "6", y2: "6" }],
      ["line", { x1: "6", x2: "6.01", y1: "18", y2: "18" }],
    ],
    options,
  );

/** Lucide `share` (ISC). */
const ShareIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 2v13" }],
      ["path", { d: "m16 6-4-4-4 4" }],
      ["path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }],
    ],
    options,
  );

/** Lucide `terminal` (ISC). */
const TerminalIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 19h8" }],
      ["path", { d: "m4 17 6-6-6-6" }],
    ],
    options,
  );

/** Lucide `copy` (ISC). */
const CopyIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }],
      ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }],
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

/** Lucide `download` (ISC). */
const DownloadIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 15V3" }],
      ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }],
      ["path", { d: "m7 10 5 5 5-5" }],
    ],
    options,
  );

export const CodespacesCardMessage = UiSchema.TaggedEnum({
  SelectedTab: { value: Schema.String },
  SelectedCloneTab: { value: Schema.String },
  MenuOpened: {},
  MenuClosed: {},
  PlusTooltipOpened: {},
  PlusTooltipClosed: {},
  InfoTooltipOpened: {},
  InfoTooltipClosed: {},
  PressedCreate: {},
  CreateFinished: {},
  PressedCopy: {},
  PressedDesktop: {},
  PressedDownloadZip: {},
});
type CodespacesCardMessage = typeof CodespacesCardMessage.Type;

/** Upstream's `setTimeout(() => setIsCreatingCodespace(false), 2000)`, as a Command. */
const FinishCreate = Command.make("PreviewCodespacesCard/FinishCreate", { args: {} }, () =>
  Effect.map(
    Effect.sleep("2 seconds"),
    () => CodespacesCardMessage.CreateFinished() as CodespacesCardMessage,
  ),
);

const menuItems = [
  { value: "new-with-options", label: "New with options..." },
  { value: "configure-container", label: "Configure container" },
  { value: "set-up-prebuilds", label: "Set up prebuilds" },
  { value: "manage-codespaces", label: "Manage codespaces" },
  { value: "share-deep-link", label: "Share deep link" },
  { value: "what-are-codespaces", label: "What are codespaces?" },
];

export const CodespacesCard = Html.component({
  name: "PreviewCodespacesCard",
  model: Schema.Struct({
    creating: Schema.Boolean,
    tab: Schema.String,
    cloneTab: Schema.String,
    menuOpen: Schema.Boolean,
    plusTooltipOpen: Schema.Boolean,
    infoTooltipOpen: Schema.Boolean,
    httpsUrl: Schema.String,
    sshUrl: Schema.String,
    cliCommand: Schema.String,
  }),
  message: CodespacesCardMessage,
}).make({
  init: () => ({
    creating: false,
    tab: "codespaces",
    cloneTab: "https",
    menuOpen: false,
    plusTooltipOpen: false,
    infoTooltipOpen: false,
    httpsUrl: "https://github.com/shadcn-ui/ui.git",
    sshUrl: "git@github.com:shadcn-ui/ui.git",
    cliCommand: "gh repo clone shadcn-ui/ui",
  }),
  update: {
    SelectedTab: ($, { value }) => $.evolve({ tab: value }),
    SelectedCloneTab: ($, { value }) => $.evolve({ cloneTab: value }),
    MenuOpened: ($) => $.evolve({ menuOpen: true }),
    MenuClosed: ($) => $.evolve({ menuOpen: false }),
    PlusTooltipOpened: ($) => $.evolve({ plusTooltipOpen: true }),
    PlusTooltipClosed: ($) => $.evolve({ plusTooltipOpen: false }),
    InfoTooltipOpened: ($) => $.evolve({ infoTooltipOpen: true }),
    InfoTooltipClosed: ($) => $.evolve({ infoTooltipOpen: false }),
    PressedCreate: ($) =>
      $.model.creating ? $.evolve({}) : $.evolve({ creating: true }).run(FinishCreate.make()),
    CreateFinished: ($) => $.evolve({ creating: false }),
    // Placeholder handlers, as upstream: no copy / open / download happens.
    PressedCopy: ($) => $.evolve({}),
    PressedDesktop: ($) => $.evolve({}),
    PressedDownloadZip: ($) => $.evolve({}),
  },
  view: (h, model) => {
    const cloneField = (
      key: string,
      id: string,
      label: string,
      value: string,
      description: ReadonlyArray<View.Input<CodespacesCardMessage, any>>,
    ) =>
      Field(h, {
        key,
        props: { id },
        class: "gap-2",
        view: (field) =>
          field.root(h.div).children(
            FieldLabel(field.label(h.label), { class: "sr-only" }).children(label),
            InputGroup(h).children(
              InputGroupAddon(h, { align: "inline-end" }).children(
                InputGroupButton(h, {
                  variant: "ghost",
                  size: "icon-xs",
                  onPress: CodespacesCardMessage.PressedCopy(),
                }).children(CopyIcon(h)),
              ),
              InputGroupInput(h, { props: { value } }).attr("id", id).attr("readonly", ""),
            ),
            FieldDescription(field.description(h.p)).children(...description),
          ),
      });

    return Card(h).children(
      CardContent(h).children(
        Tabs(h, {
          props: {
            value: model.tab,
            tabs: [{ value: "codespaces" }, { value: "local" }],
          },
          onSelected: ({ value }) => CodespacesCardMessage.SelectedTab({ value }),
          view: (tabs) =>
            tabs.root(h.div).children(
              TabsList(tabs, h.div, { class: "w-full" }).children(
                TabsTrigger(tabs, { element: h.button, value: "codespaces" }).children(
                  "Codespaces",
                ),
                TabsTrigger(tabs, { element: h.button, value: "local" }).children("Local"),
              ),
              TabsContent(tabs, { element: h.div, value: "codespaces" })?.children(
                Item(h, { size: "sm", class: "px-1 pt-2" }).children(
                  ItemContent(h).children(
                    ItemTitle(h).children("Codespaces"),
                    ItemDescription(h).children("Your workspaces in the cloud"),
                  ),
                  ItemActions(h).children(
                    Tooltip(h, {
                      props: { open: model.plusTooltipOpen },
                      onEmit: {
                        RequestedOpen: () => CodespacesCardMessage.PlusTooltipOpened(),
                        RequestedClose: () => CodespacesCardMessage.PlusTooltipClosed(),
                      },
                      view: (tooltip) =>
                        h.div(
                          TooltipTrigger(
                            tooltip
                              .trigger(
                                h.button.class(
                                  buttonVariants({ variant: "ghost", size: "icon-sm" }),
                                ),
                              )
                              .attr("data-variant", "ghost")
                              .attr("data-size", "icon-sm"),
                          ).children(PlusIcon(h)),
                          tooltip
                            .positioner(h.div)
                            .children(
                              TooltipContent(tooltip.popup(h.div), {}).children(
                                "Create a codespace on main",
                              ),
                            ),
                        ),
                    }),
                    DropdownMenu(h, {
                      props: {
                        open: model.menuOpen,
                        items: menuItems,
                        align: "end",
                        sideOffset: 4,
                      },
                      onEmit: {
                        RequestedOpen: () => CodespacesCardMessage.MenuOpened(),
                        RequestedClose: () => CodespacesCardMessage.MenuClosed(),
                        Picked: () => CodespacesCardMessage.MenuClosed(),
                        Highlighted: () => undefined,
                        RequestedQuery: () => undefined,
                        Settled: () => undefined,
                      },
                      view: (menu) =>
                        h.div(
                          DropdownMenuTrigger(menu, h, {
                            element: Button(h, { variant: "ghost", size: "icon-sm" }),
                          }).children(EllipsisIcon(h)),
                          DropdownMenuContent(menu, h, { class: "w-56" }).children(
                            DropdownMenuGroup(menu, h, { group: "create" }, [
                              DropdownMenuItem(menu, h, { value: "new-with-options" }).children(
                                PlusIcon(h),
                                "New with options...",
                              ),
                              DropdownMenuItem(menu, h, { value: "configure-container" }).children(
                                ContainerIcon(h),
                                "Configure container",
                              ),
                              DropdownMenuItem(menu, h, { value: "set-up-prebuilds" }).children(
                                ZapIcon(h),
                                "Set up prebuilds",
                              ),
                            ]),
                            DropdownMenuSeparator(menu, h),
                            DropdownMenuGroup(menu, h, { group: "manage" }, [
                              DropdownMenuItem(menu, h, { value: "manage-codespaces" }).children(
                                ServerIcon(h),
                                "Manage codespaces",
                              ),
                              DropdownMenuItem(menu, h, { value: "share-deep-link" }).children(
                                ShareIcon(h),
                                "Share deep link",
                              ),
                              DropdownMenuItem(menu, h, { value: "what-are-codespaces" }).children(
                                InfoIcon(h),
                                "What are codespaces?",
                              ),
                            ]),
                          ),
                        ),
                    }),
                  ),
                ),
                Separator(h, { class: "-mx-2 my-2 w-auto!" }),
                Empty(h, { class: "p-4" }).children(
                  EmptyHeader(h).children(
                    EmptyMedia(h, { variant: "icon" }).children(ServerIcon(h)),
                    EmptyTitle(h).children("No codespaces"),
                    EmptyDescription(h).children(
                      "You don't have any codespaces with this repository checked out",
                    ),
                  ),
                  EmptyContent(h).children(
                    Button(h, {
                      size: "sm",
                      props: { disabled: model.creating },
                      onPress: CodespacesCardMessage.PressedCreate(),
                    }).children(
                      model.creating ? Spinner(h).attr("data-icon", "inline-start") : undefined,
                      "Create Codespace",
                    ),
                    h.a
                      .attr("href", "#learn-more")
                      .class("text-xs text-muted-foreground underline underline-offset-4")
                      .children("Learn more about codespaces"),
                  ),
                ),
                Separator(h, { class: "-mx-2 my-2 w-auto!" }),
                h.div
                  .class("p-1.5 text-xs text-muted-foreground")
                  .children(
                    "Codespace usage for this repository is paid for by ",
                    h.span.class("font-medium").children("shadcn"),
                    ".",
                  ),
              ),
              TabsContent(tabs, { element: h.div, value: "local" })?.children(
                Item(h, { size: "sm", class: "hidden p-0" }).children(
                  ItemContent(h).children(
                    ItemTitle(h, { class: "gap-2" }).children(
                      TerminalIcon(h, { class: "size-4" }),
                      "Clone",
                    ),
                  ),
                  ItemActions(h).children(
                    Tooltip(h, {
                      props: { open: model.infoTooltipOpen, side: "left" },
                      onEmit: {
                        RequestedOpen: () => CodespacesCardMessage.InfoTooltipOpened(),
                        RequestedClose: () => CodespacesCardMessage.InfoTooltipClosed(),
                      },
                      view: (tooltip) =>
                        h.div(
                          TooltipTrigger(
                            tooltip
                              .trigger(
                                h.button.class(buttonVariants({ variant: "ghost", size: "icon" })),
                              )
                              .attr("data-variant", "ghost")
                              .attr("data-size", "icon"),
                          ).children(InfoIcon(h)),
                          tooltip
                            .positioner(h.div)
                            .children(
                              TooltipContent(tooltip.popup(h.div), {}).children(
                                "Which remote URL should I use?",
                              ),
                            ),
                        ),
                    }),
                  ),
                ),
                Tabs(h, {
                  props: {
                    value: model.cloneTab,
                    tabs: [{ value: "https" }, { value: "ssh" }, { value: "cli" }],
                  },
                  onSelected: ({ value }) => CodespacesCardMessage.SelectedCloneTab({ value }),
                  view: (cloneTabs) =>
                    cloneTabs.root(h.div).children(
                      TabsList(cloneTabs, h.div, {
                        variant: "line",
                        class: "w-full justify-start border-b *:[button]:flex-0",
                      }).children(
                        TabsTrigger(cloneTabs, { element: h.button, value: "https" }).children(
                          "HTTPS",
                        ),
                        TabsTrigger(cloneTabs, { element: h.button, value: "ssh" }).children("SSH"),
                        TabsTrigger(cloneTabs, { element: h.button, value: "cli" }).children(
                          "GitHub CLI",
                        ),
                      ),
                      h.div
                        .class("rounded-md border bg-muted/30 p-2")
                        .children(
                          TabsContent(cloneTabs, { element: h.div, value: "https" })?.children(
                            cloneField("https", "https-url", "HTTPS URL", model.httpsUrl, [
                              "Clone using the web URL.",
                            ]),
                          ),
                          TabsContent(cloneTabs, { element: h.div, value: "ssh" })?.children(
                            cloneField("ssh", "ssh-url", "SSH URL", model.sshUrl, [
                              "Use a password-protected SSH key.",
                            ]),
                          ),
                          TabsContent(cloneTabs, { element: h.div, value: "cli" })?.children(
                            cloneField("cli", "cli-command", "CLI Command", model.cliCommand, [
                              "Work fast with our official CLI. ",
                              h.a.attr("href", "#learn-more").children("Learn more"),
                            ]),
                          ),
                        ),
                    ),
                }),
                Separator(h, { class: "-mx-2 my-2 w-auto!" }),
                h.div.class("flex flex-col").children(
                  Button(h, {
                    variant: "ghost",
                    size: "sm",
                    class: "justify-start gap-1.5",
                    onPress: CodespacesCardMessage.PressedDesktop(),
                  }).children(
                    MonitorIcon(h).attr("data-icon", "inline-start"),
                    "Open with GitHub Desktop",
                  ),
                  Button(h, {
                    variant: "ghost",
                    size: "sm",
                    class: "justify-start gap-1.5",
                    onPress: CodespacesCardMessage.PressedDownloadZip(),
                  }).children(DownloadIcon(h).attr("data-icon", "inline-start"), "Download ZIP"),
                ),
              ),
            ),
        }),
      ),
    );
  },
});
