/**
 * Shortcuts — shadcn/ui block `preview` (cards/shortcuts.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card with a
 * "Shortcuts" heading and an `ItemGroup` (data-size="xs") listing five
 * keyboard shortcuts from a module-level `shortcuts` array, each row an
 * `Item` (variant default, size xs) whose header pairs the label with
 * `Kbd` chips for its keys, with an `ItemSeparator` between rows. Here:
 * a named view function; the sample data and class strings are verbatim
 * upstream, and the React fragments/keys become keyed builders in one
 * children list.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's Item `size="xs"` is a bases-generation size; the
 *   in-repo `Item` wrapper's size union predates it, so the size is
 *   stamped as the `cn-item-size-xs` preset hook class plus a
 *   `data-size="xs"` attribute bridge (D-9) — the bases preset styles
 *   it exactly as upstream's variant does (the activate-agent-dialog
 *   pattern). No state, no handlers, no icons upstream.
 */
import type { Html } from "@effect/ui/html";
import { Card, CardContent } from "@/components/ui/card.ts";
import {
  Item,
  ItemActions,
  ItemGroup,
  ItemHeader,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item.ts";
import { Kbd } from "@/components/ui/kbd.ts";

const shortcuts = [
  { label: "Search", keys: ["⌘", "K"] },
  { label: "Quick Actions", keys: ["⌘", "J"] },
  { label: "New File", keys: ["⌘", "N"] },
  { label: "Save", keys: ["⌘", "S"] },
  { label: "Toggle Sidebar", keys: ["⌘", "B"] },
] as const;

export const Shortcuts = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  Card(h, { class: options.class }).children(
    CardContent(h).children(
      h.div.class("flex flex-col gap-3").children(
        h.div.class("text-sm font-medium").children("Shortcuts"),
        ItemGroup(h, { class: "gap-2 text-muted-foreground" })
          .attr("data-size", "xs")
          .children(
            ...shortcuts.flatMap(({ label, keys }, i) => [
              ...(i > 0 ? [ItemSeparator(h).key(`sep-${label}`)] : []),
              Item(h, { variant: "default", class: "cn-item-size-xs border-0 px-0 py-0" })
                .attr("data-size", "xs")
                .key(label)
                .children(
                  ItemHeader(h).children(
                    ItemTitle(h, { class: "font-normal" }).children(label),
                    ItemActions(h).children(
                      h.div
                        .class("flex gap-1")
                        .children(...keys.map((key) => Kbd(h).key(key).children(key))),
                    ),
                  ),
                ),
            ]),
          ),
      ),
    ),
  );
