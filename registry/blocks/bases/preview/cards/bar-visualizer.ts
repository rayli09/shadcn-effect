/**
 * BarVisualizerCard — shadcn/ui block `preview`
 * (cards/bar-visualizer.tsx), bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a "use client" React file defining a `BarVisualizer`
 * component — a row of vertical bars whose heights come from a
 * multi-band volume analysis of a MediaStream (WebAudio AnalyserNode,
 * `useMultibandVolume`), or, in `demo` mode, from a
 * requestAnimationFrame loop synthesizing sine-wave bands — with bar
 * highlighting driven by a second RAF animator (`useBarAnimator`)
 * whose sequence depends on the agent state (connecting / initializing
 * / listening / speaking / thinking). The exported card,
 * `BarVisualizerCard`, holds the state in `useState("speaking")`,
 * renders the visualizer in demo mode (20 bars, minHeight 15,
 * maxHeight 90, class "h-40 max-w-full") and three footer Buttons that
 * switch the state, the active one in the default variant. Here the
 * card is a Component: the agent state lives in the Model, seeded with
 * upstream's "speaking", and the footer Buttons send `SelectedState`
 * Messages carrying the state each one selects.
 *
 * The bars themselves are drawn as styled divs from data, exactly as
 * upstream's memoized `Bar` renders them: same container markup and
 * classes, same per-bar classes (including `data-highlighted` and the
 * speaking / thinking conditionals), and the same height computation
 * (`min(maxHeight, max(minHeight, volume * 100 + 5))` percent, carried
 * as a `style` attribute).
 *
 * Declared divergences (anything else is a bug):
 *
 * - Canvas/WebAudio/RAF behavior has no Effect-native counterpart and
 *   is not ported: there is no microphone stream, no AnalyserNode, and
 *   no animation loop. The band values are the demo generator's
 *   deterministic first frame — upstream's formula
 *   `sin(time * 2 + i * 0.5) * 0.3 + 0.5`, clamped to [0.1, 1], at
 *   time 0 and without its `Math.random() * 0.2` noise term — computed
 *   once from the same bar count the card passes (20). For states
 *   other than speaking/listening upstream's demo loop pins every band
 *   to 0.2, and so does this port.
 * - The highlight animator is frozen at its first frame: speaking
 *   highlights every bar (upstream's all-indices sequence), connecting
 *   highlights the first sequence pair [0, barCount - 1], and
 *   listening highlights the center bar — the initial frames of
 *   upstream's `generateConnectingSequenceBar` /
 *   `generateListeningSequenceBar`. The cyclic RAF advancement, the
 *   thinking state's pulse timing, and the demo volume animation are
 *   not reproduced.
 * - Upstream's `BarVisualizer` props beyond what the card passes
 *   (mediaStream, centerAlign, arbitrary div props) are not part of
 *   this port; the visualizer is a file-local view helper fixed to the
 *   card's own configuration (demo bands, items-end alignment).
 */
import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Button } from "@/components/ui/button.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { cn } from "@/lib/utils";

type AgentState = "connecting" | "initializing" | "listening" | "speaking" | "thinking";

const BAR_COUNT = 20;
const MIN_HEIGHT = 15;
const MAX_HEIGHT = 90;

// The demo band generator's deterministic first frame (see header):
// upstream's sine formula at time 0, minus its random noise term; for
// non-speaking/listening states upstream pins every band to 0.2.
const demoBands = (state: AgentState): ReadonlyArray<number> =>
  state !== "speaking" && state !== "listening"
    ? new Array<number>(BAR_COUNT).fill(0.2)
    : Array.from({ length: BAR_COUNT }, (_, i) =>
        Math.max(0.1, Math.min(1, Math.sin(i * 0.5) * 0.3 + 0.5)),
      );

// The highlight animator's first frame per state (see header).
const highlightedIndices = (state: AgentState): ReadonlyArray<number> => {
  if (state === "thinking" || state === "listening") {
    return [Math.floor(BAR_COUNT / 2)];
  }
  if (state === "connecting" || state === "initializing") {
    return [0, BAR_COUNT - 1];
  }
  return Array.from({ length: BAR_COUNT }, (_, idx) => idx);
};

const Bar = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly heightPct: number;
    readonly isHighlighted: boolean;
    readonly state?: AgentState | undefined;
  },
) =>
  h.div
    .attr("data-highlighted", String(options.isHighlighted))
    .class(
      cn(
        "max-w-[12px] min-w-[8px] flex-1 transition-all duration-150",
        "rounded-full",
        "bg-border data-[highlighted=true]:bg-chart-3",
        options.state === "speaking" && "bg-chart-3",
        options.state === "thinking" && options.isHighlighted && "animate-pulse",
      ),
    )
    .attr(
      "style",
      `height: ${options.heightPct}%${options.state === "thinking" ? "; animation-duration: 300ms" : ""}`,
    );

const BarVisualizer = <Msg>(h: Html.H<Msg>, options: { readonly state: AgentState }) => {
  const volumeBands = demoBands(options.state);
  const highlighted = highlightedIndices(options.state);
  return h.div
    .attr("data-state", options.state)
    .class(
      "relative flex justify-center gap-1.5 items-end h-32 w-full overflow-hidden rounded-lg bg-muted p-4 h-40 max-w-full",
    )
    .children(
      ...volumeBands.map((volume, index) => {
        const heightPct = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, volume * 100 + 5));
        const isHighlighted = highlighted.includes(index);
        return Bar(h, { heightPct, isHighlighted, state: options.state }).key(String(index));
      }),
    );
};

export const BarVisualizerCardMessage = UiSchema.TaggedEnum({
  SelectedState: { state: Schema.Literals(["connecting", "listening", "speaking"]) },
});

export const BarVisualizerCard = Html.component({
  name: "BarVisualizerCard",
  model: Schema.Struct({
    state: Schema.Literals(["connecting", "initializing", "listening", "speaking", "thinking"]),
  }),
  message: BarVisualizerCardMessage,
}).make({
  init: () => ({ state: "speaking" }),
  update: {
    SelectedState: ($, { state }) => $.evolve({ state }),
  },
  view: (h, model) =>
    Card(h).children(
      CardHeader(h).children(
        CardTitle(h).children("Audio Frequency Visualizer"),
        CardDescription(h).children(
          "Real-time frequency band visualization with animated state transitions",
        ),
      ),
      CardContent(h).children(BarVisualizer(h, { state: model.state })),
      CardFooter(h, { class: "gap-2" }).children(
        Button(h, {
          size: "sm",
          variant: model.state === "connecting" ? "default" : "outline",
          onPress: BarVisualizerCardMessage.SelectedState({ state: "connecting" }),
        }).children("Connecting"),
        Button(h, {
          size: "sm",
          variant: model.state === "listening" ? "default" : "outline",
          onPress: BarVisualizerCardMessage.SelectedState({ state: "listening" }),
        }).children("Listening"),
        Button(h, {
          size: "sm",
          variant: model.state === "speaking" ? "default" : "outline",
          onPress: BarVisualizerCardMessage.SelectedState({ state: "speaking" }),
        }).children("Speaking"),
      ),
    ),
});
