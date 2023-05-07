import { pan } from "../src";
import { Component, createSignal, onMount } from "solid-js";

pan;

const App: Component = () => {
  const [data, setData] = createSignal(0);
  const [data2, setData2] = createSignal("");
  let ref!: HTMLDivElement;

  onMount(() => {
    ref.addEventListener(
      "pointermove",
      e => {
        console.log(e.x, e.y);
        setData2(`${e.x}, ${e.y}`);
      },
      { passive: true },
    );
    // ref.addEventListener("lostpointercapture", e => {
    //   console.log("lost");
    //   setData(p => p + 1);
    // });
    // ref.addEventListener("gotpointercapture", e => {
    //   console.log("got");
    // });
  });

  return (
    <div
      ref={ref}
      // use:pan={{
      //   callback: ({ x, y }) => {
      //     setData(`${x}, ${y}`);
      //     console.log(x, y);
      //   }
      // }}
      class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-12 bg-gray-800 text-white"
    >
      <div class="h-36 w-36 rounded-3xl bg-orange-400">
        {data()}
        <br />
        {data2()}
      </div>
    </div>
  );
};

export default App;
