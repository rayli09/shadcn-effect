/**
 * Kbd (bases generation) — shadcn/ui `kbd` ported 1:1 to Effect UI.
 *
 * Same Effect port as `registry/ui/kbd.ts` (pure view functions returning
 * `h.kbd` builders — no state, not Components); only the class layer
 * changes: class strings are byte-for-byte the shadcn bases/radix strings
 * — structural inline classes plus the `cn-kbd` / `cn-kbd-group` hook
 * classes whose utilities are supplied by the style presets. The parity
 * checker asserts every token in `parity/bases-tokens.json["kbd"]`.
 *
 * Anatomy diffs vs the new-york generation (upstream's, preserved): Kbd
 * drops its inline sizing, typography, background and tooltip-context
 * variants (preset-owned via `cn-kbd`); KbdGroup drops its `gap-1`.
 *
 * Note: upstream's `KbdGroup` is typed as a <div> but actually renders a
 * <kbd> element (an upstream quirk). The port preserves the rendered
 * element: `KbdGroup` renders <kbd data-slot="kbd-group">, like upstream.
 */
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";

export const KBD_CLASS =
  "cn-kbd pointer-events-none inline-flex items-center justify-center select-none";

export const KBD_GROUP_CLASS = "cn-kbd-group inline-flex items-center";

type KbdElement<Msg, R> = Html.Element<Msg, R, Html.EventsOf<"kbd">, HTMLElement, "kbd">;

export const Kbd = <Msg, R = never>(
  h: { readonly kbd: KbdElement<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.kbd.attr("data-slot", "kbd").class(cn(KBD_CLASS, options.class));

export const KbdGroup = <Msg, R = never>(
  h: { readonly kbd: KbdElement<Msg, R> },
  options: { readonly class?: string | undefined } = {},
) => h.kbd.attr("data-slot", "kbd-group").class(cn(KBD_GROUP_CLASS, options.class));
