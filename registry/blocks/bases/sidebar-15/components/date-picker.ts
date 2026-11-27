/**
 * DatePicker (sidebar-15 block) — upstream
 * `registry/bases/radix/blocks/sidebar-15/components/date-picker.tsx`
 * ported to Effect UI. A view function: the provider's parts come first,
 * then the caller's `h`.
 *
 * Declared divergences:
 * - Upstream holds the selection in `useState` (initial value: the 12th
 *   of the current month). The kit Calendar's value is the consumer's
 *   (it lives in a Model); this block is an example composition whose
 *   host Page owns no calendar state, so the calendar is drawn with
 *   upstream's initial value as a static prop — computed from the
 *   current date exactly as upstream computes it — and its events are
 *   no-ops. Wire `value` / `onEmit` to a Model in a real app.
 * - Upstream's `captionLayout="dropdown"` is passed through; the
 *   calendar port renders the caption label only (see the calendar
 *   port's header — the kit has no dropdown machinery).
 * - Dates are the kit's `DateTime.Utc` values (midnight-UTC normalized),
 *   not JS `Date`s.
 */
import type * as Html from "@effect/ui/html/Html";
import * as DateTime from "effect/DateTime";
import { Calendar } from "@/components/ui/calendar.ts";
import {
  SidebarGroup,
  SidebarGroupContent,
  type SidebarProviderParts,
} from "@/components/ui/sidebar.ts";

export const DatePicker = <Msg>(sidebar: SidebarProviderParts, h: Html.H<Msg>) => {
  const now = new Date();
  const selected = DateTime.makeUnsafe(new Date(now.getFullYear(), now.getMonth(), 12));
  const month = DateTime.makeUnsafe(new Date(now.getFullYear(), now.getMonth(), 1));
  return SidebarGroup(h, { class: "px-0" }).children(
    SidebarGroupContent(h).children(
      Calendar(h, {
        props: {
          value: selected,
          month,
          today: DateTime.makeUnsafe(now),
          locale: "en-US",
        },
        captionLayout: "dropdown",
        class: "bg-transparent [--cell-size:2.1rem]",
        onEmit: {
          Picked: () => undefined,
          RequestedMonth: () => undefined,
        },
      }),
    ),
  );
};
