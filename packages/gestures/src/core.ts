export type PointerCallback = (activeEvents: PointerEvent[], event: PointerEvent) => void;

function downHandler(
  node: HTMLElement,
  downEvent: PointerEvent,
  activeEvents: Map<number, PointerEvent>,
  downCallback: PointerCallback | undefined,
) {
  activeEvents.set(downEvent.pointerId, downEvent);
  node.setPointerCapture(downEvent.pointerId);
  downCallback?.(Array.from(activeEvents.values()), downEvent);
}

function moveHandler(
  moveEvent: PointerEvent,
  activeEvents: Map<number, PointerEvent>,
  moveCallback: PointerCallback | undefined,
) {
  activeEvents.set(moveEvent.pointerId, moveEvent);
  moveCallback?.(Array.from(activeEvents.values()), moveEvent);
}

function upHandler(
  upEvent: PointerEvent,
  downEvent: PointerEvent,
  activeEvents: Map<number, PointerEvent>,
  upCallback: PointerCallback | undefined,
  removeHandlersCallback: () => void,
) {
  if (upEvent.pointerId === downEvent.pointerId) {
    activeEvents.delete(upEvent.pointerId);
    removeHandlersCallback();
  }
  upCallback?.(Array.from(activeEvents.values()), upEvent);
}

export function registerPointerListener(
  node: HTMLElement,
  downCallback?: PointerCallback,
  moveCallback?: PointerCallback,
  upCallback?: PointerCallback,
): () => void {
  const activeEvents = new Map<number, PointerEvent>();
  const activeMoveHandlers = new Set<(e: PointerEvent) => void>();
  const activeUpHandlers = new Set<(e: PointerEvent) => void>();

  const handler = (downEvent: PointerEvent) => {
    downHandler(node, downEvent, activeEvents, downCallback);
    const moveHandlerWrapper = (e: PointerEvent) => {
      if (e.pointerId === downEvent.pointerId) moveHandler(e, activeEvents, moveCallback);
    };
    const upHandlerWrapper = (e: PointerEvent) => {
      if (e.pointerId === downEvent.pointerId)
        upHandler(e, downEvent, activeEvents, upCallback, () => {
          node.removeEventListener("pointermove", moveHandlerWrapper);
          node.removeEventListener("pointerup", upHandlerWrapper);
          node.removeEventListener("lostpointercapture", upHandlerWrapper);
          activeMoveHandlers.delete(moveHandlerWrapper);
          activeUpHandlers.delete(upHandlerWrapper);
        });
    };
    activeMoveHandlers.add(moveHandlerWrapper);
    activeUpHandlers.add(upHandlerWrapper);
    node.addEventListener("pointermove", moveHandlerWrapper);
    node.addEventListener("pointerup", upHandlerWrapper);
    node.addEventListener("lostpointercapture", upHandlerWrapper);
  };

  node.addEventListener("pointerdown", handler);
  return () => {
    node.removeEventListener("pointerdown", handler);
    for (const h of activeMoveHandlers) node.removeEventListener("pointermove", h);
    for (const h of activeUpHandlers) {
      node.removeEventListener("pointerup", h);
      node.removeEventListener("lostpointercapture", h);
    }
    activeMoveHandlers.clear();
    activeUpHandlers.clear();
  };
}

export const DEFAULT_DELAY = 300;
export const DEFAULT_MIN_SWIPE_DISTANCE = 60; // in pixels

export function getCenterOfTwoPoints(node: HTMLElement, activeEvents: PointerEvent[]): {
  x: number;
  y: number;
} {
  const rect = node.getBoundingClientRect();
  const xDistance = Math.abs(activeEvents[0]!.clientX - activeEvents[1]!.clientX);
  const yDistance = Math.abs(activeEvents[0]!.clientY - activeEvents[1]!.clientY);
  const minX = Math.min(activeEvents[0]!.clientX, activeEvents[1]!.clientX);
  const minY = Math.min(activeEvents[0]!.clientY, activeEvents[1]!.clientY);
  const centerX = minX + xDistance / 2;
  const centerY = minY + yDistance / 2;

  const x = Math.round(centerX - rect.left);
  const y = Math.round(centerY - rect.top);

  return { x, y };
}
