import { Component, createEffect, For } from "solid-js";
import { render } from "solid-js/web";
import { createSet } from "../src";
import "uno.css";

const App: Component = () => {
  const set = createSet([1, 2, 3]);

  setInterval(() => {
    const n = Math.round(Math.random() * 10);
    set.add(n) || set.delete(n);
  }, 1000);

  for (let i = 0; i <= 10; i++) {
    createEffect(() => console.log(`HAS ${i}: ${set.has(i)}`));
  }

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-h">
        <For each={set()}>{n => <div class="node">{n}</div>}</For>
      </div>
      <p>size: {set.size}</p>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
