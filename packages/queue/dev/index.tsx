import { type Component, createSignal } from "solid-js";
import { For } from "@solidjs/web";
import { createQueue } from "../src/index.js";

const App: Component = () => {
  const [input, setInput] = createSignal("");
  const { queue, first, size, isEmpty, add, remove, clear } = createQueue<string>();

  const enqueue = () => {
    const val = input().trim();
    if (val) {
      add(val);
      setInput("");
    }
  };

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>Queue Primitive</h4>
        <p class="caption">FIFO queue — items added to back, removed from front</p>
        <div class="flex gap-2">
          <input
            class="input"
            placeholder="Add item..."
            value={input()}
            onInput={e => setInput(e.currentTarget.value)}
            onKeyDown={e => e.key === "Enter" && enqueue()}
          />
          <button class="btn" onClick={enqueue}>
            Enqueue
          </button>
        </div>
        <div class="flex gap-2">
          <button class="btn" onClick={remove} disabled={isEmpty()}>
            Dequeue
          </button>
          <button class="btn" onClick={clear} disabled={isEmpty()}>
            Clear
          </button>
        </div>
        <p>
          Size: <strong>{size()}</strong> | Next up: <strong>{first() ?? "—"}</strong>
        </p>
        <ul>
          <For each={queue()}>{item => <li>{item}</li>}</For>
        </ul>
      </div>
    </div>
  );
};

export default App;
