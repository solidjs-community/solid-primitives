import { Component, createSignal, Show, createEffect } from "solid-js";

import RAF from "./raf";

const App: Component = () => {
  return (
    <div>
      <h1>Target FPS Dev Test</h1>
      <hr />
      <RAF targetFPS={1} />
      <RAF targetFPS={15} />
      <RAF targetFPS={24} />
      <RAF targetFPS={30} />
      <RAF targetFPS={44} />
      <RAF targetFPS={60} />
      <RAF targetFPS={90} />
      <RAF targetFPS={120} />
      <RAF targetFPS={130} />
      <RAF targetFPS={140} />
      <RAF targetFPS={240} />
      <RAF targetFPS={300} />
      <RAF targetFPS={Infinity} />
      <RAF />
    </div>
  );
};

export default App;
