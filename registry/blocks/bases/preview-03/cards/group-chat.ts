/**
 * GroupChat — shadcn/ui block `preview-03` (cards/group-chat.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a `useChat` card driven by the scripted
 * `@shadcn/helpers/ai-sdk` transport (`createChat()` chain of user
 * turns carrying `metadata: { name }` for Stella / Marcus / Aleena,
 * one sleep, and one assistant reply to the `@chat,` turn), plus a
 * local `scriptedEvents` table (user-joined / user-typing / user-left
 * markers with fractional `order`s and `delayMs`) that the component
 * fires with `setTimeout` chains as scripted messages land. That
 * helper package is create-site infra, not a registry dependency, so
 * here both tables are verbatim data constants (`script` and
 * `scriptedEvents` below) and the card is an `Html.component` whose
 * Model owns the messages, the chat status, the script cursor, the
 * pending reply, the fired events, and the queued events with an
 * event timer. `PromptInput` (the sibling port in
 * `../components/prompt-input.ts`) is prefilled with the next
 * scripted user line; on the card's `Submitted` message:
 *
 * - a scripted non-`@chat,` line appends its message whole
 *   (metadata included), drops any pending `user-typing` event for
 *   that sender, and queues the scripted events whose `order` falls
 *   in that message's slot — a Subscription keyed on the queue head
 *   (the `code-block.ts` `copyReset` pattern) fires them one at a
 *   time, each after its incremental delay (upstream's
 *   `delayMs - previousDelayMs` chain), replacing any same-type /
 *   same-name event and keeping the list sorted by `order`;
 * - the `@chat,` line goes through the pending-reply path shared by
 *   every preview-03 card: the status becomes `"submitted"`
 *   (upstream's `Thinking...` marker shows) and a Subscription keyed
 *   on the pending state sleeps the scripted delay and appends the
 *   assistant reply whole before the status returns to `"ready"`;
 * - a typed line that is not the scripted line appends as a plain
 *   text message from "You" (upstream's `sendMessage({ text })`
 *   fallback; the scripted transport's reply to it is the next
 *   scripted assistant turn, so the `@chat,` pending path applies
 *   only at that turn).
 *
 * The header's new-chat button is upstream's reset handler:
 * `eventRun` increments (invalidating queued timers), the messages
 * return to `initialMessages` and the events to those with
 * `order < INITIAL_MESSAGE_COUNT`. Initial messages are upstream's
 * `chat.get(INITIAL_MESSAGE_COUNT)` with `INITIAL_MESSAGE_COUNT = 0`:
 * none — the card renders empty on load with the first scripted line
 * prefilled, and the footer reads "Posting as You." Parts dispatch
 * matches the JSX: text parts through `PartText` with the bubble
 * variant for user messages, `tinted` for the reader's own messages,
 * a `MessageHeader` ("Chat" for the assistant, the sender's name —
 * or "Unknown" — otherwise) on every non-own message, and the event
 * markers interleaved after the message whose slot they fall in
 * (`user-typing` → default variant + `role="status"`, the rest →
 * separator variant). `MessageScrollerProvider` is not reproduced:
 * the bases message-scroller port exports no Provider (its header
 * declares this), so the scroller anatomy is drawn directly.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Replies arrive whole after the scripted delay — no token
 *   streaming; the transport is the scripted Model, not a network
 *   chat. Upstream's `streaming` status is therefore never entered
 *   (the status union keeps it for parity with `PromptInput`).
 * - Upstream guards its event timer chain with a mutable
 *   `eventRunRef`; here the run is Model state (`eventRun`), bumped
 *   on every scripted submit and on reset, and a queued timer whose
 *   run no longer matches is dropped by the `EventFired` handler —
 *   the same invalidation, in the Model instead of a ref.
 * - IconPlaceholder → the lucide glyph only (Plus, file-local below:
 *   no shared builder exists in `@/lib/icons` yet).
 * - `MessageScrollerItem`'s upstream `messageId` prop is not an
 *   option on the bases port (engine bookkeeping, per its header);
 *   `scrollAnchor` is passed exactly as upstream computed it (true
 *   only for the `@chat,` turn).
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
import { Message, MessageContent, MessageHeader } from "@/components/ui/message.ts";
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
// Scripted chat data (upstream's `createChat()` chain + events, verbatim)
// ---------------------------------------------------------------------------

export const GroupChatTextPart = Schema.Struct({
  type: Schema.Literal("text"),
  text: Schema.String,
});
export type GroupChatTextPart = typeof GroupChatTextPart.Type;

export const GroupChatMessageData = Schema.Struct({
  id: Schema.String,
  role: Schema.Literals(["user", "assistant"]),
  parts: Schema.Array(GroupChatTextPart),
  metadata: Schema.optional(Schema.Struct({ name: Schema.optional(Schema.String) })),
});
export type GroupChatMessageData = typeof GroupChatMessageData.Type;

export type GroupChatTurn = {
  readonly user: GroupChatMessageData;
  readonly sleepMs?: number | undefined;
  readonly assistant?: GroupChatMessageData | undefined;
};

/** Upstream's `getMessageText`: the text parts of a message, joined. */
export const getGroupChatMessageText = (message: GroupChatMessageData): string =>
  message.parts.reduce((text, part) => (part.type === "text" ? text + part.text : text), "");

export const GroupChatEventData = Schema.Struct({
  type: Schema.Literals(["user-left", "user-joined", "user-typing"]),
  name: Schema.String,
  order: Schema.Number,
  delayMs: Schema.Number,
});
export type GroupChatEventData = typeof GroupChatEventData.Type;

/** A scripted event queued behind the event timer, with its incremental wait. */
export const GroupChatQueuedEvent = Schema.Struct({
  type: Schema.Literals(["user-left", "user-joined", "user-typing"]),
  name: Schema.String,
  order: Schema.Number,
  delayMs: Schema.Number,
  waitMs: Schema.Number,
  run: Schema.Number,
});
export type GroupChatQueuedEvent = typeof GroupChatQueuedEvent.Type;

const scriptedEvents: ReadonlyArray<GroupChatEventData> = [
  { type: "user-joined", name: "Stella", order: 0.5, delayMs: 2000 },
  { type: "user-typing", name: "Stella", order: 0.5, delayMs: 4000 },
  { type: "user-joined", name: "Marcus", order: 1.5, delayMs: 2000 },
  { type: "user-typing", name: "Marcus", order: 1.5, delayMs: 4000 },
  { type: "user-joined", name: "Aleena", order: 2.5, delayMs: 0 },
  { type: "user-typing", name: "Aleena", order: 3.5, delayMs: 0 },
  { type: "user-left", name: "Aleena", order: 5.5, delayMs: 2000 },
];

const script: ReadonlyArray<GroupChatTurn> = [
  {
    user: {
      id: "user-1",
      role: "user",
      parts: [
        {
          type: "text",
          text: "Hey everyone — dinner this Saturday? I was thinking something casual at my place.",
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
          text: "I'm in! Should we do potluck or does someone want to cook the whole thing?",
        },
      ],
      metadata: { name: "Stella" },
    },
  },
  {
    user: {
      id: "user-3",
      role: "user",
      parts: [{ type: "text", text: "Potluck sounds good. I can handle appetizers and drinks." }],
      metadata: { name: "Marcus" },
    },
  },
  {
    user: {
      id: "user-4",
      role: "user",
      parts: [{ type: "text", text: "Alright! Aleena?" }],
    },
  },
  {
    user: {
      id: "user-5",
      role: "user",
      parts: [{ type: "text", text: "Can't make it. I'm out of town. 😭" }],
      metadata: { name: "Aleena" },
    },
  },
  {
    user: {
      id: "user-6",
      role: "user",
      parts: [{ type: "text", text: "Sorry guys, let's catch up another time. Bye." }],
      metadata: { name: "Aleena" },
    },
  },
  {
    user: {
      id: "user-7",
      role: "user",
      parts: [
        {
          type: "text",
          text: "@chat, can you suggest a menu and split up what each of us should bring?",
        },
      ],
    },
    sleepMs: 1000,
    assistant: {
      id: "assistant-1",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: `Here's a simple **Saturday potluck** for the three of you:

**Who brings what**
- **You:** main — salmon or mushroom risotto
- **Stella:** salad + bread
- **Marcus:** appetizers + drinks
- **Chat:** dessert ideas below

**Menu**
- **Starter:** caprese skewers or whipped ricotta crostini
- **Main:** lemon-herb salmon with roasted asparagus *(or risotto for vegetarians)*
- **Side:** arugula salad with shaved parmesan
- **Dessert:** berry crisp or pistachio gelato

**Timing:** aim for **6:30 PM** so Marcus can set up apps while you finish the main.

Want me to scale this for **6 guests** or swap the main for something vegetarian-only?`,
        },
      ],
    },
  },
];

const INITIAL_MESSAGE_COUNT = 0;

/** Upstream's `initialMessages = chat.get(INITIAL_MESSAGE_COUNT)`: none. */
const initialMessages: ReadonlyArray<GroupChatMessageData> = [];

/** Upstream's initial events: those with `order < INITIAL_MESSAGE_COUNT`. */
const initialEvents: ReadonlyArray<GroupChatEventData> = scriptedEvents.filter(
  (event) => event.order < INITIAL_MESSAGE_COUNT,
);

// ---------------------------------------------------------------------------
// The card
// ---------------------------------------------------------------------------

export const GroupChatMessage = UiSchema.TaggedEnum({
  /** `PromptInput` was submitted with its current value. */
  Submitted: { value: Schema.String },
  /** The pending reply's scripted delay elapsed: append it whole. */
  ReplyArrived: {},
  /** The event timer elapsed for the queue head: fire that event. */
  EventFired: {},
  /** The header new-chat button: upstream's reset handler. */
  StartedOver: {},
});
export type GroupChatMessage = typeof GroupChatMessage.Type;

export const GroupChatModel = Schema.Struct({
  messages: Schema.Array(GroupChatMessageData),
  status: Schema.Literals(["ready", "submitted", "streaming", "error"]),
  cursor: Schema.Number,
  pendingKey: Schema.Number,
  pendingDelayMs: Schema.Number,
  events: Schema.Array(GroupChatEventData),
  eventQueue: Schema.Array(GroupChatQueuedEvent),
  eventKey: Schema.Number,
  eventRun: Schema.Number,
});
export type GroupChatModel = typeof GroupChatModel.Type;

export const GroupChat = Html.component({
  name: "Preview03GroupChat",
  model: GroupChatModel,
  message: GroupChatMessage,
}).make({
  init: () => ({
    messages: [...initialMessages],
    status: "ready" as const,
    cursor: 0,
    pendingKey: 0,
    pendingDelayMs: 0,
    events: [...initialEvents],
    eventQueue: [],
    eventKey: 0,
    eventRun: 0,
  }),
  update: {
    Submitted: ($, { value }) => {
      if (value.trim() === "") return $.evolve({});
      const turn = script[$.model.cursor];
      const scriptedText = turn !== undefined ? getGroupChatMessageText(turn.user) : "";
      const isScripted = turn !== undefined && value === scriptedText;
      const userMessage: GroupChatMessageData = isScripted
        ? turn.user
        : {
            id: `user-${$.model.messages.length + 1}`,
            role: "user",
            parts: [{ type: "text", text: value }],
          };
      const messages = [...$.model.messages, userMessage];
      const cursor = $.model.cursor + (turn !== undefined ? 1 : 0);
      const startsModelTurn = getGroupChatMessageText(userMessage)
        .trim()
        .toLowerCase()
        .startsWith("@chat,");
      if (isScripted && startsModelTurn && turn.assistant !== undefined) {
        return $.evolve({
          messages,
          cursor,
          status: "submitted",
          pendingKey: $.model.pendingKey + 1,
          pendingDelayMs: turn.sleepMs ?? 0,
        });
      }
      if (!isScripted) {
        // Upstream's fallback: a free-typed line goes to the transport,
        // whose reply is the next scripted assistant turn — pending
        // only when that turn has one.
        if (turn?.assistant !== undefined) {
          return $.evolve({
            messages,
            cursor,
            status: "submitted",
            pendingKey: $.model.pendingKey + 1,
            pendingDelayMs: turn.sleepMs ?? 0,
          });
        }
        return $.evolve({ messages, cursor });
      }
      // A scripted group line: queue its slot's events (upstream's
      // setTimeout chain), dropping the sender's pending typing event.
      const messageIndex = $.model.messages.length;
      const senderName = turn.user.metadata?.name;
      const events = $.model.events.filter(
        (event) => !(event.type === "user-typing" && event.name === senderName),
      );
      const run = $.model.eventRun + 1;
      let previousDelayMs = 0;
      const queued: Array<GroupChatQueuedEvent> = [];
      for (const event of scriptedEvents) {
        if (!(event.order > messageIndex && event.order < messageIndex + 1)) continue;
        if (event.type === "user-typing" && event.name === senderName) continue;
        const waitMs = Math.max(0, event.delayMs - previousDelayMs);
        previousDelayMs = event.delayMs;
        queued.push({ ...event, waitMs, run });
      }
      return $.evolve({
        messages,
        cursor,
        events,
        eventQueue: queued,
        eventKey: $.model.eventKey + 1,
        eventRun: run,
      });
    },
    ReplyArrived: ($) => {
      const turn = script[$.model.cursor - 1];
      if (turn?.assistant === undefined) return $.evolve({ status: "ready" });
      return $.evolve({
        messages: [...$.model.messages, turn.assistant],
        status: "ready",
        pendingDelayMs: 0,
      });
    },
    EventFired: ($) => {
      const head = $.model.eventQueue[0];
      if (head === undefined || head.run !== $.model.eventRun) {
        return $.evolve({ eventQueue: [] });
      }
      const events = [
        ...$.model.events.filter(
          (currentEvent) => !(currentEvent.type === head.type && currentEvent.name === head.name),
        ),
        { type: head.type, name: head.name, order: head.order, delayMs: head.delayMs },
      ].sort((a, b) => a.order - b.order);
      return $.evolve({
        events,
        eventQueue: $.model.eventQueue.slice(1),
        eventKey: $.model.eventKey + 1,
      });
    },
    StartedOver: ($) =>
      $.evolve({
        messages: [...initialMessages],
        status: "ready",
        cursor: 0,
        pendingDelayMs: 0,
        events: [...initialEvents],
        eventQueue: [],
        eventRun: $.model.eventRun + 1,
      }),
  },
  subscriptions: ({ model }) => [
    model.status === "submitted" &&
      model.pendingKey > 0 &&
      Subscription.make("pendingReply", `${model.pendingKey}:${model.pendingDelayMs}`, (key) =>
        Stream.fromEffect(Effect.sleep(`${Number(key.split(":")[1] ?? 0)} millis`)).pipe(
          Stream.as(GroupChatMessage.ReplyArrived() as GroupChatMessage),
        ),
      ),
    model.eventQueue.length > 0 &&
      Subscription.make(
        "groupEvent",
        `${model.eventKey}:${model.eventQueue[0]?.waitMs ?? 0}`,
        (key) =>
          Stream.fromEffect(Effect.sleep(`${Number(key.split(":")[1] ?? 0)} millis`)).pipe(
            Stream.as(GroupChatMessage.EventFired() as GroupChatMessage),
          ),
      ),
  ],
  view: (h, model) => {
    const nextMessage = script[model.cursor]?.user;
    const isBusy = model.status === "submitted" || model.status === "streaming";
    const senderName = nextMessage?.metadata?.name ?? "You";
    return Example(
      h,
      {
        title: "Group Chat",
        class: "bg-transparent p-0",
        containerClassName: "flex-1",
      },

      Card(h, { class: "max-h-140 min-h-0 flex-1" }).children(
        CardHeader(h).children(
          CardTitle(h).children("Saturday dinner plans"),
          CardDescription(h, { class: "leading-relaxed" }).children(
            "A group chat with multiple users. Includes tinted bubbles for user messages.",
          ),
          CardAction(h).children(
            Button(h, {
              variant: "outline",
              size: "icon",
              onPress: GroupChatMessage.StartedOver(),
            })
              .attr("aria-label", "Start over")
              .children(PlusIcon(h)),
          ),
        ),
        CardContent(h, { class: "flex-1 overflow-hidden p-0" }).children(
          MessageScroller(h).children(
            MessageScrollerViewport(h).children(
              MessageScrollerContent(h, { class: "p-(--card-spacing)" }).children(
                ...model.messages.flatMap((message, index) => {
                  const isOwnMessage =
                    message.role === "user" && message.metadata?.name === undefined;
                  const startsModelTurn = getGroupChatMessageText(message)
                    .trim()
                    .toLowerCase()
                    .startsWith("@chat,");
                  return [
                    MessageScrollerItem(h, { scrollAnchor: startsModelTurn }).children(
                      Message(h, { align: isOwnMessage ? "end" : "start" })
                        .attr("data-role", message.role)
                        .children(
                          ...(isOwnMessage
                            ? []
                            : [
                                MessageHeader(h).children(
                                  message.role === "assistant"
                                    ? "Chat"
                                    : message.metadata?.name || "Unknown",
                                ),
                              ]),
                          MessageContent(h).children(
                            ...message.parts.map((part) =>
                              PartText(h, {
                                part,
                                variant: message.role === "user" ? "bubble" : "default",
                                tinted: isOwnMessage,
                              }),
                            ),
                          ),
                        ),
                    ),
                    ...model.events
                      .filter((event) => event.order > index && event.order < index + 1)
                      .map((event) => {
                        const marker = Marker(h, {
                          variant: event.type === "user-typing" ? "default" : "separator",
                        });
                        const withRole =
                          event.type === "user-typing" ? marker.attr("role", "status") : marker;
                        return MessageScrollerItem(h, { scrollAnchor: false }).children(
                          withRole.children(
                            MarkerContent(h).children(
                              event.type === "user-joined"
                                ? `${event.name} joined the chat`
                                : event.type === "user-left"
                                  ? `${event.name} left the chat`
                                  : `${event.name} is typing...`,
                            ),
                          ),
                        );
                      }),
                  ];
                }),
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
        CardFooter(h, { class: "flex-col items-stretch gap-2" }).children(
          h.p.class("px-1 text-xs text-muted-foreground").children(`Posting as ${senderName}.`),
          PromptInput(h, {
            key: isBusy
              ? ""
              : nextMessage !== undefined
                ? getGroupChatMessageText(nextMessage)
                : "",
            props: {
              status: model.status,
              defaultValue: isBusy
                ? ""
                : nextMessage !== undefined
                  ? getGroupChatMessageText(nextMessage)
                  : "",
            },
          }),
        ),
      ),
    );
  },
});
