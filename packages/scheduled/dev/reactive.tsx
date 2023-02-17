import { Component, createMemo, createSignal, untrack } from "solid-js";
import { createScheduled, debounce, leading, throttle } from "../src";

const Reactive: Component<{}> = props => {
  const [count, setCount] = createSignal(0);

  return (
    <div class="p-4 pb-0 center-child">
      <div class="wrapper-v">
        <button class="btn" onClick={() => setCount(p => ++p)}>
          Increment
        </button>
        <div class="mt-4">
          <div>Count: {count()}</div>

          {untrack(() => {
            const debounced = createScheduled(fn => debounce(fn, 1000));
            const debouncedCount = createMemo((p: number = 0) => {
              const c = count();
              return debounced() ? c : p;
            });
            return <div>Debounced: {debouncedCount()}</div>;
          })}

          {untrack(() => {
            const throttled = createScheduled(fn => throttle(fn, 1000));
            const throttledCount = createMemo((p: number = 0) => {
              const c = count();
              return throttled() ? c : p;
            });
            return <div>Throttled: {throttledCount()}</div>;
          })}

          {untrack(() => {
            const leadingDebounced = createScheduled(fn => leading(debounce, fn, 1000));
            const leadingDebouncedCount = createMemo((p: number = 0) => {
              const c = count();
              return leadingDebounced() ? c : p;
            });
            return <div>Leading Debounced: {leadingDebouncedCount()}</div>;
          })}

          {untrack(() => {
            const leadingThrottled = createScheduled(fn => leading(throttle, fn, 1000));
            const leadingThrottledCount = createMemo((p: number = 0) => {
              const c = count();
              return leadingThrottled() ? c : p;
            });
            return <div>Leading Throttled: {leadingThrottledCount()}</div>;
          })}
        </div>
      </div>
    </div>
  );
};

export default Reactive;
