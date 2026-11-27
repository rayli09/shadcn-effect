/**
 * SettingsDialog (sidebar-13 block) — upstream
 * `registry/bases/radix/blocks/sidebar-13/components/settings-dialog.tsx`
 * ported to Effect UI.
 *
 * Pairs with the `base-*` ui items: the imports below say
 * `@/components/ui/<x>` because the bases items install to the same
 * paths as the new-york ones — the class layer inside them is the
 * bases `cn-*` hook layer, styled by a `style-*` preset.
 *
 * Upstream: a Radix Dialog (initially open) whose content hosts a
 * `SidebarProvider` + non-collapsible mini Sidebar of settings
 * sections next to a breadcrumb-headed content column. Here:
 *
 * - The Dialog is the kit Dialog composition from the dialog port:
 *   this Component owns `open` in its Model (upstream's
 *   `useState(true)`), the trigger is the port's `Button` stacked
 *   under the kit's trigger part (D-2), and the auto close button
 *   upstream's DialogContent renders is the composition the dialog
 *   port's header documents (ghost icon-sm Button classes +
 *   `DIALOG_CLOSE_CLASS` under the kit's close part).
 * - The mini Sidebar is NOT context-based: it is hosted by a
 *   `SidebarProvider` child inside the dialog popup's view closure,
 *   exactly where upstream places its `<SidebarProvider>`, and the
 *   sidebar pieces take the provider's parts as their first argument.
 * - The selected section is Model state (`active`, seeded with
 *   upstream's hardcoded active item "Messages & media"); upstream
 *   renders it as a constant — here the menu buttons' presses send
 *   `SelectedSection`, `isActive` is computed from the Model, and the
 *   breadcrumb page shows the active section, which is what upstream
 *   hardcodes in both places.
 *
 * Declared divergences (anything else is a bug):
 *
 * - D-2 `asChild`: upstream's `SidebarMenuButton asChild` renders an
 *   <a href="#"> around the icon + label; `SidebarMenuButton` always
 *   renders its <button>, so the link collapses onto the button and
 *   the `href="#"` is not rendered (the same collapse the sidebar
 *   port declares for its own asChild pieces).
 * - Icons: upstream's `IconPlaceholder` names a lucide glyph per nav
 *   item; here `data.nav` holds the icon *builder* reference (called
 *   at render: `item.icon(h)`). `CheckIcon` is the shared builder
 *   from `@/lib/icons`; the rest are LOCAL builders below, built with
 *   the shared `icon()` from lucide path data (ISC) copied verbatim
 *   from lucide's `bell`, `menu`, `house` (the current lucide name
 *   for upstream's `HomeIcon`), `paintbrush`, `message-circle`,
 *   `globe`, `keyboard`, `video`, `link`, `lock` and `settings`
 *   glyphs.
 */
import { UiSchema } from "@effect/ui";
import type * as Html from "@effect/ui/html/Html";
import { Html as HtmlNs } from "@effect/ui/html";
import type * as View from "@effect/ui/View";
import { Schema } from "effect";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.ts";
import { Button, buttonVariants } from "@/components/ui/button.ts";
import { DIALOG_CLOSE_CLASS, Dialog, XIcon, type DialogParts } from "@/components/ui/dialog.ts";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { CheckIcon, icon, type IconOptions } from "@/lib/icons";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Local icon builders (lucide path data, ISC — see header)
// ---------------------------------------------------------------------------

/** Lucide `bell`: upstream's `BellIcon` placeholder. */
export const BellIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0" }],
      [
        "path",
        {
          d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
        },
      ],
    ],
    options,
  );

/** Lucide `menu`: upstream's `MenuIcon` placeholder. */
export const MenuIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["line", { x1: "4", x2: "20", y1: "12", y2: "12" }],
      ["line", { x1: "4", x2: "20", y1: "6", y2: "6" }],
      ["line", { x1: "4", x2: "20", y1: "18", y2: "18" }],
    ],
    options,
  );

/** Lucide `house` (current name for upstream's `HomeIcon` placeholder). */
export const HomeIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }],
      [
        "path",
        {
          d: "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
        },
      ],
    ],
    options,
  );

/** Lucide `paintbrush`: upstream's `PaintbrushIcon` placeholder. */
export const PaintbrushIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m14.622 17.897-10.68-2.913" }],
      [
        "path",
        {
          d: "M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z",
        },
      ],
      [
        "path",
        {
          d: "M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15",
        },
      ],
    ],
    options,
  );

/** Lucide `message-circle`: upstream's `MessageCircleIcon` placeholder. */
export const MessageCircleIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(h, [["path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z" }]], options);

/** Lucide `globe`: upstream's `GlobeIcon` placeholder. */
export const GlobeIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }],
      ["path", { d: "M2 12h20" }],
    ],
    options,
  );

/** Lucide `keyboard`: upstream's `KeyboardIcon` placeholder. */
export const KeyboardIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10 8h.01" }],
      ["path", { d: "M12 12h.01" }],
      ["path", { d: "M14 8h.01" }],
      ["path", { d: "M16 12h.01" }],
      ["path", { d: "M18 8h.01" }],
      ["path", { d: "M6 8h.01" }],
      ["path", { d: "M7 16h10" }],
      ["path", { d: "M8 12h.01" }],
      ["rect", { width: "20", height: "16", x: "2", y: "4", rx: "2" }],
    ],
    options,
  );

/** Lucide `video`: upstream's `VideoIcon` placeholder. */
export const VideoIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" }],
      ["rect", { x: "2", y: "6", width: "14", height: "12", rx: "2" }],
    ],
    options,
  );

/** Lucide `link`: upstream's `LinkIcon` placeholder. */
export const LinkIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }],
      ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" }],
    ],
    options,
  );

/** Lucide `lock`: upstream's `LockIcon` placeholder. */
export const LockIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }],
      ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4" }],
    ],
    options,
  );

/** Lucide `settings`: upstream's `SettingsIcon` placeholder. */
export const SettingsIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
        },
      ],
      ["circle", { cx: "12", cy: "12", r: "3" }],
    ],
    options,
  );

// ---------------------------------------------------------------------------
// Sample data (upstream verbatim; `icon` holds a builder reference)
// ---------------------------------------------------------------------------

/** An icon builder reference (lucide glyph), called at render with the caller's `h`. */
export type SettingsNavIcon = <Msg>(h: Html.H<Msg>, options?: IconOptions) => View.Content<Msg>;

const data: {
  readonly nav: ReadonlyArray<{ readonly name: string; readonly icon: SettingsNavIcon }>;
} = {
  nav: [
    { name: "Notifications", icon: BellIcon },
    { name: "Navigation", icon: MenuIcon },
    { name: "Home", icon: HomeIcon },
    { name: "Appearance", icon: PaintbrushIcon },
    { name: "Messages & media", icon: MessageCircleIcon },
    { name: "Language & region", icon: GlobeIcon },
    { name: "Accessibility", icon: KeyboardIcon },
    { name: "Mark as read", icon: CheckIcon },
    { name: "Audio & video", icon: VideoIcon },
    { name: "Connected accounts", icon: LinkIcon },
    { name: "Privacy & visibility", icon: LockIcon },
    { name: "Advanced", icon: SettingsIcon },
  ],
};

// ---------------------------------------------------------------------------
// SettingsDialog
// ---------------------------------------------------------------------------

export const SettingsDialogMessage = UiSchema.TaggedEnum({
  RequestedOpen: {},
  RequestedClose: {},
  SelectedSection: { name: Schema.String },
});

export const SettingsDialog = HtmlNs.component({
  name: "SettingsDialog",
  model: Schema.Struct({ open: Schema.Boolean, active: Schema.String }),
  message: SettingsDialogMessage,
}).make({
  init: () => ({ open: true, active: "Messages & media" }),
  update: {
    RequestedOpen: ($) => $.evolve({ open: true }),
    RequestedClose: ($) => $.evolve({ open: false }),
    SelectedSection: ($, { name }) => $.evolve({ active: name }),
  },
  view: (h, model) =>
    Dialog(h, {
      props: { open: model.open },
      onEmit: {
        RequestedOpen: () => SettingsDialogMessage.RequestedOpen(),
        RequestedClose: () => SettingsDialogMessage.RequestedClose(),
        Settled: () => undefined,
      },
      contentClass: "overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]",
      titleClass: "sr-only",
      descriptionClass: "sr-only",
      view: (dialog: DialogParts) =>
        h.div(
          dialog.trigger(Button(h, { size: "sm" })).children("Open Dialog"),
          dialog.portal(h.dialog)?.children(
            dialog.backdrop(h.div),
            dialog.viewport(h.div).children(
              dialog.popup(h.div).children(
                dialog.title(h.h2).children("Settings"),
                dialog.description(h.p).children("Customize your settings here."),
                SidebarProvider(h, {
                  props: {},
                  view: (sidebar: SidebarProviderParts) =>
                    sidebar
                      .wrapper(h.div)
                      .class("items-start")
                      .children(
                        Sidebar(
                          sidebar,
                          h,
                          { collapsible: "none", class: "hidden md:flex" },
                          SidebarContent(h).children(
                            SidebarGroup(h).children(
                              SidebarGroupContent(h).children(
                                SidebarMenu(h).children(
                                  ...data.nav.map((item) =>
                                    SidebarMenuItem(h)
                                      .key(item.name)
                                      .children(
                                        SidebarMenuButton(h, {
                                          isActive: item.name === model.active,
                                          onPress: SettingsDialogMessage.SelectedSection({
                                            name: item.name,
                                          }),
                                        }).children(item.icon(h), h.span.children(item.name)),
                                      ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                        h.main
                          .class("flex h-[480px] flex-1 flex-col overflow-hidden")
                          .children(
                            h.header
                              .class(
                                "flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
                              )
                              .children(
                                h.div
                                  .class("flex items-center gap-2 px-4")
                                  .children(
                                    Breadcrumb(h).children(
                                      BreadcrumbList(h).children(
                                        BreadcrumbItem(h, { class: "hidden md:block" }).children(
                                          BreadcrumbLink(h).attr("href", "#").children("Settings"),
                                        ),
                                        BreadcrumbSeparator(h, { class: "hidden md:block" }),
                                        BreadcrumbItem(h).children(
                                          BreadcrumbPage(h).children(model.active),
                                        ),
                                      ),
                                    ),
                                  ),
                              ),
                            h.div
                              .class("flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0")
                              .children(
                                ...Array.from({ length: 10 }, (_, i) =>
                                  h.div
                                    .key(String(i))
                                    .class("aspect-video max-w-3xl rounded-xl bg-muted/50"),
                                ),
                              ),
                          ),
                      ),
                }),
                dialog
                  .close(
                    h.button.class(
                      cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), DIALOG_CLOSE_CLASS),
                    ),
                  )
                  .children(XIcon(h), h.span.class("sr-only").children("Close")),
              ),
            ),
          ),
        ),
    }),
});
