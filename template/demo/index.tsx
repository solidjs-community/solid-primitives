import type { Component } from "solid-js";
import { render } from "solid-js/web";
import { SimpleTestPrimitiveDemo } from "./demo";

import "uno.css";

const Demo: Component = () => {
  return (
    <div
      class="p-24 box-border w-full min-h-screen text-white flex justify-center flex-col items-center flex-wrap gap-12"
    >
      <SimpleTestPrimitiveDemo />
    </div>
  );
};

render(() => <Demo />, document.getElementById("root"));
