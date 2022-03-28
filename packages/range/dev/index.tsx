import { Repeat } from "../src";
import { Component, createSignal } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  const [count, setCount] = createSignal(2);

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Range component</h4>
        <div class="flex space-x-4">
          <button class="btn" onClick={() => setCount(count() + 3)}>
            add 3
          </button>
          <button class="btn" onClick={() => setCount(count() + 1)}>
            add 1
          </button>
          <button class="btn" onClick={() => setCount(count() - 1)}>
            remove 1
          </button>
          <button class="btn" onClick={() => setCount(count() - 3)}>
            remove 3
          </button>
          <button class="btn" onClick={() => setCount(0)}>
            clear
          </button>
        </div>
        <div class="flex space-x-2">
          <Repeat times={count()} fallback="yoooo">
            {n => (
              <div class="w-3 h-3 rounded-full bg-pink-700 animate-zoom-in animate-count-1">
                {n}
              </div>
            )}
          </Repeat>
        </div>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
