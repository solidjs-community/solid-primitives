import preview from "../../../.storybook/preview.js";
import readme from "../README.md?raw";
import { BasicSet } from "./examples/set-basic.js";
import BasicSetSource from "./examples/set-basic.tsx?raw";
import { AsyncSet } from "./examples/set-async.js";
import AsyncSetSource from "./examples/set-async.tsx?raw";
import { StreamingSet } from "./examples/set-streaming.js";
import StreamingSetSource from "./examples/set-streaming.tsx?raw";
import { OptimisticSet } from "./examples/set-optimistic.js";
import OptimisticSetSource from "./examples/set-optimistic.tsx?raw";
import { WeakSetExample } from "./examples/set-weak.js";
import WeakSetExampleSource from "./examples/set-weak.tsx?raw";

const meta = preview.meta({
  title: "Reactivity/Collections/Set",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { description: { component: readme } },
  },
});

export default meta;

export const Basic = meta.story({
  render: BasicSet,
  parameters: {
    docs: {
      source: { code: BasicSetSource, language: "tsx", type: "code" },
      description: {
        story:
          "Each `has(value)` read tracks its own membership. Toggle fruit, clear the set, and compare those reads with `size` and insertion-order iteration.",
      },
    },
  },
});

export const DerivedAsync = meta.story({
  name: "Derived async",
  render: AsyncSet,
  parameters: {
    docs: {
      source: { code: AsyncSetSource, language: "tsx", type: "code" },
      description: {
        story:
          "An async compute function derives permissions from the selected role. Its dependency is read before awaiting. `Loading` handles the initial request, while `isPending` exposes refreshes caused by changing roles.",
      },
    },
  },
});

export const DerivedAsyncIterable = meta.story({
  name: "Derived async iterable",
  render: StreamingSet,
  parameters: {
    docs: {
      source: { code: StreamingSetSource, language: "tsx", type: "code" },
      description: {
        story:
          "An async generator adds one city every 500 ms and yields its draft edits. Switch regions mid-stream to supersede the old producer and observe the replacement set arrive incrementally.",
      },
    },
  },
});

export const DerivedAsyncOptimistic = meta.story({
  name: "Derived async + optimistic",
  render: OptimisticSet,
  parameters: {
    docs: {
      source: { code: OptimisticSetSource, language: "tsx", type: "code" },
      description: {
        story:
          "An async computed set with `optimistic: true`. A Solid `action` immediately toggles membership and holds the tentative result through a simulated save and `refresh(set)`. Accept a toggle to persist it or reject it to see rollback.",
      },
    },
  },
});

export const WeakVariant = meta.story({
  name: "Weak variant",
  render: WeakSetExample,
  parameters: {
    docs: {
      source: { code: WeakSetExampleSource, language: "tsx", type: "code" },
      description: {
        story:
          "`createReactiveWeakSet` tracks whether particular document objects have been reviewed. Replacing a document creates a new identity with no review. The UI enumerates an explicit list, since weak sets have neither iteration nor size.",
      },
    },
  },
});
