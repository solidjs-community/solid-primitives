import { onCleanup } from "solid-js";
export type PointerCallback = (activeEvents: PointerEvent[], event: PointerEvent) => void;

function downHandler(
  downEvent: PointerEvent,
  activeEvents: Map<number, PointerEvent>,
  downCallback: PointerCallback | undefined
) {
  activeEvents.set(downEvent.pointerId, downEvent);

  downCallback?.(Array.from(activeEvents.values()), downEvent);
}

function moveHandler(
  moveEvent: PointerEvent,
  activeEvents: Map<number, PointerEvent>,
  moveCallback: PointerCallback | undefined
) {
  activeEvents.set(moveEvent.pointerId, moveEvent);
  moveCallback?.(Array.from(activeEvents.values()), moveEvent);
}

function upHandler(
  upEvent: PointerEvent,
  downEvent: PointerEvent,
  activeEvents: Map<number, PointerEvent>,
  upCallback: PointerCallback | undefined,
  removeHandlersCallback: () => void
) {
  if (upEvent.pointerId === downEvent.pointerId) {
    activeEvents.delete(upEvent.pointerId);

    if (activeEvents.size === 0) {
      removeHandlersCallback();
    }
  }
  upCallback?.(Array.from(activeEvents.values()), upEvent);
}

export function registerPointerListener(
  node: HTMLElement,
  downCallback?: PointerCallback,
  moveCallback?: PointerCallback,
  upCallback?: PointerCallback
) {
  const activeEvents = new Map<number, PointerEvent>();

  const handler = (downEvent: PointerEvent) => {
    downHandler(downEvent, activeEvents, downCallback);
    const moveHandlerWrapper = (e: PointerEvent) => moveHandler(e, activeEvents, moveCallback);
    const upHandlerWrapper = (e: PointerEvent) =>
      upHandler(e, downEvent, activeEvents, upCallback, () => {
        node.removeEventListener("pointermove", moveHandlerWrapper);
        node.removeEventListener("pointerup", upHandlerWrapper);
        node.removeEventListener("lostpointercapture", upHandlerWrapper);
      });
    node.addEventListener("pointermove", moveHandlerWrapper);
    node.addEventListener("pointerup", upHandlerWrapper);
    node.addEventListener("lostpointercapture", upHandlerWrapper);
  };

  node.addEventListener("pointerdown", handler);
  onCleanup(() => {
    node.removeEventListener("pointerdown", handler);
  });
}

export const DEFAULT_DELAY = 300;
export const DEFAULT_MIN_SWIPE_DISTANCE = 60; // in pixels

export function getCenterOfTwoPoints(node: HTMLElement, activeEvents: PointerEvent[]) {
  const rect = node.getBoundingClientRect();
  const xDistance = Math.abs(activeEvents[0].clientX - activeEvents[1].clientX);
  const yDistance = Math.abs(activeEvents[0].clientY - activeEvents[1].clientY);
  const minX = Math.min(activeEvents[0].clientX, activeEvents[1].clientX);
  const minY = Math.min(activeEvents[0].clientY, activeEvents[1].clientY);
  const centerX = minX + xDistance / 2;
  const centerY = minY + yDistance / 2;

  const x = Math.round(centerX - rect.left);
  const y = Math.round(centerY - rect.top);

  return { x, y };
}
