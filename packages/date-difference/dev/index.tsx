import { createDateDifference, createDateNow, HOUR, MINUTE, SECOND, WEEK, YEAR } from "../src";
import { Component, createMemo, createSignal, on } from "solid-js";
import { render } from "solid-js/web";
import { clamp, valToP, pToVal } from "./utils";
import listen from "@solid-primitives/event-listener";
import { createEffect } from "solid-js";
import { format, formatRelative } from "date-fns";
import { onMount } from "solid-js";
import { createCompositeEffect, createModifier } from "@solid-primitives/composites";

import "uno.css";

const withMounted = createModifier<void>((s, cb) => {
  onMount(() => {
    // @ts-ignore
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
  const [dragging, setDragging] = createSignal(false);
  const [p, setP] = createSignal(clamp(valToP(props.value, props.min, props.max), 0, 1));

  let bar!: HTMLDivElement;

  const [left, setLeft] = createSignal(0);
  createCompositeEffect(
    withMounted(p, () => setLeft((p() * 2 - 1) * ((bar.offsetWidth - 12) / 2)))
  );

  const bezier = t => t * t * t;
  const value = createMemo(on(p, p => pToVal((bezier(p * 2 - 1) + 1) / 2, props.min, props.max)));
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

const App: Component = () => {
  const timeRange = YEAR;

  const [updateNowInterval, setUpdateNowInterval] = createSignal(SECOND);

  const [inputTimeMs, setInputTimeMs] = createSignal(0);
  const targetTimestamp = createMemo(() => Date.now() + inputTimeMs());

  const [timeago, { target }] = createDateDifference(targetTimestamp);

  const [customTimeago] = createDateDifference(targetTimestamp, {
    min: SECOND * 10,
    updateInterval: MINUTE / 2,
    relativeFormatter: (target, now) => formatRelative(target, now)
  });

  const [customTimeago2] = createDateDifference(targetTimestamp, {
    min: 0,
    max: WEEK * 2,
    updateInterval: diff => (diff <= MINUTE ? SECOND : diff <= HOUR ? MINUTE / 2 : HOUR / 2),
    absoluteFormatter: date => format(date, "d MMM yyyy — HH:mm")
  });

  const [dateNow] = createDateNow(updateNowInterval);

  return (
    <div class="w-screen min-h-screen overflow-hidden flex flex-col justify-center items-center space-y-12 bg-gray-50">
      <div class="flex flex-col items-center p-8 bg-white rounded-3xl shadow-lg">
        <div>
          NOW: <span>{format(dateNow(), "d MMM yyyy — HH:mm:ss:SSS")}</span>
        </div>
        <p>Update "now" every {updateNowInterval()}ms</p>
        <Slider ondrag={setUpdateNowInterval} min={200} max={10_000} value={updateNowInterval()} />
      </div>
      <div class="flex flex-col items-center p-8 bg-white rounded-3xl shadow-lg">
        <p>{inputTimeMs()}ms</p>
        <Slider ondrag={setInputTimeMs} value={0} min={-timeRange} max={timeRange} />
        <p>TARGET: {format(target(), "d MMM yyyy — HH:mm")}</p>
        <p>DEFAULT: {timeago()}</p>
        <p>CUSTOM: {customTimeago()}</p>
        <p>CUSTOM2: {customTimeago2()}</p>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
