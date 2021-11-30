import { Component, createSignal, For, Index, Show } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  return (
    <div class="p-24 box-border w-full min-h-screen bg-black text-white flex justify-center items-center flex-wrap gap-12"></div>
  );
};

render(() => <App />, document.getElementById("root"));
