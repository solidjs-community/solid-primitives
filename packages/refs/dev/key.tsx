import { Rerun } from "../../keyed/src";
import { Component, createSignal } from "solid-js";
import { Transition } from "solid-transition-group";

const App: Component = () => {
  const [count, setCount] = createSignal(0);

  return (
    <>
      <div class="wrapper-h">
        <Transition
          onEnter={(el, done) => {
            el.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: 600,
            }).finished.then(done);
          }}
          onExit={(el, done) => {
            el.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 600,
            }).finished.then(done);
          }}
          mode="outin"
        >
          <Rerun on={count}>
            <button class="btn" onClick={() => setCount(p => ++p)}>
              {count()}
            </button>
          </Rerun>
        </Transition>
      </div>
    </>
  );
};
export default App;
