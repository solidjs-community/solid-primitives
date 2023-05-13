import { Component, createSignal, onMount } from "solid-js";

import { createWorker, createWorkerPool, createSignaledWorker } from "../src/index";

const App: Component = () => {
  // Worker
  const [values, setValues] = createSignal([1, 1]);
  const [result, setResult] = createSignal(0);
  const [worker] = createWorker(
    function add(a, b) {
      return a + b;
    },
    function subtract(a, b) {
      return a - b;
    },
  );
  const calculate = async () => setResult(await worker.add(...values()));

  // Pool
  const [poolValues, setPoolValues] = createSignal([1, 1]);
  const [poolResult, setPoolResult] = createSignal(0);
  const [pool] = createWorkerPool(
    4,
    function add(a, b) {
      return a + b;
    },
    function subtract(a, b) {
      return a - b;
    },
  );
  const calculatePooled = async () => setPoolResult(await pool.add(...poolValues()));
  calculate();
  calculatePooled();

  // Signal
  const [input, setInput] = createSignal([1, 1]);
  const [output, setOutput] = createSignal([1, 1]);
  createSignaledWorker({
    input,
    output: setOutput,
    func: function add([a, b]) {
      return a + b;
    },
  });

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center gap-12 p-24 text-white">
      <div class="flex w-full items-center justify-between">
        <h3 class="w-2/6">Basic Web Worker Test</h3>
        <input
          type="number"
          class="w-30 p-3 text-2xl"
          onInput={evt => {
            setValues(vals => [parseInt(evt.currentTarget.value), vals[1]]);
            calculate();
          }}
          value={values()[0]}
        />
        +
        <input
          type="number"
          class="w-30 p-3 text-2xl"
          onInput={evt => {
            setValues(vals => [vals[0], parseInt(evt.currentTarget.value)]);
            calculate();
          }}
          value={values()[1]}
        />
        = <div class="text-2xl">{result()}</div>
      </div>
      <div class="flex w-full items-center justify-between">
        <h3 class="w-2/6">Pool Worker Test</h3>
        <input
          type="number"
          class="w-30 p-3 text-2xl"
          onInput={evt => {
            setPoolValues(vals => [parseInt(evt.currentTarget.value), vals[1]]);
            calculatePooled();
          }}
          value={poolValues()[0]}
        />
        +
        <input
          type="number"
          class="w-30 p-3 text-2xl"
          onInput={evt => {
            setPoolValues(vals => [vals[0], parseInt(evt.currentTarget.value)]);
            calculatePooled();
          }}
          value={poolValues()[1]}
        />
        = <div class="text-2xl">{poolResult()}</div>
      </div>
      <div class="flex w-full items-center justify-between">
        <h3 class="w-2/6">Signal Worker Test</h3>
        <input
          type="number"
          class="w-30 p-3 text-2xl"
          onInput={evt => {
            setInput(vals => [parseInt(evt.currentTarget.value), vals[1]]);
          }}
          value={input()[0]}
        />
        +
        <input
          type="number"
          class="w-30 p-3 text-2xl"
          onInput={evt => {
            setInput(vals => [vals[0], parseInt(evt.currentTarget.value)]);
          }}
          value={input()[1]}
        />
        = <div class="text-2xl">{output()}</div>
      </div>
    </div>
  );
};

export default function () {
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));
  return <>{mounted() && <App />}</>;
}
