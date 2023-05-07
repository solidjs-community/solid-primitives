import { Component, Switch, Match } from "solid-js";

import { createIdleTimer } from "../src";

const divStyle = {
  background: "black",
  color: "white",
  display: "grid",
  "place-content": "center",
  height: "100vh",
  width: "100vw",
  "max-height": "100%",
  "max-width": "100%",
};

const App: Component = () => {
  const { isIdle, isPrompted, start, stop, reset } = createIdleTimer({
    onActive: evt => console.log("this event re-activated me ⚡ => ", evt),
    onIdle: evt => console.log("last event before I went to sleep 😴 => ", evt),
    idleTimeout: 3_000,
    promptTimeout: 2_000,
  });
  return (
    <Switch
      fallback={
        <>
          <h1>Super sensitive data: ******</h1>
          <button onClick={stop}>stop</button>
          <button onClick={start}>start</button>
          <button onClick={reset}>reset</button>
        </>
      }
    >
      <Match when={isIdle()}>
        <div style={divStyle}>Hiding the data...</div>
      </Match>
      <Match when={isPrompted()}>
        <div style={divStyle}>
          <p>Are you still there?</p>
          <button onClick={reset}>yup</button>
        </div>
      </Match>
    </Switch>
  );
};

export default App;
