import { Component } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
import { createRemSize } from "../";

const App: Component = () => {
  const remSize = createRemSize();

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Rem size: {remSize()}</h4>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
