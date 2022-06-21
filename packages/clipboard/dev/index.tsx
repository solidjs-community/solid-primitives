import { createClipboard, copyToClipboard } from "../src";
import { Component, createSignal, Show } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
copyToClipboard;

const App: Component = () => {
  let ref: HTMLInputElement;
  const [data, setClipboard] = createSignal("");
  const [clipboard, read] = createClipboard(data);
  return (
    <div class="flex justify-center items-center box-border w-full h-screen overflow-hidden bg-gray-900">
      <div class="flex flex-col items-center">
        <div class="flex flex-col space-y-3">
          <div class="flex flex-col bg-white rounded-lg p-5 shadow">
            <input
              ref={el => (ref = el)}
              class="p-3 text-2xl border-slate-400 border-b-none border rounded-t-md text-center"
              value="Hello world"
            />
            <button
              class="text-lg p-3 text-white bg-blue-700 hover:bg-blue-600 transition cursor-pointer border-none rounded-b-md"
              onClick={() => setClipboard(ref.value)}
            >
              Click to copy input
            </button>
            <button
              class="mt-1 text-lg p-3 text-white bg-blue-700 hover:bg-blue-600 transition cursor-pointer border-none rounded-md"
              use:copyToClipboard
            >
              Click me!
            </button>
          </div>
          <div class="rounded-lg text-center bg-white/30 text-white p-5">
            <Show fallback="Empty clipboard" when={clipboard().length != 0}>
              {JSON.stringify(clipboard()).replace(/"/g, "")}
            </Show>
            <button>Read</button>
          </div>
        </div>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
