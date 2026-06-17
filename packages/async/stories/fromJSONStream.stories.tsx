import { fromJSONStream } from "@solid-primitives/async";
import preview from "../../../.storybook/preview.js";
import data from "./data.json";
import { createMemo, Loading } from "solid-js";

const meta = preview.meta({
  title: "Reactivity/Async",
  parameters: {
    layout: "centered",
  },
});

export default meta;

export const FromJSONStream = meta.story({
  name: "fromJSONStream",
  parameters: {
    docs: {
      description: {
        story:
          "`fromJSONStream` wraps Web Stream ReadableStreams or streaming Responses with aggregation as well as JSON auto-closing and parsing to be used in Solid's reactive system."
      }
    }
  },
  render: () => {
    const stream = new ReadableStream({
      async pull(controller) {
        const source = JSON.stringify(data);
        const packetCount = 16;
        const sliceLength = Math.ceil(source.length / 16);
        const parts = Array.from(
          { length: packetCount },
          (_, idx) => source.slice(idx * sliceLength, (idx + 1) * sliceLength - 1)
        );
        const encoder = new TextEncoder();
        for (const part of parts) {
          await new Promise(r => setTimeout(r, 200));
          controller.enqueue(encoder.encode(part));
        }
        controller.close();
      }
    });
    const items = createMemo(fromJSONStream(() => stream));
    
    return <Loading fallback="Loading...">
      <p style="max-width: 90vw; white-space: wrap; word-break: break-word;">{JSON.stringify(items())}</p>
    </Loading>
  },
});