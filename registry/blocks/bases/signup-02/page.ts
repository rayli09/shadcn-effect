/**
 * Signup02Page — shadcn/ui block `signup-02` (page), bases
 * generation, ported 1:1 to Effect UI.
 *
 * Upstream: a default-exported React `SignupPage` — a two-column
 * grid with the brand mark and the block's SignupForm on the left
 * and a muted image panel on the right. Here: a named view
 * function — draw it from a Component's view and it places the
 * `SignupForm` child component inside the same layout markup, class
 * strings byte-for-byte upstream.
 *
 * Declared divergence: upstream renders the brand glyph through the
 * site-only `IconPlaceholder` (its lucide variant is
 * `GalleryVerticalEndIcon`); here that glyph is a file-local builder
 * on the shared `icon` helper — `@/lib/icons` has no shared builder
 * for it yet.
 */
import { Html } from "@effect/ui/html";
import { icon, type IconOptions } from "@/lib/icons";
import { SignupForm } from "./components/signup-form.ts";

/**
 * Lucide `gallery-vertical-end` (ISC) — no shared builder exists in
 * `@/lib/icons` yet, so this one is file-local, built with the shared
 * `icon` helper: <path d="M7 2h10" /> + <path d="M5 6h14" /> +
 * <rect width="18" height="12" x="3" y="10" rx="2" />.
 */
const GalleryVerticalEndIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M7 2h10" }],
      ["path", { d: "M5 6h14" }],
      ["rect", { width: "18", height: "12", x: "3", y: "10", rx: "2" }],
    ],
    options,
  );

export const Signup02Page = <Msg>(h: Html.H<Msg>) =>
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
        .children(h.div.class("w-full max-w-xs").children(SignupForm(h, {}))),
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
