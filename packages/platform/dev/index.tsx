import { Component } from "solid-js";

import * as platform from "../src";

const App: Component = () => {
  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
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

export default App;
