/**
 * Drawer (bases generation) — shadcn/ui `drawer` ported 1:1 to Effect UI.
 *
 * Same Effect port as `registry/ui/drawer.ts` (the @effect/ui-kit
 * `Drawer` headless component — a Dialog that adds swipe dismissal and
 * snap points; consumer-owned `open` / `snapPoint`); only the class
 * layer changes: class strings are byte-for-byte the shadcn
 * bases/radix strings — structural inline classes plus `cn-*` hook
 * classes whose utilities are supplied by the style presets. The
 * parity checker asserts every token in
 * `parity/bases-tokens.json["drawer"]`.
 *
 * Anatomy diff vs the new-york generation: no new parts. Two shape
 * changes in the class layer:
 * - The content is ONE class string for all directions (upstream bases
 *   carries every `data-[vaul-drawer-direction=…]` block at once and
 *   lets vaul's attribute pick), where the new-york port selected a
 *   per-direction block from `props.swipeDirection`. The sizing,
 *   border and background utilities moved into the presets'
 *   `.cn-drawer-content` rule.
 * - The handle shrank to its hook plus layout classes
 *   (`cn-drawer-handle mx-auto hidden shrink-0 …`); its bar styling
 *   (size, radius, color, top margin) moved into the preset. As
 *   upstream, the handle div carries no `data-slot`.
 *
 * The `data-[vaul-drawer-direction=…]` selectors key on vaul's
 * attribute, so — same D-5 bridge family as separator's
 * `data-horizontal`/`data-vertical` stamps — the popup applier below
 * stamps `data-vaul-drawer-direction` mapped from
 * `props.swipeDirection` (down→bottom, up→top, left/right unchanged,
 * default down→bottom), which makes the content's per-direction blocks
 * and the handle's/header's `group-data-[vaul-drawer-direction=…]`
 * tokens live under the kit. Nothing in bases drawer is unported.
 */
import type * as Component from "@effect/ui/Component";
import type * as View from "@effect/ui/View";
import type { Html } from "@effect/ui/html";
import { Drawer as KitDrawer, type DrawerEvents, type DrawerProps } from "@effect/ui-kit";
import { cn } from "@/lib/utils";

/** What a `Drawer`'s `view` gets: the kit Drawer's parts and plain values. */
export type DrawerParts = Component.Headless.Parts<typeof KitDrawer>;

export const DRAWER_OVERLAY_CLASS =
  "cn-drawer-overlay fixed inset-0 z-50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0";

/** Kit swipe direction → vaul drawer direction (where the drawer sits). */
const VAUL_DIRECTION = { up: "top", down: "bottom", left: "left", right: "right" } as const;

export const DRAWER_CONTENT_CLASS =
  "cn-drawer-content group/drawer-content fixed z-50 data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm";

export const DRAWER_HANDLE_CLASS =
  "cn-drawer-handle mx-auto hidden shrink-0 group-data-[vaul-drawer-direction=bottom]/drawer-content:block";

export const DRAWER_HEADER_CLASS =
  "cn-drawer-header flex flex-col group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center";

export const DRAWER_FOOTER_CLASS = "cn-drawer-footer mt-auto flex flex-col";

export const DRAWER_TITLE_CLASS = "cn-drawer-title cn-font-heading";

export const DRAWER_DESCRIPTION_CLASS = "cn-drawer-description";

/** The grab handle upstream renders inside DrawerContent. */
export const DrawerHandle = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => h.div.class(cn(DRAWER_HANDLE_CLASS, options.class));

/**
 * A shadcn-styled Drawer. Call it like the kit's `Drawer`; direction
 * follows `props.swipeDirection` (default `"down"` = a bottom drawer,
 * upstream's default) for behavior, while the popup's class string is
 * the single bases string for every direction:
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
              .attr(
                "data-vaul-drawer-direction",
                VAUL_DIRECTION[options.props?.swipeDirection ?? "down"],
              )
              .class(cn(DRAWER_CONTENT_CLASS, options.contentClass)),
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
