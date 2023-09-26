import { onMount, type Component } from "solid-js";
import { For } from "solid-js/web";
import { createMutable } from "../src/index.js";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const initial_todos: Todo[] = [
  {
    id: 0,
    text: "Learn Solid",
    completed: true,
  },
  {
    id: 1,
    text: "Learn about createMutable",
    completed: false,
  },
];
let last_todo_id = 0;

const App: Component = () => {
  const todos = createMutable(initial_todos);

  function addTodo(text: string) {
    todos.push({ id: ++last_todo_id, text, completed: false });
  }

  let input!: HTMLInputElement;
  return (
    <div class="flex min-h-screen flex-col items-center">
      <form
        class="flex space-x-2"
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
      <For each={todos}>
        {todo => (
          <div
            class="w-64 py-1 opacity-0"
            ref={el => {
              onMount(() => {
                el.animate(
                  [
                    { opacity: 0, transform: "translateX(-100%)" },
                    { opacity: 1, transform: "translateX(0)" },
                  ],
                  { duration: 500, fill: "forwards" },
                );
              });
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onchange={() => (todo.completed = !todo.completed)}
            />
            <span style={{ "text-decoration": todo.completed ? "line-through" : "none" }}>
              {todo.text}
            </span>
          </div>
        )}
      </For>
    </div>
  );
};

export default App;
