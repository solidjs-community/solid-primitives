import { $TRACK, For, createEffect, createSignal, untrack } from "solid-js";
import { render } from "solid-js/web";
import { TransitionGroup } from "solid-transition-group";
import { createImmutable, nMemos } from "../src";
import { PayloadAction, createSlice, configureStore } from "@reduxjs/toolkit";

import "uno.css";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

let nextTodoId = 0;

const todo = createSlice({
  name: "todos",
  initialState: [] as Todo[],
  reducers: {
    todoAdded(state, action: PayloadAction<string>) {
      state.push({
        id: `id:${nextTodoId++}`,
        text: action.payload,
        completed: false,
      });
    },
    todoToggled(state, action: PayloadAction<number>) {
      const todo = state.find(todo => todo.id === action.payload);
      if (todo) todo.completed = !todo.completed;
    },
    todoRemoved(state, action: PayloadAction<number>) {
      const index = state.findIndex(todo => todo.id === action.payload);
      if (index !== -1) state.splice(index, 1);
    },
  },
});

const App = () => {
  const store = configureStore({ reducer: todo.reducer });

  const addTodo = (text: string) => {
    store.dispatch(todo.actions.todoAdded(text));
  };

  const toggleTodo = (id: number) => {
    store.dispatch(todo.actions.todoToggled(id));
  };

  const removeTodo = (id: number) => {
    store.dispatch(todo.actions.todoRemoved(id));
  };

  const [state, setState] = createSignal(store.getState());
  store.subscribe(() => setState(store.getState()));

  const todos = createImmutable(state);

  // createEffect((p: typeof todos) => {
  //   todos[$TRACK];

  //   return untrack(() => {
  //     const copy = [...todos];

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

      <div class="mt-4 flex flex-col items-start space-y-2">
        <TransitionGroup name="v-group">
          <For each={(console.log("Reconcile"), todos)}>
            {todo => {
              const { id, text } = todo;
              return (
                <div class="group-item flex items-center rounded bg-gray-700 p-1">
                  <input type="checkbox" checked={todo.completed} onchange={() => toggleTodo(id)} />
                  <div
                    class="px-2"
                    style={{ "text-decoration": todo.completed ? "line-through" : "none" }}
                  >
                    {text}
                  </div>
                  <button onclick={() => removeTodo(id)}>x</button>
                </div>
              );
            }}
          </For>
        </TransitionGroup>
      </div>
    </div>
  );
};

render(App, document.getElementById("root")!);
