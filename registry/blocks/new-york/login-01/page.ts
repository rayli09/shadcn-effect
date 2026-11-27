/**
 * Login01Page — shadcn/ui block `login-01` (page), ported 1:1 to
 * Effect UI.
 *
 * Upstream: a default-exported React `Page` centering the block's
 * LoginForm. Here: a named view function — draw it from a Component's
 * view and it places the `LoginForm` child component inside the same
 * layout markup, class strings byte-for-byte upstream.
 */
import type { Html } from "@effect/ui/html";
import { LoginForm } from "./components/login-form.ts";

export const Login01Page = <Msg>(h: Html.H<Msg>) =>
  h.div
    .class("flex min-h-svh w-full items-center justify-center p-6 md:p-10")
    .children(h.div.class("w-full max-w-sm").children(LoginForm(h, {})));
