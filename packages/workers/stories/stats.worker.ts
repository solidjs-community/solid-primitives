import { createEffect, createMemo } from "solid-js";
import { workerScope } from "@solid-primitives/workers/worker";

// Worker-side reactive computation for the "Reactive store bridge" story.
// Runs inside a createRoot for the worker's lifetime.
workerScope<
  { values: number[]; threshold: number },
  { count: number; mean: number; max: number }
>(({ inputs, setOutputs }) => {
  const filtered = createMemo(() => inputs.values.filter(v => v > inputs.threshold));

  createEffect(
    () => {
      const arr = filtered();
      const count = arr.length;
      const mean = count ? Math.round(arr.reduce((a, b) => a + b, 0) / count) : 0;
      const max = count ? Math.max(...arr) : 0;
      return { count, mean, max };
    },
    stats => {
      const delay = 500 + Math.floor(Math.random() * 2000);
      setTimeout(() => {
        setOutputs(s => {
          (s as any).count = stats.count;
          (s as any).mean = stats.mean;
          (s as any).max = stats.max;
        });
      }, delay);
    },
  );
});
