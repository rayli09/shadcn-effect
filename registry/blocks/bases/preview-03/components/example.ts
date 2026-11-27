/**
 * Example / ExampleWrapper — shadcn/ui block `preview-03`
 * (registry/bases/radix/components/example.tsx — the shared Example
 * frame the preview-03 cards import, not a file inside the block
 * directory), bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: two stateless React functions. `ExampleWrapper` renders a
 * full-bleed muted backdrop div around a centered grid div
 * (`data-slot="example-wrapper"`); `Example` renders a column div
 * (`data-slot="example"`) with an optional title strip and a card
 * surface div (`data-slot="example-content"`) holding the children.
 * Here: two view functions with the same markup, `data-slot`
 * attributes and class strings byte-for-byte upstream. Children are a
 * plain argument (the repo's DropdownMenuGroup idiom) because the
 * content div must wrap them — a chained `.children(...)` would land
 * on the outer div instead.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream spreads `React.ComponentProps<"div">` onto the rendered
 *   divs; the only props here are `class` (upstream's `className`,
 *   appended where upstream's `cn(...)` put it: on the wrapper's inner
 *   grid div / the example's content div) and, for `Example`,
 *   `containerClassName` (the outer div's `cn(...)` input) and
 *   `title`. No other DOM props are forwarded.
 * - `Example` also accepts `containerClass` as an alias of
 *   `containerClassName` (the chat cards were written against both
 *   names; `containerClassName` wins when both are given), and
 *   children either as the third argument (placed inside the content
 *   div, upstream's structure) or chained with `.children(...)` on
 *   the returned outer builder (they then land on the outer div,
 *   after the content div — the cards that chain should be reconciled
 *   to the argument form).
 * - Upstream renders the title strip only when `title` is truthy
 *   (`{title && ...}`); here the strip is included only when `title`
 *   is not `undefined`, with the same rendered result for every value
 *   upstream's cards pass.
 */
import type { Html } from "@effect/ui/html";
import type * as View from "@effect/ui/View";
import { cn } from "@/lib/utils";

export const ExampleWrapper = <Msg, R = never>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
  children: View.Content<Msg, R> | ReadonlyArray<View.Content<Msg, R>> = [],
) =>
  h.div.class("w-full bg-muted dark:bg-background").children(
    h.div
      .attr("data-slot", "example-wrapper")
      .class(
        cn(
          "mx-auto grid min-h-screen w-full max-w-5xl min-w-0 content-center items-start gap-8 p-4 pt-2 sm:gap-12 sm:p-6 md:grid-cols-2 md:gap-8 lg:p-12 2xl:max-w-6xl",
          options.class,
        ),
      )
      .children(...(Array.isArray(children) ? children : [children])),
  );

export const Example = <Msg, R = never>(
  h: Html.H<Msg>,
  options: {
    readonly title?: string | undefined;
    readonly class?: string | undefined;
    readonly containerClassName?: string | undefined;
    readonly containerClass?: string | undefined;
  } = {},
  children: View.Content<Msg, R> | ReadonlyArray<View.Content<Msg, R>> = [],
) =>
  h.div
    .attr("data-slot", "example")
    .class(
      cn(
        "mx-auto flex w-full max-w-lg min-w-0 flex-col gap-1 self-stretch lg:max-w-none",
        options.containerClassName ?? options.containerClass,
      ),
    )
    .children(
      ...(options.title !== undefined
        ? [
            h.div
              .class("px-1.5 py-2 text-xs font-medium text-muted-foreground")
              .children(options.title),
          ]
        : []),
      h.div
        .attr("data-slot", "example-content")
        .class(
          cn(
            "flex min-w-0 flex-1 flex-col items-start gap-6 rounded-xl bg-card p-12 text-foreground style-lyra:rounded-none style-sera:rounded-none *:[div:not([class*='w-'])]:w-full",
            options.class,
          ),
        )
        .children(...(Array.isArray(children) ? children : [children])),
    );
