import { type Component, createSignal } from "solid-js";
import { type CursorProperty, createBodyCursor, createElementCursor } from "../src/index.js";

const CURSORS = [
  "alias",
  "all-scroll",
  "cell",
  "col-resize",
  "context-menu",
  "copy",
  "crosshair",
  "default",
  "e-resize",
  "ew-resize",
  "grab",
  "grabbing",
  "help",
  "move",
  "n-resize",
  "ne-resize",
  "nesw-resize",
  "no-drop",
  "none",
  "not-allowed",
  "ns-resize",
  "nw-resize",
  "nwse-resize",
  "pointer",
  "progress",
  "row-resize",
  "s-resize",
  "se-resize",
  "sw-resize",
  "text",
  "vertical-text",
  "w-resize",
  "wait",
  "zoom-in",
  "zoom-out",
] as const;

const BodyCursorTest: Component = () => {
  const [bodyCursor, setBodyCursor] = createSignal<CursorProperty>("pointer");
  const [enableBodyCursor, setEnableBodyCursor] = createSignal(true);

  createBodyCursor(() => enableBodyCursor() && bodyCursor());

  return (
    <div class="wrapper-v">
      <h4>Toggle Body cursor</h4>
      <div class="flex">
        <button
          class="btn"
          onClick={() => setBodyCursor(() => CURSORS[(Math.random() * CURSORS.length) | 0])}
        >
          {bodyCursor()}
        </button>
        <button class="btn" onClick={() => setEnableBodyCursor(p => !p)}>
          {enableBodyCursor() ? "Disable" : "Enable"}
        </button>
      </div>
    </div>
  );
};

const ElementCursorTest: Component = () => {
  const [cursor, setCursor] = createSignal<CursorProperty>("pointer");
  const [enable, setEnable] = createSignal(true);
  const [target, setTarget] = createSignal(null as HTMLElement | null);

  createElementCursor(() => enable() && target(), cursor);

  return (
    <div class="wrapper-v">
      <h4>Toggle Element cursor</h4>
      <div class="flex">
        <button
          class="btn"
          onClick={() => setCursor(() => CURSORS[(Math.random() * CURSORS.length) | 0])}
        >
          {cursor()}
        </button>
        <button class="btn" onClick={() => setEnable(p => !p)}>
          {enable() ? "Disable" : "Enable"}
        </button>
      </div>
      <div class="sapce-x-2 flex">
        {Array.from({ length: 4 }).map((_, i) => {
          let ref: HTMLDivElement | undefined;
          return (
            <div
              ref={ref}
              class="node"
              onClick={() => setTarget(ref!)}
              classList={{
                "bg-red-700": ref === target(),
              }}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const App: Component = () => {
  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <BodyCursorTest />
      <ElementCursorTest />
    </div>
  );
};
