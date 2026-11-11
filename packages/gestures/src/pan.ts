import { onCleanup } from "solid-js";
import { registerPointerListener } from "./core.ts";
import type { PointerCallback } from "./core.ts";

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
        props.callback({
          x: Math.round(event.clientX - rect.left),
          y: Math.round(event.clientY - rect.top),
        });
      }
    };

    cleanup = registerPointerListener(node, undefined, moveCallback);
  };
}
