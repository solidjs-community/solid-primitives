import { Component } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
import * as platform from "../src";

const App: Component = () => {
  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Platform:</h4>
        <ul>
          {Object.entries(platform).map(([name, value]) => {
            return (
              <li>
                <h5
                  style={{
                    color: value ? "green" : "red",
                  }}
                >
                  {name.substring(2)}
                </h5>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
