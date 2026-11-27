/**
 * AnomalyAlert — shadcn/ui block `preview`
 * (registry/bases/radix/blocks/preview/cards/anomaly-alert.tsx), bases
 * generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card whose content
 * is an Empty state (title, description, and an "Upgrade to
 * Observability Plus" button). Here: a view function with the same
 * markup and class strings byte-for-byte upstream. The button is
 * upstream's placeholder (no handler), so it carries no `onPress`.
 *
 * Declared divergences (anything else is a bug):
 *
 * - None beyond the registry-wide D-1…D-9.
 */
import type { Html } from "@effect/ui/html";
import { Button } from "@/components/ui/button.ts";
import { Card, CardContent } from "@/components/ui/card.ts";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty.ts";

export const AnomalyAlert = <Msg>(h: Html.H<Msg>, _options: {} = {}) =>
  Card(h).children(
    CardContent(h).children(
      Empty(h, { class: "h-48" }).children(
        EmptyHeader(h).children(
          EmptyTitle(h).children("Get alerted for anomalies"),
          EmptyDescription(h).children(
            "Automatically monitor your projects for anomalies and get notified.",
          ),
        ),
        EmptyContent(h).children(Button(h).children("Upgrade to Observability Plus")),
      ),
    ),
  );
