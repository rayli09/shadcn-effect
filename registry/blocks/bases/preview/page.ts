/**
 * PreviewPage — shadcn/ui block `preview`
 * (registry/bases/radix/blocks/preview/index.tsx), bases generation,
 * ported 1:1 to Effect UI.
 *
 * Upstream: a default-exported React `PreviewExample` laying every
 * preview card out in a fixed 2400px/3000px seven-column grid (the
 * create-app's style-preview capture surface): each column is a
 * flex column of cards, with UIElements duplicated — once in a
 * mobile-only wrapper in column one, once in a desktop-only wrapper
 * in column two. Here: a named view function `PreviewPage` placing
 * the same cards in the same columns with the same class strings
 * byte-for-byte upstream. Cards that are Components are mounted with
 * empty options; cards that are view functions are called the same
 * way, per the block convention.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's default export is renamed to the named `PreviewPage`
 *   export, per the registry's block convention (see login-01).
 * - The `style-lyra:` / `style-mira:` variant classes in the layout
 *   strings are kept verbatim; they are create-app style-preset
 *   hooks, inert unless a preset stylesheet defines them.
 */
import type { Html } from "@effect/ui/html";
import { ActivateAgentDialog } from "./cards/activate-agent-dialog.ts";
import { AnalyticsCard } from "./cards/analytics-card.ts";
import { AnomalyAlert } from "./cards/anomaly-alert.ts";
import { BarChartCard } from "./cards/bar-chart-card.ts";
import { BookAppointment } from "./cards/book-appointment.ts";
import { CodespacesCard } from "./cards/codespaces-card.ts";
import { ContributionsActivity } from "./cards/contributions-activity.ts";
import { Contributors } from "./cards/contributors.ts";
import { EnvironmentVariables } from "./cards/environment-variables.ts";
import { FeedbackForm } from "./cards/feedback-form.ts";
import { FileUpload } from "./cards/file-upload.ts";
import { GithubProfile } from "./cards/github-profile.ts";
import { IconPreviewGrid } from "./cards/icon-preview-grid.ts";
import { InviteTeam } from "./cards/invite-team.ts";
import { Invoice } from "./cards/invoice.ts";
import { LiveWaveformCard } from "./cards/live-waveform.ts";
import { NoTeamMembers } from "./cards/no-team-members.ts";
import { NotFound } from "./cards/not-found.ts";
import { ObservabilityCard } from "./cards/observability-card.ts";
import { PieChartCard } from "./cards/pie-chart-card.ts";
import { ReportBug } from "./cards/report-bug.ts";
import { ShippingAddress } from "./cards/shipping-address.ts";
import { Shortcuts } from "./cards/shortcuts.ts";
import { SkeletonLoading } from "./cards/skeleton-loading.ts";
import { SleepReport } from "./cards/sleep-report.ts";
import { StyleOverview } from "./cards/style-overview.ts";
import { TypographySpecimen } from "./cards/typography-specimen.ts";
import { UIElements } from "./cards/ui-elements.ts";
import { UsageCard } from "./cards/usage-card.ts";
import { Visitors } from "./cards/visitors.ts";
import { WeeklyFitnessSummary } from "./cards/weekly-fitness-summary.ts";

const column = <Msg>(h: Html.H<Msg>, ...children: Array<unknown>) =>
  h.div
    .class("flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]")
    .children(...(children as Array<never>));

export const PreviewPage = <Msg>(h: Html.H<Msg>) =>
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
            column(
              h,
              StyleOverview(h, {}),
              TypographySpecimen(h, {}),
              h.div.class("md:hidden").children(UIElements(h, {})),
              CodespacesCard(h, {}),
              Invoice(h),
            ),
            column(
              h,
              IconPreviewGrid(h),
              h.div.class("hidden w-full md:flex").children(UIElements(h, {})),
              ObservabilityCard(h),
              ShippingAddress(h, {}),
            ),
            column(
              h,
              EnvironmentVariables(h, {}),
              BarChartCard(h, {}),
              InviteTeam(h, {}),
              ActivateAgentDialog(h, {}),
            ),
            column(
              h,
              SkeletonLoading(h, {}),
              PieChartCard(h),
              NoTeamMembers(h),
              ReportBug(h, {}),
              Contributors(h, {}),
            ),
            column(
              h,
              FeedbackForm(h, {}),
              BookAppointment(h, {}),
              SleepReport(h, {}),
              GithubProfile(h, {}),
            ),
            column(
              h,
              WeeklyFitnessSummary(h, {}),
              FileUpload(h),
              AnalyticsCard(h, {}),
              UsageCard(h, {}),
              Shortcuts(h, {}),
            ),
            column(
              h,
              AnomalyAlert(h, {}),
              LiveWaveformCard(h, {}),
              Visitors(h, {}),
              ContributionsActivity(h, {}),
              NotFound(h, {}),
            ),
          ),
      ),
    );
