import { children, createSignal, JSX, onMount } from "solid-js";

import { onElementConnect } from "../src";

function Button() {
  const [count, setCount] = createSignal(1);
  const increment = () => setCount(count() + 1);

  let ref!: HTMLButtonElement;

  onMount(() => {
    console.log("onMount", ref.isConnected);

    onElementConnect(ref, () => {
      console.log("onConnect", ref.isConnected);
    });
  });

  return (
    <button ref={ref} type="button" onClick={increment}>
      {count()}
    </button>
  );
}

function App() {
  const r = children(() => <Button />);
  const [s, set] = createSignal<JSX.Element>();
  setTimeout(() => set(() => r as any as JSX.Element), 1000);
  return <>{s()}</>;
}

export default App;
