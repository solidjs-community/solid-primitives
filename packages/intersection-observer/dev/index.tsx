import { createVisibilityObserver } from "../src";
import { Component, createEffect, createSignal, For, onMount, Show } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  let ref!: HTMLDivElement;

  // const [visible, setVisible] = createSignal(false);

  // const io = new IntersectionObserver(([entry]) => {
  //   setVisible(entry.isIntersecting);
  // });
  // onMount(() => {
  //   io.observe(ref);
  // });

  const [visible] = createVisibilityObserver(() => ref, { once: true });

  createEffect(() => {
    console.log(visible());
  });

  return (
    <div class="box-border p-24 w-full min-h-screen overflow-hidden bg-indigo-800 text-white">
      <div class="w-full h-300vh">
        {/* <button onclick={() => io.disconnect()}>disconnect</button>
        <button onclick={() => io.observe(ref)}>observe</button> */}
        <div ref={ref} class="bg-orange-700 w-32 h-24"></div>
      </div>
      {/* <For each={Array.from({length: 20})}>
        
      </For> */}
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
