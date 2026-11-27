/**
 * InputOTP — shadcn/ui `input-otp` ported 1:1 to Effect UI.
 *
 * Upstream: React + the `input-otp` package (BANNED here) — one invisible
 * real `<input>` stretched over a row of styled slot `<div>`s that read
 * their character, active state and fake caret from a React context.
 * Here: the @effect/ui-kit `OTPField` headless component. The kit's
 * anatomy is the honest version of the same picture: each slot IS a real
 * `<input>` (focus moves slot to slot, paste and autofill land whole),
 * and the kit adds one visually hidden input that holds the whole code
 * under the `name` prop for form submission. The code is the consumer's:
 * it comes in as the `value` prop (a `Redacted<string>` — codes stay out
 * of message logs) and edits arrive as the kit's `Updated` / `Completed`
 * / `Rejected` events. Upstream's `maxLength` is the kit's `length` prop.
 *
 * Upstream export → this port:
 * - `InputOTP`          → `InputOTP` (below; styled kit OTPField)
 * - `InputOTPGroup`     → `InputOTPGroup` (plain view function; draw it
 *                         inside the root's children, around the slots)
 * - `InputOTPSlot`      → the styled `slot` part in the view closure
 *                         (kit name `input` kept as an alias), also
 *                         exported below as a function of the parts
 * - `InputOTPSeparator` → `InputOTPSeparator` (plain view function with
 *                         the Lucide minus as an inline SVG)
 *
 *   InputOTP(h, {
 *     props: { value: model.code, length: 6, name: "code" },
 *     onEmit: {
 *       Updated: ({ value }) => Msg.UpdatedCode({ value }),
 *       Completed: () => Msg.SubmitCode(),
 *       Rejected: () => undefined
 *     },
 *     view: (otp) =>
 *       otp.root(h.div).children(
 *         InputOTPGroup(h).children(
 *           InputOTPSlot(otp, { element: h.input, index: 0 }),
 *           InputOTPSlot(otp, { element: h.input, index: 1 }),
 *           InputOTPSlot(otp, { element: h.input, index: 2 })
 *         ),
 *         InputOTPSeparator(h),
 *         InputOTPGroup(h).children(
 *           InputOTPSlot(otp, { element: h.input, index: 3 }),
 *           InputOTPSlot(otp, { element: h.input, index: 4 }),
 *           InputOTPSlot(otp, { element: h.input, index: 5 })
 *         )
 *       )
 *   })
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings.
 *
 * Declared divergences (in-file, on top of docs/PORTING-RULES.md):
 * - The slot classes land on the kit's per-slot `<input>`, not on a
 *   wrapper `<div>`: there is no wrapper in the kit's anatomy. A native
 *   input positions its character itself, so the upstream div's flex
 *   centering has no effect on it — the character sits where the input
 *   puts it (chain `text-center` in a slot's `class` if you want it
 *   centred; upstream's string is kept untouched).
 * - `data-[active=true]:…` slot variants are inert (D-5 family). Upstream
 *   writes `data-active` per slot from its context; the kit exposes focus
 *   as field-level `data-focused` / per-slot `data-filled` attributes and
 *   does not hand the view an active index, so no `data-active` is
 *   written and those ring/border variants never match. The tokens are
 *   kept verbatim for parity.
 * - No fake caret: upstream draws one in the active empty slot because
 *   its real input is invisible. The kit's slots are real inputs with
 *   real carets, so there is nothing to fake. Upstream's caret class
 *   strings are exported (`INPUT_OTP_FAKE_CARET_CLASS` /
 *   `INPUT_OTP_FAKE_CARET_BAR_CLASS`) for anyone overlaying their own.
 * - `data-slot="input-otp"` sits on the kit `root` (the group element).
 *   Upstream puts it on its single real input; the kit's whole-code
 *   input is drawn by the kit itself, inside the root, and takes no
 *   consumer attributes.
 * - Upstream's `className` (default `disabled:cursor-not-allowed`) is
 *   styled onto the one real input; here the real inputs are the slots,
 *   so `class` lands on every slot. `containerClassName` is
 *   `containerClass`, on the root, as upstream.
 * - `pattern` / `inputMode` / `autoComplete` / `mask` are kit props with
 *   kit defaults (`validationType` drives the accepted characters), not
 *   attributes spread onto an input.
 */
import type * as Component from "@effect/ui/Component";
import type * as View from "@effect/ui/View";
import type { Html } from "@effect/ui/html";
import { OTPField as KitOTPField, type OTPFieldEvents, type OTPFieldProps } from "@effect/ui-kit";
import { MinusIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type {
  OTPFieldEvents,
  OTPFieldInputMode,
  OTPFieldProps,
  OTPFieldValidationType,
} from "@effect/ui-kit";

type DivElement<Msg, R = never> = Html.Element<Msg, R, Html.EventsOf<"div">, HTMLDivElement, "div">;

/** The kit OTPField's parts, before styling. */
type KitOTPParts = Component.Headless.Parts<typeof KitOTPField>;

// ---------------------------------------------------------------------------
// Class strings — verbatim from shadcn new-york-v4 input-otp.tsx
// ---------------------------------------------------------------------------

/** Upstream's container classes (`containerClassName`'s base). */
export const INPUT_OTP_CONTAINER_CLASS = "flex items-center gap-2 has-disabled:opacity-50";

/** Upstream `InputOTP`'s own class base, written onto its real input — here, onto every slot. */
export const INPUT_OTP_CLASS = "disabled:cursor-not-allowed";

export const INPUT_OTP_GROUP_CLASS = "flex items-center";

export const INPUT_OTP_SLOT_CLASS =
  "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-[3px] data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40";

/** Upstream's fake-caret overlay, exported but not rendered — the kit's slots are real inputs with real carets (see header). */
export const INPUT_OTP_FAKE_CARET_CLASS =
  "pointer-events-none absolute inset-0 flex items-center justify-center";

/** Upstream's fake-caret bar, exported but not rendered — see `INPUT_OTP_FAKE_CARET_CLASS`. */
export const INPUT_OTP_FAKE_CARET_BAR_CLASS =
  "h-4 w-px animate-caret-blink bg-foreground duration-1000";

// ---------------------------------------------------------------------------
// Styled parts
// ---------------------------------------------------------------------------

/** What an `InputOTP`'s `view` gets: the kit OTPField's values and styled parts. */
export interface InputOTPParts {
  /** The code the slots show, as a `Redacted<string>`. */
  readonly value: OTPFieldProps["value"];
  readonly length: number;
  readonly complete: boolean;
  readonly filled: boolean;
  readonly focused: boolean;
  readonly disabled: boolean;
  readonly readOnly: boolean;
  readonly required: boolean;
  /** Upstream `InputOTP`'s container: the kit `root` part with `data-slot="input-otp"` and the container classes. Add the slots and groups with `.children(...)`. */
  readonly root: <B extends View.PartTarget<string>>(
    element: B,
    options?: { readonly class?: string | undefined },
  ) => ReturnType<B["attr"]>;
  /** Upstream `InputOTPSlot`: the kit `input` part for `index`, with `data-slot="input-otp-slot"` and the slot classes. */
  readonly slot: <B extends View.PartTarget<"input">>(args: {
    readonly element: B;
    readonly index: number;
    readonly class?: string | undefined;
  }) => ReturnType<B["attr"]>;
  /** The kit's own name for the slot part — the same styled part as `slot`. */
  readonly input: InputOTPParts["slot"];
}

/** shadcn's `InputOTPSlot`, as a function of the parts from `InputOTP`'s view closure. */
export const InputOTPSlot = <B extends View.PartTarget<"input">>(
  otp: InputOTPParts,
  args: {
    readonly element: B;
    readonly index: number;
    readonly class?: string | undefined;
  },
): ReturnType<B["attr"]> => otp.slot(args);

// ---------------------------------------------------------------------------
// InputOTP
// ---------------------------------------------------------------------------

/**
 * A shadcn-styled one-time code field. Call it exactly like the kit's
 * `OTPField`, with a `view` closure that draws the styled parts (see the
 * file header for the full example). The consumer owns the code: pass it
 * as `props.value` (a `Redacted<string>`), store what `Updated` reports,
 * and answer `Completed` if you want to submit on a full code.
 */
export const InputOTP = <Msg, RV = never, RF = never>(
  h: View.Helper<Msg, unknown>,
  options: View.Child.Options<OTPFieldProps, OTPFieldEvents, NoInfer<Msg>> & {
    /** The field's whole view, from its styled parts. */
    readonly view: (parts: InputOTPParts) => View.Content<NoInfer<Msg>, RV>;
    /** Upstream `className`: appended to every slot's classes (the slots are the real inputs here). */
    readonly class?: string | undefined;
    /** Upstream `containerClassName`: appended to the root's container classes. */
    readonly containerClass?: string | undefined;
  },
): ReturnType<typeof KitOTPField<Msg, RV, RF>> =>
  KitOTPField<Msg, RV, RF>(h, {
    key: options.key,
    props: options.props,
    onEmit: options.onEmit,
    onFailure: options.onFailure,
    view: (otp: KitOTPParts) => {
      const slot: InputOTPParts["slot"] = (args) =>
        otp
          .input({ element: args.element, index: args.index })
          .attr("data-slot", "input-otp-slot")
          .class(cn(INPUT_OTP_SLOT_CLASS, INPUT_OTP_CLASS, options.class, args.class));
      return options.view({
        value: otp.value,
        length: otp.length,
        complete: otp.complete,
        filled: otp.filled,
        focused: otp.focused,
        disabled: otp.disabled,
        readOnly: otp.readOnly,
        required: otp.required,
        root: (element, partOptions) =>
          otp
            .root(element)
            .attr("data-slot", "input-otp")
            .class(cn(INPUT_OTP_CONTAINER_CLASS, options.containerClass, partOptions?.class)),
        slot,
        input: slot,
      });
    },
  });

// ---------------------------------------------------------------------------
// InputOTPGroup / InputOTPSeparator — plain view functions
// ---------------------------------------------------------------------------

/** A run of slots with no gap, so their shared borders collapse into one outline. Draw it inside the root's children, around `InputOTPSlot`s. */
export const InputOTPGroup = <Msg, R = never>(
  h: { readonly div: DivElement<Msg, R> },
  options: {
    readonly class?: string | undefined;
  } = {},
) => h.div.attr("data-slot", "input-otp-group").class(cn(INPUT_OTP_GROUP_CLASS, options.class));

/** The dash between two slot groups: a `role="separator"` div holding the Lucide minus (the shared `MinusIcon` from `../lib/icons.ts`, drawn at the default 24px as upstream's bare `<MinusIcon />`), as upstream. Upstream sets no class on it; `class` is only written when given. */
export const InputOTPSeparator = <Msg>(
  h: Html.H<Msg>,
  options: {
    readonly class?: string | undefined;
  } = {},
) => {
  const separator = h.div.attr("data-slot", "input-otp-separator").attr("role", "separator");
  return (options.class === undefined ? separator : separator.class(options.class)).children(
    MinusIcon(h),
  );
};
