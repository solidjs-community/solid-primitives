import { Component } from "solid-js";

import { createScrollPosition } from "../src";

const App: Component = () => {
  const ws = createScrollPosition();

  let ref: HTMLDivElement | undefined;
  const es = createScrollPosition(() => ref);

  return (
    <>
      <div
        ref={e => (ref = e)}
        style="width: 100vw; overflow: scroll; height: 15rem; margin-bottom: 1rem; background-color: green"
      >
        <div style="width: 500vw; background-color:pink; height: 100vh"></div>
      </div>
      <div style="height: 500vh; width: 200vw; background-color: blue">&nbsp;</div>
      <div style="position: fixed; padding: 10px; color: white; top: 0px; background-color: gray">
        <b>Window scroll</b>: {Math.round(ws.x)} x {Math.round(ws.y)}
      </div>
      <div style="position: fixed; padding: 10px; color: white; top: 0px; right: 0; background-color: gray">
        <b>Element scroll</b>: {es.x !== null ? Math.round(es.x) : "null"} x{" "}
        {es.y !== null ? Math.round(es.y) : "null"}
      </div>
    </>
  );
};

export default App;
