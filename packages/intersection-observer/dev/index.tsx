import { createVisibilityObserver } from "../src";
import { Component, For } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  const list = [...new Array(25)];
  return (
    <div class="flex justify-center items-center box-border w-full h-screen overflow-hidden bg-gray-900">
      <div class="flex flex-col items-center">
        <div class="h-100 w-100 rounded-lg shadow-lg overflow-scroll bg-white">
          <For each={list}>
            {() => {
              let ref: HTMLDivElement;
              const [isVisible] = createVisibilityObserver(() => ref || undefined);
              return (
                <div
                  ref={el => (ref = el)}
                  class="h-20 flex justify-center transition duration-1500 rounded-lg m-5 text-white items-center"
                  classList={{
                    "bg-slate-500 scale-x-75": !isVisible(),
                    "bg-blue-900": isVisible()
                  }}
                />
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
