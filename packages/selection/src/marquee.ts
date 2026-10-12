import { createSignal, onCleanup, type Accessor } from "solid-js";
import { isServer } from "solid-js/web";

export interface Point2D {
  readonly x: number;
  readonly y: number;
}

export interface SelectionRect {
  readonly startX: number;
  readonly startY: number;
  readonly currentX: number;
  readonly currentY: number;
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
}

export interface SelectableElementBounds {
  readonly id: string;
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

export interface MarqueeSelectionOptions {
  container?: HTMLElement | null | (() => HTMLElement | null);
  onSelectionChange?: (selectedIds: readonly string[]) => void;
}

export interface MarqueeSelectionReturn {
  isSelecting: Accessor<boolean>;
  selectionRect: Accessor<SelectionRect | null>;
  selectedIds: Accessor<readonly string[]>;
  updateSelectables: (elements: readonly SelectableElementBounds[]) => void;
}

export function createMarqueeSelection(
  options: MarqueeSelectionOptions = {},
): MarqueeSelectionReturn {
  if (isServer || typeof window === "undefined") {
    return {
      isSelecting: () => false,
      selectionRect: () => null,
      selectedIds: () => [],
      updateSelectables: () => {},
    };
  }

  const [isSelecting, setIsSelecting] = createSignal(false);
  const [selectionRect, setSelectionRect] = createSignal<SelectionRect | null>(null);
  const [selectedIds, setSelectedIds] = createSignal<readonly string[]>([]);

  let selectables: readonly SelectableElementBounds[] = [];
  let startPt: Point2D | null = null;

  const updateSelectables = (elements: readonly SelectableElementBounds[]): void => {
    selectables = elements;
  };

  const evaluateIntersection = (rect: SelectionRect): readonly string[] => {
    const matched: string[] = [];
    const len = selectables.length;
    for (let i = 0; i < len; i++) {
      const el = selectables[i]!;
      if (
        rect.minX <= el.maxX &&
        rect.maxX >= el.minX &&
        rect.minY <= el.maxY &&
        rect.maxY >= el.minY
      ) {
        matched.push(el.id);
      }
    }
    return matched;
  };

  const onPointerDown = (e: PointerEvent): void => {
    if (e.button !== 0) return;
    startPt = { x: e.clientX, y: e.clientY };
    setIsSelecting(true);
    const initialRect: SelectionRect = {
      startX: startPt.x,
      startY: startPt.y,
      currentX: startPt.x,
      currentY: startPt.y,
      minX: startPt.x,
      minY: startPt.y,
      maxX: startPt.x,
      maxY: startPt.y,
      width: 0,
      height: 0,
    };
    setSelectionRect(initialRect);
    setSelectedIds([]);
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!startPt) return;
    const curX = e.clientX;
    const curY = e.clientY;
    const minX = Math.min(startPt.x, curX);
    const minY = Math.min(startPt.y, curY);
    const maxX = Math.max(startPt.x, curX);
    const maxY = Math.max(startPt.y, curY);

    const rect: SelectionRect = {
      startX: startPt.x,
      startY: startPt.y,
      currentX: curX,
      currentY: curY,
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };

    setSelectionRect(rect);
    const matched = evaluateIntersection(rect);
    setSelectedIds(matched);
    options.onSelectionChange?.(matched);
  };

  const onPointerUp = (): void => {
    startPt = null;
    setIsSelecting(false);
    setSelectionRect(null);
  };

  window.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  onCleanup(() => {
    window.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  });

  return {
    isSelecting,
    selectionRect,
    selectedIds,
    updateSelectables,
  };
}
