import { Ref, Refs } from "../src";
import { Component, createSignal, For, Show } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  const [show, setShow] = createSignal(true);
  const [show1, setShow1] = createSignal(false);
  const [show2, setShow2] = createSignal(true);
  const [showWrapper, setShowWrapper] = createSignal(true);
  const [count, setCount] = createSignal(5);

  const [refs, setRefs] = createSignal<Element[]>([]);

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-12 bg-gray-800 text-white">
      <p>Elements count: {refs().length}</p>
      <div class="wrapper-h flex-wrap">
        <button class="btn" onclick={() => setCount(p => ++p)}>
          + 1
        </button>
        <button class="btn" onclick={() => setCount(p => --p)}>
          - 1
        </button>
        <button class="btn" onclick={() => setShow(p => !p)}>
          toggle 0
        </button>
        <button class="btn" onclick={() => setShow1(p => !p)}>
          toggle 1
        </button>
        <button class="btn" onclick={() => setShow2(p => !p)}>
          toggle 2 & 3
        </button>
        <button class="btn" onclick={() => setShowWrapper(p => !p)}>
          toggle wrapper
        </button>
      </div>
      <Show when={showWrapper()}>
        <div class="wrapper-h flex-wrap">
          <Refs onChange={e => console.log(e)} refs={setRefs}>
            <p>Hello</p>
            World
            {show() && <div class="node">ID 0</div>}
            <Ref<HTMLDivElement>
              ref={el => console.log(el)}
              onMount={el => console.log("Mounted", el)}
            >
              <Show when={show1()}>
                <div class="node">ID 1</div>
              </Show>
            </Ref>
            <Show when={show2()}>
              <div class="node">ID 2</div>
              <div class="node">ID 3</div>
            </Show>
            <For each={Array.from({ length: count() }, (_, i) => i)}>
              {i => <div class="node bg-yellow-600">{i + 1}.</div>}
            </For>
          </Refs>
        </div>
      </Show>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
