import { Component } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  return <div>Hello @solid-primitives/ui</div>;
};

render(() => <App />, document.getElementById("root")!);
