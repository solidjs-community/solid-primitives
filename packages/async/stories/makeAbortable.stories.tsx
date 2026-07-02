import { makeAbortable } from "@solid-primitives/async";
import preview from "../../../.storybook/preview.js";
import data from "./data.json";
import { createMemo, createSignal, For, Loading, onCleanup } from "solid-js";
import readme from "../README.md?raw";
import { autoSuggest } from "./shared.js";
import { Card, Container, colors, font, inputStyle } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Reactivity/Async",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: readme,
      },
    },
  },
});

export default meta;

export const Abortable = meta.story({
  name: "Auto-suggest that cancels stale requests",
  parameters: {
    docs: {
      description: {
        story:
          "`makeAbortable` aborts the in-flight request whenever a new one starts, so only the response for the latest keystroke ever resolves — the classic auto-suggest pattern. Call `abort()` yourself on cleanup when not using `createAbortable`.",
      },
    },
  },
  render: () => {
    const [query, setQuery] = createSignal("");
    const [signal, abort, filterAbortError] = makeAbortable();
    onCleanup(abort);
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
