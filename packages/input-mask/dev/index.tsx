import { Component } from "solid-js";
import { render } from "solid-js/web";
import { createInputMask } from '../src';

const App: Component = () => {
  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Input Mask</h4>
        <label for="isodate">ISO Date:</label>
        <input type="text" id="isodate" placeholder="YYYY-MM-DD" onInput={createInputMask('9999-99-99')} />
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
