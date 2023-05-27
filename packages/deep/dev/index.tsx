import { For, createMemo } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { captureStoreUpdates } from "../src";

type TodoItem = { title: string; done: boolean };

const App = () => {
  const [state, setState] = createStore({
    new: { title: "" },
    todos: [] as TodoItem[],
  });

  const updates = createMemo(captureStoreUpdates(state));

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
            onInput={e => setState("new", "title", e.currentTarget.value)}
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
      <div>
        <h3>Latest updates:</h3>
        <ol>
          {updates().map(update => (
            <li class="mt-2 w-fit rounded bg-slate-600 p-2">
              <div>Path: {JSON.stringify(update.path, null, 2)}</div>
              <div>
                Value: <pre>{JSON.stringify(update.value, null, 2)}</pre>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default App;
