/**
 * IndexInvesting — shadcn/ui block `preview-02`
 * (cards/index-investing.tsx), bases generation, ported 1:1 to Effect
 * UI.
 *
 * Upstream: a stateless React function rendering a Card explaining
 * dollar-cost averaging — title, a one-line description, and a longer
 * paragraph (rendered with a second CardDescription) whose first words
 * are an underlined link. Here: a pure view function with the same
 * anatomy, copy and class strings byte-for-byte upstream; it keeps no
 * state, so it is not a Component.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream imports `Button`, `CardAction` and `IconPlaceholder` but
 *   never renders them; those unused imports are dropped, not ported.
 */
import type { Html } from "@effect/ui/html";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.ts";

export const IndexInvesting = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  Card(h, { class: options.class }).children(
    CardHeader(h).children(
      CardTitle(h).children("Dollar-Cost Averaging"),
      CardDescription(h).children("A strategy for building wealth over time."),
    ),
    CardContent(h).children(
      CardDescription(h, { class: "mt-3 text-sm leading-relaxed style-sera:mt-0" }).children(
        h.a
          .attr("href", "#")
          .class("underline underline-offset-4 hover:text-primary")
          .children("Over time"),
        ", this smooths out the average cost of your investments. When prices drop, your fixed amount buys more shares. When prices rise, you buy fewer. The result is a lower average cost per share compared to lump-sum investing during volatile periods.",
      ),
    ),
  );
