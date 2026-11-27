/**
 * NoTeamMembers — shadcn/ui block `preview` (registry/bases/radix/blocks/preview/cards/no-team-members.tsx), bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless Card whose content is a bordered `h-56`
 * Empty state — an EmptyMedia holding a grayscale AvatarGroup of
 * three large Avatars (GitHub avatar images for @shadcn, @maxleiter
 * and @evilrabbit, with CN / LR / ER fallbacks), the "No Team
 * Members" title, the "Invite your team to collaborate on this
 * project." description and a small "Invite Members" Button. Here:
 * a plain view function with the same anatomy and class strings;
 * each Avatar is the avatar port's headless component drawn inside
 * the view, its `src` / `alt` carried by the kit image part.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Upstream's standalone `AvatarImage` / `AvatarFallback` exports
 *   collapse into the avatar port's view-closure parts, exactly as
 *   that port declares; the image `src` arrives as the Avatar
 *   `props.src` and the `alt` is stamped on the image part.
 * - The "Invite Members" Button has no upstream handler; here it is
 *   drawn without an `onPress` message, as upstream.
 */
import type { Html } from "@effect/ui/html";
import { Avatar, AvatarGroup } from "@/components/ui/avatar.ts";
import { Button } from "@/components/ui/button.ts";
import { Card, CardContent } from "@/components/ui/card.ts";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.ts";

const MEMBERS = [
  { src: "https://github.com/shadcn.png", alt: "@shadcn", fallback: "CN" },
  { src: "https://github.com/maxleiter.png", alt: "@maxleiter", fallback: "LR" },
  { src: "https://github.com/evilrabbit.png", alt: "@evilrabbit", fallback: "ER" },
] as const;

const memberAvatar = <Msg>(h: Html.H<Msg>, member: (typeof MEMBERS)[number]) =>
  Avatar(h, {
    key: member.alt,
    props: { src: member.src },
    size: "lg",
    view: (avatar) =>
      avatar
        .root(h.span)
        .children(
          avatar.image(h.img.attr("alt", member.alt)),
          avatar.fallback(h.span)?.children(member.fallback),
        ),
  });

export const NoTeamMembers = <Msg>(h: Html.H<Msg>) =>
  Card(h).children(
    CardContent(h).children(
      Empty(h, { class: "h-56 border" }).children(
        EmptyHeader(h).children(
          EmptyMedia(h).children(
            AvatarGroup(h, { class: "grayscale" }).children(
              MEMBERS.map((member) => memberAvatar(h, member)),
            ),
          ),
          EmptyTitle(h).children("No Team Members"),
          EmptyDescription(h).children("Invite your team to collaborate on this project."),
        ),
        EmptyContent(h).children(Button(h, { size: "sm" }).children("Invite Members")),
      ),
    ),
  );
