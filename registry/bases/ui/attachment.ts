/**
 * Attachment (bases generation) — shadcn/ui `attachment` ported 1:1 to
 * Effect UI.
 *
 * Same Effect port as `registry/ui/attachment.ts` (pure view functions over
 * element builders; `AttachmentAction` reuses this generation's `Button`
 * port with `data-slot` chained over it to "attachment-action"); only the
 * class layer changes: class strings are byte-for-byte the shadcn
 * bases/radix strings — structural inline classes plus `cn-*` hook classes
 * whose utilities are supplied by the style presets. The parity checker
 * asserts every token in `parity/bases-tokens.json["attachment"]`.
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
 */
import type * as Html from "@effect/ui/html/Html";
import type { ButtonElement, ButtonProps } from "@effect/ui-kit";
import { cn } from "@/lib/utils";
import { Button, type ButtonSize, type ButtonVariant } from "./button.ts";

type Div<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

type Span<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"span">, HTMLSpanElement, "span">;

export const ATTACHMENT_CONTENT_CLASS = "cn-attachment-content max-w-full min-w-0 flex-1";

export const ATTACHMENT_TITLE_CLASS =
  "cn-attachment-title block max-w-full min-w-0 truncate group-data-[state=processing]/attachment:shimmer group-data-[state=uploading]/attachment:shimmer";

export const ATTACHMENT_DESCRIPTION_CLASS =
  "cn-attachment-description block min-w-0 truncate text-muted-foreground group-data-[state=error]/attachment:text-destructive/80 max-w-full";

export const ATTACHMENT_ACTIONS_CLASS = "cn-attachment-actions flex shrink-0 items-center";

export const ATTACHMENT_TRIGGER_CLASS = "cn-attachment-trigger absolute inset-0 z-10 outline-none";

export const ATTACHMENT_GROUP_CLASS =
  "cn-attachment-group flex min-w-0 scroll-fade-x snap-x snap-mandatory scrollbar-none overflow-x-auto overscroll-x-contain *:data-[slot=attachment]:flex-none *:data-[slot=attachment]:snap-start";

// ---------------------------------------------------------------------------
// Attachment
// ---------------------------------------------------------------------------

export type AttachmentState = "idle" | "uploading" | "processing" | "error" | "done";

export type AttachmentSize = "default" | "sm" | "xs";
export type AttachmentOrientation = "horizontal" | "vertical";

const ATTACHMENT_BASE =
  "cn-attachment group/attachment relative flex max-w-full min-w-0 shrink-0 flex-wrap border bg-card text-card-foreground transition-colors has-[>a,>button]:hover:bg-muted/50 data-[state=error]:border-destructive/30 data-[state=idle]:border-dashed";

const ATTACHMENT_SIZES: Record<AttachmentSize, string> = {
  default: "cn-attachment-size-default",
  sm: "cn-attachment-size-sm",
  xs: "cn-attachment-size-xs",
};

const ATTACHMENT_ORIENTATIONS: Record<AttachmentOrientation, string> = {
  horizontal: "cn-attachment-orientation-horizontal items-center",
  vertical: "cn-attachment-orientation-vertical flex-col",
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
  "cn-attachment-media relative flex aspect-square shrink-0 items-center justify-center overflow-hidden group-data-[state=error]/attachment:bg-destructive/10 group-data-[state=error]/attachment:text-destructive [&_svg]:pointer-events-none";

const ATTACHMENT_MEDIA_VARIANTS: Record<AttachmentMediaVariant, string> = {
  icon: "cn-attachment-media-variant-icon",
  image:
    "cn-attachment-media-variant-image *:[img]:aspect-square *:[img]:w-full *:[img]:object-cover",
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
 * `data-slot="attachment-action"` and class `cn-attachment-action` — the
 * port calls this generation's `Button` and chains the data-slot over it,
 * like upstream's prop spread does.
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
    class: cn("cn-attachment-action", options.class),
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
