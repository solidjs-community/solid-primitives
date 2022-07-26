import { createVisibilityObserver } from "../src";
import { Component, createSignal } from "solid-js";
import { Repeat } from "@solid-primitives/range";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  const useVisibilityObserver = createVisibilityObserver({ threshold: 0.6 });
  const [enabled, setEnabled] = createSignal(true);
  const [length, setLength] = createSignal(20);

  return (
    <div class="flex justify-center items-center box-border w-full h-screen overflow-hidden bg-gray-900">
      <div class="flex flex-col items-center">
        <div class="flex">
          <button class="btn" onClick={() => setEnabled(p => !p)}>
            {enabled() ? "Disable" : "Enable"}
          </button>
          <button class="btn" onClick={() => setLength(p => p + 1)}>
            Add
          </button>
          <button class="btn" onClick={() => setLength(p => p - 1)}>
            Remove
          </button>
        </div>
        <div class="h-100 w-100 rounded-lg shadow-lg overflow-y-scroll bg-white">
          <Repeat times={length()}>
            {() => {
              let ref: HTMLDivElement | undefined;
              const isVisible = useVisibilityObserver(() => enabled() && ref);
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
          </Repeat>
        </div>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
