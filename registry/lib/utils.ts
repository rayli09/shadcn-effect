/**
 * cn — Effect-native replacement for the clsx + tailwind-merge `cn` in shadcn/ui.
 *
 * Deliberately dependency-free: upstream `cn` resolves conflicting Tailwind
 * utilities with tailwind-merge; here class strings are authored to be
 * conflict-free (the parity checker enforces the exact upstream strings), so
 * cn is a pure join of the truthy parts, in order. If a caller passes a
 * conflicting utility, the later one does NOT win by merge — it wins or loses
 * by CSS order, exactly like a plain class attribute. That is the one declared
 * divergence from upstream `cn` (see docs/PORTING-RULES.md, D-1).
 */
export const cn = (
  ...parts: ReadonlyArray<string | false | undefined>
): string => parts.filter((p): p is string => typeof p === "string" && p.length > 0).join(" ")
