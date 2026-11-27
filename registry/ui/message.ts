/**
 * Message — shadcn/ui `message` ported 1:1 to Effect UI.
 *
 * Upstream: React, no primitive, no cva — every part is a plain <div>.
 * Here: pure view functions returning `h.div` builders — Message keeps no
 * state, so none of them is a Component. The `align` option writes
 * `data-align` exactly as upstream; the alignment styling lives in the
 * class strings (`group-data-[align=end]/message:…`), which are copied
 * byte-for-byte.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings; the parity
 * checker (scripts/verify.mjs) fails if any upstream token disappears.
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";

type Div<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

export type MessageAlign = "start" | "end";

export const MESSAGE_GROUP_CLASS = "flex min-w-0 flex-col gap-2";

export const MESSAGE_CLASS =
  "group/message relative flex w-full min-w-0 gap-2 text-sm data-[align=end]:flex-row-reverse";

export const MESSAGE_AVATAR_CLASS =
  "flex w-fit min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted group-has-data-[slot=message-footer]/message:-translate-y-8";

export const MESSAGE_CONTENT_CLASS =
  "flex w-full min-w-0 flex-col gap-2.5 wrap-break-word group-data-[align=end]/message:*:data-slot:self-end";

export const MESSAGE_HEADER_CLASS =
  "flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0";

export const MESSAGE_FOOTER_CLASS =
  "flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0 group-data-[align=end]/message:justify-end";

export const MessageGroup = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "message-group").class(cn(MESSAGE_GROUP_CLASS, options.class));

export const Message = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: {
    readonly align?: MessageAlign | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  h.div
    .attr("data-slot", "message")
    .attr("data-align", options.align ?? "start")
    .class(cn(MESSAGE_CLASS, options.class));

export const MessageAvatar = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "message-avatar").class(cn(MESSAGE_AVATAR_CLASS, options.class));

export const MessageContent = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "message-content").class(cn(MESSAGE_CONTENT_CLASS, options.class));

export const MessageHeader = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "message-header").class(cn(MESSAGE_HEADER_CLASS, options.class));

export const MessageFooter = <Msg, R = never>(
  h: { readonly div: Div<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "message-footer").class(cn(MESSAGE_FOOTER_CLASS, options.class));
