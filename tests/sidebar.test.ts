import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Play, Scene, TestHost } from "@effect/ui/testing";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  SIDEBAR_ROOT_CLASS,
  SIDEBAR_WRAPPER_CLASS,
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarProviderMessage,
  SidebarTrigger,
} from "../registry/ui/sidebar.ts";
import { buttonVariants } from "../registry/ui/button.ts";
import { cn } from "../registry/lib/utils.ts";

// The consumer recipe (see tests/README.md), Provider edition: the port's
// SidebarProvider is itself a headless Component, so the consumer draws
// it, owns nothing of the sidebar state, and only records the provider's
// Updated event (upstream's onOpenChange) in its Model. The provider's
// parts (wrapper / toggle) and shared values (state, open, isMobile) are
// what the view draws with.
//
// A Scene renders the provider child with its init Model but never runs
// its update (README rule 1), so the Scene tests pin the initial render
// for both defaultOpen values; the toggle itself — a click crossing into
// the child — is a Play, in both the uncontrolled and the controlled
// shapes.
//
// NOT covered here (declared gaps):
// - The mobile branch: it is driven by the provider's media-query
//   subscription (`(max-width: 767px)`), and neither Scene nor TestHost
//   drives matchMedia, so `isMobile` stays at its init `false` and only
//   the desktop branch renders. The mobile Sheet (SidebarMobile) is
//   therefore untested here.
// - The cmd/ctrl+B keyboard subscription: a document-level subscription
//   the test hosts don't dispatch keydowns through.
// - Cookie persistence: the port deliberately delegates it to the
//   consumer (divergence 1 in sidebar.ts); the Updated event the
//   consumer would write it from IS asserted (the Play's last-open
//   readout).

const ShellMessage = UiSchema.TaggedEnum({
  SidebarChanged: { open: Schema.Boolean },
});

// A child that talks to the provider the documented way: its own update
// sends SetOpen with $.send (sidebar.ts divergence 7's custom-trigger
// route), instead of drawing the provider's toggle part.
const CloseControlMessage = UiSchema.TaggedEnum({ ClickedClose: {} });

const CloseControl = Html.component({
  name: "CloseControl",
  model: Schema.Struct({}),
  message: CloseControlMessage,
}).make({
  init: () => ({}),
  update: {
    ClickedClose: ($) => $.send(SidebarProvider, SidebarProviderMessage.SetOpen({ open: false })),
  },
  view: (h) =>
    h.button
      .attr("data-slot", "close-sidebar")
      .on("click", CloseControlMessage.ClickedClose())
      .children("Close sidebar"),
});

const shellView = (
  h: Html.H<typeof ShellMessage.Type>,
  model: { readonly lastOpen: boolean | null },
  provider: Parameters<Parameters<typeof SidebarProvider>[1]["view"]>[0],
) =>
  provider
    .wrapper(h.div)
    .children(
      Sidebar(provider, h, {}, h.span.children("Home")),
      SidebarInset(h).children(
        SidebarTrigger(provider, h),
        CloseControl(h, {}),
        h.span
          .attr("data-slot", "last-open")
          .children(model.lastOpen === null ? "" : String(model.lastOpen)),
      ),
    );

// Uncontrolled: the provider owns the open state; defaultOpen seeds it.
const Shell = Html.component({
  name: "Shell",
  props: Schema.Struct({
    startClosed: Schema.optional(Schema.Boolean),
  }),
  model: Schema.Struct({ lastOpen: Schema.NullOr(Schema.Boolean) }),
  message: ShellMessage,
}).make({
  init: () => ({ lastOpen: null }),
  update: {
    SidebarChanged: ($, { open }) => $.evolve({ lastOpen: open }),
  },
  view: (h, model) =>
    SidebarProvider(h, {
      props: { defaultOpen: h.props.startClosed ? false : undefined },
      onEmit: {
        Updated: ({ open }) => ShellMessage.SidebarChanged({ open }),
      },
      view: (sidebar) => shellView(h, model, sidebar),
    }),
});

// Controlled: the consumer owns `open` and feeds it back as a prop; the
// provider only emits Updated, and the round trip moves the sidebar.
const ControlledShell = Html.component({
  name: "ControlledShell",
  model: Schema.Struct({
    open: Schema.Boolean,
    lastOpen: Schema.NullOr(Schema.Boolean),
  }),
  message: ShellMessage,
}).make({
  init: () => ({ open: true, lastOpen: null }),
  update: {
    SidebarChanged: ($, { open }) => $.evolve({ open, lastOpen: open }),
  },
  view: (h, model) =>
    SidebarProvider(h, {
      props: { open: model.open },
      onEmit: {
        Updated: ({ open }) => ShellMessage.SidebarChanged({ open }),
      },
      view: (sidebar) => shellView(h, model, sidebar),
    }),
});

const wrapper = Locator.attr("data-slot", "sidebar-wrapper");
const root = Locator.attr("data-slot", "sidebar");
const trigger = Locator.attr("data-slot", "sidebar-trigger");
const closeControl = Locator.attr("data-slot", "close-sidebar");
const lastOpen = Locator.attr("data-slot", "last-open");

describe("Sidebar (shadcn-effect port)", () => {
  it.effect(
    "renders expanded by default: wrapper vars, root state attrs, and the trigger's Button classes",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(Shell, {});
        const wrapperAttrs = scene.get(wrapper).attrs;
        assert.strictEqual(wrapperAttrs?.class, SIDEBAR_WRAPPER_CLASS);
        assert.include(wrapperAttrs?.style ?? "", "--sidebar-width: 16rem");
        assert.include(wrapperAttrs?.style ?? "", "--sidebar-width-icon: 3rem");
        const rootAttrs = scene.get(root).attrs;
        assert.strictEqual(rootAttrs?.class, SIDEBAR_ROOT_CLASS);
        assert.strictEqual(rootAttrs?.["data-state"], "expanded");
        // data-collapsible names the mode only while collapsed.
        assert.strictEqual(rootAttrs?.["data-collapsible"], "");
        assert.strictEqual(rootAttrs?.["data-variant"], "sidebar");
        assert.strictEqual(rootAttrs?.["data-side"], "left");
        const triggerAttrs = scene.get(trigger).attrs;
        assert.strictEqual(triggerAttrs?.["data-variant"], "ghost");
        assert.strictEqual(triggerAttrs?.["data-size"], "icon");
        assert.strictEqual(
          triggerAttrs?.class,
          cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-7"),
        );
      }),
  );

  it.effect("renders collapsed when defaultOpen is false", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(Shell, { startClosed: true });
      const rootAttrs = scene.get(root).attrs;
      assert.strictEqual(rootAttrs?.["data-state"], "collapsed");
      assert.strictEqual(rootAttrs?.["data-collapsible"], "offcanvas");
    }),
  );

  it.effect(
    "a Scene cannot fire the trigger: its handler lives in the provider child (README rule 1)",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(Shell, {});
        assert.throws(() => scene.fire(trigger, "click"), /handles "click"/);
        assert.strictEqual(scene.get(root).attrs?.["data-state"], "expanded");
      }),
  );

  it.effect(
    "a Play (uncontrolled): trigger clicks toggle the provider, and Updated reaches the consumer",
    () =>
      Effect.gen(function* () {
        const play = yield* Play.make(Shell, {});
        yield* play.expect(root).toHaveAttribute("data-state", "expanded");
        yield* play.click(trigger);
        yield* play.expect(root).toHaveAttribute("data-state", "collapsed");
        yield* play.expect(root).toHaveAttribute("data-collapsible", "offcanvas");
        // The provider emitted Updated { open: false } — the event a real
        // consumer writes the sidebar_state cookie from.
        yield* play.expect(lastOpen).toHaveText("false");
        yield* play.click(trigger);
        yield* play.expect(root).toHaveAttribute("data-state", "expanded");
        yield* play.expect(lastOpen).toHaveText("true");
      }).pipe(Effect.provide(TestHost.layer())),
  );

  it.effect(
    "a Play (uncontrolled): a child's $.send(SetOpen) closes the sidebar, and the toggle still works after",
    () =>
      Effect.gen(function* () {
        const play = yield* Play.make(Shell, {});
        yield* play.click(closeControl);
        yield* play.expect(root).toHaveAttribute("data-state", "collapsed");
        yield* play.expect(lastOpen).toHaveText("false");
        yield* play.click(trigger);
        yield* play.expect(root).toHaveAttribute("data-state", "expanded");
        yield* play.expect(lastOpen).toHaveText("true");
      }).pipe(Effect.provide(TestHost.layer())),
  );

  it.effect(
    "a Play (controlled): the toggle round-trips through the consumer's Model and back in as the open prop",
    () =>
      Effect.gen(function* () {
        const play = yield* Play.make(ControlledShell, {});
        yield* play.expect(root).toHaveAttribute("data-state", "expanded");
        yield* play.click(trigger);
        // The provider changed nothing itself: it emitted Updated, the
        // consumer stored it, and the new prop re-rendered it collapsed.
        yield* play.expect(root).toHaveAttribute("data-state", "collapsed");
        yield* play.expect(lastOpen).toHaveText("false");
        yield* play.click(trigger);
        yield* play.expect(root).toHaveAttribute("data-state", "expanded");
        yield* play.expect(lastOpen).toHaveText("true");
      }).pipe(Effect.provide(TestHost.layer())),
  );
});
