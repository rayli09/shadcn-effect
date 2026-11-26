# 1:1 Mapping — shadcn/ui (new-york-v4, 61 files) → Effect UI

Rule: same name, same DOM slot attributes (`data-slot`, `data-variant`, `data-size`),
same Tailwind class strings (parity-checked), same variant names. What changes is
*only* the engine: React/Radix/cva/hooks out, @effect/ui + @effect/ui-kit in.

`@effect/ui-kit` ships 49 component modules (Accordion…VirtualList, incl. Calendar,
DatePicker, DateField, FileDrop which shadcn does not have) — every interactive
shadcn primitive has a kit counterpart except the ones marked view/composition,
which are pure markup in both worlds.

| shadcn | Effect UI primitive | kind | status |
|---|---|---|---|
| `accordion` | Accordion | kit | kit-ready |
| `alert` | — (pure view / composition) | view | planned |
| `alert-dialog` | AlertDialog | kit | kit-ready |
| `aspect-ratio` | — (pure view / composition) | view | planned |
| `attachment` | — (pure view / composition) | view | planned |
| `avatar` | Avatar | kit | kit-ready |
| `badge` | — (pure view) | view | ported |
| `breadcrumb` | — (pure view / composition) | view | planned |
| `bubble` | — (pure view / composition) | view | planned |
| `button` | Button (view fn) | kit | ported |
| `button-group` | — (pure view / composition) | view | planned |
| `calendar` | Calendar / RangeCalendar | kit | kit-ready |
| `card` | — (pure view / composition) | view | planned |
| `carousel` | — (pure view / composition) | view | planned |
| `chart` | — (pure view / composition) | view | planned |
| `checkbox` | Checkbox | kit | kit-ready |
| `collapsible` | Collapsible | kit | kit-ready |
| `combobox` | Combobox | kit | kit-ready |
| `command` | Combobox / Autocomplete + ListNavigation | kit composition | kit-ready |
| `context-menu` | ContextMenu | kit | kit-ready |
| `dialog` | Dialog | kit | kit-ready |
| `direction` | DirectionProvider | kit | kit-ready |
| `drawer` | Drawer | kit | kit-ready |
| `dropdown-menu` | Menu | kit (Menu) | kit-ready |
| `empty` | — (pure view / composition) | view | planned |
| `field` | Field / Fieldset | kit | kit-ready |
| `form` | Form + effect Schema | kit + Schema (replaces react-hook-form + zod) | kit-ready |
| `hover-card` | PreviewCard | kit (PreviewCard) | kit-ready |
| `input` | Input | kit | kit-ready |
| `input-group` | — (pure view / composition) | view | planned |
| `input-otp` | OTPField | kit | kit-ready |
| `item` | — (pure view / composition) | view | planned |
| `kbd` | — (pure view / composition) | view | planned |
| `label` | — (pure view / composition) | view | planned |
| `marker` | — (pure view / composition) | view | planned |
| `menubar` | Menubar | kit | kit-ready |
| `message` | — (pure view / composition) | view | planned |
| `message-scroller` | — (pure view / composition) | view | planned |
| `native-select` | — (pure view / composition) | view | planned |
| `navigation-menu` | NavigationMenu | kit | kit-ready |
| `pagination` | — (pure view / composition) | view | planned |
| `popover` | Popover | kit | kit-ready |
| `progress` | Progress | kit | kit-ready |
| `radio-group` | RadioGroup | kit | kit-ready |
| `resizable` | — (pure view / composition) | view | planned |
| `scroll-area` | ScrollArea | kit | kit-ready |
| `select` | Select | kit | kit-ready |
| `separator` | Separator | kit | ported |
| `sheet` | — (pure view / composition) | view | planned |
| `sidebar` | — (pure view / composition) | view | planned |
| `skeleton` | — (pure view / composition) | view | planned |
| `slider` | Slider | kit | kit-ready |
| `sonner` | Toast | kit (Toast) | kit-ready |
| `spinner` | — (pure view / composition) | view | planned |
| `switch` | Switch | kit | kit-ready |
| `table` | — (pure view / composition) | view | planned |
| `tabs` | Tabs | kit | kit-ready |
| `textarea` | — (pure view / composition) | view | planned |
| `toggle` | Toggle | kit | kit-ready |
| `toggle-group` | ToggleGroup | kit | kit-ready |
| `tooltip` | Tooltip | kit | kit-ready |

## Declared divergences (no silent ones)
- **chart** — upstream wraps Recharts (React). Effect-native charting is out of
  scope for the registry until a non-React chart layer is chosen; NOT ported, listed here, not hidden.
- **carousel** — upstream wraps embla-carousel-react. Kit has no carousel; candidate: a
  Component with Subscription-driven scroll state. Planned, not faked.
- **resizable** — upstream wraps react-resizable-panels. Same treatment as carousel.
- **sidebar** — upstream is a React context + hooks composition. In Effect UI it is a
  Provider Component (shares/receives) + view composition; port as a block, not a ui item.
- **form** — react-hook-form + zod are replaced by kit Form/Field + `effect` Schema.
  API is *not* 1:1 (it cannot be, honestly); class strings and field anatomy are.
- **icons** — lucide-react is banned. Icons are inline SVG builders (`h.svg` with
  lucide path data, ISC-licensed) in `registry/lib/icons.ts` (planned with the first
  icon-bearing component, checkbox).
