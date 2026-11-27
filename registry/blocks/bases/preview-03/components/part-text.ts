/**
 * PartText — shadcn/ui block `preview-03`
 * (registry/bases/radix/blocks/preview-03/components/part-text.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering an AI SDK
 * `TextUIPart` as a shadcn `Bubble` + `BubbleContent`. The bubble
 * variant is derived exactly as upstream: an explicit
 * `variant="bubble"` wins (`tinted` when the `tinted` prop is set,
 * otherwise `default`), else `default` for the user role and `ghost`
 * for every other role. The content is the raw text for the user role
 * / bubble variant, and a `<Markdown animated>` render otherwise.
 * Here: a view function over this generation's `Bubble` /
 * `BubbleContent` ports (`@/components/ui/bubble.ts`), with the part
 * data as a local structural type mirroring the fields the JSX reads
 * (the `ai` package is banned in this registry).
 *
 * Declared divergences (anything else is a bug):
 *
 * - There is no markdown engine behind `@/components/markdown` in
 *   this registry, so the assistant / non-bubble branch renders
 *   `part.text` as-is inside the same `BubbleContent` markup and
 *   classes instead of markdown-rendered HTML. The user / bubble
 *   branch is upstream's raw text already, so it is exact.
 * - Upstream returns `null` for a part whose `type` is not `"text"`;
 *   a view function must return one node, so a mismatched part
 *   renders an empty `span` (nothing visible). Callers dispatch on
 *   `part.type` first, as upstream's cards do.
 * - Upstream spreads the remaining `Bubble` props (`Omit<...,
 *   "children" | "part" | "variant">`) onto the Bubble; the only prop
 *   here is `class` (upstream's `className`), appended to the
 *   Bubble's classes exactly as upstream's spread + `cn(...)` did.
 */
import type { Html } from "@effect/ui/html";
import { Bubble, BubbleContent, type BubbleVariant } from "@/components/ui/bubble.ts";

/** The fields of an AI SDK text part that the upstream JSX reads. */
export type TextPart = {
  readonly type: "text";
  readonly text: string;
};

export type PartTextVariant = "default" | "bubble";

export type MessageRole = "user" | "system" | "assistant";

export const PartText = <Msg, R = never>(
  h: Html.H<Msg>,
  options: {
    readonly part: TextPart;
    readonly role?: MessageRole | undefined;
    readonly variant?: PartTextVariant | undefined;
    readonly tinted?: boolean | undefined;
    readonly class?: string | undefined;
  },
) => {
  const { part, role, variant } = options;
  if (part.type !== "text") {
    return h.span;
  }
  const bubbleVariant: BubbleVariant =
    variant === "bubble"
      ? options.tinted === true
        ? "tinted"
        : "default"
      : role === "user"
        ? "default"
        : "ghost";
  return Bubble(h, { variant: bubbleVariant, class: options.class }).children(
    BubbleContent(h).children(part.text),
  );
};
