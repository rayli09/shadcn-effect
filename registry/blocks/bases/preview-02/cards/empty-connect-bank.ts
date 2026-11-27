/**
 * EmptyConnectBank — shadcn/ui block `preview-02`
 * (registry/bases/radix/blocks/preview-02/cards/empty-connect-bank.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a Card holding an Empty state — a credit-card icon in an
 * icon-variant EmptyMedia, a "Connect Bank" title/description, and a
 * "Set Up Payouts" Button. Here: a view function with the same
 * anatomy. Class strings and copy are byte-for-byte upstream.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `IconPlaceholder` swaps icon libraries per create-app
 *   params; only the lucide rendering is ported (`CreditCardIcon`
 *   below is a file-local builder from lucide's SVG data; the shared
 *   `@/lib/icons` module doesn't export it yet).
 */
import type { Html } from "@effect/ui/html";
import { Button } from "@/components/ui/button.ts";
import { Card, CardContent } from "@/components/ui/card.ts";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.ts";
import { icon, type IconOptions } from "@/lib/icons";

/** Lucide `credit-card` (ISC), via the shared `icon()` helper. */
const CreditCardIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "20", height: "14", x: "2", y: "5", rx: "2" }],
      ["line", { x1: "2", x2: "22", y1: "10", y2: "10" }],
      ["path", { d: "M6 14h2" }],
    ],
    options,
  );

export const EmptyConnectBank = <Msg>(h: Html.H<Msg>, options = {}) =>
  Card(h).children(
    CardContent(h).children(
      Empty(h, { class: "p-4" }).children(
        EmptyMedia(h, { variant: "icon" }).children(CreditCardIcon(h)),
        EmptyHeader(h).children(
          EmptyTitle(h).children("Connect Bank"),
          EmptyDescription(h).children(
            "Link your payout method to receive monthly royalty distributions automatically.",
          ),
        ),
        EmptyContent(h).children(Button(h).children("Set Up Payouts")),
      ),
    ),
  );
