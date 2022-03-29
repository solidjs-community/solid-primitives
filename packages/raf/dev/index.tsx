import { Component } from "solid-js";
import { render } from "solid-js/web";
import RAF from "./raf";

const App: Component = () => {
  return (
    <div>
      <h1>Target FPS Dev Test</h1>
      <hr />
      <RAF />
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
