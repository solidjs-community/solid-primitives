import { Component, For, JSX, onMount } from "solid-js";
import { MachineStates, createMachine } from "../src";
import { createStore } from "solid-js/store";

type Todo = {
  title: string;
  done: boolean;
};

type TodoProps = {
  todo: Todo;
  onRemove: () => void;
  onEdit: (title: string) => void;
  onToggle: () => void;
};

const todo_states: MachineStates<{
  Reading: {
    input: TodoProps;
    value: JSX.Element;
  };
  Editing: {
    input: TodoProps;
    value: JSX.Element;
  };
}> = {
  Reading(props, next) {
    const { todo, onRemove, onToggle } = props;

    return (
      <>
        <input type="checkbox" checked={todo.done} onChange={onToggle} />
        <div
          class="px-2"
          style={{ "text-decoration": todo.done ? "line-through" : "none" }}
          onDblClick={() => next.Editing(props)}
        >
          {todo.title}
        </div>
        <button onClick={() => onRemove()}>x</button>
      </>
    );
  },
  Editing(props, next) {
    const { todo, onEdit } = props;

    function commit() {
      onEdit(input.value);
      next.Reading(props);
    }

    let input!: HTMLInputElement;
    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          commit();
        }}
      >
        <input
          ref={el => {
            input = el;
            onMount(() => el.focus());
          }}
          type="text"
          value={todo.title}
          onBlur={commit}
        />
      </form>
    );
  },
};

function DisplayTodo(props: TodoProps) {
  const state = createMachine({
    states: todo_states,
    initial: {
      type: "Reading",
      input: props,
    },
  });

  return (
    <div class="group-item flex items-center rounded border border-gray-600 bg-gray-800 px-3 py-2">
      {state.value}
    </div>
  );
}

const App: Component = () => {
  const [todos, setTodos] = createStore<Todo[]>([
    { title: "Learn Solid", done: false },
    { title: "Learn JSX", done: false },
    { title: "Build a Todo app", done: false },
  ]);

  function addTodo(title: string) {
    setTodos(todos.length, { title, done: false });
  }
  function removeTodo(index: number) {
    setTodos(p => {
      const copy = p.slice();
      copy.splice(index, 1);
      return copy;
    });
  }
  function toggleTodo(index: number) {
    setTodos(index, "done", p => !p);
  }
  function editTodo(index: number, title: string) {
    setTodos(index, "title", title);
  }

  let input!: HTMLInputElement;
  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <div class="m-24">
          <div>
            <form
              class="flex items-center space-x-2"
              onSubmit={e => {
                e.preventDefault();
                if (!input.value.trim()) return;
                addTodo(input.value);
                input.value = "";
              }}
            >
              <input class="w-64" placeholder="What needs to be done?" ref={input} />
              <button>Add Todo</button>
            </form>
          </div>

          <div class="mt-4 flex flex-col items-start space-y-2">
            <For each={todos}>
              {(todo, i) => (
                <DisplayTodo
                  todo={todo}
                  onRemove={() => removeTodo(i())}
                  onToggle={() => toggleTodo(i())}
                  onEdit={title => editTodo(i(), title)}
                />
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
