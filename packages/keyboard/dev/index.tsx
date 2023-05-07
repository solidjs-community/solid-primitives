/* @refresh reload */
import { Component, createSignal, For } from "solid-js";

import { useKeyDownList, createKeyHold, createShortcut } from "../src";

const MessageStack: Component<{
  messageTrigger: (cb: (message: string) => void) => void;
}> = props => {
  const [messages, setMessages] = createSignal<{ text: string }[]>([]);

  const addMessage = (message: string) => {
    const newNessage = { text: message };
    setMessages(p => [...p, newNessage]);
    setTimeout(() => setMessages(p => p.filter(m => m !== newNessage)), 3000);
  };
  props.messageTrigger(addMessage);

  return (
    <ul
      class="
        fixed right-4 top-4
        flex flex-col items-end
        "
    >
      <For each={messages()}>
        {({ text }) => <li class="border-b border-b-red-700 bg-red-500 p-2 text-white">{text}</li>}
      </For>
    </ul>
  );
};

const App: Component = () => {
  const pressedKeys = useKeyDownList();
  const pressing = createKeyHold("Shift");

  createShortcut(["Q"], () => {
    addMessage("Q pressed");
  });

  createShortcut(["Control", "P"], () => {
    addMessage("Control P pressed");
  });

  createShortcut(
    ["Control", "E", "R"],
    () => {
      addMessage("Control + E + R pressed");
    },
    {
      preventDefault: true,
      // requireReset: true
    },
  );

  let addMessage: (message: string) => void;

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>Is pressing Shift?</h4>
        <p>{pressing() ? "YES" : "NO"}</p>
      </div>
      <div class="wrapper-v">
        <h4>Pressed keys</h4>
        <p class="min-h-5">{pressedKeys().join(", ")}</p>
      </div>
      <MessageStack messageTrigger={cb => (addMessage = cb)} />
    </div>
  );
};

export default App;
