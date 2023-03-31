import { For } from "solid-js";
import { render } from "solid-js/web";
import { onCleanup } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import * as redux from "redux";
import "uno.css";

function useRedux(store, actions) {
  const [state, setState] = createStore(store.getState());
  const unsubscribe = store.subscribe(() => setState(reconcile(store.getState())));
  onCleanup(() => unsubscribe());
  return [state, mapActions(store, actions)];
}

function mapActions(store, actions) {
  const mapped = {};
  for (const key in actions) {
    mapped[key] = (...args) => store.dispatch(actions[key](...args));
  }
  return mapped;
}

let nextTodoId = 0;
const actions = {
  addTodo: (text: string) => ({ type: "ADD_TODO", id: ++nextTodoId, text } as const),
  toggleTodo: (id: number) => ({ type: "TOGGLE_TODO", id } as const),
};

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const reduxStore = redux.createStore((state: { todos: Todo[] } = { todos: [] }, action: Action) => {
  switch (action.type) {
    case "ADD_TODO":
      return {
        todos: [
          ...state.todos,
          {
            id: action.id,
            text: action.text,
            completed: false,
          },
        ],
      };
    case "TOGGLE_TODO":
      return {
        todos: state.todos.map(todo =>
          todo.id === action.id ? { ...todo, completed: !todo.completed } : todo,
        ),
      };
    default:
      return state;
  }
});

const App = () => {
  const [store, { addTodo, toggleTodo }] = useRedux(reduxStore, actions);

  let input!: HTMLInputElement;
  return (
    <>
      <div>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (!input.value.trim()) return;
            addTodo(input.value);
            input.value = "";
          }}
        >
          <input ref={input} />
          <button>Add Todo</button>
        </form>
      </div>
      <For each={store.todos}>
        {todo => {
          const { id, text } = todo;
          console.log("Create", text);
          return (
            <div>
              <input type="checkbox" checked={todo.completed} onchange={[toggleTodo, id]} />
              <span style={{ "text-decoration": todo.completed ? "line-through" : "none" }}>
                {text}
              </span>
            </div>
          );
        }}
      </For>
    </>
  );
};

render(App, document.getElementById("root")!);
