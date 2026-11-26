/**
 * Avatar — shadcn/ui `avatar` ported 1:1 to Effect UI.
 *
 * Upstream: React + Radix Avatar (Root / Image / Fallback) plus pure-markup
 * Badge / Group / GroupCount. Here: the @effect/ui-kit `Avatar` headless
 * component, which loads the image itself (through `HtmlImages.Images`),
 * waits out `fallbackDelay`, and hands the view three parts — root, image,
 * fallback. This wrapper injects the shadcn class strings and `data-slot`
 * attributes into those parts, so the consumer's view reads like upstream:
 *
 *   Avatar(h, {
 *     props: { src: "/ada.png" },
 *     size: "lg",
 *     view: (avatar) =>
 *       avatar.root(h.span).children(
 *         avatar.image(h.img.attr("alt", "Ada")),
 *         avatar.fallback(h.span)?.children("AL"),
 *         AvatarBadge(h, {}).children(...)
 *       )
 *   })
 *
 * Declared divergence: upstream's standalone `AvatarImage` / `AvatarFallback`
 * exports cannot exist here — the kit Avatar owns the load state, so image
 * and fallback are parts inside the view closure (styled by this wrapper),
 * not separate components. `AvatarBadge`, `AvatarGroup` and
 * `AvatarGroupCount` are pure view functions, exactly as upstream.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings.
 */
import type { Component } from "@effect/ui"
import {
  Avatar as KitAvatar,
  type AvatarImg,
  type AvatarProps as KitAvatarProps,
  type AvatarSpan
} from "@effect/ui-kit"
import type * as Html from "@effect/ui/html/Html"
import { cn } from "../lib/utils.ts"

export type AvatarSize = "default" | "sm" | "lg"

type KitParts = Component.Headless.Parts<typeof KitAvatar>

const ROOT_CLASS =
  "group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6"

const IMAGE_CLASS = "aspect-square size-full"

const FALLBACK_CLASS =
  "flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs"

const BADGE_CLASS =
  "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2 group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2"

const GROUP_CLASS =
  "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background"

const GROUP_COUNT_CLASS =
  "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3"

/**
 * A shadcn-styled avatar. `props` are the kit Avatar's props (src, srcSet,
 * sizes, crossOrigin, referrerPolicy, fallbackDelay); `view` receives the
 * kit's parts with the shadcn classes and data-slot attributes applied.
 */
export const Avatar = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly key?: string | undefined
    readonly props?: KitAvatarProps | undefined
    readonly size?: AvatarSize | undefined
    readonly class?: string | undefined
    readonly imageClass?: string | undefined
    readonly fallbackClass?: string | undefined
    readonly view: (avatar: KitParts) => AvatarSpan<Msg>
  }
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
              .class(cn(ROOT_CLASS, options.class))
          ),
        image: <M, RR = never>(element: AvatarImg<M, RR>) =>
          avatar.image(
            element
              .attr("data-slot", "avatar-image")
              .class(cn(IMAGE_CLASS, options.imageClass))
          ),
        fallback: <M, RR = never>(element: AvatarSpan<M, RR>) =>
          avatar.fallback(
            element
              .attr("data-slot", "avatar-fallback")
              .class(cn(FALLBACK_CLASS, options.fallbackClass))
          )
      })
  })

/** Upstream `AvatarBadge`: a status dot pinned to the avatar's corner. Pure markup. */
export const AvatarBadge = <Msg, R = never>(
  h: {
    readonly span: Html.Element<
      Msg,
      R,
      Html.EventsOf<"span">,
      HTMLSpanElement,
      "span"
    >
  },
  options: { readonly class?: string | undefined } = {}
) =>
  h.span
    .attr("data-slot", "avatar-badge")
    .class(cn(BADGE_CLASS, options.class))

/** Upstream `AvatarGroup`: overlapping row of avatars. Pure markup. */
export const AvatarGroup = <Msg, R = never>(
  h: {
    readonly div: Html.Element<
      Msg,
      R,
      Html.EventsOf<"div">,
      HTMLDivElement,
      "div"
    >
  },
  options: { readonly class?: string | undefined } = {}
) =>
  h.div
    .attr("data-slot", "avatar-group")
    .class(cn(GROUP_CLASS, options.class))

/** Upstream `AvatarGroupCount`: the "+3" bubble at the end of a group. Pure markup. */
export const AvatarGroupCount = <Msg, R = never>(
  h: {
    readonly div: Html.Element<
      Msg,
      R,
      Html.EventsOf<"div">,
      HTMLDivElement,
      "div"
    >
  },
  options: { readonly class?: string | undefined } = {}
) =>
  h.div
    .attr("data-slot", "avatar-group-count")
    .class(cn(GROUP_COUNT_CLASS, options.class))
