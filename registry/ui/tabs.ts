/**
 * Tabs — shadcn/ui `tabs` ported 1:1 to Effect UI.
 *
 * Upstream: React + cva + Radix Tabs (Root / List / Trigger / Content).
 * Here: the @effect/ui-kit `Tabs` headless component — the consumer owns
 * the active `value`, the kit adds ARIA, ids, roving focus and panel
 * transitions, and emits `Selected`, which this wrapper surfaces as
 * `onSelected`.
 *
 * A headless component has no standalone subcomponents in Effect UI: the
 * parts only exist inside its `view` closure. So `TabsList`,
 * `TabsTrigger` and `TabsContent` live on the parts object handed to
 * `view` (as `list` / `trigger` / `content`, with the kit's own names
 * `tab` / `panel` / `indicator` kept as aliases), and are also exported
 * below as functions that take that parts object first:
 *
 *   Tabs(h, {
 *     props: { value: model.tab, tabs: [{ value: "a" }, { value: "b" }] },
 *     onSelected: ({ value }) => Msg.SelectedTab({ value }),
 *     view: (tabs) =>
 *       tabs.root(h.div).children(
 *         TabsList(tabs, h.div, { variant: "line" }).children(
 *           TabsTrigger(tabs, { element: h.button, value: "a" }).children("A")
 *         ),
 *         TabsContent(tabs, { element: h.div, value: "a" })?.children("…")
 *       )
 *   })
 *
 * Adaptations the kit forces, honestly:
 *
 * - Radix writes `data-state="active" | "inactive"` on triggers and the
 *   upstream classes key off `data-[state=active]:…`. The kit writes
 *   `data-active` instead, so the styled trigger also writes `data-state`
 *   from the active value — without it the upstream strings never match.
 * - Upstream TabsList's `variant` is a prop of the list; here it is an
 *   option of the styled `list` part. The `group-data-[variant=…]`
 *   selectors work the same: the list carries `data-variant` and the
 *   `group/tabs-list` class.
 * - `TabsContent` (the styled `panel` part) returns `undefined` while its
 *   panel is hidden, exactly like the kit — chain with `?.`.
 *
 * Class strings are byte-for-byte the shadcn new-york-v4 strings.
 */
import type * as View from "@effect/ui/View";
import {
  Tabs as KitTabs,
  type TabsActivationDirection,
  type TabsOrientation,
  type TabsProps,
} from "@effect/ui-kit";
import { cn } from "../lib/utils.ts";

export type { TabsActivationDirection, TabsOrientation, TabsProps };

export type TabsListVariant = "default" | "line";

/** The kit's keyed builder shape: a part target that can take a `key`. */
type Keyed<Tag extends string> = View.PartTarget<Tag> & {
  readonly key: (key: string) => View.PartTarget<Tag>;
};

export const TABS_ROOT_CLASS = "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col";

const LIST_BASE =
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none";

const LIST_VARIANTS: Record<TabsListVariant, string> = {
  default: "bg-muted",
  line: "gap-1 bg-transparent",
};

export const TABS_TRIGGER_CLASS = cn(
  "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
  "data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground",
  "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
);

export const TABS_CONTENT_CLASS = "flex-1 outline-none";

/** Upstream name kept: `tabsListVariants({ variant })` in shadcn; here a pure function, not cva. */
export const tabsListVariants = (
  options: {
    readonly variant?: TabsListVariant | undefined;
    readonly class?: string | undefined;
  } = {},
): string => cn(LIST_BASE, LIST_VARIANTS[options.variant ?? "default"], options.class);

/**
 * The styled parts handed to `Tabs`' `view` closure. `root`, `list`,
 * `trigger` and `content` are the shadcn anatomy (Tabs, TabsList,
 * TabsTrigger, TabsContent) pre-styled with the upstream classes and
 * `data-slot`s; `tab`, `panel` and `indicator` are the kit's own names
 * for the same parts.
 */
export interface TabsParts {
  readonly value: string | null;
  readonly orientation: TabsOrientation;
  readonly activationDirection: TabsActivationDirection;
  readonly root: <B extends View.PartTarget<string>>(
    element: B,
    options?: { readonly class?: string | undefined },
  ) => ReturnType<B["attr"]>;
  readonly list: <B extends View.PartTarget<string>>(
    element: B,
    options?: {
      readonly variant?: TabsListVariant | undefined;
      readonly class?: string | undefined;
    },
  ) => ReturnType<B["attr"]>;
  readonly trigger: <B extends Keyed<"button" | "a">>(args: {
    readonly element: B;
    readonly value: string;
    readonly class?: string | undefined;
  }) => ReturnType<B["attr"]>;
  readonly content: <B extends Keyed<string>>(args: {
    readonly element: B;
    readonly value: string;
    readonly class?: string | undefined;
  }) => ReturnType<B["attr"]> | undefined;
  readonly tab: TabsParts["trigger"];
  readonly panel: TabsParts["content"];
  readonly indicator: <B extends View.PartTarget<string>>(
    element: B,
  ) => ReturnType<B["attr"]> | undefined;
}

/** shadcn's `TabsList`, as a function of the parts from `Tabs`' view closure. */
export const TabsList = <B extends View.PartTarget<string>>(
  tabs: TabsParts,
  element: B,
  options?: {
    readonly variant?: TabsListVariant | undefined;
    readonly class?: string | undefined;
  },
): ReturnType<B["attr"]> => tabs.list(element, options);

/** shadcn's `TabsTrigger`, as a function of the parts from `Tabs`' view closure. */
export const TabsTrigger = <B extends Keyed<"button" | "a">>(
  tabs: TabsParts,
  args: {
    readonly element: B;
    readonly value: string;
    readonly class?: string | undefined;
  },
): ReturnType<B["attr"]> => tabs.trigger(args);

/** shadcn's `TabsContent`, as a function of the parts from `Tabs`' view closure. Returns `undefined` while the panel is hidden. */
export const TabsContent = <B extends Keyed<string>>(
  tabs: TabsParts,
  args: {
    readonly element: B;
    readonly value: string;
    readonly class?: string | undefined;
  },
): ReturnType<B["attr"]> | undefined => tabs.content(args);

/**
 * shadcn-styled tabs. The consumer owns the active tab: pass it as
 * `props.value`, store what `onSelected` reports.
 */
export const Tabs = <Msg, RV = never>(
  h: View.HelperBase<Msg, unknown>,
  options: {
    readonly key?: string | undefined;
    readonly props: TabsProps;
    readonly onSelected?:
      | ((event: {
          readonly value: string;
          readonly activationDirection: TabsActivationDirection;
        }) => NoInfer<Msg> | undefined)
      | undefined;
    readonly view: (tabs: TabsParts) => View.Content<NoInfer<Msg>, RV>;
  },
) => {
  const orientation = options.props.orientation ?? "horizontal";
  const styled = (tabs: {
    readonly value: string | null;
    readonly orientation: TabsOrientation;
    readonly activationDirection: TabsActivationDirection;
    readonly root: View.Part<string, [], never>;
    readonly list: View.Part<string, [], never>;
    readonly tab: <B extends Keyed<"button" | "a">>(args: {
      readonly element: B;
      readonly value: string;
    }) => ReturnType<B["attr"]>;
    readonly panel: <B extends Keyed<string>>(args: {
      readonly element: B;
      readonly value: string;
    }) => ReturnType<B["attr"]> | undefined;
    readonly indicator: <B extends View.PartTarget<string>>(
      element: B,
    ) => ReturnType<B["attr"]> | undefined;
  }): TabsParts => {
    const trigger: TabsParts["trigger"] = (args) =>
      tabs
        .tab({ element: args.element, value: args.value })
        .attr("data-slot", "tabs-trigger")
        .attr("data-state", args.value === options.props.value ? "active" : "inactive")
        .class(cn(TABS_TRIGGER_CLASS, args.class));
    const content: TabsParts["content"] = (args) =>
      tabs
        .panel({ element: args.element, value: args.value })
        ?.attr("data-slot", "tabs-content")
        .class(cn(TABS_CONTENT_CLASS, args.class));
    return {
      value: tabs.value,
      orientation: tabs.orientation,
      activationDirection: tabs.activationDirection,
      root: (element, partOptions) =>
        tabs
          .root(element)
          .attr("data-slot", "tabs")
          .attr("data-orientation", orientation)
          .class(cn(TABS_ROOT_CLASS, partOptions?.class)),
      list: (element, partOptions) =>
        tabs
          .list(element)
          .attr("data-slot", "tabs-list")
          .attr("data-variant", partOptions?.variant ?? "default")
          .class(
            tabsListVariants({
              variant: partOptions?.variant,
              class: partOptions?.class,
            }),
          ),
      trigger,
      content,
      tab: trigger,
      panel: content,
      indicator: (element) => tabs.indicator(element),
    };
  };
  return KitTabs(h, {
    ...(options.key === undefined ? {} : { key: options.key }),
    props: options.props,
    ...(options.onSelected === undefined
      ? {}
      : {
          onEmit: {
            Selected: (event: {
              readonly value: string;
              readonly activationDirection: TabsActivationDirection;
            }) => options.onSelected!(event),
          },
        }),
    view: (tabs) => options.view(styled(tabs)),
  });
};
