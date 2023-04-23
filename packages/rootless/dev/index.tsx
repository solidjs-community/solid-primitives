import { Component, createEffect, createSignal } from "solid-js";
import { render } from "solid-js/web";
import { createSuspense } from "../src";

import "uno.css";

const App: Component = () => {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count() + 1);

  const [n, setN] = createSignal(0);
  setInterval(() => setN(n() + 1), 1000);

  const suspended = createSuspense(
    () => count() < 5 || (count() > 10 && count() < 15),
    () => {
      createEffect(() => {
        console.log("count", count());
      });

      const nested = createSuspense(
        () => n() > 10 && n() < 15,
        () => {
          createEffect(() => {
            console.log("n", n());
          });

          return <div>nested {n()}</div>;
        },
      );

      return (
        <>
          <div>suspended {count()}</div>
          {nested}
        </>
      );
    },
  );

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>Counter component</h4>
        <p class="caption">it's very important...</p>
        <button class="btn" onClick={increment}>
          {count()}
        </button>
        <br />
        {suspended}
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
