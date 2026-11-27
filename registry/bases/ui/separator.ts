/**
 * Separator (bases generation) — shadcn/ui `separator` ported 1:1 to
 * Effect UI.
 *
 * Same Effect port as `registry/ui/separator.ts` (the @effect/ui-kit
 * `Separator` view function, which writes the role / aria-orientation
 * semantics onto a <div>); only the class layer changes: the class string
 * is byte-for-byte the shadcn bases/radix string. The parity checker
 * asserts every token in `parity/bases-tokens.json["separator"]`.
 *
 * Declared bridge (D-5 family): the bases class string keys its sizing off
 * the `data-horizontal:` / `data-vertical:` Tailwind variants, which match
 * the presence attributes the current Radix writes. The kit Separator
 * writes `data-orientation` instead, so this wrapper ALSO stamps the
 * matching presence attribute (`data-horizontal` or `data-vertical`, from
 * the same orientation option) to keep the upstream variants live.
 */
import { Separator as KitSeparator, type SeparatorElement } from "@effect/ui-kit";
import { cn } from "@/lib/utils";

export const SEPARATOR_CLASS =
  "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch";

export const Separator = <Msg, R = never>(
  h: { readonly div: SeparatorElement<Msg> },
  options: {
    readonly element?: SeparatorElement<Msg, R> | undefined;
    readonly orientation?: "horizontal" | "vertical" | undefined;
    readonly class?: string | undefined;
  } = {},
) => {
  const orientation = options.orientation ?? "horizontal";
  const separator = KitSeparator(h, {
    element: options.element,
    props: { orientation: options.orientation },
  })
    .attr("data-slot", "separator")
    .class(cn(SEPARATOR_CLASS, options.class));
  return orientation === "horizontal"
    ? separator.attr("data-horizontal", "")
    : separator.attr("data-vertical", "");
};
