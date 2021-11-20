import { Component, createMemo, createSignal, on } from "solid-js";
import { render } from "solid-js/web";
import { valToPwMid, clamp } from "../src/common";
import createDateDifference from "../src";
import listen from "@solid-primitives/event-listener";
import "./tailwind.css";
import { createEffect } from "solid-js";

const Slider: Component<{ ondrag: (p: number) => void }> = props => {
  const [pageX, setPageX] = createSignal(0);
  const [dragging, setDragging] = createSignal(false);

  let bar!: HTMLDivElement;

  const value = createMemo(
    on(pageX, pageX => {
      if (!bar) return 0;
      const x = pageX - bar.offsetLeft;
      const w = bar.offsetWidth;
      return clamp(valToPwMid(x, 0, w), -1, 1);
    })
  );
  const left = createMemo(
    on(value, p => {
      if (!bar) return 0;
      return p * ((bar.offsetWidth - 24) / 2);
    })
  );

  createEffect(() => props.ondrag(value()));

  listen(window, "mousemove", (e: MouseEvent) => dragging() && setPageX(e.pageX));
  listen(window, "mouseup", () => setDragging(false));

  return (
    <div ref={bar} class="h-6 my-2 relative bg-blue-100 rounded-full" style={{ width: "80vw" }}>
      <div
        class="w-6 h-6 border-2 border-blue-400 box-content absolute bg-blue-400 rounded-full select-none left-1/2 -top-0.5 -ml-3"
        style={{ transform: `translateX(${left() - 2}px)` }}
        onmousedown={e => {
          setPageX(e.pageX);
          setDragging(true);
        }}
      ></div>
    </div>
  );
};

const App: Component = () => {
  const timeRange = 50000000000;

  const [p, setP] = createSignal(0);
  const inputValueMs = createMemo(() => Math.round(p() * timeRange));
  const targetTimestamp = createMemo(() => Date.now() + inputValueMs());

  const [timeago, { date, timestamp }] = createDateDifference(targetTimestamp);

  return (
    <div class="w-screen min-h-screen flex flex-col justify-center items-center">
      <p>{inputValueMs()}ms</p>
      <Slider ondrag={setP} />
      <p>{targetTimestamp()}</p>
      <p>{timeago()}</p>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
