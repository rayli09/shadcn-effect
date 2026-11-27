/**
 * Login02Page — shadcn/ui block `login-02` (page), ported 1:1 to
 * Effect UI.
 *
 * Upstream: a default-exported React `LoginPage` — a two-column grid
 * with the brand row and the block's LoginForm on the left and a muted
 * image panel on the right. Here: a named view function — draw it
 * from a Component's view and it places the `LoginForm` child
 * component inside the same layout markup, class strings
 * byte-for-byte upstream.
 *
 * The lucide `gallery-vertical-end` glyph is not in `@/lib/icons`
 * yet, so it is built file-locally from lucide's path data (ISC)
 * through the shared `icon` helper.
 */
import type { Html } from "@effect/ui/html";
import { icon } from "@/lib/icons";
import { LoginForm } from "./components/login-form.ts";

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

export const Login02Page = <Msg>(h: Html.H<Msg>) =>
  h.div.class("grid min-h-svh lg:grid-cols-2").children(
    h.div.class("flex flex-col gap-4 p-6 md:p-10").children(
      h.div.class("flex justify-center gap-2 md:justify-start").children(
        h.a
          .attr("href", "#")
          .class("flex items-center gap-2 font-medium")
          .children(
            h.div
              .class(
                "flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground",
              )
              .children(GalleryVerticalEndIcon(h, { class: "size-4" })),
            "Acme Inc.",
          ),
      ),
      h.div
        .class("flex flex-1 items-center justify-center")
        .children(h.div.class("w-full max-w-xs").children(LoginForm(h, {}))),
    ),
    h.div
      .class("relative hidden bg-muted lg:block")
      .children(
        h.img
          .attr("src", "/placeholder.svg")
          .attr("alt", "Image")
          .class(
            "absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale",
          ),
      ),
  );
