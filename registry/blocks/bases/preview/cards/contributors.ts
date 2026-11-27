/**
 * Contributors — shadcn/ui block `preview`
 * (registry/bases/radix/blocks/preview/cards/contributors.tsx), bases
 * generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card with a
 * "Contributors" title and a secondary 312 Badge, a wrapping row of
 * grayscale Avatars (GitHub profile images, first-letter fallbacks)
 * for sixteen usernames, and a "+ 810 contributors" footer link.
 * Here: a view function with the same markup, class strings and
 * sample data byte-for-byte upstream; each Avatar is the kit Avatar
 * part composition (root / image / fallback) the registry's avatar
 * port exposes.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's `AvatarImage` / `AvatarFallback` sub-components are the
 *   kit Avatar's `image` / `fallback` parts inside its `view` closure
 *   (D-6); the rendered elements, classes and `data-slot`s are the
 *   same.
 */
import type { Html } from "@effect/ui/html";
import { Avatar } from "@/components/ui/avatar.ts";
import { Badge } from "@/components/ui/badge.ts";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.ts";

// GitHub usernames displayed as contributor avatars.
const usernames: ReadonlyArray<string> = [
  "shadcn",
  "vercel",
  "nextjs",
  "tailwindlabs",
  "typescript-lang",
  "eslint",
  "prettier",
  "babel",
  "webpack",
  "rollup",
  "parcel",
  "vite",
  "react",
  "vue",
  "angular",
  "solid",
];

export const Contributors = <Msg>(h: Html.H<Msg>, _options: {} = {}) =>
  Card(h, { class: "max-w-sm" }).children(
    CardHeader(h).children(
      CardTitle(h).children("Contributors ", Badge(h, { variant: "secondary" }).children("312")),
    ),
    CardContent(h).children(
      h.div.class("flex flex-wrap gap-2").children(
        usernames.map((username) =>
          Avatar(h, {
            key: username,
            props: { src: `https://github.com/${username}.png` },
            class: "grayscale",
            view: (avatar) =>
              avatar
                .root(h.span)
                .children(
                  avatar.image(h.img)?.attr("alt", username),
                  avatar.fallback(h.span)?.children(username.charAt(0)),
                ),
          }),
        ),
      ),
    ),
    CardFooter(h).children(
      h.a
        .attr("href", "#")
        .class("text-sm underline underline-offset-4")
        .children("+ 810 contributors"),
    ),
  );
