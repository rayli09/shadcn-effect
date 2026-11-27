/**
 * SearchForm — shadcn/ui block `sidebar-02`
 * (`registry/new-york-v4/blocks/sidebar-02/components/search-form.tsx`),
 * ported 1:1 to Effect UI. Class strings are verbatim from the source.
 *
 * Upstream: a stateless React form around an uncontrolled `SidebarInput`
 * (it spreads `React.ComponentProps<"form">` onto the `<form>`). Here:
 * an `Html.component` — the kit Input is controlled (D-7), so the query
 * lives in the Model and edits arrive as Messages. The only form prop
 * kept is `class` (upstream's `className`).
 */
import * as Html from "@effect/ui/html/Html";
import * as UiSchema from "@effect/ui/UiSchema";
import * as Schema from "effect/Schema";
import { SearchIcon } from "@/lib/icons";
import { Label } from "@/components/ui/label.ts";
import { SidebarGroup, SidebarGroupContent, SidebarInput } from "@/components/ui/sidebar.ts";

export const SearchFormMessage = UiSchema.TaggedEnum({
  QueryChanged: { value: Schema.String },
});

export const SearchForm = Html.component({
  name: "SearchForm",
  props: Schema.Struct({ class: Schema.optional(Schema.String) }),
  model: Schema.Struct({ query: Schema.String }),
  message: SearchFormMessage,
}).make({
  init: () => ({ query: "" }),
  update: {
    QueryChanged: ($, { value }) => $.evolve({ query: value }),
  },
  view: (h, model) => {
    const form = h.props.class === undefined ? h.form : h.form.class(h.props.class);
    return form.children(
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
    );
  },
});
