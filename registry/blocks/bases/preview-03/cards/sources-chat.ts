/**
 * SourcesChat — shadcn/ui block `preview-03`
 * (cards/sources-chat.tsx), bases generation, ported 1:1 to
 * Effect UI.
 *
 * Upstream renders this card standalone (it is not in preview-03's
 * index grid). It is a `useChat` card driven by the scripted
 * `@shadcn/helpers/ai-sdk` transport (`createChat()` chain: one user
 * turn, a sleep, and an assistant turn built with
 * `writer.sourceUrl(...)` / `writer.sourceDocument(...)` /
 * `writer.text(...)`). That package is create-site infra, not a
 * registry dependency, so here the chain is a verbatim data constant
 * (`script` below, source ids / titles / URLs included) and the card
 * is an `Html.component` whose Model owns the messages, the chat
 * status, the script cursor and the pending reply. `PromptInput`
 * (the sibling port in `../components/prompt-input.ts`) is prefilled
 * with the next scripted user line; on the card's `Submitted` message the user
 * message is appended (the typed text when non-empty and not the
 * scripted line, otherwise the scripted message whole), the status
 * becomes `"submitted"` (upstream's `Thinking...` marker shows), and
 * a Subscription keyed on the pending state (the `code-block.ts`
 * `copyReset` pattern) sleeps the scripted delay and appends the
 * assistant reply whole before the status returns to `"ready"`.
 * The header's new-chat button is upstream's
 * `setMessages(initialMessages)`: it resets the messages and the
 * cursor to the initial state. Initial messages are upstream's
 * `chat.get(0)`: none — the card renders empty on load with the
 * first scripted line prefilled. Parts dispatch matches the JSX:
 * text parts through `PartText` (bubble variant for user messages),
 * `source-url` / `source-document` parts through `PartSource`.
 * `MessageScrollerProvider` is not reproduced: the bases
 * message-scroller port exports no Provider (its header declares
 * this), so the scroller anatomy is drawn directly. Upstream's
 * `CardContent` here carries no padding class (unlike its sibling
 * cards) and its `MessageScrollerContent` carries no class either;
 * both are preserved as-is.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Replies arrive whole after the scripted delay — no token
 *   streaming; the transport is the scripted Model, not a network
 *   chat. Upstream's `streaming` status is therefore never entered
 *   (the status union keeps it for parity with `PromptInput`).
 * - IconPlaceholder → the lucide glyph only (Plus, file-local below:
 *   no shared builder exists in `@/lib/icons` yet).
 * - `MessageScrollerItem`'s upstream `messageId` prop is not an
 *   option on the bases port (engine bookkeeping, per its header);
 *   `scrollAnchor` is passed exactly as upstream computed it.
 * - Sibling-lane seam — `PromptInput` (landed in
 *   `../components/prompt-input.ts`): it is called keyed by its
 *   `defaultValue` (its header's re-key rule — a changed
 *   `defaultValue` otherwise never re-syncs) with
 *   `props: { status, defaultValue }`. Its form submit is its own
 *   `Submitted({ value })` message with a no-op handler, and it
 *   declares NO `events`, so a parent card cannot yet map that
 *   message into its own `Submitted` message: the card's update,
 *   pending-reply Subscription and prefill logic are all in place,
 *   and the missing link is exactly one
 *   `onEmit: { Submitted: … }` on this call once `PromptInput`
 *   emits `Submitted` as an event. The other sibling components
 *   are used at their landed signatures:
 *   `Example(h, { title, class, containerClassName }, children)`
 *   and `PartText(h, { part, role, variant, tinted, class })` and
 *   `PartSource(h, { part, class })`.
 */
import * as Subscription from "@effect/ui/Subscription";
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import { Button } from "@/components/ui/button.ts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker.ts";
import { Message, MessageContent } from "@/components/ui/message.ts";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller.ts";
import { Spinner } from "@/components/ui/spinner.ts";
import { icon } from "@/lib/icons";
import { Example } from "../components/example.ts";
import { PartSource } from "../components/part-source.ts";
import { PartText } from "../components/part-text.ts";
import { PromptInput } from "../components/prompt-input.ts";

/** Lucide `plus` (ISC), file-local via the shared `icon` helper. */
const PlusIcon = <Msg>(h: Html.H<Msg>, options: { readonly class?: string | undefined } = {}) =>
  icon(
    h,
    [
      ["path", { d: "M5 12h14" }],
      ["path", { d: "M12 5v14" }],
    ],
    options,
  );

// ---------------------------------------------------------------------------
// Scripted chat data (upstream's `createChat()` chain, verbatim)
// ---------------------------------------------------------------------------

export const SourcesChatTextPart = Schema.Struct({
  type: Schema.Literal("text"),
  text: Schema.String,
});
export type SourcesChatTextPart = typeof SourcesChatTextPart.Type;

export const SourcesChatSourceUrlPart = Schema.Struct({
  type: Schema.Literal("source-url"),
  sourceId: Schema.String,
  url: Schema.String,
  title: Schema.optional(Schema.String),
});
export type SourcesChatSourceUrlPart = typeof SourcesChatSourceUrlPart.Type;

export const SourcesChatSourceDocumentPart = Schema.Struct({
  type: Schema.Literal("source-document"),
  sourceId: Schema.String,
  mediaType: Schema.String,
  title: Schema.optional(Schema.String),
  filename: Schema.optional(Schema.String),
});
export type SourcesChatSourceDocumentPart = typeof SourcesChatSourceDocumentPart.Type;

export const SourcesChatPart = Schema.Union([
  SourcesChatTextPart,
  SourcesChatSourceUrlPart,
  SourcesChatSourceDocumentPart,
]);
export type SourcesChatPart = typeof SourcesChatPart.Type;

export const SourcesChatMessageData = Schema.Struct({
  id: Schema.String,
  role: Schema.Literals(["user", "assistant"]),
  parts: Schema.Array(SourcesChatPart),
});
export type SourcesChatMessageData = typeof SourcesChatMessageData.Type;

export type SourcesChatTurn = {
  readonly user: SourcesChatMessageData;
  readonly sleepMs?: number | undefined;
  readonly assistant?: SourcesChatMessageData | undefined;
};

/** Upstream's `getMessageText`: the text parts of a message, joined. */
export const getSourcesChatMessageText = (message: SourcesChatMessageData): string =>
  message.parts.reduce((text, part) => (part.type === "text" ? text + part.text : text), "");

const script: ReadonlyArray<SourcesChatTurn> = [
  {
    user: {
      id: "user-1",
      role: "user",
      parts: [{ type: "text", text: "What should I read before migrating message rendering?" }],
    },
    sleepMs: 1000,
    assistant: {
      id: "assistant-1",
      role: "assistant",
      parts: [
        {
          type: "source-url",
          sourceId: "source-ai-sdk-ui-message",
          title: "AI SDK UIMessage",
          url: "https://ai-sdk.dev/docs/reference/ai-sdk-core/ui-message",
        },
        {
          type: "source-url",
          sourceId: "source-ai-sdk-transport",
          title: "AI SDK transport",
          url: "https://ai-sdk.dev/docs/ai-sdk-ui/transport",
        },
        {
          type: "source-document",
          sourceId: "source-migration-notes",
          title: "Internal migration notes",
          filename: "message-rendering-plan.md",
          mediaType: "text/markdown",
        },
        {
          type: "text",
          text: "Start with the **UIMessage** shape, then read the transport docs so your renderer understands streamed parts. The migration notes should stay close to the component work because they capture the local composition decisions.",
        },
      ],
    },
  },
];

/** Upstream's `initialMessages = chat.get(0)`: no messages on load. */
const initialMessages: ReadonlyArray<SourcesChatMessageData> = [];

// ---------------------------------------------------------------------------
// The card
// ---------------------------------------------------------------------------

export const SourcesChatMessage = UiSchema.TaggedEnum({
  /** `PromptInput` was submitted with its current value. */
  Submitted: { value: Schema.String },
  /** The pending reply's scripted delay elapsed: append it whole. */
  ReplyArrived: {},
  /** The header new-chat button: upstream's `setMessages(initialMessages)`. */
  StartedOver: {},
});
export type SourcesChatMessage = typeof SourcesChatMessage.Type;

export const SourcesChatModel = Schema.Struct({
  messages: Schema.Array(SourcesChatMessageData),
  status: Schema.Literals(["ready", "submitted", "streaming", "error"]),
  cursor: Schema.Number,
  pendingKey: Schema.Number,
  pendingDelayMs: Schema.Number,
});
export type SourcesChatModel = typeof SourcesChatModel.Type;

export const SourcesChat = Html.component({
  name: "Preview03SourcesChat",
  model: SourcesChatModel,
  message: SourcesChatMessage,
}).make({
  init: () => ({
    messages: [...initialMessages],
    status: "ready" as const,
    cursor: 0,
    pendingKey: 0,
    pendingDelayMs: 0,
  }),
  update: {
    Submitted: ($, { value }) => {
      const turn = script[$.model.cursor];
      const scriptedText = turn !== undefined ? getSourcesChatMessageText(turn.user) : "";
      const text = value.trim() !== "" ? value : scriptedText;
      if (text === "" && turn === undefined) return $.evolve({});
      const userMessage: SourcesChatMessageData =
        turn !== undefined && (value.trim() === "" || value === scriptedText)
          ? turn.user
          : {
              id: `user-${$.model.messages.length + 1}`,
              role: "user",
              parts: [{ type: "text", text }],
            };
      const messages = [...$.model.messages, userMessage];
      if (turn?.assistant !== undefined) {
        return $.evolve({
          messages,
          status: "submitted",
          pendingKey: $.model.pendingKey + 1,
          pendingDelayMs: turn.sleepMs ?? 0,
        });
      }
      return $.evolve({ messages, cursor: $.model.cursor + (turn !== undefined ? 1 : 0) });
    },
    ReplyArrived: ($) => {
      const turn = script[$.model.cursor];
      if (turn?.assistant === undefined) return $.evolve({ status: "ready" });
      return $.evolve({
        messages: [...$.model.messages, turn.assistant],
        status: "ready",
        cursor: $.model.cursor + 1,
        pendingDelayMs: 0,
      });
    },
    StartedOver: ($) =>
      $.evolve({ messages: [...initialMessages], status: "ready", cursor: 0, pendingDelayMs: 0 }),
  },
  subscriptions: ({ model }) => [
    model.status === "submitted" &&
      model.pendingKey > 0 &&
      Subscription.make("pendingReply", `${model.pendingKey}:${model.pendingDelayMs}`, (key) =>
        Stream.fromEffect(Effect.sleep(`${Number(key.split(":")[1] ?? 0)} millis`)).pipe(
          Stream.as(SourcesChatMessage.ReplyArrived() as SourcesChatMessage),
        ),
      ),
  ],
  view: (h, model) => {
    const nextMessage = script[model.cursor]?.user;
    const isBusy = model.status === "submitted" || model.status === "streaming";
    return Example(
      h,
      {
        title: "Sources",
        class: "bg-transparent p-0",
        containerClassName: "flex-1",
      },

      Card(h, { class: "max-h-140 min-h-0 flex-1" }).children(
        CardHeader(h).children(
          CardTitle(h).children("Reading list"),
          CardDescription(h).children("Source URL and source document parts."),
          CardAction(h).children(
            Button(h, {
              variant: "outline",
              size: "icon",
              onPress: SourcesChatMessage.StartedOver(),
            })
              .attr("aria-label", "Start over")
              .children(PlusIcon(h)),
          ),
        ),
        CardContent(h, { class: "flex-1 overflow-hidden" }).children(
          MessageScroller(h).children(
            MessageScrollerViewport(h).children(
              MessageScrollerContent(h).children(
                ...model.messages.map((message) =>
                  MessageScrollerItem(h, {
                    scrollAnchor: message.role === "user",
                  }).children(
                    Message(h, { align: message.role === "user" ? "end" : "start" })
                      .attr("data-role", message.role)
                      .children(
                        MessageContent(h, {
                          class:
                            message.role === "user"
                              ? "flex-col items-end gap-2"
                              : "flex-col items-start gap-2",
                        }).children(
                          ...message.parts.map((part) =>
                            part.type === "text"
                              ? PartText(h, {
                                  part,
                                  variant: message.role === "user" ? "bubble" : "default",
                                })
                              : part.type === "source-url" || part.type === "source-document"
                                ? PartSource(h, { part })
                                : "",
                          ),
                        ),
                      ),
                  ),
                ),
                ...(model.status === "submitted"
                  ? [
                      MessageScrollerItem(h, { scrollAnchor: false }).children(
                        Marker(h)
                          .attr("role", "status")
                          .children(
                            MarkerIcon(h).children(Spinner(h)),
                            MarkerContent(h).children("Thinking..."),
                          ),
                      ),
                    ]
                  : []),
              ),
            ),
            MessageScrollerButton(h),
          ),
        ),
        CardFooter(h).children(
          PromptInput(h, {
            key: isBusy
              ? ""
              : nextMessage !== undefined
                ? getSourcesChatMessageText(nextMessage)
                : "",
            props: {
              status: model.status,
              defaultValue: isBusy
                ? ""
                : nextMessage !== undefined
                  ? getSourcesChatMessageText(nextMessage)
                  : "",
            },
          }),
        ),
      ),
    );
  },
});
