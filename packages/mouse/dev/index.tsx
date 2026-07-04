import { useMousePosition, createPositionToElement } from "../src/index.js";
import { type Component, createMemo, createSignal, Show } from "solid-js";

import createRAF from "@solid-primitives/raf";
import { lerp } from "./utils.js";

import { DisplayRecord } from "./components.js";
import { clamp } from "@solid-primitives/utils";

const App: Component = () => {
  const [showContainer, setShowContainer] = createSignal(true);
  const [ref, setRef] = createSignal<HTMLDivElement>();

  const mouse = useMousePosition();
  const relative = createPositionToElement(ref, () => mouse);

  const inElementX = createMemo(() => clamp(relative.x, 0, relative.width));
  const inElementY = createMemo(() => clamp(relative.y, 0, relative.height));

  const [pos, setPos] = createSignal({ x: 0, y: 0, elX: 0, elY: 0 });
  const [, start] = createRAF(() => {
    setPos(p => ({
      x: lerp(p.x, mouse.x, 0.1),
      y: lerp(p.y, mouse.y, 0.1),
      elX: lerp(p.elX, relative.x, 0.2),
      elY: lerp(p.elY, relative.y, 0.2),
    }));
  });
  start();

  return (
    <div class="box-border h-screen w-full overflow-hidden bg-indigo-800 text-white">
      <div
        class="pointer-events-none h-36 w-36 rounded-full bg-violet-700 filter"
        classList={{
          "opacity-0": !mouse.isInside,
          "blur-xl": !mouse.isInside,
        }}
        style={{
          transition: "opacity 500ms, filter 300ms",
          transform: `translate(${pos().x - 81}px, ${pos().y - 81}px)`,
        }}
      ></div>
      <Show when={showContainer()}>
        <div
          ref={setRef}
          class="top-25vh left-25vw w-50vw h-50vh border-opacity-40 bg-opacity-15 fixed z-10 overflow-hidden rounded-3xl border-1 border-gray-400 bg-gray-300 backdrop-blur backdrop-filter"
        >
          <div
            class="bg-opacity-80 pointer-events-none h-24 w-24 rounded-full bg-amber-500"
            style={{
              transform: `translate(${pos().elX - 54}px, ${pos().elY - 54}px)`,
            }}
          ></div>
        </div>
      </Show>
      <div
        class="top-25vh left-25vw rounded-lt border-opacity-20 bg-opacity-10 text-opacity-50 pointer-events-none fixed z-20 rounded-2xl border-1 border-white bg-white p-6 py-4 text-white transition-opacity"
        style={{
          transform: `translate(${inElementX()}px, ${inElementY()}px)`,
          opacity: relative.isInside ? 1 : 0,
        }}
      >
        <DisplayRecord record={{ x: inElementX(), y: inElementY() }} />
      </div>
      <div class="caption text-opacity-60 fixed top-6 left-6 text-white select-none">
        <DisplayRecord record={mouse} />
      </div>
      <button
        class="bg-opacity-25 fixed top-6 right-6 cursor-pointer rounded-lg border-none bg-gray-300 p-2 font-medium text-gray-300 opacity-80 hover:opacity-100"
        onclick={() => setShowContainer(p => !p)}
      >
        Toggle Container
      </button>
    </div>
  );
};

export default App;
