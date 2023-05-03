import { Component, createSignal } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
import { createUndoHistory } from "../src";

const App: Component = () => {
  const [count, setCount] = createSignal(0);

  const history = createUndoHistory(() => {
    const v = count();
    return () => setCount(v);
  });

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>Counter component</h4>
        <p class="caption">it's very important...</p>
        <button
          class="btn"
          onClick={() => setCount(count() + 1)}
          onContextMenu={e => {
            e.preventDefault();
            setCount(count() - 1);
          }}
        >
          {count()}
        </button>
      </div>
      <div class="wrapper-v">
        <h4>History</h4>
        <button class="btn" disabled={!history.getCanUndo()} onClick={history.undo}>
          Undo
        </button>
        <button class="btn" disabled={!history.getCanRedo()} onClick={history.redo}>
          Redo
        </button>
        {/* <button class="btn" onClick={history.clear}>
          Clear
        </button> */}
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
