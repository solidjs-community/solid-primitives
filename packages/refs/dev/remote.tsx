import { Remote } from "../src";
import { Component, createSignal, Show } from "solid-js";

const App: Component = () => {
  const [count, setCount] = createSignal(0);
  const [hovering, setHovering] = createSignal(false);

  return (
    <>
      <div class="wrapper-h">
        <div class="node" id="capture-me">
          I'm the old content
        </div>
      </div>
      <Remote<"div">
        element={() => document.querySelector("#capture-me")}
        style={{
          transform: `translate(${count()}px, ${count()}px)`
        }}
        classList={{
          "bg-orange-700": hovering()
        }}
        onmouseenter={e => setHovering(true)}
        onmouseleave={e => setHovering(false)}
      >
        <p>Hi, I'm new here!</p>
        <button class="btn" onClick={() => setCount(p => ++p)}>
          {count()}
        </button>
        <Show when={count() % 2 === 0}>
          <p>It's even</p>
        </Show>
      </Remote>
    </>
  );
};
export default App;
