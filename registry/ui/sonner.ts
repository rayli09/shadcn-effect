/**
 * Sonner — shadcn/ui `sonner` ported 1:1 to Effect UI.
 *
 * Upstream: a styled wrapper over the `sonner` package's `Toaster`, with the
 * theme read from `next-themes`. Both packages are BANNED here, so the engine
 * is the @effect/ui-kit `ToastProvider`: a headless Component that owns the
 * toast list, the timers, the stacking variables, the ARIA and the F6 focus
 * behavior, and lets the consumer draw the markup. This module exports:
 *
 * - `Toaster` — the kit `ToastProvider` with shadcn's styling applied: the
 *   viewport carries upstream's `className="toaster group"` and its four CSS
 *   variables (`--normal-bg`, `--normal-text`, `--normal-border`,
 *   `--border-radius`) as an inline style, exactly where upstream puts them,
 *   plus the popover-box reset the kit's docs prescribe for its viewport.
 *   The app body goes in the `view` option; every Component drawn there can
 *   post toasts. Following the kit's own example, the body and the viewport
 *   are wrapped in one plain `h.div` (a view closure returns a single node;
 *   upstream renders its children unwrapped — declared divergence).
 * - `toast` / `toastSuccess` / `toastInfo` / `toastWarning` / `toastError` /
 *   `toastLoading` / `toastUpdate` / `toastClose` — builders for the three
 *   requests a sender may post to the provider. There is no imperative
 *   global `toast()` in Effect UI: an `update` below the `Toaster` sends a
 *   request with `$.send(ToastProvider, toast("Saved"))`, and code outside
 *   the tree reaches the app through a Command result, whose `update` sends
 *   the same way (the kit supports no other route — declared divergence).
 *   The loading → done flow is upstream's: post `toastLoading("Saving…")`,
 *   keep its `toast.id`, then `toastUpdate(id, { type: "success", … })`.
 *
 * Icons are inline SVG builders from lucide path data (ISC), never
 * lucide-react: success → CircleCheck, info → Info, warning → TriangleAlert,
 * error → OctagonX, loading → LoaderCircle, each with upstream's exact class
 * (`size-4`, loading `size-4 animate-spin`). An untyped toast gets no icon,
 * as upstream. The close button's X is lucide's `x`.
 *
 * Declared divergences (not hidden):
 *
 * - **Theme**: upstream defaults to `theme="system"`, resolved by
 *   next-themes against the OS. There is no next-themes here and this port
 *   runs no theme detection: the `theme` option is accepted and stamped as
 *   `data-theme` on the viewport, but the colors always come from
 *   `registry/styles/theme.css`, whose `.dark` block flips the very
 *   variables the toasts consume (`--popover`, `--border`, …) — so toasts
 *   follow the app theme the shadcn way, through CSS, not through sonner.
 * - **Toast box styling**: upstream's toast internals are styled by the
 *   sonner package's own CSS, which is not part of the shadcn file and not
 *   portable. The box is reproduced with Tailwind utilities consuming the
 *   same CSS variables (`bg-(--normal-bg)` etc.). Sonner's collapsed
 *   peek-stack expansion look is likewise its own CSS and is NOT
 *   reproduced: toasts render as a simple column. The kit exposes
 *   `data-expanded` / `data-behind` and the `--toast-*` variables on every
 *   root for consumers who want to build the stack look themselves.
 * - **Action / cancel buttons**: sonner's per-toast `action` / `cancel`
 *   options have no counterpart — the kit's `ToastData` carries only
 *   `id / title / description / type / timeout / priority`. (The kit has an
 *   `action` part, but this Toaster renders from `ToastData`, so it is not
 *   drawn.) `toast.promise` likewise has no helper; the loading → update
 *   flow above is the pattern.
 * - **Dismiss-all**: `toastClose(id)` closes one toast; the kit has no
 *   close-all request, so upstream's bare `toast.dismiss()` is not offered.
 * - **Hotkey**: sonner refocuses its region with alt+T; the kit uses F6.
 * - **Auto ids**: when no `id` is given, one is generated from a module
 *   counter (`toast-1`, `toast-2`, …), mirroring sonner's internal id
 *   generation. Pass an explicit `id` for any toast you later update or
 *   close — or read it back off the returned request's `toast.id`.
 */
import {
  ToastProvider as KitToastProvider,
  type ToastData,
  type ToastItem,
  type ToastProviderEvents,
  type ToastProviderProps,
} from "@effect/ui-kit";
import type * as Component from "@effect/ui/Component";
import type * as View from "@effect/ui/View";
import type { Html } from "@effect/ui/html";
import {
  CircleCheckIcon as SharedCircleCheckIcon,
  InfoIcon as SharedInfoIcon,
  LoaderCircleIcon,
  OctagonXIcon as SharedOctagonXIcon,
  TriangleAlertIcon as SharedTriangleAlertIcon,
  XIcon as SharedXIcon,
} from "../lib/icons.ts";
import { cn } from "../lib/utils.ts";

export type { ToastData, ToastItem, ToastProviderProps };

// ---------------------------------------------------------------------------
// Requests — the three messages a sender may post to the provider, in the
// kit's own shapes (see ToastProvider's `shares.receives`).
// ---------------------------------------------------------------------------

/** `RequestedAdd`: show `toast`. A toast whose `id` already shows is replaced, and its timer restarts. */
export interface ToastAddRequest {
  readonly _tag: "RequestedAdd";
  readonly toast: ToastData;
}

/** `RequestedUpdate`: change the named fields on a toast that shows. A toast that has closed stays closed. */
export interface ToastUpdateRequest {
  readonly _tag: "RequestedUpdate";
  readonly id: string;
  readonly title?: string | undefined;
  readonly description?: string | undefined;
  readonly type?: string | undefined;
  readonly timeout?: number | undefined;
  readonly priority?: "low" | "high" | undefined;
}

/** `RequestedClose`: close the toast `id`. Emits nothing (unlike a user dismissal). */
export interface ToastCloseRequest {
  readonly _tag: "RequestedClose";
  readonly id: string;
}

/** Any request a sender may post with `$.send(ToastProvider, request)`. */
export type ToastRequest = ToastAddRequest | ToastUpdateRequest | ToastCloseRequest;

/** Per-toast options for the `toast*` builders: the kit's `ToastData` fields, plus upstream's `duration` name. */
export interface ToastOptions {
  /** Sender-picked id, so the toast can later be updated or closed. Auto-generated when omitted. */
  readonly id?: string | undefined;
  readonly description?: string | undefined;
  /** Any string; shown as `data-type` and picks the icon for the five known types. `"loading"` never times out. */
  readonly type?: string | undefined;
  /** Milliseconds before the toast closes on its own; the provider's timeout by default, `0` keeps it. */
  readonly timeout?: number | undefined;
  /** Upstream sonner's name for `timeout`; `timeout` wins when both are given. */
  readonly duration?: number | undefined;
  /** `"high"` announces the toast at once, as an alert. `"low"` (default) waits for the screen reader to be idle. */
  readonly priority?: "low" | "high" | undefined;
}

let counter = 0;
const nextId = (): string => `toast-${++counter}`;

const add = (title: string, type: string | undefined, options: ToastOptions): ToastAddRequest => ({
  _tag: "RequestedAdd",
  toast: {
    id: options.id ?? nextId(),
    title,
    description: options.description,
    type: options.type ?? type,
    timeout: options.timeout ?? options.duration,
    priority: options.priority,
  },
});

/** Show a plain toast (no icon). Send it from an `update`: `$.send(ToastProvider, toast("Saved"))`. */
export const toast = (title: string, options: ToastOptions = {}): ToastAddRequest =>
  add(title, undefined, options);

/** Show a success toast (CircleCheck icon). */
export const toastSuccess = (title: string, options: ToastOptions = {}): ToastAddRequest =>
  add(title, "success", options);

/** Show an info toast (Info icon). */
export const toastInfo = (title: string, options: ToastOptions = {}): ToastAddRequest =>
  add(title, "info", options);

/** Show a warning toast (TriangleAlert icon). */
export const toastWarning = (title: string, options: ToastOptions = {}): ToastAddRequest =>
  add(title, "warning", options);

/** Show an error toast (OctagonX icon). */
export const toastError = (title: string, options: ToastOptions = {}): ToastAddRequest =>
  add(title, "error", options);

/** Show a loading toast (spinning LoaderCircle icon). A loading toast never times out; finish it with `toastUpdate`. */
export const toastLoading = (title: string, options: ToastOptions = {}): ToastAddRequest =>
  add(title, "loading", options);

/** Change the named fields on a toast that shows — the second half of the loading → done flow. */
export const toastUpdate = (
  id: string,
  changes: Omit<ToastOptions, "id" | "duration"> & { readonly title?: string | undefined },
): ToastUpdateRequest => ({
  _tag: "RequestedUpdate",
  id,
  title: changes.title,
  description: changes.description,
  type: changes.type,
  timeout: changes.timeout,
  priority: changes.priority,
});

/** Close the toast `id` (upstream's `toast.dismiss(id)`). */
export const toastClose = (id: string): ToastCloseRequest => ({ _tag: "RequestedClose", id });

// ---------------------------------------------------------------------------
// Icons — the shared builders from ../lib/icons.ts (lucide path data, ISC),
// with this file's baked-in classes preserved via `options.class`. The
// shared builders also stamp `aria-hidden="true"` on these decorative
// glyphs (verified by a server-render smoke check: path data, classes and
// every other attribute identical to the previous file-local builders).
// ---------------------------------------------------------------------------

/** Lucide `circle-check` (ISC): circle + check path. */
const CircleCheckIcon = <Msg>(h: Html.H<Msg>) => SharedCircleCheckIcon(h, { class: "size-4" });

/** Lucide `info` (ISC). */
const InfoIcon = <Msg>(h: Html.H<Msg>) => SharedInfoIcon(h, { class: "size-4" });

/** Lucide `triangle-alert` (ISC). */
const TriangleAlertIcon = <Msg>(h: Html.H<Msg>) => SharedTriangleAlertIcon(h, { class: "size-4" });

/** Lucide `octagon-x` (ISC). */
const OctagonXIcon = <Msg>(h: Html.H<Msg>) => SharedOctagonXIcon(h, { class: "size-4" });

/** Lucide `loader-circle` (ISC), upstream's `Loader2Icon` with `animate-spin`. */
const Loader2Icon = <Msg>(h: Html.H<Msg>) => LoaderCircleIcon(h, { class: "size-4 animate-spin" });

/** Lucide `x` (ISC), for the optional close button. */
const XIcon = <Msg>(h: Html.H<Msg>) => SharedXIcon(h, { class: "size-4" });

const iconFor = <Msg>(h: Html.H<Msg>, type: string | undefined) => {
  switch (type) {
    case "success":
      return CircleCheckIcon(h);
    case "info":
      return InfoIcon(h);
    case "warning":
      return TriangleAlertIcon(h);
    case "error":
      return OctagonXIcon(h);
    case "loading":
      return Loader2Icon(h);
    default:
      return undefined;
  }
};

// ---------------------------------------------------------------------------
// Toaster
// ---------------------------------------------------------------------------

/** Upstream's `className` for the Sonner root, verbatim. */
export const TOASTER_CLASS = "toaster group";

/**
 * The toast box. NOT an upstream class string: sonner styles its toasts from
 * its own package CSS. Reproduced with Tailwind utilities over the same CSS
 * variables upstream sets (see the header's declared divergences).
 */
export const TOAST_CLASS =
  "flex w-full items-start gap-2 rounded-(--border-radius) border border-(--normal-border) bg-(--normal-bg) p-4 text-(--normal-text) shadow-lg";

export const TOAST_TITLE_CLASS = "text-sm leading-snug font-medium";

export const TOAST_DESCRIPTION_CLASS = "text-[13px] leading-snug opacity-80";

export const TOAST_CLOSE_CLASS =
  "-mt-1 -mr-1 shrink-0 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none";

export type ToasterTheme = "light" | "dark" | "system";

export type ToasterPosition =
  "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

/** Upstream's inline CSS variables, verbatim, in upstream's order. */
const TOASTER_VARS =
  "--normal-bg:var(--popover);--normal-text:var(--popover-foreground);--normal-border:var(--border);--border-radius:var(--radius)";

/** The popover-box reset the kit's Toast docs prescribe for its viewport. */
const VIEWPORT_RESET = "margin:0;border:0;padding:0;background:none;overflow:visible";

const POSITION_INSET: Record<ToasterPosition, string> = {
  "top-left": "inset:1rem auto auto 1rem",
  "top-center": "inset:1rem auto auto 50%;translate:-50% 0",
  "top-right": "inset:1rem 1rem auto auto",
  "bottom-left": "inset:auto auto 1rem 1rem",
  "bottom-center": "inset:auto auto 1rem 50%;translate:-50% 0",
  "bottom-right": "inset:auto 1rem 1rem auto",
};

type ToastParts = Component.Headless.Parts<typeof KitToastProvider>;

const renderToast = <Msg>(
  h: Html.H<Msg>,
  tp: ToastParts,
  toast: ToastItem,
  closeButton: boolean,
) => {
  const icon = iconFor(h, toast.type);
  return tp.root({ element: h.div, toast }).children(
    tp.content({ element: h.div.class(TOAST_CLASS), toast }).children(
      ...(icon !== undefined ? [icon] : []),
      h.div.class("min-w-0 flex-1").children(
        ...(toast.title !== undefined
          ? [tp.title({ element: h.div.class(TOAST_TITLE_CLASS), toast }).children(toast.title)]
          : []),
        ...(toast.description !== undefined
          ? [
              tp
                .description({
                  element: h.div.class(TOAST_DESCRIPTION_CLASS),
                  toast,
                })
                .children(toast.description),
            ]
          : []),
      ),
      ...(closeButton
        ? [
            tp
              .close({ element: h.button.class(TOAST_CLOSE_CLASS), toast })
              .attr("aria-label", "Close")
              .children(XIcon(h)),
          ]
        : []),
    ),
  );
};

/** The options a `Toaster` call takes. */
export interface ToasterOptions<Msg, RV = never> {
  /** The kit provider's props: `timeout` (5000 ms default), `limit` (3), `topLayer`. */
  readonly props?: ToastProviderProps | undefined;
  /** Handle the provider's one event: the user closed toast `id`, or its timeout ran out. */
  readonly onDismissed?:
    | ((event: Extract<ToastProviderEvents, { readonly _tag: "Dismissed" }>) => Msg | undefined)
    | undefined;
  /** Accepted for upstream parity and stamped as `data-theme`; colors always come from theme.css (see header). */
  readonly theme?: ToasterTheme | undefined;
  /** Where the viewport sits. Upstream's default: `"bottom-right"`. */
  readonly position?: ToasterPosition | undefined;
  /** Render a close button on each toast. Upstream's default: `false`. */
  readonly closeButton?: boolean | undefined;
  /** Extra classes on the viewport, after upstream's `"toaster group"`. */
  readonly class?: string | undefined;
  /** The app body. Every Component drawn here can post toasts with `$.send(ToastProvider, toast(...))`. */
  readonly view: () => View.Content<NoInfer<Msg>, RV>;
}

/**
 * The kit `ToastProvider` with shadcn's sonner styling. Call it once near
 * the root:
 *
 *   Toaster(h, {
 *     props: { timeout: 4000 },
 *     onDismissed: ({ id }) => Msg.ToastDismissed({ id }),
 *     view: () => AppBody(h, {})
 *   })
 */
export const Toaster = <Msg, RV = never>(h: Html.H<Msg>, options: ToasterOptions<Msg, RV>) =>
  KitToastProvider(h, {
    props: options.props,
    onEmit: options.onDismissed !== undefined ? { Dismissed: options.onDismissed } : undefined,
    view: (tp) =>
      h.div(
        options.view(),
        tp
          .viewport(
            h.div
              .class(
                cn(
                  TOASTER_CLASS,
                  "flex w-[356px] max-w-[calc(100vw-2rem)] flex-col gap-2",
                  options.class,
                ),
              )
              .attr(
                "style",
                `${TOASTER_VARS};${VIEWPORT_RESET};${POSITION_INSET[options.position ?? "bottom-right"]}`,
              )
              .attr("data-theme", options.theme ?? "system"),
          )
          .children(
            ...tp.toasts.map((toast) => renderToast(h, tp, toast, options.closeButton ?? false)),
          ),
      ),
  });
