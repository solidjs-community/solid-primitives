import { Component, createSignal, Show } from "solid-js";
import { render } from "solid-js/web";
import createRAF from "../src";

const targetFPS = 60;
const targetRuns = 500;

const App: Component = () => {
  const [sumA, setSumA] = createSignal(0);
  let runsA = -1;
  let lastA = 0;

  // A: new createRAF
  const [runningA, startA, stopA] = createRAF(
    () => {
      runsA++;
      if (runsA) {
        const ms = performance.now() - lastA;
        setSumA(p => p + ms);
      }
      lastA = performance.now();
      if (runsA === targetRuns) handleStopA();
    },
    targetFPS,
    false
  );

  const handleStopA = () => {
    console.log("A: average ms", sumA() / runsA, "runs", runsA, "fps", 1000 / (sumA() / runsA));
    setSumA(0);
    runsA = -1;
    lastA = 0;
    stopA();
  };

  // const [sumB, setSumB] = createSignal(0);
  // let runsB = -1;
  // let lastB = 0;

  // // B: old createRAF
  // const [runningB, startB, stopB] = oldRAF(
  //   () => {
  //     runsB++;
  //     if (runsB) {
  //       const ms = performance.now() - lastB;
  //       setSumB(p => p + ms);
  //     }
  //     lastB = performance.now();
  //     if (runsB === targetRuns) handleStopB();
  //   },
  //   targetFPS,
  //   false
  // );

  // const handleStopB = () => {
  //   console.log("B: average ms", sumB() / runsB, "runs", runsB, "fps", 1000 / (sumB() / runsB));
  //   setSumB(0);
  //   runsB = -1;
  //   lastB = 0;
  //   stopB();
  // };

  return (
    <>
      <h1>A: FPS: {1000 / (sumA() / runsA)}</h1>
      <Show when={runningA()} fallback="Stopped">
        Running
      </Show>
      <br />
      <br />
      <button onClick={startA}>Start</button>
      <button onClick={handleStopA}>Stop</button>
      {/* <h1>B: MS is {1000 / (sumB() / runsB)}</h1>
      <Show when={runningB()} fallback="Stopped">
        Running
      </Show>
      <br />
      <br />
      <button onClick={startB}>Start</button>
      <button onClick={handleStopB}>Stop</button>
      <br />
      <br />
      <button
        onClick={() => {
          startA();
          startB();
        }}
      >
        Start Both
      </button> */}
    </>
  );
};

render(() => <App />, document.getElementById("root")!);
