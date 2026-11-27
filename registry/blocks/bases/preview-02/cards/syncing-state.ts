/**
 * SyncingState — shadcn/ui block `preview-02` (cards/syncing-state.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card whose content is
 * an Empty state (spinner media, title, description) with a Cancel button.
 * Here: a named view function with the same anatomy and class strings
 * byte-for-byte upstream. The Cancel button is a plain Button with no
 * press handler — upstream wires none either.
 *
 * Declared divergences (anything else is a bug):
 *
 * - The only prop is `class` (upstream cards take none; this follows the
 *   block convention from login-01), appended to the Card root's classes.
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
import { Spinner } from "@/components/ui/spinner.ts";
import { cn } from "@/lib/utils";

export const SyncingState = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  Card(h, { class: cn(options.class) }).children(
    CardContent(h, { class: "p-0" }).children(
      Empty(h, { class: "p-4" }).children(
        EmptyHeader(h).children(
          EmptyMedia(h, { variant: "icon" }).children(Spinner(h)),
          EmptyTitle(h).children("Syncing your accounts"),
          EmptyDescription(h).children(
            "We're pulling in your latest transactions. This usually takes a few seconds.",
          ),
        ),
        EmptyContent(h).children(Button(h, { variant: "outline" }).children("Cancel")),
      ),
    ),
  );
