/**
 * Attachment — shadcn/ui `attachment` ported 1:1 to Effect UI.
 *
 * Upstream: React + cva + Radix Slot over plain <div>s / <span>s, plus the
 * shadcn Button for `AttachmentAction`. Here: pure view functions returning
 * element builders — Attachment keeps no state, so none of them is a
 * Component. Variants are plain Records keyed by string unions — no cva.
 * `AttachmentAction` reuses this repo's `Button` port, the same reuse
 * upstream makes, with `data-slot` chained over it to "attachment-action".
 *
 * Declared divergence (PORTING-RULES.md D-2): upstream `AttachmentTrigger`
 * accepts `asChild` (Radix Slot). There is no Slot in Effect UI, so
 * `AttachmentTrigger` always renders the <button type="button">; its class
 * string is exported as `ATTACHMENT_TRIGGER_CLASS` for composition on
 * another element.
 *
 * Note: `AttachmentTitle`'s `shimmer` utility (applied while uploading /
 * processing) is a theme-level utility upstream; the class token is kept
 * verbatim for parity — defining the keyframes belongs to the theme.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings; the parity
 * checker (scripts/verify.mjs) fails if any upstream token disappears.
 */
import type * as Html from "@effect/ui/html/Html";
import type { ButtonElement, ButtonProps } from "@effect/ui-kit";
import { cn } from "@/lib/utils";
import { Button, type ButtonSize, type ButtonVariant } from "./button.ts";

type Div<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

type Span<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"span">, HTMLSpanElement, "span">;

export const ATTACHMENT_CONTENT_CLASS =
  "max-w-full min-w-0 flex-1 leading-tight group-data-[orientation=vertical]/attachment:px-1";

export const ATTACHMENT_TITLE_CLASS =
  "block max-w-full min-w-0 truncate font-medium group-data-[state=processing]/attachment:shimmer group-data-[state=uploading]/attachment:shimmer";

export const ATTACHMENT_DESCRIPTION_CLASS =
  "mt-0.5 block min-w-0 truncate text-xs text-muted-foreground group-data-[state=error]/attachment:text-destructive/80 max-w-full";

export const ATTACHMENT_ACTIONS_CLASS =
  "relative z-20 flex shrink-0 items-center group-data-[orientation=vertical]/attachment:absolute group-data-[orientation=vertical]/attachment:top-3 group-data-[orientation=vertical]/attachment:right-3 group-data-[orientation=vertical]/attachment:gap-1";

export const ATTACHMENT_TRIGGER_CLASS = "absolute inset-0 z-10 outline-none";

export const ATTACHMENT_GROUP_CLASS =
  "flex min-w-0 scroll-fade-x snap-x snap-mandatory scroll-px-1 scrollbar-none gap-3 overflow-x-auto overscroll-x-contain py-1 *:data-[slot=attachment]:flex-none *:data-[slot=attachment]:snap-start";

// ---------------------------------------------------------------------------
// Attachment
// ---------------------------------------------------------------------------

export type AttachmentState = "idle" | "uploading" | "processing" | "error" | "done";

export type AttachmentSize = "default" | "sm" | "xs";
export type AttachmentOrientation = "horizontal" | "vertical";

const ATTACHMENT_BASE =
  "group/attachment relative flex w-fit max-w-full min-w-0 shrink-0 flex-wrap rounded-xl border bg-card text-card-foreground transition-colors focus-within:ring-1 focus-within:ring-ring/50 has-[>a,>button]:hover:bg-muted/50 data-[state=error]:border-destructive/30 data-[state=idle]:border-dashed";

const ATTACHMENT_SIZES: Record<AttachmentSize, string> = {
  default:
    "gap-2 text-sm has-data-[slot=attachment-content]:px-2.5 has-data-[slot=attachment-content]:py-2 has-data-[slot=attachment-media]:p-2",
  sm: "gap-2.5 text-xs has-data-[slot=attachment-content]:px-2 has-data-[slot=attachment-content]:py-1.5 has-data-[slot=attachment-media]:p-1.5",
  xs: "gap-1.5 rounded-lg text-xs has-data-[slot=attachment-content]:px-1.5 has-data-[slot=attachment-content]:py-1 has-data-[slot=attachment-media]:p-1",
};

const ATTACHMENT_ORIENTATIONS: Record<AttachmentOrientation, string> = {
  horizontal: "min-w-40 items-center",
  vertical: "w-24 flex-col has-data-[slot=attachment-content]:w-30",
};

/** Upstream name kept: `attachmentVariants({ size, orientation })` in shadcn; here a pure function, not cva. */
export const attachmentVariants = (
  options: {
    readonly size?: AttachmentSize | undefined;
    readonly orientation?: AttachmentOrientation | undefined;
    readonly class?: string | undefined;
  } = {},
): string =>
  cn(
    ATTACHMENT_BASE,
    ATTACHMENT_SIZES[options.size ?? "default"],
    ATTACHMENT_ORIENTATIONS[options.orientation ?? "horizontal"],
    options.class,
  );

export const Attachment = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: {
    readonly state?: AttachmentState | undefined;
    readonly size?: AttachmentSize | undefined;
    readonly orientation?: AttachmentOrientation | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  h.div
    .attr("data-slot", "attachment")
    .attr("data-state", options.state ?? "done")
    .attr("data-size", options.size ?? "default")
    .attr("data-orientation", options.orientation ?? "horizontal")
    .class(attachmentVariants(options));

// ---------------------------------------------------------------------------
// AttachmentMedia
// ---------------------------------------------------------------------------

export type AttachmentMediaVariant = "icon" | "image";

const ATTACHMENT_MEDIA_BASE =
  "relative flex aspect-square w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-foreground group-data-[orientation=vertical]/attachment:w-full group-data-[size=sm]/attachment:w-8 group-data-[size=xs]/attachment:w-7 group-data-[size=xs]/attachment:rounded-md group-data-[state=error]/attachment:bg-destructive/10 group-data-[state=error]/attachment:text-destructive group-data-[orientation=vertical]/attachment:*:data-[slot=spinner]:size-6! [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 group-data-[orientation=vertical]/attachment:[&_svg:not([class*='size-'])]:size-6 group-data-[size=xs]/attachment:[&_svg:not([class*='size-'])]:size-3.5";

const ATTACHMENT_MEDIA_VARIANTS: Record<AttachmentMediaVariant, string> = {
  icon: "",
  image:
    "opacity-60 group-data-[state=done]/attachment:opacity-100 group-data-[state=idle]/attachment:opacity-100 *:[img]:aspect-square *:[img]:w-full *:[img]:object-cover",
};

/** Upstream name kept: `attachmentMediaVariants({ variant })` in shadcn; here a pure function, not cva. */
export const attachmentMediaVariants = (
  options: {
    readonly variant?: AttachmentMediaVariant | undefined;
    readonly class?: string | undefined;
  } = {},
): string =>
  cn(ATTACHMENT_MEDIA_BASE, ATTACHMENT_MEDIA_VARIANTS[options.variant ?? "icon"], options.class);

export const AttachmentMedia = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: {
    readonly variant?: AttachmentMediaVariant | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  h.div
    .attr("data-slot", "attachment-media")
    .attr("data-variant", options.variant ?? "icon")
    .class(attachmentMediaVariants(options));

// ---------------------------------------------------------------------------
// Remaining parts
// ---------------------------------------------------------------------------

export const AttachmentContent = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.div.attr("data-slot", "attachment-content").class(cn(ATTACHMENT_CONTENT_CLASS, options.class));

export const AttachmentTitle = <Msg, R = never>(
  h: { readonly span: Span<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.span.attr("data-slot", "attachment-title").class(cn(ATTACHMENT_TITLE_CLASS, options.class));

export const AttachmentDescription = <Msg, R = never>(
  h: { readonly span: Span<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.span
    .attr("data-slot", "attachment-description")
    .class(cn(ATTACHMENT_DESCRIPTION_CLASS, options.class));

export const AttachmentActions = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) =>
  h.div.attr("data-slot", "attachment-actions").class(cn(ATTACHMENT_ACTIONS_CLASS, options.class));

/**
 * Upstream renders the shadcn Button (ghost / icon-xs by default) with
 * `data-slot="attachment-action"` — the port calls this repo's `Button` and
 * chains the data-slot over it, like upstream's prop spread does.
 */
export const AttachmentAction = <Msg, R = never>(
  h: { readonly button: ButtonElement<Msg> },
  options: {
    readonly element?: ButtonElement<Msg, R> | undefined;
    readonly props?: ButtonProps | undefined;
    readonly onPress?: Msg | undefined;
    readonly variant?: ButtonVariant | undefined;
    readonly size?: ButtonSize | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  Button(h, {
    element: options.element,
    props: options.props,
    onPress: options.onPress,
    variant: options.variant ?? "ghost",
    size: options.size ?? "icon-xs",
    class: options.class,
  }).attr("data-slot", "attachment-action");

export const AttachmentTrigger = <Msg, R = never>(
  h: {
    readonly button: Html.Element<Msg, R, Html.EventsOf<"button">, HTMLButtonElement, "button">;
  },
  options: { readonly class?: string | undefined } = {},
) =>
  h.button
    .attr("data-slot", "attachment-trigger")
    .attr("type", "button")
    .class(cn(ATTACHMENT_TRIGGER_CLASS, options.class));

export const AttachmentGroup = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "attachment-group").class(cn(ATTACHMENT_GROUP_CLASS, options.class));
