import { Component, createSignal, JSX } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
import { createControlledProps } from "../src";

const App: Component = () => {
  const [props, controls] = createControlledProps({
    bool: true,
    number: 0,
    string: "test"
  })

  return (<div class="p-24 box-border w-full min-h-screen overflow-hidden flex flex-col justify-center items-center">
    <h2>Props</h2>
    <ul>
      <li>bool: {props.bool() ? 'true' : 'false'}</li>
      <li>number: {props.number()}</li>
      <li>string: {props.string()}</li>
    </ul>
    <h2>Controls</h2>
    {controls}
  </div>);
};

render(() => <App />, document.getElementById("root")!);
