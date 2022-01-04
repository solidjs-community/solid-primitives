import createClipboard from "../src";
import { Component, createSignal } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  const [data, setData] = createSignal("");
  const [setClipboard, readClipboard] = createClipboard();

  const handleRead = async () => setData(await readClipboard());

  return (
    <div>
      <h1>Clipboard Example</h1>
      Click the hello message below:
      <br />
      <br />
      <div onClick={() => setClipboard("derp")} class="cliparea">
        Hello clipboard!
      </div>
      <br />
      <br />
      <h3>Read clipboard:</h3>
      <button onclick={handleRead}>Read Clipboard</button>
      <div>{JSON.stringify(data())}</div>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
