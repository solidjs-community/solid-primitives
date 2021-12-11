import type { Component } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center">
      Apply your primitive test here for testing.
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
