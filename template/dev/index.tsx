import { Component, createSignal } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count() + 1);

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-12 bg-gray-800 text-white">
      <button class="btn" onClick={increment}>
        {count()}
      </button>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
