import "uno.css";
import { Component } from "solid-js";
import { createReducer } from '../src';
import { render } from "solid-js/web";

const App: Component = () => {
  const [count, increment] = createReducer((count) => count + 1, 0);

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Counter component</h4>
        <button class="btn" onClick={increment}>
          {count()}
        </button>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
