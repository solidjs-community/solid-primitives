import { Component, createSignal, Suspense, For, Switch, Match } from "solid-js";
import { createClipboard, copyToClipboard, newClipboardItem, input } from "../src";
import { render } from "solid-js/web";
import img from "./img.png";
import img2 from "./img2.png";
import "uno.css";

copyToClipboard;

const App: Component = () => {
  const [data, setClipboard] = createSignal<string | ClipboardItem[]>("");
  const [clipboard, read] = createClipboard(data);
  return (
    <div class="flex justify-center items-center box-border w-full h-screen overflow-hidden bg-gray-900">
      <div class="flex flex-col items-center">
        <div class="flex flex-col space-y-3 max-w-lg">
          <div class="flex flex-col bg-white rounded-lg p-5 shadow">
            <input
              use:copyToClipboard={{ highlight: input() }}
              class="p-3 text-2xl border-blue-700 border-3 rounded-md text-center"
              value="Copy me by clicking!"
            />
            <button
              class="mt-2 font-semibold p-3 text-white bg-blue-700 hover:bg-blue-600 transition cursor-pointer border-none rounded-md"
              use:copyToClipboard
            >
              Copy button text
            </button>
            <div class="mt-2 grid grid-cols-2 gap-2">
              <button
                class="font-semibold p-3 text-white bg-blue-700 hover:bg-blue-600 transition cursor-pointer border-none rounded-md"
                onClick={async () => {
                  const image = await fetch(img);
                  setClipboard([newClipboardItem("image/png", image.blob())]);
                }}
              >
                Copy Image 1
              </button>
              <button
                class="font-semibold p-3 text-white bg-blue-700 hover:bg-blue-600 transition cursor-pointer border-none rounded-md"
                onClick={async () => {
                  const image = await fetch(img2);
                  setClipboard([newClipboardItem("image/png", image.blob())]);
                }}
              >
                Copy Image 2
              </button>
            </div>
          </div>
          <div class="flex rounded-lg overflow-hidden text-center bg-white">
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
