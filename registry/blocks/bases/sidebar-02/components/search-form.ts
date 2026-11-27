/**
 * SearchForm — from the upstream bases block `sidebar-02`
 * (`registry/bases/radix/blocks/sidebar-02/components/search-form.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Declared divergences:
 *
 * - Upstream's input is uncontrolled; this repo's `SidebarInput` is
 *   controlled-only (D-7, `props.value` required), so the form is a
 *   Component owning the query string in its Model and feeding it back
 *   as the input's `value` — the Effect-native replacement for the
 *   uncontrolled DOM value.
 * - Upstream spreads `React.ComponentProps<"form">` onto the <form>;
 *   DOM prop spreading is not reproduced (the sidebar port's rule 6):
 *   the form takes no options.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { Label } from "@/components/ui/label.ts";
import { SidebarGroup, SidebarGroupContent, SidebarInput } from "@/components/ui/sidebar.ts";
import { SearchIcon } from "@/lib/icons";

export const SearchFormMessage = UiSchema.TaggedEnum({
  /** The search input's value changed (the controlled input's `onUpdate`). */
  QueryChanged: { value: Schema.String },
});

export const SearchForm = Html.component({
  name: "SearchForm",
  model: Schema.Struct({ query: Schema.String }),
  message: SearchFormMessage,
}).make({
  init: () => ({ query: "" }),
  update: {
    QueryChanged: ($, { value }) => $.evolve({ query: value }),
  },
  view: (h, model) =>
    h.form.children(
      SidebarGroup(h, { class: "py-0" }).children(
        SidebarGroupContent(h, { class: "relative" }).children(
          Label(h, { htmlFor: "search", class: "sr-only" }).children("Search"),
          SidebarInput(h, {
            props: { value: model.query },
            onUpdate: ({ value }) => SearchFormMessage.QueryChanged({ value }),
            class: "pl-8",
          })
            .attr("id", "search")
            .attr("placeholder", "Search the docs..."),
          SearchIcon(h, {
            class:
              "pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none",
          }),
        ),
      ),
    ),
});
