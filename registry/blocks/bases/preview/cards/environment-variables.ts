/**
 * EnvironmentVariables — shadcn/ui block `preview`
 * (registry/bases/radix/blocks/preview/cards/environment-variables.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card listing three
 * environment variables (two masked, one a plain URL) with Edit /
 * Deploy buttons in the footer. Here: a view function with the same
 * markup, class strings and sample data byte-for-byte upstream. The
 * buttons are upstream's placeholders (no handlers), so they carry no
 * `onPress`.
 *
 * Declared divergences (anything else is a bug):
 *
 * - None beyond the registry-wide D-1…D-9.
 */
import type { Html } from "@effect/ui/html";
import { Button } from "@/components/ui/button.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";

const envVars: ReadonlyArray<{ readonly key: string; readonly masked: boolean }> = [
  { key: "DATABASE_URL", masked: true },
  { key: "NEXT_PUBLIC_API", masked: false },
  { key: "STRIPE_SECRET", masked: true },
];

export const EnvironmentVariables = <Msg>(h: Html.H<Msg>, _options: {} = {}) =>
  Card(h).children(
    CardHeader(h).children(
      CardTitle(h).children("Environment Variables"),
      CardDescription(h).children("Production · 8 variables"),
    ),
    CardContent(h, { class: "flex flex-col gap-2" }).children(
      envVars.map((env) =>
        h.div
          .key(env.key)
          .class(
            "flex items-center gap-2 rounded-md px-2.5 py-2 font-mono text-xs ring ring-border",
          )
          .children(
            h.span.class("font-medium").children(env.key),
            h.span
              .class("ml-auto text-muted-foreground")
              .children(env.masked ? "••••••••" : "https://api.example.com"),
          ),
      ),
    ),
    CardFooter(h).children(
      Button(h, { variant: "outline" }).children("Edit"),
      Button(h, { class: "ml-auto" }).children("Deploy"),
    ),
  );
