import { type Component, createSignal } from "solid-js";
import { createInertOthers } from "../src/index.js";

const App: Component = () => {
  const [dialog, setDialog] = createSignal<HTMLElement>();
  const [open, setOpen] = createSignal(false);
  createInertOthers(dialog, open, { strategy: "both" });

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>Inert Others</h4>
        <button onClick={() => setOpen(o => !o)}>{open() ? "Close" : "Open"} layer</button>
        <p>Content outside the layer becomes aria-hidden and inert while it is open.</p>
      </div>
      <div ref={setDialog} role="dialog" class="wrapper-v">
        <p>The layer itself stays interactive.</p>
        <button onClick={() => setOpen(false)}>Dismiss</button>
      </div>
    </div>
  );
};

export default App;
