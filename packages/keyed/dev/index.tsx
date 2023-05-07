import { Component } from "solid-js";
import { render } from "solid-js/web";
import Key from "./key";

const App: Component = () => {
  return (
    <div class="box-border min-h-screen w-full space-y-4 overflow-hidden bg-gray-800 p-24 text-white">
      <Key />
    </div>
  );
};
render(() => <App />, document.getElementById("root")!);
