import { Component, createEffect, createMemo, createSignal } from "solid-js";
import { createScheduled, debounce, leading, leadingAndTrailing, throttle } from "../src";

const Reactive: Component = props => {
  const [count, setCount] = createSignal(0);

  const TIMEOUT = 1000;

  type ExampleData = {
    name: string;
    schedule: (callback: VoidFunction) => VoidFunction;
  };

  const examples: ExampleData[] = [
    {
      name: "debounce",
      schedule: fn => debounce(fn, TIMEOUT),
    },
    {
      name: "throttle",
      schedule: fn => throttle(fn, TIMEOUT),
    },
    {
      name: "leading debounce",
      schedule: fn => leading(debounce, fn, TIMEOUT),
    },
    {
      name: "leading throttle",
      schedule: fn => leading(throttle, fn, TIMEOUT),
    },
    {
      name: "leading and trailing debounce",
      schedule: fn => leadingAndTrailing(debounce, fn, TIMEOUT),
    },
    {
      name: "leading and trailing throttle",
      schedule: fn => leadingAndTrailing(throttle, fn, TIMEOUT),
    },
  ];

  return (
    <div class="center-child p-4 pb-0">
      <div class="wrapper-v">
        <button class="btn" onClick={() => setCount(p => ++p)}>
          Increment
        </button>
        <div class="mt-4">
          <div>Count: {count()}</div>

          {examples.map(({ name, schedule }) => {
            const scheduled = createScheduled(schedule);
            const memo = createMemo((p: number = 0) => {
              const c = count();
              return scheduled() ? c : p;
            });
            createEffect(() => {
              count();
              console.log(name, scheduled());
            });
            return (
              <div>
                {name}: {memo()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Reactive;
