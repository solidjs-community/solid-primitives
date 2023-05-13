import { Component, JSX, createSignal } from "solid-js";
import { render } from "solid-js/web";

import { createUndoHistory } from "../src";

const Button = (props: {
  onClick: () => void;
  onRightClick: () => void;
  children: JSX.Element;
}) => (
  <button
    class="btn"
    onClick={() => props.onClick()}
    onContextMenu={e => {
      e.preventDefault();
      props.onRightClick();
    }}
  >
    {props.children}
  </button>
);

const App: Component = () => {
  const [a, setA] = createSignal(0);
  const [b, setB] = createSignal(0);

  const history = createUndoHistory(
    // createMultiHistorySource(
    (
      [
        ["a", a, setA],
        ["b", b, setB],
      ] as const
    ).map(([name, get, set]) => () => {
      const v = get();
      return () => {
        console.log("set", name, v);
        set(v);
      };
    }),
    // ),
  );

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>Counter component</h4>
        <p class="caption">it's very important...</p>
        <div class="flex flex-row space-x-4">
          <Button onClick={() => setA(p => p + 1)} onRightClick={() => setA(p => p - 1)}>
            A: {a()}
          </Button>
          <Button onClick={() => setB(p => p + 1)} onRightClick={() => setB(p => p - 1)}>
            B: {b()}
          </Button>
        </div>
      </div>
      <div class="wrapper-v">
        <h4>History</h4>
        <button class="btn" disabled={!history.canUndo()} onClick={history.undo}>
          Undo
        </button>
        <button class="btn" disabled={!history.canRedo()} onClick={history.redo}>
          Redo
        </button>
        {/* <button class="btn" onClick={history.clear}>
          Clear
        </button> */}
      </div>
    </div>
  );
};

export default App;
