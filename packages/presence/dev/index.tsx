import { Component, Show, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { createPresence } from "../src";

import style from './style.module.css';

const DemoOne = () => {
  const [show, setShow] = createSignal(false);
  const state = createPresence(show, { duration: 300, initialRun: true });
  const isMounted = createMemo(() => state() !== "exited");

  return (
    <div>
      <h2>Demo With Styles</h2>
      <Show when={isMounted()}>
        <div
          style={{
            transition: "all .3s linear",

            ...(state() === "initial" && {
              opacity: "0",
              transform: "translateX(-25px)",
              "background-color": "red",
            }),

            ...(state() === "entering" && {
              opacity: "1",
              transform: "translateX(0)",
              "background-color": "green",
            }),

            ...(state() === "exiting" && {
              opacity: "0",
              transform: "translateX(25px)",
              "background-color": "blue",
            }),
          }}
        >
          Hello World!
        </div>
      </Show>
      <div>
        <button style={{ "font-size": "15px", padding: "5px" }} onClick={() => setShow(p => !p)}>
          {show() ? "Hide" : "Show"}
        </button>
        {` `}
        <span>State: {state()}</span>
      </div>
    </div>
  );
};

const DemoTwo = () => {
  const [show, setShow] = createSignal(false);
  const state = createPresence(show, { duration: 500, initialRun: true });
  const isMounted = createMemo(() => state() !== "exited");

  return (
    <div>
      <h2>Demo With Classes</h2>
      <Show when={isMounted()}>
        <div
          classList={{
            [style.hidden]: state() === 'initial',
            [style.fadein]: state() === 'entering',
            [style.fadeout]: state() === 'exiting',
          }}
        >
          Hello World!
        </div>
      </Show>
      <div>
        <button style={{ "font-size": "15px", padding: "5px" }} onClick={() => setShow(p => !p)}>
          {show() ? "Hide" : "Show"}
        </button>
      </div>
      <div>{state()}</div>
    </div>
  );
};

const App: Component<{}> = props => {
  return (
    <div>
      <DemoOne />
      <DemoTwo />
    </div>
  );
};

export default App;
