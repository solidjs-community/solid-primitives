import { Component, createSignal, Suspense, For, createEffect } from "solid-js";
import { createClipboard, copyToClipboard } from "../src";
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
        <div class="flex flex-col space-y-3 max-w-lg">
          <div class="flex flex-col bg-white rounded-lg p-5 shadow">
            <input
              ref={el => (ref = el)}
              class="p-3 text-2xl border-blue-700 border-b-none border-3 rounded-t-md text-center"
              value="Hello world"
            />
            <button
              class="font-semibold p-3 text-white bg-blue-700 hover:bg-blue-600 transition cursor-pointer border-none rounded-b-md"
              onClick={() => setClipboard(ref.value)}
            >
              Click to copy input
            </button>
            <button
              class="mt-2 font-semibold p-3 text-white bg-blue-700 hover:bg-blue-600 transition cursor-pointer border-none rounded-md"
              use:copyToClipboard
            >
              Click me!
            </button>
          </div>
          <div class="flex rounded-lg overflow-hidden text-center bg-white">
            <div class="w-full p-5">
              <Suspense fallback={"Loading..."}>
                <For each={clipboard()}>
                  {item => {
                    const [result, setResult] = createSignal<string>("");
                    createEffect(async () =>
                      setResult(await (await item.getType("text/plain")).text())
                    );
                    return <div>{result()}</div>;
                  }}
                </For>
              </Suspense>
            </div>
            <button
              class="p-4 bg-blue-700 border-none font-semibold text-white hover:bg-blue-600 transition cursor-pointer"
              onClick={read}
            >
              Read
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
