import { createDebouncedMemo, createThrottledMemo } from "../src";
import { Component, Show } from "solid-js";
import { createMousePosition } from "@solid-primitives/mouse";

const Grouped: Component = () => {
  const pos = createMousePosition();
  const debPos = createDebouncedMemo(() => ({ x: pos.x, y: pos.y }), 200);
  const thrPos = createThrottledMemo(() => ({ x: pos.x, y: pos.y }), 200);

  return (
    <div>
      <div
        class="ball bg-green-500"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`
        }}
      ></div>
      <Show when={debPos()}>
        {({ x, y }) => (
          <div
            class="ball bg-yellow-600"
            style={{
              transform: `translate(${x}px, ${y}px)`
            }}
          ></div>
        )}
      </Show>
      <Show when={thrPos()}>
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
