# 1:1 Mapping — shadcn/ui (new-york-v4, 61 files) → Effect UI

Rule: same name, same DOM slot attributes (`data-slot`, `data-variant`, `data-size`),
same Tailwind class strings (parity-checked), same variant names. What changes is
_only_ the engine: React/Radix/cva/hooks out, @effect/ui + @effect/ui-kit in.

`@effect/ui-kit` ships 49 component modules (Accordion…VirtualList, incl. Calendar,
DatePicker, DateField, FileDrop which shadcn does not have) — every interactive
shadcn primitive has a kit counterpart except the ones marked view/composition,
which are pure markup in both worlds.

| shadcn             | Effect UI primitive                      | kind                                          | status                                                                                                                                                    |
| ------------------ | ---------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accordion`        | Accordion                                | kit                                           | ported (wave 1)                                                                                                                                           |
| `alert`            | — (pure view / composition)              | view                                          | ported (wave 1)                                                                                                                                           |
| `alert-dialog`     | AlertDialog                              | kit                                           | ported (wave 1)                                                                                                                                           |
| `aspect-ratio`     | — (pure view / composition)              | view                                          | ported (wave 1)                                                                                                                                           |
| `attachment`       | — (pure view / composition)              | view                                          | ported (wave 2)                                                                                                                                           |
| `avatar`           | Avatar                                   | kit                                           | ported (wave 1)                                                                                                                                           |
| `badge`            | — (pure view)                            | view                                          | ported                                                                                                                                                    |
| `breadcrumb`       | — (pure view / composition)              | view                                          | ported (wave 2)                                                                                                                                           |
| `bubble`           | — (pure view / composition)              | view                                          | ported (wave 2)                                                                                                                                           |
| `button`           | Button (view fn)                         | kit                                           | ported                                                                                                                                                    |
| `button-group`     | — (pure view / composition)              | view                                          | ported (wave 1)                                                                                                                                           |
| `calendar`         | Calendar / RangeCalendar                 | kit                                           | ported (wave 2)                                                                                                                                           |
| `card`             | — (pure view / composition)              | view                                          | ported (wave 2)                                                                                                                                           |
| `carousel`         | — (pure view / composition)              | view                                          | planned                                                                                                                                                   |
| `chart`            | — (pure view / composition)              | view                                          | planned                                                                                                                                                   |
| `checkbox`         | Checkbox                                 | kit                                           | ported (wave 1)                                                                                                                                           |
| `collapsible`      | Collapsible                              | kit                                           | ported (wave 1)                                                                                                                                           |
| `combobox`         | Combobox                                 | kit                                           | ported (wave 1)                                                                                                                                           |
| `command`          | Combobox / Autocomplete + ListNavigation | kit composition                               | ported (wave 1)                                                                                                                                           |
| `context-menu`     | ContextMenu                              | kit                                           | ported (wave 1)                                                                                                                                           |
| `dialog`           | Dialog                                   | kit                                           | ported (wave 1)                                                                                                                                           |
| `direction`        | DirectionProvider                        | kit                                           | ported (wave 2)                                                                                                                                           |
| `drawer`           | Drawer                                   | kit                                           | ported (wave 1)                                                                                                                                           |
| `dropdown-menu`    | Menu                                     | kit (Menu)                                    | ported (wave 1)                                                                                                                                           |
| `empty`            | — (pure view / composition)              | view                                          | ported (wave 2)                                                                                                                                           |
| `field`            | Field / Fieldset                         | kit                                           | ported (wave 2)                                                                                                                                           |
| `form`             | Form + effect Schema                     | kit + Schema (replaces react-hook-form + zod) | ported (wave 2)                                                                                                                                           |
| `hover-card`       | PreviewCard                              | kit (PreviewCard)                             | ported (wave 1)                                                                                                                                           |
| `input`            | Input                                    | kit                                           | ported (wave 1)                                                                                                                                           |
| `input-group`      | — (pure view / composition)              | view                                          | ported (wave 2)                                                                                                                                           |
| `input-otp`        | OTPField                                 | kit                                           | ported (wave 2)                                                                                                                                           |
| `item`             | — (pure view / composition)              | view                                          | ported (wave 2)                                                                                                                                           |
| `kbd`              | — (pure view / composition)              | view                                          | ported (wave 1)                                                                                                                                           |
| `label`            | — (pure view / composition)              | view                                          | ported (wave 1)                                                                                                                                           |
| `marker`           | — (pure view / composition)              | view                                          | ported (wave 2)                                                                                                                                           |
| `menubar`          | Menubar                                  | kit                                           | ported (wave 1)                                                                                                                                           |
| `message`          | — (pure view / composition)              | view                                          | ported (wave 2)                                                                                                                                           |
| `message-scroller` | — (pure view / composition)              | view                                          | ported (wave 2, anatomy — upstream scroll engine/hooks not reproduced)                                                                                    |
| `native-select`    | — (pure view / composition)              | view                                          | ported (wave 1)                                                                                                                                           |
| `navigation-menu`  | NavigationMenu                           | kit                                           | ported (wave 2, anatomy — kit has no panels; content/viewport ship as class constants; panels tracked upstream as Effect-TS/ui#447, filed from this repo) |
| `pagination`       | — (pure view / composition)              | view                                          | ported (wave 2)                                                                                                                                           |
| `popover`          | Popover                                  | kit                                           | ported (wave 1)                                                                                                                                           |
| `progress`         | Progress                                 | kit                                           | ported (wave 2)                                                                                                                                           |
| `radio-group`      | RadioGroup                               | kit                                           | ported (wave 1)                                                                                                                                           |
| `resizable`        | — (pure view / composition)              | view                                          | planned                                                                                                                                                   |
| `scroll-area`      | ScrollArea                               | kit                                           | ported (wave 2)                                                                                                                                           |
| `select`           | Select                                   | kit                                           | ported (wave 1)                                                                                                                                           |
| `separator`        | Separator                                | kit                                           | ported                                                                                                                                                    |
| `sheet`            | — (pure view / composition)              | view                                          | ported (wave 1)                                                                                                                                           |
| `sidebar`          | — (pure view / composition)              | view                                          | ported (wave 2, Provider Component block)                                                                                                                 |
| `skeleton`         | — (pure view / composition)              | view                                          | ported (wave 1)                                                                                                                                           |
| `slider`           | Slider                                   | kit                                           | ported (wave 2)                                                                                                                                           |
| `sonner`           | Toast                                    | kit (Toast)                                   | ported (wave 2)                                                                                                                                           |
| `spinner`          | — (pure view / composition)              | view                                          | ported (wave 1)                                                                                                                                           |
| `switch`           | Switch                                   | kit                                           | ported (wave 1)                                                                                                                                           |
| `table`            | — (pure view / composition)              | view                                          | ported (wave 2)                                                                                                                                           |
| `tabs`             | Tabs                                     | kit                                           | ported (wave 1)                                                                                                                                           |
| `textarea`         | — (pure view / composition)              | view                                          | ported (wave 1)                                                                                                                                           |
| `toggle`           | Toggle                                   | kit                                           | ported (wave 1)                                                                                                                                           |
| `toggle-group`     | ToggleGroup                              | kit                                           | ported (wave 1)                                                                                                                                           |
| `tooltip`          | Tooltip                                  | kit                                           | ported (wave 1)                                                                                                                                           |

## Declared divergences (no silent ones)

- **chart** — upstream wraps Recharts (React). Effect-native charting is out of
  scope for the registry until a non-React chart layer is chosen; NOT ported, listed here, not hidden.
- **carousel** — upstream wraps embla-carousel-react. Kit has no carousel; candidate: a
  Component with Subscription-driven scroll state. Planned, not faked.
- **resizable** — upstream wraps react-resizable-panels. Same treatment as carousel.
- **sidebar** — upstream is a React context + hooks composition. In Effect UI it is a
  Provider Component (shares/receives) + view composition; port as a block, not a ui item.
- **form** — react-hook-form + zod are replaced by kit Form/Field + `effect` Schema.
  API is _not_ 1:1 (it cannot be, honestly); class strings and field anatomy are.
- **icons** — lucide-react is banned. Icons are inline SVG builders (`h.svg` with
  lucide path data, ISC-licensed) in `registry/lib/icons.ts` (planned with the first
  icon-bearing component, checkbox).

## Bases generation (wave 6)

Every row above also exists in the bases generation as a `base-<name>`
item (`registry/bases/ui/<name>.ts`), ported from
`apps/v4/registry/bases/radix/ui/<name>.tsx` with the same kit mapping —
only the class layer differs (structural classes + `cn-*` hooks, styled
by the `style-*` presets; see docs/PRESETS.md). Differences from the
table above: **form** has no bases counterpart (upstream dropped it;
`base-field` is the form surface); **code-block**, **questionnaire**
(native step-navigation Component; upstream wraps
`@shadcn/react/questionnaire`) and **trace** exist only in the bases
generation; **date-picker** is again a composition, on the bases
calendar/button/popover. chart/carousel/resizable were D-4 until wave 7 — see the wave-7 note
below; all three now ship in both generations on native engines.

## Wave 7 — engines and blocks

- **chart / carousel / resizable** are ported in both generations on
  Effect-native engines (see PORTING-RULES D-4, lifted). The three rows
  above predate the engines; their per-file headers carry the current
  shape and the declared simplifications vs Recharts / embla /
  react-resizable-panels.
- **Blocks**: every upstream block is ported file-for-file under
  `registry/blocks/<generation>/<block>/` and registered as a
  `registry:block` item (`<block>` for new-york, `base-<block>` for
  bases): dashboard-01, login-01..05, signup-01..05, sidebar-01..16 in
  both generations, plus preview / preview-02 / preview-03 (bases only).
  Blocks are example compositions: sample data and copy are upstream's,
  submit/auth handlers are declared no-op messages (as upstream wires
  none), and dashboard-01's data table is a native implementation on the
  table port (upstream's @tanstack/react-table is not ported).
