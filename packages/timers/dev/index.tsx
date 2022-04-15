import { Component, createSignal, createEffect } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
import { createInterval, createTimeout } from "../src";

const Counter: Component<{ timer: typeof createInterval }> = props => {
  const [key, reset] = createSignal(undefined, { equals: false });
  const [delay, setDelay] = createSignal(1000);
  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count() + 1);
  createEffect(() => (key(), (setCount(0), props.timer(increment, delay))));
  return (
    <div class="wrapper-v">
      <h4>{props.timer.name}</h4>
      <p class="caption">Delay: {delay()} ms</p>
      <p class="caption">Count: {count()}</p>
      <div class="wrapper-h">
        <button class="btn" onClick={() => setDelay(delay => delay * 10)}>
          x10
        </button>
        <button class="btn" onClick={reset}>
          Reset
        </button>
        <button class="btn" onClick={() => setDelay(delay => delay / 10)}>
          ÷10
        </button>
      </div>
    </div>
  );
};

const App: Component = () => {
  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <Counter timer={createTimeout} />
      <Counter timer={createInterval} />
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
