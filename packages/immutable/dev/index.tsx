import { Component, For, createSignal } from "solid-js";

import { TransitionGroup } from "solid-transition-group";
import { createImmutable } from "../src";
import { PayloadAction, createSlice, configureStore } from "@reduxjs/toolkit";

type Todo = {
  id: number;
  data: {
    text: string;
    completed: boolean;
  };
};

let nextTodoId = 0;

const todoArray = createSlice({
  name: "todos-arr",
  initialState: [] as Todo[],
  reducers: {
    todoAdded(state, action: PayloadAction<string>) {
      state.push({
        id: nextTodoId++,
        data: {
          text: action.payload,
          completed: false,
        },
      });
    },
    todoToggled(state, action: PayloadAction<number>) {
      const todo = state.find(todo => todo.id === action.payload);
      if (todo) todo.data.completed = !todo.data.completed;
    },
    todoRemoved(state, action: PayloadAction<number>) {
      const index = state.findIndex(todo => todo.id === action.payload);
      if (index !== -1) state.splice(index, 1);
    },
    changeRandom(state) {
      const todo = state[Math.floor(Math.random() * state.length)];
      if (todo) todo.data.text += "!";
    },
    shuffle(state) {
      for (let i = state.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state[i], state[j]] = [state[j]!, state[i]!];
      }
    },
  },
});

const todoObject = createSlice({
  name: "todos-obj",
  initialState: {} as Record<number, Todo>,
  reducers: {
    todoAdded(state, action: PayloadAction<string>) {
      const id = nextTodoId++;
      state[id] = {
        id,
        data: {
          text: action.payload,
          completed: false,
        },
      };
    },
    todoToggled(state, action: PayloadAction<number>) {
      const todo = state[action.payload];
      if (todo) todo.data.completed = !todo.data.completed;
    },
    todoRemoved(state, action: PayloadAction<number>) {
      delete state[action.payload];
    },
    changeRandom(state) {
      const todo = state[Math.floor(Math.random() * Object.keys(state).length)];
      if (todo) todo.data.text += "!";
    },
    shuffle(state) {
      const keys = Object.keys(state);
      for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // @ts-expect-error
        [state[keys[i]], state[keys[j]]] = [state[keys[j]], state[keys[i]]];
      }
    },
  },
});

const Todos: Component<{ slice: typeof todoArray | typeof todoObject }> = props => {
  const store = configureStore({ reducer: props.slice.reducer });

  const addTodo = (text: string) => {
    store.dispatch(props.slice.actions.todoAdded(text));
  };

  const toggleTodo = (id: number) => {
    store.dispatch(props.slice.actions.todoToggled(id));
  };

  const removeTodo = (id: number) => {
    store.dispatch(props.slice.actions.todoRemoved(id));
  };

  const [state, setState] = createSignal(store.getState());
  store.subscribe(() => setState(store.getState()));

  const todos = createImmutable(state, {
    // key: null,
    // merge: true,
  });

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

      <br />
      <button onclick={() => store.dispatch(props.slice.actions.changeRandom())}>
        Change random todo
      </button>
      <button onclick={() => store.dispatch(props.slice.actions.shuffle())}>Shuffle todos</button>

      <div class="mt-4 flex flex-col items-start space-y-2">
        <TransitionGroup name="v-group">
          <For each={Array.isArray(todos) ? todos : Object.values(todos)}>
            {todo => {
              const { id, data } = todo;
              return (
                <div class="group-item flex items-center rounded bg-gray-700 p-1">
                  <input type="checkbox" checked={data.completed} onchange={() => toggleTodo(id)} />
                  <div
                    class="px-2"
                    style={{ "text-decoration": data.completed ? "line-through" : "none" }}
                  >
                    {data.text}
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

export default function App() {
  return (
    <>
      <Todos slice={todoArray} />
      <Todos slice={todoObject} />
    </>
  );
}
