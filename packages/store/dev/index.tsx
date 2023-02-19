import type { JSX, JSXElement } from 'solid-js';
import { Component, createMemo } from "solid-js";
import { render } from "solid-js/web";
import { CounterProvider, useCounterStore } from "./stores/counter-store";
import { CounterControls, BoxesDemo } from './components';

import "uno.css";


const App: Component = () => {
  const [state, {get: count, resetCount: setCount, isZero,}] = useCounterStore();
  const isPositive = () => count() > 0;
  const isNegative = () => count() < 0;
  const increment = () => setCount(count() + 1);

  const getBoxCount = createMemo(() => !isPositive() ? 25 : count(), 0);

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Counter Information</h4>
        <ul>
          <li>isZero: {isZero().toString()}</li>
          <li>isNegative: {isNegative().toString()}</li>
          <li>isPositive: {isPositive().toString()}</li>
        </ul>
        <CounterControls />
        <button
          type="button"
          class="btn"
          onClick={increment}
        >
          {count()}
        </button>
        <BoxesDemo
          boxes={getBoxCount()}
        />
      </div>
    </div>
  );
};

render(() => <CounterProvider><App /></CounterProvider>, document.getElementById("root")!);
