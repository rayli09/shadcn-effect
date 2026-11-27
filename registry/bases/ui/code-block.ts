/**
 * CodeBlock (bases generation) — shadcn/ui `code-block`, which exists only
 * in upstream's bases generation (there is no new-york-v4 file), ported 1:1
 * to Effect UI with the bases class layer: structural classes inline plus
 * `cn-code-block-*` hooks whose utilities live in the style presets.
 *
 * Upstream: pure view components, except `CodeBlockContent`'s line
 * splitting and `CodeBlockCopyButton`'s clipboard + copied state. Here:
 *
 * - `CodeBlock`, `CodeBlockHeader`, `CodeBlockTitle`, `CodeBlockActions`,
 *   `CodeBlockContent`, `CodeBlockLine`, `CodeBlockFooter` are view
 *   functions, exactly as upstream. Class strings are byte-for-byte the
 *   bases strings; `data-slot` / `data-variant` / `data-size` /
 *   `data-copied` / `data-wrap` / `data-numbered` are preserved.
 * - Syntax highlighting is NOT ported: upstream's site wraps a
 *   `use-highlighted-code` hook that produces tokenized children, and the
 *   registry file itself only renders them. Highlighted code is
 *   consumer-supplied content here — pass your highlighted lines as
 *   `children` (or as `CodeBlockLine`s), or pass a plain `code` string
 *   with `lineNumbers` and the content splits it into lines exactly as
 *   upstream does for string children (`.replace(/\n$/, "")` then split
 *   on `"\n"` — upstream's regex, verbatim).
 * - `CodeBlockCopyButton` is a headless Component (stateful, per the
 *   porting rules; headless per D-6, since upstream returns a two-node
 *   fragment and a component view here returns one node): its Model owns
 *   `copied`, a press runs an inline Command that writes `props.value`
 *   to `navigator.clipboard` (upstream:
 *   `navigator.clipboard.writeText(value).then(() => setCopied(true))` —
 *   a failed write leaves `copied` false, as upstream's empty catch
 *   does), and a subscription clears `copied` after 2 seconds,
 *   upstream's `setTimeout(…, 2000)` reset. The view closure draws the
 *   two parts and swaps the icon / live text from the `copied` datum:
 *
 *   CodeBlockCopyButton(h, {
 *     props: { value: code },
 *     view: (cb) => [
 *       cb.button(h.button).children(cb.copied ? CheckIcon(h) : CopyIcon(h)),
 *       cb.live(h.span).children(cb.copied ? "Copied" : "")
 *     ]
 *   })
 *
 * Declared divergences:
 *
 * 1. DOM prop spreading (`{...props}`) is not reproduced: each piece
 *    takes `class` plus its documented options; chain further attributes
 *    on the returned builder.
 * 2. `CodeBlockContent`'s `style` prop: upstream merges
 *    `{ counterReset: `line ${startLine - 1}`, ...style }`; here the
 *    counter is written as a `style` attribute, and chaining
 *    `.attr("style", …)` after the part replaces it rather than merging.
 * 3. `CodeBlockLine`'s empty-line rule (an empty line renders `"\n"` so
 *    copying a selection keeps blank lines) is decided from the
 *    `children` value when it is a string / array / undefined, as
 *    upstream decides it from its React children; pre-built element
 *    children are always treated as non-empty.
 * 4. `CodeBlockCopyButton`'s consumer `onClick` is not reproduced — the
 *    press IS the copy (the component's own `Pressed` message).
 */
import * as Command from "@effect/ui/Command";
import type * as Component from "@effect/ui/Component";
import * as Html from "@effect/ui/html/Html";
import * as Subscription from "@effect/ui/Subscription";
import * as UiSchema from "@effect/ui/UiSchema";
import type * as View from "@effect/ui/View";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import { CheckIcon, icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button, type ButtonSize, type ButtonVariant } from "./button.ts";

// ---------------------------------------------------------------------------
// Icons (lucide path data, ISC — inline SVG, no lucide-react)
// ---------------------------------------------------------------------------

/**
 * Lucide `copy` (ISC) — no shared builder exists in `@/lib/icons` yet, so
 * this one is file-local, built with the shared `icon` helper:
 * <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /> +
 * <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
 */
export const CopyIcon = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  icon(
    h,
    [
      ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }],
      ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }],
    ],
    options,
  );

// ---------------------------------------------------------------------------
// CodeBlock
// ---------------------------------------------------------------------------

export type CodeBlockVariant = "default" | "destructive";
export type CodeBlockSize = "default" | "sm";

const CODE_BLOCK_BASE_CLASS =
  "cn-code-block group/code-block relative flex w-full min-w-0 flex-col overflow-hidden";

const CODE_BLOCK_VARIANTS: Record<CodeBlockVariant, string> = {
  default: "cn-code-block-variant-default",
  destructive: "cn-code-block-variant-destructive",
};

/** Upstream name kept: `codeBlockVariants({ variant })`; here a pure function, not cva. */
export const codeBlockVariants = (
  options: {
    readonly variant?: CodeBlockVariant | undefined;
    readonly class?: string | undefined;
  } = {},
): string =>
  cn(CODE_BLOCK_BASE_CLASS, CODE_BLOCK_VARIANTS[options.variant ?? "default"], options.class);

export const CodeBlock = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly variant?: CodeBlockVariant | undefined;
    readonly size?: CodeBlockSize | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  h.div
    .attrs({
      "data-slot": "code-block",
      "data-variant": options.variant ?? "default",
      "data-size": options.size ?? "default",
    })
    .class(codeBlockVariants({ variant: options.variant, class: options.class }));

// ---------------------------------------------------------------------------
// Header / Title / Actions / Footer
// ---------------------------------------------------------------------------

export const CODE_BLOCK_HEADER_CLASS =
  "cn-code-block-header flex min-w-0 shrink-0 items-center *:has-[>[data-slot=code-block-title]]:min-w-0";

export const CodeBlockHeader = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "code-block-header").class(cn(CODE_BLOCK_HEADER_CLASS, options.class));

export const CODE_BLOCK_TITLE_CLASS =
  "cn-code-block-title min-w-0 truncate [&_svg]:pointer-events-none [&_svg]:inline-block [&_svg]:align-middle";

export const CodeBlockTitle = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "code-block-title").class(cn(CODE_BLOCK_TITLE_CLASS, options.class));

export const CODE_BLOCK_ACTIONS_CLASS =
  "cn-code-block-actions ms-auto flex shrink-0 items-center [[data-slot=code-block]>&]:absolute [[data-slot=code-block]>&]:z-10 [[data-slot=code-block]>&]:opacity-0 [[data-slot=code-block]>&]:transition-opacity [[data-slot=code-block]>&]:group-focus-within/code-block:opacity-100 [[data-slot=code-block]>&]:group-hover/code-block:opacity-100 [[data-slot=code-block]>&]:pointer-coarse:opacity-100";

export const CodeBlockActions = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  h.div.attr("data-slot", "code-block-actions").class(cn(CODE_BLOCK_ACTIONS_CLASS, options.class));

export const CODE_BLOCK_FOOTER_CLASS = "cn-code-block-footer flex min-w-0 shrink-0 items-center";

export const CodeBlockFooter = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "code-block-footer").class(cn(CODE_BLOCK_FOOTER_CLASS, options.class));

// ---------------------------------------------------------------------------
// CodeBlockLine
// ---------------------------------------------------------------------------

export type CodeBlockLineVariant = "default" | "added" | "removed" | "highlighted";

const CODE_BLOCK_LINE_BASE_CLASS =
  "cn-code-block-line relative block min-h-lh after:absolute after:top-0 after:select-none in-data-numbered:col-span-2 in-data-numbered:grid in-data-numbered:grid-cols-subgrid in-data-numbered:[counter-increment:line] in-data-numbered:before:content-[counter(line)] in-data-numbered:before:select-none in-data-numbered:supports-[content:counter(line)_/_'']:before:content-[counter(line)_/_'']";

const CODE_BLOCK_LINE_VARIANTS: Record<CodeBlockLineVariant, string> = {
  default: "cn-code-block-line-variant-default",
  added: "cn-code-block-line-variant-added",
  removed: "cn-code-block-line-variant-removed",
  highlighted: "cn-code-block-line-variant-highlighted",
};

/** Upstream name kept: `codeBlockLineVariants({ variant })`; here a pure function, not cva. */
export const codeBlockLineVariants = (
  options: {
    readonly variant?: CodeBlockLineVariant | undefined;
    readonly class?: string | undefined;
  } = {},
): string =>
  cn(
    CODE_BLOCK_LINE_BASE_CLASS,
    CODE_BLOCK_LINE_VARIANTS[options.variant ?? "default"],
    options.class,
  );

export const CODE_BLOCK_LINE_CONTENT_CLASS = "min-w-0";

/**
 * One line of code. An empty line holds a newline so copying a selection
 * keeps blank lines (upstream's rule; see the header, item 3).
 */
/** What a line's content can be: a node, a string, or a list of them. */
export type CodeBlockLineChildren<Msg, R = never> =
  View.Content<Msg, R> | string | ReadonlyArray<View.Content<Msg, R> | string>;

export const CodeBlockLine = <Msg, R = never>(
  h: Html.H<Msg>,
  options: {
    readonly variant?: CodeBlockLineVariant | undefined;
    readonly class?: string | undefined;
  } = {},
  children?: CodeBlockLineChildren<Msg, R>,
) => {
  const empty =
    children === undefined || children === "" || (Array.isArray(children) && children.length === 0);
  const content: View.Children<Msg, R> = empty
    ? ["\n"]
    : Array.isArray(children)
      ? children
      : [children as View.Content<Msg, R> | string];
  return h.span
    .attrs({
      "data-slot": "code-block-line",
      "data-variant": options.variant ?? "default",
    })
    .class(codeBlockLineVariants({ variant: options.variant, class: options.class }))
    .children(
      h.span
        .attr("data-slot", "code-block-line-content")
        .class(CODE_BLOCK_LINE_CONTENT_CLASS)
        .children(content),
    );
};

// ---------------------------------------------------------------------------
// CodeBlockContent
// ---------------------------------------------------------------------------

export const CODE_BLOCK_CONTENT_CLASS =
  "cn-code-block-content min-h-0 min-w-0 scroll-fade-x scrollbar-thin overflow-auto text-start font-mono outline-none data-wrap:scroll-fade-y data-wrap:wrap-break-word data-wrap:whitespace-pre-wrap";

export const CODE_BLOCK_CODE_CLASS =
  "cn-code-block-code grid min-h-lh min-w-max content-start in-data-numbered:grid-cols-[auto_1fr] in-data-wrap:min-w-0";

/**
 * The scrollable <pre><code> body. Highlighted code is consumer-supplied
 * content (see the header): pass it as `children`, or pass a plain `code`
 * string — with `lineNumbers` it is split into `CodeBlockLine`s exactly
 * as upstream splits string children.
 */
export const CodeBlockContent = <Msg, R = never>(
  h: Html.H<Msg>,
  options: {
    readonly wrap?: boolean | undefined;
    readonly lineNumbers?: boolean | undefined;
    readonly startLine?: number | undefined;
    readonly code?: string | undefined;
    readonly class?: string | undefined;
  } = {},
  children?: View.Content<Msg, R>,
): View.Content<Msg, R> => {
  const wrap = options.wrap ?? false;
  const lineNumbers = options.lineNumbers ?? false;
  const startLine = options.startLine ?? 1;
  const body: View.Children<Msg, R> =
    lineNumbers && options.code !== undefined
      ? options.code
          .replace(/\n$/, "")
          .split("\n")
          .map((line) => CodeBlockLine(h, {}, line))
      : children === undefined
        ? []
        : [children];
  return h.pre
    .attrs({
      "data-slot": "code-block-content",
      "data-wrap": wrap ? "true" : undefined,
      "data-numbered": lineNumbers ? "true" : undefined,
      dir: "ltr",
      tabindex: "0",
      style: `counter-reset: line ${startLine - 1}`,
    })
    .class(cn(CODE_BLOCK_CONTENT_CLASS, options.class))
    .children(
      h
        .el("code")
        .attrs({ "data-slot": "code-block-code", class: CODE_BLOCK_CODE_CLASS })
        .children(body),
    );
};

// ---------------------------------------------------------------------------
// CodeBlockCopyButton — the one stateful piece (see the header)
// ---------------------------------------------------------------------------

export const CodeBlockCopyButtonProps = Schema.Struct({
  /** The text written to the clipboard on press. */
  value: Schema.String,
  variant: Schema.optional(
    Schema.Literals(["default", "destructive", "outline", "secondary", "ghost", "link"]),
  ),
  size: Schema.optional(
    Schema.Literals(["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"]),
  ),
  class: Schema.optional(Schema.String),
});
export type CodeBlockCopyButtonProps = typeof CodeBlockCopyButtonProps.Type;

export const CodeBlockCopyButtonModel = Schema.Struct({
  copied: Schema.Boolean,
});
export type CodeBlockCopyButtonModel = typeof CodeBlockCopyButtonModel.Type;

export const CodeBlockCopyButtonMessage = UiSchema.TaggedEnum({
  /** The button was pressed: run the clipboard write. */
  Pressed: {},
  /** The clipboard write succeeded (upstream's `.then(() => setCopied(true))`). */
  Copied: {},
  /** The clipboard write failed (upstream's empty `.catch`): nothing changes. */
  CopyFailed: {},
  /** The 2-second reset elapsed: `copied` clears. */
  CopyReset: {},
});
export type CodeBlockCopyButtonMessage = typeof CodeBlockCopyButtonMessage.Type;

/** Upstream's reset delay for the copied state. */
export const CODE_BLOCK_COPY_RESET_MS = 2000;

const CopyCodeText = Command.make(
  "CodeBlockCopyButton/CopyCodeText",
  { args: { value: Schema.String } },
  ({ value }) =>
    Effect.promise(() => navigator.clipboard.writeText(value)).pipe(
      Effect.as(CodeBlockCopyButtonMessage.Copied()),
      Effect.catch(() => Effect.succeed(CodeBlockCopyButtonMessage.CopyFailed())),
    ),
);

export const CODE_BLOCK_COPY_BUTTON_CLASS = "cn-code-block-copy-button";

/**
 * The copy button: ghost / icon-xs by default, as upstream. Headless
 * (see the header): the `button` part is this repo's bases `Button`
 * stacked on the part's element, with upstream's `data-slot`,
 * `data-copied` (present only while copied, as upstream writes it —
 * `copied || undefined`) and `aria-label`; the `live` part is the
 * sr-only `aria-live` span. The view closure supplies the icon and the
 * live text from the `copied` datum, as in the header example.
 */
export const CodeBlockCopyButton = Html.component({
  name: "CodeBlockCopyButton",
  props: CodeBlockCopyButtonProps,
  model: CodeBlockCopyButtonModel,
  message: CodeBlockCopyButtonMessage,
}).make({
  init: () => ({ copied: false }),
  update: {
    Pressed: ($) => $.run(CopyCodeText.make({ value: $.props.value })),
    Copied: ($) => $.evolve({ copied: true }),
    CopyFailed: ($) => $.evolve({}),
    CopyReset: ($) => $.evolve({ copied: false }),
  },
  subscriptions: ({ model }) => [
    model.copied &&
      Subscription.make("copyReset", model.copied, () =>
        Stream.fromEffect(Effect.sleep(`${CODE_BLOCK_COPY_RESET_MS} millis`)).pipe(
          Stream.as(CodeBlockCopyButtonMessage.CopyReset() as CodeBlockCopyButtonMessage),
        ),
      ),
  ],
  parts: (p, model) => ({
    copied: model.copied,
    button: p.part("button", (b) =>
      Button(
        { button: b },
        {
          element: b,
          onPress: CodeBlockCopyButtonMessage.Pressed(),
          variant: (p.props.variant ?? "ghost") as ButtonVariant,
          size: (p.props.size ?? "icon-xs") as ButtonSize,
          class: cn(CODE_BLOCK_COPY_BUTTON_CLASS, p.props.class),
        },
      ).attrs({
        "data-slot": "code-block-copy-button",
        "data-copied": model.copied ? "true" : undefined,
        "aria-label": model.copied ? "Copied" : "Copy",
      }),
    ),
    live: p.part("span", (b) => b.attrs({ "aria-live": "polite" }).class("sr-only")),
  }),
});

/** What a `CodeBlockCopyButton`'s `view` gets: the `copied` datum plus the `button` and `live` parts. */
export type CodeBlockCopyButtonParts = Component.Headless.Parts<typeof CodeBlockCopyButton>;
