/**
 * SimpleChat — shadcn/ui block `preview-03` (cards/simple-chat.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a `useChat` card driven by the scripted
 * `@shadcn/helpers/ai-sdk` transport (`createChat()` chain). That
 * package is create-site infra, not a registry dependency, so here the
 * chain is a verbatim data constant (`script` below: user text /
 * sleep / assistant reply, in order) and the card is an
 * `Html.component` whose Model owns the messages, the chat status,
 * the script cursor and the pending reply. `PromptInput` (the sibling
 * port in `../components/prompt-input.ts`) is prefilled with the next
 * scripted user line; on the card's `Submitted` message the user message is
 * appended (the typed text when non-empty and not the scripted line,
 * otherwise the scripted message whole), the status becomes
 * `"submitted"` (upstream's `Thinking...` marker shows), and a
 * Subscription keyed on the pending state (the `code-block.ts`
 * `copyReset` pattern) sleeps the scripted delay and appends the
 * assistant reply whole before the status returns to `"ready"`.
 * The header's new-chat button is upstream's `setMessages([])`: it
 * resets the messages and the cursor to the initial state.
 * Initial messages are upstream's `chat.get(0)`: none — the card
 * renders empty on load with the first scripted line prefilled.
 * `MessageScrollerProvider` is not reproduced: the bases
 * message-scroller port exports no Provider (its header declares
 * this), so the scroller anatomy is drawn directly.
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
 *   and `PartText(h, { part, role, variant, tinted, class })`.
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

export const SimpleChatTextPart = Schema.Struct({
  type: Schema.Literal("text"),
  text: Schema.String,
});
export type SimpleChatTextPart = typeof SimpleChatTextPart.Type;

export const SimpleChatMessageData = Schema.Struct({
  id: Schema.String,
  role: Schema.Literals(["user", "assistant"]),
  parts: Schema.Array(SimpleChatTextPart),
});
export type SimpleChatMessageData = typeof SimpleChatMessageData.Type;

export type SimpleChatTurn = {
  readonly user: SimpleChatMessageData;
  readonly sleepMs?: number | undefined;
  readonly assistant?: SimpleChatMessageData | undefined;
};

/** Upstream's `getMessageText`: the text parts of a message, joined. */
export const getSimpleChatMessageText = (message: SimpleChatMessageData): string =>
  message.parts.reduce((text, part) => (part.type === "text" ? text + part.text : text), "");

const script: ReadonlyArray<SimpleChatTurn> = [
  {
    user: {
      id: "user-1",
      role: "user",
      parts: [
        {
          type: "text",
          text: "Write me a haiku about centering a div and how it's done.",
        },
      ],
    },
    sleepMs: 3000,
    assistant: {
      id: "assistant-1",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "One box in the void / Twenty wrappers, still offset / `margin: 0 auto`",
        },
      ],
    },
  },
  {
    user: {
      id: "user-2",
      role: "user",
      parts: [
        {
          type: "text",
          text: `Is this conversation actually happening? I've been sitting here wondering if you're **really** reading this.

Every reply feels a little too convenient — like someone already wrote \`chat.next(messages)\` and I'm just clicking send on my own lines.`,
        },
      ],
    },
    sleepMs: 3000,
    assistant: {
      id: "assistant-2",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "You're in a preview block. I'm four hardcoded replies and a transport. Real enough for the demo — philosophically, we're both props.",
        },
      ],
    },
  },
  {
    user: {
      id: "user-3",
      role: "user",
      parts: [
        {
          type: "text",
          text: "Okay, how do I make my loading spinner feel faster? Tell me in detail about the technique.",
        },
      ],
    },
    sleepMs: 3000,
    assistant: {
      id: "assistant-3",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Add text that says “Almost there…” and never update it. Users assume progress. Ethically dubious. Statistically effective.",
        },
      ],
    },
  },
  {
    user: {
      id: "user-4",
      role: "user",
      parts: [{ type: "text", text: "Can you at least pretend to be surprised?" }],
    },
    sleepMs: 3000,
    assistant: {
      id: "assistant-4",
      role: "assistant",
      parts: [{ type: "text", text: "😮 WOW! I had no idea you would ask that!" }],
    },
  },
];

/** Upstream's `initialMessages = chat.get(0)`: no messages on load. */
const initialMessages: ReadonlyArray<SimpleChatMessageData> = [];

// ---------------------------------------------------------------------------
// The card
// ---------------------------------------------------------------------------

export const SimpleChatMessage = UiSchema.TaggedEnum({
  /** `PromptInput` was submitted with its current value. */
  Submitted: { value: Schema.String },
  /** The pending reply's scripted delay elapsed: append it whole. */
  ReplyArrived: {},
  /** The header new-chat button: upstream's `setMessages([])`. */
  StartedOver: {},
});
export type SimpleChatMessage = typeof SimpleChatMessage.Type;

export const SimpleChatModel = Schema.Struct({
  messages: Schema.Array(SimpleChatMessageData),
  status: Schema.Literals(["ready", "submitted", "streaming", "error"]),
  cursor: Schema.Number,
  pendingKey: Schema.Number,
  pendingDelayMs: Schema.Number,
});
export type SimpleChatModel = typeof SimpleChatModel.Type;

export const SimpleChat = Html.component({
  name: "Preview03SimpleChat",
  model: SimpleChatModel,
  message: SimpleChatMessage,
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
      const scriptedText = turn !== undefined ? getSimpleChatMessageText(turn.user) : "";
      const text = value.trim() !== "" ? value : scriptedText;
      if (text === "" && turn === undefined) return $.evolve({});
      const userMessage: SimpleChatMessageData =
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
          Stream.as(SimpleChatMessage.ReplyArrived() as SimpleChatMessage),
        ),
      ),
  ],
  view: (h, model) => {
    const nextMessage = script[model.cursor]?.user;
    const isBusy = model.status === "submitted" || model.status === "streaming";
    return Example(
      h,
      {
        title: "Simple Chat",
        class: "bg-transparent p-0",
        containerClassName: "flex-1",
      },

      Card(h, { class: "max-h-140 min-h-0 flex-1" }).children(
        CardHeader(h).children(
          CardTitle(h).children("What can I help you with today?"),
          CardDescription(h).children("A simple chat example."),
          CardAction(h).children(
            Button(h, {
              variant: "outline",
              size: "icon",
              onPress: SimpleChatMessage.StartedOver(),
            }).children(PlusIcon(h)),
          ),
        ),
        CardContent(h, { class: "flex-1 overflow-hidden p-0" }).children(
          MessageScroller(h).children(
            MessageScrollerViewport(h).children(
              MessageScrollerContent(h, { class: "p-(--card-spacing)" }).children(
                ...model.messages.map((message) =>
                  MessageScrollerItem(h, {
                    scrollAnchor: message.role === "user",
                  }).children(
                    Message(h, { align: message.role === "user" ? "end" : "start" })
                      .attr("data-role", message.role)
                      .children(
                        MessageContent(h).children(
                          ...message.parts.map((part) => PartText(h, { part, role: message.role })),
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
                ? getSimpleChatMessageText(nextMessage)
                : "",
            props: {
              status: model.status,
              defaultValue: isBusy
                ? ""
                : nextMessage !== undefined
                  ? getSimpleChatMessageText(nextMessage)
                  : "",
            },
          }),
        ),
      ),
    );
  },
});
