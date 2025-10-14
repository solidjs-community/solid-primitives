import { type Component } from "solid-js";

import * as platform from "../src/index.js";

const App: Component = () => {
  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>Platform:</h4>
        <ul>
          {Object.entries(platform).map(([name, value]) => (
            <li>
              <h5
                class={value ? "text-green-500" : "text-red-500"}
                textContent={name.substring(2)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
