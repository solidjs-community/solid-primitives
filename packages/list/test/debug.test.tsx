import { describe, test, expect } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { List, listArray } from "../src/index.js";
import { render } from "@solidjs/web";

describe("debug", () => {
  test("index signal updates with one flush", () => {
    const container = document.createElement("div");
    const startingArray = [1, 2, 3, 4];
    const [s, set] = createSignal(startingArray);
    
    const callbacks: (() => { v: number; i: number })[] = [];
    const unmount = render(
      () => (
        <List each={s()}>
          {(v, i) => {
            callbacks.push(() => ({ v: v(), i: i() }));
            return <div>{i()}: {v() * 2}</div>;
          }}
        </List>
      ),
      container,
    );

    // Check initial
    console.log("Initial:", callbacks.map(c => c()));
    console.log("Initial DOM:", Array.from(container.childNodes).map(n => n.textContent));
    
    set([1, 3, 2, 4]); // swap 2 and 3
    
    // Check before flush
    console.log("After set (no flush):", callbacks.map(c => c()));
    
    flush();
    
    console.log("After 1 flush:", callbacks.map(c => c()));
    console.log("After 1 flush DOM:", Array.from(container.childNodes).map(n => n.textContent));
    
    flush();
    
    console.log("After 2 flushes:", callbacks.map(c => c()));
    console.log("After 2 flushes DOM:", Array.from(container.childNodes).map(n => n.textContent));
    
    unmount();
  });
});
