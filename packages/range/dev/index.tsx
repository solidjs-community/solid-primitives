import { Repeat, Range, IndexRange } from "../src";
import { Component, createSignal, onCleanup } from "solid-js";

import { TransitionGroup } from "solid-transition-group";

import { createStore } from "solid-js/store";

const Ball = (props: { n: number }) => (
  <div class="center-child h-4 w-4 rounded-full bg-cyan-500 transition-all duration-500">
    {props.n}
  </div>
);
const Fallback = () => <div class="bg-gray-600 p-2 transition-all duration-500">fallback</div>;

const App: Component = () => {
  const [state, setState] = createStore({
    start: 5,
    to: -5,
    step: 2,
  });

  const shuffle = () => {
    // const start = 1;
    // const to = 2;
    // const step = 1.5;
    const start = Math.round(Math.random() * 10 - 6);
    const to = Math.round(Math.random() * 10 - 2);
    const step = Math.round(Math.random() * 4);
    setState({ start, to, step });
  };

  // const [state, setState] = createStore({
  //   start: 0,
  //   to: -5,
  //   step: -0.5
  // });

  const i = setInterval(shuffle, 6000);
  onCleanup(() => clearInterval(i));

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>
          Start: {state.start}, To: {state.to}, Step: {state.step}
        </h4>
        <div>
          <button class="btn" onclick={shuffle}>
            shuffle
          </button>
        </div>
        <h4>Repeat component</h4>
        <div class="flex space-x-2">
          <TransitionGroup name="fade">
            <Repeat times={state.to} fallback={<Fallback />}>
              {n => <Ball n={n} />}
            </Repeat>
          </TransitionGroup>
        </div>
        <h4>Range component</h4>
        <div class="flex space-x-2">
          <TransitionGroup name="fade">
            <Range start={state.start} to={state.to} step={state.step} fallback={<Fallback />}>
              {n => <Ball n={n} />}
            </Range>
          </TransitionGroup>
        </div>
        <h4>IndexRange component</h4>
        <div class="flex space-x-2">
          <TransitionGroup name="fade">
            <IndexRange start={state.start} to={state.to} step={state.step} fallback={<Fallback />}>
              {n => <Ball n={n()} />}
            </IndexRange>
          </TransitionGroup>
        </div>
      </div>
    </div>
  );
};

export default App;
