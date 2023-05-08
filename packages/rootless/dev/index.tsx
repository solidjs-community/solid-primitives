import { Accessor, Component, For, batch, createSignal } from "solid-js";
import { StoreSetter, createStore, unwrap } from "solid-js/store";
import { createRootPool } from "../src";

type TodoItem = { title: string; done: boolean };

const App: Component = () => {
  const [newTitle, setTitle] = createSignal("");
  const [todos, setTodos] = createStore<TodoItem[]>([]);

  const addTodo = (e: SubmitEvent) => {
    e.preventDefault();
    batch(() => {
      setTodos(todos.length, {
        title: newTitle(),
        done: false,
      });
      setTitle("");
    });
  };

  function removeTodo(todo: TodoItem) {
    todo = unwrap(todo);
    setTodos(p => p.filter(t => t !== todo));
  }

  function updateTodo(todo: TodoItem, setter: StoreSetter<TodoItem, [number]>) {
    todo = unwrap(todo);
    setTodos(t => t === todo, setter);
  }

  const useTodo = createRootPool((todo: Accessor<TodoItem>) => (
    <div ref={el => console.log("todo el created", el)}>
      <input
        type="checkbox"
        checked={todo().done}
        onChange={e => updateTodo(todo(), { done: e.currentTarget.checked })}
      />
      <input
        type="text"
        value={todo().title}
        onChange={e => updateTodo(todo(), { title: e.currentTarget.value })}
      />
      <button onClick={() => removeTodo(todo())}>x</button>
    </div>
  ));

  return (
    <>
      <h3>Simple Todos Example</h3>
      <form onSubmit={addTodo}>
        <input
          placeholder="enter todo and click +"
          required
          value={newTitle()}
          onInput={e => setTitle(e.currentTarget.value)}
        />
        <button>+</button>
      </form>
      <For each={todos}>{todo => useTodo(todo)}</For>
    </>
  );
};

export default App;
