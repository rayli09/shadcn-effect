/**
 * Signup04Page — shadcn/ui block `signup-04` (page), bases
 * generation, ported 1:1 to Effect UI.
 *
 * Upstream: a default-exported React `SignupPage` centering the
 * block's wide split SignupForm on a muted background. Here: a
 * named view function — draw it from a Component's view and it
 * places the `SignupForm` child component inside the same layout
 * markup, class strings byte-for-byte upstream.
 */
import type { Html } from "@effect/ui/html";
import { SignupForm } from "./components/signup-form.ts";

export const Signup04Page = <Msg>(h: Html.H<Msg>) =>
  h.div
    .class("flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10")
    .children(h.div.class("w-full max-w-sm md:max-w-4xl").children(SignupForm(h, {})));
