import { createDebouncedMemo, createThrottledMemo } from "../src";
import { Component, Show } from "solid-js";
import { createMousePosition } from "@solid-primitives/mouse";

const Grouped: Component = () => {
  const [poz] = createMousePosition();
  const debPoz = createDebouncedMemo(() => ({ x: poz.x(), y: poz.y() }), 200);
  const thrPoz = createThrottledMemo(() => ({ x: poz.x(), y: poz.y() }), 200);

  return (
    <div>
      <div
        class="ball bg-green-500"
        style={{
          transform: `translate(${poz.x()}px, ${poz.y()}px)`
        }}
      ></div>
      <Show when={debPoz()}>
        {({ x, y }) => (
          <div
            class="ball bg-yellow-600"
            style={{
              transform: `translate(${x}px, ${y}px)`
            }}
          ></div>
        )}
      </Show>
      <Show when={thrPoz()}>
        {({ x, y }) => (
          <div
            class="ball bg-cyan-500"
            style={{
              transform: `translate(${x}px, ${y}px)`
            }}
          ></div>
        )}
      </Show>
      <p class="font-bold text-green-500 opacity-50">normal</p>
      <p class="font-bold text-yellow-600 opacity-50">debounced</p>
      <p class="font-bold text-cyan-500 opacity-50">throttled</p>
    </div>
  );
};
export default Grouped;
