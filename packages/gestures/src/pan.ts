import { onCleanup } from "solid-js";
import { registerPointerListener } from "./core.js";
import type { PointerCallback } from "./core.js";

export type PanProps = {
  callback: (position: { x: number; y: number }) => void;
};

export function pan(props: PanProps): (node: HTMLElement) => void {
  let cleanup: (() => void) | undefined;
  onCleanup(() => cleanup?.());

  return (node: HTMLElement) => {
    const moveCallback: PointerCallback = (activeEvents, event) => {
      if (activeEvents.length === 1) {
        const rect = node.getBoundingClientRect();
        const x = Math.round(event.x - rect.left);
        const y = Math.round(event.y - rect.top);
        if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
          props.callback({ x, y });
        }
      }
    };

    cleanup = registerPointerListener(node, undefined, moveCallback);
  };
}
