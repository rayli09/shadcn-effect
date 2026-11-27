/**
 * PartReasoning — shadcn/ui block `preview-03`
 * (registry/bases/radix/blocks/preview-03/components/part-reasoning.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering an AI SDK
 * `ReasoningUIPart` as a full-width div (`data-slot="part-reasoning"`)
 * holding a `shimmer` div whose span carries the reasoning text raw
 * (`whitespace-pre-wrap`) — upstream imports `Markdown` here but its
 * render path never uses it, so the text is exact, no markdown seam.
 * The module also exports `getReasoningLevelLabel` over a four-entry
 * label table, ported verbatim below. Here: a view function plus the
 * label helper, with the part data as a local structural type
 * mirroring the fields the JSX reads (the `ai` package is banned in
 * this registry).
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's local `PartReasoningTrigger` (a Brain icon + label
 *   strip) is defined but never rendered or exported upstream — dead
 *   code — so it is not ported. For the same reason the `label` prop
 *   is accepted (cards pass `getReasoningLevelLabel(...)`) but, as
 *   upstream, never reaches the rendered output; upstream's
 *   `isStreaming` local is likewise computed and unused, so `state`
 *   is read by nothing here either.
 * - Upstream returns `null` for a part whose `type` is not
 *   `"reasoning"`; a view function must return one node, so a
 *   mismatched part renders an empty `span` (nothing visible).
 *   Callers dispatch on `part.type` first, as upstream's cards do.
 * - Upstream spreads `React.ComponentProps<"div">` onto the root; the
 *   only prop here is `class` (upstream's `className`), appended to
 *   the root's classes exactly as upstream's `cn(...)` did.
 * - The `<IconPlaceholder lucide="BrainIcon" ... />` in the unrendered
 *   trigger names five icon sets; per this registry's convention only
 *   the lucide glyph would render — moot here, since the trigger
 *   itself is not ported (see above).
 */
import type { Html } from "@effect/ui/html";
import { cn } from "@/lib/utils";

/** The fields of an AI SDK reasoning part that the upstream JSX reads. */
export type ReasoningPart = {
  readonly type: "reasoning";
  readonly text: string;
  readonly state?: "streaming" | "done" | undefined;
};

export const REASONING_LEVEL_LABELS = [
  "Understanding",
  "Analyzing",
  "Prioritizing",
  "Refining",
] as const;

export const getReasoningLevelLabel = (index: number): string =>
  REASONING_LEVEL_LABELS[index] ?? `Reasoning ${index + 1}`;

export const PartReasoning = <Msg, R = never>(
  h: Html.H<Msg>,
  options: {
    readonly part: ReasoningPart;
    readonly label?: string | undefined;
    readonly class?: string | undefined;
  },
) => {
  const { part } = options;
  if (part.type !== "reasoning") {
    return h.span;
  }
  return h.div
    .attr("data-slot", "part-reasoning")
    .class(cn("w-full max-w-full min-w-0", options.class))
    .children(
      h.div
        .class("w-full shimmer")
        .children(h.span.class("whitespace-pre-wrap").children(part.text)),
    );
};
