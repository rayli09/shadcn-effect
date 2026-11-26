import { UiSchema } from "@effect/ui"
import { Html } from "@effect/ui/html"
import { Schema } from "effect"
import { Button } from "../../registry/ui/button.ts"

export const DemoMessage = UiSchema.TaggedEnum({
  ClickedSave: {},
  ClickedDelete: {}
})

export const Demo = Html.component({
  name: "Demo",
  model: Schema.Struct({ saves: Schema.Number }),
  message: DemoMessage
}).make({
  init: () => ({ saves: 0 }),
  update: {
    ClickedSave: ($) => $.evolve({ saves: (n) => n + 1 }),
    ClickedDelete: ($) => $.evolve({ saves: 0 })
  },
  view: (h, model) =>
    h.div.class("flex gap-2 p-6").children(
      Button(h, {
        onPress: DemoMessage.ClickedSave()
      }).children(`Save (${model.saves})`),
      Button(h, {
        onPress: DemoMessage.ClickedDelete(),
        variant: "destructive",
        size: "sm"
      }).children("Delete"),
      Button(h, { variant: "outline" }).children("Cancel")
    )
})
