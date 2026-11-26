/**
 * Sidebar — shadcn/ui `sidebar` ported 1:1 to Effect UI.
 *
 * Upstream: a React context (`SidebarContext`) + hooks (`useSidebar`,
 * `useIsMobile`) composition of ~25 pieces. There is no context and no
 * hooks in Effect UI, so the shape here is the one docs/MAPPING.md declares
 * for this component — a Provider Component + view composition, shipped as
 * a block, not a bare ui item:
 *
 * - `SidebarProvider` is a headless Component authored in this file. It
 *   owns the Model (`openState`, `openMobile`, `isMobile`), `shares` the
 *   upstream context value (`{ state, open, openMobile, isMobile }`) with
 *   every Component below it, and `receives` the messages children send it
 *   (`Toggled`, `SetOpen`, `SetOpenMobile`). Its `view` closure gets parts:
 *   the shared values as plain data, a `wrapper` part for the upstream
 *   wrapper <div>, and a `toggle` part (a <button> part whose click sends
 *   the provider's own `Toggled`). `useSidebar()` is replaced by those
 *   parts — or, inside your own Components, by
 *   `reads: { sidebar: SidebarProvider }` plus `$.send(SidebarProvider, …)`
 *   in `update`, the kit's shared-state mechanism.
 * - Everything else is a view function. Pieces that upstream read context
 *   from (`Sidebar`, `SidebarTrigger`, `SidebarRail`) take the provider's
 *   parts as their first argument; the rest are pure markup, exactly as
 *   upstream. Class strings are byte-for-byte the shadcn new-york-v4
 *   strings; `data-slot` / `data-sidebar` / `data-state` / `data-variant` /
 *   `data-side` / `data-size` / `data-active` are all preserved.
 *
 *   SidebarProvider(h, {
 *     props: { defaultOpen: true },
 *     onEmit: { Updated: ({ open }) => Msg.SidebarChanged({ open }) },
 *     view: (sidebar) =>
 *       sidebar.wrapper(h.div).class("app-shell").children(
 *         Sidebar(sidebar, h, { variant: "inset" },
 *           SidebarContent(h).children(
 *             SidebarGroup(h).children(
 *               SidebarGroupLabel(h).children("Platform"),
 *               SidebarMenu(h).children(
 *                 SidebarMenuItem(h).children(
 *                   SidebarMenuButton(h, { onPress: Msg.ClickedHome() }).children("Home")
 *                 )
 *               )
 *             )
 *           )
 *         ),
 *         SidebarInset(h).children(
 *           SidebarTrigger(sidebar, h),
 *           "…page…"
 *         )
 *       )
 *   })
 *
 * NOT reproduced 1:1 (everything, declared):
 *
 * 1. Cookie persistence. Upstream's `setOpen` writes
 *    `sidebar_state=<open>; path=/; max-age=604800` to `document.cookie`.
 *    A registry Component does not touch the DOM behind the consumer's
 *    back: the provider emits `Updated { open }` (the `onOpenChange`
 *    equivalent) whenever the desktop open changes, and the consumer's
 *    `update` writes the cookie itself (e.g. via a Command) using the
 *    exported `SIDEBAR_COOKIE_NAME` / `SIDEBAR_COOKIE_MAX_AGE`. Reading
 *    the cookie back is the consumer passing `defaultOpen` / `open`,
 *    exactly as upstream (upstream never reads the cookie itself either).
 * 2. `onOpenChange` covers desktop `open` only — same as upstream.
 *    `openMobile` changes stay internal (upstream surfaces them only
 *    through the mobile Sheet's own `onOpenChange`, which is likewise
 *    internal there).
 * 3. No automatic `TooltipProvider` wrap. Upstream's provider renders
 *    `<TooltipProvider delayDuration={0}>` around the wrapper. Compose
 *    this repo's ported `TooltipProvider` yourself where tooltips are
 *    used; see the `SidebarMenuButton` tooltip note below.
 * 4. `SidebarMenuButton`'s `tooltip` prop is NOT reproduced. Upstream
 *    wraps the button in a Radix Tooltip shown only when collapsed and
 *    not mobile; the kit `Tooltip` is a controlled Component (the
 *    consumer owns its `open`), so there is no drop-in equivalent.
 *    Compose the ported `Tooltip` around the button yourself, computing
 *    visibility from the provider parts (`state === "collapsed" &&
 *    !isMobile`), which is all upstream's `hidden` prop does.
 * 5. `asChild` / Slot (`SidebarGroupLabel`, `SidebarGroupAction`,
 *    `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuSubButton`)
 *    does not exist (D-2): these always render their base element
 *    (`div` / `button` / `button` / `button` / `a`).
 * 6. DOM prop spreading (`{...props}`) is not reproduced on any piece:
 *    each takes `class` plus its documented options; chain further
 *    attributes on the returned builder.
 * 7. `SidebarTrigger`'s consumer `onClick` is not reproduced — the press
 *    IS the toggle (the provider's `toggle` part). Same for
 *    `SidebarRail`. A custom trigger can apply `sidebar.toggle(h.button)`
 *    to any <button> builder, or send `SidebarProviderMessage` from a
 *    child Component's `update` via `$.send`.
 * 8. Mobile SheetContent classes under D-1 (no tailwind-merge): the Sheet
 *    side classes (`w-3/4`, `sm:max-w-sm`, `bg-background`, …) and the
 *    sidebar mobile classes (`w-(--sidebar-width)`, `bg-sidebar`, `p-0`)
 *    coexist on the popup and CSS order decides, where upstream's
 *    tailwind-merge would drop the Sheet ones.
 * 9. `SidebarMenuSkeleton`'s random width: upstream picks 50–90% once per
 *    mount (`useMemo` + `Math.random`). A view function is pure, so the
 *    width is the `width` option (default `"70%"`) written to
 *    `--skeleton-width`; pass different widths per row for the upstream
 *    look.
 * 10. `SidebarInput` is controlled-only (D-7): `props.value` is required,
 *     as for this repo's `Input`.
 * 11. The provider wrapper's `style` prop: the `wrapper` part writes
 *     `--sidebar-width` / `--sidebar-width-icon` as a `style` attribute.
 *     Chaining `.attr("style", …)` after the part replaces it rather than
 *     merging per-property as React's style object does.
 * 12. The mobile branch is drawn by an internal, unexported Component
 *     (`SidebarMobile`, below) that owns the kit Dialog behind this
 *     repo's Sheet styling and forwards its close requests to the
 *     provider with `$.send` — the Effect-native replacement for
 *     upstream's internal `open={openMobile} onOpenChange={setOpenMobile}`
 *     wiring. It is an implementation detail, not an upstream export.
 * 13. `data-[state=open]` tokens in the menu-button classes are kept
 *     verbatim (D-5): nothing here writes `data-state="open"` — upstream
 *     gets it from Radix Collapsible around sub-menus, which is the
 *     consumer's composition in this stack too.
 */
import * as Html from "@effect/ui/html/Html"
import { HtmlSubscription } from "@effect/ui/html"
import type * as Component from "@effect/ui/Component"
import type * as View from "@effect/ui/View"
import * as UiSchema from "@effect/ui/UiSchema"
import { Dialog as KitDialog, type SeparatorElement } from "@effect/ui-kit"
import * as Schema from "effect/Schema"
import { cn } from "../lib/utils.ts"
import { buttonVariants } from "./button.ts"
import { Input, type InputElement, type InputProps } from "./input.ts"
import { Separator } from "./separator.ts"
import {
  SheetHeader,
  SHEET_CONTENT_BASE_CLASS,
  SHEET_CONTENT_SIDE_CLASSES,
  SHEET_DESCRIPTION_CLASS,
  SHEET_OVERLAY_CLASS,
  SHEET_TITLE_CLASS
} from "./sheet.ts"
import { Skeleton } from "./skeleton.ts"

// ---------------------------------------------------------------------------
// Constants (upstream's module-level constants, same values)
// ---------------------------------------------------------------------------

/** The cookie upstream's provider writes on every desktop open change. */
export const SIDEBAR_COOKIE_NAME = "sidebar_state"
/** One week, as upstream. */
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
export const SIDEBAR_WIDTH = "16rem"
export const SIDEBAR_WIDTH_MOBILE = "18rem"
export const SIDEBAR_WIDTH_ICON = "3rem"
export const SIDEBAR_KEYBOARD_SHORTCUT = "b"
/** Upstream `use-mobile`: `MOBILE_BREAKPOINT = 768`, query `(max-width: 767px)`. */
export const SIDEBAR_MOBILE_QUERY = "(max-width: 767px)"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SidebarSide = "left" | "right"
export type SidebarVariant = "sidebar" | "floating" | "inset"
export type SidebarCollapsible = "offcanvas" | "icon" | "none"

/** Upstream's derived `state`: `"expanded"` when open, `"collapsed"` when not. */
export const SidebarState = Schema.Literals(["expanded", "collapsed"])
export type SidebarState = typeof SidebarState.Type

// ---------------------------------------------------------------------------
// Class strings (byte-for-byte upstream)
// ---------------------------------------------------------------------------

export const SIDEBAR_WRAPPER_CLASS =
  "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar"

export const SIDEBAR_NONE_CLASS =
  "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground"

export const SIDEBAR_MOBILE_CONTENT_CLASS =
  "w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"

export const SIDEBAR_ROOT_CLASS =
  "group peer hidden text-sidebar-foreground md:block"

export const SIDEBAR_GAP_BASE_CLASS =
  "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear group-data-[collapsible=offcanvas]:w-0 group-data-[side=right]:rotate-180"

export const SIDEBAR_CONTAINER_BASE_CLASS =
  "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex"

export const SIDEBAR_INNER_CLASS =
  "flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"

export const SIDEBAR_RAIL_CLASS =
  "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border sm:flex in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize [[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar [[data-side=left][data-collapsible=offcanvas]_&]:-right-2 [[data-side=right][data-collapsible=offcanvas]_&]:-left-2"

export const SIDEBAR_INSET_CLASS =
  "relative flex w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2"

export const SIDEBAR_INPUT_CLASS = "h-8 w-full bg-background shadow-none"

export const SIDEBAR_HEADER_CLASS = "flex flex-col gap-2 p-2"

export const SIDEBAR_FOOTER_CLASS = "flex flex-col gap-2 p-2"

export const SIDEBAR_SEPARATOR_CLASS = "mx-2 w-auto bg-sidebar-border"

export const SIDEBAR_CONTENT_CLASS =
  "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden"

export const SIDEBAR_GROUP_CLASS = "relative flex w-full min-w-0 flex-col p-2"

export const SIDEBAR_GROUP_LABEL_CLASS =
  "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0"

export const SIDEBAR_GROUP_ACTION_CLASS =
  "absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 after:absolute after:-inset-2 md:after:hidden group-data-[collapsible=icon]:hidden"

export const SIDEBAR_GROUP_CONTENT_CLASS = "w-full text-sm"

export const SIDEBAR_MENU_CLASS = "flex w-full min-w-0 flex-col gap-1"

export const SIDEBAR_MENU_ITEM_CLASS = "group/menu-item relative"

export const SIDEBAR_MENU_ACTION_CLASS =
  "absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform peer-hover/menu-button:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 after:absolute after:-inset-2 md:after:hidden peer-data-[size=sm]/menu-button:top-1 peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 group-data-[collapsible=icon]:hidden"

export const SIDEBAR_MENU_ACTION_SHOW_ON_HOVER_CLASS =
  "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground data-[state=open]:opacity-100 md:opacity-0"

export const SIDEBAR_MENU_BADGE_CLASS =
  "pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium text-sidebar-foreground tabular-nums select-none peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground peer-data-[size=sm]/menu-button:top-1 peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 group-data-[collapsible=icon]:hidden"

export const SIDEBAR_MENU_SKELETON_CLASS =
  "flex h-8 items-center gap-2 rounded-md px-2"

export const SIDEBAR_MENU_SUB_CLASS =
  "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden"

export const SIDEBAR_MENU_SUB_ITEM_CLASS = "group/menu-sub-item relative"

export const SIDEBAR_MENU_SUB_BUTTON_BASE_CLASS =
  "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground ring-sidebar-ring outline-hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"

// ---------------------------------------------------------------------------
// Icons (lucide path data, ISC — inline SVG, no lucide-react)
// ---------------------------------------------------------------------------

/** Lucide `panel-left`, drawn the way this repo's other icon builders are. */
export const PanelLeftIcon = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.el("svg")
    .attrs({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true"
    })
    .attr("class", cn("lucide lucide-panel-left", options.class))
    .children(
      h.el("rect").attrs({ width: "18", height: "18", x: "3", y: "3", rx: "2" }),
      h.el("path").attr("d", "M9 3v18")
    )

// ---------------------------------------------------------------------------
// SidebarProvider — the headless Provider Component
// ---------------------------------------------------------------------------

export const SidebarProviderProps = Schema.Struct({
  /** Upstream `defaultOpen` (default `true`): the initial uncontrolled open. */
  defaultOpen: Schema.optional(Schema.Boolean),
  /** Upstream `open`: when set, the consumer owns the desktop open state. */
  open: Schema.optional(Schema.Boolean)
})
export type SidebarProviderProps = typeof SidebarProviderProps.Type

export const SidebarProviderModel = Schema.Struct({
  openState: Schema.Boolean,
  openMobile: Schema.Boolean,
  isMobile: Schema.Boolean
})
export type SidebarProviderModel = typeof SidebarProviderModel.Type

export const SidebarProviderMessage = UiSchema.TaggedEnum({
  /** Flip the sidebar: mobile flips `openMobile`, desktop flips `open`. */
  Toggled: {},
  /** Set the desktop open (upstream context's `setOpen`). */
  SetOpen: { open: Schema.Boolean },
  /** Set the mobile open (upstream context's `setOpenMobile`). */
  SetOpenMobile: { open: Schema.Boolean },
  /** The mobile media query changed (the `useIsMobile` replacement). */
  ChangedViewport: { isMobile: Schema.Boolean }
})

export const SidebarProviderEvents = UiSchema.TaggedEnum({
  /** Upstream `onOpenChange`: the desktop open changed. */
  Updated: { open: Schema.Boolean }
})

/** What the provider shares: upstream's `SidebarContextProps`, minus the setters (messages replace them). */
export const SidebarShared = Schema.Struct({
  state: SidebarState,
  open: Schema.Boolean,
  openMobile: Schema.Boolean,
  isMobile: Schema.Boolean
})
export type SidebarShared = typeof SidebarShared.Type

const sharedValue = (
  model: SidebarProviderModel,
  props: SidebarProviderProps
): SidebarShared => {
  const open = props.open ?? model.openState
  return {
    state: open ? "expanded" : "collapsed",
    open,
    openMobile: model.openMobile,
    isMobile: model.isMobile
  }
}

/**
 * The sidebar's state owner. Call it with the consumer's `h`, `props`
 * (`defaultOpen` / controlled `open`), `onEmit: { Updated }` (upstream's
 * `onOpenChange`), and a `view` closure that draws
 * `sidebar.wrapper(h.div)` around the sidebar and the page, reading
 * `sidebar.state` / `sidebar.open` / `sidebar.openMobile` /
 * `sidebar.isMobile` and applying `sidebar.toggle(h.button)` to any
 * custom trigger. See the file header for the full example and the
 * declared divergences (cookie, TooltipProvider wrap, …).
 */
export const SidebarProvider = Html.component({
  name: "SidebarProvider",
  props: SidebarProviderProps,
  model: SidebarProviderModel,
  message: SidebarProviderMessage,
  events: SidebarProviderEvents,
  shares: {
    value: ({ model, props }) => sharedValue(model, props),
    schema: SidebarShared,
    receives: ["Toggled", "SetOpen", "SetOpenMobile"]
  }
}).make({
  init: ({ props }) => ({
    openState: props.defaultOpen ?? true,
    openMobile: false,
    isMobile: false
  }),
  update: {
    Toggled: ($) => {
      if ($.model.isMobile) {
        return $.evolve({ openMobile: !$.model.openMobile })
      }
      const open = !($.props.open ?? $.model.openState)
      return $.props.open === undefined
        ? $.evolve({ openState: open }).emit(
          SidebarProviderEvents.Updated({ open })
        )
        : $.emit(SidebarProviderEvents.Updated({ open }))
    },
    SetOpen: ($, { open }) =>
      $.props.open === undefined
        ? $.evolve({ openState: open }).emit(
          SidebarProviderEvents.Updated({ open })
        )
        : $.emit(SidebarProviderEvents.Updated({ open })),
    SetOpenMobile: ($, { open }) => $.evolve({ openMobile: open }),
    ChangedViewport: ($, { isMobile }) => $.evolve({ isMobile })
  },
  subscriptions: () => [
    HtmlSubscription.onMediaQuery(
      SIDEBAR_MOBILE_QUERY,
      (matches) => SidebarProviderMessage.ChangedViewport({ isMobile: matches })
    ),
    HtmlSubscription.onDocument(
      "keydown",
      ({ key, meta, ctrl }) =>
        key === SIDEBAR_KEYBOARD_SHORTCUT && (meta || ctrl)
          ? SidebarProviderMessage.Toggled()
          : undefined,
      { preventDefault: true }
    )
  ],
  parts: (p, model) => {
    const value = sharedValue(model, p.props)
    return {
      ...value,
      wrapper: p.part("div", (b) =>
        b
          .attrs({
            "data-slot": "sidebar-wrapper",
            style: `--sidebar-width: ${SIDEBAR_WIDTH}; --sidebar-width-icon: ${SIDEBAR_WIDTH_ICON}`
          })
          .class(SIDEBAR_WRAPPER_CLASS)
      ),
      toggle: p.part("button", (b) =>
        b.on("click", SidebarProviderMessage.Toggled())
      )
    }
  }
})

/** What a `SidebarProvider`'s `view` gets: the shared values plus the `wrapper` and `toggle` parts. */
export type SidebarProviderParts = Component.Headless.Parts<
  typeof SidebarProvider
>

// ---------------------------------------------------------------------------
// SidebarMobile — internal: owns the Sheet for the mobile branch
// ---------------------------------------------------------------------------

const SidebarMobileMessage = UiSchema.TaggedEnum({
  ClosedSheet: {}
})

const SidebarMobileProps = Schema.Struct({
  side: Schema.optional(Schema.Literals(["left", "right"]))
})

/**
 * Internal (not an upstream export): upstream's `Sidebar` renders a Sheet
 * wired straight into the context (`open={openMobile}`,
 * `onOpenChange={setOpenMobile}`). Here this Component reads the provider,
 * owns the kit Dialog with this repo's Sheet styling, and its `update`
 * forwards the Dialog's close requests to the provider via `$.send`.
 */
const SidebarMobile = Html.component({
  name: "SidebarMobile",
  props: SidebarMobileProps,
  model: Schema.Struct({}),
  message: SidebarMobileMessage,
  reads: { sidebar: SidebarProvider }
}).make({
  init: () => ({}),
  update: {
    ClosedSheet: ($) =>
      $.send(
        SidebarProvider,
        SidebarProviderMessage.SetOpenMobile({ open: false })
      )
  },
  parts: (p) => {
    const side = p.props.side ?? "left"
    return p.child(KitDialog, {
      props: { open: p.reads.sidebar.openMobile },
      onEmit: {
        RequestedOpen: () => undefined,
        RequestedClose: () => SidebarMobileMessage.ClosedSheet(),
        Settled: () => undefined
      },
      parts: (dialog: Component.Headless.Parts<typeof KitDialog>) => ({
        ...dialog,
        trigger: <B extends View.PartTarget<"button">>(element: B) =>
          dialog.trigger(element.attr("data-slot", "sheet-trigger")),
        portal: <B extends View.PartTarget<"dialog">>(element: B) =>
          dialog.portal(element.attr("data-slot", "sheet-portal")),
        backdrop: <B extends View.PartTarget<"div">>(element: B) =>
          dialog.backdrop(
            element
              .attr("data-slot", "sheet-overlay")
              .class(SHEET_OVERLAY_CLASS)
          ),
        popup: <B extends View.PartTarget<"div">>(element: B) =>
          dialog.popup(
            element
              .attr("data-slot", "sheet-content")
              .class(
                cn(
                  SHEET_CONTENT_BASE_CLASS,
                  SHEET_CONTENT_SIDE_CLASSES[side]
                )
              )
          ),
        title: <
          B extends View.PartTarget<"h1" | "h2" | "h3" | "h4" | "h5" | "h6">
        >(element: B) =>
          dialog.title(
            element.attr("data-slot", "sheet-title").class(SHEET_TITLE_CLASS)
          ),
        description: <B extends View.PartTarget<"p">>(element: B) =>
          dialog.description(
            element
              .attr("data-slot", "sheet-description")
              .class(SHEET_DESCRIPTION_CLASS)
          ),
        close: <B extends View.PartTarget<"button">>(element: B) =>
          dialog.close(element.attr("data-slot", "sheet-close"))
      })
    })
  }
})

type SidebarMobileParts = Component.Headless.Parts<typeof SidebarMobile>

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

/**
 * The sidebar itself. Takes the provider's parts (upstream read them from
 * context), the consumer's `h`, upstream's options (`side` / `variant` /
 * `collapsible`, same defaults; `class` lands on the desktop container,
 * where upstream spreads its props) and the children, which it places
 * inside the inner container — or, on mobile, inside the Sheet.
 */
export const Sidebar = <Msg, R = never>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: {
    readonly side?: SidebarSide | undefined
    readonly variant?: SidebarVariant | undefined
    readonly collapsible?: SidebarCollapsible | undefined
    readonly class?: string | undefined
  },
  children: View.Content<Msg, R>
): View.Content<Msg, R | Component.Shared.Of<typeof SidebarProvider>> => {
  const side = options.side ?? "left"
  const variant = options.variant ?? "sidebar"
  const collapsible = options.collapsible ?? "offcanvas"

  if (collapsible === "none") {
    return h.div
      .attr("data-slot", "sidebar")
      .class(cn(SIDEBAR_NONE_CLASS, options.class))
      .children(children)
  }

  if (sidebar.isMobile) {
    return SidebarMobile(h, {
      props: { side },
      view: (sheet: SidebarMobileParts) =>
        sheet.portal(h.dialog)?.children(
          sheet.backdrop(h.div),
          sheet
            .popup(h.div)
            .attrs({
              "data-sidebar": "sidebar",
              "data-slot": "sidebar",
              "data-mobile": "true",
              style: `--sidebar-width: ${SIDEBAR_WIDTH_MOBILE}`
            })
            .class(SIDEBAR_MOBILE_CONTENT_CLASS)
            .children(
              SheetHeader(h, { class: "sr-only" }).children(
                sheet.title(h.h2).children("Sidebar"),
                sheet.description(h.p).children(
                  "Displays the mobile sidebar."
                )
              ),
              h.div.class("flex h-full w-full flex-col").children(children)
            )
        )
    })
  }

  return h.div
    .class(SIDEBAR_ROOT_CLASS)
    .attrs({
      "data-state": sidebar.state,
      "data-collapsible": sidebar.state === "collapsed" ? collapsible : "",
      "data-variant": variant,
      "data-side": side,
      "data-slot": "sidebar"
    })
    .children(
      h.div
        .attr("data-slot", "sidebar-gap")
        .class(
          cn(
            SIDEBAR_GAP_BASE_CLASS,
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
              : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
          )
        ),
      h.div
        .attr("data-slot", "sidebar-container")
        .class(
          cn(
            SIDEBAR_CONTAINER_BASE_CLASS,
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
              : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
            options.class
          )
        )
        .children(
          h.div
            .attrs({ "data-sidebar": "sidebar", "data-slot": "sidebar-inner" })
            .class(SIDEBAR_INNER_CLASS)
            .children(children)
        )
    )
}

// ---------------------------------------------------------------------------
// Trigger / Rail / Inset
// ---------------------------------------------------------------------------

/**
 * Upstream's ghost icon Button wired to `toggleSidebar`. Here it is the
 * provider's `toggle` part (the click sends the provider's `Toggled`)
 * wearing this repo's Button classes — upstream renders
 * `data-slot="sidebar-trigger"` over the Button's own slot, and
 * `data-variant="ghost"` / `data-size="icon"` alongside.
 */
export const SidebarTrigger = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  sidebar
    .toggle(h.button)
    .attrs({
      "data-sidebar": "trigger",
      "data-slot": "sidebar-trigger",
      "data-variant": "ghost",
      "data-size": "icon"
    })
    .class(
      cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "size-7",
        options.class
      )
    )
    .children(
      PanelLeftIcon(h),
      h.span.class("sr-only").children("Toggle Sidebar")
    )

/** The desktop edge rail: a <button> wearing the provider's `toggle` part. */
export const SidebarRail = <Msg>(
  sidebar: SidebarProviderParts,
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  sidebar
    .toggle(h.button)
    .attrs({
      "data-sidebar": "rail",
      "data-slot": "sidebar-rail",
      "aria-label": "Toggle Sidebar",
      title: "Toggle Sidebar",
      tabindex: "-1"
    })
    .class(cn(SIDEBAR_RAIL_CLASS, options.class))

/** The page column next to the sidebar: a plain <main>, as upstream. */
export const SidebarInset = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.main
    .attr("data-slot", "sidebar-inset")
    .class(cn(SIDEBAR_INSET_CLASS, options.class))

// ---------------------------------------------------------------------------
// Input / Header / Footer / Separator / Content
// ---------------------------------------------------------------------------

/**
 * This repo's `Input` with upstream's sidebar overrides. Controlled, as
 * every kit Input (D-7): pass `props` (with `value`) and `onUpdate`,
 * exactly as for `Input`.
 */
export const SidebarInput = <Msg, R = never>(
  h: { readonly input: InputElement<Msg> },
  options: {
    readonly element?: InputElement<Msg, R> | undefined
    readonly props: InputProps
    readonly onUpdate?:
      | ((event: { readonly value: string }) => NoInfer<Msg> | undefined)
      | undefined
    readonly type?: string | undefined
    readonly class?: string | undefined
  }
) =>
  Input(h, {
    element: options.element,
    props: options.props,
    onUpdate: options.onUpdate,
    type: options.type,
    class: cn(SIDEBAR_INPUT_CLASS, options.class)
  })
    .attr("data-slot", "sidebar-input")
    .attr("data-sidebar", "input")

export const SidebarHeader = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.div
    .attrs({ "data-slot": "sidebar-header", "data-sidebar": "header" })
    .class(cn(SIDEBAR_HEADER_CLASS, options.class))

export const SidebarFooter = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.div
    .attrs({ "data-slot": "sidebar-footer", "data-sidebar": "footer" })
    .class(cn(SIDEBAR_FOOTER_CLASS, options.class))

/** This repo's `Separator` with upstream's sidebar overrides. */
export const SidebarSeparator = <Msg, R = never>(
  h: { readonly div: SeparatorElement<Msg> },
  options: {
    readonly element?: SeparatorElement<Msg, R> | undefined
    readonly class?: string | undefined
  } = {}
) =>
  Separator(h, {
    element: options.element,
    class: cn(SIDEBAR_SEPARATOR_CLASS, options.class)
  })
    .attr("data-slot", "sidebar-separator")
    .attr("data-sidebar", "separator")

export const SidebarContent = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.div
    .attrs({ "data-slot": "sidebar-content", "data-sidebar": "content" })
    .class(cn(SIDEBAR_CONTENT_CLASS, options.class))

// ---------------------------------------------------------------------------
// Group pieces
// ---------------------------------------------------------------------------

export const SidebarGroup = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.div
    .attrs({ "data-slot": "sidebar-group", "data-sidebar": "group" })
    .class(cn(SIDEBAR_GROUP_CLASS, options.class))

/** Always a <div>: upstream's `asChild` (Slot) does not exist here (D-2). */
export const SidebarGroupLabel = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.div
    .attrs({
      "data-slot": "sidebar-group-label",
      "data-sidebar": "group-label"
    })
    .class(cn(SIDEBAR_GROUP_LABEL_CLASS, options.class))

/**
 * Always a <button> (D-2). Upstream spreads DOM props; here the press is
 * the caller's own message via `onPress`.
 */
export const SidebarGroupAction = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly onPress?: Msg | undefined
    readonly class?: string | undefined
  } = {}
) => {
  const button = h.button
    .attrs({
      "data-slot": "sidebar-group-action",
      "data-sidebar": "group-action"
    })
    .class(cn(SIDEBAR_GROUP_ACTION_CLASS, options.class))
  return options.onPress !== undefined
    ? button.on("click", options.onPress)
    : button
}

export const SidebarGroupContent = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.div
    .attrs({
      "data-slot": "sidebar-group-content",
      "data-sidebar": "group-content"
    })
    .class(cn(SIDEBAR_GROUP_CONTENT_CLASS, options.class))

// ---------------------------------------------------------------------------
// Menu pieces
// ---------------------------------------------------------------------------

export const SidebarMenu = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.ul
    .attrs({ "data-slot": "sidebar-menu", "data-sidebar": "menu" })
    .class(cn(SIDEBAR_MENU_CLASS, options.class))

export const SidebarMenuItem = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.li
    .attrs({ "data-slot": "sidebar-menu-item", "data-sidebar": "menu-item" })
    .class(cn(SIDEBAR_MENU_ITEM_CLASS, options.class))

export type SidebarMenuButtonVariant = "default" | "outline"
export type SidebarMenuButtonSize = "default" | "sm" | "lg"

const SIDEBAR_MENU_BUTTON_BASE_CLASS =
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0"

const SIDEBAR_MENU_BUTTON_VARIANTS: Record<SidebarMenuButtonVariant, string> = {
  default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  outline:
    "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]"
}

const SIDEBAR_MENU_BUTTON_SIZES: Record<SidebarMenuButtonSize, string> = {
  default: "h-8 text-sm",
  sm: "h-7 text-xs",
  lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!"
}

/** Upstream name kept: `sidebarMenuButtonVariants({ variant, size })`; here a pure function, not cva. */
export const sidebarMenuButtonVariants = (
  options: {
    readonly variant?: SidebarMenuButtonVariant | undefined
    readonly size?: SidebarMenuButtonSize | undefined
    readonly class?: string | undefined
  } = {}
): string =>
  cn(
    SIDEBAR_MENU_BUTTON_BASE_CLASS,
    SIDEBAR_MENU_BUTTON_VARIANTS[options.variant ?? "default"],
    SIDEBAR_MENU_BUTTON_SIZES[options.size ?? "default"],
    options.class
  )

/**
 * A menu row button: always a <button> (D-2), `data-active` written from
 * `isActive` as upstream writes it, the press the caller's own message via
 * `onPress`. The upstream `tooltip` prop is NOT reproduced — see the file
 * header, item 4.
 */
export const SidebarMenuButton = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly variant?: SidebarMenuButtonVariant | undefined
    readonly size?: SidebarMenuButtonSize | undefined
    readonly isActive?: boolean | undefined
    readonly onPress?: Msg | undefined
    readonly class?: string | undefined
  } = {}
) => {
  const button = h.button
    .attrs({
      "data-slot": "sidebar-menu-button",
      "data-sidebar": "menu-button",
      "data-size": options.size ?? "default",
      "data-active": String(options.isActive ?? false)
    })
    .class(
      sidebarMenuButtonVariants({
        variant: options.variant,
        size: options.size,
        class: options.class
      })
    )
  return options.onPress !== undefined
    ? button.on("click", options.onPress)
    : button
}

/** Always a <button> (D-2); the press is the caller's message via `onPress`. */
export const SidebarMenuAction = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly showOnHover?: boolean | undefined
    readonly onPress?: Msg | undefined
    readonly class?: string | undefined
  } = {}
) => {
  const button = h.button
    .attrs({
      "data-slot": "sidebar-menu-action",
      "data-sidebar": "menu-action"
    })
    .class(
      cn(
        SIDEBAR_MENU_ACTION_CLASS,
        options.showOnHover
          ? SIDEBAR_MENU_ACTION_SHOW_ON_HOVER_CLASS
          : undefined,
        options.class
      )
    )
  return options.onPress !== undefined
    ? button.on("click", options.onPress)
    : button
}

export const SidebarMenuBadge = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.div
    .attrs({ "data-slot": "sidebar-menu-badge", "data-sidebar": "menu-badge" })
    .class(cn(SIDEBAR_MENU_BADGE_CLASS, options.class))

/**
 * A loading row: this repo's `Skeleton`s inside upstream's row div. The
 * text skeleton's width is the `width` option (upstream randomizes it —
 * header, item 9), written to `--skeleton-width` as upstream writes it.
 */
export const SidebarMenuSkeleton = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly showIcon?: boolean | undefined
    readonly width?: string | undefined
    readonly class?: string | undefined
  } = {}
) =>
  h.div
    .attrs({
      "data-slot": "sidebar-menu-skeleton",
      "data-sidebar": "menu-skeleton"
    })
    .class(cn(SIDEBAR_MENU_SKELETON_CLASS, options.class))
    .children(
      options.showIcon === true
        ? Skeleton(h, { class: "size-4 rounded-md" }).attr(
          "data-sidebar",
          "menu-skeleton-icon"
        )
        : undefined,
      Skeleton(h, { class: "h-4 max-w-(--skeleton-width) flex-1" })
        .attr("data-sidebar", "menu-skeleton-text")
        .attr("style", `--skeleton-width: ${options.width ?? "70%"}`)
    )

export const SidebarMenuSub = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.ul
    .attrs({ "data-slot": "sidebar-menu-sub", "data-sidebar": "menu-sub" })
    .class(cn(SIDEBAR_MENU_SUB_CLASS, options.class))

export const SidebarMenuSubItem = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.li
    .attrs({
      "data-slot": "sidebar-menu-sub-item",
      "data-sidebar": "menu-sub-item"
    })
    .class(cn(SIDEBAR_MENU_SUB_ITEM_CLASS, options.class))

export type SidebarMenuSubButtonSize = "sm" | "md"

/**
 * A sub-menu row link: always an <a> (D-2). `href` is written when given;
 * the press is the caller's message via `onPress`.
 */
export const SidebarMenuSubButton = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly size?: SidebarMenuSubButtonSize | undefined
    readonly isActive?: boolean | undefined
    readonly href?: string | undefined
    readonly onPress?: Msg | undefined
    readonly class?: string | undefined
  } = {}
) => {
  const size = options.size ?? "md"
  const anchor = h.a
    .attrs({
      "data-slot": "sidebar-menu-sub-button",
      "data-sidebar": "menu-sub-button",
      "data-size": size,
      "data-active": String(options.isActive ?? false)
    })
    .class(
      cn(
        SIDEBAR_MENU_SUB_BUTTON_BASE_CLASS,
        size === "sm" ? "text-xs" : "text-sm",
        options.class
      )
    )
  const withHref = options.href !== undefined
    ? anchor.attr("href", options.href)
    : anchor
  return options.onPress !== undefined
    ? withHref.on("click", options.onPress)
    : withHref
}
