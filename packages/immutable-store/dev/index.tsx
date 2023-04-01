import { $TRACK, For, createEffect, createSignal, untrack } from "solid-js";
import { render } from "solid-js/web";
import { onCleanup } from "solid-js";
// import { createStore, reconcile } from "solid-js/store";
import * as redux from "redux";
import { createImmutable, nMemos } from "../src";
import "uno.css";
import { TransitionGroup } from "solid-transition-group";

function useRedux<T, A>(store: redux.Store<T, A>, actions): [T, typeof actions] {
  const [state, setState] = createSignal(store.getState());
  onCleanup(store.subscribe(() => setState(store.getState())));
  return [createImmutable(state), mapActions(store, actions)];
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

  // createEffect((p: typeof store.todos) => {
  //   const arr = store.todos;
  //   arr[$TRACK];

  //   return untrack(() => {
  //     const copy = [...arr];

  //     console.group("Effect");
  //     let i = 0;
  //     for (; i < p.length; i++) {
  //       console.log(i, p[i] === copy[i]);
  //     }
  //     for (; i < copy.length; i++) {
  //       console.log(i, "new", copy[i]);
  //     }
  //     console.groupEnd();
  //     return copy;
  //   });
  // }, []);

  let input!: HTMLInputElement;
  return (
    <div class="m-24">
      <p>There are {nMemos()} memos</p>

      <h1>Todo List</h1>

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
      <TransitionGroup name="v-group">
        <For each={(console.log("Reconcile"), store.todos)}>
          {todo => {
            const { id, text } = todo;
            return (
              <div class="group-item">
                <input type="checkbox" checked={todo.completed} onchange={() => toggleTodo(id)} />
                <span style={{ "text-decoration": todo.completed ? "line-through" : "none" }}>
                  {text}_{id}
                </span>
              </div>
            );
          }}
        </For>
      </TransitionGroup>
    </div>
  );
};

render(App, document.getElementById("root")!);
