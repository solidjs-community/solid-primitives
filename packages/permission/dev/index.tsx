import { Component } from "solid-js";
import { render } from "solid-js/web";
import { createPermission } from "../src";
import "uno.css";

const App: Component = () => {
  const micPermission = createPermission("microphone");
  const camPermission = createPermission("camera");

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Microphone permission:</h4>
        <p>{micPermission}</p>
        <h4>Camera permission:</h4>
        <p>{camPermission}</p>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
