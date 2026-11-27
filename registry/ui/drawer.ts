/**
 * Drawer — shadcn/ui `drawer` ported 1:1 to Effect UI.
 *
 * Upstream: React + vaul. Here: the @effect/ui-kit `Drawer` headless
 * component — a Dialog that adds swipe dismissal and snap points. The
 * consumer owns `open` (and `snapPoint`, when used) in their Model and
 * stores what `RequestedOpen` / `RequestedClose` / `Snapped` ask for.
 *
 * Upstream export → this port:
 * - `Drawer`            → `Drawer` (below; styled kit Drawer)
 * - `DrawerTrigger`     → `parts.trigger`
 * - `DrawerPortal`      → `parts.portal`
 * - `DrawerClose`       → `parts.close`
 * - `DrawerOverlay`     → `parts.backdrop`
 * - `DrawerContent`     → `parts.popup` (inside `parts.portal`; the kit
 *                         adds `parts.viewport` and `parts.content`, and
 *                         `parts.handle` is the grab handle upstream
 *                         renders inside the content)
 * - `DrawerHeader`      → `DrawerHeader` (plain view function, below)
 * - `DrawerFooter`      → `DrawerFooter` (plain view function, below)
 * - `DrawerTitle`       → `parts.title`
 * - `DrawerDescription` → `parts.description`
 *
 * Direction: upstream's vaul `direction` prop ("top" | "bottom" | "left"
 * | "right") is the kit's `swipeDirection` prop ("up" | "down" | "left"
 * | "right") — the styled popup picks its class block from it
 * (down → bottom, up → top, left/right unchanged).
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings,
 * including the `data-[vaul-drawer-direction=…]` selectors. Those
 * selectors keyed on vaul's attribute: the kit popup carries
 * `data-swipe-direction` instead, so the direction blocks are kept
 * verbatim for parity but their variant conditions never match under
 * the kit — position the popup for the drawer's direction in your own
 * CSS (the kit styles a swipe from `--drawer-swipe-movement-x/y` and
 * `--drawer-swipe-progress`). The same applies to the handle's and
 * header's `group-data-[vaul-drawer-direction=…]` tokens.
 */
import type * as Component from "@effect/ui/Component";
import type * as View from "@effect/ui/View";
import type { Html } from "@effect/ui/html";
import { Drawer as KitDrawer, type DrawerEvents, type DrawerProps } from "@effect/ui-kit";
import { cn } from "@/lib/utils";

/** What a `Drawer`'s `view` gets: the kit Drawer's parts and plain values. */
export type DrawerParts = Component.Headless.Parts<typeof KitDrawer>;

export const DRAWER_OVERLAY_CLASS =
  "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0";

export const DRAWER_CONTENT_BASE_CLASS =
  "group/drawer-content fixed z-50 flex h-auto flex-col bg-background";

export const DRAWER_CONTENT_DIRECTION_CLASSES = {
  top: "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
  bottom:
    "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
  right:
    "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
  left: "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
} as const;

export const DRAWER_HANDLE_CLASS =
  "mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block";

export const DRAWER_HEADER_CLASS =
  "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left";

export const DRAWER_FOOTER_CLASS = "mt-auto flex flex-col gap-2 p-4";

export const DRAWER_TITLE_CLASS = "font-semibold text-foreground";

export const DRAWER_DESCRIPTION_CLASS = "text-sm text-muted-foreground";

/** The grab handle upstream renders inside DrawerContent. */
export const DrawerHandle = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => h.div.class(cn(DRAWER_HANDLE_CLASS, options.class));

/**
 * A shadcn-styled Drawer. Call it like the kit's `Drawer`; the direction
 * class block follows `props.swipeDirection` (default `"down"` = a
 * bottom drawer, upstream's default):
 *
 *   Drawer(h, {
 *     props: { open: model.open },
 *     onEmit: {
 *       RequestedOpen: () => Msg.RequestedOpen(),
 *       RequestedClose: () => Msg.RequestedClose(),
 *       Settled: () => undefined,
 *       Snapped: () => undefined
 *     },
 *     view: (drawer) =>
 *       h.div(
 *         drawer.trigger(h.button).children("Open"),
 *         drawer.portal(h.dialog)?.children(
 *           drawer.backdrop(h.div),
 *           drawer.viewport(h.div).children(
 *             drawer.popup(h.div).children(
 *               drawer.handle(h),
 *               drawer.title(h.h2).children("Title"),
 *               drawer.description(h.p).children("Description")
 *             )
 *           )
 *         )
 *       )
 *   })
 *
 * The parts also carry the kit's own additions, passed through untouched:
 * `content`, `swipeArea`, `snapTrigger`, `snapStatus`, and the plain
 * values (`open`, `swiping`, `swipeDirection`, `expanded`, …).
 */
export const Drawer = <Msg, RV = never, RF = never>(
  h: View.Helper<Msg, unknown>,
  options: View.Child.Options<DrawerProps, DrawerEvents, NoInfer<Msg>> & {
    /** The drawer's whole view, from its styled parts. */
    readonly view: (
      parts: DrawerParts & {
        /** The grab handle upstream renders at the top of the content. */
        readonly handle: (
          h: Html.H<Msg>,
        ) => Html.Element<Msg, never, Html.EventsOf<"div">, HTMLDivElement, "div">;
      },
    ) => View.Content<NoInfer<Msg>, RV>;
    /** Extra classes, appended like upstream's `className` on each part. */
    readonly overlayClass?: string | undefined;
    readonly contentClass?: string | undefined;
    readonly titleClass?: string | undefined;
    readonly descriptionClass?: string | undefined;
  },
): ReturnType<typeof KitDrawer<Msg, RV, RF>> =>
  KitDrawer<Msg, RV, RF>(h, {
    key: options.key,
    props: options.props,
    onEmit: options.onEmit,
    onFailure: options.onFailure,
    view: (drawer) =>
      options.view({
        ...drawer,
        handle: (hh) => DrawerHandle(hh),
        trigger: (element) => drawer.trigger(element.attr("data-slot", "drawer-trigger")),
        portal: (element) => drawer.portal(element.attr("data-slot", "drawer-portal")),
        backdrop: (element) =>
          drawer.backdrop(
            element
              .attr("data-slot", "drawer-overlay")
              .class(cn(DRAWER_OVERLAY_CLASS, options.overlayClass)),
          ),
        popup: (element) =>
          drawer.popup(
            element
              .attr("data-slot", "drawer-content")
              .class(
                cn(
                  DRAWER_CONTENT_BASE_CLASS,
                  DRAWER_CONTENT_DIRECTION_CLASSES[
                    options.props.swipeDirection === "up"
                      ? "top"
                      : options.props.swipeDirection === "left"
                        ? "left"
                        : options.props.swipeDirection === "right"
                          ? "right"
                          : "bottom"
                  ],
                  options.contentClass,
                ),
              ),
          ),
        title: (element) =>
          drawer.title(
            element
              .attr("data-slot", "drawer-title")
              .class(cn(DRAWER_TITLE_CLASS, options.titleClass)),
          ),
        description: (element) =>
          drawer.description(
            element
              .attr("data-slot", "drawer-description")
              .class(cn(DRAWER_DESCRIPTION_CLASS, options.descriptionClass)),
          ),
        close: (element) => drawer.close(element.attr("data-slot", "drawer-close")),
      }),
  });

/** Upstream `DrawerHeader`: a plain flex div, no kit part owns it. */
export const DrawerHeader = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "drawer-header").class(cn(DRAWER_HEADER_CLASS, options.class));

/** Upstream `DrawerFooter`: a plain flex div, no kit part owns it. */
export const DrawerFooter = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "drawer-footer").class(cn(DRAWER_FOOTER_CLASS, options.class));
