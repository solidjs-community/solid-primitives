/* @refresh reload */
import { Component, createSignal } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
import { makeKeyHoldListener } from "../src";

const App: Component = () => {
  const [pressing, setPressing] = createSignal(false);

  makeKeyHoldListener("altKey", setPressing, {
    preventDefault: true
  });

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Is pressing Alt?</h4>
        <p>{pressing() ? "YES" : "NO"}</p>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
