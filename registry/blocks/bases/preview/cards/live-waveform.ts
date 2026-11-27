/**
 * LiveWaveformCard — shadcn/ui block `preview`
 * (cards/live-waveform.tsx), bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a "use client" React file defining a `LiveWaveform`
 * component that draws vertical bars on a <canvas>: when `active`, a
 * WebAudio AnalyserNode fed by `getUserMedia` drives the bars (mirrored
 * in "static" mode, scrolling history in "scrolling" mode); when
 * `processing` (and not active), a requestAnimationFrame loop
 * synthesizes a three-sine processing wave; when idle, the bars fade
 * out leaving a dotted center line. Bars are rounded rects of width
 * `barWidth`, spaced `barGap` apart, centered vertically, with alpha
 * `0.4 + value * 0.6` and optional gradient edge fading. The exported
 * card, `LiveWaveformCard`, holds `active` (false), `processing`
 * (true) and `mode` ("static") in useState, renders the waveform at
 * height 80, barWidth 3, barGap 2, fadeEdges, barColor "gray",
 * historySize 120, and three footer Buttons toggling listening /
 * processing (each toggle clears the other) and the mode. Here the
 * card is a Component: those three values live in the Model, seeded
 * with upstream's initial state, and the Buttons send
 * `ToggledListening` / `ToggledProcessing` / `ToggledMode` Messages
 * whose updates reproduce upstream's toggle logic exactly.
 *
 * The waveform itself is drawn as inline SVG from data: the bar
 * geometry reproduces upstream's canvas math for the state the card
 * loads in — processing, static mode — at the formula's first frame
 * (time advancing by upstream's 0.03 step once): bar count from a
 * nominal 600px container width at barWidth 3 + barGap 2 (120 bars,
 * matching the card's historySize), each bar's value from upstream's
 * static-mode processing computation (center weight
 * `1 - |normalizedPosition| * 0.4` over the three sine waves, clamped
 * to [0.05, 1]), height `max(4, value * 80 * 0.8)`, vertically
 * centered, fill gray at upstream's per-bar alpha, corner radius 1.5.
 * The surrounding markup — the relative container div with its
 * upstream classes, `role="img"` and state-dependent aria-label, the
 * height style, and the idle dotted center line (drawn only when
 * neither active nor processing) — is verbatim upstream.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Canvas/WebAudio/RAF behavior has no Effect-native counterpart and
 *   is not ported: no microphone stream, no AnalyserNode, no canvas,
 *   no ResizeObserver/DPR scaling, and no animation loop. The SVG bars
 *   are frozen at the processing wave's first frame; switching to
 *   listening or scrolling mode, or stopping processing, changes the
 *   aria-label (and, when fully idle, reveals the dotted center line)
 *   but does not recompute the bars — live audio reactivity, the
 *   scrolling history, the fade-to-idle transition, the processing
 *   wave's continued motion and the gradient edge fading
 *   (destination-out compositing) are not reproduced.
 * - Upstream's `LiveWaveform` props beyond what the card passes
 *   (deviceId, sensitivity, fftSize, callbacks, arbitrary div props)
 *   are not part of this port; the waveform is a file-local view
 *   helper fixed to the card's own configuration. Its container keeps
 *   upstream's `relative h-full w-full` classes plus the card's
 *   inline height (80px, as a `style` attribute).
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

// The card's fixed waveform configuration (upstream's props, verbatim).
const BAR_WIDTH = 3;
const BAR_GAP = 2;
const BAR_RADIUS = 1.5;
const BASE_BAR_HEIGHT = 4;
const HEIGHT = 80;
const BAR_COLOR = "gray";

// Bar count for a nominal 600px-wide container at the card's step
// (upstream computes it from the measured container width each frame).
const BAR_COUNT = Math.floor(600 / (BAR_WIDTH + BAR_GAP));

// Upstream's static-mode processing wave at its first frame: the
// animation loop advances `time` by 0.03 before computing, and the
// transition from prior active data starts at progress 0 — with no
// prior data the blend is the identity, so the values below are
// upstream's `processingData` for that frame.
const processingBars = (): ReadonlyArray<number> => {
  const time = 0.03;
  const halfCount = Math.floor(BAR_COUNT / 2);
  const bars: Array<number> = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    const normalizedPosition = (i - halfCount) / halfCount;
    const centerWeight = 1 - Math.abs(normalizedPosition) * 0.4;
    const wave1 = Math.sin(time * 1.5 + normalizedPosition * 3) * 0.25;
    const wave2 = Math.sin(time * 0.8 - normalizedPosition * 2) * 0.2;
    const wave3 = Math.cos(time * 2 + normalizedPosition) * 0.15;
    const combinedWave = wave1 + wave2 + wave3;
    const processingValue = (0.2 + combinedWave) * centerWeight;
    bars.push(Math.max(0.05, Math.min(1, processingValue)));
  }
  return bars;
};

const WAVEFORM_BARS = processingBars();

const LiveWaveform = <Msg>(
  h: Html.H<Msg>,
  options: { readonly active: boolean; readonly processing: boolean },
) =>
  h.div
    .class("relative h-full w-full")
    .attr("style", `height: ${HEIGHT}px`)
    .attr(
      "aria-label",
      options.active
        ? "Live audio waveform"
        : options.processing
          ? "Processing audio"
          : "Audio waveform idle",
    )
    .attr("role", "img")
    .children(
      ...(!options.active && !options.processing
        ? [
            h.div.class(
              "absolute top-1/2 right-0 left-0 -translate-y-1/2 border-t-2 border-dotted border-muted-foreground/20",
            ),
          ]
        : []),
      h
        .el("svg")
        .attrs({
          class: "block h-full w-full",
          "aria-hidden": "true",
          viewBox: `0 0 600 ${HEIGHT}`,
          preserveAspectRatio: "none",
        })
        .children(
          ...WAVEFORM_BARS.map((value, i) => {
            const x = i * (BAR_WIDTH + BAR_GAP);
            const barHeight = Math.max(BASE_BAR_HEIGHT, value * HEIGHT * 0.8);
            const y = HEIGHT / 2 - barHeight / 2;
            return h
              .el("rect")
              .key(String(i))
              .attrs({
                x: String(x),
                y: String(y),
                width: String(BAR_WIDTH),
                height: String(barHeight),
                rx: String(BAR_RADIUS),
                fill: BAR_COLOR,
                opacity: String(0.4 + value * 0.6),
              });
          }),
        ),
    );

export const LiveWaveformCardMessage = UiSchema.TaggedEnum({
  ToggledListening: {},
  ToggledProcessing: {},
  ToggledMode: {},
});

export const LiveWaveformCard = Html.component({
  name: "LiveWaveformCard",
  model: Schema.Struct({
    active: Schema.Boolean,
    processing: Schema.Boolean,
    mode: Schema.Literals(["static", "scrolling"]),
  }),
  message: LiveWaveformCardMessage,
}).make({
  init: () => ({ active: false, processing: true, mode: "static" }),
  update: {
    // Upstream's handleToggleActive: flipping listening on clears processing.
    ToggledListening: ($) =>
      $.evolve({
        active: !$.model.active,
        ...(!$.model.active ? { processing: false } : {}),
      }),
    // Upstream's handleToggleProcessing: flipping processing on clears listening.
    ToggledProcessing: ($) =>
      $.evolve({
        processing: !$.model.processing,
        ...(!$.model.processing ? { active: false } : {}),
      }),
    ToggledMode: ($) => $.evolve({ mode: $.model.mode === "static" ? "scrolling" : "static" }),
  },
  view: (h, model) =>
    Card(h).children(
      CardHeader(h).children(
        CardTitle(h).children("Live Audio Waveform"),
        CardDescription(h).children(
          "Real-time microphone input visualization with audio reactivity",
        ),
      ),
      CardContent(h).children(
        LiveWaveform(h, { active: model.active, processing: model.processing }),
      ),
      CardFooter(h, { class: "gap-2" }).children(
        Button(h, {
          size: "sm",
          variant: model.active ? "default" : "outline",
          onPress: LiveWaveformCardMessage.ToggledListening(),
        }).children(`${model.active ? "Stop" : "Start"} Listening`),
        Button(h, {
          size: "sm",
          variant: model.processing ? "default" : "outline",
          onPress: LiveWaveformCardMessage.ToggledProcessing(),
        }).children(`${model.processing ? "Stop" : "Start"} Processing`),
        Button(h, {
          size: "sm",
          variant: "outline",
          onPress: LiveWaveformCardMessage.ToggledMode(),
        }).children(model.mode === "static" ? "Static" : "Scrolling"),
      ),
    ),
});
