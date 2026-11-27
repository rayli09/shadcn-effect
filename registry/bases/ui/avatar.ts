/**
 * Avatar (bases generation) — shadcn/ui `avatar` ported 1:1 to Effect UI.
 *
 * Same Effect port as `registry/ui/avatar.ts` (the @effect/ui-kit `Avatar`
 * headless component loads the image itself, waits out `fallbackDelay`,
 * and hands the view root / image / fallback parts; this wrapper injects
 * the class strings and `data-slot` attributes into those parts); only the
 * class layer changes: class strings are byte-for-byte the shadcn
 * bases/radix strings — structural inline classes plus `cn-*` hook classes
 * (`cn-avatar`, `cn-avatar-image`, …) whose utilities are supplied by the
 * style presets. The parity checker asserts every token in
 * `parity/bases-tokens.json["avatar"]`.
 *
 * Anatomy diffs vs the new-york generation (all upstream's, preserved):
 * - Root drops its inline `size-8` / `rounded-full` / `overflow-hidden`
 *   and gains an `after:` border ring (dark-mode blend included) — sizing
 *   and shape now live in the presets' `cn-avatar` rule.
 * - Fallback drops `bg-muted` / `rounded-full` / `text-muted-foreground`
 *   (preset-owned); image gains `object-cover`.
 * - Badge drops `bg-primary` / `text-primary-foreground` and gains
 *   `bg-blend-color` — its colors are preset-owned.
 * - GroupCount drops its inline size/background/typography entirely.
 *
 * Declared divergence (unchanged from the new-york port): upstream's
 * standalone `AvatarImage` / `AvatarFallback` exports cannot exist here —
 * the kit Avatar owns the load state, so image and fallback are parts
 * inside the view closure, not separate components. `AvatarBadge`,
 * `AvatarGroup` and `AvatarGroupCount` are pure view functions, exactly
 * as upstream.
 */
import type { Component } from "@effect/ui";
import {
  Avatar as KitAvatar,
  type AvatarImg,
  type AvatarProps as KitAvatarProps,
  type AvatarSpan,
} from "@effect/ui-kit";
import type * as Html from "@effect/ui/html/Html";
import { cn } from "@/lib/utils";

export type AvatarSize = "default" | "sm" | "lg";

type KitParts = Component.Headless.Parts<typeof KitAvatar>;

const ROOT_CLASS =
  "cn-avatar group/avatar relative flex shrink-0 select-none after:absolute after:inset-0 after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten";

const IMAGE_CLASS = "cn-avatar-image aspect-square size-full object-cover";

const FALLBACK_CLASS =
  "cn-avatar-fallback flex size-full items-center justify-center text-sm group-data-[size=sm]/avatar:text-xs";

const BADGE_CLASS =
  "cn-avatar-badge absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-blend-color ring-2 select-none group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2 group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2";

const GROUP_CLASS =
  "cn-avatar-group group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background";

const GROUP_COUNT_CLASS =
  "cn-avatar-group-count relative flex shrink-0 items-center justify-center ring-2 ring-background";

/**
 * A shadcn-styled avatar (bases generation). `props` are the kit Avatar's
 * props (src, srcSet, sizes, crossOrigin, referrerPolicy, fallbackDelay);
 * `view` receives the kit's parts with the shadcn classes and data-slot
 * attributes applied.
 */
export const Avatar = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly key?: string | undefined;
    readonly props?: KitAvatarProps | undefined;
    readonly size?: AvatarSize | undefined;
    readonly class?: string | undefined;
    readonly imageClass?: string | undefined;
    readonly fallbackClass?: string | undefined;
    readonly view: (avatar: KitParts) => AvatarSpan<Msg>;
  },
) =>
  KitAvatar(h, {
    key: options.key,
    props: options.props ?? {},
    view: (avatar) =>
      options.view({
        imageLoadingStatus: avatar.imageLoadingStatus,
        root: <M, RR = never>(element: AvatarSpan<M, RR>) =>
          avatar.root(
            element
              .attr("data-slot", "avatar")
              .attr("data-size", options.size ?? "default")
              .class(cn(ROOT_CLASS, options.class)),
          ),
        image: <M, RR = never>(element: AvatarImg<M, RR>) =>
          avatar.image(
            element.attr("data-slot", "avatar-image").class(cn(IMAGE_CLASS, options.imageClass)),
          ),
        fallback: <M, RR = never>(element: AvatarSpan<M, RR>) =>
          avatar.fallback(
            element
              .attr("data-slot", "avatar-fallback")
              .class(cn(FALLBACK_CLASS, options.fallbackClass)),
          ),
      }),
  });

/** Upstream `AvatarBadge`: a status dot pinned to the avatar's corner. Pure markup. */
export const AvatarBadge = <Msg, R = never>(
  h: {
    readonly span: Html.Element<Msg, R, Html.EventsOf<"span">, HTMLSpanElement, "span">;
  },
  options: { readonly class?: string | undefined } = {},
) => h.span.attr("data-slot", "avatar-badge").class(cn(BADGE_CLASS, options.class));

/** Upstream `AvatarGroup`: overlapping row of avatars. Pure markup. */
export const AvatarGroup = <Msg, R = never>(
  h: {
    readonly div: Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;
  },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "avatar-group").class(cn(GROUP_CLASS, options.class));

/** Upstream `AvatarGroupCount`: the "+3" bubble at the end of a group. Pure markup. */
export const AvatarGroupCount = <Msg, R = never>(
  h: {
    readonly div: Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;
  },
  options: { readonly class?: string | undefined } = {},
) => h.div.attr("data-slot", "avatar-group-count").class(cn(GROUP_COUNT_CLASS, options.class));
