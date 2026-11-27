/**
 * DataTable — shadcn/ui block `dashboard-01`
 * (`registry/new-york-v4/blocks/dashboard-01/components/data-table.tsx`),
 * ported 1:1 to Effect UI. Class strings, column definitions and the
 * sample content are verbatim from the source; the data arrives as the
 * `data` prop (upstream's zod `schema` rows — see `../data.ts`).
 *
 * THE SUBSTITUTION, declared up front: upstream builds the table on
 * `@tanstack/react-table` (v9 feature-registered row models) plus
 * `@dnd-kit` drag-and-drop, `sonner` toasts and a zod schema. None of
 * those exist here — react-table and zod are React-ecosystem libraries
 * (banned in spirit by PORTING-RULES: no React libs, no zod), dnd-kit
 * likewise. The behavior is implemented natively on this repo's `table`
 * port instead:
 *
 * - All table state lives in the component's Model: the working rows
 *   (upstream's `useState(data)`), `sorting`, `selected` row ids,
 *   `hiddenColumns`, `pageIndex` / `pageSize`, plus the open states of
 *   every menu / select / drawer the table hosts. The row pipeline is
 *   upstream's: sort (the sorted row model) → paginate (the paginated
 *   row model) → render the page's rows. Column filters state exists
 *   upstream but nothing in the source sets it, so it is not carried.
 * - Columns are upstream's column defs, in order: drag handle, select
 *   checkbox (header toggles the page, indeterminate on a partial
 *   page), header (the `TableCellViewer` drawer trigger), type, status,
 *   target, limit, reviewer, actions. Upstream's headers render no sort
 *   toggle, so none is added — sorting state is carried and applied,
 *   exactly as upstream's state is, but no UI in the source drives it.
 * - Drag reorder: dnd-kit's sensors / collision / transform pipeline
 *   becomes native HTML5 drag events on the row — `dragstart` records
 *   the row in the Model, `dragover` (default prevented) reorders live
 *   (dnd-kit's `arrayMove` semantics), `dragend` clears. The row keeps
 *   upstream's classes and `data-dragging` state attribute. Differences:
 *   the whole row is the drag source (upstream initiates from the
 *   handle via sensors), there is no drag transform/transition styling
 *   and no keyboard-sensor reordering.
 * - The target/limit cell editors are controlled inputs in the Model
 *   (D-7: the kit Input has no `defaultValue`). Submitting a cell form
 *   is captured like upstream's `onSubmit` (preventDefault), but the
 *   `toast.promise(...)` feedback is NOT reproduced — this repo's
 *   sonner port has no promise API (its own declared gap).
 * - The row schema is a Schema (`DashboardRow` in `../data.ts`), not
 *   zod; `TableCellViewer`'s per-row drawer, its mini area chart and
 *   its edit form are below, as upstream defines them in this file.
 *
 * Further declared divergences (anything else is a bug):
 *
 * - The two charts are OUR chart port (`@/components/ui/chart.ts`), not
 *   Recharts: series `mobile` then `desktop`, `stackId: "a"`,
 *   `type: "area"`. The drawer's chart passes `showXAxis: false` /
 *   `showYAxis: false` for upstream's hidden XAxis and absent YAxis;
 *   upstream's per-series `fillOpacity` (0.6 / 0.4) becomes the engine's
 *   flat 0.25 fill (the chart port's declared simplification), the
 *   `type: "natural"` curve becomes the engine's path, and the XAxis
 *   `tickFormatter` ("Jan" slices) has no engine counterpart — month
 *   labels render verbatim.
 * - The select-all / select-row checkboxes lose their `aria-label`s
 *   ("Select all" / "Select row") — the Checkbox port has no aria-label
 *   option. Everything else about them (checked, indeterminate) is the
 *   port's.
 * - The view `Select` above the tabs is, as upstream, NOT wired to the
 *   `Tabs`: upstream's `<Select defaultValue="outline">` holds its own
 *   value and never switches a `TabsContent`. Both states live in the
 *   Model here, still independent.
 * - Icons are Tabler (`@tabler/icons-react`); the builders below carry
 *   the Tabler path data (MIT) via this repo's `icon()` helper, with a
 *   local filled variant for `IconCircleCheckFilled`.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as View from "@effect/ui/View";
import * as Schema from "effect/Schema";
import { icon, type IconOptions } from "@/lib/icons";
import { Badge } from "@/components/ui/badge.ts";
import { Button } from "@/components/ui/button.ts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart.ts";
import { Checkbox } from "@/components/ui/checkbox.ts";
import { Drawer, DrawerFooter, DrawerHeader } from "@/components/ui/drawer.ts";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.ts";
import { Input } from "@/components/ui/input.ts";
import { Label } from "@/components/ui/label.ts";
import { Select } from "@/components/ui/select.ts";
import { Separator } from "@/components/ui/separator.ts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.ts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.ts";
import { SidebarProvider } from "@/components/ui/sidebar.ts";
import { type DashboardRow } from "../data.ts";

type IconNode = readonly [tag: string, attrs: Readonly<Record<string, string>>];

/** A Tabler *filled* glyph: Tabler's filled base attrs around `nodes`. */
const filledIcon = <Msg>(h: Html.H<Msg>, nodes: ReadonlyArray<IconNode>, options: IconOptions = {}) =>
  h
    .el("svg")
    .attrs({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      stroke: "none",
      "aria-hidden": "true",
      ...(options.class !== undefined ? { class: options.class } : {}),
    })
    .children(nodes.map(([tag, attrs], index) => h.el(tag).key(String(index)).attrs(attrs)));

/** Tabler `grip-vertical` (MIT). */
export const GripVerticalIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }],
      ["path", { d: "M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }],
      ["path", { d: "M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }],
      ["path", { d: "M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }],
      ["path", { d: "M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }],
      ["path", { d: "M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }],
    ],
    options,
  );

/** Tabler `circle-check-filled` (MIT, filled). */
export const CircleCheckFilledIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  filledIcon(
    h,
    [
      [
        "path",
        {
          d: "M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z",
        },
      ],
    ],
    options,
  );

/** Tabler `loader` (MIT). */
export const LoaderIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 6l0 -3" }],
      ["path", { d: "M16.25 7.75l2.15 -2.15" }],
      ["path", { d: "M18 12l3 0" }],
      ["path", { d: "M16.25 16.25l2.15 2.15" }],
      ["path", { d: "M12 18l0 3" }],
      ["path", { d: "M7.75 16.25l-2.15 2.15" }],
      ["path", { d: "M6 12l-3 0" }],
      ["path", { d: "M7.75 7.75l-2.15 -2.15" }],
    ],
    options,
  );

/** Tabler `dots-vertical` (MIT). */
export const DotsVerticalIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }],
      ["path", { d: "M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }],
      ["path", { d: "M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }],
    ],
    options,
  );

/** Tabler `chevron-down` (MIT). */
export const ChevronDownIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(h, [["path", { d: "M6 9l6 6l6 -6" }]], options);

/** Tabler `chevron-left` (MIT). */
export const ChevronLeftIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(h, [["path", { d: "M15 6l-6 6l6 6" }]], options);

/** Tabler `chevron-right` (MIT). */
export const ChevronRightIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(h, [["path", { d: "M9 6l6 6l-6 6" }]], options);

/** Tabler `chevrons-left` (MIT). */
export const ChevronsLeftIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M11 7l-5 5l5 5" }],
      ["path", { d: "M17 7l-5 5l5 5" }],
    ],
    options,
  );

/** Tabler `chevrons-right` (MIT). */
export const ChevronsRightIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M7 7l5 5l-5 5" }],
      ["path", { d: "M13 7l5 5l-5 5" }],
    ],
    options,
  );

/** Tabler `layout-columns` (MIT). */
export const LayoutColumnsIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      [
        "path",
        {
          d: "M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z",
        },
      ],
      ["path", { d: "M12 4l0 16" }],
    ],
    options,
  );

/** Tabler `plus` (MIT). */
export const PlusIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M12 5l0 14" }],
      ["path", { d: "M5 12l14 0" }],
    ],
    options,
  );

/** Tabler `trending-up` (MIT). */
export const TrendingUpIcon = <Msg>(h: Html.H<Msg>, options: IconOptions = {}) =>
  icon(
    h,
    [
      ["path", { d: "M3 17l6 -6l4 4l8 -8" }],
      ["path", { d: "M14 7l7 0l0 7" }],
    ],
    options,
  );

// ---------------------------------------------------------------------------
// TableCellViewer — upstream's per-row drawer, defined in the same file.
// ---------------------------------------------------------------------------

const drawerChartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const drawerChartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const typeOptions = [
  "Table of Contents",
  "Executive Summary",
  "Technical Approach",
  "Design",
  "Capabilities",
  "Focus Documents",
  "Narrative",
  "Cover Page",
];

const statusOptions = ["Done", "In Progress", "Not Started"];

const reviewerOptions = ["Eddie Lake", "Jamik Tashpulatov", "Emily Whalen"];

export const TableCellViewerProps = Schema.Struct({
  item: Schema.Struct({
    id: Schema.Number,
    header: Schema.String,
    type: Schema.String,
    status: Schema.String,
    target: Schema.String,
    limit: Schema.String,
    reviewer: Schema.String,
  }),
});

export const TableCellViewerMessage = UiSchema.TaggedEnum({
  DrawerOpened: {},
  DrawerClosed: {},
  SelectOpened: { name: Schema.String },
  SelectClosed: {},
  HeaderChanged: { value: Schema.String },
  TypeChanged: { value: Schema.String },
  StatusChanged: { value: Schema.String },
  TargetChanged: { value: Schema.String },
  LimitChanged: { value: Schema.String },
  ReviewerChanged: { value: Schema.String },
});

export const TableCellViewer = Html.component({
  name: "Dashboard01TableCellViewer",
  props: TableCellViewerProps,
  model: Schema.Struct({
    open: Schema.Boolean,
    openSelect: Schema.NullOr(Schema.String),
    header: Schema.String,
    type: Schema.String,
    status: Schema.String,
    target: Schema.String,
    limit: Schema.String,
    reviewer: Schema.String,
  }),
  message: TableCellViewerMessage,
  reads: { sidebar: SidebarProvider },
}).make({
  init: ({ props }) => ({
    open: false,
    openSelect: null,
    header: props.item.header,
    type: props.item.type,
    status: props.item.status,
    target: props.item.target,
    limit: props.item.limit,
    reviewer: props.item.reviewer,
  }),
  update: {
    DrawerOpened: ($) => $.evolve({ open: true }),
    DrawerClosed: ($) => $.evolve({ open: false }),
    SelectOpened: ($, { name }) => $.evolve({ openSelect: name }),
    SelectClosed: ($) => $.evolve({ openSelect: null }),
    HeaderChanged: ($, { value }) => $.evolve({ header: value }),
    TypeChanged: ($, { value }) => $.evolve({ type: value, openSelect: null }),
    StatusChanged: ($, { value }) => $.evolve({ status: value, openSelect: null }),
    TargetChanged: ($, { value }) => $.evolve({ target: value }),
    LimitChanged: ($, { value }) => $.evolve({ limit: value }),
    ReviewerChanged: ($, { value }) => $.evolve({ reviewer: value, openSelect: null }),
  },
  view: (h, model) => {
    const item = h.props.item;
    const isMobile = h.reads.sidebar.isMobile;
    const fieldSelect = (
      name: "type" | "status" | "reviewer",
      value: string,
      options: ReadonlyArray<string>,
      placeholder: string,
      onPicked: (value: string) => typeof TableCellViewerMessage.Type,
    ) =>
      Select(h, {
        props: {
          open: model.openSelect === name,
          value,
          items: options.map((option) => ({ value: option, label: option })),
          placeholder,
          id: name,
        },
        triggerClass: "w-full",
        onEmit: {
          RequestedOpen: () => TableCellViewerMessage.SelectOpened({ name }),
          RequestedClose: () => TableCellViewerMessage.SelectClosed(),
          Picked: ({ value: picked }) =>
            typeof picked === "string" ? onPicked(picked) : undefined,
          Settled: () => undefined,
        },
      });
    return Drawer(h, {
      props: { open: model.open, swipeDirection: isMobile ? "down" : "right" },
      onEmit: {
        RequestedOpen: () => TableCellViewerMessage.DrawerOpened(),
        RequestedClose: () => TableCellViewerMessage.DrawerClosed(),
        Settled: () => undefined,
        Snapped: () => undefined,
      },
      view: (drawer) =>
        h.div.children(
          drawer.trigger(
            Button(h, {
              variant: "link",
              class: "w-fit px-0 text-left text-foreground",
            }),
          ).children(item.header),
          drawer.portal(h.dialog)?.children(
            drawer.backdrop(h.div),
            drawer.viewport(h.div).children(
              drawer.popup(h.div).children(
                drawer.handle(h),
                DrawerHeader(h, { class: "gap-1" }).children(
                  drawer.title(h.h2).children(item.header),
                  drawer
                    .description(h.p)
                    .children("Showing total visitors for the last 6 months"),
                ),
                h.div
                  .class("flex flex-col gap-4 overflow-y-auto px-4 text-sm")
                  .children(
                    isMobile
                      ? undefined
                      : [
                          ChartContainer(h, {
                            props: {
                              config: drawerChartConfig,
                              data: drawerChartData,
                              series: [
                                { dataKey: "mobile", kind: "area", stackId: "a" },
                                { dataKey: "desktop", kind: "area", stackId: "a" },
                              ],
                              type: "area",
                              categoryKey: "month",
                              showXAxis: false,
                              showYAxis: false,
                              tooltipIndicator: "dot",
                            },
                          }),
                          Separator(h),
                          h.div.class("grid gap-2").children(
                            h.div
                              .class("flex gap-2 leading-none font-medium")
                              .children(
                                "Trending up by 5.2% this month ",
                                TrendingUpIcon(h, { class: "size-4" }),
                              ),
                            h.div
                              .class("text-muted-foreground")
                              .children(
                                "Showing total visitors for the last 6 months. This is just some random text to test the layout. It spans multiple lines and should wrap around.",
                              ),
                          ),
                          Separator(h),
                        ],
                    h.form.class("flex flex-col gap-4").children(
                      h.div.class("flex flex-col gap-3").children(
                        Label(h, { htmlFor: "header" }).children("Header"),
                        Input(h, {
                          props: { value: model.header },
                          onUpdate: ({ value }) =>
                            TableCellViewerMessage.HeaderChanged({ value }),
                        }).attr("id", "header"),
                      ),
                      h.div.class("grid grid-cols-2 gap-4").children(
                        h.div.class("flex flex-col gap-3").children(
                          Label(h, { htmlFor: "type" }).children("Type"),
                          fieldSelect("type", model.type, typeOptions, "Select a type", (value) =>
                            TableCellViewerMessage.TypeChanged({ value }),
                          ),
                        ),
                        h.div.class("flex flex-col gap-3").children(
                          Label(h, { htmlFor: "status" }).children("Status"),
                          fieldSelect(
                            "status",
                            model.status,
                            statusOptions,
                            "Select a status",
                            (value) => TableCellViewerMessage.StatusChanged({ value }),
                          ),
                        ),
                      ),
                      h.div.class("grid grid-cols-2 gap-4").children(
                        h.div.class("flex flex-col gap-3").children(
                          Label(h, { htmlFor: "target" }).children("Target"),
                          Input(h, {
                            props: { value: model.target },
                            onUpdate: ({ value }) =>
                              TableCellViewerMessage.TargetChanged({ value }),
                          }).attr("id", "target"),
                        ),
                        h.div.class("flex flex-col gap-3").children(
                          Label(h, { htmlFor: "limit" }).children("Limit"),
                          Input(h, {
                            props: { value: model.limit },
                            onUpdate: ({ value }) =>
                              TableCellViewerMessage.LimitChanged({ value }),
                          }).attr("id", "limit"),
                        ),
                      ),
                      h.div.class("flex flex-col gap-3").children(
                        Label(h, { htmlFor: "reviewer" }).children("Reviewer"),
                        fieldSelect(
                          "reviewer",
                          model.reviewer,
                          reviewerOptions,
                          "Select a reviewer",
                          (value) => TableCellViewerMessage.ReviewerChanged({ value }),
                        ),
                      ),
                    ),
                  ),
                DrawerFooter(h).children(
                  Button(h).children("Submit"),
                  drawer.close(Button(h, { variant: "outline" })).children("Done"),
                ),
              ),
            ),
          ),
        ),
    });
  },
});

// ---------------------------------------------------------------------------
// DataTable — upstream's main export.
// ---------------------------------------------------------------------------

const viewOptions = [
  { value: "outline", label: "Outline" },
  { value: "past-performance", label: "Past Performance" },
  { value: "key-personnel", label: "Key Personnel" },
  { value: "focus-documents", label: "Focus Documents" },
];

const pageSizeOptions = ["10", "20", "30", "40", "50"];

const reviewerAssignOptions = ["Eddie Lake", "Jamik Tashpulatov"];

/** The columns the Customize Columns menu can hide (upstream: `getCanHide()`). */
const hideableColumns = ["type", "status", "target", "limit", "reviewer"];

type SortEntry = { readonly id: string; readonly desc: boolean };

type TableModelShape = {
  readonly rows: ReadonlyArray<DashboardRow>;
  readonly sorting: ReadonlyArray<SortEntry>;
  readonly pageIndex: number;
  readonly pageSize: number;
};

/** Upstream's sorted row model: apply the (single) sort entry, if any. */
const applySorting = (
  rows: ReadonlyArray<DashboardRow>,
  sorting: ReadonlyArray<SortEntry>,
): ReadonlyArray<DashboardRow> => {
  const sort = sorting[0];
  if (sort === undefined) {
    return rows;
  }
  const key = sort.id as keyof DashboardRow;
  const compare = (a: DashboardRow, b: DashboardRow): number => {
    const aValue = a[key];
    const bValue = b[key];
    if (typeof aValue === "number" && typeof bValue === "number") {
      return aValue - bValue;
    }
    const aNumber = Number(aValue);
    const bNumber = Number(bValue);
    if (String(aValue).trim() !== "" && String(bValue).trim() !== "" && !Number.isNaN(aNumber) && !Number.isNaN(bNumber)) {
      return aNumber - bNumber;
    }
    return String(aValue).localeCompare(String(bValue));
  };
  return [...rows].sort((a, b) => (sort.desc ? -compare(a, b) : compare(a, b)));
};

/** The paginated row model: sort, then slice out the current page. */
const pageRowsOf = (model: TableModelShape): ReadonlyArray<DashboardRow> => {
  const sorted = applySorting(model.rows, model.sorting);
  const pageCount = Math.max(1, Math.ceil(sorted.length / model.pageSize));
  const pageIndex = Math.min(model.pageIndex, pageCount - 1);
  return sorted.slice(pageIndex * model.pageSize, pageIndex * model.pageSize + model.pageSize);
};

/** dnd-kit's `arrayMove`: take the row at `from`, insert it at `to`. */
const arrayMove = (
  rows: ReadonlyArray<DashboardRow>,
  from: number,
  to: number,
): ReadonlyArray<DashboardRow> => {
  const next = [...rows];
  const [moved] = next.splice(from, 1);
  if (moved === undefined) {
    return rows;
  }
  next.splice(to, 0, moved);
  return next;
};

const cellEditorClass =
  "h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30";

export const DataTableProps = Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      id: Schema.Number,
      header: Schema.String,
      type: Schema.String,
      status: Schema.String,
      target: Schema.String,
      limit: Schema.String,
      reviewer: Schema.String,
    }),
  ),
});

export const DataTableMessage = UiSchema.TaggedEnum({
  TabSelected: { value: Schema.String },
  ViewSelectOpened: {},
  ViewSelectClosed: {},
  ViewPicked: { value: Schema.String },
  ColumnsMenuOpened: {},
  ColumnsMenuClosed: {},
  ColumnVisibilityToggled: { id: Schema.String, visible: Schema.Boolean },
  SelectAllToggled: { checked: Schema.Boolean },
  RowSelectionToggled: { id: Schema.Number, checked: Schema.Boolean },
  PageSizeOpened: {},
  PageSizeClosed: {},
  PageSizeChanged: { size: Schema.Number },
  FirstPagePressed: {},
  PreviousPagePressed: {},
  NextPagePressed: {},
  LastPagePressed: {},
  DragStarted: { id: Schema.Number },
  DraggedOver: { id: Schema.Number },
  DragEnded: {},
  TargetEdited: { id: Schema.Number, value: Schema.String },
  LimitEdited: { id: Schema.Number, value: Schema.String },
  TargetSubmitted: { id: Schema.Number },
  LimitSubmitted: { id: Schema.Number },
  ReviewerOpened: { id: Schema.Number },
  ReviewerClosed: {},
  ReviewerPicked: { id: Schema.Number, value: Schema.String },
  RowActionsOpened: { id: Schema.Number },
  RowActionsClosed: {},
});

export const DataTable = Html.component({
  name: "Dashboard01DataTable",
  props: DataTableProps,
  model: Schema.Struct({
    rows: Schema.Array(
      Schema.Struct({
        id: Schema.Number,
        header: Schema.String,
        type: Schema.String,
        status: Schema.String,
        target: Schema.String,
        limit: Schema.String,
        reviewer: Schema.String,
      }),
    ),
    tab: Schema.String,
    viewValue: Schema.String,
    viewSelectOpen: Schema.Boolean,
    columnsOpen: Schema.Boolean,
    hiddenColumns: Schema.Array(Schema.String),
    sorting: Schema.Array(Schema.Struct({ id: Schema.String, desc: Schema.Boolean })),
    selected: Schema.Array(Schema.Number),
    pageIndex: Schema.Number,
    pageSize: Schema.Number,
    pageSizeOpen: Schema.Boolean,
    draggingId: Schema.NullOr(Schema.Number),
    reviewerOpenId: Schema.NullOr(Schema.Number),
    actionsOpenId: Schema.NullOr(Schema.Number),
  }),
  message: DataTableMessage,
}).make({
  init: ({ props }) => ({
    rows: props.data,
    tab: "outline",
    viewValue: "outline",
    viewSelectOpen: false,
    columnsOpen: false,
    hiddenColumns: [],
    sorting: [],
    selected: [],
    pageIndex: 0,
    pageSize: 10,
    pageSizeOpen: false,
    draggingId: null,
    reviewerOpenId: null,
    actionsOpenId: null,
  }),
  update: {
    TabSelected: ($, { value }) => $.evolve({ tab: value }),
    ViewSelectOpened: ($) => $.evolve({ viewSelectOpen: true }),
    ViewSelectClosed: ($) => $.evolve({ viewSelectOpen: false }),
    ViewPicked: ($, { value }) => $.evolve({ viewValue: value, viewSelectOpen: false }),
    ColumnsMenuOpened: ($) => $.evolve({ columnsOpen: true }),
    ColumnsMenuClosed: ($) => $.evolve({ columnsOpen: false }),
    ColumnVisibilityToggled: ($, { id, visible }) =>
      $.evolve({
        hiddenColumns: visible
          ? $.model.hiddenColumns.filter((column) => column !== id)
          : [...$.model.hiddenColumns, id],
      }),
    SelectAllToggled: ($, { checked }) => {
      const pageIds = pageRowsOf($.model).map((row) => row.id);
      return $.evolve({
        selected: checked
          ? [...new Set([...$.model.selected, ...pageIds])]
          : $.model.selected.filter((id) => !pageIds.includes(id)),
      });
    },
    RowSelectionToggled: ($, { id, checked }) =>
      $.evolve({
        selected: checked
          ? $.model.selected.includes(id)
            ? $.model.selected
            : [...$.model.selected, id]
          : $.model.selected.filter((selectedId) => selectedId !== id),
      }),
    PageSizeOpened: ($) => $.evolve({ pageSizeOpen: true }),
    PageSizeClosed: ($) => $.evolve({ pageSizeOpen: false }),
    PageSizeChanged: ($, { size }) => $.evolve({ pageSize: size, pageSizeOpen: false }),
    FirstPagePressed: ($) => $.evolve({ pageIndex: 0 }),
    PreviousPagePressed: ($) => $.evolve({ pageIndex: Math.max(0, $.model.pageIndex - 1) }),
    NextPagePressed: ($) => $.evolve({ pageIndex: $.model.pageIndex + 1 }),
    LastPagePressed: ($) =>
      $.evolve({
        pageIndex: Math.max(0, Math.ceil($.model.rows.length / $.model.pageSize) - 1),
      }),
    DragStarted: ($, { id }) => $.evolve({ draggingId: id }),
    DraggedOver: ($, { id }) => {
      const draggingId = $.model.draggingId;
      if (draggingId === null || draggingId === id) {
        return $.evolve({});
      }
      const from = $.model.rows.findIndex((row) => row.id === draggingId);
      const to = $.model.rows.findIndex((row) => row.id === id);
      if (from < 0 || to < 0) {
        return $.evolve({});
      }
      return $.evolve({ rows: arrayMove($.model.rows, from, to) });
    },
    DragEnded: ($) => $.evolve({ draggingId: null }),
    TargetEdited: ($, { id, value }) =>
      $.evolve({
        rows: $.model.rows.map((row) => (row.id === id ? { ...row, target: value } : row)),
      }),
    LimitEdited: ($, { id, value }) =>
      $.evolve({
        rows: $.model.rows.map((row) => (row.id === id ? { ...row, limit: value } : row)),
      }),
    // Upstream fires a `toast.promise(...)` here; the sonner port has no
    // promise API, so the submit is captured and the edit simply stands
    // (declared in the header).
    TargetSubmitted: ($) => $.evolve({}),
    LimitSubmitted: ($) => $.evolve({}),
    ReviewerOpened: ($, { id }) => $.evolve({ reviewerOpenId: id }),
    ReviewerClosed: ($) => $.evolve({ reviewerOpenId: null }),
    ReviewerPicked: ($, { id, value }) =>
      $.evolve({
        reviewerOpenId: null,
        rows: $.model.rows.map((row) => (row.id === id ? { ...row, reviewer: value } : row)),
      }),
    RowActionsOpened: ($, { id }) => $.evolve({ actionsOpenId: id }),
    RowActionsClosed: ($) => $.evolve({ actionsOpenId: null }),
  },
  view: (h, model) => {
    const visible = (id: string) => !model.hiddenColumns.includes(id);
    const sortedRows = applySorting(model.rows, model.sorting);
    const pageCount = Math.max(1, Math.ceil(sortedRows.length / model.pageSize));
    const pageIndex = Math.min(model.pageIndex, pageCount - 1);
    const pageRows = sortedRows.slice(
      pageIndex * model.pageSize,
      pageIndex * model.pageSize + model.pageSize,
    );
    const selectedCount = sortedRows.filter((row) => model.selected.includes(row.id)).length;
    const pageSelectedCount = pageRows.filter((row) => model.selected.includes(row.id)).length;
    const allPageSelected = pageRows.length > 0 && pageSelectedCount === pageRows.length;
    const somePageSelected = pageSelectedCount > 0 && !allPageSelected;

    const headerCell = (id: string): View.Content<typeof DataTableMessage.Type, any> => {
      switch (id) {
        case "drag":
          return TableHead(h).children();
        case "select":
          return TableHead(h).children(
            h.div.class("flex items-center justify-center").children(
              Checkbox(h, {
                props: { checked: allPageSelected, indeterminate: somePageSelected },
                onToggle: ({ checked }) => DataTableMessage.SelectAllToggled({ checked }),
              }),
            ),
          );
        case "header":
          return TableHead(h).children("Header");
        case "type":
          return TableHead(h).children("Section Type");
        case "status":
          return TableHead(h).children("Status");
        case "target":
          return TableHead(h).children(h.div.class("w-full text-right").children("Target"));
        case "limit":
          return TableHead(h).children(h.div.class("w-full text-right").children("Limit"));
        case "reviewer":
          return TableHead(h).children("Reviewer");
        default:
          return TableHead(h).children();
      }
    };

    const bodyCell = (
      row: DashboardRow,
      id: string,
    ): View.Content<typeof DataTableMessage.Type, any> => {
      switch (id) {
        case "drag":
          return TableCell(h).children(
            Button(h, {
              variant: "ghost",
              size: "icon",
              class: "size-7 text-muted-foreground hover:bg-transparent",
            }).children(
              GripVerticalIcon(h, { class: "size-3 text-muted-foreground" }),
              h.span.class("sr-only").children("Drag to reorder"),
            ),
          );
        case "select":
          return TableCell(h).children(
            h.div.class("flex items-center justify-center").children(
              Checkbox(h, {
                props: { checked: model.selected.includes(row.id) },
                onToggle: ({ checked }) =>
                  DataTableMessage.RowSelectionToggled({ id: row.id, checked }),
              }),
            ),
          );
        case "header":
          return TableCell(h).children(
            TableCellViewer(h, { key: String(row.id), props: { item: row } }),
          );
        case "type":
          return TableCell(h).children(
            h.div
              .class("w-32")
              .children(
                Badge(h, { variant: "outline", class: "px-1.5 text-muted-foreground" }).children(
                  row.type,
                ),
              ),
          );
        case "status":
          return TableCell(h).children(
            Badge(h, { variant: "outline", class: "px-1.5 text-muted-foreground" }).children(
              row.status === "Done"
                ? CircleCheckFilledIcon(h, { class: "fill-green-500 dark:fill-green-400" })
                : LoaderIcon(h),
              row.status,
            ),
          );
        case "target":
          return TableCell(h).children(
            h.form
              .on("submit", DataTableMessage.TargetSubmitted({ id: row.id }), {
                preventDefault: true,
              })
              .children(
                Label(h, { htmlFor: `${row.id}-target`, class: "sr-only" }).children("Target"),
                Input(h, {
                  props: { value: row.target },
                  onUpdate: ({ value }) =>
                    DataTableMessage.TargetEdited({ id: row.id, value }),
                  class: cellEditorClass,
                }).attr("id", `${row.id}-target`),
              ),
          );
        case "limit":
          return TableCell(h).children(
            h.form
              .on("submit", DataTableMessage.LimitSubmitted({ id: row.id }), {
                preventDefault: true,
              })
              .children(
                Label(h, { htmlFor: `${row.id}-limit`, class: "sr-only" }).children("Limit"),
                Input(h, {
                  props: { value: row.limit },
                  onUpdate: ({ value }) => DataTableMessage.LimitEdited({ id: row.id, value }),
                  class: cellEditorClass,
                }).attr("id", `${row.id}-limit`),
              ),
          );
        case "reviewer":
          return TableCell(h).children(
            row.reviewer === "Assign reviewer"
              ? [
                  Label(h, { htmlFor: `${row.id}-reviewer`, class: "sr-only" }).children(
                    "Reviewer",
                  ),
                  Select(h, {
                    props: {
                      open: model.reviewerOpenId === row.id,
                      items: reviewerAssignOptions.map((name) => ({ value: name, label: name })),
                      placeholder: "Assign reviewer",
                      id: `${row.id}-reviewer`,
                      align: "end",
                    },
                    size: "sm",
                    triggerClass:
                      "w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate",
                    onEmit: {
                      RequestedOpen: () => DataTableMessage.ReviewerOpened({ id: row.id }),
                      RequestedClose: () => DataTableMessage.ReviewerClosed(),
                      Picked: ({ value }) =>
                        typeof value === "string"
                          ? DataTableMessage.ReviewerPicked({ id: row.id, value })
                          : undefined,
                      Settled: () => undefined,
                    },
                  }),
                ]
              : row.reviewer,
          );
        default:
          return TableCell(h).children(
            DropdownMenu(h, {
              props: {
                open: model.actionsOpenId === row.id,
                items: [
                  { value: "edit", label: "Edit" },
                  { value: "make-a-copy", label: "Make a copy" },
                  { value: "favorite", label: "Favorite" },
                  { value: "delete", label: "Delete" },
                ],
                align: "end",
              },
              onEmit: {
                RequestedOpen: () => DataTableMessage.RowActionsOpened({ id: row.id }),
                RequestedClose: () => DataTableMessage.RowActionsClosed(),
                Picked: () => DataTableMessage.RowActionsClosed(),
                Highlighted: () => undefined,
                RequestedQuery: () => undefined,
                Settled: () => undefined,
              },
              view: (menu) =>
                h.div.children(
                  DropdownMenuTrigger(menu, h, {
                    element: Button(h, {
                      variant: "ghost",
                      size: "icon",
                      class: "flex size-8 text-muted-foreground data-[state=open]:bg-muted",
                    }),
                  }).children(
                    DotsVerticalIcon(h),
                    h.span.class("sr-only").children("Open menu"),
                  ),
                  DropdownMenuContent(menu, h, { class: "w-32" }).children(
                    DropdownMenuItem(menu, h, { value: "edit" }).children("Edit"),
                    DropdownMenuItem(menu, h, { value: "make-a-copy" }).children("Make a copy"),
                    DropdownMenuItem(menu, h, { value: "favorite" }).children("Favorite"),
                    DropdownMenuSeparator(menu, h),
                    DropdownMenuItem(menu, h, { value: "delete", variant: "destructive" }).children(
                      "Delete",
                    ),
                  ),
                ),
            }),
          );
      }
    };

    const columnOrder = [
      "drag",
      "select",
      "header",
      "type",
      "status",
      "target",
      "limit",
      "reviewer",
      "actions",
    ];
    const visibleColumns = columnOrder.filter(visible);

    const tableView = h.div.class("overflow-hidden rounded-lg border").children(
      Table(h, {
        children: [
          TableHeader(h, { class: "sticky top-0 z-10 bg-muted" }).children(
            TableRow(h).children(visibleColumns.map((id) => headerCell(id))),
          ),
          TableBody(h, { class: "**:data-[slot=table-cell]:first:w-8" }).children(
            pageRows.length > 0
              ? pageRows.map((row) =>
                  TableRow(h, {
                    class:
                      "relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80",
                  })
                    .attr("data-state", model.selected.includes(row.id) ? "selected" : undefined)
                    .attr("data-dragging", String(model.draggingId === row.id))
                    .attr("draggable", "true")
                    .on("dragstart", DataTableMessage.DragStarted({ id: row.id }))
                    .on("dragover", DataTableMessage.DraggedOver({ id: row.id }), {
                      preventDefault: true,
                    })
                    .on("dragend", DataTableMessage.DragEnded())
                    .children(visibleColumns.map((id) => bodyCell(row, id))),
                )
              : TableRow(h).children(
                  TableCell(h, { class: "h-24 text-center" })
                    .attr("colspan", "9")
                    .children("No results."),
                ),
          ),
        ],
      }),
    );

    const pagination = h.div.class("flex items-center justify-between px-4").children(
      h.div
        .class("hidden flex-1 text-sm text-muted-foreground lg:flex")
        .children(`${selectedCount} of ${sortedRows.length} row(s) selected.`),
      h.div.class("flex w-full items-center gap-8 lg:w-fit").children(
        h.div.class("hidden items-center gap-2 lg:flex").children(
          Label(h, { htmlFor: "rows-per-page", class: "text-sm font-medium" }).children(
            "Rows per page",
          ),
          Select(h, {
            props: {
              open: model.pageSizeOpen,
              value: String(model.pageSize),
              items: pageSizeOptions.map((size) => ({ value: size, label: size })),
              placeholder: String(model.pageSize),
              id: "rows-per-page",
              side: "top",
            },
            size: "sm",
            triggerClass: "w-20",
            onEmit: {
              RequestedOpen: () => DataTableMessage.PageSizeOpened(),
              RequestedClose: () => DataTableMessage.PageSizeClosed(),
              Picked: ({ value }) =>
                typeof value === "string"
                  ? DataTableMessage.PageSizeChanged({ size: Number(value) })
                  : undefined,
              Settled: () => undefined,
            },
          }),
        ),
        h.div
          .class("flex w-fit items-center justify-center text-sm font-medium")
          .children(`Page ${pageIndex + 1} of ${pageCount}`),
        h.div.class("ml-auto flex items-center gap-2 lg:ml-0").children(
          Button(h, {
            variant: "outline",
            props: { disabled: pageIndex === 0 },
            onPress: DataTableMessage.FirstPagePressed(),
            class: "hidden h-8 w-8 p-0 lg:flex",
          }).children(
            h.span.class("sr-only").children("Go to first page"),
            ChevronsLeftIcon(h),
          ),
          Button(h, {
            variant: "outline",
            size: "icon",
            props: { disabled: pageIndex === 0 },
            onPress: DataTableMessage.PreviousPagePressed(),
            class: "size-8",
          }).children(
            h.span.class("sr-only").children("Go to previous page"),
            ChevronLeftIcon(h),
          ),
          Button(h, {
            variant: "outline",
            size: "icon",
            props: { disabled: pageIndex >= pageCount - 1 },
            onPress: DataTableMessage.NextPagePressed(),
            class: "size-8",
          }).children(
            h.span.class("sr-only").children("Go to next page"),
            ChevronRightIcon(h),
          ),
          Button(h, {
            variant: "outline",
            props: { disabled: pageIndex >= pageCount - 1 },
            onPress: DataTableMessage.LastPagePressed(),
            class: "hidden size-8 lg:flex",
          }).children(
            h.span.class("sr-only").children("Go to last page"),
            ChevronsRightIcon(h),
          ),
        ),
      ),
    );

    return Tabs(h, {
      props: {
        value: model.tab,
        tabs: viewOptions.map((option) => ({ value: option.value })),
      },
      onSelected: ({ value }) => DataTableMessage.TabSelected({ value }),
      view: (tabs) =>
        tabs
          .root(h.div, { class: "w-full flex-col justify-start gap-6" })
          .children(
            h.div.class("flex items-center justify-between px-4 lg:px-6").children(
              Label(h, { htmlFor: "view-selector", class: "sr-only" }).children("View"),
              Select(h, {
                props: {
                  open: model.viewSelectOpen,
                  value: model.viewValue,
                  items: viewOptions,
                  placeholder: "Select a view",
                  id: "view-selector",
                },
                size: "sm",
                triggerClass: "flex w-fit @4xl/main:hidden",
                onEmit: {
                  RequestedOpen: () => DataTableMessage.ViewSelectOpened(),
                  RequestedClose: () => DataTableMessage.ViewSelectClosed(),
                  Picked: ({ value }) =>
                    typeof value === "string"
                      ? DataTableMessage.ViewPicked({ value })
                      : undefined,
                  Settled: () => undefined,
                },
              }),
              TabsList(tabs, h.div, {
                class:
                  "hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex",
              }).children(
                TabsTrigger(tabs, { element: h.button, value: "outline" }).children("Outline"),
                TabsTrigger(tabs, { element: h.button, value: "past-performance" }).children(
                  "Past Performance",
                  Badge(h, { variant: "secondary" }).children("3"),
                ),
                TabsTrigger(tabs, { element: h.button, value: "key-personnel" }).children(
                  "Key Personnel",
                  Badge(h, { variant: "secondary" }).children("2"),
                ),
                TabsTrigger(tabs, { element: h.button, value: "focus-documents" }).children(
                  "Focus Documents",
                ),
              ),
              h.div.class("flex items-center gap-2").children(
                DropdownMenu(h, {
                  props: {
                    open: model.columnsOpen,
                    items: hideableColumns.map((id) => ({
                      value: id,
                      label: id,
                      checked: visible(id),
                    })),
                    align: "end",
                  },
                  onEmit: {
                    RequestedOpen: () => DataTableMessage.ColumnsMenuOpened(),
                    RequestedClose: () => DataTableMessage.ColumnsMenuClosed(),
                    Picked: ({ value, checked }) =>
                      DataTableMessage.ColumnVisibilityToggled({
                        id: value,
                        visible: checked === true,
                      }),
                    Highlighted: () => undefined,
                    RequestedQuery: () => undefined,
                    Settled: () => undefined,
                  },
                  view: (menu) =>
                    h.div.children(
                      DropdownMenuTrigger(menu, h, {
                        element: Button(h, { variant: "outline", size: "sm" }),
                      }).children(
                        LayoutColumnsIcon(h),
                        h.span.class("hidden lg:inline").children("Customize Columns"),
                        h.span.class("lg:hidden").children("Columns"),
                        ChevronDownIcon(h),
                      ),
                      DropdownMenuContent(menu, h, { class: "w-56" }).children(
                        hideableColumns.map((id) =>
                          DropdownMenuCheckboxItem(
                            menu,
                            h,
                            { value: id, class: "capitalize" },
                            View.text(id),
                          ),
                        ),
                      ),
                    ),
                }),
                Button(h, { variant: "outline", size: "sm" }).children(
                  PlusIcon(h),
                  h.span.class("hidden lg:inline").children("Add Section"),
                ),
              ),
            ),
            TabsContent(tabs, {
              element: h.div,
              value: "outline",
              class: "relative flex flex-col gap-4 overflow-auto px-4 lg:px-6",
            })?.children(tableView, pagination),
            TabsContent(tabs, {
              element: h.div,
              value: "past-performance",
              class: "flex flex-col px-4 lg:px-6",
            })?.children(
              h.div.class("aspect-video w-full flex-1 rounded-lg border border-dashed"),
            ),
            TabsContent(tabs, {
              element: h.div,
              value: "key-personnel",
              class: "flex flex-col px-4 lg:px-6",
            })?.children(
              h.div.class("aspect-video w-full flex-1 rounded-lg border border-dashed"),
            ),
            TabsContent(tabs, {
              element: h.div,
              value: "focus-documents",
              class: "flex flex-col px-4 lg:px-6",
            })?.children(
              h.div.class("aspect-video w-full flex-1 rounded-lg border border-dashed"),
            ),
          ),
    });
  },
});
