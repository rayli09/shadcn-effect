/**
 * Kbd — shadcn/ui `kbd` ported 1:1 to Effect UI.
 *
 * Upstream: plain React <kbd> elements. Here: pure view functions returning
 * `h.kbd` builders — no state, not Components. Class strings are
 * byte-for-byte upstream.
 *
 * Note: upstream's `KbdGroup` is typed as a <div> but actually renders a
 * <kbd> element (an upstream quirk). The port preserves the rendered
 * element: `KbdGroup` renders <kbd data-slot="kbd-group">, like upstream.
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";

export const KBD_CLASS =
  "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none [&_svg:not([class*='size-'])]:size-3 [[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10";

export const KBD_GROUP_CLASS = "inline-flex items-center gap-1";

type KbdElement<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"kbd">, HTMLElement, "kbd">;

export const Kbd = <Msg, R = never>(
  h: { readonly kbd: KbdElement<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.kbd.attr("data-slot", "kbd").class(cn(KBD_CLASS, options.class));

export const KbdGroup = <Msg, R = never>(
  h: { readonly kbd: KbdElement<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.kbd.attr("data-slot", "kbd-group").class(cn(KBD_GROUP_CLASS, options.class));
