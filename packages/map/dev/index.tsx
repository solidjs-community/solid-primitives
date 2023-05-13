import { Component, For, createSignal } from "solid-js";

import { ReactiveMap } from "../src";

import { onCleanup } from "solid-js";
import { createEffect } from "solid-js";

const App: Component = () => {
  const map = new ReactiveMap<Element, number>();

  const [count, setCount] = createSignal(1);
  const decrement = () => setCount(p => Math.max(--p, 0));
  const increment = () => setCount(p => ++p);

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-h">
        <button class="btn" onClick={increment}>
          Add
        </button>
        <button class="btn" onClick={decrement}>
          Remove
        </button>
      </div>
      <div class="wrapper-h">
        <For each={Array.from({ length: count() })}>
          {() => {
            let ref: Element;
            onCleanup(() => map.delete(ref));
            createEffect(() => console.log("increment:", map.get(ref)));
            return (
              <button
                class="btn"
                ref={el => {
                  (ref = el), map.set(el, 0);
                }}
                onClick={() => map.set(ref, map.get(ref) + 1)}
              >
                {map.get(ref)}
              </button>
            );
          }}
        </For>
      </div>
      <p>size: {map.size}</p>
    </div>
  );
};

export default App;
