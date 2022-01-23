import { Freeze, Key } from "../src";
import { Component, createSignal, For } from "solid-js";
import { Transition } from "solid-transition-group";

const App: Component = () => {
  const [count, setCount] = createSignal(0);
  const [count2, setCount2] = createSignal(1);

  return (
    <>
      <div class="wrapper-h">
        <Transition
          onEnter={(el, done) => {
            el.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: 600
            }).finished.then(done);
          }}
          onExit={(el, done) => {
            el.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 600
            }).finished.then(done);
          }}
          mode="outin"
        >
          <Key key={count()}>
            <button class="btn" onClick={() => setCount(p => ++p)}>
              {count()}
            </button>
          </Key>
        </Transition>
      </div>
      <div class="wrapper-h">
        <Freeze key={count2() < 7 ? count2() : 0}>
          <button class="btn" onClick={() => setCount2(p => ++p)}>
            {count2()}
          </button>
          <For each={Array.from({ length: count2() }, (_, i) => i)}>
            {i => <div class="node">{i + 1}.</div>}
          </For>
        </Freeze>
      </div>
    </>
  );
};
export default App;
