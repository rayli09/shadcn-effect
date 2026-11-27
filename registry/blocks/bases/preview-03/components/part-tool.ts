/**
 * PartTool — shadcn/ui block `preview-03`
 * (registry/bases/radix/blocks/preview-03/components/part-tool.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering an AI SDK tool part
 * (`tool-<name>` or `dynamic-tool`) as a bordered card
 * (`data-slot="part-tool"`, `data-state` = the part's state): a header
 * row with a Settings icon tile, the humanized tool title over the
 * raw tool name, and an outline Badge with the state label (dashes
 * replaced by spaces, capitalized by the Badge's `capitalize` class);
 * when the part carries input, output or an error, a `Separator` and
 * a details grid follow — `Input` / `Output` sections with `<pre>`
 * blocks (`formatValue`: strings raw, everything else
 * `JSON.stringify(value, null, 2)`) and a destructive error box. The
 * `getToolName` / `getToolTitle` / `formatValue` helpers are ported
 * verbatim. Here: a view function over this generation's `Badge` /
 * `Separator` ports (`@/components/ui/badge.ts`,
 * `@/components/ui/separator.ts`), with the part data as a local
 * structural type identical to upstream's own local `ToolPart` type
 * (the `ai` package is banned in this registry).
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `<IconPlaceholder lucide="SettingsIcon" ... />` names
 *   five icon sets; only the lucide glyph renders here —
 *   `SettingsIcon` below is a file-local builder over the shared
 *   `icon()` helper in `@/lib/icons`, node data copied verbatim from
 *   lucide's `settings` SVG (ISC).
 * - Upstream returns `null` for a part that is neither `dynamic-tool`
 *   nor `tool-*`; a view function must return one node, so a
 *   mismatched part renders an empty `span` (nothing visible).
 *   Callers dispatch on `part.type` first, as upstream's cards do.
 * - Upstream spreads `React.ComponentProps<"div">` onto the root; the
 *   only prop here is `class` (upstream's `className`), appended to
 *   the root's classes exactly as upstream's `cn(...)` did.
 * - `formatValue` returns `""` for values `JSON.stringify` cannot
 *   represent (upstream renders React's nothing for `undefined`);
 *   the rendered result is the same empty `<pre>`.
 */
import type { Html } from "@effect/ui/html";
import { Badge } from "@/components/ui/badge.ts";
import { Separator } from "@/components/ui/separator.ts";
import { icon, type IconOptions } from "@/lib/icons";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Icons — file-local builders (D-7) for glyphs `@/lib/icons` does not hoist
// yet; node data copied verbatim from lucide's SVGs (ISC).
// ---------------------------------------------------------------------------

/** Lucide `settings` (ISC). */
const SettingsIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
        },
      ],
      ["circle", { cx: "12", cy: "12", r: "3" }],
    ],
    options,
  );

// ---------------------------------------------------------------------------
// PartTool
// ---------------------------------------------------------------------------

/** Upstream's local tool-part type, field for field. */
export type ToolPart = {
  readonly type: string;
  readonly toolCallId: string;
  readonly toolName?: string | undefined;
  readonly title?: string | undefined;
  readonly state: string;
  readonly input?: unknown;
  readonly output?: unknown;
  readonly errorText?: string | undefined;
};

const getToolName = (part: ToolPart): string =>
  part.type === "dynamic-tool" ? (part.toolName ?? "dynamicTool") : part.type.replace("tool-", "");

const getToolTitle = (part: ToolPart): string => {
  if (typeof part.title === "string") {
    return part.title;
  }
  return getToolName(part)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value, null, 2) ?? "";
};

export const PartTool = <Msg, R = never>(
  h: Html.H<Msg>,
  options: {
    readonly part: ToolPart;
    readonly class?: string | undefined;
  },
) => {
  const { part } = options;
  if (part.type !== "dynamic-tool" && !part.type.startsWith("tool-")) {
    return h.span;
  }
  const input = part.input;
  const output = part.output;
  const errorText = part.errorText;
  const stateLabel = part.state.replace(/-/g, " ");
  const section = (label: string, value: unknown, preClass: string) =>
    h.div
      .class("grid gap-1")
      .children(
        h.div.class("text-xs font-medium text-muted-foreground").children(label),
        h.pre
          .class(cn("overflow-auto rounded-md bg-background p-2 text-xs leading-relaxed", preClass))
          .children(formatValue(value)),
      );
  return h.div
    .attr("data-slot", "part-tool")
    .attr("data-state", part.state)
    .class(cn("w-full max-w-full min-w-0 rounded-lg border bg-muted/40 text-sm", options.class))
    .children(
      h.div
        .class("flex min-w-0 items-center gap-2 px-3 py-2")
        .children(
          h.span
            .class(
              "flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground",
            )
            .children(SettingsIcon(h, { class: "size-4" })),
          h.div
            .class("min-w-0 flex-1")
            .children(
              h.div.class("truncate font-medium").children(getToolTitle(part)),
              h.div.class("truncate text-xs text-muted-foreground").children(getToolName(part)),
            ),
          Badge(h, { variant: "outline", class: "capitalize" }).children(stateLabel),
        ),
      ...(input !== undefined || output !== undefined || errorText
        ? [
            Separator(h),
            h.div
              .class("grid gap-3 p-3")
              .children(
                ...(input !== undefined ? [section("Input", input, "max-h-32")] : []),
                ...(output !== undefined ? [section("Output", output, "max-h-40")] : []),
                ...(errorText
                  ? [
                      h.div
                        .class(
                          "rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive",
                        )
                        .children(errorText),
                    ]
                  : []),
              ),
          ]
        : []),
    );
};
