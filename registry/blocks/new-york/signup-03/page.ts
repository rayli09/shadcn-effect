/**
 * Signup03Page — shadcn/ui block `signup-03` (page), ported 1:1 to
 * Effect UI.
 *
 * Upstream: a default-exported React `SignupPage` — a muted, centered
 * column with the brand row above the block's SignupForm. Here: a
 * named view function — draw it from a Component's view and it places
 * the `SignupForm` child component inside the same layout markup,
 * class strings byte-for-byte upstream.
 *
 * The lucide `gallery-vertical-end` glyph is not in `@/lib/icons`
 * yet, so it is built file-locally from lucide's path data (ISC)
 * through the shared `icon` helper.
 */
import type { Html } from "@effect/ui/html";
import { icon } from "@/lib/icons";
import { SignupForm } from "./components/signup-form.ts";

/** Lucide `gallery-vertical-end` (ISC), file-local until `@/lib/icons` hoists it. */
const GalleryVerticalEndIcon = <Msg>(h: Html.H<Msg>, options: { readonly class?: string } = {}) =>
  icon(
    h,
    [
      ["path", { d: "M7 2h10" }],
      ["path", { d: "M5 6h14" }],
      ["rect", { width: "18", height: "12", x: "3", y: "10", rx: "2" }],
    ],
    options,
  );

export const Signup03Page = <Msg>(h: Html.H<Msg>) =>
  h.div
    .class("flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10")
    .children(
      h.div.class("flex w-full max-w-sm flex-col gap-6").children(
        h.a
          .attr("href", "#")
          .class("flex items-center gap-2 self-center font-medium")
          .children(
            h.div
              .class(
                "flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground",
              )
              .children(GalleryVerticalEndIcon(h, { class: "size-4" })),
            "Acme Inc.",
          ),
        SignupForm(h, {}),
      ),
    );
