import type { Component } from "solid-js";
import { render } from "solid-js/web";
import { createConnectivity } from "../src";
import "uno.css";

const App: Component = () => {
  const onLine = createConnectivity();
  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center">
      You are currently: {onLine() ? <strong>online</strong> : <strong>offline</strong>} (try
      toggling your network state in dev tools!)
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
