/**
 * SearchForm (sidebar-16 block) — upstream
 * `registry/bases/radix/blocks/sidebar-16/components/search-form.tsx`
 * ported to Effect UI. Class strings are verbatim from the source.
 *
 * Declared divergences:
 *
 * - Upstream's input is uncontrolled; this repo's `SidebarInput` is
 *   controlled-only (D-7, `props.value` required), so the form is a
 *   Component owning the query string in its Model and feeding it back
 *   as the input's `value` — the Effect-native replacement for the
 *   uncontrolled DOM value (the same shape as the sidebar-01 block's
 *   SearchForm).
 * - Upstream spreads `React.ComponentProps<"form">` onto the <form>;
 *   DOM prop spreading is not reproduced (the sidebar port's rule 6):
 *   the one spread the caller (SiteHeader) uses, `className`, is the
 *   explicit `class` prop.
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { SearchIcon } from "@/lib/icons";
import { Label } from "@/components/ui/label.ts";
import { SidebarInput } from "@/components/ui/sidebar.ts";

export const SearchFormProps = Schema.Struct({
  class: Schema.optional(Schema.String),
});
export type SearchFormProps = typeof SearchFormProps.Type;

export const SearchFormMessage = UiSchema.TaggedEnum({
  /** The search input's value changed (the controlled input's `onUpdate`). */
  QueryChanged: { value: Schema.String },
});

export const SearchForm = Html.component({
  name: "Sidebar16SearchForm",
  props: SearchFormProps,
  model: Schema.Struct({ query: Schema.String }),
  message: SearchFormMessage,
}).make({
  init: () => ({ query: "" }),
  update: {
    QueryChanged: ($, { value }) => $.evolve({ query: value }),
  },
  view: (h, model) => {
    const form = h.props.class !== undefined ? h.form.class(h.props.class) : h.form;
    return form.children(
      h.div.class("relative").children(
        Label(h, { htmlFor: "search", class: "sr-only" }).children("Search"),
        SidebarInput(h, {
          props: { value: model.query },
          onUpdate: ({ value }) => SearchFormMessage.QueryChanged({ value }),
          class: "h-8 pl-7",
        })
          .attr("id", "search")
          .attr("placeholder", "Type to search..."),
        SearchIcon(h, {
          class:
            "pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none",
        }),
      ),
    );
  },
});
