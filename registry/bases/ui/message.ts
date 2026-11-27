/**
 * Message (bases generation) — shadcn/ui `message` ported 1:1 to Effect UI.
 *
 * Same Effect port as `registry/ui/message.ts` (pure view functions over
 * `h.div` builders, `align` writes `data-align`); only the class layer
 * changes: class strings are byte-for-byte the shadcn bases/radix strings —
 * structural inline classes plus `cn-*` hook classes whose utilities are
 * supplied by the style presets (style-nova, style-vega, …). The parity
 * checker asserts every token in `parity/bases-tokens.json["message"]`.
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";

type Div<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

export type MessageAlign = "start" | "end";

export const MESSAGE_GROUP_CLASS = "cn-message-group flex min-w-0 flex-col";

export const MESSAGE_CLASS =
  "cn-message group/message relative flex w-full min-w-0 data-[align=end]:flex-row-reverse";

export const MESSAGE_AVATAR_CLASS =
  "cn-message-avatar flex w-fit shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted";

export const MESSAGE_CONTENT_CLASS =
  "cn-message-content flex w-full min-w-0 flex-col wrap-break-word";

export const MESSAGE_HEADER_CLASS = "cn-message-header flex max-w-full min-w-0 items-center";

export const MESSAGE_FOOTER_CLASS =
  "cn-message-footer flex max-w-full min-w-0 items-center group-data-[align=end]/message:justify-end";

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
