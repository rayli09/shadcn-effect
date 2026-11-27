/**
 * ToolChat — shadcn/ui block `preview-03` (cards/tool-chat.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream renders this card standalone (it is not in preview-03's
 * index grid). It is a `useChat` card driven by the scripted
 * `@shadcn/helpers/ai-sdk` transport (`createChat()` chain: one user
 * turn, a sleep, and an assistant turn built with
 * `writer.reasoning(...)`, a `writer.tool("getDeploymentHealth", …)`
 * call whose handle sleeps and then outputs, and `writer.text(...)`).
 * That package is create-site infra, not a registry dependency, so
 * here the chain is a verbatim data constant (`script` below: the
 * tool's title, input and output included) and the card is an
 * `Html.component` whose Model owns the messages, the chat status,
 * the script cursor and the pending reply. `PromptInput` (the
 * sibling port in `../components/prompt-input.ts`) is prefilled with
 * the next scripted user line; on the card's `Submitted` message the user
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
 * reasoning parts through `PartReasoning`, and tool parts (upstream's
 * `isToolPart`: `dynamic-tool` or any `tool-*` type) through
 * `PartTool`. `MessageScrollerProvider` is not reproduced: the bases
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
 *   chat. The tool part therefore arrives in its final
 *   `output-available` state with its input and output: the
 *   intermediate `input-streaming` / `input-available` states and
 *   the tool handle's own `sleep(1200)` are streaming cadence inside
 *   one reply and are not reproduced (`PartTool` still renders every
 *   state upstream defines, including `output-error`). Upstream's
 *   `streaming` status is likewise never entered (the status union
 *   keeps it for parity with `PromptInput`).
 * - The tool part's `toolCallId` is a deterministic local id
 *   (`tool-call-1`): upstream's writer generated one at runtime and
 *   no id is rendered by `PartTool`.
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
 *   `PartTool(h, { part, class })`.
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
import { PartReasoning } from "../components/part-reasoning.ts";
import { PartText } from "../components/part-text.ts";
import { PartTool } from "../components/part-tool.ts";
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

export const ToolChatTextPart = Schema.Struct({
  type: Schema.Literal("text"),
  text: Schema.String,
});
export type ToolChatTextPart = typeof ToolChatTextPart.Type;

export const ToolChatReasoningPart = Schema.Struct({
  type: Schema.Literal("reasoning"),
  text: Schema.String,
  state: Schema.optional(Schema.Literals(["streaming", "done"])),
});
export type ToolChatReasoningPart = typeof ToolChatReasoningPart.Type;

/**
 * Upstream's typed tool (`UIMessage<…, Tools>`): the
 * `getDeploymentHealth` tool part, with the input / output shapes of
 * upstream's `Tools` type as data.
 */
export const ToolChatToolPart = Schema.Struct({
  type: Schema.Literal("tool-getDeploymentHealth"),
  toolCallId: Schema.String,
  title: Schema.optional(Schema.String),
  state: Schema.Literals([
    "input-streaming",
    "input-available",
    "output-available",
    "output-error",
  ]),
  input: Schema.optional(Schema.Unknown),
  output: Schema.optional(Schema.Unknown),
  errorText: Schema.optional(Schema.String),
});
export type ToolChatToolPart = typeof ToolChatToolPart.Type;

export const ToolChatPart = Schema.Union([
  ToolChatTextPart,
  ToolChatReasoningPart,
  ToolChatToolPart,
]);
export type ToolChatPart = typeof ToolChatPart.Type;

export const ToolChatMessageData = Schema.Struct({
  id: Schema.String,
  role: Schema.Literals(["user", "assistant"]),
  parts: Schema.Array(ToolChatPart),
});
export type ToolChatMessageData = typeof ToolChatMessageData.Type;

export type ToolChatTurn = {
  readonly user: ToolChatMessageData;
  readonly sleepMs?: number | undefined;
  readonly assistant?: ToolChatMessageData | undefined;
};

/** Upstream's `getMessageText`: the text parts of a message, joined. */
export const getToolChatMessageText = (message: ToolChatMessageData): string =>
  message.parts.reduce((text, part) => (part.type === "text" ? text + part.text : text), "");

/** Upstream's `isToolPart` type guard, over the local part union. */
const isToolPart = (part: ToolChatPart): part is ToolChatToolPart =>
  part.type === "tool-getDeploymentHealth";

const script: ReadonlyArray<ToolChatTurn> = [
  {
    user: {
      id: "user-1",
      role: "user",
      parts: [{ type: "text", text: "Check the deployment health for the checkout flow." }],
    },
    sleepMs: 1000,
    assistant: {
      id: "assistant-1",
      role: "assistant",
      parts: [
        {
          type: "reasoning",
          text: "The user needs current operational state, so I should call a deployment-health tool before making a recommendation.",
          state: "done",
        },
        {
          type: "tool-getDeploymentHealth",
          toolCallId: "tool-call-1",
          title: "Checking deployment health",
          state: "output-available",
          input: {
            project: "checkout",
            region: "iad1",
          },
          output: {
            status: "healthy",
            p95: 186,
            errors: 2,
            recommendation: "No rollback needed. Watch error rate for 15 minutes.",
          },
        },
        {
          type: "text",
          text: "The checkout deployment looks healthy. P95 latency is **186ms** with **2 recent errors**, so I would keep the release live and watch it for another 15 minutes.",
        },
      ],
    },
  },
];

/** Upstream's `initialMessages = chat.get(0)`: no messages on load. */
const initialMessages: ReadonlyArray<ToolChatMessageData> = [];

// ---------------------------------------------------------------------------
// The card
// ---------------------------------------------------------------------------

export const ToolChatMessage = UiSchema.TaggedEnum({
  /** `PromptInput` was submitted with its current value. */
  Submitted: { value: Schema.String },
  /** The pending reply's scripted delay elapsed: append it whole. */
  ReplyArrived: {},
  /** The header new-chat button: upstream's `setMessages(initialMessages)`. */
  StartedOver: {},
});
export type ToolChatMessage = typeof ToolChatMessage.Type;

export const ToolChatModel = Schema.Struct({
  messages: Schema.Array(ToolChatMessageData),
  status: Schema.Literals(["ready", "submitted", "streaming", "error"]),
  cursor: Schema.Number,
  pendingKey: Schema.Number,
  pendingDelayMs: Schema.Number,
});
export type ToolChatModel = typeof ToolChatModel.Type;

export const ToolChat = Html.component({
  name: "Preview03ToolChat",
  model: ToolChatModel,
  message: ToolChatMessage,
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
      const scriptedText = turn !== undefined ? getToolChatMessageText(turn.user) : "";
      const text = value.trim() !== "" ? value : scriptedText;
      if (text === "" && turn === undefined) return $.evolve({});
      const userMessage: ToolChatMessageData =
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
          Stream.as(ToolChatMessage.ReplyArrived() as ToolChatMessage),
        ),
      ),
  ],
  view: (h, model) => {
    const nextMessage = script[model.cursor]?.user;
    const isBusy = model.status === "submitted" || model.status === "streaming";
    return Example(
      h,
      {
        title: "Reasoning + Tool",
        class: "bg-transparent p-0",
        containerClassName: "flex-1",
      },

      Card(h, { class: "max-h-140 min-h-0 flex-1" }).children(
        CardHeader(h).children(
          CardTitle(h).children("Deployment check"),
          CardDescription(h).children("Reasoning followed by a tool call and result."),
          CardAction(h).children(
            Button(h, {
              variant: "outline",
              size: "icon",
              onPress: ToolChatMessage.StartedOver(),
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
                              : part.type === "reasoning"
                                ? PartReasoning(h, { part })
                                : isToolPart(part)
                                  ? PartTool(h, { part })
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
            key: isBusy ? "" : nextMessage !== undefined ? getToolChatMessageText(nextMessage) : "",
            props: {
              status: model.status,
              defaultValue: isBusy
                ? ""
                : nextMessage !== undefined
                  ? getToolChatMessageText(nextMessage)
                  : "",
            },
          }),
        ),
      ),
    );
  },
});
