import { onCleanup } from "solid-js";
import { registerPointerListener } from "./core.js";
import type { PointerCallback } from "./core.js";

export type TapProps = {
  callback: (position: { x: number; y: number }) => void;
  minimumTapLength?: number;
  maximumTapLength?: number;
};

export function tap(props: TapProps): (node: HTMLElement) => void {
  let cleanup: (() => void) | undefined;
  onCleanup(() => cleanup?.());

  return (node: HTMLElement) => {
    let x: number;
    let y: number;
    let time: number;
    let down = false;

    const downCallback: PointerCallback = (_, event) => {
      time = Date.now();
      x = event.clientX;
      y = event.clientY;
      down = true;
    };

    const upCallback: PointerCallback = (_, event) => {
      const now = Date.now();
      if (
        down &&
        Math.abs(event.clientX - x) < 4 &&
        Math.abs(event.clientY - y) < 4 &&
        time &&
        now - time >= (props.minimumTapLength ?? 0) &&
        (props.maximumTapLength === undefined || now - time < props.maximumTapLength)
      ) {
        const rect = node.getBoundingClientRect();
        const tapX = Math.round(event.clientX - rect.left);
        const tapY = Math.round(event.clientY - rect.top);
        props.callback({ x: tapX, y: tapY });
      }
      down = false;
    };

    cleanup = registerPointerListener(node, downCallback, undefined, upCallback);
  };
}
