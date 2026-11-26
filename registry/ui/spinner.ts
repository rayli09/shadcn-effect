/**
 * Spinner — shadcn/ui `spinner` ported 1:1 to Effect UI.
 *
 * Upstream: lucide-react's `Loader2Icon` with `role="status"`,
 * `aria-label="Loading"` and the class string "size-4 animate-spin".
 * lucide-react is BANNED in this registry, so this port renders the same
 * icon as an inline SVG builder — the approach PORTING-RULES.md prescribes
 * for icons, and the one Effect UI itself uses for SVG (`h.el(tag)`, see
 * the launch example's diagram code):
 *
 * - The <svg> carries lucide's own attributes: viewBox 0 0 24 24,
 *   fill none, stroke currentColor, stroke-width 2, round caps/joins.
 * - The single <path> is lucide's loader path data
 *   ("M21 12a9 9 0 1 1-6.219-8.56", ISC-licensed), identical to the glyph
 *   Loader2 / LoaderCircle renders.
 * - `role="status"` and `aria-label="Loading"` are preserved, as is the
 *   exact upstream class string.
 */
import { Html } from "@effect/ui/html"
import { cn } from "../lib/utils.ts"

export const SPINNER_CLASS = "size-4 animate-spin"

/** Lucide loader path data (ISC). */
const LOADER_PATH = "M21 12a9 9 0 1 1-6.219-8.56"

export const Spinner = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {}
) =>
  h.el("svg").attrs({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    role: "status",
    "aria-label": "Loading",
    class: cn(SPINNER_CLASS, options.class)
  }).children(
    h.el("path").attr("d", LOADER_PATH)
  )
