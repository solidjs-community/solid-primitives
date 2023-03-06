import { createEventListener } from "@solid-primitives/event-listener";
import {
  Component,
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  on,
  onMount,
} from "solid-js";
import { clamp, pToVal, valToP } from "./utils";

export const Slider: Component<{
  ondrag: (value: number) => void;
  value?: number;
  min: number;
  max: number;
}> = props => {
  const [pageX, setPageX] = createSignal(0);
  const [dragging, setDragging] = createSignal(false);
  const [p, setP] = createSignal(clamp(valToP(props.value ?? 0, props.min, props.max), 0, 1));

  let bar!: HTMLDivElement;

  const [left, setLeft] = createSignal(0);
  onMount(() => {
    createComputed(() => {
      setLeft((p() * 2 - 1) * ((bar.offsetWidth - 12) / 2));
    });
  });

  const bezier = (t: number) => t * t * t;
  const value = createMemo(on(p, p => pToVal((bezier(p * 2 - 1) + 1) / 2, props.min, props.max)));
  createEffect(
    on(
      pageX,
      pageX => {
        const x = pageX - bar.offsetLeft;
        const w = bar.offsetWidth;
        setP(clamp(valToP(x, 0, w), 0, 1));
      },
      { defer: true },
    ),
  );
  createEffect(() => props.ondrag(Math.round(value())));

  createEventListener(window, "mousemove", e => dragging() && setPageX(e.pageX));
  createEventListener(window, "mouseup", () => setDragging(false));

  return (
    <div ref={bar} class="w-[80vw] h-6 my-4 relative bg-gray-100 rounded-full">
      <div
        class="w-6 h-6 border-2 border-blue-400 box-content absolute bg-blue-400 rounded-full select-none left-1/2 -top-0.5 -ml-3"
        style={{ transform: `translateX(${left() ?? 0 - 2}px)` }}
        onmousedown={e => {
          setPageX(e.pageX);
          setDragging(true);
        }}
      ></div>
    </div>
  );
};
