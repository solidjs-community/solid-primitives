import { Component, createSignal, Suspense, For, Switch, Match } from "solid-js";
import { createClipboard, copyToClipboard, newClipboardItem, input } from "../src";

import img from "./img.png";
import img2 from "./img2.png";

copyToClipboard;

const App: Component = () => {
  const [data, setClipboard] = createSignal<string | ClipboardItem[]>("");
  const [clipboard, read] = createClipboard(data);
  return (
    <div class="box-border flex h-screen w-full items-center justify-center overflow-hidden bg-gray-900">
      <div class="flex flex-col items-center">
        <div class="flex max-w-lg flex-col space-y-3">
          <div class="flex flex-col rounded-lg bg-white p-5 shadow">
            <input
              use:copyToClipboard={{ highlight: input() }}
              class="border-3 rounded-md border-blue-700 p-3 text-center text-2xl"
              value="Copy me by clicking!"
            />
            <button
              class="mt-2 cursor-pointer rounded-md border-none bg-blue-700 p-3 font-semibold text-white transition hover:bg-blue-600"
              use:copyToClipboard
            >
              Copy button text
            </button>
            <div class="mt-2 grid grid-cols-2 gap-2">
              <button
                class="cursor-pointer rounded-md border-none bg-blue-700 p-3 font-semibold text-white transition hover:bg-blue-600"
                onClick={async () => {
                  const image = await fetch(img);
                  setClipboard([newClipboardItem("image/png", image.blob())]);
                }}
              >
                Copy Image 1
              </button>
              <button
                class="cursor-pointer rounded-md border-none bg-blue-700 p-3 font-semibold text-white transition hover:bg-blue-600"
                onClick={async () => {
                  const image = await fetch(img2);
                  setClipboard([newClipboardItem("image/png", image.blob())]);
                }}
              >
                Copy Image 2
              </button>
            </div>
          </div>
          <div class="flex overflow-hidden rounded-lg bg-white text-center">
            <div class="w-full p-5">
              <Suspense fallback={"Loading..."}>
                <For each={clipboard()}>
                  {item => (
                    <Switch>
                      <Match when={item.type == "text/plain"}>{item.text}</Match>
                      <Match when={item.type == "image/png"}>
                        <img class="w-full" src={URL.createObjectURL(item.blob)} />
                      </Match>
                    </Switch>
                  )}
                </For>
              </Suspense>
            </div>
            <button
              class="cursor-pointer border-none bg-blue-700 p-4 font-semibold text-white transition hover:bg-blue-600"
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

export default App;
