import { registerPointerListener } from "./core.js";
import type { PointerCallback } from "./core.js";

type Props = {
  callback: (position: { x: number; y: number }) => void;
  minimumTapLength?: number;
  maximumTapLength?: number;
};

declare module "solid-js" {
  namespace JSX {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      ["use:tap"]?: Props;
    }
  }
}

export const tap = (node: HTMLElement, props: () => Props) => {
  let x: number;
  let y: number;
  let time: number;
  let down = false;

  const downCallback: PointerCallback = (_, event) => {
    time = Date.now();
    x = event.x;
    y = event.y;
    down = true;
  };

  const upCallback: PointerCallback = (_, event) => {
    const now = Date.now();
    if (
      down &&
      Math.abs(event.x - x) < 4 &&
      Math.abs(event.y - y) < 4 &&
      time &&
      now - time > (props().minimumTapLength ?? 0) &&
      (props().maximumTapLength === undefined || now - time < props().maximumTapLength!)
    ) {
      const rect = node.getBoundingClientRect();
      const x = Math.round(event.clientX - rect.left);
      const y = Math.round(event.clientY - rect.top);

      props().callback({ x, y });
    }
    down = false;
  };

  registerPointerListener(node, downCallback, undefined, upCallback);
};
