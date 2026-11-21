import "temporal-polyfill/global";
import { type Component, createSignal } from "solid-js";
import { For } from "@solidjs/web";
import {
  createDuration,
  createRelativeTime,
  createToday,
  createZonedDateTimeNow,
} from "../src/index.js";

const ZONES = ["UTC", "America/New_York", "Europe/Warsaw", "Asia/Tokyo"];

const App: Component = () => {
  const [zone, setZone] = createSignal(ZONES[0]!);
  const [now] = createZonedDateTimeNow(zone, 1000);
  const today = createToday(zone);

  const newYear = Temporal.PlainDate.from({ year: today().year + 1, month: 1, day: 1 });
  const remaining = createDuration(now, () => newYear.toZonedDateTime(zone()), {
    largestUnit: "days",
    smallestUnit: "seconds",
  });

  const [target, setTarget] = createSignal(Temporal.Now.instant().subtract({ minutes: 5 }));
  const [relative] = createRelativeTime(target, { timeZone: zone, interval: 1000 });

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <select onChange={e => setZone(e.currentTarget.value)}>
          <For each={ZONES}>{z => <option>{z}</option>}</For>
        </select>
        <p>Now: {now().toPlainDateTime().round("seconds").toString()}</p>
        <p>Today: {today().toString()}</p>
        <p>
          Until {newYear.toString()}: {remaining().toString()}
        </p>
      </div>
      <div class="wrapper-v">
        <p>{relative()}</p>
        <button class="btn" onClick={() => setTarget(t => t.subtract({ hours: 6 }))}>
          -6 hours
        </button>
        <button class="btn" onClick={() => setTarget(t => t.add({ hours: 6 }))}>
          +6 hours
        </button>
      </div>
    </div>
  );
};

export default App;
