import type { Component } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  return (
    <div class="p-24 box-border w-full min-h-screen text-white flex justify-center items-center flex-wrap gap-12">
      Apply your primitive test here for testing.
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
