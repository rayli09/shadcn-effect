/**
 * MessageScroller (bases generation) — shadcn/ui `message-scroller`
 * ported to Effect UI.
 *
 * Same Effect port as `registry/ui/message-scroller.ts`: upstream wraps
 * `@shadcn/react/message-scroller` (a React package: context Provider,
 * scroll-anchoring / autoscroll engine, and hooks), which has no meaning in
 * Effect UI, so the port covers the rendered anatomy only — the five DOM
 * parts below are pure view functions with upstream's data-slots. Only the
 * class layer changes: class strings are byte-for-byte the shadcn
 * bases/radix strings — structural inline classes plus `cn-*` hook classes
 * whose utilities are supplied by the style presets. The parity checker
 * asserts every token in `parity/bases-tokens.json["message-scroller"]`.
 *
 * NOT reproduced (declared, not silent):
 * - The scroll engine: autoscroll-on-append, scroll anchoring, and the
 *   runtime-written `data-autoscrolling` / `data-pending-scroll` attributes
 *   the Viewport classes key off. Those attributes only appear once an
 *   Effect Component owns the scroll state (Model + scroll Subscription);
 *   that component is future work, not faked here.
 * - `MessageScrollerProvider` and the three hooks are not exported: there
 *   is no context to provide and no hook to call. Shared scroll state in
 *   Effect UI is a Provider Component / Component state, per
 *   docs/PORTING-RULES.md.
 * - `MessageScrollerItem`'s `scrollAnchor` option is accepted for source
 *   compatibility but has no DOM effect without the engine (upstream writes
 *   no attribute for it either — it is engine bookkeeping).
 * - `MessageScrollerButton`'s `data-active` is consumer-written via the
 *   `active` option (upstream's primitive computes it from scroll
 *   position); the `data-[active=…]` class variants are verbatim, so a
 *   consumer that tracks scrollability gets upstream's exact show/hide
 *   transitions. The button itself is this generation's `Button` port with
 *   `data-slot` chained over it — upstream's `render` prop composition
 *   (D-2) becomes the `element` option.
 */
import type * as Html from "@effect/ui/html/Html";
import { Html as HtmlNs } from "@effect/ui/html";
import type * as View from "@effect/ui/View";
import { ArrowDownIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button, type ButtonSize, type ButtonVariant } from "./button.ts";

type Div<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

export const MESSAGE_SCROLLER_CLASS =
  "cn-message-scroller group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden";

export const MESSAGE_SCROLLER_VIEWPORT_CLASS =
  "cn-message-scroller-viewport size-full min-h-0 min-w-0 scroll-fade-b scrollbar-thin scrollbar-gutter-stable overflow-y-auto overscroll-contain contain-content data-autoscrolling:scrollbar-thumb-transparent data-autoscrolling:scrollbar-track-transparent data-pending-scroll:invisible";

export const MESSAGE_SCROLLER_CONTENT_CLASS =
  "cn-message-scroller-content flex h-max min-h-full flex-col";

export const MESSAGE_SCROLLER_ITEM_CLASS =
  "cn-message-scroller-item min-w-0 shrink-0 [contain-intrinsic-size:auto_10rem] [content-visibility:auto]";

export const MESSAGE_SCROLLER_BUTTON_CLASS =
  "cn-message-scroller-button absolute inset-s-1/2 -translate-x-1/2 border-border bg-background text-foreground transition-[translate,scale,opacity] duration-200 hover:bg-muted hover:text-foreground data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-400 data-[active=false]:ease-[cubic-bezier(0.7,0,0.84,0)] data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 data-[active=true]:ease-[cubic-bezier(0.23,1,0.32,1)] data-[direction=end]:bottom-4 data-[direction=end]:data-[active=false]:translate-y-full data-[direction=start]:top-4 data-[direction=start]:data-[active=false]:-translate-y-full rtl:translate-x-1/2 data-[direction=start]:[&_svg]:rotate-180";

export type MessageScrollerDirection = "start" | "end";

export const MessageScroller = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "message-scroller").class(cn(MESSAGE_SCROLLER_CLASS, options.class));

export const MessageScrollerViewport = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.div
    .attr("data-slot", "message-scroller-viewport")
    .class(cn(MESSAGE_SCROLLER_VIEWPORT_CLASS, options.class));

export const MessageScrollerContent = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.div
    .attr("data-slot", "message-scroller-content")
    .class(cn(MESSAGE_SCROLLER_CONTENT_CLASS, options.class));

export const MessageScrollerItem = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: {
    /** Accepted for source compatibility; engine bookkeeping only — see header. */
    readonly scrollAnchor?: boolean | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  h.div
    .attr("data-slot", "message-scroller-item")
    .class(cn(MESSAGE_SCROLLER_ITEM_CLASS, options.class));

/**
 * The scroll-to-start/end button. Defaults mirror upstream: direction "end",
 * variant "secondary", size "icon-sm", and — when no `children` option is
 * given — the ArrowDown icon (inline SVG from `registry/lib/icons.ts`;
 * lucide-react is banned) plus an sr-only label ("Scroll to end" /
 * "Scroll to start"). Pass `active` to write `data-active`, which drives
 * upstream's show/hide transitions.
 */
export const MessageScrollerButton = <Msg, C extends View.Children<Msg> = View.Children<Msg>>(
  h: HtmlNs.H<Msg>,
  options: {
    readonly direction?: MessageScrollerDirection | undefined;
    readonly variant?: ButtonVariant | undefined;
    readonly size?: ButtonSize | undefined;
    readonly active?: boolean | undefined;
    readonly onPress?: Msg | undefined;
    readonly class?: string | undefined;
    readonly children?: C | undefined;
  } = {},
) => {
  const direction = options.direction ?? "end";
  const button = Button(h, {
    onPress: options.onPress,
    variant: options.variant ?? "secondary",
    size: options.size ?? "icon-sm",
    class: cn(MESSAGE_SCROLLER_BUTTON_CLASS, options.class),
  })
    .attr("data-slot", "message-scroller-button")
    .attr("data-direction", direction);
  const withActive =
    options.active !== undefined ? button.attr("data-active", String(options.active)) : button;
  return options.children !== undefined
    ? withActive.children(options.children)
    : withActive.children(
        ArrowDownIcon(h),
        h.span.class("sr-only").children(direction === "end" ? "Scroll to end" : "Scroll to start"),
      );
};
