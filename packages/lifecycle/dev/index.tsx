import { children, createSignal, JSX, onMount } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
import { onElementConnect } from "../src";

// const App: Component = () => {
//   const [count, setCount] = createSignal(0);
//   const increment = () => setCount(count() + 1);

//   return (
//     <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
//       <div class="wrapper-v">
//         <h4>Counter component</h4>
//         <p class="caption">it's very important...</p>
//         <button class="btn" onClick={increment}>
//           {count()}
//         </button>
//       </div>
//     </div>
//   );
// };

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
