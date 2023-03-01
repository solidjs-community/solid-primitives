import { registerPointerListener } from "./core";
import type { PointerCallback } from "./core";

type Props = {
  callback: (position: { x: number; y: number }) => any;
};

declare module "solid-js" {
  namespace JSX {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      ["use:pan"]?: Props;
    }
  }
}

export const pan = (node: HTMLElement, props: () => Props) => {
  const moveCallback: PointerCallback = (activeEvents, event) => {
    if (activeEvents.length === 1) {
      const rect = node.getBoundingClientRect();
      const x = Math.round(event.x - rect.left);
      const y = Math.round(event.y - rect.top);
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        props().callback({ x, y });
      }
    }
  };

  registerPointerListener(node, undefined, moveCallback);
};
