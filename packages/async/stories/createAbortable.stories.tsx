import { createAbortable } from "@solid-primitives/async";
import preview from "../../../.storybook/preview.js";
import data from "./data.json";
import { createMemo, createSignal, For, Loading } from "solid-js";
import { autoSuggest } from "./shared.js";
import { Card, Container, colors, font, inputStyle } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Reactivity/Async",
  parameters: {
    layout: "centered",
  },
});

export default meta;

export const AbortableWithAutoCleanup = meta.story({
  name: "Auto-suggest with automatic cleanup",
  parameters: {
    docs: {
      description: {
        story:
          "`createAbortable` behaves exactly like `makeAbortable`, but also aborts automatically on cleanup — no manual `onCleanup(abort)` required.",
      },
    },
  },
  render: () => {
    const [query, setQuery] = createSignal("");
    const [signal, , filterAbortError] = createAbortable();
    const suggestions = createMemo(() =>
      autoSuggest(query(), signal(), data).catch(filterAbortError),
    );

    return (
      <Container width={320}>
        <input
          value={query()}
          onInput={e => setQuery(e.currentTarget.value)}
          placeholder="Type to search…"
          style={inputStyle}
        />
        <Loading
          fallback={
            <span style={{ color: colors.muted, "font-size": font.sizeSm }}>Searching…</span>
          }
        >
          <Card>
            <For
              each={suggestions() ?? []}
              fallback={
                <span style={{ color: colors.mutedFg, "font-size": font.sizeSm }}>No matches</span>
              }
            >
              {segments => (
                <div style={{ "font-family": font.mono, "font-size": font.sizeBase }}>
                  <For each={segments}>
                    {([text, matched]) =>
                      matched ? <strong style={{ color: colors.primary }}>{text}</strong> : text
                    }
                  </For>
                </div>
              )}
            </For>
          </Card>
        </Loading>
      </Container>
    );
  },
});
