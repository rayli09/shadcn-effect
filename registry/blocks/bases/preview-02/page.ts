/**
 * Preview02Page — shadcn/ui block `preview-02`
 * (registry/bases/radix/blocks/preview-02/index.tsx), bases
 * generation, ported 1:1 to Effect UI.
 *
 * Upstream: a default-exported React example laying every preview-02
 * card out in a fixed 2400px-wide, 7-column capture grid (six column
 * stacks, the third spanning two columns and nesting a 2-column
 * sub-grid) over a horizontally scrolling muted backdrop. Here: a
 * named view function composing the same cards in upstream's exact
 * order and layout markup, class strings byte-for-byte upstream —
 * including the `style-lyra:` / `style-mira:` preset variants and the
 * `[--gap:--spacing(4)]` custom property the columns' gaps read.
 *
 * Declared divergences (anything else is a bug):
 *
 * - None. (The cards carry their own headers; sibling cards that
 *   haven't landed yet are imported exactly as upstream imports
 *   them, so this file typechecks only once the whole block is in.)
 */
import type { Html } from "@effect/ui/html";
import { AccountAccess } from "./cards/account-access.ts";
import { CardOverview } from "./cards/card-overview.ts";
import { ClaimableBalance } from "./cards/claimable-balance.ts";
import { ContributionHistory } from "./cards/contribution-history.ts";
import { CoverArt } from "./cards/cover-art.ts";
import { DividendIncome } from "./cards/dividend-income.ts";
import { EmptyConnectBank } from "./cards/empty-connect-bank.ts";
import { EmptyDistributeTrack } from "./cards/empty-distribute-track.ts";
import { EmptyExploreCatalog } from "./cards/empty-explore-catalog.ts";
import { Faq } from "./cards/faq.ts";
import { FrontDoor } from "./cards/front-door.ts";
import { IndexInvesting } from "./cards/index-investing.ts";
import { KitchenIsland } from "./cards/kitchen-island.ts";
import { LoadingCard } from "./cards/loading-card.ts";
import { NewMilestone } from "./cards/new-milestone.ts";
import { NotificationSettings } from "./cards/notification-settings.ts";
import { Payments } from "./cards/payments.ts";
import { PayoutThreshold } from "./cards/payout-threshold.ts";
import { PowerUsage } from "./cards/power-usage.ts";
import { Preferences } from "./cards/preferences.ts";
import { QrConnect } from "./cards/qr-connect.ts";
import { ReceivingMethod } from "./cards/receiving-method.ts";
import { RecentTransactions } from "./cards/recent-transactions.ts";
import { ReleaseCatalog } from "./cards/release-catalog.ts";
import { RollerShades } from "./cards/roller-shades.ts";
import { SavingsProgress } from "./cards/savings-progress.ts";
import { SavingsTargets } from "./cards/savings-targets.ts";
import { SidebarNav } from "./cards/sidebar-nav.ts";
import { SocialLinks } from "./cards/social-links.ts";
import { StockPerformance } from "./cards/stock-performance.ts";
import { SyncingState } from "./cards/syncing-state.ts";
import { TransferFunds } from "./cards/transfer-funds.ts";
import { UpcomingPayments } from "./cards/upcoming-payments.ts";

export const Preview02Page = <Msg>(h: Html.H<Msg>) =>
  h.div
    .class(
      "overflow-x-auto overflow-y-hidden bg-muted contain-[paint] [--gap:--spacing(4)] 3xl:[--gap:--spacing(12)] md:[--gap:--spacing(10)] dark:bg-background style-lyra:md:[--gap:--spacing(6)] style-mira:md:[--gap:--spacing(6)]",
    )
    .children(
      h.div.class("flex w-full min-w-max justify-center").children(
        h.div
          .attr("data-slot", "capture-target")
          .class(
            "grid w-[2400px] grid-cols-7 items-start gap-(--gap) bg-muted p-(--gap) md:w-[3000px] dark:bg-background style-lyra:md:w-[2600px] style-mira:md:w-[2600px] *:[div]:gap-(--gap)",
          )
          .children(
            h.div
              .class(
                "flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]",
              )
              .children(
                ContributionHistory(h, {}),
                EmptyDistributeTrack(h, {}),
                QrConnect(h, {}),
                DividendIncome(h, {}),
                IndexInvesting(h, {}),
                SyncingState(h, {}),
              ),
            h.div
              .class(
                "flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]",
              )
              .children(
                PayoutThreshold(h, {}),
                ClaimableBalance(h, {}),
                Preferences(h, {}),
                SavingsProgress(h, {}),
                KitchenIsland(h, {}),
              ),
            h.div
              .class(
                "col-span-2 flex flex-col p-1 [contain-intrinsic-size:760px_1200px] [content-visibility:auto]",
              )
              .children(
                SavingsTargets(h, {}),
                RecentTransactions(h, {}),
                h.div
                  .class("grid grid-cols-2 items-start gap-(--gap)")
                  .children(
                    h.div
                      .class("flex flex-col gap-(--gap)")
                      .children(SidebarNav(h, {}), Faq(h, {})),
                    h.div
                      .class("flex flex-col gap-(--gap)")
                      .children(Payments(h, {}), FrontDoor(h, {})),
                  ),
                ReleaseCatalog(h, {}),
              ),
            h.div
              .class(
                "flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]",
              )
              .children(
                AccountAccess(h, {}),
                CardOverview(h, {}),
                TransferFunds(h, {}),
                CoverArt(h, {}),
                LoadingCard(h, {}),
              ),
            h.div
              .class(
                "flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]",
              )
              .children(
                ReceivingMethod(h, {}),
                PowerUsage(h, {}),
                EmptyConnectBank(h, {}),
                UpcomingPayments(h, {}),
                RollerShades(h, {}),
              ),
            h.div
              .class(
                "flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]",
              )
              .children(
                StockPerformance(h, {}),
                EmptyExploreCatalog(h, {}),
                NewMilestone(h, {}),
                SocialLinks(h, {}),
                NotificationSettings(h, {}),
              ),
          ),
      ),
    );
