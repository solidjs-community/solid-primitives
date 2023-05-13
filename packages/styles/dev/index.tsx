import { Component } from "solid-js";

import { createRemSize } from "../src";

const App: Component = () => {
  const remSize = createRemSize();

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>Rem size: {remSize()}</h4>
      </div>
    </div>
  );
};

export default App;
