import { Component, createEffect, For } from "solid-js";

import { ReactiveSet } from "../src";

const App: Component = () => {
  const set = new ReactiveSet([1, 2, 3]);

  setInterval(() => {
    const n = Math.round(Math.random() * 10);
    set.add(n) || set.delete(n);
  }, 1000);

  for (let i = 0; i <= 10; i++) {
    createEffect(() => console.log(`HAS ${i}: ${set.has(i)}`));
  }

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-h">
        <For each={[...set]}>{n => <div class="node">{n}</div>}</For>
      </div>
      <p>size: {set.size}</p>
    </div>
  );
};

export default App;
