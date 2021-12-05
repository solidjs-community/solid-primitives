import type { Component } from "solid-js";
import createPrimitiveTemplate from '../src/index';
import "uno.css";

export const SimpleTestPrimitiveDemo: Component = () => {
  const [get, set] = createPrimitiveTemplate('Hello World');
  return (
    <div class="backdrop-filter text-xl rounded-lg backdrop-blur-3xl backdrop-saturate-150 bg-black bg-opacity-40 p-10">
      Enter a phrase: <input
        class="p-3 ml-3 text-xl rounded"
        value={get()}
        onInput={(evt) => set(evt.currentTarget.value)} 
        type="text"
      />
    </div>
  );
};
