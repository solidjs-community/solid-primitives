import { fromStream } from "@solid-primitives/async";
import preview from "../../../.storybook/preview.js";
import data from "./data.json";
import { createMemo, Loading } from "solid-js";
import { makeChunkedTextStream } from "./shared.js";
import { Container, EventLog, colors, font } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Reactivity/Async",
  parameters: {
    layout: "centered",
  },
});

export default meta;

export const FromStream = meta.story({
  name: "Streaming text response",
  parameters: {
    docs: {
      description: {
        story:
          "`fromStream` wraps a Web Stream `ReadableStream` or streaming `Response` so it can be consumed as a memo, growing as each chunk arrives. This demo trickles JSON text in over 16 packets, 200 ms apart — newest chunk on top, so you can watch each one filter in.",
      },
    },
  },
  render: () => {
    const stream = makeChunkedTextStream(JSON.stringify(data));
    const text = createMemo(fromStream(() => stream));

    const PREVIEW_LENGTH = 48;
    let seenLength = 0;
    const chunks = createMemo<{ label: string; time: string }[]>((prev = []) => {
      const value = text();
      if (value.length <= seenLength) return prev;
      const delta = value.slice(seenLength);
      seenLength = value.length;
      const label = delta.length > PREVIEW_LENGTH ? `${delta.slice(0, PREVIEW_LENGTH)}…` : delta;
      return [{ label, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 8);
    });

    return (
      <Container width={340}>
        <Loading
          fallback={<span style={{ color: colors.muted, "font-size": font.sizeSm }}>Loading…</span>}
        >
          <EventLog entries={chunks()} />
        </Loading>
      </Container>
    );
  },
});
