import { createContextProvider } from "../src";
import { Component, createSignal } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const [CounterProvider, useCounter] = createContextProvider((props: { initial: number }) => {
  const [count, setCount] = createSignal(props.initial);
  const increment = () => setCount(count() + 1);

  return {
    count,
    increment,
  };
});

const Counter: Component = () => {
  const { count, increment } = useCounter();

  return (
    <button class="btn" onClick={increment}>
      {count()}
    </button>
  );
};

const App: Component = () => {
  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Counter component</h4>
        <p class="caption">it's the best we've got...</p>
        <CounterProvider initial={1}>
          <Counter />
        </CounterProvider>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
