import { Component, createSignal } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

import createWebWorker from "../src/index";

const App: Component = () => {
  const [worker] = createWebWorker(
    `export function add(a, b) {
      return a + b;
    }`
  );
  const [values, setValues] = createSignal([1, 1]);
  const [result, setResult] = createSignal(0);
  const calculate = async () => setResult(await worker.add(...values()));
  calculate();
  return (
    <div class="p-24 box-border w-full min-h-screen text-white flex justify-center items-center flex-wrap gap-12">
      <h3>Basic Web Worker Test</h3>
      <input
        type="number"
        onInput={evt => {
          setValues(vals => [parseInt(evt.currentTarget.value), vals[1]]);
          calculate();
        }}
        value={values()[0]}
      />
      +
      <input
        type="number"
        onInput={evt => {
          setValues(vals => [vals[0], parseInt(evt.currentTarget.value)]);
          calculate();
        }}
        value={values()[1]}
      />
      = &nbsp; {result()}
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
