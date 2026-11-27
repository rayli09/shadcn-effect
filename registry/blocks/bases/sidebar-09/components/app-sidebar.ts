/**
 * AppSidebar (sidebar-09 block) — upstream
 * `registry/bases/radix/blocks/sidebar-09/components/app-sidebar.tsx`
 * ported to Effect UI. A view function: the provider's parts come first
 * (the block-wide replacement for upstream's context), then the caller's
 * `h`. The sample data is upstream's, verbatim, as a module constant;
 * data fields that held icon JSX hold icon *builder* references instead
 * (called at render).
 *
 * State: upstream holds `activeItem` + `mails` in `useState` and calls
 * `useSidebar().setOpen(true)` on a nav click. Here that state lives in
 * the internal headless Component `MailBrowser` below: its Model holds
 * the active item's title and the current mail list, its `ClickedItem`
 * update stores the title, sends the provider its `SetOpen` (the
 * `$.send` route the sidebar port documents for child Components), and
 * runs the `ShuffleMails` Command — upstream's click handler reshuffles
 * the mail list with `Math.random`, which is an effect, so it lives in
 * a Command built on `effect`'s `Random` (same distribution: shuffle,
 * then keep the first `max(5, floor(random * 10) + 1)`). The outer and
 * inner `Sidebar`s are drawn inside the Component's `view` closure,
 * where the provider's parts and the Component's parts (the state as
 * data, plus the `navButton` part that binds a click to `ClickedItem`)
 * are both in scope.
 *
 * Declared divergences:
 * - `SidebarMenuButton`'s `tooltip` prop is not reproduced (the sidebar
 *   port's header, item 4: the kit Tooltip is a controlled Component
 *   with no drop-in equivalent).
 * - D-2 `asChild`: the brand row's <a href="#"> collapses onto the
 *   `SidebarMenuButton` itself (the button upstream's Slot rendered
 *   around the anchor); the `href` is not rendered.
 * - Upstream's header `Switch` is uncontrolled and unwired (no
 *   `checked`, no `onCheckedChange`); the kit Switch is controlled
 *   (D-7), so it is drawn at its initial unchecked state with no
 *   toggle handler. Upstream's `SidebarInput` is likewise unwired (no
 *   `value` / `onChange`); it is drawn controlled with the empty
 *   initial value and no update handler.
 * - Upstream spreads `React.ComponentProps<typeof Sidebar>` onto the
 *   outer Sidebar; the Page passes none, so only upstream's literal
 *   options (`collapsible="icon"` + its class) are taken.
 * - Icons: the glyphs below are LOCAL builders over the shared `icon()`
 *   helper, nodes copied verbatim from lucide's SVGs (ISC): inbox,
 *   file, send, archive-x, trash-2, terminal.
 */
import * as Command from "@effect/ui/Command";
import type * as Component from "@effect/ui/Component";
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Effect from "effect/Effect";
import * as Random from "effect/Random";
import * as Schema from "effect/Schema";
import { icon, type IconOptions } from "@/lib/icons";
import { Label } from "@/components/ui/label.ts";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarProviderMessage,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { Switch } from "@/components/ui/switch.ts";
import { NavUser } from "./nav-user.ts";

/** Lucide `inbox` (ISC). */
const InboxIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12" }],
      [
        "path",
        {
          d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
        },
      ],
    ],
    options,
  );

/** Lucide `file` (ISC). */
const FileIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }],
      ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4" }],
    ],
    options,
  );

/** Lucide `send` (ISC). */
const SendIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
        },
      ],
      ["path", { d: "m21.854 2.147-10.94 10.939" }],
    ],
    options,
  );

/** Lucide `archive-x` (ISC). */
const ArchiveXIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "20", height: "5", x: "2", y: "3", rx: "1" }],
      ["path", { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" }],
      ["path", { d: "m9.5 17 5-5" }],
      ["path", { d: "m9.5 12 5 5" }],
    ],
    options,
  );

/** Lucide `trash-2` (ISC). */
const Trash2Icon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M3 6h18" }],
      ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }],
      ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }],
      ["line", { x1: "10", x2: "10", y1: "11", y2: "17" }],
      ["line", { x1: "14", x2: "14", y1: "11", y2: "17" }],
    ],
    options,
  );

/** Lucide `terminal` (ISC). */
const TerminalIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["polyline", { points: "4 17 10 11 4 5" }],
      ["line", { x1: "12", x2: "20", y1: "19", y2: "19" }],
    ],
    options,
  );

// This is sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Inbox",
      url: "#",
      icon: InboxIcon,
      isActive: true,
    },
    {
      title: "Drafts",
      url: "#",
      icon: FileIcon,
      isActive: false,
    },
    {
      title: "Sent",
      url: "#",
      icon: SendIcon,
      isActive: false,
    },
    {
      title: "Junk",
      url: "#",
      icon: ArchiveXIcon,
      isActive: false,
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash2Icon,
      isActive: false,
    },
  ],
  mails: [
    {
      name: "William Smith",
      email: "williamsmith@example.com",
      subject: "Meeting Tomorrow",
      date: "09:34 AM",
      teaser:
        "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
    },
    {
      name: "Alice Smith",
      email: "alicesmith@example.com",
      subject: "Re: Project Update",
      date: "Yesterday",
      teaser:
        "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
    },
    {
      name: "Bob Johnson",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      date: "2 days ago",
      teaser:
        "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
    },
    {
      name: "Emily Davis",
      email: "emilydavis@example.com",
      subject: "Re: Question about Budget",
      date: "2 days ago",
      teaser:
        "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
    },
    {
      name: "Michael Wilson",
      email: "michaelwilson@example.com",
      subject: "Important Announcement",
      date: "1 week ago",
      teaser:
        "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
    },
    {
      name: "Sarah Brown",
      email: "sarahbrown@example.com",
      subject: "Re: Feedback on Proposal",
      date: "1 week ago",
      teaser:
        "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
    },
    {
      name: "David Lee",
      email: "davidlee@example.com",
      subject: "New Project Idea",
      date: "1 week ago",
      teaser:
        "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?",
    },
    {
      name: "Olivia Wilson",
      email: "oliviawilson@example.com",
      subject: "Vacation Plans",
      date: "1 week ago",
      teaser:
        "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave.",
    },
    {
      name: "James Martin",
      email: "jamesmartin@example.com",
      subject: "Re: Conference Registration",
      date: "1 week ago",
      teaser:
        "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end.",
    },
    {
      name: "Sophia White",
      email: "sophiawhite@example.com",
      subject: "Team Dinner",
      date: "1 week ago",
      teaser:
        "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences.",
    },
  ],
};

// ---------------------------------------------------------------------------
// MailBrowser — the internal state owner (see the header)
// ---------------------------------------------------------------------------

const Mail = Schema.Struct({
  name: Schema.String,
  email: Schema.String,
  subject: Schema.String,
  date: Schema.String,
  teaser: Schema.String,
});
type Mail = typeof Mail.Type;

export const AppSidebarMessage = UiSchema.TaggedEnum({
  /** A nav item was clicked (upstream's `onClick` on the menu button). */
  ClickedItem: { title: Schema.String },
  /** The shuffle Command finished: the new mail list to show. */
  Shuffled: { mails: Schema.Array(Mail) },
});
type AppSidebarMessage = typeof AppSidebarMessage.Type;

/** Upstream's reshuffle: shuffle all mails, keep the first `max(5, floor(random * 10) + 1)`. */
const ShuffleMails = Command.make("Sidebar09AppSidebar/ShuffleMails", { args: {} }, () =>
  Random.shuffle(data.mails).pipe(
    Effect.flatMap((shuffled) =>
      Random.nextIntBetween(1, 11).pipe(
        Effect.map(
          (count) =>
            AppSidebarMessage.Shuffled({
              mails: shuffled.slice(0, Math.max(5, count)),
            }) as AppSidebarMessage,
        ),
      ),
    ),
  ),
);

const MailBrowser = Html.component({
  name: "Sidebar09MailBrowser",
  model: Schema.Struct({
    activeTitle: Schema.String,
    mails: Schema.Array(Mail),
  }),
  message: AppSidebarMessage,
}).make({
  init: () => ({ activeTitle: data.navMain[0]!.title, mails: data.mails }),
  update: {
    ClickedItem: ($, { title }) =>
      $.evolve({ activeTitle: title })
        .send(SidebarProvider, SidebarProviderMessage.SetOpen({ open: true }))
        .run(ShuffleMails.make()),
    Shuffled: ($, { mails }) => $.evolve({ mails }),
  },
  parts: (p, model) => ({
    activeTitle: model.activeTitle,
    mails: model.mails,
    /** A nav row's button part: the click sends this Component's `ClickedItem` for the row's title. */
    navButton: p.part("button", (b, title: string) =>
      b.on("click", AppSidebarMessage.ClickedItem({ title })),
    ),
  }),
});

type MailBrowserParts = Component.Headless.Parts<typeof MailBrowser>;

// ---------------------------------------------------------------------------
// AppSidebar
// ---------------------------------------------------------------------------

export const AppSidebar = <Msg>(sidebar: SidebarProviderParts, h: Html.H<Msg>) =>
  MailBrowser(h, {
    view: (mail: MailBrowserParts) =>
      Sidebar(
        sidebar,
        h,
        { collapsible: "icon", class: "overflow-hidden *:data-[sidebar=sidebar]:flex-row" },
        [
          // This is the first sidebar
          // We disable collapsible and adjust width to icon.
          // This will make the sidebar appear as icons.
          Sidebar(
            sidebar,
            h,
            {
              collapsible: "none",
              class: "w-[calc(var(--sidebar-width-icon)+1px)]! border-r",
            },
            [
              SidebarHeader(h).children(
                SidebarMenu(h).children(
                  SidebarMenuItem(h).children(
                    SidebarMenuButton(h, { size: "lg", class: "md:h-8 md:p-0" }).children(
                      h.div
                        .class(
                          "flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground",
                        )
                        .children(TerminalIcon(h, { class: "size-4" })),
                      h.div
                        .class("grid flex-1 text-left text-sm leading-tight")
                        .children(
                          h.span.class("truncate font-medium").children("Acme Inc"),
                          h.span.class("truncate text-xs").children("Enterprise"),
                        ),
                    ),
                  ),
                ),
              ),
              SidebarContent(h).children(
                SidebarGroup(h).children(
                  SidebarGroupContent(h, { class: "px-1.5 md:px-0" }).children(
                    SidebarMenu(h).children(
                      ...data.navMain.map((item) =>
                        SidebarMenuItem(h)
                          .key(item.title)
                          .children(
                            mail
                              .navButton(
                                SidebarMenuButton(h, {
                                  isActive: mail.activeTitle === item.title,
                                  class: "px-2.5 md:px-2",
                                }),
                                item.title,
                              )
                              .children(item.icon(h), h.span.children(item.title)),
                          ),
                      ),
                    ),
                  ),
                ),
              ),
              SidebarFooter(h).children(NavUser(sidebar, h, { user: data.user })),
            ],
          ),

          // This is the second sidebar
          // We disable collapsible and let it fill remaining space
          Sidebar(sidebar, h, { collapsible: "none", class: "hidden flex-1 md:flex" }, [
            SidebarHeader(h, { class: "gap-3.5 border-b p-4" }).children(
              h.div
                .class("flex w-full items-center justify-between")
                .children(
                  h.div.class("text-base font-medium text-foreground").children(mail.activeTitle),
                  Label(h, { class: "flex items-center gap-2 text-sm" }).children(
                    h.span.children("Unreads"),
                    Switch(h, { props: { checked: false }, class: "shadow-none" }),
                  ),
                ),
              SidebarInput(h, { props: { value: "" } }).attr("placeholder", "Type to search..."),
            ),
            SidebarContent(h).children(
              SidebarGroup(h, { class: "px-0" }).children(
                SidebarGroupContent(h).children(
                  ...mail.mails.map((mailItem) =>
                    h.a
                      .attr("href", "#")
                      .key(mailItem.email)
                      .class(
                        "flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )
                      .children(
                        h.div
                          .class("flex w-full items-center gap-2")
                          .children(
                            h.span.children(mailItem.name),
                            " ",
                            h.span.class("ml-auto text-xs").children(mailItem.date),
                          ),
                        h.span.class("font-medium").children(mailItem.subject),
                        h.span
                          .class("line-clamp-2 w-[260px] text-xs whitespace-break-spaces")
                          .children(mailItem.teaser),
                      ),
                  ),
                ),
              ),
            ),
          ]),
        ],
      ),
  });
