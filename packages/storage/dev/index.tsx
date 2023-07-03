import { Component, createSignal, untrack } from "solid-js";
import { makePersisted } from "../src";

const App: Component = () => {
  const [value, setValue] = makePersisted(createSignal("initial value"), { name: "value" });

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>Persisted signal in localStorage</h4>
        <input value={untrack(value)} onChange={ev => setValue(ev.currentTarget.value)} />
        <p>Try to change the value and reload the page - it is persisted in localStorage.</p>
      </div>
    </div>
  );
};

export default App;
