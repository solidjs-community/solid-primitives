/* @refresh reload */
import { Component } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
import { useKeyDownList, createKeyHold, createShortcut } from "../src";

const App: Component = () => {
  const [pressedKeys] = useKeyDownList();
  const pressing = createKeyHold("Alt");

  // createShortcut(["q", "w", "e"], () => {
  //   console.log("Shortcut pressed");
  // });

  createShortcut(
    ["Control", "E", "r"],
    () => {
      console.log("Modifier Shortcut pressed");
    },
    {
      preventDefault: true
      // requireReset: true
      // modifier: ["Control"]
    }
  );

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Is pressing Alt?</h4>
        <p>{pressing() ? "YES" : "NO"}</p>
      </div>
      <div class="wrapper-v">
        <h4>Pressed keys</h4>
        <p class="min-h-5">{pressedKeys().join(", ")}</p>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
