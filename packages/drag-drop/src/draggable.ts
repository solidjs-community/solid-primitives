import { createEffect, createMemo, createSignal, flush } from "solid-js";
import { isServer } from "@solidjs/web";
import { access, INTERNAL_OPTIONS, noop } from "@solid-primitives/utils";
import { DEFAULT_KEYBOARD_STEP, useDragContext } from "./context.tsx";
import { applyClass, applyStyle, markAsDraggable, removeClass, removeStyle, scrollCompensatedDelta } from "./dom.ts";
import type { CreateDraggableOptions, DraggableReturn, MakeDraggableOptions, Transform } from "./types.ts";

/**
 * Attaches pointer-based drag behaviour to an existing element.
 * Non-reactive — no Solid owner required. Returns a cleanup function.
 *
 * Note: `pointerenter`/`pointerleave` on drop targets won't fire reliably
 * while the dragged element is under the pointer unless you set
 * `pointer-events: none` on it during the drag. The context-based
 * `createDroppable` uses rect collision and is not affected.
 *
 * @example
 * ```ts
 * const cleanup = makeDraggable(el, {
 *   onStart: e => console.log("start", e.clientX),
 *   onMove: delta => el.style.transform = `translate(${delta.x}px,${delta.y}px)`,
 *   onEnd: () => el.style.transform = "",
 * });
 * ```
 */
export function makeDraggable<T = unknown>(
  el: HTMLElement,
  options: MakeDraggableOptions<T> = {},
): VoidFunction {
  if (isServer) return noop;

  let startX = 0;
  let startY = 0;
  let startScrollX = 0;
  let startScrollY = 0;

  const onPointerMove = (event: PointerEvent) => {
    const delta = scrollCompensatedDelta(event.clientX, event.clientY, startX, startY, startScrollX, startScrollY);
    options.onMove?.(delta, event);
  };

  const onPointerUp = (event: PointerEvent) => {
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    const delta = scrollCompensatedDelta(event.clientX, event.clientY, startX, startY, startScrollX, startScrollY);
    options.onEnd?.(delta, event);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (options.disabled) return;
    if (event.button !== 0) return;
    event.preventDefault();
    startX = event.clientX;
    startY = event.clientY;
    startScrollX = window.scrollX;
    startScrollY = window.scrollY;
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    options.onStart?.(event);
  };

  el.addEventListener("pointerdown", onPointerDown);

  return () => {
    el.removeEventListener("pointerdown", onPointerDown);
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
  };
}

/**
 * Reactive draggable primitive. Attach to a JSX element via `ref={drag.ref}`.
 *
 * When used inside a `createDragContext` Provider, drag state is coordinated
 * with registered droppables. Without a Provider, `isDragging` and `transform`
 * still work in standalone mode.
 *
 * Keyboard-accessible: the element receives `tabindex`/`role`/`aria-roledescription`
 * automatically (unless already set). `Space`/`Enter` picks up the drag, arrow keys
 * nudge it by `keyboardStep` pixels (default 25), `Space`/`Enter` drops it, and
 * `Escape` cancels — mirroring the pointer sensor's lifecycle.
 *
 * @example
 * ```tsx
 * const drag = createDraggable("card-1", { title: "My card" }, {
 *   class: "cursor-grab",
 *   draggingClass: "opacity-50 cursor-grabbing",
 * });
 * <div ref={drag.ref}>{drag.isDragging() ? "dragging…" : "drag me"}</div>
 * ```
 */
export function createDraggable<T = unknown>(
  id: string | number,
  data?: T,
  options: CreateDraggableOptions = {},
): DraggableReturn<T> {
  if (isServer) {
    return { ref: noop, isDragging: () => false, transform: () => null, id };
  }

  const ctx = useDragContext();
  const [elSignal, setElSignal] = createSignal<HTMLElement | undefined>(undefined, INTERNAL_OPTIONS);
  const step = () => options.keyboardStep ?? DEFAULT_KEYBOARD_STEP;

  let isDragging: () => boolean;
  let currentTransform: () => Transform | null;

  if (ctx) {
    // `ctx._isActive` is a createProjection lookup — checking it doesn't mark every other
    // draggable's `isDragging` stale on each drag start/end, unlike `ctx.active()?.id === id`.
    isDragging = () => ctx._isActive(id);
    currentTransform = createMemo(() => (isDragging() ? ctx.transform() : null));
  } else {
    const [_isDragging, setIsDragging] = createSignal(false, INTERNAL_OPTIONS);
    const [_transform, setTransform] = createSignal<Transform | null>(null, INTERNAL_OPTIONS);
    isDragging = _isDragging;
    currentTransform = _transform;

    let startX = 0;
    let startY = 0;
    let startScrollX = 0;
    let startScrollY = 0;

    const onPointerMove = (event: PointerEvent) => {
      setTransform(scrollCompensatedDelta(event.clientX, event.clientY, startX, startY, startScrollX, startScrollY));
    };

    const onPointerUp = () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      setIsDragging(false);
      setTransform(null);
    };

    const nudge = (dx: number, dy: number) => {
      setTransform(t => ({ x: (t?.x ?? 0) + dx, y: (t?.y ?? 0) + dy }));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (access(options.disabled)) return;

      if (!_isDragging()) {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          setIsDragging(true);
          setTransform({ x: 0, y: 0 });
        }
        return;
      }

      switch (event.key) {
        case "ArrowUp": event.preventDefault(); nudge(0, -step()); break;
        case "ArrowDown": event.preventDefault(); nudge(0, step()); break;
        case "ArrowLeft": event.preventDefault(); nudge(-step(), 0); break;
        case "ArrowRight": event.preventDefault(); nudge(step(), 0); break;
        case " ":
        case "Enter":
        case "Escape":
          event.preventDefault();
          setIsDragging(false);
          setTransform(null);
          break;
      }
    };

    createEffect(
      () => elSignal(),
      el => {
        if (!el) return;
        const onPointerDown = (event: PointerEvent) => {
          if (access(options.disabled)) return;
          if (event.button !== 0) return;
          event.preventDefault();
          el.setPointerCapture(event.pointerId);
          startX = event.clientX;
          startY = event.clientY;
          startScrollX = window.scrollX;
          startScrollY = window.scrollY;
          setIsDragging(true);
          setTransform({ x: 0, y: 0 });
          document.addEventListener("pointermove", onPointerMove);
          document.addEventListener("pointerup", onPointerUp);
        };
        el.addEventListener("pointerdown", onPointerDown);
        el.addEventListener("keydown", onKeyDown);
        return () => {
          el.removeEventListener("pointerdown", onPointerDown);
          el.removeEventListener("keydown", onKeyDown);
          document.removeEventListener("pointermove", onPointerMove);
          document.removeEventListener("pointerup", onPointerUp);
        };
      },
    );
  }

  // Context mode: attach pointerdown/keydown listeners only (registration handled by droppables).
  if (ctx) {
    createEffect(
      () => elSignal(),
      el => {
        if (!el) return;
        const onPointerDown = (event: PointerEvent) => {
          if (access(options.disabled)) return;
          if (event.button !== 0) return;
          event.preventDefault();
          el.setPointerCapture(event.pointerId);
          ctx._startDrag(id, el, data, event);
        };
        const onKeyDown = (event: KeyboardEvent) => {
          if (access(options.disabled)) return;

          if (!isDragging()) {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              ctx._startKeyboardDrag(id, el, data);
            }
            return;
          }

          switch (event.key) {
            case "ArrowUp": event.preventDefault(); ctx._moveBy(0, -step()); break;
            case "ArrowDown": event.preventDefault(); ctx._moveBy(0, step()); break;
            case "ArrowLeft": event.preventDefault(); ctx._moveBy(-step(), 0); break;
            case "ArrowRight": event.preventDefault(); ctx._moveBy(step(), 0); break;
            case " ":
            case "Enter":
              event.preventDefault();
              ctx._endDrag();
              break;
            // Escape is handled by the context's own document-level listener.
          }
        };
        el.addEventListener("pointerdown", onPointerDown);
        el.addEventListener("keydown", onKeyDown);
        return () => {
          el.removeEventListener("pointerdown", onPointerDown);
          el.removeEventListener("keydown", onKeyDown);
        };
      },
    );
  }

  // Reactive draggingStyle / draggingClass
  createEffect(
    () => ({ dragging: isDragging(), el: elSignal() }),
    ({ dragging, el }) => {
      if (!el) return;
      if (dragging) {
        applyStyle(el, options.draggingStyle);
        applyClass(el, options.draggingClass);
      } else {
        removeStyle(el, options.draggingStyle);
        removeClass(el, options.draggingClass);
      }
    },
  );

  const ref = (el: HTMLElement) => {
    setElSignal(() => el);
    applyStyle(el, options.style);
    applyClass(el, options.class);
    markAsDraggable(el);
    flush();
  };

  return { ref, isDragging, transform: currentTransform, id };
}
