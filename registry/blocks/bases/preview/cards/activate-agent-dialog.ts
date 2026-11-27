/**
 * ActivateAgentDialog — shadcn/ui block `preview`
 * (registry/bases/radix/blocks/preview/cards/activate-agent-dialog.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card pitching
 * Vercel Agent: a header with legal links, an ItemGroup of three
 * feature rows (each led by a check icon, with inline <strong> runs
 * and, on the third, a secondary Badge), an Alert with the trial
 * credit note, and Cancel / Enable footer buttons. Here: a view
 * function with the same markup, class strings and copy byte-for-byte
 * upstream. The buttons are upstream's placeholders (no handlers), so
 * they carry no `onPress`.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `<IconPlaceholder lucide="CheckCircle2Icon" … />` is a
 *   create-app component that swaps icon libraries; only the lucide
 *   rendering is ported — the `circle-check-big` glyph (lucide's
 *   current name for CheckCircle2) via the file-local builder below,
 *   carrying the class the JSX gives the placeholder. The other
 *   libraries are create-tool switching chrome, not ported.
 * - Upstream's `Item size="xs"` uses the bases generation's third Item
 *   size; the in-repo `Item` wrapper's size union predates it, so the
 *   size is stamped as the `cn-item-size-xs` preset hook class plus a
 *   `data-size="xs"` attribute bridge (D-9) — the bases preset styles
 *   it exactly as upstream's variant does.
 */
import type { Html } from "@effect/ui/html";
import { Alert, AlertDescription } from "@/components/ui/alert.ts";
import { Badge } from "@/components/ui/badge.ts";
import { Button } from "@/components/ui/button.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item.ts";
import { icon, type IconOptions } from "@/lib/icons";

/** Lucide `circle-check-big` (ISC; the CheckCircle2 glyph). */
const CircleCheckBigIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335" }],
      ["path", { d: "m9 11 3 3L22 4" }],
    ],
    options,
  );

export const ActivateAgentDialog = <Msg>(h: Html.H<Msg>, _options: {} = {}) =>
  Card(h).children(
    CardHeader(h).children(
      CardTitle(h).children("Ship faster & safer with Vercel Agent"),
      CardDescription(h).children(
        "Your use is subject to Vercel's ",
        h.a.attr("href", "#").children("Public Beta Agreement"),
        " and ",
        h.a.attr("href", "#").children("AI Product Terms"),
        ".",
      ),
    ),
    CardContent(h, { class: "flex flex-col gap-4" }).children(
      ItemGroup(h, { class: "gap-0" }).children(
        Item(h, { class: "cn-item-size-xs px-0" })
          .attr("data-size", "xs")
          .children(
            ItemMedia(h, { variant: "icon", class: "self-start" }).children(
              CircleCheckBigIcon(h, { class: "size-5 fill-primary text-primary-foreground" }),
            ),
            ItemContent(h).children(
              ItemTitle(h, {
                class:
                  "inline leading-relaxed font-normal text-muted-foreground *:[strong]:font-medium *:[strong]:text-foreground",
              }).children(
                h.strong.children("Code reviews"),
                " with full codebase context to catch ",
                h.strong.children("hard-to-find"),
                " bugs.",
              ),
            ),
          ),
        Item(h, { class: "cn-item-size-xs px-0" })
          .attr("data-size", "xs")
          .children(
            ItemMedia(h, { variant: "icon", class: "self-start" }).children(
              CircleCheckBigIcon(h, { class: "size-5 fill-primary text-primary-foreground" }),
            ),
            ItemContent(h).children(
              ItemTitle(h, {
                class:
                  "inline leading-relaxed font-normal text-muted-foreground *:[strong]:font-medium *:[strong]:text-foreground",
              }).children(
                h.strong.children("Code suggestions"),
                " validated in sandboxes before you merge.",
              ),
            ),
          ),
        Item(h, { class: "cn-item-size-xs px-0" })
          .attr("data-size", "xs")
          .children(
            ItemMedia(h, { variant: "icon", class: "self-start" }).children(
              CircleCheckBigIcon(h, { class: "size-5 fill-primary text-primary-foreground" }),
            ),
            ItemContent(h).children(
              ItemTitle(h, {
                class:
                  "inline leading-relaxed font-normal text-muted-foreground *:[strong]:font-medium *:[strong]:text-foreground",
              }).children(
                h.strong.children("Root-cause analysis"),
                " for production issues with deployment context. ",
                Badge(h, { variant: "secondary", class: "bg-chart-1 text-chart-5" }).children(
                  "Requires Observability Plus",
                ),
              ),
            ),
          ),
      ),
      Alert(h).children(
        AlertDescription(h).children(
          "Pro teams get $100 in Vercel Agent trial credit for 2 weeks after activation.",
        ),
      ),
    ),
    CardFooter(h, { class: "justify-end gap-2" }).children(
      Button(h, { variant: "outline", class: "style-sera:hidden" }).children("Cancel"),
      Button(h, { class: "style-sera:w-full" }).children("Enable with $100 credits"),
    ),
  );
