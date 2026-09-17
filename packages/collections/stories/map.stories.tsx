import preview from "../../../.storybook/preview.js";
import readme from "../README.md?raw";
import { BasicMap } from "./examples/map-basic.js";
import BasicMapSource from "./examples/map-basic.tsx?raw";
import { AsyncMap } from "./examples/map-async.js";
import AsyncMapSource from "./examples/map-async.tsx?raw";
import { StreamingMap } from "./examples/map-streaming.js";
import StreamingMapSource from "./examples/map-streaming.tsx?raw";
import { OptimisticMap } from "./examples/map-optimistic.js";
import OptimisticMapSource from "./examples/map-optimistic.tsx?raw";
import { WeakMapExample } from "./examples/map-weak.js";
import WeakMapExampleSource from "./examples/map-weak.tsx?raw";

const meta = preview.meta({
  title: "Reactivity/Collections/Map",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { description: { component: readme } },
  },
});

export default meta;

export const Basic = meta.story({
  render: BasicMap,
  parameters: {
    docs: {
      source: { code: BasicMapSource, language: "tsx", type: "code" },
      description: {
        story:
          "A mutable map with independent `get(key)` subscriptions. Add points, delete players, or clear the map; `size` tracks membership.",
      },
    },
  },
});

export const DerivedAsync = meta.story({
  name: "Derived async",
  render: AsyncMap,
  parameters: {
    docs: {
      source: { code: AsyncMapSource, language: "tsx", type: "code" },
      description: {
        story:
          "An async compute function reads the selected warehouse before awaiting a simulated response. `Loading` handles the initial request and `isPending` indicates subsequent requests. Switching warehouses supersedes an older request.",
      },
    },
  },
});

export const DerivedAsyncIterable = meta.story({
  name: "Derived async iterable",
  render: StreamingMap,
  parameters: {
    docs: {
      source: { code: StreamingMapSource, language: "tsx", type: "code" },
      description: {
        story:
          "An async generator clears its draft and yields one score every 500 ms. Starting another round supersedes the previous stream, including any late writes to its draft.",
      },
    },
  },
});

export const DerivedAsyncOptimistic = meta.story({
  name: "Derived async + optimistic",
  render: OptimisticMap,
  parameters: {
    docs: {
      source: { code: OptimisticMapSource, language: "tsx", type: "code" },
      description: {
        story:
          "An async computed map with `optimistic: true`. A Solid `action` shows a point immediately, then waits for a simulated save and `refresh(map)`. Accepted writes persist; rejected writes roll back to the authoritative response.",
      },
    },
  },
});

export const WeakVariant = meta.story({
  name: "Weak variant",
  render: WeakMapExample,
  parameters: {
    docs: {
      source: { code: WeakMapExampleSource, language: "tsx", type: "code" },
      description: {
        story:
          "`createReactiveWeakMap` associates notes with object identities. Replace an object with an identically named one to see that its note does not transfer. An explicit object list supplies the UI rows; the weak map does not expose iteration or size.",
      },
    },
  },
});
