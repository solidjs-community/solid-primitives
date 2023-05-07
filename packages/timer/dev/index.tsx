import { Component, createSignal, createEffect } from "solid-js";

import { createTimer } from "../src";

const Counter: Component<{ timer: typeof setTimeout | typeof setInterval }> = props => {
  const [key, reset] = createSignal(undefined, { equals: false });
  const [delay, setDelay] = createSignal(1000);
  const [count, setCount] = createSignal(0);
  const [paused, setPaused] = createSignal(false);
  const increment = () => setCount(count() + 1);
  createEffect(
    () => (key(), (setCount(0), createTimer(increment, () => !paused() && delay(), props.timer))),
  );
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
        <button class="btn" onClick={[setPaused, (p: boolean) => !p]}>
          Pause/Unpause
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
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <Counter timer={setTimeout} />
      <Counter timer={setInterval} />
    </div>
  );
};

export default App;
