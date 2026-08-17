import type { Accessor, Element } from "solid-js";

export type Transform = { x: number; y: number };
export type Point = { x: number; y: number };

export type DragItem<T = unknown> = {
  id: string | number;
  data: T;
  element: HTMLElement;
};

export type DroppableItem<T = unknown> = {
  id: string | number;
  data: T;
  element: HTMLElement;
};

export type Rect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  x: number;
  y: number;
};
export type DragRect = { id: string | number; rect: Rect };
export type DroppableRect = { id: string | number; rect: Rect };

export type CollisionDetector = (
  draggable: DragRect,
  droppables: DroppableRect[],
  pointer: Point,
) => string | number | null;

export type MakeDraggableOptions<T = unknown> = {
  data?: T;
  onStart?: (event: PointerEvent) => void;
  onMove?: (delta: Transform, event: PointerEvent) => void;
  onEnd?: (delta: Transform, event: PointerEvent) => void;
  disabled?: boolean;
};

export type MakeDroppableOptions = {
  onEnter?: (event: PointerEvent) => void;
  onLeave?: (event: PointerEvent) => void;
  onDrop?: (event: PointerEvent) => void;
  disabled?: boolean;
};

export type MakeNativeDroppableOptions = {
  onEnter?: (event: DragEvent) => void;
  onLeave?: (event: DragEvent) => void;
  onOver?: (event: DragEvent) => void;
  onDrop?: (event: DragEvent) => void;
  /** Return false to reject; checked on dragenter, dragover, and drop. */
  accept?: (event: DragEvent) => boolean;
  disabled?: boolean;
};

export type CreateDraggableOptions = {
  disabled?: boolean | Accessor<boolean>;
  style?: Partial<CSSStyleDeclaration>;
  draggingStyle?: Partial<CSSStyleDeclaration>;
  class?: string;
  draggingClass?: string;
  /** Pixels moved per arrow-key press while picked up via keyboard. Defaults to 25. */
  keyboardStep?: number;
};

export type AcceptPredicate = (draggable: DragItem) => boolean;

export type CreateDroppableOptions = {
  disabled?: boolean | Accessor<boolean>;
  /** Called fresh on every collision check — read a signal inside it for reactive accept logic. */
  accept?: AcceptPredicate;
  style?: Partial<CSSStyleDeclaration>;
  overStyle?: Partial<CSSStyleDeclaration>;
  class?: string;
  overClass?: string;
};

export type CreateNativeDroppableOptions = MakeNativeDroppableOptions & {
  disabled?: boolean | Accessor<boolean>;
};

export type DraggableReturn<_T = unknown> = {
  ref: (el: HTMLElement) => void;
  isDragging: Accessor<boolean>;
  transform: Accessor<Transform | null>;
  id: string | number;
};

export type DroppableReturn<_T = unknown> = {
  ref: (el: HTMLElement) => void;
  isOver: Accessor<boolean>;
  active: Accessor<DragItem | null>;
  id: string | number;
};

export type NativeDroppableReturn = {
  ref: (el: HTMLElement) => void;
  isOver: Accessor<boolean>;
};

export type SortableReturn<_T = unknown> = {
  ref: (el: HTMLElement) => void;
  isDragging: Accessor<boolean>;
  transform: Accessor<Transform | null>;
  isOver: Accessor<boolean>;
  active: Accessor<DragItem | null>;
  isActiveDropzone: Accessor<boolean>;
  id: string | number;
};

export type DragContextOptions = {
  collisionDetection?: CollisionDetector;
  onDragStart?: (item: DragItem) => void;
  onDragMove?: (item: DragItem, transform: Transform) => void;
  onDragEnd?: (item: DragItem, over: DroppableItem | null) => void;
  onDragCancel?: (item: DragItem) => void;
  /** Pixels moved per arrow-key press while picked up via keyboard. Defaults to 25. */
  keyboardStep?: number;
  /**
   * Auto-scroll the window when the pointer nears the viewport edge during a drag.
   * `true` uses the default threshold/speed; pass an object to tune them, or omit /
   * `false` to disable. Ignored for keyboard-driven drags.
   */
  autoScroll?: boolean | { threshold?: number; speed?: number };
};

export type DragContextReturn = {
  Provider: (props: { children: Element }) => Element;
  active: Accessor<DragItem | null>;
  over: Accessor<DroppableItem | null>;
  transform: Accessor<Transform | null>;
};
