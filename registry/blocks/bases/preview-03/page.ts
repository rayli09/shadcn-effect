/**
 * Preview03Page — shadcn/ui block `preview-03` (index.tsx), bases
 * generation, ported 1:1 to Effect UI.
 *
 * Upstream: a default-exported React `Preview03Example` laying four
 * of the block's chat cards (SimpleChat, GroupChat, ReasoningChat,
 * FilesChat) into a wide capture grid, plus an sr-only `Spinner`.
 * Here: a named view function — draw it from a Component's view and
 * it places the four card child components inside the same layout
 * markup, class strings byte-for-byte upstream. SourcesChat and
 * ToolChat are standalone cards upstream (not in this grid); they
 * are ported as cards regardless, in `cards/sources-chat.ts` and
 * `cards/tool-chat.ts`.
 *
 * Declared divergences (anything else is a bug):
 *
 * - None beyond the cards' own headers: the grid, its
 *   `data-slot="capture-target"` div, the per-card wrapper divs and
 *   the sr-only Spinner are upstream's markup verbatim.
 */
import type { Html } from "@effect/ui/html";
import { Spinner } from "@/components/ui/spinner.ts";
import { FilesChat } from "./cards/files-chat.ts";
import { GroupChat } from "./cards/group-chat.ts";
import { ReasoningChat } from "./cards/reasoning-chat.ts";
import { SimpleChat } from "./cards/simple-chat.ts";

const CARD_WRAPPER_CLASS =
  "flex h-full min-h-0 flex-1 flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]";

export const Preview03Page = <Msg>(h: Html.H<Msg>) =>
  h.div
    .class(
      "flex h-screen min-h-0 flex-col overflow-x-auto overflow-y-hidden bg-muted contain-[paint] [--gap:--spacing(4)] 3xl:[--gap:--spacing(12)] md:[--gap:--spacing(10)] dark:bg-background style-lyra:md:[--gap:--spacing(6)] style-mira:md:[--gap:--spacing(6)]",
    )
    .children(
      h.div.class("flex min-h-0 w-full min-w-max flex-1 justify-center").children(
        h.div
          .attr("data-slot", "capture-target")
          .class(
            "grid min-h-0 w-[2400px] grid-cols-7 items-start gap-(--gap) bg-muted p-(--gap) md:w-[3000px] dark:bg-background style-lyra:md:w-[2600px] style-mira:md:w-[2600px] *:[div]:gap-(--gap)",
          )
          .children(
            h.div.class(CARD_WRAPPER_CLASS).children(SimpleChat(h, {})),
            h.div.class(CARD_WRAPPER_CLASS).children(GroupChat(h, {})),
            h.div.class(CARD_WRAPPER_CLASS).children(ReasoningChat(h, {})),
            h.div.class(CARD_WRAPPER_CLASS).children(FilesChat(h, {})),
          ),
      ),
      h.div.class("sr-only").children(Spinner(h)),
    );
