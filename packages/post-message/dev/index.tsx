import { type Component, createSignal, onCleanup } from "solid-js";
import { For } from "@solidjs/web";
import { createPostMessage } from "../src/index.js";

const isText = (d: unknown): d is string => typeof d === "string";

const App: Component = () => {
  const { port1, port2 } = new MessageChannel();
  onCleanup(() => {
    port1.close();
    port2.close();
  });
  const a = createPostMessage<string, string>({ target: port1, validate: isText, channel: "chat" });
  const b = createPostMessage<string, string>({ target: port2, validate: isText, channel: "chat" });
  const [log, setLog] = createSignal<string[]>([]);
  b.onMessage(msg => setLog(l => [...l, msg]));
  let n = 0;

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <h4>post-message</h4>
      <button class="btn" onClick={() => a.send(`message ${++n}`)}>
        Send from port 1
      </button>
      <p>Latest on port 2: {b.message() ?? "—"}</p>
      <ul>
        <For each={log()}>{msg => <li>{msg}</li>}</For>
      </ul>
    </div>
  );
};

export default App;
