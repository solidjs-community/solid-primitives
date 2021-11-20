import { Component, createMemo, createSignal, on } from "solid-js";
import { render } from "solid-js/web";
import { valToPwMid, clamp, valToP, pToVal } from "./utils";
import createDateDifference, { createDateNow } from "../src";
import listen from "@solid-primitives/event-listener";
import "./tailwind.css";
import { createEffect } from "solid-js";
import { format } from "date-fns";
import { onMount } from "solid-js";
import { MaybeAccessor } from "../src/common";
import {
  createCompositeEffect,
  createCompositeMemo,
  createModifier
} from "@solid-primitives/composites";

const withMounted = createModifier<void>((s, cb) => {
  onMount(() => {
    cb(s(), undefined, undefined);
  });
  return [cb, {}];
});

const Slider: Component<{
  ondrag: (value: number) => void;
  value?: number;
  min: number;
  max: number;
}> = props => {
  const [pageX, setPageX] = createSignal(0);
  const [p, setP] = createSignal(clamp(valToP(props.value, props.min, props.max), 0, 1));
  const [dragging, setDragging] = createSignal(false);

  let bar!: HTMLDivElement;

  const [left, setLeft] = createSignal(0);
  createCompositeEffect(
    withMounted(p, () => setLeft((p() * 2 - 1) * ((bar.offsetWidth - 12) / 2)))
  );

  const value = createMemo(on(p, p => pToVal(p, props.min, props.max)));
  createEffect(
    on(
      pageX,
      pageX => {
        const x = pageX - bar.offsetLeft;
        const w = bar.offsetWidth;
        setP(clamp(valToP(x, 0, w), 0, 1));
      },
      { defer: true }
    )
  );
  createEffect(() => props.ondrag(Math.round(value())));

  listen(window, "mousemove", (e: MouseEvent) => dragging() && setPageX(e.pageX));
  listen(window, "mouseup", () => setDragging(false));

  return (
    <div ref={bar} class="h-6 my-2 relative bg-blue-100 rounded-full" style={{ width: "80vw" }}>
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

const App: Component = () => {
  const timeRange = 50000000000;

  const [updateNowInterval, setUpdateNowInterval] = createSignal(1_000);

  const [inputTimeMs, setInputTimeMs] = createSignal(0);
  const targetTimestamp = createMemo(() => Date.now() + inputTimeMs());

  const [timeago, { date, time: timestamp }] = createDateDifference(targetTimestamp);

  const [dateNow] = createDateNow(updateNowInterval);

  return (
    <div class="w-screen min-h-screen overflow-hidden flex flex-col justify-center items-center">
      <div class="mb-4">
        NOW: <span>{format(dateNow(), "d MMM yyyy — HH:mm:ss:SSS")}</span>
      </div>
      <p>Update "now" every {updateNowInterval()}ms</p>
      <Slider ondrag={setUpdateNowInterval} min={200} max={10_000} value={updateNowInterval()} />
      <p>{inputTimeMs()}ms</p>
      <Slider ondrag={setInputTimeMs} value={0} min={-timeRange} max={timeRange} />
      <p>{targetTimestamp()}</p>
      <p>{timeago()}</p>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
