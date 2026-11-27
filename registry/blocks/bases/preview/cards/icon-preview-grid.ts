/**
 * IconPreviewGrid — shadcn/ui block `preview` (registry/bases/radix/blocks/preview/cards/icon-preview-grid.tsx), bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a Card whose content is an 8-column grid rendering one
 * `IconPlaceholder` per `PREVIEW_ICONS` entry, each cell a ringed
 * `size-8` box sizing its svg to `size-4`. The `PREVIEW_ICONS` data
 * table — sixteen entries, each naming the same glyph in five icon
 * libraries (lucide, tabler, hugeicons, phosphor, remixicon) — is
 * kept verbatim below. Here: a plain view function drawing the same
 * grid, each cell holding the lucide glyph for its entry.
 *
 * Declared divergences (anything else is a bug):
 *
 * - Icons: upstream's `IconPlaceholder` is a create-app component
 *   that swaps icon libraries; only the lucide rendering is ported.
 *   Each entry renders the lucide glyph named by its `lucide` field;
 *   the tabler / hugeicons / phosphor / remixicon names stay in the
 *   data table verbatim but are never rendered. `CheckIcon`,
 *   `ChevronDownIcon`, `ChevronRightIcon`, `SearchIcon`,
 *   `EllipsisIcon` (upstream's `MoreHorizontalIcon` — the lucide
 *   `ellipsis` glyph), `LoaderCircleIcon` (upstream's `Loader2Icon`)
 *   and `MinusIcon` are the shared builders from `@/lib/icons`; the
 *   rest are local builders below, built with the shared `icon()`
 *   helper from lucide path data (ISC), copied verbatim: `copy`,
 *   `circle-alert`, `trash`, `share`, `shopping-bag`, `plus`,
 *   `arrow-left`, `arrow-right`, `settings`.
 * - Upstream types the table with `satisfies Record<IconLibraryName,
 *   string>[]` from `shadcn/icons` (a create-app internal, not
 *   ported); the table here carries a local structural type with the
 *   same five fields instead.
 */
import type { Html } from "@effect/ui/html";
import type * as View from "@effect/ui/View";
import { Card, CardContent } from "@/components/ui/card.ts";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EllipsisIcon,
  LoaderCircleIcon,
  MinusIcon,
  SearchIcon,
  icon,
  type IconOptions,
} from "@/lib/icons";

// ---------------------------------------------------------------------------
// Local icon builders (lucide path data, ISC — see header)
// ---------------------------------------------------------------------------

/** Lucide `copy` (ISC): the `CopyIcon` entry. */
const CopyIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }],
      ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }],
    ],
    options,
  );

/** Lucide `circle-alert` (ISC): the `CircleAlertIcon` entry. */
const CircleAlertIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["line", { x1: "12", x2: "12", y1: "8", y2: "12" }],
      ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16" }],
    ],
    options,
  );

/** Lucide `trash` (ISC): the `TrashIcon` entry. */
const TrashIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M10 11v6" }],
      ["path", { d: "M14 11v6" }],
      ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }],
      ["path", { d: "M3 6h18" }],
      ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }],
    ],
    options,
  );

/** Lucide `share` (ISC): the `ShareIcon` entry. */
const ShareIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 2v13" }],
      ["path", { d: "m16 6-4-4-4 4" }],
      ["path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }],
    ],
    options,
  );

/** Lucide `shopping-bag` (ISC): the `ShoppingBagIcon` entry. */
const ShoppingBagIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M16 10a4 4 0 0 1-8 0" }],
      ["path", { d: "M3.103 6.034h17.794" }],
      [
        "path",
        {
          d: "M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z",
        },
      ],
    ],
    options,
  );

/** Lucide `plus` (ISC): the `PlusIcon` entry. */
const PlusIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M5 12h14" }],
      ["path", { d: "M12 5v14" }],
    ],
    options,
  );

/** Lucide `arrow-left` (ISC): the `ArrowLeftIcon` entry. */
const ArrowLeftIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "m12 19-7-7 7-7" }],
      ["path", { d: "M19 12H5" }],
    ],
    options,
  );

/** Lucide `arrow-right` (ISC): the `ArrowRightIcon` entry. */
const ArrowRightIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M5 12h14" }],
      ["path", { d: "m12 5 7 7-7 7" }],
    ],
    options,
  );

/** Lucide `settings` (ISC): the `SettingsIcon` entry. */
const SettingsIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
        },
      ],
      ["circle", { cx: "12", cy: "12", r: "3" }],
    ],
    options,
  );

// ---------------------------------------------------------------------------
// Data (verbatim from upstream)
// ---------------------------------------------------------------------------

export const PREVIEW_ICONS = [
  {
    lucide: "CopyIcon",
    tabler: "IconCopy",
    hugeicons: "Copy01Icon",
    phosphor: "CopyIcon",
    remixicon: "RiFileCopyLine",
  },
  {
    lucide: "CircleAlertIcon",
    tabler: "IconExclamationCircle",
    hugeicons: "AlertCircleIcon",
    phosphor: "WarningCircleIcon",
    remixicon: "RiErrorWarningLine",
  },
  {
    lucide: "TrashIcon",
    tabler: "IconTrash",
    hugeicons: "Delete02Icon",
    phosphor: "TrashIcon",
    remixicon: "RiDeleteBinLine",
  },
  {
    lucide: "ShareIcon",
    tabler: "IconShare",
    hugeicons: "Share03Icon",
    phosphor: "ShareIcon",
    remixicon: "RiShareLine",
  },
  {
    lucide: "ShoppingBagIcon",
    tabler: "IconShoppingBag",
    hugeicons: "ShoppingBag01Icon",
    phosphor: "BagIcon",
    remixicon: "RiShoppingBagLine",
  },
  {
    lucide: "MoreHorizontalIcon",
    tabler: "IconDots",
    hugeicons: "MoreHorizontalCircle01Icon",
    phosphor: "DotsThreeIcon",
    remixicon: "RiMoreLine",
  },
  {
    lucide: "Loader2Icon",
    tabler: "IconLoader",
    hugeicons: "Loading03Icon",
    phosphor: "SpinnerIcon",
    remixicon: "RiLoaderLine",
  },
  {
    lucide: "PlusIcon",
    tabler: "IconPlus",
    hugeicons: "PlusSignIcon",
    phosphor: "PlusIcon",
    remixicon: "RiAddLine",
  },
  {
    lucide: "MinusIcon",
    tabler: "IconMinus",
    hugeicons: "MinusSignIcon",
    phosphor: "MinusIcon",
    remixicon: "RiSubtractLine",
  },
  {
    lucide: "ArrowLeftIcon",
    tabler: "IconArrowLeft",
    hugeicons: "ArrowLeft02Icon",
    phosphor: "ArrowLeftIcon",
    remixicon: "RiArrowLeftLine",
  },
  {
    lucide: "ArrowRightIcon",
    tabler: "IconArrowRight",
    hugeicons: "ArrowRight02Icon",
    phosphor: "ArrowRightIcon",
    remixicon: "RiArrowRightLine",
  },
  {
    lucide: "CheckIcon",
    tabler: "IconCheck",
    hugeicons: "Tick02Icon",
    phosphor: "CheckIcon",
    remixicon: "RiCheckLine",
  },
  {
    lucide: "ChevronDownIcon",
    tabler: "IconChevronDown",
    hugeicons: "ArrowDown01Icon",
    phosphor: "CaretDownIcon",
    remixicon: "RiArrowDownSLine",
  },
  {
    lucide: "ChevronRightIcon",
    tabler: "IconChevronRight",
    hugeicons: "ArrowRight01Icon",
    phosphor: "CaretRightIcon",
    remixicon: "RiArrowRightSLine",
  },
  {
    lucide: "SearchIcon",
    tabler: "IconSearch",
    hugeicons: "Search01Icon",
    phosphor: "MagnifyingGlassIcon",
    remixicon: "RiSearchLine",
  },
  {
    lucide: "SettingsIcon",
    tabler: "IconSettings",
    hugeicons: "Settings01Icon",
    phosphor: "GearIcon",
    remixicon: "RiSettingsLine",
  },
] as const;

/** The lucide builder for each `PREVIEW_ICONS` entry, in table order. */
const PREVIEW_ICON_BUILDERS: ReadonlyArray<<Msg>(h: Html.H<Msg>) => View.Content<Msg>> = [
  (h) => CopyIcon(h),
  (h) => CircleAlertIcon(h),
  (h) => TrashIcon(h),
  (h) => ShareIcon(h),
  (h) => ShoppingBagIcon(h),
  (h) => EllipsisIcon(h),
  (h) => LoaderCircleIcon(h),
  (h) => PlusIcon(h),
  (h) => MinusIcon(h),
  (h) => ArrowLeftIcon(h),
  (h) => ArrowRightIcon(h),
  (h) => CheckIcon(h),
  (h) => ChevronDownIcon(h),
  (h) => ChevronRightIcon(h),
  (h) => SearchIcon(h),
  (h) => SettingsIcon(h),
];

export const IconPreviewGrid = <Msg>(h: Html.H<Msg>) =>
  Card(h).children(
    CardContent(h).children(
      h.div
        .class("grid grid-cols-8 place-items-center gap-4")
        .children(
          PREVIEW_ICONS.map((entry, index) =>
            h.div
              .key(entry.lucide)
              .class(
                "flex size-8 items-center justify-center rounded-md ring ring-border style-sera:rounded-none *:[svg]:size-4",
              )
              .children(PREVIEW_ICON_BUILDERS[index]!(h)),
          ),
        ),
    ),
  );
