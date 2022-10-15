import { Component, createSignal, JSX } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
import { combineProps } from "../src";

const Button: Component<JSX.IntrinsicElements["button"]> = props => {
  const combined = combineProps(props, {
    style: {
      "border-color": "#e06767",
      "border-style": "solid",
      "border-radius": "8px"
    },
    class: "text-white",
    onClick: () => {
      console.log("Click is handled here too!");
    }
  });

  return <button {...combined}>{props.children}</button>;
};

const App: Component = () => {
  const [count, setCount] = createSignal(2);
  const increment = () => setCount(count() + 1);

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Counter component</h4>
        <p class="caption">With combined props</p>
        <Button
          onClick={increment}
          style={{ padding: "6px 12px", "border-width": count() + "px" }}
          class="bg-yellow-800"
        >
          {count()}
        </Button>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
