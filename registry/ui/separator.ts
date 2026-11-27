/**
 * Separator — shadcn/ui `separator` ported 1:1 to Effect UI.
 *
 * Upstream: Radix Separator.Root. Here: the @effect/ui-kit `Separator` view
 * function, which writes the same role / aria-orientation semantics onto a
 * <div>. Class string is byte-for-byte upstream.
 */
import { Separator as KitSeparator, type SeparatorElement } from "@effect/ui-kit";
import { cn } from "@/lib/utils";

export const SEPARATOR_CLASS =
  "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px";

export const Separator = <Msg, R = never>(
  h: { readonly div: SeparatorElement<Msg> },
  options: {
    readonly element?: SeparatorElement<Msg, R> | undefined;
    readonly orientation?: "horizontal" | "vertical" | undefined;
    readonly class?: string | undefined;
  } = {},
) =>
  KitSeparator(h, {
    element: options.element,
    props: { orientation: options.orientation },
  })
    .attr("data-slot", "separator")
    .class(cn(SEPARATOR_CLASS, options.class));
