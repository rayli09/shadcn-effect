/**
 * SettingsDialog — shadcn/ui block `sidebar-13`
 * (`registry/new-york-v4/blocks/sidebar-13/components/settings-dialog.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source;
 * the sample data below is upstream's, verbatim.
 *
 * Upstream: a React component holding the dialog's open state in
 * `useState` (initially open), rendering a Radix `Dialog` whose content
 * is a nested `SidebarProvider` layout. Here: an `Html.component`
 * holding `open` in its Model (initialised `true`, as upstream),
 * drawing the port's `Dialog` (controlled) around a nested
 * `SidebarProvider` composition.
 *
 * Declared divergences (anything else is a bug):
 * - D-2: upstream's menu buttons are `SidebarMenuButton asChild`
 *   anchors (`href="#"`); the port's button is always a `<button>`, so
 *   the hrefs are dropped.
 * - Upstream's trigger is a `Button` merged into the Radix trigger via
 *   `asChild`; here the trigger part takes a plain `<button>` carrying
 *   `buttonVariants({ size: "sm" })`.
 * - The icon component references in the data become lucide name
 *   strings; `navIcons` maps them to builders.
 *
 * Local icon builders: `BellIcon`, `MenuIcon`, `HomeIcon`,
 * `PaintbrushIcon`, `MessageCircleIcon`, `GlobeIcon`, `KeyboardIcon`,
 * `VideoIcon`, `LinkIcon`, `LockIcon` and `SettingsIcon` are not in
 * `@/lib/icons`; they are defined in this file from the lucide-react
 * 1.69 path data (ISC) via the lib's `icon()` helper. `CheckIcon`
 * comes from the lib.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { CheckIcon, XIcon, icon, type IconOptions } from "@/lib/icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.ts";
import { buttonVariants } from "@/components/ui/button.ts";
import { DIALOG_CLOSE_CLASS, Dialog } from "@/components/ui/dialog.ts";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar.ts";

/** Lucide `bell` (ISC). */
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

/** Lucide `menu` (ISC). */
export const MenuIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M4 5h16" }],
      ["path", { d: "M4 12h16" }],
      ["path", { d: "M4 19h16" }],
    ],
    options,
  );

/** Lucide `house` (ISC). */
export const HomeIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }],
      [
        "path",
        {
          d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
        },
      ],
    ],
    options,
  );

/** Lucide `paintbrush` (ISC). */
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

/** Lucide `message-circle` (ISC). */
export const MessageCircleIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
        },
      ],
    ],
    options,
  );

/** Lucide `globe` (ISC). */
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

/** Lucide `keyboard` (ISC). */
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

/** Lucide `video` (ISC). */
export const VideoIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" }],
      ["rect", { x: "2", y: "6", width: "14", height: "12", rx: "2" }],
    ],
    options,
  );

/** Lucide `link` (ISC). */
export const LinkIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }],
      ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" }],
    ],
    options,
  );

/** Lucide `lock` (ISC). */
export const LockIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }],
      ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4" }],
    ],
    options,
  );

/** Lucide `settings` (ISC). */
export const SettingsIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
        },
      ],
      ["circle", { cx: "12", cy: "12", r: "3" }],
    ],
    options,
  );

const data = {
  nav: [
    { name: "Notifications", icon: "bell" },
    { name: "Navigation", icon: "menu" },
    { name: "Home", icon: "home" },
    { name: "Appearance", icon: "paintbrush" },
    { name: "Messages & media", icon: "message-circle" },
    { name: "Language & region", icon: "globe" },
    { name: "Accessibility", icon: "keyboard" },
    { name: "Mark as read", icon: "check" },
    { name: "Audio & video", icon: "video" },
    { name: "Connected accounts", icon: "link" },
    { name: "Privacy & visibility", icon: "lock" },
    { name: "Advanced", icon: "settings" },
  ],
};

const navIcons: Readonly<Record<string, typeof BellIcon>> = {
  bell: BellIcon,
  menu: MenuIcon,
  home: HomeIcon,
  paintbrush: PaintbrushIcon,
  "message-circle": MessageCircleIcon,
  globe: GlobeIcon,
  keyboard: KeyboardIcon,
  check: CheckIcon,
  video: VideoIcon,
  link: LinkIcon,
  lock: LockIcon,
  settings: SettingsIcon,
};

export const SettingsDialogMessage = UiSchema.TaggedEnum({
  RequestedOpen: {},
  RequestedClose: {},
});

export const SettingsDialog = Html.component({
  name: "SettingsDialog",
  model: Schema.Struct({ open: Schema.Boolean }),
  message: SettingsDialogMessage,
}).make({
  init: () => ({ open: true }),
  update: {
    RequestedOpen: ($) => $.evolve({ open: true }),
    RequestedClose: ($) => $.evolve({ open: false }),
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
      view: (dialog) =>
        h.div.children(
          dialog.trigger(h.button.class(buttonVariants({ size: "sm" }))).children("Open Dialog"),
          dialog.portal(h.dialog)?.children(
            dialog.backdrop(h.div),
            dialog.viewport(h.div).children(
              dialog.popup(h.div).children(
                dialog.title(h.h2).children("Settings"),
                dialog.description(h.p).children("Customize your settings here."),
                SidebarProvider(h, {
                  props: {},
                  view: (sidebar) =>
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
                                  data.nav.map((item) =>
                                    SidebarMenuItem(h).children(
                                      SidebarMenuButton(h, {
                                        isActive: item.name === "Messages & media",
                                      }).children(
                                        navIcons[item.icon]?.(h),
                                        h.span.children(item.name),
                                      ),
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
                                          BreadcrumbPage(h).children("Messages & media"),
                                        ),
                                      ),
                                    ),
                                  ),
                              ),
                            h.div
                              .class("flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0")
                              .children(
                                Array.from({ length: 10 }, () =>
                                  h.div.class("aspect-video max-w-3xl rounded-xl bg-muted/50"),
                                ),
                              ),
                          ),
                      ),
                }),
                // The auto close button upstream's DialogContent renders
                // inside the content.
                dialog
                  .close(h.button.class(DIALOG_CLOSE_CLASS))
                  .children(XIcon(h), h.span.class("sr-only").children("Close")),
              ),
            ),
          ),
        ),
    }),
});
