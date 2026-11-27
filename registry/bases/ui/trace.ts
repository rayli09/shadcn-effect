/**
 * Trace (bases generation) — shadcn/ui `trace`, which exists only in
 * upstream's bases generation (there is no new-york-v4 file), ported 1:1
 * to Effect UI with the bases class layer: structural classes inline plus
 * `cn-trace-*` hooks whose utilities live in the style presets.
 *
 * Upstream: presentational view components over the bases `Collapsible`.
 * Here: view functions for `Trace` / `TraceLine` / `TraceIcon` /
 * `TraceTitle` / `TraceDescription`, and part appliers over this repo's
 * bases `Collapsible` for the collapsible trio — the same shape as
 * `collapsible.ts` (D-6): the kit Collapsible's parts exist only inside
 * its `view` closure, so `TraceCollapsible` wraps that call and
 * `TraceCollapsibleTrigger` / `TraceCollapsibleContent` take its parts:
 *
 *   TraceCollapsible(h, {
 *     props: { open: model.showRaw },
 *     onEmit: { Toggled: ({ open }) => Msg.ToggledRaw({ open }) },
 *     view: (collapsible) =>
 *       Trace(h).children(
 *         TraceCollapsibleTrigger(collapsible, h, h.button, {}, [
 *           TraceLine(h, { status: "error" }).children(
 *             TraceTitle(h).children("fetch /api/orders")
 *           ),
 *         ]),
 *         TraceCollapsibleContent(collapsible, h, h.div, {}, "raw payload…")
 *       )
 *   })
 *
 * State is the consumer's, as in the kit Collapsible: `open` is a prop,
 * the `Toggled` event reports the next value. The trigger's chevron is
 * upstream's IconPlaceholder stand-in resolved to the real lucide
 * `chevron-right` builder from `@/lib/icons` (the placeholder is a
 * site-internal icon-library switcher, not part of the component).
 *
 * Declared divergences:
 *
 * 1. DOM prop spreading (`{...props}`) is not reproduced: each piece
 *    takes `class` plus its documented options; chain further attributes
 *    on the returned builder.
 * 2. State attributes follow the kit (D-5): the collapsible writes
 *    `data-open` / `data-closed`, not Radix's `data-state`. The content's
 *    class keeps upstream's `[--radix-accordion-content-height:var(…)]`
 *    token verbatim; it is inert here, as the kit needs no such variable.
 * 3. `TraceCollapsibleTrigger` takes its children as an argument (and
 *    appends the chevron icon after them, as upstream renders it) rather
 *    than as a chained `.children(...)`, so the icon cannot be displaced
 *    by a later children call.
 */
import type { Component, View } from "@effect/ui";
import * as Html from "@effect/ui/html/Html";
import { Collapsible as KitCollapsible, type CollapsibleEvents } from "@effect/ui-kit";
import type { AsyncResult } from "effect/reactivity";
import { ChevronRightIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Collapsible, type CollapsibleProps } from "./collapsible.ts";

export type { CollapsibleProps };

type CollapsibleParts = Component.Headless.Parts<typeof KitCollapsible>;

/** The options a headless kit Component call takes, with its parts typed. */
type HeadlessOptions<Props, Events, Parts, Msg, RV, RF> = View.Child.Options<Props, Events, Msg> & {
  readonly fallback?:
    ((result: AsyncResult.Failure<never, unknown>) => View.Content<Msg, RF>) | undefined;
  readonly view: (parts: Parts) => View.Content<Msg, RV>;
};

// ---------------------------------------------------------------------------
// Trace / TraceLine / TraceIcon / TraceTitle / TraceDescription
// ---------------------------------------------------------------------------

export const TRACE_CLASS =
  "cn-trace flex w-full min-w-0 flex-col *:has-[>[data-slot=trace-line]]:flex *:has-[>[data-slot=trace-line]]:w-fit *:has-[>[data-slot=trace-line]]:max-w-full *:has-[>[data-slot=trace-line]]:min-w-0 *:has-[>[data-slot=trace-line]]:text-left *:has-[>[data-slot=trace-line]]:outline-none";

export const Trace = <Msg>(h: Html.H<Msg>, options: { readonly class?: string | undefined } = {}) =>
  h.div.attr("data-slot", "trace").class(cn(TRACE_CLASS, options.class));

export type TraceStatus = "running" | "error" | "pending";

export const TRACE_LINE_CLASS =
  "cn-trace-line flex w-fit max-w-full min-w-0 items-center text-muted-foreground transition-colors in-[a,button]:cursor-pointer in-[a:hover,button:hover]:text-foreground data-[status=error]:text-destructive data-[status=error]:in-[a:hover,button:hover]:text-destructive data-[status=pending]:opacity-60 data-[status=running]:*:data-[slot=trace-title]:shimmer";

export const TraceLine = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly status?: TraceStatus | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  h.span
    .attrs({ "data-slot": "trace-line", "data-status": options.status })
    .class(cn(TRACE_LINE_CLASS, options.class));

export const TRACE_ICON_CLASS =
  "cn-trace-icon flex shrink-0 items-center justify-center [&_svg]:pointer-events-none";

export const TraceIcon = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  h.span
    .attrs({ "data-slot": "trace-icon", "aria-hidden": "true" })
    .class(cn(TRACE_ICON_CLASS, options.class));

export const TRACE_TITLE_CLASS = "cn-trace-title min-w-0 truncate motion-reduce:shimmer-none";

export const TraceTitle = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => h.span.attr("data-slot", "trace-title").class(cn(TRACE_TITLE_CLASS, options.class));

export const TRACE_DESCRIPTION_CLASS =
  "cn-trace-description shrink-0 text-muted-foreground/70 tabular-nums";

export const TraceDescription = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  h.span.attr("data-slot", "trace-description").class(cn(TRACE_DESCRIPTION_CLASS, options.class));

// ---------------------------------------------------------------------------
// TraceCollapsible trio — over this repo's bases Collapsible
// ---------------------------------------------------------------------------

export const TRACE_COLLAPSIBLE_CLASS = "cn-trace-collapsible flex w-full min-w-0 flex-col";

/**
 * The collapsible root wearing the trace classes. Same call shape as
 * `Collapsible`; the root part additionally writes
 * `data-slot="trace-collapsible"` (over the collapsible's own slot, as
 * upstream's JSX nesting does) and the `cn-trace-collapsible` class.
 */
export const TraceCollapsible = <Msg, RV = never, RF = never>(
  h: View.HelperBase<Msg, unknown>,
  options: HeadlessOptions<CollapsibleProps, CollapsibleEvents, CollapsibleParts, Msg, RV, RF>,
) =>
  Collapsible(h, {
    key: options.key,
    props: options.props,
    onEmit: options.onEmit,
    onFailure: options.onFailure,
    fallback: options.fallback,
    view: (collapsible) =>
      options.view({
        ...collapsible,
        // Post-stamp: the bases Collapsible's root already wrote its own
        // `data-slot="collapsible"`; the later stamp wins (D-8), exactly
        // as upstream's nested JSX overrides the primitive's slot.
        root: (element) =>
          collapsible
            .root(element)
            .attr("data-slot", "trace-collapsible")
            .class(TRACE_COLLAPSIBLE_CLASS),
      }),
  });

export const TRACE_COLLAPSIBLE_TRIGGER_CLASS =
  "cn-trace-collapsible-trigger group/trace-collapsible-trigger flex w-fit max-w-full min-w-0 cursor-pointer items-center text-left text-muted-foreground transition-colors outline-none hover:text-foreground has-[[data-status=error]]:text-destructive";

export const TRACE_COLLAPSIBLE_TRIGGER_ICON_CLASS =
  "transition-transform group-aria-expanded/trace-collapsible-trigger:rotate-90";

/**
 * Applies the `trigger` part with upstream's `data-slot` and classes, and
 * appends the chevron `TraceIcon` after `children`, exactly as upstream
 * renders it (see the header, item 3).
 */
export const TraceCollapsibleTrigger = <Msg, R = never>(
  collapsible: CollapsibleParts,
  h: Html.H<Msg>,
  element: Parameters<CollapsibleParts["trigger"]>[0],
  options: { readonly class?: string | undefined } = {},
  children?: View.Content<Msg, R>,
) =>
  collapsible
    .trigger(
      element
        .attr("data-slot", "trace-collapsible-trigger")
        .class(cn(TRACE_COLLAPSIBLE_TRIGGER_CLASS, options.class)),
    )
    .children(
      children,
      TraceIcon(h, { class: TRACE_COLLAPSIBLE_TRIGGER_ICON_CLASS }).children(ChevronRightIcon(h)),
    );

export const TRACE_COLLAPSIBLE_CONTENT_CLASS =
  "cn-trace-collapsible-content min-w-0 overflow-hidden [--radix-accordion-content-height:var(--radix-collapsible-content-height)] data-open:animate-accordion-down data-closed:animate-accordion-up";

export const TRACE_COLLAPSIBLE_CONTENT_INNER_CLASS =
  "cn-trace-collapsible-content-inner min-w-0 wrap-break-word text-muted-foreground";

/**
 * Applies the `panel` part with upstream's content classes and wraps
 * `children` in the inner div, as upstream does (the consumer `class`
 * lands on the inner div, where upstream's `cn(..., className)` puts it).
 * Like the kit panel, the result is `undefined` once the panel has
 * closed, so consume it with `?.` — the children are already inside.
 */
export const TraceCollapsibleContent = <Msg, R = never>(
  collapsible: CollapsibleParts,
  h: Html.H<Msg>,
  element: Parameters<CollapsibleParts["panel"]>[0],
  options: { readonly class?: string | undefined } = {},
  children?: View.Content<Msg, R>,
) =>
  collapsible
    .panel(
      element.attr("data-slot", "trace-collapsible-content").class(TRACE_COLLAPSIBLE_CONTENT_CLASS),
    )
    ?.children(
      h.div
        .attr("data-slot", "trace-collapsible-content-inner")
        .class(cn(TRACE_COLLAPSIBLE_CONTENT_INNER_CLASS, options.class))
        .children(children),
    );
