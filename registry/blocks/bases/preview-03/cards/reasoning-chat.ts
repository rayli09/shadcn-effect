/**
 * ReasoningChat — shadcn/ui block `preview-03`
 * (cards/reasoning-chat.tsx), bases generation, ported 1:1 to
 * Effect UI.
 *
 * Upstream: a `useChat` card driven by the scripted
 * `@shadcn/helpers/ai-sdk` transport (`createChat()` chain, with
 * `writer.reasoning(...)` / `writer.sleep(...)` / `writer.text(...)`
 * steps inside each assistant turn). That package is create-site
 * infra, not a registry dependency, so here the chain is a verbatim
 * data constant (`script` below: user text / sleep / assistant reply
 * with its reasoning + text parts, in order) and the card is an
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
 * The header's new-chat button is upstream's
 * `setMessages(initialMessages)`: it resets the messages and the
 * cursor to the initial state. Initial messages are upstream's
 * `chat.get(0)`: none — the card renders empty on load with the
 * first scripted line prefilled. Parts dispatch matches the JSX:
 * text parts through `PartText` (bubble variant for user messages),
 * reasoning parts through `PartReasoning` with
 * `getReasoningLevelLabel(reasoningIndex)` labels, exactly as
 * upstream computed them. `MessageScrollerProvider` is not
 * reproduced: the bases message-scroller port exports no Provider
 * (its header declares this), so the scroller anatomy is drawn
 * directly.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Replies arrive whole after the scripted delay — no token
 *   streaming; the transport is the scripted Model, not a network
 *   chat. The `writer.sleep(600)` pauses between reasoning parts
 *   upstream are streaming cadence inside one reply and are not
 *   reproduced; each reasoning part arrives with the whole reply in
 *   its final (`done`) state. Upstream's `streaming` status is
 *   therefore never entered (the status union keeps it for parity
 *   with `PromptInput`).
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
 *   and `PartText(h, { part, role, variant, tinted, class })`,
 *   `PartReasoning(h, { part, label, class })` and
 *   `getReasoningLevelLabel(index)`.
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
import { getReasoningLevelLabel, PartReasoning } from "../components/part-reasoning.ts";
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

export const ReasoningChatTextPart = Schema.Struct({
  type: Schema.Literal("text"),
  text: Schema.String,
});
export type ReasoningChatTextPart = typeof ReasoningChatTextPart.Type;

export const ReasoningChatReasoningPart = Schema.Struct({
  type: Schema.Literal("reasoning"),
  text: Schema.String,
  state: Schema.optional(Schema.Literals(["streaming", "done"])),
});
export type ReasoningChatReasoningPart = typeof ReasoningChatReasoningPart.Type;

export const ReasoningChatPart = Schema.Union([ReasoningChatTextPart, ReasoningChatReasoningPart]);
export type ReasoningChatPart = typeof ReasoningChatPart.Type;

export const ReasoningChatMessageData = Schema.Struct({
  id: Schema.String,
  role: Schema.Literals(["user", "assistant"]),
  parts: Schema.Array(ReasoningChatPart),
});
export type ReasoningChatMessageData = typeof ReasoningChatMessageData.Type;

export type ReasoningChatTurn = {
  readonly user: ReasoningChatMessageData;
  readonly sleepMs?: number | undefined;
  readonly assistant?: ReasoningChatMessageData | undefined;
};

/** Upstream's `getMessageText`: the text parts of a message, joined. */
export const getReasoningChatMessageText = (message: ReasoningChatMessageData): string =>
  message.parts.reduce((text, part) => (part.type === "text" ? text + part.text : text), "");

const script: ReadonlyArray<ReasoningChatTurn> = [
  {
    user: {
      id: "user-1",
      role: "user",
      parts: [
        {
          type: "text",
          text: "Explain why the dashboard feels slow even though the API is fast.",
        },
      ],
    },
    sleepMs: 1000,
    assistant: {
      id: "assistant-1",
      role: "assistant",
      parts: [
        {
          type: "reasoning",
          text: `The user is separating perceived performance from backend latency. They likely measured API response times and found them acceptable, but users still complain about slowness.

I should avoid jumping straight to server-side optimizations and instead frame the answer around what people actually experience.`,
          state: "done",
        },
        {
          type: "reasoning",
          text: `Perceived slowness usually lives in the gap between user action and visible feedback:

- input latency before the request fires
- loading state placement and timing
- layout shifts when data arrives
- whether optimistic UI gives immediate acknowledgment

For a dashboard, I should also consider chart re-renders, independent card fetches, and skeleton dimensions that do not match the final layout.`,
          state: "done",
        },
        {
          type: "reasoning",
          text: `Ranking likely bottlenecks for this scenario:

1. No immediate feedback on filter or refresh actions
2. Skeleton cards that collapse or expand when data lands
3. Waterfall requests where each widget fetches on its own
4. Empty-state flashes because stale data is not shown while revalidating

The answer should stay practical and ordered by impact, not by how technical each fix sounds.`,
          state: "done",
        },
        {
          type: "text",
          text: `The API can be fast while the interface still **feels** slow.

Start by checking:

- whether the button gives immediate feedback
- whether skeletons match the final layout
- whether any reflow happens after data arrives
- whether the loading state appears near the content it replaces`,
        },
      ],
    },
  },
  {
    user: {
      id: "user-2",
      role: "user",
      parts: [{ type: "text", text: "What should I fix first?" }],
    },
    sleepMs: 1000,
    assistant: {
      id: "assistant-2",
      role: "assistant",
      parts: [
        {
          type: "reasoning",
          text: `The user wants prioritization, not another diagnostic list.

Given the dashboard context, immediate feedback and layout stability usually beat micro-optimizations. I should recommend one fix with a clear way to measure success.`,
          state: "done",
        },
        {
          type: "text",
          text: `Fix **immediate feedback** first.

When someone clicks "Refresh", the button should disable and show a spinner within one frame — before the network round trip. That single change often cuts perceived latency in half.

Measure it with a screen recording and count frames between click and visual response.`,
        },
      ],
    },
  },
];

/** Upstream's `initialMessages = chat.get(0)`: no messages on load. */
const initialMessages: ReadonlyArray<ReasoningChatMessageData> = [];

// ---------------------------------------------------------------------------
// The card
// ---------------------------------------------------------------------------

export const ReasoningChatMessage = UiSchema.TaggedEnum({
  /** `PromptInput` was submitted with its current value. */
  Submitted: { value: Schema.String },
  /** The pending reply's scripted delay elapsed: append it whole. */
  ReplyArrived: {},
  /** The header new-chat button: upstream's `setMessages(initialMessages)`. */
  StartedOver: {},
});
export type ReasoningChatMessage = typeof ReasoningChatMessage.Type;

export const ReasoningChatModel = Schema.Struct({
  messages: Schema.Array(ReasoningChatMessageData),
  status: Schema.Literals(["ready", "submitted", "streaming", "error"]),
  cursor: Schema.Number,
  pendingKey: Schema.Number,
  pendingDelayMs: Schema.Number,
});
export type ReasoningChatModel = typeof ReasoningChatModel.Type;

export const ReasoningChat = Html.component({
  name: "Preview03ReasoningChat",
  model: ReasoningChatModel,
  message: ReasoningChatMessage,
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
      const scriptedText = turn !== undefined ? getReasoningChatMessageText(turn.user) : "";
      const text = value.trim() !== "" ? value : scriptedText;
      if (text === "" && turn === undefined) return $.evolve({});
      const userMessage: ReasoningChatMessageData =
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
          Stream.as(ReasoningChatMessage.ReplyArrived() as ReasoningChatMessage),
        ),
      ),
  ],
  view: (h, model) => {
    const nextMessage = script[model.cursor]?.user;
    const isBusy = model.status === "submitted" || model.status === "streaming";
    return Example(
      h,
      {
        title: "Reasoning",
        class: "bg-transparent p-0",
        containerClassName: "flex-1",
      },

      Card(h, { class: "max-h-140 min-h-0 flex-1" }).children(
        CardHeader(h).children(
          CardTitle(h).children("Reasoning trace"),
          CardDescription(h).children("Layered reasoning traces across multiple assistant turns."),
          CardAction(h).children(
            Button(h, {
              variant: "outline",
              size: "icon",
              onPress: ReasoningChatMessage.StartedOver(),
            })
              .attr("aria-label", "Start over")
              .children(PlusIcon(h)),
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
                        MessageContent(h, {
                          class:
                            message.role === "user"
                              ? "flex-col items-end gap-2"
                              : "flex-col items-start gap-2",
                        }).children(
                          ...message.parts.map((part, index) => {
                            const reasoningIndex =
                              part.type === "reasoning"
                                ? message.parts
                                    .slice(0, index)
                                    .filter((currentPart) => currentPart.type === "reasoning")
                                    .length
                                : 0;
                            return part.type === "text"
                              ? PartText(h, {
                                  part,
                                  variant: message.role === "user" ? "bubble" : "default",
                                })
                              : part.type === "reasoning"
                                ? PartReasoning(h, {
                                    part,
                                    label: getReasoningLevelLabel(reasoningIndex),
                                  })
                                : "";
                          }),
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
                ? getReasoningChatMessageText(nextMessage)
                : "",
            props: {
              status: model.status,
              defaultValue: isBusy
                ? ""
                : nextMessage !== undefined
                  ? getReasoningChatMessageText(nextMessage)
                  : "",
            },
          }),
        ),
      ),
    );
  },
});
