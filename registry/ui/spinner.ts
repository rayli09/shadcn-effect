/**
 * Spinner — shadcn/ui `spinner` ported 1:1 to Effect UI.
 *
 * Upstream: lucide-react's `Loader2Icon` with `role="status"`,
 * `aria-label="Loading"` and the class string "size-4 animate-spin".
 * lucide-react is BANNED in this registry, so this port renders the same
 * glyph via the shared `LoaderCircleIcon` builder in `../lib/icons.ts`
 * (lucide loader path data "M21 12a9 9 0 1 1-6.219-8.56", ISC).
 *
 * The shared `icon()` helper stamps lucide's full base set (xmlns,
 * width/height, `aria-hidden="true"`) — none of which upstream's spinner
 * renders, and an aria-hidden live region would be hidden from assistive
 * tech. Those four are removed by chaining `.attrs({ …: undefined })`
 * (an undefined value removes the attribute in @effect/ui's View), and
 * `role="status"` / `aria-label="Loading"` are chained on. A render diff at
 * migration time (wave 3) verified the rendered <svg> carries exactly the
 * same attribute set and path as the hand-built version this replaced —
 * only attribute order differs, which HTML does not care about.
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
    role: "status",
    "aria-label": "Loading",
  });
