import {
  createTimeAgo,
  createDateNow,
  HOUR,
  MINUTE,
  SECOND,
  WEEK,
  YEAR,
  createCountdown,
} from "../src";
import { Component, createMemo, createSignal } from "solid-js";

import { format, formatRelative } from "date-fns";
import { Slider } from "./lib";

const App: Component = () => {
  const timeRange = YEAR;

  const [updateNowInterval, setUpdateNowInterval] = createSignal(SECOND);

  const [inputTimeMs, setInputTimeMs] = createSignal(0);
  const targetTimestamp = createMemo(() => Date.now() + inputTimeMs());

  // default timeago format
  const [timeago, { target }] = createTimeAgo(targetTimestamp);

  // custom relative firmatter using date-fns
  const [customTimeago] = createTimeAgo(targetTimestamp, {
    min: SECOND * 10,
    interval: MINUTE / 2,
    relativeFormatter: (from, to) => formatRelative(to, from),
  });

  // custom absolute formatter using date-fns
  const [customTimeago2] = createTimeAgo(targetTimestamp, {
    min: 0,
    max: WEEK * 2,
    interval: diff => (diff <= MINUTE ? SECOND : diff <= HOUR ? MINUTE / 2 : HOUR / 2),
    dateFormatter: date => format(date, "d MMM yyyy — HH:mm"),
  });

  // autoupdating current date
  const [dateNow] = createDateNow(updateNowInterval);

  // countdown
  const countdown = createCountdown(dateNow, targetTimestamp);

  return (
    <div class="flex min-h-screen w-screen flex-col items-center justify-center space-y-12 overflow-hidden bg-gray-50">
      <div class="card">
        <div>
          NOW: <span>{format(dateNow(), "d MMM yyyy — HH:mm:ss:SSS")}</span>
        </div>
        <p>Update "now" every {updateNowInterval()}ms</p>
        <Slider ondrag={setUpdateNowInterval} min={200} max={10_000} value={updateNowInterval()} />
      </div>
      <div class="card">
        <p>{inputTimeMs()}ms</p>
        <Slider ondrag={setInputTimeMs} value={0} min={-timeRange} max={timeRange} />
        <p>TARGET: {format(target(), "d MMM yyyy — HH:mm")}</p>
        <p>DEFAULT: {timeago()}</p>
        <p>CUSTOM: {customTimeago()}</p>
        <p>CUSTOM2: {customTimeago2()}</p>
      </div>
      <div class="card">
        <div class="flex space-x-2">
          <div class="countdown-cell">
            Days: <span class="countdown-cell-number">{countdown.days}</span>
          </div>
          <div class="countdown-cell">
            Hours: <span class="countdown-cell-number">{countdown.hours}</span>
          </div>
          <div class="countdown-cell">
            Minutes: <span class="countdown-cell-number">{countdown.minutes}</span>
          </div>
          <div class="countdown-cell">
            Seconds: <span class="countdown-cell-number">{countdown.seconds}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
