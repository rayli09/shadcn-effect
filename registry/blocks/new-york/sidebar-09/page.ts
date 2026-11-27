/**
 * Page — shadcn/ui block `sidebar-09`
 * (`registry/new-york-v4/blocks/sidebar-09/page.tsx`), ported 1:1 to
 * Effect UI. Class strings are verbatim from the source.
 *
 * Upstream's default-exported React `Page` becomes the named export
 * `Sidebar09`: an `Html.component` whose view draws the port's
 * `SidebarProvider` (a headless Component, not context) and composes
 * `AppSidebar` + `SidebarInset` inside its `wrapper` part.
 *
 * The block's interactive state lives in this component's Model:
 * upstream keeps `activeItem` / `mails` in `AppSidebar`'s `useState`
 * (and the search input / Unreads switch are uncontrolled there). The
 * kit's inputs are controlled (D-7), and a view function cannot hold
 * state, so the Page owns the values and passes them — plus callbacks —
 * down to `AppSidebar`. Selecting a nav item reshuffles the mail list
 * exactly as upstream's click handler did (a `Math.random` shuffle and
 * slice, computed in the update) and sends `SetOpen` to the provider,
 * upstream's `setOpen(true)`.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.ts";
import { Separator } from "@/components/ui/separator.ts";
import {
  SidebarInset,
  SidebarProvider,
  SidebarProviderMessage,
  SidebarTrigger,
} from "@/components/ui/sidebar.ts";
import { AppSidebar, data, type Mail } from "./components/app-sidebar.ts";

export const Sidebar09Message = UiSchema.TaggedEnum({
  NavSelected: { title: Schema.String },
  UnreadsToggled: { checked: Schema.Boolean },
  SearchChanged: { value: Schema.String },
});

const MailSchema = Schema.Struct({
  name: Schema.String,
  email: Schema.String,
  subject: Schema.String,
  date: Schema.String,
  teaser: Schema.String,
});

export const Sidebar09 = Html.component({
  name: "Sidebar09",
  model: Schema.Struct({
    activeTitle: Schema.String,
    mails: Schema.Array(MailSchema),
    unreads: Schema.Boolean,
    search: Schema.String,
  }),
  message: Sidebar09Message,
}).make({
  init: () => ({
    activeTitle: data.navMain[0]!.title,
    mails: [...data.mails],
    unreads: false,
    search: "",
  }),
  update: {
    NavSelected: ($, { title }) => {
      // Upstream's click handler: shuffle the full mail list, keep a
      // random 5–10 of it, and open the sidebar.
      const shuffled = [...data.mails].sort(() => Math.random() - 0.5);
      const count = Math.max(5, Math.floor(Math.random() * 10) + 1);
      return $.evolve({
        activeTitle: title,
        mails: shuffled.slice(0, count) as Array<Mail>,
      }).send(SidebarProvider, SidebarProviderMessage.SetOpen({ open: true }));
    },
    UnreadsToggled: ($, { checked }) => $.evolve({ unreads: checked }),
    SearchChanged: ($, { value }) => $.evolve({ search: value }),
  },
  view: (h, model) =>
    SidebarProvider(h, {
      props: {},
      view: (sidebar) =>
        sidebar
          .wrapper(h.div)
          // Upstream sets `--sidebar-width: 350px` via the provider's
          // `style` prop; the wrapper part carries the width custom
          // properties, so the style is restated here in full (the
          // icon width keeps the port's default).
          .attr("style", "--sidebar-width: 350px; --sidebar-width-icon: 3rem")
          .children(
            AppSidebar(sidebar, h, {
              activeTitle: model.activeTitle,
              mails: model.mails,
              unreads: model.unreads,
              search: model.search,
              onSelect: (title) => Sidebar09Message.NavSelected({ title }),
              onUnreadsToggle: (checked) => Sidebar09Message.UnreadsToggled({ checked }),
              onSearch: (value) => Sidebar09Message.SearchChanged({ value }),
            }),
            SidebarInset(h).children(
              h.header
                .class("sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4")
                .children(
                  SidebarTrigger(sidebar, h, { class: "-ml-1" }),
                  Separator(h, {
                    orientation: "vertical",
                    class: "mr-2 data-[orientation=vertical]:h-4",
                  }),
                  Breadcrumb(h).children(
                    BreadcrumbList(h).children(
                      BreadcrumbItem(h, { class: "hidden md:block" }).children(
                        BreadcrumbLink(h).attr("href", "#").children("All Inboxes"),
                      ),
                      BreadcrumbSeparator(h, { class: "hidden md:block" }),
                      BreadcrumbItem(h).children(BreadcrumbPage(h).children("Inbox")),
                    ),
                  ),
                ),
              h.div
                .class("flex flex-1 flex-col gap-4 p-4")
                .children(
                  Array.from({ length: 24 }, () =>
                    h.div.class("aspect-video h-12 w-full rounded-lg bg-muted/50"),
                  ),
                ),
            ),
          ),
    }),
});
