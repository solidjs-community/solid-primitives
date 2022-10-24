import { Component } from "solid-js";
import { render } from "solid-js/web";
import Key from "./key";
import "uno.css";

const App: Component = () => {
  return (
    <div class="p-24 box-border w-full min-h-screen space-y-4 bg-gray-800 text-white overflow-hidden">
      <Key />
    </div>
  );
};
render(() => <App />, document.getElementById("root")!);
