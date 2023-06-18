import { Component, For, createEffect, createSignal } from "solid-js";
import { useTabVisibility } from "../src";

const App: Component = () => {
  const [visibilityHistory, setVisibilityHistory] = createSignal<string[]>([]);
  const isVisible = useTabVisibility();
  createEffect(() => {
    setVisibilityHistory(arr => {
      return [...arr, isVisible() ? "visible" : "hidden"];
    });
  });
  return (
    <>
      <div class="box-border flex min-h-screen w-full flex-col items-center space-y-4 bg-gray-800 p-24 text-white">
        <h1 class="text-2xl">
          <b>Visibility History</b>
        </h1>
        <For each={visibilityHistory()}>
          {(item, i) => {
            return <span>{item}</span>;
          }}
        </For>
      </div>
    </>
  );
};

export default App;
