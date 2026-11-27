/**
 * Spinner (bases generation) — shadcn/ui `spinner` ported 1:1 to Effect UI.
 *
 * Same Effect port as `registry/ui/spinner.ts` (the shared
 * `LoaderCircleIcon` builder in `@/lib/icons` — lucide loader path data
 * "M21 12a9 9 0 1 1-6.219-8.56", ISC — with lucide's base attribute set
 * removed and `role="status"` / `aria-label="Loading"` chained on; see
 * that file's header for why). The class string is unchanged between
 * generations ("size-4 animate-spin" — the bases source has NO `cn-*`
 * hook here; the parity checker asserts every token in
 * `parity/bases-tokens.json["spinner"]`).
 *
 * Anatomy diff vs the new-york generation (upstream's, preserved): the
 * bases source renders through upstream's multi-library `IconPlaceholder`
 * (lucide / tabler / hugeicons / phosphor / remixicon) and stamps
 * `data-slot="spinner"` on the <svg>. The placeholder abstraction does
 * not exist here — this registry ships the lucide glyph only — but the
 * `data-slot` is new in this generation and IS stamped below.
 */
import type { Html } from "@effect/ui/html";
import { LoaderCircleIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export const SPINNER_CLASS = "size-4 animate-spin";

export const Spinner = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  LoaderCircleIcon(h, { class: cn(SPINNER_CLASS, options.class) }).attrs({
    xmlns: undefined,
    width: undefined,
    height: undefined,
    "aria-hidden": undefined,
    "data-slot": "spinner",
    role: "status",
    "aria-label": "Loading",
  });
