import { children, createSignal, JSX, onMount } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
import { onElementConnect } from "../src";

function App() {
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

render(() => {
  const r = children(() => <App />);
  const [s, set] = createSignal<JSX.Element>();
  setTimeout(() => set(() => r), 1000);
  return s;
}, document.getElementById("root")!);
