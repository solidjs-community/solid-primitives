import { createDebouncedMemo, createThrottledMemo } from "../src";
import { Component } from "solid-js";
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
      <div
        class="ball bg-yellow-600"
        style={{
          transform: `translate(${debPoz().x}px, ${debPoz().y}px)`
        }}
      ></div>
      <div
        class="ball bg-cyan-500"
        style={{
          transform: `translate(${thrPoz().x}px, ${thrPoz().y}px)`
        }}
      ></div>
      <p class="font-bold text-green-500 opacity-50">normal</p>
      <p class="font-bold text-yellow-600 opacity-50">debounced</p>
      <p class="font-bold text-cyan-500 opacity-50">throttled</p>
    </div>
  );
};
export default Grouped;
