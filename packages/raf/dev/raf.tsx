import { createSignal, Show } from "solid-js";

import createRAF from "../src";

const targetRuns = 500;

export default props => {
  const [sum, setSum] = createSignal(0);
  let runs = -1;
  let last = 0;

  const [running, start, stop] = createRAF(() => {
    runs++;
    if (runs) {
      const ms = performance.now() - last;
      setSum(p => p + ms);
    }
    last = performance.now();
    if (runs === targetRuns) handleStop();
  }, props.targetFPS);

  const [avgMs, setAvgMs] = createSignal(0);
  const [avgFps, setAvgFps] = createSignal(0);
  const [numRuns, setNumRuns] = createSignal(0);

  const handleStop = () => {
    setAvgMs(sum() / runs);
    setAvgFps(1000 / (sum() / runs));
    setSum(0);
    setNumRuns(runs);
    runs = -1;
    last = 0;
    stop();
  };

  return (
    <div>
      <span>
        <button onClick={start}>Start</button> <button onClick={handleStop}>Stop</button>{" "}
      </span>
      <span>
        <Show when={running()} fallback=" | Stopped ">
          | Running{" "}
        </Show>
        <span>
          | Target FPS: {props.targetFPS}| Runs: {numRuns()}| AVG Ms: {avgMs()}| AVG FPS {avgFps()}|
          Current FPS: {1000 / (sum() / runs)}
        </span>
      </span>
    </div>
  );
};
