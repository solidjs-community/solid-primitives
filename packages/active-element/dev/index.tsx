import { createActiveElement, focus } from "../src";
import { Component, createSignal, Index } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
import { genNodeList } from "./utils";
// prevent tree-shaking
focus;

const Node: Component<{ x: number; y: number; size: number }> = props => {
  const [isFocused, setIsFocused] = createSignal(false);

  return (
    <button
      use:focus={setIsFocused}
      class="fixed top-0 left-0 h-48 w-48 cursor-pointer rounded-full border-none bg-orange-700 text-4xl font-extrabold text-gray-900 hover:bg-orange-600"
      classList={{
        "!bg-indigo-700 !hover:bg-indigo-600": isFocused(),
      }}
      style={{
        transform: `translate(${props.x}px, ${props.y}px) scale(${props.size})`,
        transition: "transform 500ms, background 200ms",
      }}
    >
      {props.children}
    </button>
  );
};

const App: Component = () => {
  const [list, setList] = createSignal(genNodeList());
  const shuffle = () => setList(genNodeList());
  const activeEl = createActiveElement();

  return (
    <div class="box-border h-screen w-full overflow-hidden bg-gray-900 text-white">
      <Index each={list()}>
        {item => (
          <Node x={item().x} y={item().y} size={item().size}>
            {item().id}
          </Node>
        )}
      </Index>
      <button
        class="fixed top-1/2 left-1/2 -mt-8 -ml-32 h-16 w-64 cursor-pointer rounded-lg border-none bg-transparent text-5xl font-extrabold text-white hover:text-yellow-200"
        onclick={shuffle}
      >
        Shuffle!
      </button>
      <div class="absolute top-6 left-6 text-4xl font-extrabold">
        Active Element:{" "}
        {activeEl() && activeEl()?.tagName !== "BODY" ? activeEl()?.textContent : "null"}
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root") as HTMLElement);
