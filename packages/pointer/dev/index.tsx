import {
  createPointerListener,
  createPointerPosition,
  getPositionToElement,
  pointerPosition,
  pointerHover
} from "../src";
import { Component, createSignal } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
pointerPosition;
pointerHover;

const App: Component = () => {
  const [poz, setPoz] = createSignal({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = createSignal(false);

  let ref!: HTMLDivElement;

  // createPointerListener({
  //   // target: () => ref,
  //   // pointerTypes: ["touch"],
  //   onStart: e => console.log("start", e.x, e.y),
  //   onMove: e => setPoz({ x: e.x, y: e.y }),
  //   onend: e => console.log("end", e.x, e.y),
  //   onLostCapture: e => console.log("lost")
  // });

  const state = createPointerPosition();

  return (
    <div
      class="p-24 box-border w-full min-h-150vh flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white"
      classList={{
        "!bg-cyan-700": isHovering()
      }}
      style={{ "touch-action": "none" }}
    >
      <div
        ref={ref}
        class="wrapper-v"
        // use:pointerPosition={(poz, el) => console.log(getPositionToElement(poz, el))}
        use:pointerHover={setIsHovering}
      >
        <p class="caption">x = {Math.round(poz().x)}</p>
        <p class="caption">y = {Math.round(poz().y)}</p>
        <p class="caption">{isHovering() ? "hovering" : "not hovering"}</p>
      </div>
      <div ref={ref} class="wrapper-v">
        <p class="break-words max-w-80vw">{JSON.stringify(state())}</p>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
