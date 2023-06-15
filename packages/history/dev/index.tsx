import { For } from "solid-js";
import { createStore, produce, reconcile, unwrap } from "solid-js/store";
import { captureStoreUpdates } from "@solid-primitives/deep";
import { createUndoHistory } from "../src";

type TodoItem = { title: string; done: boolean; id: number };

let LastId = 0;

const App = () => {
  const [state, setState] = createStore({
    new: { title: "" },
    todos: [] as TodoItem[],
  });

  const getDelta = captureStoreUpdates(state);

  let clonedState: any;

  const history = createUndoHistory(() => {
    const delta = getDelta();
    if (!delta.length) return;

    for (const { path, value } of delta) {
      if (path.length === 0) {
        clonedState = structuredClone(unwrap(value));
      } else {
        let target = { ...clonedState };
        for (const key of path.slice(0, -1)) {
          target[key] = Array.isArray(target[key]) ? [...target[key]] : { ...target[key] };
          target = target[key];
        }
        target[path[path.length - 1]!] = structuredClone(unwrap(value));
        clonedState = target;
      }
    }

    const snapshot = clonedState;
    return () => setState(reconcile(snapshot));
  });

  return (
    <div class="my-32 grid gap-8" style={`grid-template-columns: 1fr 1fr`}>
      <div class="ml-auto">
        <h3>Simple Todos Example</h3>
        <form
          onSubmit={e => {
            e.preventDefault();
            setState(
              produce(proxy => {
                proxy.todos.push({
                  title: proxy.new.title,
                  done: false,
                  id: LastId++,
                });
                proxy.new.title = "";
              }),
            );
          }}
          class="flex"
        >
          <input
            placeholder="enter todo and click +"
            required
            value={state.new.title}
            onChange={e => setState("new", "title", e.currentTarget.value)}
          />
          <button>+</button>
        </form>
        <For each={state.todos}>
          {(todo, i) => (
            <div class="mt-4 flex">
              <input
                type="checkbox"
                checked={todo.done}
                onChange={e => setState("todos", i(), "done", e.currentTarget.checked)}
              />
              <input
                type="text"
                value={todo.title}
                onChange={e => setState("todos", i(), "title", e.currentTarget.value)}
              />
              <button
                onClick={() =>
                  setState(
                    "todos",
                    produce(todos => todos.splice(i(), 1)),
                  )
                }
              >
                x
              </button>
            </div>
          )}
        </For>
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
