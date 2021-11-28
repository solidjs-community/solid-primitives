import {
  createMousePosition,
  createMouseOnScreen,
  createRelativeToElement,
  createMouseInElement
} from "../src";
import { Component, createSignal } from "solid-js";
import { render } from "solid-js/web";
import createRaf from "@solid-primitives/raf";
import { lerp, objectOmit } from "./utils";
import "uno.css";
import { DisplayRecord } from "./components";

const App: Component = () => {
  const mouse = createMousePosition();
  const [pos, setPos] = createSignal({ x: 0, y: 0, elX: 0, elY: 0 });
  const onScreen = createMouseOnScreen(false);

  let ref!: HTMLDivElement;
  const relative = createRelativeToElement(() => ref, mouse.x, mouse.y);
  const { x: hoverX, y: hoverY, isInside: isHovering } = createMouseInElement(() => ref);

  createRaf(() => {
    setPos(p => ({
      x: lerp(p.x, mouse.x(), 0.1),
      y: lerp(p.y, mouse.y(), 0.1),
      elX: lerp(p.elX, relative.x(), 0.2),
      elY: lerp(p.elY, relative.y(), 0.2)
    }));
  });

  return (
    <div class="box-border w-full h-screen overflow-hidden bg-indigo-800 text-white">
      <div
        class="w-36 h-36 bg-violet-700 rounded-full filter pointer-events-none"
        classList={{
          "opacity-0": !onScreen(),
          "blur-xl": !onScreen()
        }}
        style={{
          transition: "opacity 500ms, filter 300ms",
          transform: `translate(${pos().x - 81}px, ${pos().y - 81}px)`
        }}
      ></div>
      <div
        ref={ref}
        class="fixed z-10 top-25vh left-25vw w-50vw h-50vh bg-gray-300 bg-opacity-15 backdrop-filter backdrop-blur border-1 border-gray-400 border-opacity-40 rounded-3xl overflow-hidden"
      >
        <div
          class="w-24 h-24 rounded-full bg-amber-500 bg-opacity-80 pointer-events-none"
          style={{
            transform: `translate(${pos().elX - 54}px, ${pos().elY - 54}px)`
          }}
        ></div>
      </div>
      <div
        class="fixed z-20 top-25vh left-25vw p-6 py-4 rounded-2xl bg-white bg-opacity-10 border-1 border-white border-opacity-20 pointer-events-none text-opacity-50 text-white transition-opacity"
        style={{
          transform: `translate(${hoverX()}px, ${hoverY()}px)`,
          opacity: isHovering() ? 1 : 0
        }}
      >
        {() => {
          const record = objectOmit(relative, "update", "isInside");
          return <DisplayRecord record={record} />;
        }}
      </div>
      <div class="fixed top-6 left-6 caption text-opacity-60 select-none text-white">
        <DisplayRecord record={mouse} />
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
