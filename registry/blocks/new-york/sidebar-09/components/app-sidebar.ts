/**
 * AppSidebar — shadcn/ui block `sidebar-09`
 * (`registry/new-york-v4/blocks/sidebar-09/components/app-sidebar.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source;
 * the sample data below is upstream's, verbatim except that `icon`
 * component references become lucide icon names (this file maps the
 * names back to builders).
 *
 * Upstream: a React component holding `activeItem` / `mails` in
 * `useState` and calling `setOpen` from `useSidebar()` on selection,
 * rendering TWO sidebars (an icon rail and a mail list) inside the
 * outer `Sidebar`. Here: a view function — the state lives in the Page
 * component (see `page.ts`), which passes the current values and
 * callbacks in as options, and forwards the open request to the
 * `SidebarProvider` itself. Both inner sidebars are drawn from the
 * same provider parts with `collapsible: "none"`, as upstream.
 *
 * Declared divergences (anything else is a bug):
 *
 * - `Sidebar` types its children as a single `View.Content`; the kit
 *   flattens child arrays at runtime, so the upstream sibling lists are
 *   passed as arrays, cast once at each call.
 * - `SidebarMenuButton`'s `tooltip` prop is NOT reproduced — the
 *   sidebar port does not implement it (its own declared gap).
 * - Upstream's logo button wraps an `<a href="#">` via `asChild`; the
 *   sidebar port's `SidebarMenuButton` is always a `<button>` (the
 *   port's D-2).
 *
 * Local icon builders: `ArchiveXIcon`, `CommandIcon`, `FileIcon`,
 * `InboxIcon`, `SendIcon` and `Trash2Icon` are not in `@/lib/icons`;
 * they are defined in this file from the lucide-react 1.69 path data
 * (ISC) via the lib's `icon()` helper.
 */
import type * as Component from "@effect/ui/Component";
import type * as Html from "@effect/ui/html/Html";
import type * as View from "@effect/ui/View";
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
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";
import { Switch } from "@/components/ui/switch.ts";
import { NavUser } from "./nav-user.ts";

/** Lucide `archive-x` (ISC). */
export const ArchiveXIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
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

/** Lucide `command` (ISC). */
export const CommandIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [["path", { d: "M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" }]],
    options,
  );

/** Lucide `file` (ISC). */
export const FileIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
        },
      ],
      ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5" }],
    ],
    options,
  );

/** Lucide `inbox` (ISC). */
export const InboxIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
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

/** Lucide `send` (ISC). */
export const SendIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
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

/** Lucide `trash-2` (ISC). */
export const Trash2Icon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10 11v6" }],
      ["path", { d: "M14 11v6" }],
      ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }],
      ["path", { d: "M3 6h18" }],
      ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }],
    ],
    options,
  );

const navIcons: Readonly<Record<string, typeof InboxIcon>> = {
  inbox: InboxIcon,
  file: FileIcon,
  send: SendIcon,
  "archive-x": ArchiveXIcon,
  "trash-2": Trash2Icon,
};

export interface Mail {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly date: string;
  readonly teaser: string;
}

// This is sample data
export const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Inbox",
      url: "#",
      icon: "inbox",
      isActive: true,
    },
    {
      title: "Drafts",
      url: "#",
      icon: "file",
      isActive: false,
    },
    {
      title: "Sent",
      url: "#",
      icon: "send",
      isActive: false,
    },
    {
      title: "Junk",
      url: "#",
      icon: "archive-x",
      isActive: false,
    },
    {
      title: "Trash",
      url: "#",
      icon: "trash-2",
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
  ] as ReadonlyArray<Mail>,
};

export interface AppSidebarOptions<Msg> {
  readonly activeTitle: string;
  readonly mails: ReadonlyArray<Mail>;
  readonly unreads: boolean;
  readonly search: string;
  readonly onSelect: (title: string) => Msg;
  readonly onUnreadsToggle: (checked: boolean) => Msg;
  readonly onSearch: (value: string) => Msg;
  readonly side?: "left" | "right" | undefined;
  readonly variant?: "sidebar" | "floating" | "inset" | undefined;
  readonly collapsible?: "offcanvas" | "icon" | "none" | undefined;
  readonly class?: string | undefined;
}

export const AppSidebar = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: AppSidebarOptions<Msg>,
): View.Content<Msg, Component.Shared.Of<typeof SidebarProvider>> =>
  Sidebar(
    sidebar,
    h,
    {
      side: options.side,
      variant: options.variant,
      // Upstream renders `<Sidebar collapsible="icon" className="…"
      // {...props}>`: both are defaults the caller can still override.
      collapsible: options.collapsible ?? "icon",
      class: options.class ?? "overflow-hidden *:data-[sidebar=sidebar]:flex-row",
    },
    [
      // This is the first sidebar
      // We disable collapsible and adjust width to icon.
      // This will make the sidebar appear as icons.
      Sidebar(
        sidebar,
        h,
        { collapsible: "none", class: "w-[calc(var(--sidebar-width-icon)+1px)]! border-r" },
        [
          SidebarHeader(h).children(
            SidebarMenu(h).children(
              SidebarMenuItem(h).children(
                SidebarMenuButton(h, { size: "lg", class: "md:h-8 md:p-0" }).children(
                  h.div
                    .class(
                      "flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground",
                    )
                    .children(CommandIcon(h, { class: "size-4" })),
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
                  data.navMain.map((item) => {
                    const Icon = navIcons[item.icon] ?? InboxIcon;
                    return SidebarMenuItem(h).children(
                      SidebarMenuButton(h, {
                        isActive: options.activeTitle === item.title,
                        class: "px-2.5 md:px-2",
                        onPress: options.onSelect(item.title),
                      }).children(Icon(h), h.span.children(item.title)),
                    );
                  }),
                ),
              ),
            ),
          ),
          SidebarFooter(h).children(NavUser(h, { props: { user: data.user } })),
        ] as unknown as View.Content<Msg, Component.Shared.Of<typeof SidebarProvider>>,
      ),
      // This is the second sidebar
      // We disable collapsible and let it fill remaining space
      Sidebar(sidebar, h, { collapsible: "none", class: "hidden flex-1 md:flex" }, [
        SidebarHeader(h, { class: "gap-3.5 border-b p-4" }).children(
          h.div.class("flex w-full items-center justify-between").children(
            h.div.class("text-base font-medium text-foreground").children(options.activeTitle),
            Label(h, { class: "flex items-center gap-2 text-sm" }).children(
              h.span.children("Unreads"),
              Switch(h, {
                props: { checked: options.unreads },
                onToggle: ({ checked }) => options.onUnreadsToggle(checked),
                class: "shadow-none",
              }),
            ),
          ),
          SidebarInput(h, {
            props: { value: options.search },
            onUpdate: ({ value }) => options.onSearch(value),
          }).attr("placeholder", "Type to search..."),
        ),
        SidebarContent(h).children(
          SidebarGroup(h, { class: "px-0" }).children(
            SidebarGroupContent(h).children(
              options.mails.map((mail) =>
                h.a
                  .class(
                    "flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )
                  .attr("href", "#")
                  .children(
                    h.div
                      .class("flex w-full items-center gap-2")
                      .children(
                        h.span.children(mail.name),
                        " ",
                        h.span.class("ml-auto text-xs").children(mail.date),
                      ),
                    h.span.class("font-medium").children(mail.subject),
                    h.span
                      .class("line-clamp-2 w-[260px] text-xs whitespace-break-spaces")
                      .children(mail.teaser),
                  ),
              ),
            ),
          ),
        ),
      ] as unknown as View.Content<Msg, Component.Shared.Of<typeof SidebarProvider>>),
    ] as unknown as View.Content<Msg, Component.Shared.Of<typeof SidebarProvider>>,
  );
