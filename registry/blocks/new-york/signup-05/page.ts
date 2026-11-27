/**
 * Signup05Page — shadcn/ui block `signup-05` (page), ported 1:1 to
 * Effect UI.
 *
 * Upstream: a default-exported React `SignupPage` centering the
 * block's SignupForm on the page background. Here: a named view
 * function — draw it from a Component's view and it places the
 * `SignupForm` child component inside the same layout markup, class
 * strings byte-for-byte upstream.
 */
import type { Html } from "@effect/ui/html";
import { SignupForm } from "./components/signup-form.ts";

export const Signup05Page = <Msg>(h: Html.H<Msg>) =>
  h.div
    .class("flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10")
    .children(h.div.class("w-full max-w-sm").children(SignupForm(h, {})));
