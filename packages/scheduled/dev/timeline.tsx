import { createEventListener } from "@solid-primitives/event-listener";
import { createPolled } from "@solid-primitives/timer";
import { Component, createSelector, Index, untrack } from "solid-js";
import { createStore } from "solid-js/store";
import { debounce, leading, leadingAndTrailing, throttle } from "../src/index.js";

type TimelinesKeys = "source" | `${"l" | "lt" | ""}${"deb" | "thr"}`;
const LENGTH = 30;
const TRANSITION = 80;
const TIMEOUT = 400;
const headings: Record<TimelinesKeys, string> = {
  source: "Source",
  deb: "Debounce",
  thr: "Throttle",
  ldeb: "Leading Debounce",
  lthr: "Leading Throttle",
  ltdeb: "Leading and Trailing Debounce",
  ltthr: "Leading and Trailing Throttle",
};
const COLORS = Array.from({ length: LENGTH }, (_, idx) => {
  const h = 360 * (idx / LENGTH);
  const s = 90;
  const l = 60;
  return `hsl(${h}, ${s}%, ${l}%)`;
});

const timelineKeys = Object.keys(headings) as TimelinesKeys[];

const getEmptyTieline = () => Array.from({ length: LENGTH }, () => -1);
const getEmptyTimelines = (): Record<TimelinesKeys, number[]> => ({
  source: getEmptyTieline(),
  deb: getEmptyTieline(),
  ldeb: getEmptyTieline(),
  ltdeb: getEmptyTieline(),
  thr: getEmptyTieline(),
  lthr: getEmptyTieline(),
  ltthr: getEmptyTieline(),
});

const Timeline: Component = () => {
  const [timelines, setTimelines] = createStore(getEmptyTimelines());
  const current = createPolled<number>(
    p => {
      if (++p === LENGTH) {
        reset();
        p = 0;
      }
      return p;
    },
    TRANSITION,
    0,
  );
  const isCurrent = createSelector(current);

  function reset() {
    setTimelines(getEmptyTimelines());
  }

  const triggers: ((id: number) => void)[] = [
    debounce(id => setTimelines("deb", current(), id), TIMEOUT),
    leading(debounce, id => setTimelines("ldeb", current(), id), TIMEOUT),
    leadingAndTrailing(debounce, id => setTimelines("ltdeb", current(), id), TIMEOUT),
    throttle(id => setTimelines("thr", current(), id), TIMEOUT),
    leading(throttle, id => setTimelines("lthr", current(), id), TIMEOUT),
    leadingAndTrailing(throttle, id => setTimelines("ltthr", current(), id), TIMEOUT),
  ];

  function trigger() {
    setTimelines("source", current(), current());
    for (const cb of triggers) cb(current());
  }

  createEventListener(
    () => window,
    "keydown",
    e => {
      if (e.key === " ") {
        e.preventDefault();
        trigger();
      }
    },
  );

  return (
    <>
      <div class="center-child p-4 pb-0">
        <button class="btn" onClick={trigger}>
          TRIGGER! (space)
        </button>
      </div>
      <div class="space-y-4 p-4 pt-2">
        {untrack(() =>
          timelineKeys.map(name => (
            <div>
              <h3>{headings[name]}</h3>
              <div
                class="grid w-full gap-x-1.5"
                style={`grid-template-columns: repeat(${LENGTH}, 1fr`}
              >
                <Index each={timelines[name]}>
                  {(state, index) => (
                    <div
                      class={`h-[10vh] rounded-sm transition duration-${TRANSITION}`}
                      style={{
                        "background-color": state() >= 0 ? COLORS[state()] : "white",
                        opacity: state() >= 0 ? 1 : isCurrent(index) ? 0.2 : 0.05,
                      }}
                    ></div>
                  )}
                </Index>
              </div>
            </div>
          )),
        )}
      </div>
    </>
  );
};

export default Timeline;
