import { createMouse, createMouseOnScreen } from "../src";
import { Component, createSignal } from "solid-js";
import { render } from "solid-js/web";
import { createCompositeMemo } from "@solid-primitives/composites";
import createRaf from "@solid-primitives/raf";
import {} from "./components";
import { lerp, myThrottle, withDefault } from "./utils";
import "uno.css";

const App: Component = () => {
  const rawPoz = createMouse();
  const [poz, setPoz] = createSignal({ x: 0, y: 0 });

  const onScreen = createMouseOnScreen(false);

  createRaf(() => {
    setPoz(p => ({
      x: lerp(p.x, rawPoz.x(), 0.1),
      y: lerp(p.y, rawPoz.y(), 0.1)
    }));
  });

  return (
    <div class="box-border w-full h-screen overflow-hidden bg-indigo-800 text-white">
      <div
        class="w-36 h-36 bg-violet-700 rounded-full filter"
        classList={{
          "opacity-0": !onScreen(),
          "blur-xl": !onScreen()
        }}
        style={{
          transition: "opacity 500ms, filter 300ms",
          transform: `translate(${poz().x - 81}px, ${poz().y - 81}px)`
        }}
      ></div>
      <div class="fixed z-10 top-25vh left-25vw w-50vw h-50vh bg-gray-400 bg-opacity-20 backdrop-filter backdrop-blur border-1 border-gray-400 border-opacity-40 rounded-3xl overflow-hidden">
        <div class="w-24 h-24 rounded-full bg-amber-500 bg-opacity-80"></div>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
